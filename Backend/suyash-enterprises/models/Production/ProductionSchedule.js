'use strict';
const mongoose = require('mongoose');

// ─── Production Schedule ──────────────────────────────────────────────────────
const productionScheduleSchema = new mongoose.Schema({
  schedule_id: { type: String, unique: true, sparse: true, index: true },

  machine_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Machine',   required: true },
  wo_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true },
  operation_seq: { type: Number, required: true },

  part_no:     { type: String, default: '' },
  planned_qty: { type: Number, required: true, min: 0.001 },

  scheduled_date: { type: Date, required: true },
  shift: {
    type:    String,
    enum:    ['Morning', 'Afternoon', 'Night', 'General'],
    default: 'General',
  },
  start_time: { type: String, default: '' }, // HH:MM
  end_time:   { type: String, default: '' }, // HH:MM

  planned_hours: { type: Number, default: 0 },
  actual_hours:  { type: Number, default: 0 },

  status: {
    type:    String,
    enum:    ['Planned', 'Confirmed', 'In Progress', 'Completed', 'Postponed', 'Cancelled'],
    default: 'Planned',
    index:   true,
  },

  conflict: { type: Boolean, default: false, index: true },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true,
  toJSON:  { virtuals: true },
  toObject: { virtuals: true },
});

productionScheduleSchema.index({ machine_id: 1, scheduled_date: 1, shift: 1 });
productionScheduleSchema.index({ wo_id: 1 });

productionScheduleSchema.pre('save', async function (next) {
  if (this.schedule_id) return next();
  try {
    const d   = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const key = `sch-${ymd}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.schedule_id = `SCH-${ymd}-${String(counter.seq).padStart(4, '0')}`;
    return next();
  } catch (e) {
    return next(e);
  }
});

// ─── Downtime Log Sub-Document ────────────────────────────────────────────────
// FIX: enum now matches model across all files
const DOWNTIME_TYPES = ['Breakdown', 'Planned Maintenance', 'Setup', 'Quality Hold', 'No Material', 'Other'];

const downtimeLogSchema = new mongoose.Schema({


  

  type: {

    type:     String,
    enum:     DOWNTIME_TYPES,
    required: true,
  },
  start_time:   { type: Date, required: true },
  end_time:     { type: Date, required: true },
  duration_min: { type: Number, default: 0 },
  root_cause:   { type: String, default: '' },
  action_taken: { type: String, default: '' },
  logged_by:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { _id: true });

downtimeLogSchema.pre('save', function (next) {
  if (this.start_time && this.end_time) {
    this.duration_min = +((this.end_time - this.start_time) / 60000).toFixed(1);
  }
  next();
});

// ─── OEE Record ───────────────────────────────────────────────────────────────
const oeeRecordSchema = new mongoose.Schema({
  machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  date:       { type: Date, required: true },
  shift: {
    type:     String,
    enum:     ['Morning', 'Afternoon', 'Night', 'General'],
    required: true,
  },

  planned_production_time: { type: Number, required: true, min: 0 }, // minutes
  actual_run_time:         { type: Number, required: true, min: 0 }, // minutes
  theoretical_capacity:    { type: Number, default: 0 },             // units/shift at ideal speed
  good_qty:                { type: Number, required: true, min: 0 },
  total_qty:               { type: Number, required: true, min: 0 },

  downtime_log: [downtimeLogSchema],

  // Computed (0–1 scale)
  availability:  { type: Number, default: 0 },
  performance:   { type: Number, default: 0 },
  quality:       { type: Number, default: 0 },
  oee:           { type: Number, default: 0 },

  total_downtime_min: { type: Number, default: 0 },

  notes:       { type: String, default: '' },
  recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true,
  toJSON:  { virtuals: true },
  toObject: { virtuals: true },
});

// OEE auto-computation on save
oeeRecordSchema.pre('save', function (next) {
  const totalDowntimeMin = this.downtime_log.reduce((s, d) => s + (d.duration_min || 0), 0);
  this.total_downtime_min = +totalDowntimeMin.toFixed(1);

  const planned = this.planned_production_time || 0;

  this.availability = planned > 0
    ? +Math.min(1, Math.max(0, (planned - totalDowntimeMin) / planned)).toFixed(4)
    : 0;

  this.performance = this.theoretical_capacity > 0
    ? +Math.min(1, Math.max(0, this.total_qty / this.theoretical_capacity)).toFixed(4)
    : 0;

  this.quality = this.total_qty > 0
    ? +Math.min(1, Math.max(0, this.good_qty / this.total_qty)).toFixed(4)
    : 0;

  this.oee = +(this.availability * this.performance * this.quality).toFixed(4);

  next();
});

oeeRecordSchema.index({ machine_id: 1, date: -1, shift: 1 }, { unique: true });

// ─── Tool Usage ───────────────────────────────────────────────────────────────
const toolUsageSchema = new mongoose.Schema({
  tool_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'ToolMaster', required: true },
  wo_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder',  required: true },
  operation_seq: { type: Number, required: true },
  machine_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Machine',    default: null },

  shots_fired:  { type: Number, required: true, min: 1 },
  usage_date:   { type: Date, default: Date.now },

  shots_before:     { type: Number, default: 0 },
  shots_after:      { type: Number, default: 0 },
  max_shots:        { type: Number, default: 0 },

  near_maintenance: { type: Boolean, default: false },
  alert_sent:       { type: Boolean, default: false },

  recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes:       { type: String, default: '' },
}, {
  timestamps: true,
});

toolUsageSchema.index({ tool_id: 1, usage_date: -1 });
toolUsageSchema.index({ wo_id: 1 });

const ProductionSchedule = mongoose.model('ProductionSchedule', productionScheduleSchema);
const OeeRecord          = mongoose.model('OeeRecord',          oeeRecordSchema);
const ToolUsage          = mongoose.model('ToolUsage',          toolUsageSchema);

module.exports = { ProductionSchedule, OeeRecord, ToolUsage, DOWNTIME_TYPES };