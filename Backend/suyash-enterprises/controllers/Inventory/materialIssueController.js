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
const PurchaseRawMaterial = require('../../models/Inventory/PurchaseRawMaterial'); // <-- NAYA IMPORT (Path verify kar lein)

// ======================================================
// FIFO HELPER FUNCTION
// ======================================================

async function getFIFOBatchesForIssue(item_id, warehouse_id, required_qty) {
    const batches = await StockLedger.find({
        item_id: item_id,
        warehouse_id: warehouse_id,
        quantity: { $gt: 0 }
    }).sort({ receipt_date: 1 });
    
    const selectedBatches = [];
    let remainingQty = required_qty;
    
    for (const batch of batches) {
        if (remainingQty <= 0) break;
        
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
// CREATE MATERIAL ISSUE VOUCHER (Draft) - WITH FIFO & PRM
// ======================================================
const createMaterialIssueVoucher = async (req, res) => {
  try {
    const {
      wo_id,
      prm_id, // <-- NAYA FIELD (Purchase Raw Material ID)
      department,
      issued_by,
      received_by,
      authorised_by,
      items,
      remarks
    } = req.body;

    // Validation: Kam se kam Work Order ya PRM hona chahiye
    if (!wo_id && !prm_id) {
      return res.status(400).json({ success: false, message: 'Either wo_id or prm_id is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }
    if (!issued_by) {
      return res.status(400).json({ success: false, message: 'issued_by is required' });
    }

    let mivDate = new Date(); // Default Date
    let prmRecord = null;

    // Agar PRM select kiya hai, toh uski date uthao
    if (prm_id) {
      prmRecord = await PurchaseRawMaterial.findById(prm_id);
      if (prmRecord && prmRecord.date) {
        mivDate = prmRecord.date; // Purchase ki date Material Issue me set ho gayi
      }
    }

    let departmentId = null;
    let departmentName = null;
    if (department) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(department);
      
      if (isValidObjectId) {
        const dept = await Department.findById(department);
        if (!dept) {
          return res.status(400).json({ success: false, message: `Department not found with ID: ${department}` });
        }
        departmentId = dept._id;
        departmentName = dept.DepartmentName;
      } else {
        const dept = await Department.findOne({ DepartmentName: { $regex: new RegExp(`^${department}$`, 'i') } });
        if (!dept) {
          return res.status(400).json({ success: false, message: `Department not found with name: ${department}` });
        }
        departmentId = dept._id;
        departmentName = dept.DepartmentName;
      }
    }

    const processedItems = [];
    let totalIssueCost = 0;
    let workOrder = null;
    let bomMap = new Map();

    // Work Order Logic (Agar wo_id diya hai toh)
    if (wo_id) {
      workOrder = await WorkOrder.findById(wo_id).populate('item_id', 'part_no part_name');
      if (!workOrder) {
        return res.status(404).json({ success: false, message: 'Work Order not found' });
      }

      if (!['Released', 'In Progress', 'Partially Completed'].includes(workOrder.status)) {
        return res.status(400).json({ success: false, message: `Cannot issue material for WO in ${workOrder.status} status.` });
      }

      const bom = await BOM.findById(workOrder.bom_id);
      if (bom && bom.components) {
        bom.components.forEach(comp => {
          bomMap.set(comp.component_item_id.toString(), {
            quantity_per: comp.quantity_per,
            scrap_percent: comp.scrap_percent
          });
        });
      }
    }

    // Items Process karein (FIFO agar WO hai, direct agar PRM hai)
    for (const item of items) {
      let fifoBatches = [];
      let totalAvailable = 0;
      let totalCost = 0;
      let avgUnitCost = 0;
      
      // Agar Work Order hai toh FIFO logic chalayein
      if (wo_id) {
        const reservation = await StockReservation.findOne({
          ref_type: 'Work Order',
          ref_id: workOrder._id,
          item_id: item.item_id,
          status: 'Active'
        });

        try {
          fifoBatches = await getFIFOBatchesForIssue(item.item_id, item.warehouse_id, item.issued_qty);
        } catch (error) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${item.part_no}: ${error.message}` });
        }
        
        totalAvailable = fifoBatches.reduce((sum, b) => sum + b.quantity, 0);
        totalCost = fifoBatches.reduce((sum, b) => sum + b.total_value, 0);
        
        if (totalAvailable < item.issued_qty) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${item.part_no}. Available: ${totalAvailable}, Requested: ${item.issued_qty}` });
        }

        avgUnitCost = totalCost / item.issued_qty;
        totalIssueCost += totalCost;

        const bomReq = bomMap.get(item.item_id.toString());
        const bomRequiredQty = bomReq ? (bomReq.quantity_per * workOrder.planned_qty) * (1 + (bomReq.scrap_percent || 0) / 100) : 0;

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
      } else {
        // Agar sirf PRM hai bina WO ke (Direct Issue)
        processedItems.push({
          item_id: item.item_id,
          part_no: item.part_no,
          item_description: item.item_description,
          bom_required_qty: 0,
          issued_qty: item.issued_qty,
          unit: item.unit || 'Nos',
          warehouse_id: item.warehouse_id,
          bin_id: item.bin_id || null,
          batch_no: item.batch_no || null,
          heat_no: item.heat_no || null,
          unit_cost: item.unit_cost || 0,
          total_cost: (item.issued_qty * (item.unit_cost || 0)),
          returned_qty: 0,
          net_consumed_qty: item.issued_qty,
          reservation_id: null
        });
      }
    }

    // Document Create karein
    const miv = new MaterialIssueVoucher({
      miv_date: mivDate, // <-- PRM wali date yahan set ho rahi hai
      prm_id: prm_id || null, // <-- PRM link
      wo_id: workOrder ? workOrder._id : null,
      wo_number: workOrder ? workOrder.wo_number : null,
      so_number: workOrder ? workOrder.so_number : null,
      customer_name: workOrder ? workOrder.customer_name : (prmRecord ? prmRecord.partyName : null),
      department: departmentId,
      department_name: departmentName,
      issued_by: issued_by,
      received_by: received_by,
      authorised_by: authorised_by,
      items: processedItems,
      total_issue_cost: totalIssueCost || processedItems.reduce((sum, i) => sum + i.total_cost, 0),
      status: 'Draft',
      remarks: remarks,
      created_by: req.user._id
    });

    await miv.save();

    return res.status(201).json({
      success: true,
      message: 'Material Issue Voucher created successfully',
      data: {
        miv_number: miv.miv_number,
        miv_id: miv._id,
        department: departmentName || department,
        total_issue_cost: miv.total_issue_cost,
        items_count: processedItems.length,
        status: 'Draft',
        next_step: 'POST /api/miv/:id/post to issue materials'
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
    
    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) {
      return res.status(404).json({ success: false, message: 'MIV not found' });
    }

    if (miv.status !== 'Draft') {
      return res.status(400).json({ success: false, message: `MIV is already ${miv.status}. Only Draft MIV can be posted.` });
    }

    const workOrder = miv.wo_id ? await WorkOrder.findById(miv.wo_id) : null;
    
    const transactions = [];
    let totalRMCostAdded = 0;
    const varianceAlerts = [];
    const fifoDetails = [];

    for (const item of miv.items) {
      let fifoBatches = item._fifoBatches;
      
      // Agar draft me _fifoBatches save nahi huye the, toh dobara fetch karein
      if (!fifoBatches || fifoBatches.length === 0) {
        try {
            fifoBatches = await getFIFOBatchesForIssue(item.item_id, item.warehouse_id, item.issued_qty);
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
      }
      
      const itemFifoDetails = { part_no: item.part_no, batches: [] };
      let itemTotalCost = 0;
      
      for (const batch of fifoBatches) {
        const stockRecord = await StockLedger.findById(batch.ledger_id);
        if (!stockRecord) throw new Error(`Stock record not found for batch ${batch.batch_no}`);
        
        let reservation = miv.wo_id ? await StockReservation.findOne({
          ref_type: 'Work Order',
          ref_id: miv.wo_id,
          item_id: item.item_id,
          batch_no: batch.batch_no,
          status: 'Active'
        }) : null;
        
        let availableFromBatch = stockRecord.quantity - (stockRecord.reserved_qty || 0);
        if (reservation) availableFromBatch += reservation.reserved_qty;
        
        if (availableFromBatch < batch.quantity) {
          throw new Error(`Batch ${batch.batch_no} has insufficient available stock.`);
        }
        
        stockRecord.quantity -= batch.quantity;
        
        if (reservation) {
          const consumeFromReservation = Math.min(reservation.reserved_qty, batch.quantity);
          stockRecord.reserved_qty = Math.max(0, (stockRecord.reserved_qty || 0) - consumeFromReservation);
          
          if (consumeFromReservation >= reservation.reserved_qty) {
            reservation.status = 'Consumed';
            reservation.consumed_at = new Date();
            reservation.consumed_qty = reservation.reserved_qty;
          } else {
            reservation.reserved_qty -= consumeFromReservation;
          }
          await reservation.save();
        }
        
        stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
        stockRecord.last_updated = new Date();
        stockRecord.last_updated_by = req.user._id;
        await stockRecord.save();
        
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
          remarks: `FIFO Issue - Batch ${batch.batch_no}`,
          created_by: req.user._id
        });
        await transaction.save();
        transactions.push(transaction);
        
        itemTotalCost += batch.total_value;
        itemFifoDetails.batches.push({
          batch_no: batch.batch_no,
          quantity: batch.quantity,
          unit_cost: batch.unit_cost,
          total_value: batch.total_value
        });
      }
      
      fifoDetails.push(itemFifoDetails);
      totalRMCostAdded += itemTotalCost;

      if (workOrder && item.bom_required_qty > 0) {
        const variancePercent = Math.abs((item.issued_qty - item.bom_required_qty) / item.bom_required_qty * 100);
        if (variancePercent > 5) {
          varianceAlerts.push({ part_no: item.part_no, bom_required: item.bom_required_qty, issued: item.issued_qty, variance_percent: variancePercent.toFixed(2) });
        }
      }
    }

    // Update Work Order agar linked hai
    if (workOrder) {
        workOrder.actual_rm_cost = (workOrder.actual_rm_cost || 0) + totalRMCostAdded;
        workOrder.actual_total_cost = (workOrder.actual_rm_cost || 0) + (workOrder.actual_process_cost || 0);
        if (!workOrder.material_issues) workOrder.material_issues = [];
        workOrder.material_issues.push(miv._id);
        workOrder.updated_by = req.user._id;
        await workOrder.save();
    }

    miv.status = 'Issued';
    miv.posted_at = new Date();
    miv.updated_by = req.user._id;
    await miv.save();

    return res.json({
      success: true,
      message: 'Materials issued successfully',
      data: { miv_number: miv.miv_number, status: 'Issued', transactions_count: transactions.length }
    });

  } catch (error) {
    console.error('[MIV] postMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MIV BY ID
// ======================================================
const getMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const miv = await MaterialIssueVoucher.findById(id)
      .populate('wo_id', 'wo_number status part_no part_name planned_qty')
      .populate('prm_id') // <-- PRM Populated
      .populate('issued_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .populate('authorised_by', 'Username Email')
      .populate('department', 'DepartmentName Description')
      .populate('items.warehouse_id', 'warehouse_name warehouse_code')
      .populate('items.bin_id', 'bin_code bin_name location')
      .populate('items.item_id', 'part_no part_description unit')
      .lean();
    
    if (!miv) return res.status(404).json({ success: false, message: 'MIV not found' });
    if (!miv.items) miv.items = [];
    
    const summary = {
      total_items: miv.items.length,
      total_issued_qty: miv.items.reduce((sum, item) => sum + (item.issued_qty || 0), 0),
      total_cost: miv.total_issue_cost || 0
    };
    
    return res.json({ success: true, data: miv, summary: summary });
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
    const { page = 1, limit = 20, wo_id, status, from_date, to_date, miv_number, search, department_id } = req.query;
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
        .populate('prm_id', 'refNo invoiceNo partyName') // <-- PRM list me
        .populate('issued_by', 'FirstName LastName')
        .populate('department', 'DepartmentName')
        .populate('items.item_id', 'part_no')
        .sort({ miv_date: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      MaterialIssueVoucher.countDocuments(filter)
    ]);

    const safeMivs = mivs || [];
    
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
      pagination: { page: parseInt(page), limit: lim, total: total || 0, pages: Math.ceil((total || 0) / lim) }
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
      .populate('department', 'DepartmentName')
      .sort({ miv_date: -1 });
    
    const workOrder = await WorkOrder.findById(wo_id).select('wo_number part_no part_name planned_qty actual_rm_cost');
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work Order not found' });
    
    const totalIssuedCost = mivs.reduce((sum, miv) => sum + miv.total_issue_cost, 0);
    const totalReturnedValue = mivs.reduce((sum, miv) => sum + miv.items.reduce((s, item) => s + ((item.returned_qty || 0) * item.unit_cost), 0), 0);
    
    const returnedItems = {};
    for (const miv of mivs) {
      for (const item of miv.items) {
        if (!returnedItems[item.part_no]) returnedItems[item.part_no] = { part_no: item.part_no, issued_qty: 0, returned_qty: 0, net_consumed: 0 };
        returnedItems[item.part_no].issued_qty += item.issued_qty;
        returnedItems[item.part_no].returned_qty += (item.returned_qty || 0);
        returnedItems[item.part_no].net_consumed = returnedItems[item.part_no].issued_qty - returnedItems[item.part_no].returned_qty;
      }
    }
    
    return res.json({
      success: true,
      data: {
        work_order: { id: wo_id, number: workOrder.wo_number, part_no: workOrder.part_no, part_name: workOrder.part_name, planned_qty: workOrder.planned_qty, actual_rm_cost: workOrder.actual_rm_cost },
        mivs: mivs,
        summary: { total_mivs: mivs.length, total_issued_cost: totalIssuedCost, total_returned_value: totalReturnedValue, net_consumed: totalIssuedCost - totalReturnedValue, returned_items_breakdown: Object.values(returnedItems) }
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
    
    if (!wo_id || !warehouse_id || !issued_by) {
      return res.status(400).json({ success: false, message: 'wo_id, warehouse_id, and issued_by are required' });
    }
    
    const workOrder = await WorkOrder.findById(wo_id);
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work Order not found' });
    
    if (!['Released', 'In Progress', 'Partially Completed'].includes(workOrder.status)) {
      return res.status(400).json({ success: false, message: `Cannot issue material for WO in ${workOrder.status} status` });
    }
    
    const bom = await BOM.findById(workOrder.bom_id);
    if (!bom || !bom.components || bom.components.length === 0) {
      return res.status(400).json({ success: false, message: 'BOM has no components' });
    }
    
    const items = [];
    const shortages = [];
    
    for (const component of bom.components) {
      if (component.is_phantom) continue;
      
      const requiredQty = component.quantity_per * workOrder.planned_qty * (1 + (component.scrap_percent || 0) / 100);
      let stockRecord = await StockLedger.findOne({ item_id: component.component_item_id, warehouse_id: warehouse_id, quantity: { $gt: 0 } }).sort({ receipt_date: 1 });
      
      if (!stockRecord) {
        shortages.push({ part_no: component.component_part_no, required_qty: requiredQty, available: 0, shortage: requiredQty });
        continue;
      }
      
      const reservation = await StockReservation.findOne({ ref_type: 'Work Order', ref_id: workOrder._id, item_id: component.component_item_id, status: 'Active' });
      let availableQty = stockRecord.quantity - (stockRecord.reserved_qty || 0);
      if (reservation) availableQty += reservation.reserved_qty;
      
      if (availableQty < requiredQty) {
        shortages.push({ part_no: component.component_part_no, required_qty: requiredQty, available: availableQty, shortage: requiredQty - availableQty });
      }
      
      items.push({
        item_id: component.component_item_id, part_no: component.component_part_no, item_description: component.component_desc,
        issued_qty: requiredQty, unit: component.unit, warehouse_id: warehouse_id, bin_id: stockRecord.bin_id,
        batch_no: stockRecord.batch_no, unit_cost: stockRecord.unit_cost, total_cost: requiredQty * stockRecord.unit_cost,
        reservation_id: reservation ? reservation._id : null
      });
    }
    
    if (shortages.length > 0) {
      return res.status(400).json({ success: false, message: 'Stock shortage for some components', shortages: shortages });
    }
    
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to issue from BOM' });
    }
    
    req.body = { wo_id: workOrder._id, department: department || 'Auto-Issue', issued_by: issued_by, items: items, remarks: 'Auto-created MIV from BOM for full kit issue' };
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
    if (!miv) return res.status(404).json({ success: false, message: 'MIV not found' });
    if (miv.status !== 'Draft') return res.status(400).json({ success: false, message: `Cannot cancel MIV with status: ${miv.status}. Only Draft MIV can be cancelled.` });
    
    miv.status = 'Cancelled';
    miv.remarks = miv.remarks ? `${miv.remarks} | Cancelled: ${reason || 'No reason provided'}` : `Cancelled: ${reason || 'No reason provided'}`;
    miv.updated_by = req.user._id;
    await miv.save();
    
    return res.json({ success: true, message: 'Material Issue Voucher cancelled successfully', data: { miv_number: miv.miv_number, status: miv.status } });
  } catch (error) {
    console.error('[MIV] cancelMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MIV PRINT DATA (Updated for PRM and TO/Dept format)
// ======================================================
const getMIVPrintData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const miv = await MaterialIssueVoucher.findById(id)
      .populate('wo_id', 'wo_number part_no part_name planned_qty')
      .populate('prm_id') // <-- PRM populate kiya
      .populate('issued_by', 'FirstName LastName EmployeeID Username')
      .populate('received_by', 'FirstName LastName EmployeeID Username')
      .populate('authorised_by', 'Username Email')
      .populate('department', 'DepartmentName')
      .populate('created_by', 'Username Email');
    
    if (!miv) return res.status(404).json({ success: false, message: 'MIV not found' });

    // TO (Received By) ka naam nikalna
    let toUserName = 'N/A';
    if (miv.received_by) {
        toUserName = `${miv.received_by.FirstName || ''} ${miv.received_by.LastName || ''}`.trim() || miv.received_by.Username || 'N/A';
    }

    const printData = {
      document: {
        title: 'Material Issue Slip',
        number: miv.miv_number,
        date: miv.miv_date,
        status: miv.status
      },
      // Aapka maanga hua format
      to_user: toUserName, 
      department: miv.department?.DepartmentName || miv.department_name || 'N/A',

      personnel: {
        issued_by: miv.issued_by ? `${miv.issued_by.FirstName || ''} ${miv.issued_by.LastName || ''}`.trim() : 'N/A',
        authorised_by: miv.authorised_by?.Username || 'N/A',
      },

      // Purchase Raw Material Details (Agar link hai)
      purchase_details: miv.prm_id ? {
        ref_no: miv.prm_id.refNo || miv.prm_id._id,
        party_name: miv.prm_id.partyName || 'N/A',
        invoice_no: miv.prm_id.invoiceNo || 'N/A',
        rm_type: miv.prm_id.rmType || 'N/A'
      } : null,

      work_order: miv.wo_id ? {
        number: miv.wo_id.wo_number,
        part_no: miv.wo_id.part_no,
      } : null,

      items: miv.items.map(item => ({
        part_no: item.part_no,
        description: item.item_description,
        issued_qty: item.issued_qty,
        unit: item.unit,
        batch_no: item.batch_no || 'N/A',
        bin_location: item.bin_id || 'N/A',
      })),
      remarks: miv.remarks
    };
    
    return res.json({ success: true, data: printData });
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
    if (department_id) filter.department = department_id;
    
    const mivs = await MaterialIssueVoucher.find(filter).populate('items.item_id', 'part_no part_description').populate('department', 'DepartmentName');
    
    const summary = { total_issues: mivs.length, total_issue_value: mivs.reduce((sum, m) => sum + m.total_issue_cost, 0), total_returned_value: 0, net_consumed_value: 0, top_issued_items: [], daily_issues: {}, by_department: {} };
    
    for (const miv of mivs) {
      const returnedValue = miv.items.reduce((sum, item) => sum + ((item.returned_qty || 0) * item.unit_cost), 0);
      summary.total_returned_value += returnedValue;
      
      const deptName = miv.department?.DepartmentName || miv.department_name || 'Unassigned';
      if (!summary.by_department[deptName]) summary.by_department[deptName] = { issue_count: 0, issue_value: 0, returned_value: 0 };
      summary.by_department[deptName].issue_count++;
      summary.by_department[deptName].issue_value += miv.total_issue_cost;
      summary.by_department[deptName].returned_value += returnedValue;
    }
    summary.net_consumed_value = summary.total_issue_value - summary.total_returned_value;
    
    const itemIssues = {};
    for (const miv of mivs) {
      for (const item of miv.items) {
        if (!itemIssues[item.part_no]) itemIssues[item.part_no] = { part_no: item.part_no, total_issued_qty: 0, total_value: 0, count: 0 };
        itemIssues[item.part_no].total_issued_qty += item.issued_qty;
        itemIssues[item.part_no].total_value += item.total_cost;
        itemIssues[item.part_no].count++;
      }
    }
    summary.top_issued_items = Object.values(itemIssues).sort((a, b) => b.total_value - a.total_value).slice(0, 10);
    
    for (const miv of mivs) {
      const dateKey = miv.miv_date.toISOString().split('T')[0];
      if (!summary.daily_issues[dateKey]) summary.daily_issues[dateKey] = { date: dateKey, issue_count: 0, issue_value: 0 };
      summary.daily_issues[dateKey].issue_count++;
      summary.daily_issues[dateKey].issue_value += miv.total_issue_cost;
    }
    summary.daily_issues = Object.values(summary.daily_issues).sort((a, b) => a.date.localeCompare(b.date));
    
    return res.json({ success: true, data: { period: { from: from_date || 'All', to: to_date || 'All' }, summary: summary, detailed_issues: mivs.slice(0, 100) } });
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
    if (!work_orders || work_orders.length === 0) return res.status(400).json({ success: false, message: 'work_orders array is required' });
    
    const results = [];
    let totalIssuesCreated = 0, totalIssuesFailed = 0;
    
    for (const wo of work_orders) {
      try {
        const mockReq = { body: { wo_id: wo.wo_id, warehouse_id: wo.warehouse_id, issued_by: issued_by, department: department || 'Bulk Issue' }, user: req.user };
        const mockRes = { statusCode: null, data: null, status: function(code) { this.statusCode = code; return this; }, json: function(data) { this.data = data; return this; } };
        
        await autoCreateMIVFromBOM(mockReq, mockRes);
        
        if (mockRes.data?.success) {
          totalIssuesCreated++;
          results.push({ wo_id: wo.wo_id, success: true, miv_number: mockRes.data.data?.miv_number, message: 'MIV created successfully' });
        } else {
          totalIssuesFailed++;
          results.push({ wo_id: wo.wo_id, success: false, message: mockRes.data?.message || 'Failed to create MIV' });
        }
      } catch (error) {
        totalIssuesFailed++;
        results.push({ wo_id: wo.wo_id, success: false, message: error.message });
      }
    }
    
    return res.status(200).json({ success: true, message: `Bulk issue completed: ${totalIssuesCreated} successful, ${totalIssuesFailed} failed`, data: { total_processed: work_orders.length, successful: totalIssuesCreated, failed: totalIssuesFailed, details: results } });
  } catch (error) {
    console.error('[MIV] bulkIssueForWorkOrders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE MATERIAL ISSUE VOUCHER (Draft only)
// ======================================================
const updateMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, issued_by, received_by, authorised_by, items, remarks } = req.body;

    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) return res.status(404).json({ success: false, message: 'MIV not found' });
    if (miv.status !== 'Draft') return res.status(400).json({ success: false, message: `Cannot update MIV with status: ${miv.status}. Only Draft MIV can be updated.` });

    const workOrder = miv.wo_id ? await WorkOrder.findById(miv.wo_id) : null;

    let departmentId = miv.department;
    let departmentName = miv.department_name;
    if (department) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(department);
      if (isValidObjectId) {
        const dept = await Department.findById(department);
        if (dept) { departmentId = dept._id; departmentName = dept.DepartmentName; }
      } else {
        const dept = await Department.findOne({ DepartmentName: { $regex: new RegExp(`^${department}$`, 'i') } });
        if (dept) { departmentId = dept._id; departmentName = dept.DepartmentName; }
      }
    }

    let bomMap = new Map();
    if (workOrder) {
        const bom = await BOM.findById(workOrder.bom_id);
        if (bom && bom.components) {
          bom.components.forEach(comp => bomMap.set(comp.component_item_id.toString(), { quantity_per: comp.quantity_per, scrap_percent: comp.scrap_percent }));
        }
    }

    const processedItems = [];
    let totalIssueCost = 0;

    for (const item of items) {
      let fifoBatches = [];
      let totalCost = 0;
      let avgUnitCost = 0;

      if (workOrder) {
          try {
            fifoBatches = await getFIFOBatchesForIssue(item.item_id, item.warehouse_id, item.issued_qty);
          } catch (error) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${item.part_no}: ${error.message}` });
          }
          
          totalCost = fifoBatches.reduce((sum, b) => sum + b.total_value, 0);
          avgUnitCost = totalCost / item.issued_qty;
          totalIssueCost += totalCost;

          const bomReq = bomMap.get(item.item_id.toString());
          const bomRequiredQty = bomReq ? (bomReq.quantity_per * workOrder.planned_qty) * (1 + (bomReq.scrap_percent || 0) / 100) : 0;

          processedItems.push({
            item_id: item.item_id, part_no: item.part_no, item_description: item.item_description || fifoBatches[0]?.part_no || '',
            bom_required_qty: bomRequiredQty, issued_qty: item.issued_qty, unit: item.unit || fifoBatches[0]?.unit || 'Nos',
            warehouse_id: item.warehouse_id, bin_id: item.bin_id || fifoBatches[0]?.bin_id, batch_no: item.batch_no, heat_no: item.heat_no,
            unit_cost: avgUnitCost, total_cost: totalCost, returned_qty: 0, net_consumed_qty: item.issued_qty,
            _fifoBatches: fifoBatches.map(b => ({ ledger_id: b.ledger_id, batch_no: b.batch_no, quantity: b.quantity, unit_cost: b.unit_cost, total_value: b.total_value, bin_id: b.bin_id }))
          });
      } else {
          // Direct PRM update
          processedItems.push({
            item_id: item.item_id, part_no: item.part_no, item_description: item.item_description,
            bom_required_qty: 0, issued_qty: item.issued_qty, unit: item.unit || 'Nos',
            warehouse_id: item.warehouse_id, bin_id: item.bin_id, batch_no: item.batch_no, heat_no: item.heat_no,
            unit_cost: item.unit_cost || 0, total_cost: (item.issued_qty * (item.unit_cost || 0)), returned_qty: 0, net_consumed_qty: item.issued_qty
          });
      }
    }

    miv.department = departmentId;
    miv.department_name = departmentName;
    miv.issued_by = issued_by || miv.issued_by;
    miv.received_by = received_by || miv.received_by;
    miv.authorised_by = authorised_by || miv.authorised_by;
    miv.items = processedItems;
    miv.total_issue_cost = totalIssueCost || processedItems.reduce((sum, i) => sum + i.total_cost, 0);
    miv.remarks = remarks || miv.remarks;
    miv.updated_by = req.user._id;
    miv.updated_at = new Date();

    await miv.save();

    return res.status(200).json({ success: true, message: 'Material Issue Voucher updated successfully', data: { miv_number: miv.miv_number, miv_id: miv._id, department: miv.department_name, total_issue_cost: miv.total_issue_cost, items_count: processedItems.length, status: miv.status } });
  } catch (error) {
    console.error('[MIV] updateMaterialIssueVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DELETE MATERIAL ISSUE VOUCHER (Hard Delete)
// ======================================================
const deleteMaterialIssueVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const miv = await MaterialIssueVoucher.findById(id);
    if (!miv) return res.status(404).json({ success: false, message: 'MIV not found' });
    if (miv.status !== 'Draft') return res.status(400).json({ success: false, message: `Cannot delete MIV with status: ${miv.status}. Only Draft MIV can be deleted.` });

    const mivDetails = { _id: miv._id, miv_number: miv.miv_number, wo_number: miv.wo_number, status: miv.status, total_issue_cost: miv.total_issue_cost, items_count: miv.items.length };
    await MaterialIssueVoucher.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: `Material Issue Voucher ${miv.miv_number} deleted successfully`, data: mivDetails });
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