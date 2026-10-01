'use strict';
const mongoose = require('mongoose');
const {
  ProductionSchedule,
  OeeRecord,
  ToolUsage,
  DOWNTIME_TYPES,
} = require('../../models/Production/ProductionSchedule');

const getModel = (name) => mongoose.model(name);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: conflict detection
// ─────────────────────────────────────────────────────────────────────────────
async function detectConflict(machine_id, scheduled_date, shift, start_time, end_time, excludeId = null) {
  const dayStart = new Date(scheduled_date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(scheduled_date);
  dayEnd.setHours(23, 59, 59, 999);

  const query = {
    machine_id,
    scheduled_date: { $gte: dayStart, $lte: dayEnd },
    shift,
    status: { $nin: ['Cancelled', 'Postponed'] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await ProductionSchedule.find(query).lean();

  if (start_time && end_time) {
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const s1 = toMinutes(start_time);
    const e1 = toMinutes(end_time);

    for (const slot of existing) {
      if (!slot.start_time || !slot.end_time) continue;
      const s2 = toMinutes(slot.start_time);
      const e2 = toMinutes(slot.end_time);
      if (s1 < e2 && s2 < e1) {
        return { conflict: true, conflicting_slot_id: slot._id, conflicting_wo: slot.wo_id };
      }
    }
  }

  return { conflict: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule
// ─────────────────────────────────────────────────────────────────────────────
exports.createScheduleSlot = async (req, res) => {
  try {
    const {
      machine_id, wo_id, operation_seq,
      planned_qty, scheduled_date, shift,
      start_time, end_time, planned_hours, part_no,
    } = req.body;

    if (!machine_id || !wo_id || !operation_seq || !planned_qty || !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: 'Required: machine_id, wo_id, operation_seq, planned_qty, scheduled_date',
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Check for time conflict (overlapping schedules)
    // ─────────────────────────────────────────────────────────────────────────
    const { conflict, conflicting_slot_id, conflicting_wo } = await detectConflict(
      machine_id, new Date(scheduled_date), shift || 'General', start_time, end_time
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Time conflict detected on this machine at the requested time',
        conflict: true,
        conflicting_slot_id,
        conflicting_wo,
        suggestion: 'Choose a different time slot or resolve the conflict first'
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Check for capacity overload (machine has enough hours)
    // ─────────────────────────────────────────────────────────────────────────
    const inputPlannedHours = planned_hours || 0;
    
    // If planned_hours not provided, calculate from Work Order operation
    let effectivePlannedHours = inputPlannedHours;
    if (effectivePlannedHours === 0 && wo_id && operation_seq) {
      try {
        const WorkOrder = getModel('WorkOrder');
        const wo = await WorkOrder.findById(wo_id).lean();
        if (wo && wo.operations) {
          const operation = wo.operations.find(op => op.op_sequence === operation_seq);
          if (operation) {
            // Calculate: setup_min + (run_min_per_pc × planned_qty) / 60
            const setupHours = (operation.planned_setup_min || 0) / 60;
            const runHours = ((operation.planned_run_min || 0) * (operation.planned_qty || planned_qty)) / 60;
            effectivePlannedHours = setupHours + runHours;
          }
        }
      } catch (err) {
        console.warn('[Schedule] Could not calculate planned hours from WO:', err.message);
      }
    }

    const capacityCheck = await checkMachineCapacity(
      machine_id, 
      new Date(scheduled_date), 
      effectivePlannedHours,
      null
    );

    if (capacityCheck.isOverloaded) {
      return res.status(409).json({
        success: false,
        message: `Machine capacity exceeded. Required: ${capacityCheck.totalPlannedHours.toFixed(1)}h, Available: ${capacityCheck.availableHours}h. Overload by: ${capacityCheck.overloadBy.toFixed(1)}h`,
        capacity_check: {
          total_planned_hours: capacityCheck.totalPlannedHours,
          available_hours: capacityCheck.availableHours,
          overload_by: capacityCheck.overloadBy,
          utilization_percent: capacityCheck.utilizationPercent,
          requested_hours: effectivePlannedHours
        },
        suggestions: [
          'Schedule on a different date',
          'Add overtime shift (increase available hours)',
          'Use alternative machine',
          'Split the order across multiple machines'
        ]
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Create the schedule slot (all validations passed)
    // ─────────────────────────────────────────────────────────────────────────
    const slot = await ProductionSchedule.create({
      machine_id,
      wo_id,
      operation_seq,
      planned_qty,
      scheduled_date: new Date(scheduled_date),
      shift:          shift || 'General',
      start_time:     start_time   || '',
      end_time:       end_time     || '',
      planned_hours:  effectivePlannedHours,
      part_no:        part_no      || '',
      conflict:       false,  // No conflict since we validated above
      created_by:     req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Schedule slot created successfully',
      data: {
        slot,
        capacity_usage: {
          scheduled_hours: effectivePlannedHours,
            remaining_capacity: capacityCheck.availableHours - (capacityCheck.totalPlannedHours - effectivePlannedHours),
          total_utilization_percent: capacityCheck.utilizationPercent
        }
      }
    });
  } catch (err) {
    console.error('[Schedule] createScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/production-schedule
// ─────────────────────────────────────────────────────────────────────────────
exports.listScheduleSlots = async (req, res) => {
  try {
    const { machine_id, from, to, shift, status, wo_id } = req.query;

    const filter = {};
    if (machine_id) filter.machine_id = machine_id;
    if (wo_id)      filter.wo_id      = wo_id;
    if (shift)      filter.shift      = shift;
    if (status)     filter.status     = status;
    if (from || to) {
      filter.scheduled_date = {};
      if (from) filter.scheduled_date.$gte = new Date(from);
      if (to)   filter.scheduled_date.$lte = new Date(to);
    }

    const slots = await ProductionSchedule.find(filter)
      .populate('machine_id', 'machine_name machine_code')
      .populate('wo_id', 'wo_number part_no planned_qty status')
      .sort({ machine_id: 1, scheduled_date: 1, start_time: 1 })
      .lean();

    const grouped = {};
    for (const slot of slots) {
      const machineKey = slot.machine_id
        ? (slot.machine_id.machine_code || String(slot.machine_id._id || slot.machine_id))
        : 'unknown';
      const dateKey = new Date(slot.scheduled_date).toISOString().substring(0, 10);
      if (!grouped[machineKey]) grouped[machineKey] = {};
      if (!grouped[machineKey][dateKey]) grouped[machineKey][dateKey] = [];
      grouped[machineKey][dateKey].push(slot);
    }

    return res.json({
      success: true,
      data: slots,
      grouped_view: grouped,
      total: slots.length,
    });
  } catch (err) {
    console.error('[Schedule] listScheduleSlots:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/production-schedule/conflicts
// ─────────────────────────────────────────────────────────────────────────────
exports.getConflicts = async (req, res) => {
  try {
    const conflicts = await ProductionSchedule.find({ conflict: true })
      .populate('machine_id', 'machine_name machine_code')
      .populate('wo_id', 'wo_number part_no planned_qty status priority')
      .sort({ scheduled_date: 1, machine_id: 1 })
      .lean();

    return res.json({ success: true, count: conflicts.length, data: conflicts });
  } catch (err) {
    console.error('[Schedule] getConflicts:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/production-schedule/:id
// Reschedule slot + re-check conflict
// ─────────────────────────────────────────────────────────────────────────────
// exports.updateScheduleSlot = async (req, res) => {
//   try {
//     const slot = await ProductionSchedule.findById(req.params.id);
//     if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

//     const {
//       scheduled_date, shift, start_time, end_time,
//       planned_hours, planned_qty, status,
//     } = req.body;
// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/production-schedule/:id
// Reschedule slot + re-check conflict and capacity
// ─────────────────────────────────────────────────────────────────────────────
exports.updateScheduleSlot = async (req, res) => {
  try {
    const slot = await ProductionSchedule.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

    const {
      scheduled_date, shift, start_time, end_time,
      planned_hours, planned_qty, status,
    } = req.body;

    // ─── Status transition validation ───────────────────────────────────
    if (status && status !== slot.status) {
      if (!isValidScheduleTransition(slot.status, status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition: ${slot.status} → ${status}`,
          allowed: (() => {
            const transitions = {
              'Planned': ['Confirmed', 'Postponed', 'Cancelled'],
              'Confirmed': ['In Progress', 'Postponed', 'Cancelled'],
              'In Progress': ['Completed', 'Postponed', 'Cancelled'],
              'Completed': [],
              'Postponed': ['Planned', 'Cancelled'],
              'Cancelled': []
            };
            return transitions[slot.status] || [];
          })()
        });
      }
    }

    // Prepare new values
    const newScheduledDate = scheduled_date ? new Date(scheduled_date) : slot.scheduled_date;
    const newShift = shift || slot.shift;
    const newStartTime = start_time !== undefined ? start_time : slot.start_time;
    const newEndTime = end_time !== undefined ? end_time : slot.end_time;
    const newPlannedHours = planned_hours !== undefined ? planned_hours : slot.planned_hours;
    const newPlannedQty = planned_qty !== undefined ? planned_qty : slot.planned_qty;

    // ─── Check for time conflict ────────────────────────────────────────
    const { conflict, conflicting_slot_id } = await detectConflict(
      slot.machine_id, newScheduledDate, newShift,
      newStartTime, newEndTime, slot._id
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Cannot reschedule: Time conflict detected',
        conflict: true,
        conflicting_slot_id,
        suggestion: 'Choose a different time slot or resolve the conflict first'
      });
    }

    // ─── Check for capacity overload ────────────────────────────────────
    const capacityCheck = await checkMachineCapacity(
      slot.machine_id,
      newScheduledDate,
      newPlannedHours,
      slot._id
    );

    if (capacityCheck.isOverloaded) {
      return res.status(409).json({
        success: false,
        message: `Cannot reschedule: Machine capacity would be exceeded. Total: ${capacityCheck.totalPlannedHours.toFixed(1)}h, Available: ${capacityCheck.availableHours}h`,
        capacity_check: {
          total_planned_hours: capacityCheck.totalPlannedHours,
          available_hours: capacityCheck.availableHours,
          overload_by: capacityCheck.overloadBy,
          utilization_percent: capacityCheck.utilizationPercent
        },
        suggestions: [
          'Choose a different date',
          'Reduce the planned hours',
          'Use alternative machine'
        ]
      });
    }

    // ─── Apply updates ──────────────────────────────────────────────────
    slot.scheduled_date = newScheduledDate;
    slot.shift = newShift;
    slot.start_time = newStartTime;
    slot.end_time = newEndTime;
    slot.planned_hours = newPlannedHours;
    if (newPlannedQty !== undefined) slot.planned_qty = newPlannedQty;
    if (status) slot.status = status;
    slot.conflict = false;  // No conflict after validation
    slot.updated_by = req.user._id;

    await slot.save();

    return res.json({
      success: true,
      message: 'Slot rescheduled successfully',
      data: {
        slot,
        capacity_after_reschedule: {
          total_planned_hours: capacityCheck.totalPlannedHours,
          available_hours: capacityCheck.availableHours,
          remaining_capacity: capacityCheck.availableHours - (capacityCheck.totalPlannedHours - newPlannedHours),
          utilization_percent: capacityCheck.utilizationPercent
        }
      }
    });
  } catch (err) {
    console.error('[Schedule] updateScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule/:id/complete
// NEW — Mark slot completed, record actual_hours
// ─────────────────────────────────────────────────────────────────────────────
exports.completeScheduleSlot = async (req, res) => {
  try {
    const slot = await ProductionSchedule.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

    if (slot.status === 'Cancelled' || slot.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Slot is already ${slot.status}. Cannot complete.`,
      });
    }

    const { actual_hours, actual_qty } = req.body;
    if (actual_hours == null) {
      return res.status(400).json({ success: false, message: 'actual_hours is required to complete a slot' });
    }

    slot.actual_hours = actual_hours;
    if (actual_qty != null) slot.planned_qty = actual_qty; // optionally record actual produced qty
    slot.status     = 'Completed';
    slot.updated_by = req.user._id;
    await slot.save();

    return res.json({
      success: true,
      message: 'Schedule slot marked completed',
      data: {
        _id:          slot._id,
        schedule_id:  slot.schedule_id,
        planned_hours: slot.planned_hours,
        actual_hours:  slot.actual_hours,
        utilization:   slot.planned_hours > 0
          ? +((slot.actual_hours / slot.planned_hours) * 100).toFixed(1)
          : null,
      },
    });
  } catch (err) {
    console.error('[Schedule] completeScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/machines/:id/loading
// Machine loading: planned vs available hours per day
// ─────────────────────────────────────────────────────────────────────────────
exports.getMachineLoading = async (req, res) => {
  try {
    const { from, to } = req.query;
    const machine_id   = req.params.id;

    const filter = { machine_id };
    if (from || to) {
      filter.scheduled_date = {};
      if (from) filter.scheduled_date.$gte = new Date(from);
      if (to)   filter.scheduled_date.$lte = new Date(to);
    }

    const slots = await ProductionSchedule.find(filter)
      .select('scheduled_date shift planned_hours actual_hours status conflict')
      .lean();

    const byDate = {};
    for (const slot of slots) {
      const d = new Date(slot.scheduled_date).toISOString().substring(0, 10);
      if (!byDate[d]) byDate[d] = { planned_hours: 0, actual_hours: 0, slot_count: 0, conflicts: 0 };
      byDate[d].planned_hours += slot.planned_hours || 0;
      byDate[d].actual_hours  += slot.actual_hours  || 0;
      byDate[d].slot_count    += 1;
      if (slot.conflict) byDate[d].conflicts += 1;
    }

    let machineAvailableHours = 8;
    try {
      const Machine = getModel('Machine');
      const machine = await Machine.findById(machine_id).lean();
      if (machine) machineAvailableHours = machine.available_hours_per_day || 8;
    } catch { /* Machine model not available */ }

    const loading = Object.entries(byDate).map(([date, data]) => ({
      date,
      planned_hours:       +data.planned_hours.toFixed(2),
      actual_hours:        +data.actual_hours.toFixed(2),
      available_hours:     machineAvailableHours,
      utilization_percent: machineAvailableHours > 0
        ? +(data.planned_hours / machineAvailableHours * 100).toFixed(1)
        : 0,
      slot_count: data.slot_count,
      conflicts:  data.conflicts,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ success: true, machine_id, data: loading });
  } catch (err) {
    console.error('[Schedule] getMachineLoading:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/oee-records
// ─────────────────────────────────────────────────────────────────────────────
exports.createOeeRecord = async (req, res) => {
  try {
    const {
      machine_id, date, shift,
      planned_production_time, actual_run_time,
      good_qty, total_qty, theoretical_capacity,
      notes, downtime_log,
    } = req.body;

    if (!machine_id || !date || !planned_production_time || good_qty == null || total_qty == null) {
      return res.status(400).json({
        success: false,
        message: 'Required: machine_id, date, planned_production_time, good_qty, total_qty',
      });
    }

    const existing = await OeeRecord.findOne({
      machine_id,
      date:  new Date(date),
      shift: shift || 'General',
    });
    if (existing) {
      return res.status(409).json({
        success:     false,
        message:     'OEE record already exists for this machine/date/shift. Use PUT /api/oee-records/:id to update.',
        existing_id: existing._id,
      });
    }

    const record = await OeeRecord.create({
      machine_id,
      date:                    new Date(date),
      shift:                   shift || 'General',
      planned_production_time,
      actual_run_time:         actual_run_time || planned_production_time,
      theoretical_capacity:    theoretical_capacity || 0,
      good_qty,
      total_qty,
      downtime_log:            downtime_log || [],
      notes:                   notes || '',
      recorded_by:             req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'OEE record created',
      data: {
        _id:                record._id,
        availability:       +(record.availability * 100).toFixed(1),
        performance:        +(record.performance  * 100).toFixed(1),
        quality:            +(record.quality      * 100).toFixed(1),
        oee:                +(record.oee          * 100).toFixed(1),
        total_downtime_min: record.total_downtime_min,
      },
    });
  } catch (err) {
    console.error('[Schedule] createOeeRecord:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/oee-records/:id
// NEW — Update OEE record fields + recompute OEE
// ─────────────────────────────────────────────────────────────────────────────
exports.updateOeeRecord = async (req, res) => {
  try {
    const record = await OeeRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'OEE record not found' });

    const {
      planned_production_time, actual_run_time,
      good_qty, total_qty, theoretical_capacity, notes,
    } = req.body;

    if (planned_production_time != null) record.planned_production_time = planned_production_time;
    if (actual_run_time         != null) record.actual_run_time         = actual_run_time;
    if (good_qty                != null) record.good_qty                = good_qty;
    if (total_qty               != null) record.total_qty               = total_qty;
    if (theoretical_capacity    != null) record.theoretical_capacity    = theoretical_capacity;
    if (notes                   != null) record.notes                   = notes;

    // Pre-save hook recomputes OEE automatically
    await record.save();

    return res.json({
      success: true,
      message: 'OEE record updated and recomputed',
      data: {
        _id:                record._id,
        availability:       +(record.availability * 100).toFixed(1),
        performance:        +(record.performance  * 100).toFixed(1),
        quality:            +(record.quality      * 100).toFixed(1),
        oee:                +(record.oee          * 100).toFixed(1),
        total_downtime_min: record.total_downtime_min,
      },
    });
  } catch (err) {
    console.error('[Schedule] updateOeeRecord:', err);
    return res.status(500).json({ success: false, message: err.message });


  }
};


// ─── Status transition validation ─────────────────────────────────────────────
function isValidScheduleTransition(from, to) {
  const transitions = {
    'Planned':     ['Confirmed', 'Postponed', 'Cancelled'],
    'Confirmed':   ['In Progress', 'Postponed', 'Cancelled'],
    'In Progress': ['Completed', 'Postponed', 'Cancelled'],
    'Completed':   [],
    'Postponed':   ['Planned', 'Cancelled'],
    'Cancelled':   []
  };
  return (transitions[from] || []).includes(to);
}
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule/:id/confirm
// Confirm a schedule slot (Planned → Confirmed)
// ─────────────────────────────────────────────────────────────────────────────
exports.confirmScheduleSlot = async (req, res) => {
  try {
    const slot = await ProductionSchedule.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Schedule slot not found' });
    }

    // Validate current status
    if (slot.status !== 'Planned') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm slot with status: ${slot.status}. Only Planned slots can be confirmed.`,
        current_status: slot.status,
        allowed_statuses: ['Planned']
      });
    }

    // Update status
    slot.status = 'Confirmed';
    slot.updated_by = req.user._id;
    await slot.save();

    return res.json({
      success: true,
      message: 'Schedule slot confirmed successfully',
      data: {
        _id: slot._id,
        schedule_id: slot.schedule_id,
        status: slot.status,
        confirmed_at: new Date(),
        confirmed_by: req.user._id
      }
    });
  } catch (err) {
    console.error('[Schedule] confirmScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule/:id/start
// Start production on schedule slot (Confirmed → In Progress)
// ─────────────────────────────────────────────────────────────────────────────
exports.startScheduleSlot = async (req, res) => {
  try {
    const slot = await ProductionSchedule.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Schedule slot not found' });
    }

    // Validate current status
    if (slot.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot start slot with status: ${slot.status}. Must be Confirmed.`,
        current_status: slot.status,
        allowed_statuses: ['Confirmed']
      });
    }

    // Optional: Verify that the Work Order operation is actually In Progress
    try {
      const WorkOrder = getModel('WorkOrder');
      const wo = await WorkOrder.findById(slot.wo_id);
      if (wo) {
        const operation = wo.operations.find(o => o.op_sequence === slot.operation_seq);
        if (operation && operation.status !== 'In Progress') {
          return res.status(400).json({
            success: false,
            message: `Cannot start schedule slot. Work Order operation ${slot.operation_seq} status is: ${operation.status}. Expected: In Progress`,
            wo_status: wo.status,
            op_status: operation.status
          });
        }
      }
    } catch (err) {
      console.warn('[Schedule] Could not verify WO status:', err.message);
    }

    // Update status
    slot.status = 'In Progress';
    slot.updated_by = req.user._id;
    await slot.save();

    return res.json({
      success: true,
      message: 'Production started on schedule slot',
      data: {
        _id: slot._id,
        schedule_id: slot.schedule_id,
        status: slot.status,
        started_at: new Date(),
        started_by: req.user._id
      }
    });
  } catch (err) {
    console.error('[Schedule] startScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule/:id/cancel
// Cancel schedule slot with reason
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelScheduleSlot = async (req, res) => {
  try {
    const { cancel_reason } = req.body;
    if (!cancel_reason || !cancel_reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'cancel_reason is required to cancel a schedule slot'
      });
    }

    const slot = await ProductionSchedule.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Schedule slot not found' });
    }

    // Define which statuses can be cancelled
    const cancellableStatuses = ['Planned', 'Confirmed', 'Postponed'];
    if (!cancellableStatuses.includes(slot.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel slot with status: ${slot.status}. Only ${cancellableStatuses.join(', ')} slots can be cancelled.`,
        current_status: slot.status,
        allowed_statuses: cancellableStatuses
      });
    }

    // Store cancel reason (you may want to add a cancel_reason field to schema)
    // For now, store in notes field
    const previousNotes = slot.notes || '';
    slot.notes = `[CANCELLED: ${cancel_reason}] ${previousNotes}`.trim();
    slot.status = 'Cancelled';
    slot.updated_by = req.user._id;
    await slot.save();

    return res.json({
      success: true,
      message: 'Schedule slot cancelled successfully',
      data: {
        _id: slot._id,
        schedule_id: slot.schedule_id,
        status: slot.status,
        cancel_reason: cancel_reason,
        cancelled_at: new Date(),
        cancelled_by: req.user._id
      }
    });
  } catch (err) {
    console.error('[Schedule] cancelScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/production-schedule/:id/postpone
// Postpone schedule slot to new date/time
// ─────────────────────────────────────────────────────────────────────────────
exports.postponeScheduleSlot = async (req, res) => {
  try {
    const {
      new_scheduled_date,
      new_shift,
      new_start_time,
      new_end_time,
      postpone_reason
    } = req.body;

    if (!new_scheduled_date || !postpone_reason) {
      return res.status(400).json({
        success: false,
        message: 'Required: new_scheduled_date and postpone_reason'
      });
    }

    const slot = await ProductionSchedule.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Schedule slot not found' });
    }

    // Define which statuses can be postponed
    const postponableStatuses = ['Planned', 'Confirmed', 'In Progress'];
    if (!postponableStatuses.includes(slot.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot postpone slot with status: ${slot.status}. Only ${postponableStatuses.join(', ')} slots can be postponed.`,
        current_status: slot.status,
        allowed_statuses: postponableStatuses
      });
    }

    // Check for conflicts on new date/time
    const newShift = new_shift || slot.shift;
    const newStartTime = new_start_time || slot.start_time;
    const newEndTime = new_end_time || slot.end_time;

    const { conflict, conflicting_slot_id } = await detectConflict(
      slot.machine_id,
      new Date(new_scheduled_date),
      newShift,
      newStartTime,
      newEndTime,
      slot._id
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Cannot postpone: Time conflict detected on new schedule',
        conflict: true,
        conflicting_slot_id: conflicting_slot_id,
        suggestion: 'Choose a different date/time or resolve the conflict first'
      });
    }

    // Mark current slot as postponed
    const originalStatus = slot.status;
    const postponeNotes = `[POSTPONED: ${postpone_reason}] Original: ${slot.scheduled_date.toISOString().substring(0, 10)} ${slot.shift} ${slot.start_time}-${slot.end_time}`;
    const previousNotes = slot.notes || '';
    slot.notes = `${postponeNotes} ${previousNotes}`.trim();
    slot.status = 'Postponed';
    slot.updated_by = req.user._id;
    await slot.save();

    // Create new slot with updated date/time
    const newSlot = await ProductionSchedule.create({
      machine_id: slot.machine_id,
      wo_id: slot.wo_id,
      operation_seq: slot.operation_seq,
      part_no: slot.part_no,
      planned_qty: slot.planned_qty,
      scheduled_date: new Date(new_scheduled_date),
      shift: newShift,
      start_time: newStartTime,
      end_time: newEndTime,
      planned_hours: slot.planned_hours,
      status: 'Planned',  // New slot starts as Planned
      conflict: conflict,
      created_by: req.user._id,
      notes: `Rescheduled from original slot ${slot.schedule_id} (${originalStatus})`
    });

    return res.status(201).json({
      success: true,
      message: `Schedule slot postponed. New slot created for ${new_scheduled_date}`,
      data: {
        original_slot: {
          _id: slot._id,
          schedule_id: slot.schedule_id,
          status: slot.status,
          original_date: slot.scheduled_date,
          postpone_reason: postpone_reason
        },
        new_slot: {
          _id: newSlot._id,
          schedule_id: newSlot.schedule_id,
          status: newSlot.status,
          scheduled_date: newSlot.scheduled_date,
          shift: newSlot.shift,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time
        }
      }
    });
  } catch (err) {
    console.error('[Schedule] postponeScheduleSlot:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
// GET /api/oee-records
// NEW — List OEE records with filters
// ─────────────────────────────────────────────────────────────────────────────
exports.listOeeRecords = async (req, res) => {
  try {
    const { machine_id, from, to, shift } = req.query;

    const filter = {};
    if (machine_id) filter.machine_id = machine_id;
    if (shift)      filter.shift      = shift;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const records = await OeeRecord.find(filter)
      .populate('machine_id', 'machine_name machine_code')
      .sort({ date: -1 })
      .lean();

    const data = records.map(r => ({
      ...r,
      availability: +(r.availability * 100).toFixed(1),
      performance:  +(r.performance  * 100).toFixed(1),
      quality:      +(r.quality      * 100).toFixed(1),
      oee:          +(r.oee          * 100).toFixed(1),
    }));

    return res.json({ success: true, total: data.length, data });
  } catch (err) {
    console.error('[Schedule] listOeeRecords:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete OEE Record
// @route   DELETE /api/oee-records/:id
// @access  Admin, Manager
exports.deleteOeeRecord = async (req, res) => {
  try {
    const oeeRecord = await OeeRecord.findById(req.params.id);
    
    if (!oeeRecord) {
      return res.status(404).json({
        success: false,
        message: 'OEE Record not found'
      });
    }

    // Optional: Check if OEE record is older than allowed deletion period
    // Example: Can only delete records older than 30 days?
    const daysOld = (Date.now() - new Date(oeeRecord.date)) / (1000 * 60 * 60 * 24);
    const MAX_DELETE_DAYS = process.env.OEE_DELETE_DAYS || 90;
    
    if (daysOld > MAX_DELETE_DAYS) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete OEE record older than ${MAX_DELETE_DAYS} days. Record is ${Math.floor(daysOld)} days old.`,
        record_date: oeeRecord.date
      });
    }

    // Check if this OEE record is referenced in any production reports
    // (Soft warning only - proceed with deletion)
    
    const deletedRecord = await OeeRecord.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'OEE Record deleted successfully',
      data: {
        machine_id: deletedRecord.machine_id,
        date: deletedRecord.date,
        shift: deletedRecord.shift,
        oee: deletedRecord.oee
      }
    });

  } catch (error) {
    console.error('Delete OEE Record error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/downtime-logs
// ─────────────────────────────────────────────────────────────────────────────
exports.addDowntimeLog = async (req, res) => {
  try {
    const {
      oee_record_id,
      type, start_time, end_time, root_cause, action_taken,
    } = req.body;

    if (!oee_record_id || !type || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Required: oee_record_id, type, start_time, end_time',
      });
    }

    // Validate type against canonical enum
    if (!DOWNTIME_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed: ${DOWNTIME_TYPES.join(', ')}`,
      });
    }

    const record = await OeeRecord.findById(oee_record_id);
    if (!record) return res.status(404).json({ success: false, message: 'OEE Record not found' });

    const durationMin = +((new Date(end_time) - new Date(start_time)) / 60000).toFixed(1);
    if (durationMin <= 0) {
      return res.status(400).json({ success: false, message: 'end_time must be after start_time' });
    }

    record.downtime_log.push({
      type,
      start_time:   new Date(start_time),
      end_time:     new Date(end_time),
      duration_min: durationMin,
      root_cause:   root_cause   || '',
      action_taken: action_taken || '',
      logged_by:    req.user._id,
    });

    // Pre-save hook recomputes OEE
    await record.save();

    return res.status(201).json({
      success: true,
      message: 'Downtime logged. OEE recomputed.',
      data: {
        duration_min:         durationMin,
        total_downtime_min:   record.total_downtime_min,
        updated_availability: +(record.availability * 100).toFixed(1),
        updated_performance:  +(record.performance  * 100).toFixed(1),
        updated_quality:      +(record.quality      * 100).toFixed(1),
        updated_oee:          +(record.oee          * 100).toFixed(1),
      },
    });
  } catch (err) {
    console.error('[Schedule] addDowntimeLog:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/machines/:id/oee-trend
// ─────────────────────────────────────────────────────────────────────────────
exports.getOeeTrend = async (req, res) => {
  try {
    const machine_id = req.params.id;
    const { from, to, shift } = req.query;

    const filter = { machine_id };
    if (shift) filter.shift = shift;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const records = await OeeRecord.find(filter)
      .sort({ date: 1 })
      .select('date shift availability performance quality oee total_downtime_min good_qty total_qty')
      .lean();

    const trend = records.map(r => ({
      date:         new Date(r.date).toISOString().substring(0, 10),
      shift:        r.shift,
      availability: +(r.availability * 100).toFixed(1),
      performance:  +(r.performance  * 100).toFixed(1),
      quality:      +(r.quality      * 100).toFixed(1),
      oee:          +(r.oee          * 100).toFixed(1),
      downtime_min: r.total_downtime_min,
      good_qty:     r.good_qty,
      total_qty:    r.total_qty,
    }));

    const avgOee = trend.length > 0
      ? +(trend.reduce((s, r) => s + r.oee, 0) / trend.length).toFixed(1)
      : 0;

    return res.json({
      success: true,
      machine_id,
      summary: {
        period_from:  from || trend[0]?.date,
        period_to:    to   || trend[trend.length - 1]?.date,
        record_count: trend.length,
        avg_oee:      avgOee,
      },
      data: trend,
    });
  } catch (err) {
    console.error('[Schedule] getOeeTrend:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tool-usage
// ─────────────────────────────────────────────────────────────────────────────
exports.recordToolUsage = async (req, res) => {
  try {
    const {
      tool_id, wo_id, operation_seq, machine_id,
      shots_fired, usage_date, notes,
    } = req.body;

    if (!tool_id || !wo_id || !operation_seq || !shots_fired) {
      return res.status(400).json({
        success: false,
        message: 'Required: tool_id, wo_id, operation_seq, shots_fired',
      });
    }

    let shotsAfter      = shots_fired;
    let maxShots        = 0;
    let shotsBefore     = 0;
    let nearMaintenance = false;

    try {
      const ToolMaster = getModel('ToolMaster');
      const tool = await ToolMaster.findById(tool_id);
      if (tool) {
        shotsBefore     = tool.current_shots || 0;
        maxShots        = tool.max_shots     || 0;
        shotsAfter      = shotsBefore + shots_fired;
        tool.current_shots = shotsAfter;
        tool.last_used     = new Date();
        nearMaintenance    = maxShots > 0 && shotsAfter > maxShots * 0.9;
        if (nearMaintenance) {
          tool.maintenance_alert = true;
          console.warn(`[ToolUsage] Tool ${tool_id} at ${((shotsAfter / maxShots) * 100).toFixed(1)}% life`);
        }
        await tool.save();
      }
    } catch { /* ToolMaster model not available */ }

    const usage = await ToolUsage.create({
      tool_id,
      wo_id,
      operation_seq,
      machine_id:       machine_id || null,
      shots_fired,
      usage_date:       usage_date ? new Date(usage_date) : new Date(),
      shots_before:     shotsBefore,
      shots_after:      shotsAfter,
      max_shots:        maxShots,
      near_maintenance: nearMaintenance,
      alert_sent:       nearMaintenance,
      recorded_by:      req.user._id,
      notes:            notes || '',
    });

    return res.status(201).json({
      success: true,
      message: nearMaintenance
        ? `Tool usage recorded — ALERT: Tool at ${maxShots > 0 ? ((shotsAfter / maxShots) * 100).toFixed(1) : '?'}% life. Schedule maintenance!`
        : 'Tool usage recorded',
      near_maintenance: nearMaintenance,
      data: {
        _id:          usage._id,
        shots_before: shotsBefore,
        shots_fired,
        shots_after:  shotsAfter,
        life_percent: maxShots > 0 ? +((shotsAfter / maxShots) * 100).toFixed(1) : null,
      },
    });
  } catch (err) {
    console.error('[Schedule] recordToolUsage:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tool-usage
// NEW — List tool usage history with filters
// ─────────────────────────────────────────────────────────────────────────────
exports.listToolUsage = async (req, res) => {
  try {
    const { tool_id, wo_id, machine_id, from, to, near_maintenance } = req.query;

    const filter = {};
    if (tool_id)         filter.tool_id    = tool_id;
    if (wo_id)           filter.wo_id      = wo_id;
    if (machine_id)      filter.machine_id = machine_id;
    if (near_maintenance === 'true') filter.near_maintenance = true;
    if (from || to) {
      filter.usage_date = {};
      if (from) filter.usage_date.$gte = new Date(from);
      if (to)   filter.usage_date.$lte = new Date(to);
    }

    const records = await ToolUsage.find(filter)
      .populate('tool_id',   'tool_code tool_name max_shots current_shots')
      .populate('wo_id',     'wo_number part_no')
      .populate('machine_id','machine_name machine_code')
      .sort({ usage_date: -1 })
      .lean();

    return res.json({ success: true, total: records.length, data: records });
  } catch (err) {
    console.error('[Schedule] listToolUsage:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Check machine capacity (not just time conflict)
// ─────────────────────────────────────────────────────────────────────────────
async function checkMachineCapacity(machine_id, scheduled_date, planned_hours, excludeId = null) {
  const dayStart = new Date(scheduled_date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(scheduled_date);
  dayEnd.setHours(23, 59, 59, 999);

  const query = {
    machine_id,
    scheduled_date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ['Cancelled'] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existingSlots = await ProductionSchedule.find(query).lean();
  const totalPlannedHours = existingSlots.reduce((sum, s) => sum + (s.planned_hours || 0), 0) + planned_hours;

  const Machine = getModel('Machine');
  const machine = await Machine.findById(machine_id).lean();
  const availableHours = machine?.available_hours_per_day || 16; // Default 2 shifts

  return {
    isOverloaded: totalPlannedHours > availableHours,
    totalPlannedHours,
    availableHours,
    overloadBy: Math.max(0, totalPlannedHours - availableHours),
    utilizationPercent: +((totalPlannedHours / availableHours) * 100).toFixed(1)
  };
}