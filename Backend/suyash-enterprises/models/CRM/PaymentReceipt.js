'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/CRM/PaymentReceipt.js
//
// Phase 12 — Payment Receipt with multi-invoice allocation and TDS handling.
//
// KEY DESIGN DECISIONS:
//   1. One receipt can allocate across MULTIPLE invoices for the same customer.
//   2. TDS is deducted at source — net_received = total_amount - tds_amount.
//   3. Allocation is validated: sum(allocated_amounts) ≤ net_received.
//   4. Cheque bounce reverses ALL allocations atomically.
//   5. Customer advances are a separate model but follow the same pattern.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
require('./PaymentReceiptIdCounter');

// ─────────────────────────────────────────────────────────────────────────────
// Allocation sub-schema
// ─────────────────────────────────────────────────────────────────────────────
const allocationSchema = new mongoose.Schema({
  invoice_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice', required: true },
  invoice_no:       { type: String, default: '' },
  allocated_amount: { type: Number, required: true, min: 0.01 },
  invoice_total:    { type: Number, default: 0 },    // snapshot of invoice grand_total
  balance_before:   { type: Number, default: 0 },    // balance_due before this allocation
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// Collection follow-up sub-schema
// ─────────────────────────────────────────────────────────────────────────────
const followUpSchema = new mongoose.Schema({
  date:            { type: Date, default: Date.now },
  channel:         { type: String, enum: ['Call', 'Email', 'Visit', 'WhatsApp'], default: 'Call' },
  summary:         { type: String, default: '' },
  promise_date:    { type: Date, default: null },
  promise_amount:  { type: Number, default: 0 },
  done_by:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  promise_kept:    { type: Boolean, default: null },   // null=pending, true/false after promise_date
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT RECEIPT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const paymentReceiptSchema = new mongoose.Schema({

  // ── Identity ───────────────────────────────────────────────────────────────
  receipt_no:   { type: String, unique: true, sparse: true, index: true },
  receipt_date: { type: Date, default: Date.now, required: true },

  // ── Customer ───────────────────────────────────────────────────────────────
  customer_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  customer_name: { type: String },

  // ── Payment Details ────────────────────────────────────────────────────────
  payment_mode: {
    type: String,
    required: true,
    enum: ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'DD', 'Cash', 'UPI', 'Credit Card', 'Bank Transfer'],
  },
  total_amount:  { type: Number, required: true, min: 0.01 },   // gross amount received

  // Cheque / DD details
  instrument_no: { type: String, default: '' },   // Cheque no / UTR / UPI ref
  instrument_date:{ type: Date, default: null },
  bank_name:     { type: String, default: '' },
  bank_branch:   { type: String, default: '' },

  // ── TDS Handling ───────────────────────────────────────────────────────────
  tds_applicable: { type: Boolean, default: false },
  tds_section:    { type: String, default: '' },    // e.g. '194C', '194J'
  tds_rate:       { type: Number, default: 0, min: 0, max: 100 },
  tds_amount:     { type: Number, default: 0, min: 0 },
  net_received:   { type: Number, default: 0 },    // total_amount - tds_amount

  // ── Allocations ────────────────────────────────────────────────────────────
  allocations: [allocationSchema],
  // Validation: sum(allocations) ≤ net_received — enforced in controller

  // ── Advance Amount ─────────────────────────────────────────────────────────
  // If allocations < net_received → surplus is customer advance
  advance_amount:   { type: Number, default: 0 },
  advance_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerAdvance', default: null },

  // ── GL Posting ─────────────────────────────────────────────────────────────
  gl_posted:    { type: Boolean, default: false },
  gl_posted_at: { type: Date, default: null },
  gl_entry_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GLJournalEntry' }],

  // ── Status ─────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Active', 'Bounced', 'Reversed'],
    default: 'Active',
    index: true,
  },

  // Cheque bounce
  bounced_at:     { type: Date, default: null },
  bounce_reason:  { type: String, default: '' },
  reversal_gl_entry_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GLJournalEntry' }],

  // ── Collection Follow-ups ──────────────────────────────────────────────────
  follow_ups: [followUpSchema],

  // ── Audit ──────────────────────────────────────────────────────────────────
  remarks:    { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────
paymentReceiptSchema.index({ customer_id: 1, receipt_date: -1 });
paymentReceiptSchema.index({ status: 1 });
paymentReceiptSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────
paymentReceiptSchema.virtual('total_allocated').get(function () {
  return +(this.allocations.reduce((s, a) => s + (a.allocated_amount || 0), 0)).toFixed(2);
});

paymentReceiptSchema.virtual('unallocated_balance').get(function () {
  const allocated = this.allocations.reduce((s, a) => s + (a.allocated_amount || 0), 0);
  return +Math.max(0, this.net_received - allocated).toFixed(2);
});

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE: compute net_received and validate
// ─────────────────────────────────────────────────────────────────────────────
paymentReceiptSchema.pre('save', function (next) {
  this.net_received = +(this.total_amount - (this.tds_amount || 0)).toFixed(2);
  if (this.net_received < 0) {
    return next(new Error('TDS amount cannot exceed total amount received'));
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE: auto-generate receipt_no
// ─────────────────────────────────────────────────────────────────────────────
paymentReceiptSchema.pre('save', async function (next) {
  if (this.receipt_no) return next();
  try {
    const y   = new Date().getFullYear();
    const m   = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const key = `rcpt-${y}${m}`;
    const counter = await mongoose.model('PaymentReceiptIdCounter').findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.receipt_no = `RCPT-${y}${m}-${counter.seq.toString().padStart(4, '0')}`;
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('PaymentReceipt', paymentReceiptSchema);