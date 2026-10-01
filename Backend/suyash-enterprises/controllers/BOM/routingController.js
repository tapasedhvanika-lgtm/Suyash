// const Routing = require('../../models/BOM/Routing');
// const Machine = require('../../models/BOM/Machine');
// const ProcessMaster = require('../../models/CRM/Process');
// const Item = require('../../models/CRM/Item');
// const mongoose = require('mongoose');

// // Helper to generate routing ID
// async function generateRoutingId() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const prefix = `RTG-${year}${month}`;
  
//   const lastRouting = await Routing.findOne(
//     { routing_id: new RegExp(`^${prefix}`) },
//     { routing_id: 1 }
//   ).sort({ routing_id: -1 });
  
//   let sequence = 1;
//   if (lastRouting) {
//     const lastSeq = parseInt(lastRouting.routing_id.split('-').pop());
//     sequence = lastSeq + 1;
//   }
  
//   return `${prefix}-${String(sequence).padStart(4, '0')}`;
// }

// // @desc    Create new routing
// // @route   POST /api/routings
// // @access  Manager, Production
// exports.createRouting = async (req, res) => {
//   try {
//     const {
//       routing_name,
//       routing_type,
//       applicable_items,
//       operations,
//       version = '1.0'
//     } = req.body;

//     if (!routing_name || !routing_type || !operations) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: routing_name, routing_type, operations'
//       });
//     }

//     const sequences = operations.map(op => op.op_sequence);
//     if (new Set(sequences).size !== sequences.length) {
//       return res.status(400).json({
//         success: false,
//         message: 'Operation sequences must be unique'
//       });
//     }

//     const sortedSequences = [...sequences].sort((a, b) => a - b);
//     if (JSON.stringify(sequences) !== JSON.stringify(sortedSequences)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Operations must be in ascending sequence order'
//       });
//     }

//     for (const op of operations) {
//       const process = await ProcessMaster.findById(op.operation_id);
//       if (!process) {
//         return res.status(404).json({
//           success: false,
//           message: `Process not found for operation: ${op.operation_name}`
//         });
//       }

//       if (op.machine_id) {
//         const machine = await Machine.findById(op.machine_id);
//         if (!machine) {
//           return res.status(404).json({
//             success: false,
//             message: `Machine not found: ${op.machine_id}`
//           });
//         }
//       }
//     }

//     if (applicable_items && applicable_items.length > 0) {
//       const items = await Item.find({ _id: { $in: applicable_items } });
//       if (items.length !== applicable_items.length) {
//         return res.status(404).json({
//           success: false,
//           message: 'Some applicable items not found'
//         });
//       }
//     }

//     const routing_id = await generateRoutingId();

//     const routing = await Routing.create({
//       routing_id,
//       routing_name,
//       routing_type,
//       applicable_items: applicable_items || [],
//       operations,
//       version,
//       created_by: req.user._id,
//       total_cycle_time_min: operations.reduce((sum, op) => sum + op.planned_run_min, 0)
//     });

//     const populatedRouting = await Routing.findById(routing._id)
//       .populate('operations.operation_id', 'process_name rate_type standard_rate')
//       .populate('operations.machine_id', 'machine_name machine_code')
//       .populate('applicable_items', 'part_no part_description')
//       .populate('created_by', 'name email');

//     res.status(201).json({
//       success: true,
//       message: 'Routing created successfully',
//       data: populatedRouting
//     });

//   } catch (error) {
//     console.error('Create routing error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get all routings
// // @route   GET /api/routings
// // @access  All roles
// exports.getRoutings = async (req, res) => {
//   try {
//     const {
//       routing_type,
//       is_active,
//       applicable_item,
//       page = 1,
//       limit = 20,
//       sort = '-created_at'
//     } = req.query;

//     const filter = {};
//     if (routing_type) filter.routing_type = routing_type;
//     if (is_active !== undefined) filter.is_active = is_active === 'true';
//     if (applicable_item) filter.applicable_items = applicable_item;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const routings = await Routing.find(filter)
//       .populate('operations.operation_id', 'process_name rate_type')
//       .populate('operations.machine_id', 'machine_name machine_code')
//       .populate('applicable_items', 'part_no part_description')
//       .populate('created_by', 'name email')
//       .populate('approved_by', 'name email')
//       .sort(sort)
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Routing.countDocuments(filter);

//     res.status(200).json({
//       success: true,
//       data: routings,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     });

//   } catch (error) {
//     console.error('Get routings error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get routing by ID
// // @route   GET /api/routings/:id
// // @access  All roles
// exports.getRoutingById = async (req, res) => {
//   try {
//     const routing = await Routing.findById(req.params.id)
//       .populate('operations.operation_id', 'process_name rate_type standard_rate description')
//       .populate('operations.machine_id', 'machine_name machine_code work_centre capacity_value')
//       .populate('operations.subcontract_vendor', 'vendor_name vendor_code gstin')
//       .populate('applicable_items', 'part_no part_description item_category')
//       .populate('created_by', 'name email')
//       .populate('approved_by', 'name email')
//       .populate('updated_by', 'name email');

//     if (!routing) {
//       return res.status(404).json({
//         success: false,
//         message: 'Routing not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: routing
//     });

//   } catch (error) {
//     console.error('Get routing by ID error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Update routing
// // @route   PUT /api/routings/:id
// // @access  Manager
// exports.updateRouting = async (req, res) => {
//   try {
//     const routing = await Routing.findById(req.params.id);

//     if (!routing) {
//       return res.status(404).json({
//         success: false,
//         message: 'Routing not found'
//       });
//     }

//     const {
//       routing_name,
//       routing_type,
//       applicable_items,
//       operations,
//       is_active
//     } = req.body;

//     if (operations) {
//       const sequences = operations.map(op => op.op_sequence);
//       if (new Set(sequences).size !== sequences.length) {
//         return res.status(400).json({
//           success: false,
//           message: 'Operation sequences must be unique'
//         });
//       }
//     }

//     // Prepare update data
//     const updateData = {
//       updated_by: req.user._id,
//       updated_at: new Date()
//     };

//     if (routing_name !== undefined) updateData.routing_name = routing_name;
//     if (routing_type !== undefined) updateData.routing_type = routing_type;
//     if (applicable_items !== undefined) updateData.applicable_items = applicable_items;
//     if (operations !== undefined) {
//       updateData.operations = operations;
//       updateData.total_cycle_time_min = operations.reduce((sum, op) => sum + (op.planned_run_min || 0), 0);
//     }
//     if (is_active !== undefined) updateData.is_active = is_active;

//     // Update the existing routing instead of creating new one
//     const updatedRouting = await Routing.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     )
//       .populate('operations.operation_id', 'process_name rate_type')
//       .populate('operations.machine_id', 'machine_name machine_code')
//       .populate('applicable_items', 'part_no part_description')
//       .populate('created_by', 'name email')
//       .populate('updated_by', 'name email');

//     res.status(200).json({
//       success: true,
//       message: 'Routing updated successfully',
//       data: updatedRouting
//     });

//   } catch (error) {
//     console.error('Update routing error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Approve routing
// // @route   POST /api/routings/:id/approve
// // @access  Manager
// // @desc    Approve routing
// // @route   POST /api/routings/:id/approve
// // @access  Manager
// exports.approveRouting = async (req, res) => {
//   try {
//     const routing = await Routing.findById(req.params.id);

//     if (!routing) {
//       return res.status(404).json({
//         success: false,
//         message: 'Routing not found'
//       });
//     }

//     // ✅ ADD THIS VALIDATION - Check if routing is already approved
//     if (routing.approved_by && routing.approved_at) {
//       return res.status(400).json({
//         success: false,
//         message: `Routing ${routing.routing_id} is already approved. Cannot approve again.`,
//         data: {
//           routing_id: routing.routing_id,
//           routing_name: routing.routing_name,
//           approved_by: routing.approved_by,
//           approved_at: routing.approved_at,
//           already_approved: true
//         }
//       });
//     }

//     // Optional: Check if routing is already deactivated
//     if (routing.is_active === false) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot approve routing ${routing.routing_id} because it is deactivated.`,
//         data: {
//           routing_id: routing.routing_id,
//           routing_name: routing.routing_name,
//           is_active: false
//         }
//       });
//     }

//     routing.approved_by = req.user._id;
//     routing.approved_at = new Date();
//     await routing.save();

//     // Populate the approved_by field for response
//     const populatedRouting = await Routing.findById(routing._id)
//       .populate('approved_by', 'name email');

//     res.status(200).json({
//       success: true,
//       message: 'Routing approved successfully',
//       data: {
//         routing_id: routing.routing_id,
//         routing_name: routing.routing_name,
//         approved_by: populatedRouting.approved_by,
//         approved_at: routing.approved_at
//       }
//     });

//   } catch (error) {
//     console.error('Approve routing error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// // @desc    Delete/Deactivate Routing
// // @route   DELETE /api/routings/:id
// // @access  Admin, Manager
// exports.deleteRouting = async (req, res) => {
//   try {
//     const routing = await Routing.findById(req.params.id);
    
//     if (!routing) {
//       return res.status(404).json({
//         success: false,
//         message: 'Routing not found'
//       });
//     }

//     // Check if routing is used in any open Work Order
//     const WorkOrder = require('mongoose').model('WorkOrder');
//     const openWO = await WorkOrder.findOne({
//       routing_id: routing._id,
//       status: { $in: ['Planned', 'Released', 'In Progress', 'Partially Completed', 'On Hold'] }
//     });

//     if (openWO) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete Routing - used in open Work Order ${openWO.wo_number}`,
//         work_order: {
//           wo_number: openWO.wo_number,
//           status: openWO.status
//         }
//       });
//     }

//     routing.is_active = false;
//     await routing.save();

//     res.json({
//       success: true,
//       message: 'Routing deactivated successfully',
//       data: {
//         routing_id: routing.routing_id,
//         routing_name: routing.routing_name,
//         is_active: false
//       }
//     });

//   } catch (error) {
//     console.error('Delete Routing error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


const Routing = require('../../models/BOM/Routing');
const Machine = require('../../models/BOM/Machine');
const ProcessMaster = require('../../models/CRM/Process');
const Item = require('../../models/CRM/Item');
const mongoose = require('mongoose');

// ─── Helper: Generate Routing ID ─────────────────────────────────────────────
async function generateRoutingId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RTG-${year}${month}`;

  const lastRouting = await Routing.findOne(
    { routing_id: new RegExp(`^${prefix}`) },
    { routing_id: 1 }
  ).sort({ routing_id: -1 });

  let sequence = 1;
  if (lastRouting) {
    const lastSeq = parseInt(lastRouting.routing_id.split('-').pop());
    sequence = lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

// ─── Helper: Prepare operations array ────────────────────────────────────────
function prepareOperations(operations) {
  return operations.map(op => ({
    op_sequence:            op.op_sequence,
    operation_id:           op.operation_id,
    operation_name:         op.operation_name,
    work_centre:            op.work_centre,
    machine_id:             op.machine_id || null,
    is_subcontract:         op.is_subcontract || false,
    subcontract_vendor:     op.subcontract_vendor || null,
    planned_setup_min:      op.planned_setup_min || 0,
    planned_run_min:        op.planned_run_min,
    scrap_pct:              op.scrap_pct || 0,
    description:            op.description || '',
    requires_torque_recording: op.requires_torque_recording || false,
    requires_functional_test:  op.requires_functional_test || false,
    expected_joints:        op.expected_joints || []
  }));
}

// ─── Helper: Validate operation sequences ────────────────────────────────────
function validateSequences(operations) {
  const sequences = operations.map(op => op.op_sequence);

  if (new Set(sequences).size !== sequences.length) {
    return 'Operation sequences must be unique';
  }

  const sortedSequences = [...sequences].sort((a, b) => a - b);
  if (JSON.stringify(sequences) !== JSON.stringify(sortedSequences)) {
    return 'Operations must be in ascending sequence order';
  }

  return null;
}

// ─── Helper: Validate referenced documents ───────────────────────────────────
async function validateOperationRefs(operations) {
  for (const op of operations) {
    const process = await ProcessMaster.findById(op.operation_id);
    if (!process) {
      return `Process not found for operation: ${op.operation_name || op.operation_id}`;
    }

    if (op.machine_id) {
      const machine = await Machine.findById(op.machine_id);
      if (!machine) {
        return `Machine not found: ${op.machine_id}`;
      }
    }
  }
  return null;
}


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create new routing
// @route   POST /api/routings
// @access  Manager, Production
// STATUS on create: always 'Draft'
// ─────────────────────────────────────────────────────────────────────────────
exports.createRouting = async (req, res) => {
  try {
    const {
      routing_name,
      routing_type,
      applicable_items,
      operations,
      version = '1.0'
    } = req.body;

    if (!routing_name || !routing_type || !operations) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: routing_name, routing_type, operations'
      });
    }

    // Validate sequences
    const seqError = validateSequences(operations);
    if (seqError) return res.status(400).json({ success: false, message: seqError });

    // Validate DB references
    const refError = await validateOperationRefs(operations);
    if (refError) return res.status(404).json({ success: false, message: refError });

    // Validate applicable items
    if (applicable_items && applicable_items.length > 0) {
      const items = await Item.find({ _id: { $in: applicable_items } });
      if (items.length !== applicable_items.length) {
        return res.status(404).json({ success: false, message: 'Some applicable items not found' });
      }
    }

    const routing_id = await generateRoutingId();
    const preparedOperations = prepareOperations(operations);

    const routing = await Routing.create({
      routing_id,
      routing_name,
      routing_type,
      applicable_items: applicable_items || [],
      operations: preparedOperations,
      version,
      status: 'Draft',         // Always starts as Draft
      is_active: true,
      created_by: req.user._id,
      total_cycle_time_min: preparedOperations.reduce((sum, op) => sum + (op.planned_run_min || 0), 0)
    });

    const populatedRouting = await Routing.findById(routing._id)
      .populate('operations.operation_id', 'process_name rate_type standard_rate')
      .populate('operations.machine_id', 'machine_name machine_code')
      .populate('applicable_items', 'part_no part_description')
      .populate('created_by', 'name email');

    res.status(201).json({
      success: true,
      message: 'Routing created successfully',
      data: populatedRouting
    });

  } catch (error) {
    console.error('Create routing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all routings
// @route   GET /api/routings
// @access  All roles
// ─────────────────────────────────────────────────────────────────────────────
exports.getRoutings = async (req, res) => {
  try {
    const {
      routing_type,
      is_active,
      status,
      applicable_item,
      page  = 1,
      limit = 20,
      sort  = '-created_at'
    } = req.query;

    const filter = {};
    if (routing_type)       filter.routing_type    = routing_type;
    if (is_active !== undefined) filter.is_active  = is_active === 'true';
    if (status)             filter.status          = status;
    if (applicable_item)    filter.applicable_items = applicable_item;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const routings = await Routing.find(filter)
      .populate('operations.operation_id', 'process_name rate_type')
      .populate('operations.machine_id', 'machine_name machine_code')
      .populate('applicable_items', 'part_no part_description')
      .populate('created_by', 'name email')
      .populate('approved_by', 'name email')
      .populate('rejected_by', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Routing.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: routings,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get routings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get routing by ID
// @route   GET /api/routings/:id
// @access  All roles
// ─────────────────────────────────────────────────────────────────────────────
exports.getRoutingById = async (req, res) => {
  try {
    const routing = await Routing.findById(req.params.id)
      .populate('operations.operation_id', 'process_name rate_type standard_rate description')
      .populate('operations.machine_id', 'machine_name machine_code work_centre capacity_value')
      .populate('operations.subcontract_vendor', 'vendor_name vendor_code gstin')
      .populate('applicable_items', 'part_no part_description item_category')
      .populate('created_by', 'name email')
      .populate('approved_by', 'name email')
      .populate('rejected_by', 'name email')
      .populate('updated_by', 'name email');

    if (!routing) {
      return res.status(404).json({ success: false, message: 'Routing not found' });
    }

    res.status(200).json({ success: true, data: routing });

  } catch (error) {
    console.error('Get routing by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get routings by item
// @route   GET /api/routings/by-item/:item_id
// @access  All roles
// ─────────────────────────────────────────────────────────────────────────────
exports.getRoutingsByItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    const routings = await Routing.find({
      applicable_items: item_id,
      is_active: true
    })
      .populate('operations.operation_id', 'process_name')
      .sort({ version: -1 });

    res.status(200).json({ success: true, data: routings });

  } catch (error) {
    console.error('Get routings by item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update routing
// @route   PUT /api/routings/:id
// @access  Manager
//
// EDIT RULES:
//   - Draft   → can be freely edited
//   - Active  → can be edited (manager may need to correct before approval)
//   - Approved → CANNOT be edited (must reject first, then re-activate)
//   - Rejected → can be edited (fix issues, then re-activate via /activate)
//   - is_active=false (soft-deleted) → cannot be edited
// ─────────────────────────────────────────────────────────────────────────────
exports.updateRouting = async (req, res) => {
  try {
    const routing = await Routing.findById(req.params.id);

    if (!routing) {
      return res.status(404).json({ success: false, message: 'Routing not found' });
    }

    // Guard: soft-deleted
    if (!routing.is_active) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit routing ${routing.routing_id} — it is deactivated (soft-deleted).`
      });
    }

    // Guard: Approved routings are locked
    if (routing.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit routing ${routing.routing_id} — it is already Approved. Reject it first, correct it, then re-activate before re-approving.`
      });
    }

    const { routing_name, routing_type, applicable_items, operations, is_active } = req.body;

    if (operations) {
      const seqError = validateSequences(operations);
      if (seqError) return res.status(400).json({ success: false, message: seqError });
    }

    const updateData = { updated_by: req.user._id };

    if (routing_name    !== undefined) updateData.routing_name    = routing_name;
    if (routing_type    !== undefined) updateData.routing_type    = routing_type;
    if (applicable_items !== undefined) updateData.applicable_items = applicable_items;
    if (is_active        !== undefined) updateData.is_active       = is_active;

    if (operations !== undefined) {
      const preparedOperations = prepareOperations(operations);
      updateData.operations            = preparedOperations;
      updateData.total_cycle_time_min  = preparedOperations.reduce((sum, op) => sum + (op.planned_run_min || 0), 0);

      // If the routing was Rejected and ops are updated, reset to Draft so it must go through
      // the activate → approve flow again
      if (routing.status === 'Rejected') {
        updateData.status        = 'Draft';
        updateData.rejected_by   = undefined;
        updateData.rejected_at   = undefined;
        updateData.rejection_reason = undefined;
      }
    }

    const updatedRouting = await Routing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('operations.operation_id', 'process_name rate_type')
      .populate('operations.machine_id', 'machine_name machine_code')
      .populate('applicable_items', 'part_no part_description')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    res.status(200).json({
      success: true,
      message: 'Routing updated successfully',
      data: updatedRouting
    });

  } catch (error) {
    console.error('Update routing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Activate routing (Draft → Active)
// @route   POST /api/routings/:id/activate
// @access  Manager
//
// Moves routing from Draft (or Rejected after fixes) to Active.
// Only Active routings can be Approved or Rejected.
// ─────────────────────────────────────────────────────────────────────────────
exports.activateRouting = async (req, res) => {
  try {
    const routing = await Routing.findById(req.params.id);

    if (!routing) {
      return res.status(404).json({ success: false, message: 'Routing not found' });
    }

    if (!routing.is_active) {
      return res.status(400).json({
        success: false,
        message: `Cannot activate routing ${routing.routing_id} — it is deactivated (soft-deleted).`
      });
    }

    if (routing.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: `Routing ${routing.routing_id} is already Active.`
      });
    }

    if (routing.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Routing ${routing.routing_id} is already Approved. Reject it first if changes are needed.`
      });
    }

    // Allow: Draft → Active, Rejected → Active (after corrections)
    routing.status      = 'Active';
    // Clear any prior rejection data when re-activating
    routing.rejected_by      = undefined;
    routing.rejected_at      = undefined;
    routing.rejection_reason = undefined;
    routing.updated_by       = req.user._id;

    await routing.save();

    res.status(200).json({
      success: true,
      message: `Routing ${routing.routing_id} is now Active and ready for approval review.`,
      data: {
        routing_id:   routing.routing_id,
        routing_name: routing.routing_name,
        status:       routing.status
      }
    });

  } catch (error) {
    console.error('Activate routing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve routing (Active → Approved)
// @route   POST /api/routings/:id/approve
// @access  Manager
//
// APPROVE RULES:
//   - Routing MUST be in 'Active' status to be approved.
//   - Draft routings cannot be approved (must activate first).
//   - Already Approved → blocked.
//   - Rejected → must re-activate first, then approve.
//   - Soft-deleted (is_active=false) → blocked.
// ─────────────────────────────────────────────────────────────────────────────
exports.approveRouting = async (req, res) => {
  try {
    const routing = await Routing.findById(req.params.id);

    if (!routing) {
      return res.status(404).json({ success: false, message: 'Routing not found' });
    }

    // Guard: soft-deleted
    if (!routing.is_active) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve routing ${routing.routing_id} — it is deactivated (soft-deleted).`
      });
    }

    // Guard: must be Active to approve
    if (routing.status === 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve routing ${routing.routing_id} — it is in Draft status. Activate it first via POST /api/routings/${req.params.id}/activate.`,
        data: { routing_id: routing.routing_id, status: routing.status }
      });
    }

    if (routing.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Routing ${routing.routing_id} is already Approved.`,
        data: {
          routing_id:   routing.routing_id,
          routing_name: routing.routing_name,
          approved_by:  routing.approved_by,
          approved_at:  routing.approved_at,
          already_approved: true
        }
      });
    }

    if (routing.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve routing ${routing.routing_id} — it is Rejected. Re-activate it first via POST /api/routings/${req.params.id}/activate.`,
        data: { routing_id: routing.routing_id, status: routing.status }
      });
    }

    // ✅ Status is 'Active' — proceed
    routing.status      = 'Approved';
    routing.approved_by = req.user._id;
    routing.approved_at = new Date();
    // Clear any stale rejection data
    routing.rejected_by      = undefined;
    routing.rejected_at      = undefined;
    routing.rejection_reason = undefined;
    routing.updated_by       = req.user._id;

    await routing.save();

    const populatedRouting = await Routing.findById(routing._id)
      .populate('approved_by', 'name email');

    res.status(200).json({
      success: true,
      message: `Routing ${routing.routing_id} approved successfully for production use.`,
      data: {
        routing_id:   routing.routing_id,
        routing_name: routing.routing_name,
        status:       routing.status,
        approved_by:  populatedRouting.approved_by,
        approved_at:  routing.approved_at
      }
    });

  } catch (error) {
    console.error('Approve routing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject routing (Active or Approved → Rejected)
// @route   POST /api/routings/:id/reject
// @access  Manager
//
// REJECT RULES:
//   - Can reject an 'Active' routing (failed review before approval).
//   - Can reject an 'Approved' routing (found issues after approval).
//   - Cannot reject a 'Draft' — it hasn't been submitted for review.
//   - Cannot reject an already 'Rejected' routing.
//   - Soft-deleted → blocked.
//   - rejection_reason is required.
//
// AFTER REJECTION: User must edit the routing, then re-activate before
//   re-submitting for approval.
// ─────────────────────────────────────────────────────────────────────────────
exports.rejectRouting = async (req, res) => {
  try {
    const routing = await Routing.findById(req.params.id);

    if (!routing) {
      return res.status(404).json({ success: false, message: 'Routing not found' });
    }

    // Guard: soft-deleted
    if (!routing.is_active) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject routing ${routing.routing_id} — it is deactivated (soft-deleted).`
      });
    }

    // Guard: rejection_reason required
    const { rejection_reason } = req.body;
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'rejection_reason is required when rejecting a routing.'
      });
    }

    // Guard: cannot reject Draft (not yet submitted)
    if (routing.status === 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject routing ${routing.routing_id} — it is still in Draft. Activate it first if you want to review it.`,
        data: { routing_id: routing.routing_id, status: routing.status }
      });
    }

    // Guard: already Rejected
    if (routing.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Routing ${routing.routing_id} is already Rejected.`,
        data: {
          routing_id:       routing.routing_id,
          rejection_reason: routing.rejection_reason,
          rejected_by:      routing.rejected_by,
          rejected_at:      routing.rejected_at
        }
      });
    }

    // ✅ Status is 'Active' or 'Approved' — proceed with rejection
    routing.status           = 'Rejected';
    routing.rejected_by      = req.user._id;
    routing.rejected_at      = new Date();
    routing.rejection_reason = rejection_reason.trim();
    routing.updated_by       = req.user._id;

    // Clear approval data if it was previously approved
    if (routing.approved_by) {
      routing.approved_by = undefined;
      routing.approved_at = undefined;
    }

    await routing.save();

    const populatedRouting = await Routing.findById(routing._id)
      .populate('rejected_by', 'name email');

    res.status(200).json({
      success: true,
      message: `Routing ${routing.routing_id} has been rejected.`,
      data: {
        routing_id:       routing.routing_id,
        routing_name:     routing.routing_name,
        status:           routing.status,
        rejected_by:      populatedRouting.rejected_by,
        rejected_at:      routing.rejected_at,
        rejection_reason: routing.rejection_reason
      }
    });

  } catch (error) {
    console.error('Reject routing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete / Deactivate Routing (soft delete)
// @route   DELETE /api/routings/:id
// @access  Admin, Manager
//
// Sets is_active = false. This is a SOFT DELETE — separate from status.
// Cannot deactivate if routing is used in open Work Orders.
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteRouting = async (req, res) => {
  try {
    const routing = await Routing.findById(req.params.id);

    if (!routing) {
      return res.status(404).json({ success: false, message: 'Routing not found' });
    }

    // Check if routing is used in ANY Work Order (not just open ones)
    const WorkOrder = mongoose.model('WorkOrder');
    const workOrderExists = await WorkOrder.findOne({
      routing_id: routing._id
    });

    if (workOrderExists) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Routing — it is referenced in Work Order ${workOrderExists.wo_number}.`,
        work_order: { 
          wo_number: workOrderExists.wo_number, 
          status: workOrderExists.status 
        }
      });
    }

    // Remove ProductionOrder check if model doesn't exist
    // Only add back when ProductionOrder model is created

    // HARD DELETE - permanently remove from database
    await Routing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Routing ${routing.routing_id} (${routing.routing_name}) has been permanently deleted.`,
      data: {
        routing_id: routing.routing_id,
        routing_name: routing.routing_name,
        deleted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Delete Routing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};