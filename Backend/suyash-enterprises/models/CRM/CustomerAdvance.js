'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/CRM/CustomerAdvance.js
//
// Phase 12 — Customer Advance receipt (payment before invoice is raised).
// Advance balance is reduced when applied against future invoices.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const advanceAdjustmentSchema = new mongoose.Schema({
  invoice_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice', required: true },
  invoice_no:       { type: String, default: '' },
  adjusted_amount:  { type: Number, required: true, min: 0.01 },
  adjusted_on:      { type: Date, default: Date.now },
  adjusted_by:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const customerAdvanceSchema = new mongoose.Schema({
  // ── Identity ───────────────────────────────────────────────────────────────
  advance_no:   { type: String, unique: true, sparse: true, index: true },
  advance_date: { type: Date, default: Date.now, required: true },

  // ── Customer ───────────────────────────────────────────────────────────────
  customer_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  customer_name: { type: String , default: null },

  // ── Payment ────────────────────────────────────────────────────────────────
  payment_mode:   { type: String, required: true, enum: ['NEFT','RTGS','IMPS','Cheque','DD','Cash','UPI','Bank Transfer'] },
  total_amount:   { type: Number, required: true, min: 0.01 },
  instrument_no:  { type: String, default: '' },
  instrument_date:{ type: Date, default: null },
  bank_name:      { type: String, default: '' },

  // ── Balance Tracking ───────────────────────────────────────────────────────
  balance:        { type: Number, default: 0 },   // recomputed in pre-save
  adjustments:    [advanceAdjustmentSchema],

  // ── GST Advance ────────────────────────────────────────────────────────────
  // Advance GST liability if advance carries over month-end without invoice
  gst_flag:       { type: Boolean, default: false },
  gst_flag_month: { type: Number, default: null },
  gst_flag_year:  { type: Number, default: null },

  // ── GL ─────────────────────────────────────────────────────────────────────
  gl_posted:    { type: Boolean, default: false },
  gl_entry_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GLJournalEntry' }],

  // ── Status ─────────────────────────────────────────────────────────────────
  status: { type: String, enum: ['Open', 'Partially Adjusted', 'Fully Adjusted', 'Refunded'], default: 'Open' },

  // ── Audit ──────────────────────────────────────────────────────────────────
  remarks:    { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

customerAdvanceSchema.index({ customer_id: 1, status: 1 });

// Pre-save: recompute balance
customerAdvanceSchema.pre('save', function (next) {
  const totalAdjusted = this.adjustments.reduce((s, a) => s + (a.adjusted_amount || 0), 0);
  this.balance = +Math.max(0, this.total_amount - totalAdjusted).toFixed(2);
  if (totalAdjusted === 0)                            this.status = 'Open';
  else if (this.balance <= 0.01)                      this.status = 'Fully Adjusted';
  else                                                this.status = 'Partially Adjusted';
  next();
});

// Pre-save: auto-generate advance_no
customerAdvanceSchema.pre('save', async function (next) {
  if (this.advance_no) return next();
  try {
    const y = new Date().getFullYear();
    const m = (new Date().getMonth() + 1).toString().padStart(2, '0');
    // simple timestamp-based no (no separate counter needed for advances)
    this.advance_no = `ADV-${y}${m}-${Date.now().toString().slice(-5)}`;
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('CustomerAdvance', customerAdvanceSchema);