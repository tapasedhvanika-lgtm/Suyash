'use strict';
const mongoose = require('mongoose');
const ComponentPickList = require('../../models/Assembly/ComponentPickList');
const { WorkOrder } = require('../../models/Production/WorkOrder');
const Bom = require('../../models/BOM/Bom');
const StockLedger = require('../../models/Inventory/StockLedger');
const StockTransaction = require('../../models/Inventory/StockTransaction');
const SubAssemblyRegister = require('../../models/Assembly/SubAssemblyRegister');

// ======================================================
// HELPER: Check Sub-Assembly Availability
// ======================================================
async function checkSubAssemblyAvailability(wo_id, pickListItems) {
  try {
    const shortages = [];
    
    // Get sub-assembly items from pick list
    const subAssemblyItems = pickListItems.filter(i => i.component_type === 'Sub-Assembly');
    
    for (const subItem of subAssemblyItems) {
      // Convert child_item_id to ObjectId if it's a string
      const childItemId = subItem.component_item_id;
      
      // Find dependency record
      const dependency = await SubAssemblyRegister.findOne({
        parent_wo_id: mongoose.Types.ObjectId(wo_id),
        child_item_id: childItemId
      });
      
      if (dependency && !dependency.dependency_met) {
        shortages.push({
          part_no: subItem.component_part_no,
          required_qty: subItem.required_qty,
          picked_qty: subItem.picked_qty || 0,
          available_qty: dependency.available_qty,
          shortage: dependency.shortage_qty,
          child_wo_status: dependency.child_wo_status,
          child_wo_number: dependency.child_wo_number
        });
      } else if (!dependency && subItem.picked_qty > 0) {
        // No dependency record but we have picked quantity - check stock directly
        const stockRecord = await StockLedger.findOne({
          item_id: subItem.component_item_id,
          warehouse_id: subItem.warehouse_id,
          quantity: { $gt: 0 }
        });
        
        if (!stockRecord || stockRecord.quantity < subItem.picked_qty) {
          shortages.push({
            part_no: subItem.component_part_no,
            required_qty: subItem.required_qty,
            picked_qty: subItem.picked_qty || 0,
            available_qty: stockRecord?.quantity || 0,
            shortage: (subItem.picked_qty || 0) - (stockRecord?.quantity || 0),
            child_wo_status: 'No sub-assembly WO found'
          });
        }
      }
    }
    
    return shortages;
  } catch (err) {
    console.error('[PickList] checkSubAssemblyAvailability error:', err);
    return [];
  }
}

// ======================================================
// HELPER: Validate Picked Quantities
// ======================================================
function validatePickedQuantities(item, pickedQty) {
  const errors = [];
  
  if (pickedQty < 0) {
    errors.push('Picked quantity cannot be negative');
  }
  
  if (pickedQty > item.required_qty) {
    errors.push(`Cannot pick more than required. Required: ${item.required_qty}, Attempted: ${pickedQty}`);
  }
  
  return errors;
}

// ======================================================
// CREATE PICK LIST (Manual Generation Trigger)
// ======================================================
exports.createPickList = async (req, res) => {
  try {
    const { wo_id } = req.body;
    
    if (!wo_id) {
      return res.status(400).json({
        success: false,
        message: 'wo_id is required'
      });
    }
    
    const workOrder = await WorkOrder.findById(wo_id);
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    // Check if pick list already exists
    const existingPickList = await ComponentPickList.findOne({ wo_id });
    if (existingPickList) {
      return res.status(400).json({
        success: false,
        message: 'Pick list already exists for this work order',
        picklist_id: existingPickList.picklist_id
      });
    }
    
    // Generate pick list
    const bom = await Bom.findById(workOrder.bom_id).lean();
    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }
    
    const items = [];
    const subAssemblyShortages = [];
    
    for (const comp of bom.components) {
      let unitCost = 0;
      let warehouseId = '';
      let binId = '';
      let batchNo = '';
      let componentType = 'Raw Material';
      
      // Determine component type
      if (comp.is_subcontract) {
        componentType = 'Bought-Out';
      } else if (comp.is_phantom) {
        componentType = 'Sub-Assembly';
      } else {
        componentType = 'Raw Material';
      }
      
      const requiredQty = comp.quantity_per * workOrder.planned_qty * (1 + (comp.scrap_percent || 0) / 100);
      
      // For sub-assemblies, check if available in FG store
      if (componentType === 'Sub-Assembly') {
        // Find stock in FG store (warehouse_type = 'Finished Goods')
        const Warehouse = mongoose.model('Warehouse');
        const fgWarehouse = await Warehouse.findOne({ 
          warehouse_type: 'Finished Goods',
          is_active: true 
        });
        
        const stock = await StockLedger.findOne({
          item_id: comp.component_item_id,
          warehouse_id: fgWarehouse?._id,
          quantity: { $gt: 0 }
        }).sort({ receipt_date: 1 });
        
        if (stock) {
          unitCost = stock.unit_cost || 0;
          warehouseId = stock.warehouse_id;
          binId = stock.bin_id || '';
          batchNo = stock.batch_no || '';
        } else {
          subAssemblyShortages.push({
            part_no: comp.component_part_no,
            required_qty: requiredQty,
            available: 0
          });
        }
      } else {
        // For raw materials and bought-out parts
        const stock = await StockLedger.findOne({
          item_id: comp.component_item_id,
          quantity: { $gt: 0 },
        }).sort({ receipt_date: 1 });
        
        if (stock) {
          unitCost = stock.unit_cost || 0;
          warehouseId = stock.warehouse_id;
          binId = stock.bin_id || '';
          batchNo = stock.batch_no || '';
        }
      }
      
      items.push({
        bom_line_id: comp._id,
        component_item_id: comp.component_item_id,
        component_part_no: comp.component_part_no,
        component_description: comp.component_desc || comp.component_part_no,
        component_type: componentType,
        bom_qty_per: comp.quantity_per,
        required_qty: requiredQty,
        warehouse_id: warehouseId,
        bin_id: binId,
        batch_no: batchNo,
        unit_cost: unitCost,
        pick_status: 'Pending',
      });
    }
    
    const picklist = new ComponentPickList({
      wo_id: workOrder._id,
      wo_number: workOrder.wo_number,
      assembly_qty: workOrder.planned_qty,
      items: items,
      created_by: req.user._id
    });
    
    await picklist.save();
    
    // Update work order with pick list reference
    workOrder.component_picklist_id = picklist._id;
    await workOrder.save();
    
    res.status(201).json({
      success: true,
      message: 'Pick list created successfully',
      data: {
        picklist_id: picklist.picklist_id,
        status: picklist.status,
        total_items: items.length,
        sub_assembly_shortages: subAssemblyShortages
      }
    });
  } catch (error) {
    console.error('Create pick list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// GET PICK LIST BY WORK ORDER
// ======================================================
exports.getPickListByWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;
    const pickList = await ComponentPickList.findOne({ wo_id })
      .populate('picked_by', 'FirstName LastName EmployeeID')
      .populate('issued_to', 'FirstName LastName EmployeeID')
      .sort({ createdAt: -1 });
    
    if (!pickList) {
      return res.status(404).json({ success: false, message: 'Pick list not found for this work order' });
    }
    
    // Calculate summary
    const summary = {
      total_items: pickList.items.length,
      total_required_qty: pickList.items.reduce((sum, i) => sum + i.required_qty, 0),
      total_picked_qty: pickList.items.reduce((sum, i) => sum + i.picked_qty, 0),
      total_shortage_qty: pickList.items.reduce((sum, i) => sum + i.shortage_qty, 0),
      items_pending: pickList.items.filter(i => i.pick_status === 'Pending').length,
      items_picked: pickList.items.filter(i => i.pick_status === 'Picked').length,
      items_short: pickList.items.filter(i => i.pick_status === 'Short').length,
      items_substituted: pickList.items.filter(i => i.pick_status === 'Substituted').length,
      can_issue: pickList.status === 'Fully Picked' || pickList.status === 'Partially Picked'
    };
    
    res.json({ 
      success: true, 
      data: pickList,
      summary: summary
    });
  } catch (error) {
    console.error('Get pick list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// GET PICK LIST BY ID
// ======================================================
exports.getPickListById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickList = await ComponentPickList.findById(id)
      .populate('picked_by', 'FirstName LastName EmployeeID')
      .populate('issued_to', 'FirstName LastName EmployeeID')
      .populate('created_by', 'Username');
    
    if (!pickList) {
      return res.status(404).json({ success: false, message: 'Pick list not found' });
    }
    
    // Calculate summary
    const summary = {
      total_items: pickList.items.length,
      total_required_qty: pickList.items.reduce((sum, i) => sum + i.required_qty, 0),
      total_picked_qty: pickList.items.reduce((sum, i) => sum + i.picked_qty, 0),
      total_shortage_qty: pickList.items.reduce((sum, i) => sum + i.shortage_qty, 0),
      can_issue: pickList.status === 'Fully Picked' || pickList.status === 'Partially Picked'
    };
    
    res.json({ success: true, data: pickList, summary: summary });
  } catch (error) {
    console.error('Get pick list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// UPDATE PICK LIST (Store Person Updates Picked Quantities)
// ======================================================
exports.updatePickList = async (req, res) => {
  try {
    const { id } = req.params;
    const { picks, picked_by, status } = req.body; // Added 'status' to destructuring
    
    // Add validation for picks array
    if (!picks || !Array.isArray(picks) || picks.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'picks array is required and must not be empty' 
      });
    }
    
    const pickList = await ComponentPickList.findById(id);
    if (!pickList) {
      return res.status(404).json({ success: false, message: 'Pick list not found' });
    }
    
    if (pickList.status === 'Issued' || pickList.status === 'Closed') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update pick list in ${pickList.status} status` 
      });
    }
    
    const validationErrors = [];
    
    // Update each picked item
    for (const updateItem of picks) {
      // Find item by _id
      const item = pickList.items.id(updateItem.item_id);
      if (item) {
        // Validate picked quantity
        const errors = validatePickedQuantities(item, updateItem.picked_qty);
        if (errors.length > 0) {
          validationErrors.push({
            part_no: item.component_part_no,
            errors: errors
          });
          continue;
        }
        
        item.picked_qty = updateItem.picked_qty || 0;
        item.batch_no = updateItem.batch_no || item.batch_no;
        item.bin_id = updateItem.bin_id || item.bin_id;
        item.is_substitute = updateItem.is_substitute || false;
        item.substitute_reason = updateItem.substitute_reason || '';
        item.original_part_no = updateItem.original_part_no || '';
        item.remarks = updateItem.remarks || '';
        
        // Auto-calculate shortage
        item.shortage_qty = Math.max(0, item.required_qty - item.picked_qty);
        item.total_cost = item.picked_qty * (item.unit_cost || 0);
        
        // Update pick status
        if (item.picked_qty === 0) {
          item.pick_status = 'Pending';
        } else if (item.picked_qty < item.required_qty) {
          item.pick_status = 'Short';
        } else if (item.is_substitute) {
          item.pick_status = 'Substituted';
        } else {
          item.pick_status = 'Picked';
        }
      }
    }
    
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors in pick list update',
        errors: validationErrors
      });
    }
    
    // Recalculate total cost
    pickList.total_cost = pickList.items.reduce((sum, i) => sum + (i.total_cost || 0), 0);
    
    // Update overall pick list status
    // Check if status is provided in request body
    if (status && ['Generated', 'Partially Picked', 'Fully Picked'].includes(status)) {
      // Use the status from request body if provided and valid
      pickList.status = status;
    } else {
      // Otherwise calculate automatically
      const allPicked = pickList.items.every(i => i.pick_status === 'Picked' || i.pick_status === 'Substituted');
      const anyPicked = pickList.items.some(i => i.picked_qty > 0);
      
      if (allPicked) {
        pickList.status = 'Fully Picked';
      } else if (anyPicked) {
        pickList.status = 'Partially Picked';
      }
      // If no items picked, keep existing status (likely 'Generated')
    }
    
    if (picked_by) {
      pickList.picked_by = picked_by;
      pickList.picked_at = new Date();
    }
    
    await pickList.save();
    
    // Get shortages for response
    const shortages = pickList.items.filter(i => i.shortage_qty > 0);
    
    // Check if shortages are critical (affecting sub-assemblies)
    const criticalShortages = shortages.filter(s => s.component_type === 'Sub-Assembly');
    
    res.json({ 
      success: true, 
      data: { 
        picklist_id: pickList.picklist_id, 
        status: pickList.status,
        shortages: shortages.map(s => ({
          component_part_no: s.component_part_no,
          component_type: s.component_type,
          required_qty: s.required_qty,
          picked_qty: s.picked_qty,
          shortage_qty: s.shortage_qty
        })),
        critical_shortages_count: criticalShortages.length,
        total_cost: pickList.total_cost
      } 
    });
  } catch (error) {
    console.error('Update pick list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// ISSUE PICK LIST TO ASSEMBLY FLOOR
// Allows partial issue (warns but doesn't block for non-critical shortages)
// ======================================================
exports.issuePickList = async (req, res) => {
  try {
    const { id } = req.params;
    const { issued_to, allow_partial = false } = req.body;
    
    const pickList = await ComponentPickList.findById(id);
    if (!pickList) {
      return res.status(404).json({ success: false, message: 'Pick list not found' });
    }
    
    if (pickList.status !== 'Fully Picked' && pickList.status !== 'Partially Picked') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot issue pick list in ${pickList.status} status. Must be Fully Picked or Partially Picked.` 
      });
    }
    
    // Check if already issued
    if (pickList.status === 'Issued') {
      return res.status(400).json({ 
        success: false, 
        message: 'Pick list already issued' 
      });
    }
    
    // Check sub-assembly availability
    const workOrder = await WorkOrder.findById(pickList.wo_id);
    if (workOrder && workOrder.wo_type === 'Assembly') {
      const subAssemblyShortages = await checkSubAssemblyAvailability(pickList.wo_id, pickList.items);
      
      if (subAssemblyShortages.length > 0) {
        // Critical - cannot issue if sub-assemblies are missing
        return res.status(400).json({
          success: false,
          message: 'Cannot issue pick list due to sub-assembly shortages',
          shortages: subAssemblyShortages,
          action_required: 'Complete pending sub-assembly work orders first'
        });
      }
    }
    
    // Create stock transactions for issued items
    const transactions = [];
    let totalIssueCost = 0;
    const shortageItems = [];
    const warnings = [];
    
    for (const item of pickList.items) {
      if (item.picked_qty <= 0) {
        if (item.required_qty > 0) {
          shortageItems.push({
            part_no: item.component_part_no,
            component_type: item.component_type,
            required_qty: item.required_qty,
            picked_qty: 0
          });
        }
        continue;
      }
      
      // Find stock ledger record
      const stockRecord = await StockLedger.findOne({
        item_id: item.component_item_id,
        warehouse_id: item.warehouse_id,
        batch_no: item.batch_no
      });
      
      if (!stockRecord) {
        shortageItems.push({
          part_no: item.component_part_no,
          component_type: item.component_type,
          required_qty: item.required_qty,
          picked_qty: item.picked_qty,
          error: 'Stock record not found'
        });
        continue;
      }
      
      // Check available stock (including reserved)
      const availableQty = stockRecord.quantity - (stockRecord.reserved_qty || 0);
      if (availableQty < item.picked_qty) {
        if (allow_partial && item.component_type !== 'Sub-Assembly') {
          // Partial issue allowed for non-critical items
          warnings.push({
            part_no: item.component_part_no,
            component_type: item.component_type,
            requested: item.picked_qty,
            available: availableQty,
            issued: availableQty,
            message: `Partial issue: Only ${availableQty} available, ${item.picked_qty} requested`
          });
          
          // Issue only available quantity
          item.picked_qty = availableQty;
          item.shortage_qty = item.required_qty - availableQty;
          item.pick_status = 'Short';
        } else {
          shortageItems.push({
            part_no: item.component_part_no,
            component_type: item.component_type,
            required_qty: item.required_qty,
            picked_qty: item.picked_qty,
            available: availableQty,
            error: 'Insufficient stock'
          });
          continue;
        }
      }
      
      // Update stock
      stockRecord.quantity -= item.picked_qty;
      stockRecord.reserved_qty = Math.max(0, (stockRecord.reserved_qty || 0) - item.picked_qty);
      stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
      stockRecord.last_updated = new Date();
      stockRecord.last_updated_by = req.user._id;
      await stockRecord.save();
      
      // Create transaction
      const transaction = new StockTransaction({
        txn_type: 'Material Issue',
        txn_date: new Date(),
        item_id: item.component_item_id,
        part_no: item.component_part_no,
        from_warehouse: item.warehouse_id,
        to_warehouse: null,
        from_bin: item.bin_id,
        quantity: item.picked_qty,
        unit: item.unit || 'Nos',
        unit_cost: item.unit_cost,
        total_value: item.picked_qty * item.unit_cost,
        batch_no: item.batch_no,
        ref_document_type: 'PickList',
        ref_document_id: pickList.picklist_id,
        ref_id: pickList._id,
        remarks: `Issued for Assembly WO ${pickList.wo_number}`,
        created_by: req.user._id
      });
      await transaction.save();
      transactions.push(transaction);
      totalIssueCost += item.picked_qty * item.unit_cost;
    }
    
    // If there are shortages and partial issue not allowed, don't issue
    if (shortageItems.length > 0 && !allow_partial) {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue pick list due to shortages. Use allow_partial=true to issue available quantities.',
        shortages: shortageItems,
        action_required: 'Resolve shortages before issuing'
      });
    }
    
    // Update pick list
    pickList.status = 'Issued';
    pickList.issued_to = issued_to;
    pickList.issued_at = new Date();
    await pickList.save();
    
    // Update Work Order
    if (workOrder) {
      // Update actual RM cost
      workOrder.actual_rm_cost = (workOrder.actual_rm_cost || 0) + totalIssueCost;
      
      // Update status to Components Kitted
      if (workOrder.status === 'Released') {
        workOrder.status = 'Components Kitted';
      }
      
      // Store pick list reference
      workOrder.component_picklist_id = pickList._id;
      
      await workOrder.save();
    }
    
    res.json({ 
      success: true, 
      message: shortageItems.length > 0 ? 'Pick list issued with partial quantities' : 'Pick list issued successfully',
      warnings: warnings.length > 0 ? warnings : undefined,
      data: { 
        picklist_id: pickList.picklist_id, 
        status: pickList.status,
        wo_status: workOrder?.status || 'Unknown',
        wo_number: pickList.wo_number,
        transactions_count: transactions.length,
        total_issue_cost: totalIssueCost,
        shortages_remaining: shortageItems.length > 0 ? shortageItems : undefined
      } 
    });
  } catch (error) {
    console.error('Issue pick list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// GET PICK LIST STATUS (For Assembly Dashboard)
// ======================================================
exports.getPickListStatus = async (req, res) => {
  try {
    const { wo_id } = req.params;
    
    const pickList = await ComponentPickList.findOne({ wo_id })
      .populate('picked_by', 'FirstName LastName EmployeeID')
      .populate('issued_to', 'FirstName LastName EmployeeID')
      .lean();
    
    if (!pickList) {
      return res.status(404).json({ 
        success: false, 
        message: 'No pick list found for this work order' 
      });
    }
    
    const summary = {
      total_items: pickList.items.length,
      total_required_qty: pickList.items.reduce((sum, i) => sum + i.required_qty, 0),
      total_picked_qty: pickList.items.reduce((sum, i) => sum + i.picked_qty, 0),
      total_shortage_qty: pickList.items.reduce((sum, i) => sum + i.shortage_qty, 0),
      items_pending: pickList.items.filter(i => i.pick_status === 'Pending').length,
      items_picked: pickList.items.filter(i => i.pick_status === 'Picked').length,
      items_short: pickList.items.filter(i => i.pick_status === 'Short').length,
      items_substituted: pickList.items.filter(i => i.pick_status === 'Substituted').length,
      can_issue: pickList.status === 'Fully Picked' || pickList.status === 'Partially Picked',
      sub_assembly_items: pickList.items.filter(i => i.component_type === 'Sub-Assembly').length,
      sub_assembly_shortages: pickList.items.filter(i => i.component_type === 'Sub-Assembly' && i.shortage_qty > 0).length
    };
    
    res.json({
      success: true,
      data: {
        picklist_id: pickList.picklist_id,
        picklist_date: pickList.picklist_date,
        status: pickList.status,
        wo_number: pickList.wo_number,
        assembly_qty: pickList.assembly_qty,
        items: pickList.items,
        summary: summary
      }
    });
  } catch (error) {
    console.error('Get pick list status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// GET SHORTAGE REPORT
// ======================================================
exports.getShortageReport = async (req, res) => {
  try {
    const { warehouse_id, component_type } = req.query;
    
    const filter = { 
      status: { $in: ['Generated', 'Partially Picked'] }
    };
    
    const pickLists = await ComponentPickList.find(filter)
      .populate('wo_id', 'wo_number priority planned_start customer_name wo_type')
      .sort({ createdAt: -1 });
    
    const shortages = [];
    
    for (const pickList of pickLists) {
      for (const item of pickList.items) {
        if (item.shortage_qty > 0) {
          // Filter by component type if specified
          if (component_type && item.component_type !== component_type) {
            continue;
          }
          
          shortages.push({
            picklist_id: pickList.picklist_id,
            picklist_date: pickList.picklist_date,
            wo_number: pickList.wo_number,
            wo_type: pickList.wo_id?.wo_type || 'Assembly',
            wo_priority: pickList.wo_id?.priority || 'Medium',
            customer: pickList.wo_id?.customer_name || '',
            component_part_no: item.component_part_no,
            component_type: item.component_type,
            component_description: item.component_description,
            required_qty: item.required_qty,
            picked_qty: item.picked_qty,
            shortage_qty: item.shortage_qty,
            shortage_percent: ((item.shortage_qty / item.required_qty) * 100).toFixed(1),
            warehouse_id: item.warehouse_id,
            bin_id: item.bin_id,
            remarks: item.remarks
          });
        }
      }
    }
    
    // Sort by priority
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    shortages.sort((a, b) => priorityOrder[a.wo_priority] - priorityOrder[b.wo_priority]);
    
    // Calculate summary statistics
    const summary = {
      total_shortages: shortages.length,
      critical_shortages: shortages.filter(s => s.wo_priority === 'Critical').length,
      sub_assembly_shortages: shortages.filter(s => s.component_type === 'Sub-Assembly').length,
      raw_material_shortages: shortages.filter(s => s.component_type === 'Raw Material').length,
      bought_out_shortages: shortages.filter(s => s.component_type === 'Bought-Out').length,
      total_shortage_value: shortages.reduce((sum, s) => sum + (s.shortage_qty * (s.unit_cost || 0)), 0)
    };
    
    res.json({ 
      success: true, 
      data: { 
        report_date: new Date(),
        summary: summary,
        shortages: shortages 
      } 
    });
  } catch (error) {
    console.error('Get shortage report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// LIST ALL PICK LISTS
// ======================================================
exports.listPickLists = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, wo_id, component_type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (wo_id) filter.wo_id = wo_id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [pickLists, total] = await Promise.all([
      ComponentPickList.find(filter)
        .populate('wo_id', 'wo_number part_no priority wo_type customer_name')
        .populate('picked_by', 'FirstName LastName EmployeeID')
        .populate('issued_to', 'FirstName LastName EmployeeID')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ComponentPickList.countDocuments(filter)
    ]);
    
    // Add summary to each pick list
    const enrichedPickLists = pickLists.map(pl => ({
      ...pl,
      summary: {
        total_items: pl.items?.length || 0,
        total_required_qty: pl.items?.reduce((sum, i) => sum + i.required_qty, 0) || 0,
        total_picked_qty: pl.items?.reduce((sum, i) => sum + i.picked_qty, 0) || 0,
        total_shortage_qty: pl.items?.reduce((sum, i) => sum + i.shortage_qty, 0) || 0,
        can_issue: pl.status === 'Fully Picked' || pl.status === 'Partially Picked'
      }
    }));
    
    res.json({
      success: true,
      data: enrichedPickLists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List pick lists error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// CANCEL PICK LIST
// ======================================================
exports.cancelPickList = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const pickList = await ComponentPickList.findById(id);
    if (!pickList) {
      return res.status(404).json({ success: false, message: 'Pick list not found' });
    }
    
    // Cannot cancel if already issued
    if (pickList.status === 'Issued') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel pick list that has already been issued' 
      });
    }
    
    pickList.status = 'Closed';
    pickList.remarks = pickList.remarks 
      ? `${pickList.remarks} | Cancelled: ${reason || 'No reason provided'}`
      : `Cancelled: ${reason || 'No reason provided'}`;
    
    await pickList.save();
    
    // Update work order if needed
    const workOrder = await WorkOrder.findById(pickList.wo_id);
    if (workOrder && workOrder.component_picklist_id?.toString() === pickList._id.toString()) {
      workOrder.component_picklist_id = null;
      if (workOrder.status === 'Components Kitted') {
        workOrder.status = 'Released';
      }
      await workOrder.save();
    }
    
    res.json({
      success: true,
      message: 'Pick list cancelled successfully',
      data: {
        picklist_id: pickList.picklist_id,
        status: pickList.status,
        cancelled_at: new Date()
      }
    });
  } catch (error) {
    console.error('Cancel pick list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// GENERATE PICK LIST PDF (Optional)
// ======================================================
exports.generatePickListPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pickList = await ComponentPickList.findById(id)
      .populate('wo_id', 'wo_number part_no part_name planned_qty priority customer_name')
      .populate('picked_by', 'FirstName LastName EmployeeID')
      .populate('issued_to', 'FirstName LastName EmployeeID')
      .lean();
    
    if (!pickList) {
      return res.status(404).json({ success: false, message: 'Pick list not found' });
    }
    
    // Return JSON for now (PDF generation can be added later)
    res.json({
      success: true,
      data: {
        picklist_id: pickList.picklist_id,
        picklist_date: pickList.picklist_date,
        wo_number: pickList.wo_number,
        part_no: pickList.wo_id?.part_no,
        part_name: pickList.wo_id?.part_name,
        planned_qty: pickList.wo_id?.planned_qty,
        assembly_qty: pickList.assembly_qty,
        status: pickList.status,
        items: pickList.items.map(item => ({
          component_part_no: item.component_part_no,
          component_description: item.component_description,
          component_type: item.component_type,
          required_qty: item.required_qty,
          picked_qty: item.picked_qty,
          shortage_qty: item.shortage_qty,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          warehouse_id: item.warehouse_id,
          bin_id: item.bin_id,
          batch_no: item.batch_no,
          pick_status: item.pick_status
        })),
        totals: {
          total_required_qty: pickList.items.reduce((sum, i) => sum + i.required_qty, 0),
          total_picked_qty: pickList.items.reduce((sum, i) => sum + i.picked_qty, 0),
          total_shortage_qty: pickList.items.reduce((sum, i) => sum + i.shortage_qty, 0),
          total_cost: pickList.total_cost
        }
      }
    });
  } catch (error) {
    console.error('Generate pick list PDF error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

