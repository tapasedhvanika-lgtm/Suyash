'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// controllers/Production/workOrderController.js
// Phase 05 — BE-019 + BE-020 + Phase 09 Assembly
// Supports both Machining and Assembly Work Orders
// ─────────────────────────────────────────────────────────────────────────────




const mongoose = require('mongoose');
const WorkOrderModule = require('../../models/Production/WorkOrder');
const WorkOrder = WorkOrderModule.WorkOrder || WorkOrderModule;
const JobCosting = WorkOrderModule.JobCosting;
const Bom = require('../../models/BOM/Bom');
const ComponentPickList = require('../../models/Assembly/ComponentPickList');
const TorqueRecord = require('../../models/Assembly/TorqueRecord');
const FunctionalTestRecord = require('../../models/Assembly/FunctionalTestRecord');
const SubAssemblyRegister = require('../../models/Assembly/SubAssemblyRegister');
const getModel = (name) => mongoose.model(name);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Generate Serial Numbers for Assembly Work Order
// ─────────────────────────────────────────────────────────────────────────────
async function generateSerialNumbers(wo, quantity, userId) {
  try {
    // For Assembly WOs with serial_tracking enabled (from WO, not from Item)
    if (wo.wo_type === 'Assembly' && wo.serial_tracking) {
      const Item = getModel('Item');
      const item = await Item.findById(wo.item_id);
      
      // Get prefix from item or use part_no
      const prefix = wo.part_no.substring(0, 3);
      
      // Get last used serial number from database for this item
      const lastWO = await WorkOrder.findOne({
        item_id: wo.item_id,
        serial_numbers_assigned: { $exists: true, $ne: [] }
      }).sort({ createdAt: -1 });
      
      let startNumber = 1;
      if (lastWO && lastWO.serial_numbers_assigned && lastWO.serial_numbers_assigned.length > 0) {
        const lastSerial = lastWO.serial_numbers_assigned[lastWO.serial_numbers_assigned.length - 1];
        const match = lastSerial.match(/\d+$/);
        if (match) {
          startNumber = parseInt(match[0]) + 1;
        }
      }
      
      // Serial number length (default 4)
      const padLength = 4;
      
      // Generate serial numbers
      const serials = [];
      for (let i = 0; i < quantity; i++) {
        const serialNum = `${prefix}${String(startNumber + i).padStart(padLength, '0')}`;
        serials.push(serialNum);
      }
      
      console.log(`[WO] Generated ${serials.length} serial numbers for WO ${wo.wo_number}:`, serials.slice(0, 5));
      return serials;
    }
    
    return [];
  } catch (err) {
    console.error('[WO] generateSerialNumbers error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Check Sub-Assembly Availability (ENHANCED VERSION)
// ─────────────────────────────────────────────────────────────────────────────
async function checkSubAssemblyAvailability(wo_id, bomComponents) {
  try {
    const SubAssemblyRegisterModel = getModel('SubAssemblyRegister');
    const StockLedger = getModel('StockLedger');
    const Warehouse = getModel('Warehouse');
    const shortages = [];

    const fgWarehouse = await Warehouse.findOne({ warehouse_type: 'Finished Goods', is_active: true }).lean();

    for (const comp of bomComponents) {
      const isSubAssembly = comp.component_type === 'Sub-Assembly' || comp.is_phantom === true;
      if (isSubAssembly) {
        let dependency = await SubAssemblyRegisterModel.findOne({ parent_wo_id: wo_id, child_part_no: comp.component_part_no });
        let availableQty = 0;
        let requiredQty = comp.quantity_per * (comp.planned_qty || 1);

        if (dependency) {
          availableQty = dependency.available_qty || 0;
          requiredQty = dependency.required_qty || requiredQty;
        } else {
          const stock = await StockLedger.aggregate([
            { $match: { item_id: comp.component_item_id, warehouse_id: fgWarehouse?._id, quantity: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
          ]);
          availableQty = stock[0]?.total || 0;
        }

        const shortage = Math.max(0, requiredQty - availableQty);
        if (shortage > 0) {
          shortages.push({ part_no: comp.component_part_no, required_qty: requiredQty, available_qty: availableQty, shortage_qty: shortage });
        }
      }
    }
    return shortages;
  } catch (err) {
    console.error('[WO] checkSubAssemblyAvailability error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Activate Next Operation (Sequential Engine Core)
// ─────────────────────────────────────────────────────────────────────────────
function activateNextOperation(wo) {
  // Sort all ops by sequence, find the first that's still Pending
  const pendingOps = wo.operations
    .filter(o => o.status === 'Pending')
    .sort((a, b) => a.op_sequence - b.op_sequence);
 
  if (pendingOps.length === 0) return null;
 
  const nextOp       = pendingOps[0];
  nextOp.status      = 'In Progress';
  nextOp.actual_start = new Date();
 
  return nextOp;
}

// POST /api/work-orders
// Create Work Order (Supports both Machining and Assembly)
// ─────────────────────────────────────────────────────────────────────────────
exports.createWorkOrder = async (req, res) => {
  try {
    const {
      so_id, so_item_id, item_id, bom_id, routing_id,
      planned_qty, planned_start, planned_end, required_by,
      priority = 'Medium',
      wo_type = 'Machining',
      assembly_line,
      serial_tracking = false,
    } = req.body;

    if (!so_id || !item_id || !bom_id || !planned_qty || !planned_start || !planned_end || !required_by) {
      return res.status(400).json({
        success: false,
        message: 'Required: so_id, item_id, bom_id, planned_qty, planned_start, planned_end, required_by',
      });
    }

    // Fetch item to lock drawing_revision
    const Item = getModel('Item');
    const itemDoc = await Item.findById(item_id).lean();
    if (!itemDoc) return res.status(404).json({ success: false, message: 'Item not found' });

    // Fetch BOM
    const BOM = getModel('Bom');
    const bom = await BOM.findById(bom_id).lean();
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });

    // ========== ASSEMBLY LINE VALIDATION (FIXED) ==========
    let assemblyLineId = null;
    
    // Only validate assembly_line if wo_type is Assembly AND assembly_line is provided
    if (wo_type === 'Assembly' && assembly_line && assembly_line !== '') {
      const AssemblyLine = getModel('AssemblyLine');
      
      // Check if assembly_line is an ObjectId or line_code
      let query = {};
      if (assembly_line.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: assembly_line, is_active: true };
      } else {
        query = { line_code: assembly_line, is_active: true };
      }
      
      const assemblyLineDoc = await AssemblyLine.findOne(query);
      
      if (!assemblyLineDoc) {
        return res.status(404).json({
          success: false,
          message: 'Assembly line not found or inactive'
        });
      }
      
      // Store as ObjectId (not string)
      assemblyLineId = assemblyLineDoc._id;
    }
    // ================================================================

    // ⭐ Keep first file's approach: NO auto-populate operations from routing
    // Store routing_id but operations remain empty or use default Assembly ops
    let operations = [];
    
    // ================================================================

    // Fetch SO details
    const SalesOrder = getModel('SalesOrder');
    const so = await SalesOrder.findById(so_id).lean();

    // Build work order data object
    const woData = {
      so_id,
      so_item_id:       so_item_id || new mongoose.Types.ObjectId(),
      so_number:        so ? so.so_number    : '',
      item_id,
      part_no:          itemDoc.part_no,
      part_name:        itemDoc.part_description || itemDoc.part_name || '',
      drawing_no:       itemDoc.drawing_no       || '',
      drawing_revision: itemDoc.revision_no      || '0',
      bom_id,
      bom_version:      bom.bom_version           || '',
      routing_id:       routing_id                || null,
      planned_qty,
      planned_start:    new Date(planned_start),
      planned_end:      new Date(planned_end),
      required_by:      new Date(required_by),
      priority,
      wo_type,
      serial_tracking,
      customer_id:      so ? so.customer_id       : null,
      customer_name:    so ? so.customer_name      : '',
      mrp_run_id:       req.body.mrp_run_id        || null,
      operations,
      status:           'Planned',
      created_by:       req.user._id,
    };

    // CRITICAL FIX: Only set assembly_line if it's not null, otherwise omit it
    if (assemblyLineId !== null) {
      woData.assembly_line = assemblyLineId;
    } else if (wo_type === 'Assembly' && (!assembly_line || assembly_line === '')) {
      // For Assembly WOs, assembly_line is optional but if not provided, don't set the field
      // or set to null (MongoDB will ignore null for ObjectId field)
      woData.assembly_line = null;
    }
    // For Machining WOs, don't set assembly_line at all

    const wo = await WorkOrder.create(woData);

    if (wo_type === 'Assembly') {
      await checkSubAssemblyDependencies(wo, req.user._id);
    }

    return res.status(201).json({
      success: true,
      message: `${wo_type} Work Order created`,
      data:    wo,
    });
  } catch (err) {
    console.error('[WO] createWorkOrder:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
  
// ─────────────────────────────────────────────────────────────────────────────
// Helper: Check Sub-Assembly Dependencies
// ─────────────────────────────────────────────────────────────────────────────
async function checkSubAssemblyDependencies(wo, userId) {
  try {
    const bom = await Bom.findById(wo.bom_id).lean();
    if (!bom || !bom.components) return;

    const StockLedger = getModel('StockLedger');

    for (const comp of bom.components) {
      if (comp.is_phantom || comp.component_type === 'Sub-Assembly') {
        const childWO = await WorkOrder.findOne({
          item_id: comp.component_item_id,
          wo_type: 'SubAssembly',
          status:  { $in: ['Completed', 'Released', 'In Progress'] },
        });

        if (childWO) {
          const stock = await StockLedger.findOne({ item_id: comp.component_item_id });
          const availableQty = stock ? stock.quantity : 0;
          const requiredQty  = comp.quantity_per * wo.planned_qty;

          await SubAssemblyRegister.create({
            parent_wo_id:            wo._id,
            parent_wo_number:        wo.wo_number,
            parent_item_id:          wo.item_id,
            child_wo_id:             childWO._id,
            child_wo_number:         childWO.wo_number,
            child_item_id:           comp.component_item_id,
            child_part_no:           comp.component_part_no,
            required_qty:            requiredQty,
            available_qty:           availableQty,
            child_wo_status:         childWO.status,
            child_wo_completed_qty:  childWO.completed_qty || 0,
            created_by:              userId,
          });
        }
      }
    }
  } catch (err) {
    console.error('[WO] checkSubAssemblyDependencies error:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Generate Pick List for Assembly WO
// ─────────────────────────────────────────────────────────────────────────────
async function generatePickListForWO(wo, userId) {
  try {
    const bom = await Bom.findById(wo.bom_id).lean();
    if (!bom) return;

    const StockLedger = getModel('StockLedger');
    const items = [];

    for (const comp of bom.components) {
      let unitCost    = 0;
      let warehouseId = '';
      let binId       = '';
      let batchNo     = '';

      const stock = await StockLedger.findOne({
        item_id:  comp.component_item_id,
        quantity: { $gt: 0 },
      }).sort({ receipt_date: 1 });

      if (stock) {
        unitCost    = stock.unit_cost     || 0;
        warehouseId = stock.warehouse_id;
        binId       = stock.bin_id        || '';
        batchNo     = stock.batch_no      || '';
      }

      const requiredQty = comp.quantity_per * wo.planned_qty * (1 + (comp.scrap_percent || 0) / 100);

      items.push({
        bom_line_id:           comp._id,
        component_item_id:     comp.component_item_id,
        component_part_no:     comp.component_part_no,
        component_description: comp.component_desc,
        component_type:        comp.is_subcontract ? 'Bought-Out' : (comp.is_phantom ? 'Sub-Assembly' : 'Raw Material'),
        bom_qty_per:           comp.quantity_per,
        required_qty:          requiredQty,
        warehouse_id:          warehouseId,
        bin_id:                binId,
        batch_no:              batchNo,
        unit_cost:             unitCost,
        pick_status:           'Pending',
      });
    }

    const picklist = new ComponentPickList({
      wo_id:        wo._id,
      wo_number:    wo.wo_number,
      assembly_qty: wo.planned_qty,
      items:        items,
      created_by:   userId,
    });

    await picklist.save();
    wo.component_picklist_id = picklist._id;
    await wo.save();
  } catch (err) {
    console.error('[WO] generatePickListForWO error:', err);
  }
}

// GET /api/work-orders - LIST (UPDATED to populate assembly line)
exports.listWorkOrders = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      status, item_id, customer_id, priority,
      from, to, part_no,
      wo_type,
    } = req.query;

    const filter = {};
    if (status) filter.status = { $in: status.split(',') };
    if (item_id) filter.item_id = item_id;
    if (customer_id) filter.customer_id = customer_id;
    if (priority) filter.priority = priority;
    if (part_no) filter.part_no = { $regex: part_no, $options: 'i' };
    if (wo_type) filter.wo_type = wo_type;
    if (from || to) {
      filter.planned_start = {};
      if (from) filter.planned_start.$gte = new Date(from);
      if (to) filter.planned_start.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      WorkOrder.find(filter)
        .select('-labour_bookings -material_issues')
        .populate('item_id', 'part_no part_description')
        .populate('customer_id', 'company_name')
        .populate('assembly_line', 'line_code line_name')  // ← ADD THIS
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      WorkOrder.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[WO] listWorkOrders:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWorkOrderById = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id)
      .populate('item_id',     'part_no part_description unit')
      .populate('so_id',       'so_number customer_name grand_total status')
      .populate('bom_id',      'bom_id bom_version')
      .populate('routing_id',  'routing_id routing_name')
      .populate('customer_id', 'company_name')
      .populate('assembly_line', 'line_code line_name line_type work_centre')  // ← ADD THIS LINE
      .populate('labour_bookings.employee_id', 'name employee_id')   // ← Keep employee_id
      .populate('operations.employee_id',      'name employee_id')   // ← Keep employee_id
      .populate('operations.machine_id',       'machine_name machine_code')
      .lean({ virtuals: true });

    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });

    // Assembly data remains the same
    let assemblyData = {};
    if (wo.wo_type === 'Assembly') {
      const [picklist, torqueRecords, testRecords, subAssemblies] = await Promise.all([
        ComponentPickList.findOne({ wo_id: wo._id }).sort({ createdAt: -1 }).lean(),
        TorqueRecord.find({ wo_id: wo._id }).limit(10).lean(),
        FunctionalTestRecord.find({ wo_id: wo._id }).limit(10).lean(),
        SubAssemblyRegister.find({ parent_wo_id: wo._id }).lean(),
      ]);

      assemblyData = {
        picklist:         picklist || null,
        torque_records:   torqueRecords,
        functional_tests: testRecords,
        sub_assemblies:   subAssemblies,
        has_picklist:     !!picklist,
        torque_count:     torqueRecords.length,
        test_count:       testRecords.length,
      };
    }

    return res.json({
      success:       true,
      data:          wo,
      assembly_data: assemblyData,
    });
  } catch (err) {
    console.error('[WO] getWorkOrderById:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/by-item/:part_no
// All WOs for a specific part
// ─────────────────────────────────────────────────────────────────────────────
exports.getWorkOrdersByPartNo = async (req, res) => {
  try {
    const wos = await WorkOrder.find({ part_no: req.params.part_no.toUpperCase() })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: wos });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/work-orders/:id
// Update status, priority, hold_reason, assembly_line, internal_remarks,
// and operator assignments
// ─────────────────────────────────────────────────────────────────────────────
exports.updateWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });

    const { status, priority, hold_reason, internal_remarks, assembly_line } = req.body;

    // Status transition validation
    if (status && status !== wo.status) {
      if (!WorkOrder.isValidTransition(wo.status, status)) {
        return res.status(400).json({
          success:  false,
          message:  `Invalid transition: ${wo.status} → ${status}`,
          allowed:  WorkOrder.validNextStatuses(wo.status),
        });
      }
      wo.status = status;

      // Guard: picklist must be issued before moving to Components Kitted
      if (status === 'Components Kitted' && wo.wo_type === 'Assembly') {
        const picklist = await ComponentPickList.findOne({ wo_id: wo._id });
        if (picklist && picklist.status !== 'Issued') {
          return res.status(400).json({
            success: false,
            message: 'Components must be issued before setting status to Components Kitted',
          });
        }
      }
    }

    if (priority)         wo.priority         = priority;
    if (hold_reason)      wo.hold_reason       = hold_reason;
    if (assembly_line)    wo.assembly_line     = assembly_line;
    if (internal_remarks) wo.internal_remarks  = internal_remarks;

    wo.updated_by = req.user._id;
    await wo.save();

    return res.json({ success: true, message: 'Work Order updated', data: wo });
  } catch (err) {
    console.error('[WO] updateWorkOrder:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/release - UPDATED WITH SERIAL NUMBER GENERATION
// ─────────────────────────────────────────────────────────────────────────────
exports.releaseWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });
    if (wo.status !== 'Planned') {
      return res.status(400).json({
        success: false,
        message: `WO must be in Planned status to release. Current: ${wo.status}`,
      });
    }

    const BOM = getModel('Bom');
    const bom = await BOM.findById(wo.bom_id).lean();
    if (!bom || !bom.components || bom.components.length === 0) {
      return res.status(400).json({ success: false, message: 'BOM has no components' });
    }

    const StockLedger = getModel('StockLedger');
    const StockReservation = getModel('StockReservation');

    const reservedComponents = [];
    const shortages = [];

    if (wo.wo_type === 'Assembly') {
      await generatePickListForWO(wo, req.user._id);
      
      const subAssemblyShortages = await checkSubAssemblyAvailability(wo._id, bom.components);
      if (subAssemblyShortages.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot release WO - Sub-assembly shortages detected',
          shortages: subAssemblyShortages,
          action_required: 'Complete the following sub-assembly Work Orders first',
          data: { shortages: subAssemblyShortages }
        });
      }
    }

    for (const comp of bom.components) {
      if (comp.is_phantom) continue;

      const requiredQty = comp.quantity_per * wo.planned_qty * (1 + (comp.scrap_percent || 0) / 100);

      const availableStock = await StockLedger.find({
        item_id: comp.component_item_id,
        quantity: { $gt: 0 },
      }).populate('warehouse_id').sort({ receipt_date: 1 });

      const totalAvailable = availableStock.reduce((sum, s) => sum + (s.quantity - s.reserved_qty), 0);

      if (totalAvailable < requiredQty) {
        shortages.push({
          part_no: comp.component_part_no,
          available: totalAvailable,
          required: requiredQty,
          shortage: requiredQty - totalAvailable,
          unit: comp.unit,
        });
        continue;
      }

      let remainingToReserve = requiredQty;
      const componentReservations = [];

      for (const stock of availableStock) {
        if (remainingToReserve <= 0) break;

        const availableFromBatch = stock.quantity - stock.reserved_qty;
        if (availableFromBatch <= 0) continue;

        const reserveFromBatch = Math.min(availableFromBatch, remainingToReserve);

        const reservation = new StockReservation({
          item_id: comp.component_item_id,
          warehouse_id: stock.warehouse_id._id,
          batch_no: stock.batch_no,
          reserved_qty: reserveFromBatch,
          ref_type: 'Work Order',
          ref_id: wo._id,
          ref_number: wo.wo_number,
          reserved_by: req.user._id,
          reserved_at: new Date(),
          status: 'Active',
          remarks: `Reserved for WO ${wo.wo_number}`,
        });

        await reservation.save();
        componentReservations.push(reservation);

        await StockLedger.updateOne(
          { _id: stock._id },
          { $inc: { reserved_qty: reserveFromBatch } }
        );

        remainingToReserve -= reserveFromBatch;
      }

      reservedComponents.push({
        part_no: comp.component_part_no,
        required_qty: requiredQty,
        reserved_qty: requiredQty - remainingToReserve,
        unit: comp.unit,
        reservations: componentReservations.map(r => ({
          reservation_id: r.reservation_id,
          batch_no: r.batch_no,
          reserved_qty: r.reserved_qty,
        })),
      });
    }

    if (shortages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for some components',
        shortages: shortages,
        action_required: 'Create purchase requisitions for shortage quantities',
      });
    }

    // ========== GENERATE SERIAL NUMBERS ON RELEASE ==========
    let generatedSerials = [];
    if (wo.serial_tracking && wo.planned_qty > 0) {
      generatedSerials = await generateSerialNumbers(wo, wo.planned_qty, req.user._id);
      wo.serial_numbers_assigned = generatedSerials;
    }
    // ========================================================

    wo.status = 'Released';
    wo.updated_by = req.user._id;
    await wo.save();

    return res.json({
      success: true,
      message: 'Work Order released. Stock reserved for BOM components.',
      data: {
        wo_number: wo.wo_number,
        wo_type: wo.wo_type,
        status: wo.status,
        reserved_components: reservedComponents,
        total_components_reserved: reservedComponents.length,
        serial_numbers_generated: generatedSerials.length,
        serial_numbers: generatedSerials
      },
    });
  } catch (err) {
    console.error('[WO] releaseWorkOrder:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/hold
// Put WO On Hold — requires hold_reason
// ─────────────────────────────────────────────────────────────────────────────
exports.holdWorkOrder = async (req, res) => {
  try {
    const { hold_reason } = req.body;
    if (!hold_reason || !hold_reason.trim()) {
      return res.status(400).json({ success: false, message: 'hold_reason is required' });
    }

    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });

    if (!WorkOrder.isValidTransition(wo.status, 'On Hold')) {
      return res.status(400).json({
        success: false,
        message: `Cannot put ${wo.status} WO on hold`,
      });
    }

    wo.status     = 'On Hold';
    wo.hold_reason = hold_reason;
    wo.updated_by = req.user._id;
    await wo.save();

    return res.json({
      success: true,
      message: 'Work Order put On Hold',
      data:    { wo_number: wo.wo_number, hold_reason },
    });
  } catch (err) {
    console.error('[WO] holdWorkOrder:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/cancel
// Cancel Work Order — Admin / Manager only
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);

    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // Allowed statuses for cancellation
    const cancellableStatuses = ['Planned', 'Released', 'On Hold'];
    if (!cancellableStatuses.includes(wo.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel WO with status: ${wo.status}. Only Planned, Released, or On Hold WOs can be cancelled.`,
      });
    }

    const { cancel_reason } = req.body;
    if (!cancel_reason || !cancel_reason.trim()) {
      return res.status(400).json({ success: false, message: 'cancel_reason is required' });
    }

    // If WO was Released, release stock reservations
    if (wo.status === 'Released') {
      try {
        const StockReservation = getModel('StockReservation');
        await StockReservation.updateMany(
          { ref_id: wo._id, status: 'Active' },
          { $set: { status: 'Cancelled', cancelled_at: new Date() } }
        );
        console.log(`[WO] Cancelled stock reservations for WO ${wo.wo_number}`);
      } catch (err) {
        console.warn('[WO] Could not cancel stock reservations:', err.message);
      }
    }

    wo.status     = 'Cancelled';
    wo.hold_reason = `CANCELLED: ${cancel_reason}`;
    wo.updated_by = req.user._id;
    await wo.save();

    res.json({
      success: true,
      message: 'Work Order cancelled successfully',
      data: {
        wo_number:    wo.wo_number,
        status:       wo.status,
        cancel_reason,
        cancelled_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Cancel Work Order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/resume
// Resume Work Order from On Hold — Admin / Manager only
// ─────────────────────────────────────────────────────────────────────────────
exports.resumeWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);

    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    if (wo.status !== 'On Hold') {
      return res.status(400).json({
        success: false,
        message: `Cannot resume WO with status: ${wo.status}. Only On Hold WOs can be resumed.`,
      });
    }

    const { resolution_notes } = req.body;

    // Restore previous status (usually In Progress or Released)
    wo.status     = wo.status_before_hold || 'In Progress';
    wo.hold_reason = resolution_notes
      ? `RESOLVED: ${resolution_notes} (was: ${wo.hold_reason})`
      : '';
    wo.updated_by = req.user._id;
    await wo.save();

    res.json({
      success: true,
      message: 'Work Order resumed successfully',
      data: {
        wo_number:   wo.wo_number,
        status:      wo.status,
        resolved_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Resume Work Order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/operations/add
//
// Add one or more operations to a Work Order.
//
// Rules:
//  - WO must be in Planned or Released status (cannot add ops once In Progress)
//  - Each op needs op_sequence, operation_id, work_centre (minimum)
//  - op_sequence must be unique per WO (no duplicate seq numbers allowed)
//  - After adding, ops are always stored sorted by op_sequence
//  - If WO is already Released (but not yet In Progress), the lowest-seq
//    Pending op is auto-activated to In Progress immediately
//  - Operator skill validation: if required_skill provided and employee_id
//    provided, checks employee skill codes (logs override if missing)
// ─────────────────────────────────────────────────────────────────────────────
exports.addOperations = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
 
    // ── Guard: can only add operations before production starts ──────────────
    const allowedStatuses = ['Planned', 'Released'];
    if (!allowedStatuses.includes(wo.status)) {
      return res.status(400).json({
        success: false,
        message: `Operations can only be added when WO is Planned or Released. Current status: ${wo.status}`,
        allowed_statuses: allowedStatuses,
      });
    }
 
    const { operations: incomingOps, routing_id } = req.body;
 
    if (!incomingOps || !Array.isArray(incomingOps) || incomingOps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'operations array is required and must contain at least one operation',
        example: {
          routing_id: "optional-routing-id",
          operations: [
            {
              op_sequence: 10,
              operation_id: "process-object-id",  // ← Required! Fetches name from Process Master
              work_centre: "Press Shop",
              machine_id: "optional",
              employee_id: "optional",
              required_skill: "PRESS-OPS",
              planned_setup_min: 15,
              planned_run_min: 1.5,
              planned_qty: 0,
              is_subcontract: false,
              subcontract_vendor: "optional",
              planned_start: "2026-04-15",
              // NEW: Assembly-specific flags
              requires_torque_recording: false,
              requires_functional_test: false,
              expected_joints: []
            },
          ],
        },
      });
    }
 
    // ── Validate each incoming op has required fields ────────────────────────
    const missingFields = [];
    for (let i = 0; i < incomingOps.length; i++) {
      const op = incomingOps[i];
      if (!op.op_sequence)    missingFields.push(`operations[${i}].op_sequence`);
      if (!op.operation_id)   missingFields.push(`operations[${i}].operation_id`);
      if (!op.work_centre)    missingFields.push(`operations[${i}].work_centre`);
    }
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in operations',
        missing: missingFields,
      });
    }
 
    // ── Fetch Process Master details for each operation_id ────────────────────
    const ProcessMaster = getModel('Process');
    const operationIds = [...new Set(incomingOps.map(op => op.operation_id))];
    const processes = await ProcessMaster.find({ _id: { $in: operationIds }, is_active: true }).lean();
    
    const processMap = new Map();
    processes.forEach(p => {
      processMap.set(p._id.toString(), p);
    });
 
    // Check if all operation_ids exist
    const missingOps = operationIds.filter(id => !processMap.has(id.toString()));
    if (missingOps.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some operation_ids not found in Process Master',
        missing_operation_ids: missingOps,
      });
    }
 
    // ── Check for duplicate op_sequence and REPLACE existing ones ──
    const existingSeqs = wo.operations.map(o => o.op_sequence);
    const incomingSeqs = incomingOps.map(o => o.op_sequence);

    // Helper to find next available sequence (multiples of 10)
    function getNextAvailableSequence(existingSeqs) {
      let nextSeq = 10;
      const sortedSeqs = [...existingSeqs].sort((a, b) => a - b);
      for (let i = 0; i < sortedSeqs.length; i++) {
        if (sortedSeqs[i] === nextSeq) {
          nextSeq += 10;
        } else if (sortedSeqs[i] > nextSeq) {
          break;
        }
      }
      return nextSeq;
    }

    const duplicatesWithExisting = incomingSeqs.filter(s => existingSeqs.includes(s));
    if (duplicatesWithExisting.length > 0) {
      const nextAvailable = getNextAvailableSequence(existingSeqs);
      return res.status(400).json({
        success: false,
        message: `❌ Cannot add operation: Sequence ${duplicatesWithExisting.join(', ')} already exists on this Work Order.`,
        suggestion: `Please use a different sequence number.`,
        next_available_sequence: nextAvailable,
        existing_sequences: existingSeqs.sort((a, b) => a - b),
        hint: `Current sequences in use: ${existingSeqs.sort((a, b) => a - b).join(', ')}. Try sequence ${nextAvailable} or higher.`
      });
    }

    const duplicatesWithinRequest = incomingSeqs.filter(
      (s, idx) => incomingSeqs.indexOf(s) !== idx
    );
    if (duplicatesWithinRequest.length > 0) {
      return res.status(400).json({
        success: false,
        message: `❌ Duplicate op_sequence values within your request: ${[...new Set(duplicatesWithinRequest)].join(', ')}`,
        suggestion: `Each operation in the request must have a unique sequence number.`,
      });
    }
 
    // ── Process each op: fetch name from Process Master, skill check ─────────
    const addedOps = [];
    const skillWarnings = [];
 
    for (const opData of incomingOps) {
      const process = processMap.get(opData.operation_id.toString());
      let skillOverride = false;
 
      // Auto-fetch operation_name from Process Master
      const operationName = process.process_name || process.name || 'Unknown Operation';
 
      // Skill validation if both operator and required_skill are provided
      if (opData.employee_id && opData.required_skill) {
        try {
          const Employee = getModel('Employee');
          const employee = await Employee.findById(opData.employee_id).lean();
          if (employee) {
            const hasSkill = (employee.skill_codes || []).includes(opData.required_skill);
            if (!hasSkill) {
              skillOverride = true;
              skillWarnings.push({
                op_sequence:     opData.op_sequence,
                operation_name:  operationName,
                employee_id:     opData.employee_id,
                required_skill:  opData.required_skill,
                message:         `Operator lacks required skill "${opData.required_skill}" — skill override logged`,
              });
              console.warn(
                `[WO] Skill override on add: employee ${opData.employee_id} lacks ` +
                `"${opData.required_skill}" for op ${opData.op_sequence} on WO ${wo.wo_number}`
              );
            }
          }
        } catch (skillErr) {
          console.warn('[WO] addOperations skill check error (non-fatal):', skillErr.message);
        }
      }
 
      // Build the new operation sub-document with torque/test flags
      const newOp = {
        op_sequence:        opData.op_sequence,
        operation_name:     operationName,
        operation_id:       opData.operation_id,
        work_centre:        opData.work_centre,
        machine_id:         opData.machine_id         || null,
        employee_id:        opData.employee_id        || null,  // ← KEEP employee_id
        required_skill:     opData.required_skill     || process.required_skill || '',
        skill_override:     skillOverride,
        skill_override_by:  skillOverride ? req.user._id : null,
        is_subcontract:     opData.is_subcontract     || false,
        subcontract_vendor: opData.subcontract_vendor  || null,
        planned_qty:        opData.planned_qty        || wo.planned_qty,
        planned_setup_min:  opData.planned_setup_min  || process.planned_setup_min || 0,
        planned_run_min:    opData.planned_run_min    || process.planned_run_min || 0,
        planned_start:      opData.planned_start ? new Date(opData.planned_start) : null,
        status:             'Pending',
        output_qty:         0,
        rejection_qty:      0,
        actual_setup_min:   0,
        actual_run_min:     0,
        actual_start:       null,
        actual_end:         null,
        // ========== ADD TORQUE/TEST FLAGS (from second file) ==========
        requires_torque_recording: opData.requires_torque_recording || false,
        requires_functional_test:  opData.requires_functional_test || false,
        expected_joints:           opData.expected_joints || [],
        // ================================================================
      };
 
      wo.operations.push(newOp);
      addedOps.push(newOp);
    }
 
    // ── Sort the entire operations array by op_sequence ascending ────────────
    wo.operations.sort((a, b) => a.op_sequence - b.op_sequence);
 
    // ── Auto-activate: if WO is Released, activate the lowest Pending op ─────
    // ⚠️ KEEP THIS COMMENTED OUT LOGIC from first file
    let autoActivated = null;
    // const anyInProgress = wo.operations.some(o => o.status === 'In Progress');
 
    // if (wo.status === 'Released' && !anyInProgress) {
    //   autoActivated = activateNextOperation(wo);
    //   if (autoActivated) {
    //     wo.status = 'In Progress';
    //     wo.actual_start = wo.actual_start || new Date();
    //   }
    // }
 
    wo.updated_by = req.user._id;
    await wo.save();
 
    return res.status(201).json({
      success: true,
      message: `${addedOps.length} operation(s) added to WO ${wo.wo_number}`,
      data: {
        wo_number:           wo.wo_number,
        wo_status:           wo.status,
        routing_id:          routing_id || wo.routing_id,
        operations_added:    addedOps.length,
        total_operations:    wo.operations.length,
        auto_activated_op:   autoActivated
          ? { op_sequence: autoActivated.op_sequence, operation_name: autoActivated.operation_name }
          : null,
        skill_warnings:      skillWarnings.length > 0 ? skillWarnings : undefined,
        operations: wo.operations.map(o => ({
          op_sequence:    o.op_sequence,
          operation_id:   o.operation_id,
          operation_name: o.operation_name,
          work_centre:    o.work_centre,
          planned_qty:    o.planned_qty,
          status:         o.status,
          actual_start:   o.actual_start,
          actual_end:     o.actual_end,
          // Include torque/test flags in response
          requires_torque_recording: o.requires_torque_recording || false,
          requires_functional_test:  o.requires_functional_test || false,
          expected_joints:           o.expected_joints || [],
        })),
      },
    });
  } catch (err) {
    console.error('[WO] addOperations:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/work-orders/:id/operations/:seq/complete
//
// Manually complete the currently In Progress operation.
//
// Sequential enforcement:
//  - ONLY the operation that is currently "In Progress" can be completed
//  - The requested :seq MUST match the In Progress operation's sequence
//  - After marking complete: next Pending op auto-advances to In Progress
//  - If no more Pending ops remain → WO moves to Partially Completed
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/work-orders/:id/operations/:seq/complete - UPDATED WITH VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
exports.completeOperation = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });
 
    const seq = parseInt(req.params.seq, 10);
    const op = wo.operations.find(o => o.op_sequence === seq);
 
    if (!op) {
      return res.status(404).json({
        success: false,
        message: `Operation with sequence ${seq} not found on this Work Order`,
      });
    }
 
    // ========== TORQUE VALIDATION FOR ASSEMBLY ==========
    if (op.requires_torque_recording && wo.wo_type === 'Assembly') {
      const TorqueRecordModel = mongoose.model('TorqueRecord');
      const torqueRecords = await TorqueRecordModel.find({ 
        wo_id: wo._id, 
        op_sequence: seq 
      });
      
      if (torqueRecords.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot complete operation "${op.operation_name}" - No torque records found. Please record torque values for all joints first.`,
          required_action: 'Record torque values before completing this operation',
          help: 'Use POST /api/torque-records to record torque values'
        });
      }
      
      if (op.expected_joints && op.expected_joints.length > 0) {
        const recordedJoints = torqueRecords.map(t => t.joint_reference);
        const missingJoints = op.expected_joints.filter(j => !recordedJoints.includes(j));
        
        if (missingJoints.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing torque records for joints: ${missingJoints.join(', ')}`,
            missing_joints: missingJoints,
            recorded_joints: recordedJoints
          });
        }
      }
      
      wo.torque_records_count = torqueRecords.length;
    }
    // ========================================================
 
    if (op.status !== 'In Progress') {
      const activeOp = wo.operations.find(o => o.status === 'In Progress');
      return res.status(400).json({
        success: false,
        message: op.status === 'Pending'
          ? `Operation ${seq} has not started yet. Operations must complete in sequence.`
          : `Operation ${seq} is already ${op.status} and cannot be completed again.`,
        currently_active_op: activeOp ? { op_sequence: activeOp.op_sequence, operation_name: activeOp.operation_name } : null,
      });
    }
 
    const {
      output_qty = 0,
      rejection_qty = 0,
      rejection_reason = '',
      actual_setup_min = 0,
      actual_run_min = 0,
    } = req.body;
 
    if (parseFloat(output_qty) + parseFloat(rejection_qty) > op.planned_qty) {
      return res.status(400).json({
        success: false,
        message: `output_qty (${output_qty}) + rejection_qty (${rejection_qty}) exceeds planned_qty (${op.planned_qty})`,
      });
    }
 
    op.output_qty = parseFloat(output_qty);
    op.rejection_qty = parseFloat(rejection_qty);
    op.rejection_reason = rejection_reason;
    op.actual_setup_min = parseFloat(actual_setup_min);
    op.actual_run_min = parseFloat(actual_run_min);
    op.actual_end = new Date();
    op.status = 'Completed';
 
    const AQL_THRESHOLD = parseFloat(process.env.AQL_REJECTION_PERCENT || '5');
    if (op.planned_qty > 0) {
      const rejectPct = (parseFloat(rejection_qty) / op.planned_qty) * 100;
      if (rejectPct > AQL_THRESHOLD) {
        wo.status = 'On Hold';
        wo.hold_reason = `Rejection ${rejectPct.toFixed(1)}% at op ${seq} ("${op.operation_name}") exceeds AQL ${AQL_THRESHOLD}%. NCR required.`;
        wo.updated_by = req.user._id;
        await wo.save();
 
        return res.json({
          success: true,
          message: `Operation ${seq} completed but WO placed On Hold — rejection ${rejectPct.toFixed(1)}% exceeds AQL ${AQL_THRESHOLD}%. Raise NCR.`,
          data: {
            op_sequence: seq,
            operation_name: op.operation_name,
            status: 'Completed',
            rejection_percent: +rejectPct.toFixed(1),
            wo_status: 'On Hold',
            ncr_required: true,
          },
        });
      }
    }
 
    const nextPendingOps = wo.operations
      .filter(o => o.status === 'Pending')
      .sort((a, b) => a.op_sequence - b.op_sequence);
 
    const nextOp = nextPendingOps.length > 0 ? nextPendingOps[0] : null;
    if (nextOp) nextOp.planned_qty = op.output_qty;
 
    const activatedOp = activateNextOperation(wo);
 
    const allDone = wo.operations.every(o => o.status === 'Completed' || o.status === 'Skipped');
    if (allDone) wo.status = 'Partially Completed';
 
    wo.updated_by = req.user._id;
    await wo.save();
 
    return res.json({
      success: true,
      message: activatedOp
        ? `Operation ${seq} completed. Operation ${activatedOp.op_sequence} ("${activatedOp.operation_name}") auto-started.`
        : `Operation ${seq} completed. All operations finished — WO is Partially Completed.`,
      data: {
        completed_op: {
          op_sequence: seq,
          operation_name: op.operation_name,
          status: 'Completed',
          output_qty: op.output_qty,
          rejection_qty: op.rejection_qty,
        },
        next_activated_op: activatedOp ? {
          op_sequence: activatedOp.op_sequence,
          operation_name: activatedOp.operation_name,
          status: 'In Progress',
          actual_start: activatedOp.actual_start,
        } : null,
        all_operations_done: allDone,
        wo_status: wo.status,
        torque_validation: op.requires_torque_recording ? {
          required: true,
          records_found: wo.torque_records_count
        } : undefined
      },
    });
  } catch (err) {
    console.error('[WO] completeOperation:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/labour
// Add labour booking — BE-020
// ─────────────────────────────────────────────────────────────────────────────
exports.addLabourBooking = async (req, res) => {
  try {
    const { employee_id, operation_seq, hours_booked, start_time, end_time } = req.body;

    if (!employee_id || !operation_seq || !hours_booked || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Required: employee_id, operation_seq, hours_booked, start_time, end_time',
      });
    }
    if (hours_booked > 24) {
      return res.status(400).json({ success: false, message: 'hours_booked cannot exceed 24 per booking' });
    }

    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });

    // Validate total hours per operator per day ≤ 24
    const bookingDate  = new Date(start_time).toDateString();
    const sameDayHours = wo.labour_bookings
      .filter(b =>
        String(b.employee_id) === String(employee_id) &&
        new Date(b.start_time).toDateString() === bookingDate
      )
      .reduce((s, b) => s + b.hours_booked, 0);

    if (sameDayHours + hours_booked > 24) {
      return res.status(400).json({
        success: false,
        message: `Total hours for operator ${employee_id} on ${bookingDate} would exceed 24h. Current: ${sameDayHours}h`,
      });
    }

    // Fetch hourly_rate from Employee Master
    const Employee = getModel('Employee');
    const employee  = await Employee.findById(employee_id).lean();
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const hourlyRate = employee.hourly_rate || employee.daily_rate / 8 || 0;
    const totalCost  = +(hours_booked * hourlyRate).toFixed(2);

    wo.labour_bookings.push({
      employee_id,
      operation_seq,
      hours_booked,
      start_time:        new Date(start_time),
      end_time:          new Date(end_time),
      hourly_rate:       hourlyRate,
      total_labour_cost: totalCost,
      booked_by:         req.user._id,
    });

    // Update accumulated process cost
    wo.actual_process_cost = +wo.labour_bookings
      .reduce((s, b) => s + (b.total_labour_cost || 0), 0)
      .toFixed(2);

    wo.updated_by = req.user._id;
    await wo.save();

    return res.status(201).json({
      success: true,
      message: 'Labour booking added',
      data: {
        hours_booked,
        hourly_rate:              hourlyRate,
        total_labour_cost:        totalCost,
        accumulated_process_cost: wo.actual_process_cost,
      },
    });
  } catch (err) {
    console.error('[WO] addLabourBooking:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


 
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/complete - WITH COMPLETED STATUS CHECK
// ─────────────────────────────────────────────────────────────────────────────
exports.completeWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });
 
    // ========== CHECK IF ALREADY COMPLETED ==========
    if (wo.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Work Order ${wo.wo_number} is already completed.`,
        data: {
          wo_number: wo.wo_number,
          status: wo.status,
          completed_date: wo.actual_end,
          completed_qty: wo.completed_qty
        }
      });
    }
    // ================================================
 
    const incompleteOps = wo.operations.filter(o => !['Completed', 'Skipped'].includes(o.status));
    if (incompleteOps.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All operations must be Completed before closing WO',
        incomplete: incompleteOps.map(o => ({ seq: o.op_sequence, name: o.operation_name, status: o.status })),
      });
    }
 
    // ========== FUNCTIONAL TEST VALIDATION FOR ASSEMBLY ==========
    if (wo.wo_type === 'Assembly') {
      const FunctionalTestRecordModel = mongoose.model('FunctionalTestRecord');
      const functionalTests = await FunctionalTestRecordModel.find({ wo_id: wo._id });
      
      const hasTestRequirement = wo.operations.some(op => op.requires_functional_test === true);
      
      if (hasTestRequirement && functionalTests.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete Assembly Work Order - No functional tests performed',
          required_action: 'Perform functional tests before completing WO',
          help: 'Use POST /api/functional-tests to record test results'
        });
      }
      
      if (functionalTests.length > 0) {
        const allTestsPassed = functionalTests.every(t => t.overall_result === 'Passed');
        const anyTestFailed = functionalTests.some(t => t.overall_result === 'Failed');
        
        if (anyTestFailed) {
          return res.status(400).json({
            success: false,
            message: 'Cannot complete Assembly Work Order - Some functional tests failed',
            failed_tests: functionalTests.filter(t => t.overall_result === 'Failed').map(t => ({
              test_type: t.test_type,
              test_parameter: t.test_parameter,
              overall_result: t.overall_result,
              test_record_id: t.test_record_id
            })),
            required_action: 'Fix failed tests and re-test, or raise NCR for rework'
          });
        }
        
        if (!allTestsPassed) {
          return res.status(400).json({
            success: false,
            message: 'Cannot complete Assembly Work Order - Not all tests passed',
            test_summary: {
              total: functionalTests.length,
              passed: functionalTests.filter(t => t.overall_result === 'Passed').length,
              failed: functionalTests.filter(t => t.overall_result === 'Failed').length,
              partially_passed: functionalTests.filter(t => t.overall_result === 'Partially Passed').length
            }
          });
        }
        
        wo.functional_tests_count = functionalTests.length;
        wo.functional_tests_passed = allTestsPassed;
      }
    }
    // ================================================================
 
    const completed_qty = req.body.completed_qty || wo.planned_qty;
    const rejected_qty = req.body.rejected_qty || 0;
 
    // Keep existing serial numbers (generated at release time)
    if (wo.wo_type === 'Assembly' && wo.serial_tracking) {
      if (req.body.serial_numbers && req.body.serial_numbers.length > 0) {
        wo.serial_numbers_assigned = req.body.serial_numbers;
      }
    }
 
    let overheadRate = 0;
    try {
      const Company = getModel('Company');
      const co = await Company.findOne({ is_active: true }).lean();
      if (co) overheadRate = co.overhead_rate_per_hour || 0;
    } catch { }
 
    const actualProcessHours = wo.labour_bookings.reduce((s, b) => s + (b.hours_booked || 0), 0);
    const actualOverhead = +(actualProcessHours * overheadRate).toFixed(2);
    const actualTotalCost = +(wo.actual_rm_cost + wo.actual_process_cost + actualOverhead).toFixed(2);
    const actualUnitCost = completed_qty > 0 ? +(actualTotalCost / completed_qty).toFixed(4) : 0;
 
    try {
      const StockLedger = getModel('StockLedger');
      await StockLedger.findOneAndUpdate(
        { item_id: wo.item_id },
        { $inc: { available_qty: completed_qty }, $set: { last_updated: new Date(), unit_cost: actualUnitCost } },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[WO] StockLedger update skipped:', e.message);
    }
 
    try {
      const SalesOrder = getModel('SalesOrder');
      await SalesOrder.updateOne(
        { _id: wo.so_id, 'items._id': wo.so_item_id },
        { $set: { 'items.$.item_status': 'Ready' }, $inc: { 'items.$.delivered_qty': 0 } }
      );
    } catch (e) {
      console.warn('[WO] SO update skipped:', e.message);
    }
 
    wo.status = 'Completed';
    wo.completed_qty = completed_qty;
    wo.rejected_qty = rejected_qty;
    wo.actual_overhead = actualOverhead;
    wo.actual_total_cost = actualTotalCost;
    wo.actual_end = new Date();
    wo.updated_by = req.user._id;
    await wo.save();
 
    let estimatedTotalCost = 0;
    let estimatedUnitCost = 0;
    let quotationId = null;
    let sellingPriceTotal = 0;
 
    try {
      const SalesOrder = getModel('SalesOrder');
      const so = await SalesOrder.findById(wo.so_id).lean();
      if (so) {
        const line = so.items.find(i => String(i._id) === String(wo.so_item_id));
        if (line) sellingPriceTotal = (line.unit_price || 0) * completed_qty;
      }
    } catch { }
 
    const varianceAmount = +(actualTotalCost - estimatedTotalCost).toFixed(2);
    const variancePct = estimatedTotalCost > 0 ? +((varianceAmount / estimatedTotalCost) * 100).toFixed(2) : 0;
    const grossProfit = +(sellingPriceTotal - actualTotalCost).toFixed(2);
    const grossMarginPct = sellingPriceTotal > 0 ? +((grossProfit / sellingPriceTotal) * 100).toFixed(2) : 0;
 
    // Check if JobCosting already exists
    const existingJobCosting = await JobCosting.findOne({ wo_id: wo._id });
    
    if (!existingJobCosting) {
      await JobCosting.create({
        wo_id: wo._id,
        so_id: wo.so_id,
        item_id: wo.item_id,
        part_no: wo.part_no,
        wo_number: wo.wo_number,
        completed_qty,
        actual_rm_cost: wo.actual_rm_cost,
        actual_process_cost: wo.actual_process_cost,
        actual_overhead: actualOverhead,
        actual_total_cost: actualTotalCost,
        actual_unit_cost: actualUnitCost,
        estimated_total_cost: estimatedTotalCost,
        estimated_unit_cost: estimatedUnitCost,
        quotation_id: quotationId,
        variance_amount: varianceAmount,
        variance_percent: variancePct,
        selling_price_total: sellingPriceTotal,
        gross_profit: grossProfit,
        gross_margin_percent: grossMarginPct,
        created_by: req.user._id,
      });
    }
 
    return res.json({
      success: true,
      message: `${wo.wo_type} Work Order completed. FG stock receipted. Job costing created.`,
      data: {
        wo_number: wo.wo_number,
        wo_type: wo.wo_type,
        status: 'Completed',
        completed_qty,
        actual_rm_cost: wo.actual_rm_cost,
        actual_process_cost: wo.actual_process_cost,
        actual_overhead: actualOverhead,
        actual_total_cost: actualTotalCost,
        actual_unit_cost: actualUnitCost,
        variance_amount: varianceAmount,
        variance_percent: variancePct,
        gross_margin_percent: grossMarginPct,
        serial_numbers: wo.serial_numbers_assigned,
        serial_count: wo.serial_numbers_assigned ? wo.serial_numbers_assigned.length : 0,
        torque_records_count: wo.torque_records_count,
        functional_tests_count: wo.functional_tests_count,
        functional_tests_passed: wo.functional_tests_passed
      },
    });
  } catch (err) {
    console.error('[WO] completeWorkOrder:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

  // ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/:id/production-time
// Calculate total production time for a Work Order using Process Master times
// ─────────────────────────────────────────────────────────────────────────────
exports.getProductionTime = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id)
      .populate('operations.operation_id', 'setup_time_min cycle_time_min process_name')
      .lean();

    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    if (!wo.operations || wo.operations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No operations defined on this Work Order. Add operations first.',
        suggestion: 'Use POST /api/work-orders/:id/operations/add to add operations'
      });
    }

    let totalSetupMin = 0;
    let totalRunMin = 0;
    let totalProductionMin = 0;
    const operationDetails = [];

    for (const op of wo.operations) {
      // Get times from Process Master if available, otherwise use operation's own values
      const setupMin = op.operation_id?.setup_time_min || op.planned_setup_min || 0;
      const runMinPerPiece = op.operation_id?.cycle_time_min || op.planned_run_min || 0;
      const plannedQty = op.planned_qty || wo.planned_qty;

      const opSetupMin = setupMin;
      const opRunMin = runMinPerPiece * plannedQty;
      const opTotalMin = opSetupMin + opRunMin;

      totalSetupMin += opSetupMin;
      totalRunMin += opRunMin;
      totalProductionMin += opTotalMin;

      operationDetails.push({
        op_sequence: op.op_sequence,
        operation_name: op.operation_name,
        operation_id: op.operation_id?._id || op.operation_id,
        process_name: op.operation_id?.process_name || 'Unknown',
        setup_min: opSetupMin,
        run_min_per_piece: runMinPerPiece,
        planned_qty: plannedQty,
        run_min_total: opRunMin,
        total_min: opTotalMin
      });
    }

    const totalProductionHours = totalProductionMin / 60;
    const totalProductionDays = totalProductionHours / 8; // Assuming 8-hour shift

    // Get machine available hours if machine assigned
    let machineAvailableHours = 8;
    let machineUtilizationPercent = null;
    if (wo.operations[0]?.machine_id) {
      try {
        const Machine = getModel('Machine');
        const machine = await Machine.findById(wo.operations[0].machine_id).lean();
        if (machine) {
          machineAvailableHours = machine.available_hours_per_day || 8;
          machineUtilizationPercent = +((totalProductionHours / machineAvailableHours) * 100).toFixed(1);
        }
      } catch (err) {
        console.warn('[WO] Could not fetch machine details:', err.message);
      }
    }

    return res.json({
      success: true,
      data: {
        wo_number: wo.wo_number,
        wo_type: wo.wo_type,
        planned_qty: wo.planned_qty,
        total_setup_min: totalSetupMin,
        total_setup_hours: +(totalSetupMin / 60).toFixed(2),
        total_run_min: totalRunMin,
        total_run_hours: +(totalRunMin / 60).toFixed(2),
        total_production_min: totalProductionMin,
        total_production_hours: totalProductionHours,
        total_production_days: totalProductionDays,
        operations_count: wo.operations.length,
        operation_breakdown: operationDetails,
        machine_capacity: {
          available_hours_per_day: machineAvailableHours,
          required_hours: totalProductionHours,
          utilization_percent: machineUtilizationPercent,
          is_overloaded: machineUtilizationPercent > 100
        }
      }
    });
  } catch (err) {
    console.error('[WO] getProductionTime:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/:id/delivery-date
// Calculate estimated delivery date based on production time
// ─────────────────────────────────────────────────────────────────────────────
exports.calculateDeliveryDate = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id)
      .populate('operations.operation_id', 'setup_time_min cycle_time_min')
      .lean();

    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // Calculate total production time
    let totalProductionMin = 0;
    for (const op of wo.operations) {
      const setupMin = op.operation_id?.setup_time_min || op.planned_setup_min || 0;
      const runMinPerPiece = op.operation_id?.cycle_time_min || op.planned_run_min || 0;
      const plannedQty = op.planned_qty || wo.planned_qty;
      totalProductionMin += setupMin + (runMinPerPiece * plannedQty);
    }

    // Get shift hours from Company settings or default
    let hoursPerDay = 8;
    try {
      const Company = getModel('Company');
      const company = await Company.findOne({ is_active: true }).lean();
      if (company && company.shift_hours_per_day) hoursPerDay = company.shift_hours_per_day;
    } catch (err) {
      console.warn('[WO] Could not fetch company settings:', err.message);
    }

    const productionDays = totalProductionMin / (hoursPerDay * 60);
    
    // Add buffer days (setup, quality checks, waiting time)
    const bufferDays = 1;
    const totalDays = Math.ceil(productionDays) + bufferDays;

    // Calculate committed date from planned start
    const startDate = wo.planned_start || new Date();
    const committedDate = new Date(startDate);
    committedDate.setDate(committedDate.getDate() + totalDays);

    // Adjust for weekends (optional - skip Saturdays and Sundays)
    let adjustedDate = new Date(committedDate);
    if (req.query.exclude_weekends === 'true') {
      let workingDaysAdded = 0;
      adjustedDate = new Date(startDate);
      while (workingDaysAdded < totalDays) {
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        const dayOfWeek = adjustedDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          workingDaysAdded++;
        }
      }
    }

    const requiredBy = wo.required_by;
    const canMeetDeadline = adjustedDate <= requiredBy;
    const daysLate = canMeetDeadline ? 0 : Math.ceil((adjustedDate - requiredBy) / (1000 * 60 * 60 * 24));

    return res.json({
      success: true,
      data: {
        wo_number: wo.wo_number,
        planned_start: wo.planned_start,
        customer_required_by: requiredBy,
        production_calculation: {
          total_production_minutes: totalProductionMin,
          total_production_hours: +(totalProductionMin / 60).toFixed(2),
          shift_hours_per_day: hoursPerDay,
          production_days: productionDays,
          buffer_days: bufferDays,
          total_days: totalDays
        },
        estimated_delivery_date: adjustedDate,
        can_meet_customer_deadline: canMeetDeadline,
        days_late_if_any: daysLate,
        message: canMeetDeadline
          ? `✅ Can deliver by ${adjustedDate.toISOString().split('T')[0]}`
          : `⚠️ Cannot meet deadline. Will be ${daysLate} day(s) late. Earliest delivery: ${adjustedDate.toISOString().split('T')[0]}`,
        recommendations: !canMeetDeadline ? [
          'Add overtime shifts to reduce production days',
          'Split order across multiple machines',
          'Negotiate later delivery date with customer',
          'Outsource some operations to subcontractors'
        ] : []
      }
    });
  } catch (err) {
    console.error('[WO] calculateDeliveryDate:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/:id/job-costing
// Job costing report — BE-020
// ─────────────────────────────────────────────────────────────────────────────
exports.getJobCosting = async (req, res) => {
  try {
    const jc = await JobCosting.findOne({ wo_id: req.params.id })
      .populate('wo_id',   'wo_number status planned_qty completed_qty wo_type')
      .populate('item_id', 'part_no part_description')
      .lean();

    if (!jc) {
      // If WO not completed yet, return accumulated live cost
      const wo = await WorkOrder.findById(req.params.id).lean();
      if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });

      return res.json({
        success: true,
        message: 'WO not completed yet — showing accumulated WIP costs',
        data: {
          wo_number:           wo.wo_number,
          wo_type:             wo.wo_type,
          status:              wo.status,
          actual_rm_cost:      wo.actual_rm_cost,
          actual_process_cost: wo.actual_process_cost,
          actual_total_cost:   wo.actual_total_cost,
          labour_bookings:     wo.labour_bookings,
          completed:           false,
        },
      });
    }

    return res.json({ success: true, data: jc });
  } catch (err) {
    console.error('[WO] getJobCosting:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/wip-report
// WIP valuation — all open WOs with accumulated costs — BE-020
// ─────────────────────────────────────────────────────────────────────────────
exports.getWipReport = async (req, res) => {
  try {
    const openWOs = await WorkOrder.find({
      status: { $in: ['Released', 'In Progress', 'Partially Completed', 'Components Kitted'] },
    })
      .select('wo_number part_no part_name planned_qty completed_qty actual_rm_cost actual_process_cost actual_overhead actual_total_cost planned_start status priority customer_name wo_type assembly_line')
      .lean();

    const totalWip      = openWOs.reduce((s, w) => s + (w.actual_total_cost || 0), 0);
    const machiningWip  = openWOs.filter(w => w.wo_type !== 'Assembly').reduce((s, w) => s + (w.actual_total_cost || 0), 0);
    const assemblyWip   = openWOs.filter(w => w.wo_type === 'Assembly').reduce((s, w) => s + (w.actual_total_cost || 0), 0);

    return res.json({
      success: true,
      data: {
        open_wo_count:       openWOs.length,
        total_wip_value:     +totalWip.toFixed(2),
        machining_wip_value: +machiningWip.toFixed(2),
        assembly_wip_value:  +assemblyWip.toFixed(2),
        work_orders:         openWOs,
      },
    });
  } catch (err) {
    console.error('[WO] getWipReport:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/assembly-queue
// All open Assembly WOs with dependency status — Phase 09
// ─────────────────────────────────────────────────────────────────────────────
exports.getAssemblyQueue = async (req, res) => {
  try {
    const assemblyWOs = await WorkOrder.find({
      wo_type: 'Assembly',
      status:  { $in: ['Released', 'In Progress', 'Partially Completed', 'Components Kitted'] },
    })
      .populate('item_id',               'part_no part_description')
      .populate('component_picklist_id', 'status picklist_id')
      .sort({ priority: 1, planned_start: 1 })
      .lean();

    for (const wo of assemblyWOs) {
      const dependencies     = await SubAssemblyRegister.find({ parent_wo_id: wo._id }).lean();
      wo.dependencies        = dependencies;
      wo.all_dependencies_met = dependencies.every(d => d.dependency_met);
    }

    return res.json({
      success: true,
      data:    assemblyWOs,
      count:   assemblyWOs.length,
    });
  } catch (err) {
    console.error('[WO] getAssemblyQueue:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/:id/operations/timeline
//
// Returns operations sorted by op_sequence with full status, timing, and
// yield data. Designed for a frontend timeline/progress-tracker component.
// ─────────────────────────────────────────────────────────────────────────────
exports.getOperationsTimeline = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id)
      .populate('operations.employee_id', 'name employee_id')
      .populate('operations.machine_id',  'machine_name machine_code')
      .lean({ virtuals: true });
 
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
 
    if (!wo.operations || wo.operations.length === 0) {
      return res.json({
        success: true,
        message: 'No operations defined on this Work Order',
        data: {
          summary:    null,
          operations: [],
        },
      });
    }
 
    // Sort by op_sequence ascending — this IS the timeline order
    const sortedOps = [...wo.operations].sort((a, b) => a.op_sequence - b.op_sequence);
 
    // Find the currently active op and next pending op (for is_current / is_next flags)
    const activeOpSeq = (sortedOps.find(o => o.status === 'In Progress') || {}).op_sequence;
    const pendingOps  = sortedOps.filter(o => o.status === 'Pending');
    const nextOpSeq   = pendingOps.length > 0 ? pendingOps[0].op_sequence : null;
 
    // ── Build per-operation timeline entries ─────────────────────────────────
    const timelineOps = sortedOps.map((op, index) => {
 
      // Planned total time: setup + (run_per_pc × planned_qty)
      const plannedTotalMin = (op.planned_setup_min || 0) +
        ((op.planned_run_min || 0) * (op.planned_qty || 0));
 
      // Actual total time from logged values (setup + run × qty)
      const actualTotalMin = (op.actual_setup_min || 0) +
        ((op.actual_run_min || 0) * (op.planned_qty || 0));
 
      // Wall-clock duration from actual_start → actual_end
      let wallClockMin = null;
      if (op.actual_start && op.actual_end) {
        wallClockMin = +((new Date(op.actual_end) - new Date(op.actual_start)) / 60000).toFixed(1);
      } else if (op.actual_start && op.status === 'In Progress') {
        // Live elapsed time for the currently running op
        wallClockMin = +((Date.now() - new Date(op.actual_start)) / 60000).toFixed(1);
      }
 
      // Human-readable elapsed label (only for In Progress)
      let elapsedLabel = null;
      if (op.status === 'In Progress' && op.actual_start) {
        const totalMin = wallClockMin || 0;
        const h = Math.floor(totalMin / 60);
        const m = Math.floor(totalMin % 60);
        elapsedLabel = h > 0 ? `${h}h ${m}m elapsed` : `${m}m elapsed`;
      }
 
      // Time efficiency: actual vs planned (< 100 = faster = good)
      let timeEfficiencyPct = null;
      if (op.status === 'Completed' && plannedTotalMin > 0 && actualTotalMin > 0) {
        timeEfficiencyPct = +((actualTotalMin / plannedTotalMin) * 100).toFixed(1);
      }
 
      // Yield for this operation
      let yieldPct = null;
      if (op.status === 'Completed' && op.planned_qty > 0) {
        yieldPct = +((op.output_qty / op.planned_qty) * 100).toFixed(1);
      }
 
      return {
        // ── Position & flags ─────────────────────────────────────────────────
        position:   index + 1,
        is_first:   index === 0,
        is_last:    index === sortedOps.length - 1,
        is_current: op.op_sequence === activeOpSeq,  // the one In Progress right now
        is_next:    op.op_sequence === nextOpSeq,     // next in queue after active
 
        // ── Identity ─────────────────────────────────────────────────────────
        op_sequence:    op.op_sequence,
        operation_name: op.operation_name,
        work_centre:    op.work_centre,
        is_subcontract: op.is_subcontract || false,
        subcontract_vendor: op.subcontract_vendor || null,
        machine: op.machine_id
          ? {
              id:   op.machine_id._id,
              name: op.machine_id.machine_name,
              code: op.machine_id.machine_code,
            }
          : null,
        operator: op.employee_id
          ? {
              id:          op.employee_id._id,
              name:        op.employee_id.name,
              employee_id: op.employee_id.employee_id,
            }
          : null,
        required_skill:    op.required_skill    || null,
        skill_override:    op.skill_override    || false,
 
        // ── Status ───────────────────────────────────────────────────────────
        status: op.status,
 
        // ── Planned ──────────────────────────────────────────────────────────
        planned: {
          qty:            op.planned_qty       || 0,
          setup_min:      op.planned_setup_min || 0,
          run_min_per_pc: op.planned_run_min   || 0,
          total_min:      plannedTotalMin,
          start:          op.planned_start     || null,
        },
 
        // ── Actual ───────────────────────────────────────────────────────────
        actual: {
          start:          op.actual_start      || null,
          end:            op.actual_end        || null,
          setup_min:      op.actual_setup_min  || 0,
          run_min_per_pc: op.actual_run_min    || 0,
          total_min:      actualTotalMin > 0 ? actualTotalMin : null,
          duration_min:   wallClockMin,
          elapsed_label:  elapsedLabel,
        },
 
        // ── Output ───────────────────────────────────────────────────────────
        output: {
          output_qty:       op.output_qty      || 0,
          rejection_qty:    op.rejection_qty   || 0,
          rejection_reason: op.rejection_reason || null,
          yield_percent:    yieldPct,
        },
 
        // ── Efficiency ───────────────────────────────────────────────────────
        efficiency: {
          time_vs_plan_percent: timeEfficiencyPct,
        },
      };
    });
 
    // ── WO-level summary ─────────────────────────────────────────────────────
    const totalOps     = sortedOps.length;
    const completedOps = sortedOps.filter(o =>
      o.status === 'Completed' || o.status === 'Skipped'
    ).length;
 
    const currentActive = sortedOps.find(o => o.status === 'In Progress');
    const nextPending   = sortedOps.find(o => o.status === 'Pending');
 
    const totalPlannedMin = timelineOps.reduce((s, t) => s + (t.planned.total_min || 0), 0);
    const totalActualMin  = timelineOps.reduce((s, t) => {
      const am = t.actual.total_min;
      return s + (am !== null ? am : 0);
    }, 0);
 
    // Overall yield: last completed op's output vs WO planned_qty
    let overallYieldPct = null;
    const lastCompletedOp = [...sortedOps].reverse().find(o => o.status === 'Completed');
    if (lastCompletedOp && wo.planned_qty > 0) {
      overallYieldPct = +((lastCompletedOp.output_qty / wo.planned_qty) * 100).toFixed(1);
    }
 
    const summary = {
      wo_number:   wo.wo_number,
      wo_type:     wo.wo_type,
      wo_status:   wo.status,
      priority:    wo.priority,
      part_no:     wo.part_no,
      part_name:   wo.part_name,
 
      planned_qty:   wo.planned_qty,
      completed_qty: wo.completed_qty   || 0,
      rejected_qty:  wo.rejected_qty    || 0,
 
      total_operations:     totalOps,
      completed_operations: completedOps,
      pending_operations:   totalOps - completedOps - (currentActive ? 1 : 0),
      percent_complete:     totalOps > 0
        ? +((completedOps / totalOps) * 100).toFixed(1)
        : 0,
 
      wo_planned_start: wo.planned_start  || null,
      wo_planned_end:   wo.planned_end    || null,
      wo_actual_start:  wo.actual_start   || null,
      wo_actual_end:    wo.actual_end     || null,
 
      total_planned_min: totalPlannedMin,
      total_actual_min:  totalActualMin > 0 ? totalActualMin : null,
 
      overall_yield_percent: overallYieldPct,
 
      current_active_op: currentActive
        ? {
            op_sequence:    currentActive.op_sequence,
            operation_name: currentActive.operation_name,
            work_centre:    currentActive.work_centre,
            actual_start:   currentActive.actual_start,
          }
        : null,
      next_pending_op: nextPending
        ? {
            op_sequence:    nextPending.op_sequence,
            operation_name: nextPending.operation_name,
            work_centre:    nextPending.work_centre,
          }
        : null,
    };
 
    return res.json({
      success: true,
      data: {
        summary,
        operations: timelineOps,
      },
    });
  } catch (err) {
    console.error('[WO] getOperationsTimeline:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/work-orders/:id/operations/:seq/output
// Update output_qty for an operation and cascade to next operation
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOperationOutputQty = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
 
    const seq = parseInt(req.params.seq, 10);
    const op  = wo.operations.find(o => o.op_sequence === seq);
 
    if (!op) {
      return res.status(404).json({
        success: false,
        message: `Operation with sequence ${seq} not found on this Work Order`,
      });
    }
 
    // ── Guard: only allowed when operation is In Progress ────────────────────
    if (op.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: `output_qty can only be updated when operation is In Progress. Current status: ${op.status}`,
        allowed_status: 'In Progress',
      });
    }
 
    const { output_qty, rejection_qty } = req.body;
 
    // ── Validate output_qty present and numeric ──────────────────────────────
    if (output_qty === undefined || output_qty === null) {
      return res.status(400).json({
        success: false,
        message: 'output_qty is required',
      });
    }
 
    const parsedOutputQty    = parseFloat(output_qty);
    const parsedRejectionQty = rejection_qty !== undefined ? parseFloat(rejection_qty) : op.rejection_qty;
 
    if (isNaN(parsedOutputQty) || parsedOutputQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'output_qty must be a non-negative number',
      });
    }
 
    // ── Guard: output cannot exceed planned_qty for this operation ───────────
    if (parsedOutputQty > op.planned_qty) {
      return res.status(400).json({
        success: false,
        message: `output_qty (${parsedOutputQty}) cannot exceed operation's planned_qty (${op.planned_qty})`,
        planned_qty: op.planned_qty,
      });
    }
 
    // ── Guard: output_qty + rejection_qty cannot exceed planned_qty ──────────
    if (parsedOutputQty + parsedRejectionQty > op.planned_qty) {
      return res.status(400).json({
        success: false,
        message: `output_qty (${parsedOutputQty}) + rejection_qty (${parsedRejectionQty}) cannot exceed planned_qty (${op.planned_qty})`,
        planned_qty: op.planned_qty,
      });
    }
 
    // ── Update this operation ────────────────────────────────────────────────
    const previousOutputQty = op.output_qty;
    op.output_qty    = parsedOutputQty;
    op.rejection_qty = parsedRejectionQty;
 
    // ── CASCADE: find the next operation in sequence and update planned_qty ──
    // "Next" = operation with the lowest op_sequence that is GREATER than current seq
    const sortedOps = wo.operations
      .filter(o => o.op_sequence > seq)
      .sort((a, b) => a.op_sequence - b.op_sequence);
 
    let cascadeApplied  = false;
    let cascadeTarget   = null;
 
    if (sortedOps.length > 0) {
      const nextOp = sortedOps[0];
 
      // Only cascade if next operation is still Pending
      // (if it's In Progress or Completed, its planned_qty is already locked in)
      if (nextOp.status === 'Pending') {
        const previousNextPlannedQty = nextOp.planned_qty;
        nextOp.planned_qty = parsedOutputQty;
 
        cascadeApplied = true;
        cascadeTarget  = {
          op_sequence:           nextOp.op_sequence,
          operation_name:        nextOp.operation_name,
          previous_planned_qty:  previousNextPlannedQty,
          new_planned_qty:       parsedOutputQty,
        };
      } else {
        // Next op already started — cascade blocked, warn caller
        cascadeTarget = {
          op_sequence:    nextOp.op_sequence,
          operation_name: nextOp.operation_name,
          status:         nextOp.status,
          cascade_blocked: true,
          reason: `Next operation is already ${nextOp.status} — planned_qty not changed`,
        };
      }
    }
 
    wo.updated_by = req.user._id;
    await wo.save();
 
    return res.json({
      success: true,
      message: `Operation ${seq} output_qty updated${cascadeApplied ? ` — cascaded to operation ${cascadeTarget.op_sequence}` : ''}`,
      data: {
        op_sequence:          seq,
        operation_name:       op.operation_name,
        planned_qty:          op.planned_qty,
        output_qty:           parsedOutputQty,
        rejection_qty:        parsedRejectionQty,
        previous_output_qty:  previousOutputQty,
        cascade:              cascadeTarget,
      },
    });
  } catch (err) {
    console.error('[WO] updateOperationOutputQty:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-orders/:id/job-card
// Printable job card PDF — BE-019
// Supports both Machining and Assembly WOs
// ─────────────────────────────────────────────────────────────────────────────
exports.getJobCard = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id)
      .populate('item_id',    'part_no part_description unit drawing_no')
      .populate('bom_id',     'bom_id bom_version components')
      .populate('routing_id', 'routing_id routing_name operations')
      .populate('so_id',      'so_number customer_name customer_po_number')
      .populate('operations.employee_id', 'name employee_id')
      .populate('operations.machine_id',  'machine_name machine_code')
      .lean({ virtuals: true });

    if (!wo) return res.status(404).json({ success: false, message: 'Work Order not found' });

    // Fetch Assembly-specific data for job card
    let assemblyInfo = {};
    if (wo.wo_type === 'Assembly') {
      const picklist = await ComponentPickList.findOne({ wo_id: wo._id }).lean();
      const tests    = await FunctionalTestRecord.find({ wo_id: wo._id }).limit(5).lean();
      assemblyInfo   = { picklist, recent_tests: tests };
    }

    // ── Build PDF using pdfkit or return JSON for frontend PDF generation ──────
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=JobCard-${wo.wo_number}.pdf`);
      doc.pipe(res);

      // ── Header ───────────────────────────────────────────────────────────────
      doc.fontSize(18).font('Helvetica-Bold').text(
        `JOB CARD / ${wo.wo_type ? wo.wo_type.toUpperCase() : 'WORK'} ORDER`,
        { align: 'center' }
      );
      doc.moveDown(0.3);
      doc.fontSize(12).font('Helvetica').text(`WO Number: ${wo.wo_number}`, { align: 'right' });
      doc.moveDown(0.5);

      // ── WO Details ───────────────────────────────────────────────────────────
      doc.fontSize(10).font('Helvetica-Bold').text('WORK ORDER DETAILS');
      doc.font('Helvetica');
      const details = [
        ['Part No',      wo.part_no],
        ['Part Name',    wo.part_name],
        ['Drawing No',   wo.drawing_no       || '-'],
        ['Drawing Rev',  wo.drawing_revision],
        ['BOM Version',  wo.bom_version       || '-'],
        ['Planned Qty',  String(wo.planned_qty)],
        ['Planned Start', wo.planned_start ? new Date(wo.planned_start).toLocaleDateString('en-IN') : '-'],
        ['Planned End',   wo.planned_end   ? new Date(wo.planned_end).toLocaleDateString('en-IN')   : '-'],
        ['Priority',     wo.priority],
        ['Status',       wo.status],
        ['WO Type',      wo.wo_type || 'Machining'],
        ['SO Number',    wo.so_number    || '-'],
        ['Customer',     wo.customer_name || '-'],
      ];

      if (wo.assembly_line) details.push(['Assembly Line', wo.assembly_line]);

      details.forEach(([label, value]) => {
        doc.text(`${label.padEnd(18)}: ${value}`);
      });

      doc.moveDown(1);

      // ── Operations ───────────────────────────────────────────────────────────
      doc.fontSize(10).font('Helvetica-Bold').text('OPERATIONS');
      doc.font('Helvetica');

      wo.operations.forEach((op) => {
        doc.text(
          `${String(op.op_sequence).padStart(3)}. ${op.operation_name.padEnd(25)} | ` +
          `Work Centre: ${op.work_centre.padEnd(15)} | ` +
          `Setup: ${op.planned_setup_min}m | Run: ${op.planned_run_min}m/pc | ` +
          `Status: ${op.status}`
        );
      });

      // ── Assembly pick list summary ────────────────────────────────────────────
      if (wo.wo_type === 'Assembly' && assemblyInfo.picklist) {
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica-Bold').text('COMPONENT PICK LIST');
        doc.font('Helvetica');
        doc.text(`Pick List: ${assemblyInfo.picklist.picklist_id} | Status: ${assemblyInfo.picklist.status}`);
        doc.text(`Total Components: ${assemblyInfo.picklist.items.length}`);
      }

      doc.moveDown(1);

      // ── Signature lines ───────────────────────────────────────────────────────
      doc.fontSize(10).font('Helvetica-Bold').text('SIGN-OFF');
      doc.font('Helvetica');
      doc.text('Issued By: ________________________   Date: ____________');
      doc.moveDown(0.5);
      doc.text('QC Passed By: ___________________   Date: ____________');

      if (wo.wo_type === 'Assembly') {
        doc.moveDown(0.5);
        doc.text('Torque Verified By: _______________   Date: ____________');
      }

      doc.end();
    } catch (pdfErr) {
      // pdfkit not available — return JSON
      return res.json({
        success:       true,
        message:       'PDF library unavailable — returning JSON job card data',
        data:          wo,
        assembly_info: assemblyInfo,
      });
    }
  } catch (err) {
    console.error('[WO] getJobCard:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/operations/:seq/start
// Start a specific operation — validates operator skill, marks In Progress
// ─────────────────────────────────────────────────────────────────────────────
exports.startOperation = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // WO must be Released or already In Progress to start an operation
    if (!['Released', 'In Progress'].includes(wo.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot start operation on a WO with status: ${wo.status}. WO must be Released or In Progress.`,
      });
    }

    const seq = parseInt(req.params.seq, 10);
    const op  = wo.operations.find(o => o.op_sequence === seq);

    if (!op) {
      return res.status(404).json({
        success: false,
        message: `Operation with sequence ${seq} not found on this Work Order`,
      });
    }

    // Only Pending ops can be started
    if (op.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Operation ${seq} is already ${op.status} and cannot be started again.`,
        current_status: op.status,
      });
    }

    // Sequential enforcement: no prior op should be Pending before this one
    const priorPendingOp = wo.operations
      .filter(o => o.op_sequence < seq && o.status === 'Pending')
      .sort((a, b) => a.op_sequence - b.op_sequence)[0];

    if (priorPendingOp) {
      return res.status(400).json({
        success: false,
        message: `Operations must run in sequence. Complete operation ${priorPendingOp.op_sequence} ("${priorPendingOp.operation_name}") before starting operation ${seq}.`,
        blocking_op: {
          op_sequence:    priorPendingOp.op_sequence,
          operation_name: priorPendingOp.operation_name,
        },
      });
    }

    const { employee_id, routing_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required' });
    }

    // Optional: validate routing_id matches WO routing
    if (routing_id && wo.routing_id && String(routing_id) !== String(wo.routing_id)) {
      return res.status(400).json({
        success: false,
        message: 'routing_id mismatch — provided routing does not match this Work Order',
        wo_routing_id: wo.routing_id,
      });
    }

    // Skill validation (non-blocking — logs override warning)
    let skillOverride = false;
    if (op.required_skill) {
      try {
        const Employee = getModel('Employee');
        const employee  = await Employee.findById(employee_id).lean();
        if (employee) {
          const hasSkill = (employee.skill_codes || []).includes(op.required_skill);
          if (!hasSkill) {
            skillOverride = true;
            op.skill_override    = true;
            op.skill_override_by = req.user._id;
            console.warn(
              `[WO] Skill override: operator ${employee_id} lacks "${op.required_skill}" ` +
              `for op ${seq} on WO ${wo.wo_number}`
            );
          }
        }
      } catch (skillErr) {
        console.warn('[WO] startOperation skill check error (non-fatal):', skillErr.message);
      }
    }

    // Mark operation In Progress
    op.status       = 'In Progress';
    op.employee_id  = employee_id;
    op.actual_start = new Date();

    // Transition WO to In Progress on first op start
    if (wo.status === 'Released') {
      wo.status       = 'In Progress';
      wo.actual_start = wo.actual_start || new Date();
    }

    wo.updated_by = req.user._id;
    await wo.save();

    return res.json({
      success: true,
      message: `Operation ${seq} ("${op.operation_name}") started`,
      data: {
        op_sequence:    seq,
        operation_name: op.operation_name,
        status:         op.status,
        actual_start:   op.actual_start,
        employee_id:    employee_id,
        skill_override: skillOverride,
        routing_id:     wo.routing_id || null,
        wo_status:      wo.status,
      },
    });
  } catch (err) {
    console.error('[WO] startOperation:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/operations/start
// Auto-start the next pending operation (no seq needed in URL)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-orders/:id/start
// Auto-start the next pending operation (no request body needed)
// ─────────────────────────────────────────────────────────────────────────────
exports.startNextOperation = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.id);
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    // WO must be Released or already In Progress
    if (!['Released', 'In Progress'].includes(wo.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot start operation. WO status: ${wo.status}. Must be Released or In Progress.`,
      });
    }

    // Find first Pending operation
    const pendingOps = wo.operations
      .filter(o => o.status === 'Pending')
      .sort((a, b) => a.op_sequence - b.op_sequence);

    if (pendingOps.length === 0) {
      const inProgressOp = wo.operations.find(o => o.status === 'In Progress');
      if (inProgressOp) {
        return res.status(400).json({
          success: false,
          message: `Operation ${inProgressOp.op_sequence} is already In Progress. Complete it first.`,
          current_op: {
            op_sequence: inProgressOp.op_sequence,
            operation_name: inProgressOp.operation_name,
          },
        });
      }
      return res.status(400).json({
        success: false,
        message: 'No pending operations to start. All operations may be completed.',
      });
    }

    const nextOp = pendingOps[0];
    const seq = nextOp.op_sequence;

    // Verify all prior operations are Completed
    const incompletePriorOp = wo.operations
      .filter(o => o.op_sequence < seq && o.status !== 'Completed')
      .sort((a, b) => a.op_sequence - b.op_sequence)[0];

    if (incompletePriorOp) {
      return res.status(400).json({
        success: false,
        message: `Complete operation ${incompletePriorOp.op_sequence} ("${incompletePriorOp.operation_name}") before starting operation ${seq}.`,
        blocking_op: {
          op_sequence: incompletePriorOp.op_sequence,
          operation_name: incompletePriorOp.operation_name,
          current_status: incompletePriorOp.status,
        },
      });
    }

    // Start the operation (no operator_id needed - use system or null)
    nextOp.status = 'In Progress';
    nextOp.actual_start = new Date();

    if (wo.status === 'Released') {
      wo.status = 'In Progress';
      wo.actual_start = wo.actual_start || new Date();
    }

    wo.updated_by = req.user._id;
    await wo.save();

    const remainingPending = wo.operations.filter(o => o.status === 'Pending').length;

    return res.json({
      success: true,
      message: `Operation ${seq} ("${nextOp.operation_name}") started automatically`,
      data: {
        started_op: {
          op_sequence: seq,
          operation_name: nextOp.operation_name,
          status: 'In Progress',
          actual_start: nextOp.actual_start,
        },
        remaining_pending_ops: remainingPending,
        total_operations: wo.operations.length,
        completed_ops: wo.operations.filter(o => o.status === 'Completed').length,
        wo_status: wo.status,
      },
    });
  } catch (err) {
    console.error('[WO] startNextOperation:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ─────────────────────────────────────────────────────────────────────────────

// Helper: Check Sub-Assembly Availability BEFORE Pick List Generation

// ─────────────────────────────────────────────────────────────────────────────

async function checkSubAssemblyAvailability(wo_id, bomComponents) {

  try {

    const SubAssemblyRegister = getModel('SubAssemblyRegister');

    const StockLedger = getModel('StockLedger');

    const Warehouse = getModel('Warehouse');

    const shortages = [];

    // Find FG warehouse for sub-assembly stock

    const fgWarehouse = await Warehouse.findOne({ 

      warehouse_type: 'Finished Goods',

      is_active: true 

    }).lean();

    for (const comp of bomComponents) {

      // Check if this component is a sub-assembly

      const isSubAssembly = comp.component_type === 'Sub-Assembly' || comp.is_phantom === true;

      if (isSubAssembly) {

        // First, check if there's a dependency record

        let dependency = await SubAssemblyRegister.findOne({

          parent_wo_id: wo_id,

          child_part_no: comp.component_part_no

        });

        let availableQty = 0;

        let requiredQty = comp.quantity_per * (comp.planned_qty || 1);

        if (dependency) {

          availableQty = dependency.available_qty || 0;

          requiredQty = dependency.required_qty || requiredQty;

        } else {

          // No dependency record - check stock directly in FG warehouse

          const stock = await StockLedger.aggregate([

            { 

              $match: { 

                item_id: comp.component_item_id,

                warehouse_id: fgWarehouse?._id,

                quantity: { $gt: 0 }

              } 

            },

            { $group: { _id: null, total: { $sum: '$quantity' } } }

          ]);

          availableQty = stock[0]?.total || 0;

        }

        const shortage = Math.max(0, requiredQty - availableQty);

        if (shortage > 0) {

          shortages.push({

            part_no: comp.component_part_no,

            required_qty: requiredQty,

            available_qty: availableQty,

            shortage_qty: shortage

          });

        }

      }

    }

    return shortages;

  } catch (err) {

    console.error('[WO] checkSubAssemblyAvailability error:', err);

    return [];

  }

}
 