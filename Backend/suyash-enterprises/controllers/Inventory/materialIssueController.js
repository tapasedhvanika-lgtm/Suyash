'use strict';

const mongoose = require('mongoose');
const MaterialIssueVoucher = require('../../models/Inventory/MaterialIssueVoucher');
const MaterialReturnVoucher = require('../../models/Inventory/MaterialReturnVoucher');
const { WorkOrder } = require('../../models/Production/WorkOrder');
const StockLedger = require('../../models/Inventory/StockLedger');
const StockTransaction = require('../../models/Inventory/StockTransaction');
const StockReservation = require('../../models/Inventory/StockReservation');
const BOM = require('../../models/BOM/Bom');
const Department = require('../../models/HR/Department');

// ======================================================
// FIFO HELPER FUNCTION
// ======================================================

/**
 * FIFO Batch Selection - Get oldest batches for issuance
 * @param {ObjectId} item_id - Item to issue
 * @param {ObjectId} warehouse_id - Warehouse to issue from
 * @param {Number} required_qty - Quantity needed
 * @returns {Array} Selected batches with quantities and costs
 */
async function getFIFOBatchesForIssue(item_id, warehouse_id, required_qty) {
    // Find all batches with stock, sorted by receipt date (oldest first)
    const batches = await StockLedger.find({
        item_id: item_id,
        warehouse_id: warehouse_id,
        quantity: { $gt: 0 }
    }).sort({ receipt_date: 1 }); // OLDEST FIRST
    
    const selectedBatches = [];
    let remainingQty = required_qty;
    
    for (const batch of batches) {
        if (remainingQty <= 0) break;
        
        // Calculate available quantity (considering reservations)
        const availableQty = batch.quantity - (batch.reserved_qty || 0);
        
        if (availableQty <= 0) continue;
        
        const takeQty = Math.min(availableQty, remainingQty);
        
        selectedBatches.push({
            ledger_id: batch._id,
            batch_no: batch.batch_no,
            receipt_date: batch.receipt_date,
            quantity: takeQty,
            unit_cost: batch.unit_cost,
            total_value: takeQty * batch.unit_cost,
            unit: batch.unit,
            bin_id: batch.bin_id,
            warehouse_id: batch.warehouse_id
        });
        
        remainingQty -= takeQty;
    }
    
    if (remainingQty > 0) {
        throw new Error(`Insufficient stock. Required: ${required_qty}, Shortage: ${remainingQty}`);
    }
    
    return selectedBatches;
}

// ======================================================
// CREATE MATERIAL ISSUE VOUCHER (Draft) - WITH FIFO
// ======================================================
const createMaterialIssueVoucher = async (req, res) => {
  try {
    const {
      wo_id,
      department,
      issued_by,
      received_by,
      authorised_by,
      items,
      remarks
    } = req.body;

    // Validation
    if (!wo_id) {
      return res.status(400).json({ success: false, message: 'wo_id is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }
    if (!issued_by) {
      return res.status(400).json({ success: false, message: 'issued_by is required' });
    }

    // Fetch Work Order
    const workOrder = await WorkOrder.findById(wo_id)
      .populate('item_id', 'part_no part_name');
    
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // ✅ Validate Department if provided
    let departmentId = null;
    let departmentName = null;
    if (department) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(department);
      
      if (isValidObjectId) {
        const dept = await Department.findById(department);
        if (!dept) {
          return res.status(400).json({
            success: false,
            message: `Department not found with ID: ${department}`
          });
        }
        departmentId = dept._id;
        departmentName = dept.DepartmentName;
      } else {
        const dept = await Department.findOne({ 
          DepartmentName: { $regex: new RegExp(`^${department}$`, 'i') } 
        });
        if (!dept) {
          return res.status(400).json({
            success: false,
            message: `Department not found with name: ${department}`
          });
        }
        departmentId = dept._id;
        departmentName = dept.DepartmentName;
      }
    }

    // Validate WO status
    if (!['Released', 'In Progress', 'Partially Completed'].includes(workOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot issue material for WO in ${workOrder.status} status. Only Released/In Progress allowed.`
      });
    }

    // Fetch BOM for reference quantities
    const bom = await BOM.findById(workOrder.bom_id);
    const bomMap = new Map();
    if (bom && bom.components) {
      bom.components.forEach(comp => {
        bomMap.set(comp.component_item_id.toString(), {
          quantity_per: comp.quantity_per,
          scrap_percent: comp.scrap_percent
        });
      });
    }

    // Process each item with FIFO check
    const processedItems = [];
    let totalIssueCost = 0;

    for (const item of items) {
      // Find active reservation for this WO and item
      const reservation = await StockReservation.findOne({
        ref_type: 'Work Order',
        ref_id: workOrder._id,
        item_id: item.item_id,
        status: 'Active'
      });

      // ✅ FIFO: Get batches using FIFO logic
      let fifoBatches;
      try {
        fifoBatches = await getFIFOBatchesForIssue(
          item.item_id, 
          item.warehouse_id, 
          item.issued_qty
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.part_no}: ${error.message}`
        });
      }
      
      // Calculate total available and cost from FIFO batches
      const totalAvailable = fifoBatches.reduce((sum, b) => sum + b.quantity, 0);
      const totalCost = fifoBatches.reduce((sum, b) => sum + b.total_value, 0);
      
      if (totalAvailable < item.issued_qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.part_no}. Available (FIFO): ${totalAvailable}, Requested: ${item.issued_qty}`
        });
      }

      // Get BOM required quantity
      const bomReq = bomMap.get(item.item_id.toString());
      const bomRequiredQty = bomReq ? 
        (bomReq.quantity_per * workOrder.planned_qty) * (1 + (bomReq.scrap_percent || 0) / 100) : 
        0;

      // Calculate costs from FIFO batches
      const avgUnitCost = totalCost / item.issued_qty;
      totalIssueCost += totalCost;

      // Store FIFO batch info in the item for later use in post
      processedItems.push({
        item_id: item.item_id,
        part_no: item.part_no,
        item_description: item.item_description || fifoBatches[0]?.part_no || '',
        bom_required_qty: bomRequiredQty,
        issued_qty: item.issued_qty,
        unit: item.unit || fifoBatches[0]?.unit || 'Nos',
        warehouse_id: item.warehouse_id,
        bin_id: item.bin_id || fifoBatches[0]?.bin_id,
        batch_no: item.batch_no,
        heat_no: item.heat_no,
        unit_cost: avgUnitCost,
        total_cost: totalCost,
        returned_qty: 0,
        net_consumed_qty: item.issued_qty,
        reservation_id: reservation ? reservation._id : null,
        // Store FIFO batch details for posting
        _fifoBatches: fifoBatches.map(b => ({
          ledger_id: b.ledger_id,
          batch_no: b.batch_no,
          quantity: b.quantity,
          unit_cost: b.unit_cost,
          total_value: b.total_value,
          bin_id: b.bin_id
        }))
      });
    }

    // Create MIV with department reference
    const miv = new MaterialIssueVoucher({
      miv_date: new Date(),
      wo_id: workOrder._id,
      wo_number: workOrder.wo_number,
      so_number: workOrder.so_number,
      customer_name: workOrder.customer_name,
      department: departmentId,
      department_name: departmentName,
      issued_by: issued_by,
      received_by: received_by,
      authorised_by: authorised_by,
      items: processedItems,
      total_issue_cost: totalIssueCost,
      status: 'Draft',
      remarks: remarks,
      created_by: req.user._id
    });

    await miv.save();

    return res.status(201).json({
      success: true,
      message: 'Material Issue Voucher created in Draft status with FIFO batch selection',
      data: {
        miv_number: miv.miv_number,
        miv_id: miv._id,
        department: departmentName || department,
        total_issue_cost: totalIssueCost,
        items_count: processedItems.length,
        status: 'Draft',
        fifo_summary: processedItems.map(item => ({
          part_no: item.part_no,
          batches_used: item._fifoBatches.length,
          total_quantity: item.issued_qty,
          total_cost: item.total_cost,
          average_cost: item.unit_cost
        })),
        next_step: 'POST /api/miv/:id/post to issue materials and update stock'
      }
    });

  } catch (error) {
    console.error('[MIV] createMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// POST MIV - ACTUALLY ISSUE MATERIALS (WITH FIFO)
// ======================================================
const postMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find MIV
    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }

    if (miv.status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: `MIV is already ${miv.status}. Only Draft MIV can be posted.` 
      });
    }

    // Fetch Work Order
    const workOrder = await WorkOrder.findById(miv.wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    const transactions = [];
    let totalRMCostAdded = 0;
    const varianceAlerts = [];
    const fifoDetails = [];

    // Process each item with FIFO batches
    for (const item of miv.items) {
      // Get FIFO batches from stored data or compute fresh
      let fifoBatches = item._fifoBatches;
      if (!fifoBatches || fifoBatches.length === 0) {
        // Compute FIFO batches if not stored
        fifoBatches = await getFIFOBatchesForIssue(
          item.item_id,
          item.warehouse_id,
          item.issued_qty
        );
      }
      
      const itemFifoDetails = {
        part_no: item.part_no,
        batches: []
      };
      let itemTotalCost = 0;
      
      // Process each batch in FIFO order
      for (const batch of fifoBatches) {
        // Find the stock ledger record for this batch
        const stockRecord = await StockLedger.findById(batch.ledger_id);
        
        if (!stockRecord) {
          throw new Error(`Stock record not found for batch ${batch.batch_no}`);
        }
        
        // Find reservation for this specific batch
        let reservation = await StockReservation.findOne({
          ref_type: 'Work Order',
          ref_id: miv.wo_id,
          item_id: item.item_id,
          batch_no: batch.batch_no,
          status: 'Active'
        });
        
        // Calculate available from this batch (including reservation)
        let availableFromBatch = stockRecord.quantity - (stockRecord.reserved_qty || 0);
        if (reservation) {
          availableFromBatch += reservation.reserved_qty;
        }
        
        if (availableFromBatch < batch.quantity) {
          throw new Error(`Batch ${batch.batch_no} has insufficient available stock. Available: ${availableFromBatch}, Required: ${batch.quantity}`);
        }
        
        // Update Stock Ledger - reduce quantity
        stockRecord.quantity -= batch.quantity;
        
        // Update reserved_qty - consume from reservation first
        if (reservation) {
          const consumeFromReservation = Math.min(reservation.reserved_qty, batch.quantity);
          stockRecord.reserved_qty = Math.max(0, (stockRecord.reserved_qty || 0) - consumeFromReservation);
          
          // Update or consume reservation
          if (consumeFromReservation >= reservation.reserved_qty) {
            reservation.status = 'Consumed';
            reservation.consumed_at = new Date();
            reservation.consumed_qty = reservation.reserved_qty;
          } else {
            reservation.reserved_qty -= consumeFromReservation;
          }
          await reservation.save();
        } else {
          // No reservation, just reduce reserved_qty
          stockRecord.reserved_qty = Math.max(0, (stockRecord.reserved_qty || 0) - batch.quantity);
        }
        
        // Update stock record values
        stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
        stockRecord.last_updated = new Date();
        stockRecord.last_updated_by = req.user._id;
        await stockRecord.save();
        
        // Create Stock Transaction for this batch
        const transaction = new StockTransaction({
          txn_type: 'Material Issue',
          txn_date: miv.miv_date,
          item_id: item.item_id,
          part_no: item.part_no,
          from_warehouse: item.warehouse_id,
          from_bin: batch.bin_id,
          quantity: batch.quantity,
          unit: item.unit,
          unit_cost: batch.unit_cost,
          total_value: batch.total_value,
          batch_no: batch.batch_no,
          heat_no: item.heat_no,
          ref_document_type: 'MIV',
          ref_document_id: miv.miv_number,
          ref_id: miv._id,
          remarks: `FIFO Issue - Batch ${batch.batch_no} (Receipt: ${batch.receipt_date})`,
          created_by: req.user._id
        });
        await transaction.save();
        transactions.push(transaction);
        
        itemTotalCost += batch.total_value;
        
        // Record FIFO detail
        itemFifoDetails.batches.push({
          batch_no: batch.batch_no,
          quantity: batch.quantity,
          unit_cost: batch.unit_cost,
          total_value: batch.total_value,
          receipt_date: batch.receipt_date
        });
      }
      
      fifoDetails.push(itemFifoDetails);
      totalRMCostAdded += itemTotalCost;

      // Check for BOM variance
      if (item.bom_required_qty > 0) {
        const variancePercent = Math.abs((item.issued_qty - item.bom_required_qty) / item.bom_required_qty * 100);
        if (variancePercent > 5) {
          varianceAlerts.push({
            part_no: item.part_no,
            bom_required: item.bom_required_qty,
            issued: item.issued_qty,
            variance_percent: variancePercent.toFixed(2),
            fifo_batches_used: itemFifoDetails.batches
          });
        }
      }
    }

    // Update Work Order actual RM cost
    workOrder.actual_rm_cost = (workOrder.actual_rm_cost || 0) + totalRMCostAdded;
    workOrder.actual_total_cost = (workOrder.actual_rm_cost || 0) + (workOrder.actual_process_cost || 0);
    if (!workOrder.material_issues) workOrder.material_issues = [];
    workOrder.material_issues.push(miv._id);
    workOrder.updated_by = req.user._id;
    await workOrder.save();

    // Update MIV status
    miv.status = 'Issued';
    miv.posted_at = new Date();
    miv.updated_by = req.user._id;
    await miv.save();

    return res.json({
      success: true,
      message: 'Materials issued successfully using FIFO',
      data: {
        miv_number: miv.miv_number,
        wo_number: workOrder.wo_number,
        total_rm_cost_added: totalRMCostAdded,
        total_rm_cost_accumulated: workOrder.actual_rm_cost,
        transactions_count: transactions.length,
        fifo_details: fifoDetails,
        variance_alerts: varianceAlerts,
        status: 'Issued'
      }
    });

  } catch (error) {
    console.error('[MIV] postMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MIV BY ID (CORRECTED VERSION)
// ======================================================
const getMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const miv = await MaterialIssueVoucher.findById(id)
      .populate('wo_id', 'wo_number status part_no part_name planned_qty')
      .populate('issued_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')  // ✅ Fix 1: Add this
      .populate('authorised_by', 'Username Email')
      .populate('department', 'DepartmentName Description')
      .populate('items.warehouse_id', 'warehouse_name warehouse_code')  // ✅ Fix 2: Populate warehouse
      .populate('items.bin_id', 'bin_code bin_name location')  // ✅ Fix 3: Populate bin
      .populate('items.item_id', 'part_no part_description unit')
      .lean();
    
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }
    
    // Ensure items is an array (safety check)
    if (!miv.items) {
      miv.items = [];
    }
    
    // Safely calculate summary if needed
    const summary = {
      total_items: miv.items.length,
      total_issued_qty: miv.items.reduce((sum, item) => sum + (item.issued_qty || 0), 0),
      total_cost: miv.total_issue_cost || 0
    };
    
    return res.json({ 
      success: true, 
      data: miv,
      summary: summary
    });
  } catch (error) {
    console.error('[MIV] getMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ======================================================
// LIST MATERIAL ISSUE VOUCHERS
// ======================================================
const listMaterialIssueVouchers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      wo_id,
      status,
      from_date,
      to_date,
      miv_number,
      search,
      department_id
    } = req.query;

    const filter = {};
    if (wo_id) filter.wo_id = wo_id;
    if (status) filter.status = status;
    if (miv_number) filter.miv_number = new RegExp(miv_number, 'i');
    if (department_id) filter.department = department_id;
    if (search) {
      filter.$or = [
        { miv_number: new RegExp(search, 'i') },
        { wo_number: new RegExp(search, 'i') },
        { so_number: new RegExp(search, 'i') },
        { department_name: new RegExp(search, 'i') }
      ];
    }
    if (from_date || to_date) {
      filter.miv_date = {};
      if (from_date) filter.miv_date.$gte = new Date(from_date);
      if (to_date) filter.miv_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    const [mivs, total] = await Promise.all([
      MaterialIssueVoucher.find(filter)
        .populate('wo_id', 'wo_number part_no status')
        .populate('issued_by', 'FirstName LastName')
        .populate('department', 'DepartmentName')  // ✅ Added department population
        .populate('items.item_id', 'part_no')
        .sort({ miv_date: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      MaterialIssueVoucher.countDocuments(filter)
    ]);

    // Safety check - ensure mivs is an array
    const safeMivs = mivs || [];
    
    // Calculate summary statistics
    const summary = {
      total_issues: safeMivs.length,
      total_issue_value: safeMivs.reduce((sum, miv) => sum + (miv.total_issue_cost || 0), 0),
      by_status: {
        draft: safeMivs.filter(m => m.status === 'Draft').length,
        issued: safeMivs.filter(m => m.status === 'Issued').length,
        partially_returned: safeMivs.filter(m => m.status === 'Partially Returned').length,
        fully_returned: safeMivs.filter(m => m.status === 'Fully Returned').length
      },
      by_department: safeMivs.reduce((acc, miv) => {
        const deptName = miv.department_name || 'Unassigned';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {})
    };

    return res.json({
      success: true,
      data: safeMivs,
      summary: summary,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total: total || 0,
        pages: Math.ceil((total || 0) / lim)
      }
    });
  } catch (error) {
    console.error('[MIV] listMaterialIssueVouchers:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MIV BY WORK ORDER
// ======================================================
const getMIVByWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;
    
    const mivs = await MaterialIssueVoucher.find({ wo_id })
      .populate('items.item_id', 'part_no part_description')
      .populate('issued_by', 'FirstName LastName EmployeeID')
      .populate('department', 'DepartmentName')  // ✅ Added department population
      .sort({ miv_date: -1 });
    
    const workOrder = await WorkOrder.findById(wo_id)
      .select('wo_number part_no part_name planned_qty actual_rm_cost');
    
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    // Calculate summary
    const totalIssuedCost = mivs.reduce((sum, miv) => sum + miv.total_issue_cost, 0);
    const totalReturnedValue = mivs.reduce((sum, miv) => {
      return sum + miv.items.reduce((s, item) => s + ((item.returned_qty || 0) * item.unit_cost), 0);
    }, 0);
    
    // Calculate returned quantities by item
    const returnedItems = {};
    for (const miv of mivs) {
      for (const item of miv.items) {
        if (!returnedItems[item.part_no]) {
          returnedItems[item.part_no] = {
            part_no: item.part_no,
            issued_qty: 0,
            returned_qty: 0,
            net_consumed: 0
          };
        }
        returnedItems[item.part_no].issued_qty += item.issued_qty;
        returnedItems[item.part_no].returned_qty += (item.returned_qty || 0);
        returnedItems[item.part_no].net_consumed = returnedItems[item.part_no].issued_qty - returnedItems[item.part_no].returned_qty;
      }
    }
    
    return res.json({
      success: true,
      data: {
        work_order: {
          id: wo_id,
          number: workOrder.wo_number,
          part_no: workOrder.part_no,
          part_name: workOrder.part_name,
          planned_qty: workOrder.planned_qty,
          actual_rm_cost: workOrder.actual_rm_cost
        },
        mivs: mivs,
        summary: {
          total_mivs: mivs.length,
          total_issued_cost: totalIssuedCost,
          total_returned_value: totalReturnedValue,
          net_consumed: totalIssuedCost - totalReturnedValue,
          returned_items_breakdown: Object.values(returnedItems)
        }
      }
    });
  } catch (error) {
    console.error('[MIV] getMIVByWorkOrder:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// AUTO-CREATE MIV FROM BOM (Full Kit Issue)
// ======================================================
const autoCreateMIVFromBOM = async (req, res) => {
  try {
    const { wo_id, warehouse_id, issued_by, department } = req.body;
    
    if (!wo_id) {
      return res.status(400).json({ success: false, message: 'wo_id is required' });
    }
    if (!warehouse_id) {
      return res.status(400).json({ success: false, message: 'warehouse_id is required' });
    }
    if (!issued_by) {
      return res.status(400).json({ success: false, message: 'issued_by is required' });
    }
    
    // Fetch Work Order
    const workOrder = await WorkOrder.findById(wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    // Validate WO status
    if (!['Released', 'In Progress', 'Partially Completed'].includes(workOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot issue material for WO in ${workOrder.status} status`
      });
    }
    
    // Fetch BOM
    const bom = await BOM.findById(workOrder.bom_id);
    if (!bom || !bom.components || bom.components.length === 0) {
      return res.status(400).json({ success: false, message: 'BOM has no components' });
    }
    
    // Prepare items from BOM
    const items = [];
    const shortages = [];
    
    for (const component of bom.components) {
      if (component.is_phantom) continue;
      
      // Calculate required quantity including scrap
      const requiredQty = component.quantity_per * workOrder.planned_qty * 
        (1 + (component.scrap_percent || 0) / 100);
      
      // Find best available stock
      let stockRecord = await StockLedger.findOne({
        item_id: component.component_item_id,
        warehouse_id: warehouse_id,
        quantity: { $gt: 0 }
      }).sort({ receipt_date: 1 });
      
      if (!stockRecord) {
        shortages.push({
          part_no: component.component_part_no,
          required_qty: requiredQty,
          available: 0,
          shortage: requiredQty
        });
        continue;
      }
      
      // Check for existing reservation for this WO
      const reservation = await StockReservation.findOne({
        ref_type: 'Work Order',
        ref_id: workOrder._id,
        item_id: component.component_item_id,
        status: 'Active'
      });
      
      // Calculate available quantity including reserved stock
      let availableQty = stockRecord.quantity - (stockRecord.reserved_qty || 0);
      if (reservation) {
        availableQty += reservation.reserved_qty;
      }
      
      if (availableQty < requiredQty) {
        shortages.push({
          part_no: component.component_part_no,
          required_qty: requiredQty,
          available: availableQty,
          shortage: requiredQty - availableQty
        });
      }
      
      items.push({
        item_id: component.component_item_id,
        part_no: component.component_part_no,
        item_description: component.component_desc,
        issued_qty: requiredQty,
        unit: component.unit,
        warehouse_id: warehouse_id,
        bin_id: stockRecord.bin_id,
        batch_no: stockRecord.batch_no,
        unit_cost: stockRecord.unit_cost,
        total_cost: requiredQty * stockRecord.unit_cost,
        reservation_id: reservation ? reservation._id : null
      });
    }
    
    // If shortages exist, return error with details
    if (shortages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock shortage for some components',
        shortages: shortages,
        action_required: 'Create purchase requisitions for shortage quantities'
      });
    }
    
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to issue from BOM' });
    }
    
    // Create MIV
    const mivData = {
      wo_id: workOrder._id,
      department: department || 'Auto-Issue',
      issued_by: issued_by,
      items: items,
      remarks: 'Auto-created MIV from BOM for full kit issue'
    };
    
    // Call create function
    req.body = mivData;
    return createMaterialIssueVoucher(req, res);
    
  } catch (error) {
    console.error('[MIV] autoCreateMIVFromBOM:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// CANCEL MATERIAL ISSUE VOUCHER
// ======================================================
const cancelMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }
    
    if (miv.status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel MIV with status: ${miv.status}. Only Draft MIV can be cancelled.` 
      });
    }
    
    miv.status = 'Cancelled';
    miv.remarks = miv.remarks ? `${miv.remarks} | Cancelled: ${reason || 'No reason provided'}` : `Cancelled: ${reason || 'No reason provided'}`;
    miv.updated_by = req.user._id;
    await miv.save();
    
    return res.json({
      success: true,
      message: 'Material Issue Voucher cancelled successfully',
      data: {
        miv_number: miv.miv_number,
        status: miv.status,
        cancelled_at: new Date(),
        cancelled_by: req.user._id
      }
    });
  } catch (error) {
    console.error('[MIV] cancelMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MIV PRINT DATA
// ======================================================
const getMIVPrintData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const miv = await MaterialIssueVoucher.findById(id)
      .populate('wo_id', 'wo_number part_no part_name planned_qty')
      .populate('issued_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .populate('authorised_by', 'Username Email')
      .populate('department', 'DepartmentName')  // ✅ Added department population
      .populate('created_by', 'Username Email');
    
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }
    
    // Format for printing
    const printData = {
      document: {
        title: 'Material Issue Voucher',
        number: miv.miv_number,
        date: miv.miv_date,
        status: miv.status
      },
      work_order: {
        number: miv.wo_id?.wo_number,
        part_no: miv.wo_id?.part_no,
        part_name: miv.wo_id?.part_name,
        planned_qty: miv.wo_id?.planned_qty
      },
      customer: {
        name: miv.customer_name,
        so_number: miv.so_number
      },
      department: miv.department?.DepartmentName || miv.department_name,
      personnel: {
        issued_by: miv.issued_by ? `${miv.issued_by.FirstName} ${miv.issued_by.LastName} (${miv.issued_by.EmployeeID})` : 'N/A',
        received_by: miv.received_by ? `${miv.received_by.FirstName} ${miv.received_by.LastName} (${miv.received_by.EmployeeID})` : 'Pending',
        authorised_by: miv.authorised_by?.Username || 'Not Required',
        created_by: miv.created_by?.Username,
        posted_at: miv.posted_at
      },
      items: miv.items.map(item => ({
        part_no: item.part_no,
        description: item.item_description,
        bom_required_qty: item.bom_required_qty,
        issued_qty: item.issued_qty,
        unit: item.unit,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        batch_no: item.batch_no,
        bin_location: item.bin_id,
        returned_qty: item.returned_qty || 0,
        net_consumed: item.net_consumed_qty
      })),
      totals: {
        total_issue_cost: miv.total_issue_cost,
        item_count: miv.items.length,
        total_weight: miv.items.reduce((sum, item) => {
          if (item.unit === 'Kg') return sum + item.issued_qty;
          return sum;
        }, 0)
      },
      remarks: miv.remarks
    };
    
    return res.json({
      success: true,
      data: printData
    });
  } catch (error) {
    console.error('[MIV] getMIVPrintData:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ISSUE SUMMARY BY DATE RANGE
// ======================================================
const getIssueSummary = async (req, res) => {
  try {
    const { from_date, to_date, warehouse_id, department_id } = req.query;
    
    const filter = { status: { $in: ['Issued', 'Partially Returned', 'Fully Returned'] } };
    
    if (from_date || to_date) {
      filter.miv_date = {};
      if (from_date) filter.miv_date.$gte = new Date(from_date);
      if (to_date) filter.miv_date.$lte = new Date(to_date);
    }
    
    if (department_id) {
      filter.department = department_id;
    }
    
    const mivs = await MaterialIssueVoucher.find(filter)
      .populate('items.item_id', 'part_no part_description')
      .populate('department', 'DepartmentName');
    
    // Calculate summary
    const summary = {
      total_issues: mivs.length,
      total_issue_value: mivs.reduce((sum, m) => sum + m.total_issue_cost, 0),
      total_returned_value: 0,
      net_consumed_value: 0,
      top_issued_items: [],
      daily_issues: {},
      by_department: {}
    };
    
    // Calculate returned value and department-wise summary
    for (const miv of mivs) {
      const returnedValue = miv.items.reduce((sum, item) => sum + ((item.returned_qty || 0) * item.unit_cost), 0);
      summary.total_returned_value += returnedValue;
      
      const deptName = miv.department?.DepartmentName || miv.department_name || 'Unassigned';
      if (!summary.by_department[deptName]) {
        summary.by_department[deptName] = {
          issue_count: 0,
          issue_value: 0,
          returned_value: 0
        };
      }
      summary.by_department[deptName].issue_count++;
      summary.by_department[deptName].issue_value += miv.total_issue_cost;
      summary.by_department[deptName].returned_value += returnedValue;
    }
    summary.net_consumed_value = summary.total_issue_value - summary.total_returned_value;
    
    // Calculate top issued items
    const itemIssues = {};
    for (const miv of mivs) {
      for (const item of miv.items) {
        if (!itemIssues[item.part_no]) {
          itemIssues[item.part_no] = {
            part_no: item.part_no,
            total_issued_qty: 0,
            total_value: 0,
            count: 0
          };
        }
        itemIssues[item.part_no].total_issued_qty += item.issued_qty;
        itemIssues[item.part_no].total_value += item.total_cost;
        itemIssues[item.part_no].count++;
      }
    }
    
    summary.top_issued_items = Object.values(itemIssues)
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10);
    
    // Calculate daily issues
    for (const miv of mivs) {
      const dateKey = miv.miv_date.toISOString().split('T')[0];
      if (!summary.daily_issues[dateKey]) {
        summary.daily_issues[dateKey] = {
          date: dateKey,
          issue_count: 0,
          issue_value: 0
        };
      }
      summary.daily_issues[dateKey].issue_count++;
      summary.daily_issues[dateKey].issue_value += miv.total_issue_cost;
    }
    
    summary.daily_issues = Object.values(summary.daily_issues).sort((a, b) => a.date.localeCompare(b.date));
    
    return res.json({
      success: true,
      data: {
        period: {
          from: from_date || 'All',
          to: to_date || 'All'
        },
        summary: summary,
        detailed_issues: mivs.slice(0, 100)
      }
    });
  } catch (error) {
    console.error('[MIV] getIssueSummary:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// BULK ISSUE FOR MULTIPLE WORK ORDERS
// ======================================================
const bulkIssueForWorkOrders = async (req, res) => {
  try {
    const { work_orders, issued_by, department } = req.body;
    
    if (!work_orders || work_orders.length === 0) {
      return res.status(400).json({ success: false, message: 'work_orders array is required' });
    }
    
    const results = [];
    let totalIssuesCreated = 0;
    let totalIssuesFailed = 0;
    
    for (const wo of work_orders) {
      try {
        // Create mock request for autoCreateMIVFromBOM
        const mockReq = {
          body: {
            wo_id: wo.wo_id,
            warehouse_id: wo.warehouse_id,
            issued_by: issued_by,
            department: department || 'Bulk Issue'
          },
          user: req.user
        };
        
        const mockRes = {
          statusCode: null,
          data: null,
          status: function(code) { this.statusCode = code; return this; },
          json: function(data) { this.data = data; return this; }
        };
        
        await autoCreateMIVFromBOM(mockReq, mockRes);
        
        if (mockRes.data?.success) {
          totalIssuesCreated++;
          results.push({
            wo_id: wo.wo_id,
            success: true,
            miv_number: mockRes.data.data?.miv_number,
            message: 'MIV created successfully'
          });
        } else {
          totalIssuesFailed++;
          results.push({
            wo_id: wo.wo_id,
            success: false,
            message: mockRes.data?.message || 'Failed to create MIV'
          });
        }
      } catch (error) {
        totalIssuesFailed++;
        results.push({
          wo_id: wo.wo_id,
          success: false,
          message: error.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Bulk issue completed: ${totalIssuesCreated} successful, ${totalIssuesFailed} failed`,
      data: {
        total_processed: work_orders.length,
        successful: totalIssuesCreated,
        failed: totalIssuesFailed,
        details: results
      }
    });
  } catch (error) {
    console.error('[MIV] bulkIssueForWorkOrders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ======================================================
// UPDATE MATERIAL ISSUE VOUCHER (Draft only)
// PUT /api/miv/:id
// ======================================================
const updateMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      department,
      issued_by,
      received_by,
      authorised_by,
      items,
      remarks
    } = req.body;

    // Find existing MIV
    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }

    // Only Draft MIV can be updated
    if (miv.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot update MIV with status: ${miv.status}. Only Draft MIV can be updated.`
      });
    }

    // Fetch Work Order
    const workOrder = await WorkOrder.findById(miv.wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // Validate Department if provided
    let departmentId = null;
    let departmentName = null;
    if (department) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(department);
      
      if (isValidObjectId) {
        const dept = await Department.findById(department);
        if (!dept) {
          return res.status(400).json({
            success: false,
            message: `Department not found with ID: ${department}`
          });
        }
        departmentId = dept._id;
        departmentName = dept.DepartmentName;
      } else {
        const dept = await Department.findOne({ 
          DepartmentName: { $regex: new RegExp(`^${department}$`, 'i') } 
        });
        if (!dept) {
          return res.status(400).json({
            success: false,
            message: `Department not found with name: ${department}`
          });
        }
        departmentId = dept._id;
        departmentName = dept.DepartmentName;
      }
    }

    // Fetch BOM for reference quantities
    const bom = await BOM.findById(workOrder.bom_id);
    const bomMap = new Map();
    if (bom && bom.components) {
      bom.components.forEach(comp => {
        bomMap.set(comp.component_item_id.toString(), {
          quantity_per: comp.quantity_per,
          scrap_percent: comp.scrap_percent
        });
      });
    }

    // Process updated items with FIFO check
    const processedItems = [];
    let totalIssueCost = 0;

    for (const item of items) {
      // Find active reservation for this WO and item
      const reservation = await StockReservation.findOne({
        ref_type: 'Work Order',
        ref_id: workOrder._id,
        item_id: item.item_id,
        status: 'Active'
      });

      // FIFO: Get batches using FIFO logic
      let fifoBatches;
      try {
        fifoBatches = await getFIFOBatchesForIssue(
          item.item_id, 
          item.warehouse_id, 
          item.issued_qty
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.part_no}: ${error.message}`
        });
      }
      
      // Calculate total available and cost from FIFO batches
      const totalAvailable = fifoBatches.reduce((sum, b) => sum + b.quantity, 0);
      const totalCost = fifoBatches.reduce((sum, b) => sum + b.total_value, 0);
      
      if (totalAvailable < item.issued_qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.part_no}. Available (FIFO): ${totalAvailable}, Requested: ${item.issued_qty}`
        });
      }

      // Get BOM required quantity
      const bomReq = bomMap.get(item.item_id.toString());
      const bomRequiredQty = bomReq ? 
        (bomReq.quantity_per * workOrder.planned_qty) * (1 + (bomReq.scrap_percent || 0) / 100) : 
        0;

      // Calculate costs from FIFO batches
      const avgUnitCost = totalCost / item.issued_qty;
      totalIssueCost += totalCost;

      processedItems.push({
        item_id: item.item_id,
        part_no: item.part_no,
        item_description: item.item_description || fifoBatches[0]?.part_no || '',
        bom_required_qty: bomRequiredQty,
        issued_qty: item.issued_qty,
        unit: item.unit || fifoBatches[0]?.unit || 'Nos',
        warehouse_id: item.warehouse_id,
        bin_id: item.bin_id || fifoBatches[0]?.bin_id,
        batch_no: item.batch_no,
        heat_no: item.heat_no,
        unit_cost: avgUnitCost,
        total_cost: totalCost,
        returned_qty: 0,
        net_consumed_qty: item.issued_qty,
        reservation_id: reservation ? reservation._id : null,
        _fifoBatches: fifoBatches.map(b => ({
          ledger_id: b.ledger_id,
          batch_no: b.batch_no,
          quantity: b.quantity,
          unit_cost: b.unit_cost,
          total_value: b.total_value,
          bin_id: b.bin_id
        }))
      });
    }

    // Update MIV
    miv.department = departmentId !== null ? departmentId : miv.department;
    miv.department_name = departmentName !== null ? departmentName : miv.department_name;
    miv.issued_by = issued_by || miv.issued_by;
    miv.received_by = received_by || miv.received_by;
    miv.authorised_by = authorised_by || miv.authorised_by;
    miv.items = processedItems;
    miv.total_issue_cost = totalIssueCost;
    miv.remarks = remarks || miv.remarks;
    miv.updated_by = req.user._id;
    miv.updated_at = new Date();

    await miv.save();

    return res.status(200).json({
      success: true,
      message: 'Material Issue Voucher updated successfully',
      data: {
        miv_number: miv.miv_number,
        miv_id: miv._id,
        department: miv.department_name,
        total_issue_cost: totalIssueCost,
        items_count: processedItems.length,
        status: miv.status,
        fifo_summary: processedItems.map(item => ({
          part_no: item.part_no,
          batches_used: item._fifoBatches.length,
          total_quantity: item.issued_qty,
          total_cost: item.total_cost,
          average_cost: item.unit_cost
        }))
      }
    });

  } catch (error) {
    console.error('[MIV] updateMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DELETE MATERIAL ISSUE VOUCHER (Hard Delete)
// DELETE /api/miv/:id
// ======================================================
const deleteMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing MIV
    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }

    // Only Draft MIV can be hard deleted
    if (miv.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete MIV with status: ${miv.status}. Only Draft MIV can be deleted.`
      });
    }

    // Store MIV details for response before deletion
    const mivDetails = {
      _id: miv._id,
      miv_number: miv.miv_number,
      wo_number: miv.wo_number,
      status: miv.status,
      total_issue_cost: miv.total_issue_cost,
      items_count: miv.items.length,
      created_at: miv.createdAt,
      deleted_at: new Date(),
      deleted_by: req.user._id
    };

    // HARD DELETE - Remove from database
    await MaterialIssueVoucher.findByIdAndDelete(id);

    // Log the deletion
    console.log(`[MIV] Deleted: ${miv.miv_number} by user: ${req.user._id}`);

    return res.status(200).json({
      success: true,
      message: `Material Issue Voucher ${miv.miv_number} deleted successfully`,
      data: mivDetails
    });

  } catch (error) {
    console.error('[MIV] deleteMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// EXPORT ALL FUNCTIONS
// ======================================================
module.exports = {
  createMaterialIssueVoucher,
  postMaterialIssueVoucher,
  getMaterialIssueVoucher,
  listMaterialIssueVouchers,
  getMIVByWorkOrder,
  updateMaterialIssueVoucher,
  deleteMaterialIssueVoucher,
  autoCreateMIVFromBOM,
  cancelMaterialIssueVoucher,
  getMIVPrintData,
  getIssueSummary,
  bulkIssueForWorkOrders
};