
'use strict';
const mongoose = require('mongoose');

// ── Photo Evidence Sub-Schema ─────────────────────────────────────────────────
const photoEvidenceSchema = new mongoose.Schema({
  file_name:   { type: String, required: true },
  file_path:   { type: String, required: true },
  description: { type: String, default: '' },
  uploaded_at: { type: Date,   default: Date.now },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

// ── Action Sub-Schema (immediate / corrective / preventive) ──────────────────
const ncrActionSchema = new mongoose.Schema({
  action_type: {
    type: String,
    enum: ['Immediate', 'Corrective', 'Preventive'],
    required: true,
  },
  description: { type: String, required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  due_date:    { type: Date },
  completed_at: { type: Date },
  completed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
  remarks: { type: String },
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED NCR SCHEMA  (Phase 10 §10.4)
// ─────────────────────────────────────────────────────────────────────────────
const ncrSchema = new mongoose.Schema({

  // ── §10.4.1  Header ──────────────────────────────────────────────────────
  ncr_number: {
    type: String, unique: true, sparse: true, index: true,
  },
  ncr_date: { type: Date, required: true, default: Date.now },
  ncr_type: {
    type: String, required: true,
    enum: [
      'Incoming', 'In-Process', 'Final Inspection',
      'Customer Return', 'Internal Audit Finding', 'Gauge Calibration Failure',
    ],
  },
  severity: {
    type: String, required: true,
    enum: ['Critical', 'Major', 'Minor'],
  },

  // Source references
  source_inspection_id: {
    type: mongoose.Schema.Types.ObjectId, ref: 'InspectionRecord', default: null,
  },
  item_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  part_no:  { type: String, required: true },
  drawing_no:       { type: String, default: '' },
  drawing_revision: { type: String, default: '' },

  // Quantity
  quantity:      { type: Number, required: true, min: 0 },
  quantity_unit: {
    type: String, enum: ['Nos', 'Kg', 'Meter', 'Litre', 'Set'], default: 'Nos',
  },
  lot_no: { type: String, default: '' },

  // Source document links
  wo_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder',      default: null },
  grn_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'GRN',            default: null },
  po_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder',  default: null },
  vendor_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',         default: null },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer',       default: null },

  // Defect information
  defect_codes: [{
    code:     { type: String, required: true },
    name:     { type: String, required: true },
    category: { type: String },
  }],
  defect_description:   { type: String, required: true },
  detected_at_operation: { type: String, default: '' },
  detected_by: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  photo_evidence: [photoEvidenceSchema],

  // ── §10.4.2  Disposition & Containment ──────────────────────────────────
  immediate_action:  { type: String, default: '' },
  disposition: {
    type: String,
    enum: [
      'Scrap', 'Rework', 'Use As-Is', 'Return to Vendor',
      'Sort', 'MRB Review', 'Customer Concession', 'Pending Decision', null,
    ],
    default: null,
  },
  disposition_basis:       { type: String, default: '' },
  concession_number:       { type: String, default: '' },
  customer_concession_no:  { type: String, default: '' },
  disposition_approved_by: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null,
  },
  disposition_date:      { type: Date, default: null },
  rework_job_card:       { type: mongoose.Schema.Types.ObjectId, ref: 'ReworkJobCard', default: null },
  vendor_return_challan: { type: String, default: '' },
  debit_note_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseInvoice', default: null },
  financial_impact:      { type: Number, default: 0, min: 0 },

  // ── §10.4.3  Root Cause & Closure ───────────────────────────────────────
  root_cause_method: {
    type: String,
    enum: ['5-Why', 'Fishbone (Ishikawa)', 'Fault Tree Analysis', 'Kepner-Tregoe', 'Other', null],
    default: null,
  },
  root_cause:      { type: String, default: '' },
  escape_cause:    { type: String, default: '' },
  systemic_failure: { type: Boolean, default: false },
  capa_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'CAPA', default: null },
  supplier_caution_letter: { type: Boolean, default: false },
  scl_number:              { type: String, default: '' },

  immediate_actions: [ncrActionSchema],
  corrective_actions: [ncrActionSchema],
  preventive_actions: [ncrActionSchema],
  // Status
  status: {
    type: String, required: true,
    enum: [
      'Open', 'Under Investigation', 'Disposition Given',
      'CAPA Initiated', 'Pending Verification', 'Closed', 'Escalated',
    ],
    default: 'Open',
  },

  // Closure
  closed_by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  closed_at:        { type: Date, default: null },
  recurrence_check: { type: Boolean, default: false },

  // Audit
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
ncrSchema.index({ ncr_number: 1 },         { unique: true });
ncrSchema.index({ ncr_date: -1 });
ncrSchema.index({ status: 1, severity: 1 });
ncrSchema.index({ vendor_id: 1, ncr_date: -1 });
ncrSchema.index({ grn_id: 1 });
ncrSchema.index({ wo_id: 1 });
ncrSchema.index({ capa_id: 1 });
ncrSchema.index({ systemic_failure: 1, status: 1 });
ncrSchema.index({ item_id: 1, ncr_date: -1 });

// ── Auto-generate NCR Number using SequenceCounter ───────────────────────────
ncrSchema.pre('save', async function (next) {
  if (this.ncr_number) return next();
  try {
    const year  = this.ncr_date.getFullYear();
    const month = (this.ncr_date.getMonth() + 1).toString().padStart(2, '0');

    const Counter = mongoose.model('SequenceCounter');
    const counter = await Counter.findByIdAndUpdate(
      `ncr_${year}${month}`,
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );

    this.ncr_number = `NCR-${year}${month}-${counter.seq.toString().padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// ── Business rule: CAPA required for systemic Critical/Major before closure ───
ncrSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Closed') {
    if (this.severity !== 'Minor' && this.systemic_failure && !this.capa_id) {
      return next(new Error(
        'Cannot close NCR: CAPA required for systemic failure with Critical/Major severity',
      ));
    }
  }
  next();
});

module.exports = mongoose.model('NCR', ncrSchema);