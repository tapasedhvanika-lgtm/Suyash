'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/CRM/CreditNote.js
//
// Phase 12 — Credit Note with GST reversal and GSTR-1 period determination.
//
// KEY DESIGN DECISIONS:
//   1. Credit note MUST reference a valid original invoice.
//   2. GST type is inherited from the original invoice (cannot change).
//   3. GSTR period: same month as invoice → same period; different month → CN month.
//   4. CN reduces customer outstanding via GL posting.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
require('./CreditNoteIdCounter');

const cnItemSchema = new mongoose.Schema({
  so_item_id:     { type: mongoose.Schema.Types.ObjectId, default: null },
  part_no:        { type: String, required: true, trim: true, uppercase: true },
  part_name:      { type: String, required: true, trim: true },
  hsn_code:       { type: String, required: true, trim: true },
  unit:           { type: String, default: 'Nos' },
  quantity:       { type: Number, required: true, min: 0.001 },
  unit_price:     { type: Number, required: true, min: 0 },
  taxable_amount: { type: Number, default: 0 },
  gst_percentage: { type: Number, default: 18 },
  cgst_amount:    { type: Number, default: 0 },
  sgst_amount:    { type: Number, default: 0 },
  igst_amount:    { type: Number, default: 0 },
  total_amount:   { type: Number, default: 0 },
}, { _id: true });

const creditNoteSchema = new mongoose.Schema({

  // ── Identity ───────────────────────────────────────────────────────────────
  cn_no:   { type: String, unique: true, sparse: true, index: true },
  cn_date: { type: Date, default: Date.now, required: true },

  // ── Source ─────────────────────────────────────────────────────────────────
  invoice_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice', required: true, index: true },
  invoice_no:  { type: String, required: true },
  invoice_date:{ type: Date, required: true },    // snapshot for GSTR period calc
  so_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', default: null },

  // ── Customer Snapshot ──────────────────────────────────────────────────────
  customer_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  customer_name:  { type: String, required: true },
  customer_gstin: { type: String, default: '' },

  // ── Reason ─────────────────────────────────────────────────────────────────
  reason: {
    type: String,
    required: [true, 'Credit note reason is required'],
    enum: [
      'Sales Return',
      'Price Revision',
      'Quality Rejection',
      'Excess Billing',
      'Discount Adjustment',
      'Other',
    ],
  },
  reason_remarks: { type: String, default: '' },

  // ── GST (inherited from invoice — immutable) ───────────────────────────────
  gst_type: {
    type:    String,
    enum:    ['CGST/SGST', 'IGST'],
    required: true,
  },

  // ── Items ──────────────────────────────────────────────────────────────────
  items: {
    type: [cnItemSchema],
    validate: { validator: (v) => v && v.length > 0, message: 'CN must have at least one item' },
  },

  // ── Totals ─────────────────────────────────────────────────────────────────
  taxable_total:  { type: Number, default: 0 },
  cgst_total:     { type: Number, default: 0 },
  sgst_total:     { type: Number, default: 0 },
  igst_total:     { type: Number, default: 0 },
  gst_total:      { type: Number, default: 0 },
  grand_total:    { type: Number, default: 0 },
  amount_in_words:{ type: String, default: '' },

  // ── GSTR Period ────────────────────────────────────────────────────────────
  // Determined at creation: same month as invoice → invoice month, else CN month
  gstr_month: { type: Number, required: true },   // 1–12
  gstr_year:  { type: Number, required: true },   // YYYY

  // ── GL Posting ─────────────────────────────────────────────────────────────
  gl_posted:    { type: Boolean, default: false },
  gl_posted_at: { type: Date, default: null },
  gl_entry_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GLJournalEntry' }],

  // ── Status ─────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Cancelled'],
    default: 'Draft',
  },

  // ── Audit ──────────────────────────────────────────────────────────────────
  internal_remarks: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
creditNoteSchema.index({ customer_id: 1, cn_date: -1 });
creditNoteSchema.index({ gstr_year: 1, gstr_month: 1 });

// Pre-save: recompute totals
creditNoteSchema.pre('save', function (next) {
  let taxable = 0, cgst = 0, sgst = 0, igst = 0;
  this.items.forEach(item => {
    const tax     = +(item.unit_price * item.quantity).toFixed(4);
    const gstPct  = item.gst_percentage || 18;
    item.taxable_amount = +tax.toFixed(2);
    if (this.gst_type === 'IGST') {
      item.igst_amount  = +(tax * gstPct / 100).toFixed(2);
      item.cgst_amount  = 0;
      item.sgst_amount  = 0;
      item.total_amount = +(tax + item.igst_amount).toFixed(2);
      igst += item.igst_amount;
    } else {
      item.cgst_amount  = +(tax * (gstPct / 2) / 100).toFixed(2);
      item.sgst_amount  = +(tax * (gstPct / 2) / 100).toFixed(2);
      item.igst_amount  = 0;
      item.total_amount = +(tax + item.cgst_amount + item.sgst_amount).toFixed(2);
      cgst += item.cgst_amount;
      sgst += item.sgst_amount;
    }
    taxable += tax;
  });
  this.taxable_total = +taxable.toFixed(2);
  this.cgst_total    = +cgst.toFixed(2);
  this.sgst_total    = +sgst.toFixed(2);
  this.igst_total    = +igst.toFixed(2);
  this.gst_total     = +(cgst + sgst + igst).toFixed(2);
  this.grand_total   = +(taxable + cgst + sgst + igst).toFixed(2);
  next();
});

// Pre-save: auto-generate CN number
creditNoteSchema.pre('save', async function (next) {
  if (this.cn_no) return next();
  try {
    const y   = new Date().getFullYear();
    const m   = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const key = `cn-${y}${m}`;
    const counter = await mongoose.model('CreditNoteIdCounter').findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.cn_no = `CN-${y}${m}-${counter.seq.toString().padStart(4, '0')}`;
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('CreditNote', creditNoteSchema);