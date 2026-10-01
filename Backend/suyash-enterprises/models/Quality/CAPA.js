'use strict';
const mongoose = require('mongoose');
const SequenceCounter = require('../SequenceCounter');

// ── Action Sub-Schema ─────────────────────────────────────────────────────────
const actionSchema = new mongoose.Schema({
  action_description: { type: String, required: true },
  action_type: {
    type: String,
    enum: ['Immediate', 'Short-Term', 'Long-Term', 'Preventive'],
    default: 'Short-Term',
  },
  responsible_person_id: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  target_date:              { type: Date, required: true },
  completion_date:          { type: Date, default: null },
  completion_evidence_path: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Overdue'],
    default: 'Open',
  },
  verification_notes: { type: String, default: '' },
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// CAPA SCHEMA  (Phase 10 §10.5)
// ─────────────────────────────────────────────────────────────────────────────
const capaSchema = new mongoose.Schema({

  // ── §10.5.1  Header ──────────────────────────────────────────────────────
  capa_id:   { type: String, unique: true, sparse: true },
  capa_date: { type: Date, required: true, default: Date.now },
  capa_type: {
    type: String, required: true,
    enum: ['Corrective', 'Preventive', 'Improvement'],
  },
  source: {
    type: String, required: true,
    enum: [
      'NCR', 'Customer Complaint', 'Internal Audit',
      'Management Review', 'Process Study', 'Supplier Audit', 'Warranty Return',
    ],
  },

  // Source references
  ncr_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'NCR',               default: null },
  complaint_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerComplaint', default: null },
  audit_finding_id: { type: String, default: '' },

  // Problem definition
  problem_statement:  { type: String, required: true },
  defect_description: { type: String, required: true },
  quantity_affected:  { type: Number, default: 0 },
  customer_impact:    { type: Boolean, default: false },
  root_cause:         { type: String, required: true },

  // ── §10.5.2  Action Arrays ───────────────────────────────────────────────
  corrective_actions: [actionSchema],
  preventive_actions: [actionSchema],

  // Assignment
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Dates & status
  target_close_date: { type: Date, required: true },
  status: {
    type: String, required: true,
    enum: ['Open', 'In Progress', 'Completed', 'Effectiveness Under Review', 'Closed', 'Overdue'],
    default: 'Open',
  },

  // Effectiveness Review
  effectiveness_review_date: { type: Date,    default: null },
  effectiveness_criteria:    { type: String,  default: '' },
  effectiveness_verified:    { type: Boolean, default: false },
  effectiveness_evidence:    { type: String,  default: '' },
  effectiveness_notes:       { type: String,  default: '' },

  // Closure
  closed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  closed_at: { type: Date, default: null },

  // Audit
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
capaSchema.index({ capa_id: 1 },                 { unique: true });
capaSchema.index({ status: 1, target_close_date: 1 });
capaSchema.index({ ncr_id: 1 });
capaSchema.index({ assigned_to: 1 });
capaSchema.index({ source: 1, capa_date: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
capaSchema.virtual('days_overdue').get(function () {
  // Only meaningful for non-closed, non-overdue statuses (compute actual days late)
  if (this.status === 'Closed') return 0;
  const days = Math.ceil((Date.now() - this.target_close_date) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
});

capaSchema.virtual('completion_percentage').get(function () {
  const all = [...(this.corrective_actions || []), ...(this.preventive_actions || [])];
  if (all.length === 0) return 0;
  const done = all.filter(a => a.status === 'Completed').length;
  return Math.round((done / all.length) * 100);
});

// ── Auto-generate CAPA ID using SequenceCounter ───────────────────────────────
capaSchema.pre('save', async function (next) {
  if (this.capa_id) return next();
  try {
    const year  = this.capa_date.getFullYear();
    const month = (this.capa_date.getMonth() + 1).toString().padStart(2, '0');

    const Counter = mongoose.model('SequenceCounter');
    const counter = await Counter.findByIdAndUpdate(
      `capa_${year}${month}`,
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );

    this.capa_id = `CAPA-${year}${month}-${counter.seq.toString().padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// ── Auto-mark Overdue ─────────────────────────────────────────────────────────
capaSchema.pre('save', function (next) {
  const closedStatuses = ['Closed', 'Completed', 'Effectiveness Under Review'];
  if (!closedStatuses.includes(this.status) && this.target_close_date < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('CAPA', capaSchema);
