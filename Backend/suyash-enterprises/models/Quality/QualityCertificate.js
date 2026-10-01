'use strict';
const mongoose = require('mongoose');

// ── Checkpoint Value sub-schema (for test reports) ────────────────────────────
const checkpointValueSchema = new mongoose.Schema({
  checkpoint_seq: { type: Number, required: true },
  characteristic: { type: String, required: true },
  specification:  { type: String, required: true },
  nominal:        { type: Number },
  usl:            { type: Number },
  lsl:            { type: Number },
  unit:           { type: String },
  measured_value: { type: Number },
  actual_readings: [Number],
  result: { type: String, enum: ['Pass', 'Fail'] },
}, { _id: false });

// ── Quality Certificate Schema  (Phase 10 §10.9) ──────────────────────────────
const qualityCertificateSchema = new mongoose.Schema({

  cert_id: { type: String, unique: true, sparse: true },
  cert_type: {
    type: String, required: true,
    enum: [
      'Certificate of Conformance', 'Test Report', 'Material Certificate',
      'Dimensional Report', 'Plating Certificate', 'FAI Report', 'PPAP Report',
    ],
  },
  issue_date: { type: Date, required: true, default: Date.now },

  // Reference links
  so_id:               { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder',       default: null },
  dc_id:               { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan',  default: null },
  wo_id:               { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder',        required: true },
  final_inspection_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionRecord', required: true },

  // Item details
  item_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  part_no:          { type: String, required: true },
  part_name:        { type: String, default: '' },
  drawing_no:       { type: String, default: '' },
  drawing_revision: { type: String, default: '' },

  // Customer details
  customer_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer_name:      { type: String, required: true },
  customer_po_number: { type: String, default: '' },

  // Quantity & lot
  lot_no:   { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit:     { type: String, default: 'Nos' },

  // Test results
  actual_values: [checkpointValueSchema],

  // Material traceability
  material_grade: { type: String, default: '' },
  heat_no:        { type: String, default: '' },
  mill_cert_ref:  { type: String, default: '' },
  batch_no:       { type: String, default: '' },

  // Declaration
  declaration: {
    type: String,
    default: 'We hereby certify that the above goods have been manufactured and inspected in accordance with the requirements and are found to be in conformance.',
  },

  // Authorization
  authorised_by:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorised_by_name: { type: String, default: '' },

  // File
  certificate_path: { type: String, default: '' },

  // Dispatch tracking
  sent_to_customer: { type: Boolean, default: false },
  sent_at:          { type: Date,    default: null },
  sent_by:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Audit
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
qualityCertificateSchema.index({ cert_id: 1 }, { unique: true });
qualityCertificateSchema.index({ wo_id: 1 });
qualityCertificateSchema.index({ so_id: 1 });
qualityCertificateSchema.index({ dc_id: 1 });
qualityCertificateSchema.index({ lot_no: 1 });
qualityCertificateSchema.index({ customer_id: 1, issue_date: -1 });
qualityCertificateSchema.index({ issue_date: -1 });

// ── Auto-generate Certificate ID using SequenceCounter ────────────────────────
qualityCertificateSchema.pre('save', async function (next) {
  if (this.cert_id) return next();
  try {
    const year  = this.issue_date.getFullYear();
    const month = (this.issue_date.getMonth() + 1).toString().padStart(2, '0');

    const Counter = mongoose.model('SequenceCounter');
    const counter = await Counter.findByIdAndUpdate(
      `qcert_${year}${month}`,
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );

    this.cert_id = `QCR-${year}${month}-${counter.seq.toString().padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('QualityCertificate', qualityCertificateSchema);
