'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/Production/WorkOrder.js
// Phase 05 — BE-019 + BE-020 + Phase 09 Assembly
// Work Order header, operations[], labour_bookings[], actual costs
// JobCosting (separate collection)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ─── WO Status Machine ────────────────────────────────────────────────────────
// 'Components Kitted' added for Assembly WO workflow (Phase 09)
// Controller uses this status in updateWorkOrder guard and getWipReport filter
const WO_STATUS_TRANSITIONS = {
  'Planned':             ['Released', 'Cancelled'],
  'Released':            ['In Progress', 'Components Kitted', 'On Hold', 'Cancelled'],
  'Components Kitted':   ['In Progress', 'On Hold', 'Cancelled'],
  'In Progress':         ['Partially Completed', 'On Hold', 'Completed'],
  'Partially Completed': ['Completed', 'On Hold'],
  'On Hold':             ['In Progress', 'Released', 'Cancelled'],
  'Completed':           [],
  'Cancelled':           [],
};

const WO_STATUSES = Object.keys(WO_STATUS_TRANSITIONS);
const OP_STATUSES = ['Pending', 'In Progress', 'Completed', 'Skipped'];

// ─── Operation Sub-Document ───────────────────────────────────────────────────
const woOperationSchema = new mongoose.Schema({
  op_sequence:    { type: Number, required: true },
  operation_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Process', default: null }, 
  operation_name: { type: String, required: true, trim: true },
  work_centre:    { type: String, required: true, trim: true },
  machine_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', default: null },


    requires_torque_recording: { type: Boolean, default: false },
    requires_functional_test: { type: Boolean, default: false },
    expected_joints: [{ type: String }], 

  // Subcontract
  is_subcontract:     { type: Boolean, default: false },
  subcontract_vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },

  // Quantities
  planned_qty:      { type: Number, default: 0 },
  output_qty:       { type: Number, default: 0 },
  rejection_qty:    { type: Number, default: 0 },
  rejection_reason: { type: String, default: '' },

  // Planned times (from Routing)
  planned_setup_min: { type: Number, default: 0 },
  planned_run_min:   { type: Number, default: 0 }, // per piece

  // Actual times (recorded by operator)
  actual_setup_min: { type: Number, default: 0 },
  actual_run_min:   { type: Number, default: 0 }, // per piece

  // Operator
  employee_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  required_skill:    { type: String, default: '' },    // skill code required for this op
  skill_override:    { type: Boolean, default: false }, // supervisor bypassed skill check
  skill_override_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Dates
  planned_start: { type: Date, default: null },
  actual_start:  { type: Date, default: null },
  actual_end:    { type: Date, default: null },

  // Status
  status: { type: String, enum: OP_STATUSES, default: 'Pending' },
}, { _id: true });

// ─── Labour Booking Sub-Document ──────────────────────────────────────────────
const labourBookingSchema = new mongoose.Schema({
  employee_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  operation_seq:     { type: Number, required: true },
  hours_booked:      { type: Number, required: true, min: 0.25 },
  start_time:        { type: Date, required: true },
  end_time:          { type: Date, required: true },
  hourly_rate:       { type: Number, required: true, min: 0 }, // pulled from Employee Master
  total_labour_cost: { type: Number, default: 0 },             // hours_booked × hourly_rate
  booked_at:         { type: Date, default: Date.now },
  booked_by:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { _id: true });

// Pre-compute total_labour_cost on booking
labourBookingSchema.pre('save', function (next) {
  this.total_labour_cost = +(this.hours_booked * this.hourly_rate).toFixed(2);
  next();
});

// ─── Work Order Schema ────────────────────────────────────────────────────────
const workOrderSchema = new mongoose.Schema({

  // ── Identity ──────────────────────────────────────────────────────────────
  wo_number: { type: String, unique: true, sparse: true, index: true },
  wo_date:   { type: Date, default: Date.now, required: true },

  // ── Source SO link ────────────────────────────────────────────────────────
  so_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    default: null,
  },
  so_item_id:    { type: mongoose.Schema.Types.ObjectId, required: false, default: null }, // SO line _id
  mrp_generated: { type: Boolean, default: false },
  so_number:     { type: String, default: '' }, // denormalized

  // ── Item reference ────────────────────────────────────────────────────────
  item_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  part_no:   { type: String, required: true, trim: true, uppercase: true },
  part_name: { type: String, required: true, trim: true },

  // Drawing locked at WO creation — NEVER auto-update if item drawing changes
  drawing_no:       { type: String, default: '' },
  drawing_revision: { type: String, default: '0' }, // LOCKED at creation

  // ── BOM & Routing (locked at creation) ───────────────────────────────────
  // ref is 'Bom' — matches the Bom model registration name
  bom_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Bom',     required: true },
  bom_version: { type: String, default: '' }, // denormalized
  routing_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Routing', default: null },

  torque_records_count: { type: Number, default: 0 },
functional_tests_count: { type: Number, default: 0 },
functional_tests_passed: { type: Boolean, default: false },

  // ── WO Classification (Phase 09 Assembly) ────────────────────────────────
  wo_type: {
    type:    String,
    enum:    ['Machining', 'Assembly', 'SubAssembly', 'Kit'],
    default: 'Machining',
    index:   true,
  },
 assembly_line: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssemblyLine',  // ← CHANGE THIS from String to ObjectId
    default: null
  },
  // Tracks whether serial numbers should be assigned per finished unit
  serial_tracking: {
    type:    Boolean,
    default: false,
  },
  serial_numbers_assigned: [{
    type: String,
    trim: true,
  }],
  rework_qty: {
    type:    Number,
    default: 0,
    min:     0,
  },
  // Links to the Component Pick List generated on WO release (Assembly only)
  component_picklist_id: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'ComponentPickList',
    default: null,
  },

  // ── Quantities ────────────────────────────────────────────────────────────
  planned_qty:   { type: Number, required: true, min: 0.001 },
  completed_qty: { type: Number, default: 0, min: 0 },
  rejected_qty:  { type: Number, default: 0, min: 0 },
  scrap_qty:     { type: Number, default: 0, min: 0 },

  // ── Stock Reservations ────────────────────────────────────────────────────
  // References to StockReservation documents created when WO is released
  reservation_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'StockReservation',
  }],

  // ── Dates ─────────────────────────────────────────────────────────────────
  planned_start: { type: Date, required: true },
  planned_end:   { type: Date, required: true },
  required_by: {
    type:        Date,
    required:    true,
    description: 'Customer requirement date — drives MRP priority',
  },
  actual_start: { type: Date, default: null },
  actual_end:   { type: Date, default: null },

  // ── Priority & Status ─────────────────────────────────────────────────────
  priority: {
    type:    String,
    enum:    ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type:    String,
    enum:    WO_STATUSES,
    default: 'Planned',
    index:   true,
  },
  hold_reason:      { type: String, default: '' },
  // Saves the status before a hold so resumeWorkOrder can restore it correctly
  status_before_hold: { type: String, default: '' },

  // ── Internal remarks (set via updateWorkOrder) ────────────────────────────
  internal_remarks: { type: String, default: '' },

  // ── Customer (for shop floor traveller card) ──────────────────────────────
  customer_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customer_name: { type: String, default: '' },

  // ── MRP traceability ──────────────────────────────────────────────────────
  mrp_run_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MrpRun', default: null },

  // ── Operations (snapshot from Routing at creation) ────────────────────────
  operations: [woOperationSchema],

  // ── Material issues / returns ─────────────────────────────────────────────
  material_issues:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'MaterialIssue'  }],
  material_returns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MaterialReturn' }],
  actual_rm_cost:   { type: Number, default: 0 },

  // ── Labour bookings ───────────────────────────────────────────────────────
  labour_bookings:     [labourBookingSchema],
  actual_process_cost: { type: Number, default: 0 }, // sum of all labour_booking.total_labour_cost

  // ── Actual cost accumulation ──────────────────────────────────────────────
  actual_overhead:   { type: Number, default: 0 }, // actual_process_hours × overhead_rate
  actual_total_cost: { type: Number, default: 0 }, // rm + process + overhead

  // ── Final QC link ─────────────────────────────────────────────────────────
  final_inspection_id: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'InspectionRecord',
    default: null,
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, {
  timestamps: true,
  toJSON:    { virtuals: true },
  toObject:  { virtuals: true },
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
workOrderSchema.virtual('actual_process_hours').get(function () {
  return this.labour_bookings.reduce((sum, b) => sum + (b.hours_booked || 0), 0);
});

workOrderSchema.virtual('all_operations_completed').get(function () {
  return this.operations.length > 0 &&
    this.operations.every(op => op.status === 'Completed' || op.status === 'Skipped');
});

// ─── Statics: validate status transitions ────────────────────────────────────
workOrderSchema.statics.isValidTransition = function (from, to) {
  return (WO_STATUS_TRANSITIONS[from] || []).includes(to);
};

workOrderSchema.statics.validNextStatuses = function (current) {
  return WO_STATUS_TRANSITIONS[current] || [];
};

// ─── Middleware: capture status_before_hold ───────────────────────────────────
// When a WO is moved to 'On Hold', save the previous status so resumeWorkOrder
// can restore it without needing the caller to pass it explicitly.
workOrderSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'On Hold') {
    const previous = this.getChanges().$set && this.getChanges().$set.status
      ? undefined // status already set to On Hold — can't get previous from $set
      : this._doc._previousStatus;
    // Fallback: only overwrite status_before_hold when it was not already set
    // to avoid double-overwrite on multiple saves.
    if (!this.status_before_hold) {
      // Use the original value before this save cycle if available
      const orig = this.$__.originalDoc;
      if (orig && orig.status && orig.status !== 'On Hold') {
        this.status_before_hold = orig.status;
      }
    }
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
workOrderSchema.index({ so_id: 1 });
workOrderSchema.index({ item_id: 1, status: 1 });
workOrderSchema.index({ 'operations.employee_id': 1 });
workOrderSchema.index({ planned_start: 1, status: 1 });
workOrderSchema.index({ mrp_run_id: 1 });
workOrderSchema.index({ reservation_ids: 1 }); // for fast reservation lookup
workOrderSchema.index({ wo_type: 1, status: 1 }); // for assembly queue queries

// ─── Auto-generate wo_number  WO-YYYYMM-XXXX ─────────────────────────────────
workOrderSchema.pre('save', async function (next) {
  if (this.wo_number) return next();
  try {
    const d   = new Date();
    const ym  = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const key = `wo-${ym}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.wo_number = `WO-${ym}-${String(counter.seq).padStart(4, '0')}`;
    return next();
  } catch (e) {
    return next(e);
  }
});

const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);

// ─────────────────────────────────────────────────────────────────────────────
// JobCosting — separate collection
// ─────────────────────────────────────────────────────────────────────────────
const jobCostingSchema = new mongoose.Schema({
  wo_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder',  required: true, unique: true },
  so_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', default: null  },
  item_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item',       required: true },
  part_no:   { type: String, required: true },
  wo_number: { type: String, required: true },

  completed_qty: { type: Number, required: true },

  // Actual costs (from WO)
  actual_rm_cost:      { type: Number, default: 0 },
  actual_process_cost: { type: Number, default: 0 },
  actual_overhead:     { type: Number, default: 0 },
  actual_total_cost:   { type: Number, default: 0 },
  actual_unit_cost:    { type: Number, default: 0 }, // actual_total_cost / completed_qty

  // Estimated costs (from Quotation)
  estimated_total_cost: { type: Number, default: 0 },
  estimated_unit_cost:  { type: Number, default: 0 },
  quotation_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },

  // Variance (positive = cost overrun)
  variance_amount:  { type: Number, default: 0 }, // actual − estimated
  variance_percent: { type: Number, default: 0 }, // variance / estimated × 100

  // Profitability
  selling_price_total:  { type: Number, default: 0 }, // from SO line
  gross_profit:         { type: Number, default: 0 }, // selling − actual_total
  gross_margin_percent: { type: Number, default: 0 }, // gross_profit / selling × 100

  costing_date: { type: Date, default: Date.now },
  created_by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true,
  toJSON:    { virtuals: true },
  toObject:  { virtuals: true },
});

jobCostingSchema.index({ wo_id: 1 });
jobCostingSchema.index({ item_id: 1, costing_date: -1 });

const JobCosting = mongoose.model('JobCosting', jobCostingSchema);

module.exports = { WorkOrder, JobCosting, WO_STATUS_TRANSITIONS, WO_STATUSES, OP_STATUSES };