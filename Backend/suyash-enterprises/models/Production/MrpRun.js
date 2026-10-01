'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/Production/MrpRun.js
// Phase 05 — BE-018
// MRP Run header + MRP Line sub-documents
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ─── MRP Line Sub-Document ────────────────────────────────────────────────────
// One record per item per requirement date
const mrpLineSchema = new mongoose.Schema({
  item_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  part_no:          { type: String, required: true, trim: true, uppercase: true },
  requirement_date: { type: Date, required: true },

  // Demand side
  gross_requirement: { type: Number, required: true, min: 0 },
  so_references:     [{ type: String }],   // SO numbers driving this requirement

  // Supply side
  scheduled_receipt: { type: Number, default: 0, min: 0 }, // open POs + open WOs
  opening_stock:     { type: Number, default: 0, min: 0 }, // from StockLedger

  // Net calculation
  net_requirement:   { type: Number, default: 0 },          // max(0, gross - stock - scheduled)
  planned_order_qty: { type: Number, default: 0 },          // rounded up to reorder_qty
  planned_order_release_date: { type: Date, default: null },

  // Decision
  action: {
    type:    String,
    enum:    ['Create PO', 'Create WO', 'Reschedule', 'No Action'],
    default: 'No Action',
  },
  source: {
    type:    String,
    enum:    ['Purchase', 'Manufacture', 'Subcontract', ''],
    default: '',
  },

  // Output links — filled after PR/WO is auto-created
  pr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequisition', default: null },
  wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder',           default: null },
}, { _id: true });

// ─── MRP Run Header ───────────────────────────────────────────────────────────
const mrpRunSchema = new mongoose.Schema({
  mrp_run_id: {
    type:   String,
    unique: true,
    sparse: true,
    index:  true,
  },
  run_date:  { type: Date, default: Date.now, required: true },
  run_type: {
    type:     String,
    enum:     ['Full', 'Incremental', 'Item-Specific'],
    required: true,
  },
  planning_horizon: { type: Number, required: true, min: 1 }, // days ahead
  triggered_by: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  status: {
  type:    String,
  enum:    ['Queued','Running', 'Completed', 'Failed'],
  default: 'Running',
  index:   true,
},

  // SOs considered in this run
  so_ids_considered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' }],

  // Output — auto-generated PRs and WOs
  pr_generated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequisition' }],
  wo_generated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' }],

  // MRP line detail — one per item per date
  mrp_lines: [mrpLineSchema],

  // Metadata
  completed_at: { type: Date, default: null },
  log:          { type: String, default: '' },   // warnings, errors, exceptions

  // For incremental runs — compare SO.updatedAt against this
  last_run_reference: { type: Date, default: null },

  // Bull job id for polling
  job_id: { type: String, default: null },
}, {
  timestamps: true,
  toJSON:  { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
mrpRunSchema.virtual('pr_count').get(function () {
  return this.pr_generated ? this.pr_generated.length : 0;
});
mrpRunSchema.virtual('wo_count').get(function () {
  return this.wo_generated ? this.wo_generated.length : 0;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
mrpRunSchema.index({ run_date: -1 });
mrpRunSchema.index({ status: 1, run_date: -1 });

// ─── Auto-generate mrp_run_id  MRP-YYYYMMDD-XXX ───────────────────────────────
mrpRunSchema.pre('save', async function (next) {
  if (this.mrp_run_id) return next();
  try {
    const d   = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const key = `mrp-${ymd}`;
    const Counter = mongoose.model('SalesOrderIdCounter'); // reuse same counter collection
    const counter = await Counter.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.mrp_run_id = `MRP-${ymd}-${String(counter.seq).padStart(3, '0')}`;
    return next();
  } catch (e) {
    return next(e);
  }
});

const MrpRun = mongoose.model('MrpRun', mrpRunSchema);
module.exports = { MrpRun };