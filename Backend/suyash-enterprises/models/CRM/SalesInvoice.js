'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/CRM/SalesInvoice.js
//
// Phase 12 — GST-compliant Sales Invoice
//
// KEY DESIGN DECISIONS:
//   1. Invoice is created ONLY after at least one DC in Dispatched status.
//      This is enforced in the controller, not the model.
//   2. Seller and buyer details are SNAPSHOTS — copied at invoice creation.
//      Never live-referenced. GST type is inherited from SO (immutable).
//   3. HSN-wise GST breakup is computed in controller and stored as-is.
//   4. IRN (e-Invoice Reference Number) is immutable once generated.
//      Cancellation within 24 hours calls IRP cancel API.
//      After 24 hours → issue Credit Note instead.
//   5. GL journal entries are auto-posted on invoice creation (via controller).
//   6. invoice_no is sequential and gapless within financial year.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
require('./InvoiceIdCounter');

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE STATUS MACHINE
// ─────────────────────────────────────────────────────────────────────────────
const INVOICE_STATUS_TRANSITIONS = {
  'Draft':     ['Issued','Submitted', 'Cancelled'],
   'Issued':    ['Submitted', 'Sent', 'Cancelled'], 
  'Submitted': ['Sent', 'Cancelled'],
  'Sent':      ['Partially Paid', 'Fully Paid', 'Overdue'],
  'Partially Paid': ['Fully Paid', 'Overdue'],
  'Overdue':   ['Partially Paid', 'Fully Paid'],
  'Fully Paid': ['Closed'],
  'Closed':    [],
  'Cancelled': [],
};

const INVOICE_STATUSES = Object.keys(INVOICE_STATUS_TRANSITIONS);

// ─────────────────────────────────────────────────────────────────────────────
// Address snapshot — copied at invoice creation, never live-referenced
// ─────────────────────────────────────────────────────────────────────────────
const addressSnapshotSchema = new mongoose.Schema({
  line1:      { type: String, default: '' },
  line2:      { type: String, default: '' },
  city:       { type: String, default: '' },
  district:   { type: String, default: '' },
  state:      { type: String, default: '' },
  state_code: { type: Number, default: 0 },
  pincode:    { type: String, default: '' },
  country:    { type: String, default: 'India' },
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Line Item sub-schema
// ─────────────────────────────────────────────────────────────────────────────
const invoiceItemSchema = new mongoose.Schema({
  // Identity (from SO line item — price locked)
  so_item_id:  { type: mongoose.Schema.Types.ObjectId, default: null },
  part_no:     { type: String, required: true, trim: true, uppercase: true },
  part_name:   { type: String, required: true, trim: true },
  hsn_code:    { type: String, required: true, trim: true },
  unit:        { type: String, default: 'Nos' },
  drawing_no:  { type: String, default: '' },

  // Quantities
  dispatched_qty: { type: Number, required: true, min: 0.001 },

  // Pricing (locked from SO)
  unit_price:       { type: Number, required: true, min: 0 },
  discount_percent: { type: Number, default: 0, min: 0, max: 100 },
  discount_amount:  { type: Number, default: 0 },
  taxable_amount:   { type: Number, default: 0 },

  // GST (inherited from SO gst_type)
  gst_percentage:   { type: Number, default: 18 },
  cgst_amount:      { type: Number, default: 0 },
  sgst_amount:      { type: Number, default: 0 },
  igst_amount:      { type: Number, default: 0 },
  total_amount:     { type: Number, default: 0 },
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// HSN-wise GST Breakup sub-schema
// ─────────────────────────────────────────────────────────────────────────────
const hsnBreakupSchema = new mongoose.Schema({
  hsn_code:       { type: String, required: true },
  taxable_value:  { type: Number, default: 0 },
  gst_percentage: { type: Number, default: 18 },
  cgst_amount:    { type: Number, default: 0 },
  sgst_amount:    { type: Number, default: 0 },
  igst_amount:    { type: Number, default: 0 },
  total_tax:      { type: Number, default: 0 },
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// Payment allocation sub-schema (tracks payments linked to this invoice)
// ─────────────────────────────────────────────────────────────────────────────
const paymentAllocationSchema = new mongoose.Schema({
  payment_receipt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentReceipt', required: true },
  receipt_no:         { type: String, default: '' },
  allocated_amount:   { type: Number, required: true, min: 0 },
  allocated_on:       { type: Date, default: Date.now },
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// SALES INVOICE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const salesInvoiceSchema = new mongoose.Schema({

  // ── Identity ───────────────────────────────────────────────────────────────
  invoice_no:   { type: String, unique: true, sparse: true, index: true },
  invoice_date: { type: Date, default: Date.now, required: true },
  invoice_type: {
    type: String,
    enum: ['Tax Invoice', 'Bill of Supply', 'Export Invoice', 'Credit Note', 'Debit Note'],
    default: 'Tax Invoice',
  },
  // ── Source Documents ───────────────────────────────────────────────────────
  so_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder',  required: true, index: true },
  so_number:   { type: String, default: '' },
  dc_ids:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan' }],
  dc_numbers:  [{ type: String }],

  // ── Seller Snapshot ────────────────────────────────────────────────────────
  company_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  company_name:     { type: String, required: true },
  company_gstin:    { type: String, required: true },
  company_state:    { type: String, default: '' },
  company_state_code: { type: Number, default: 0 },
  company_address:  { type: addressSnapshotSchema, default: () => ({}) },

  // ── Buyer Snapshot ─────────────────────────────────────────────────────────
  customer_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  customer_name:      { type: String },
  customer_gstin:     { type: String, default: '' },
  customer_state:     { type: String, default: '' },
  customer_state_code:{ type: Number, default: 0 },
  customer_po_number: { type: String, default: '' },
  billing_address:    { type: addressSnapshotSchema, default: () => ({}) },
  shipping_address:   { type: addressSnapshotSchema, default: () => ({}) },

  // ── GST Type (immutable — inherited from SO) ───────────────────────────────
  gst_type: {
    type: String,
    enum: ['CGST/SGST', 'IGST'],
    required: true,
    default: 'CGST/SGST',
  },

  // ── Items ──────────────────────────────────────────────────────────────────
  items: {
    type: [invoiceItemSchema],
    validate: {
      validator: (v) => v && v.length > 0,
      message: 'Invoice must have at least one line item',
    },
  },

  // ── Totals (auto-computed in pre-save) ────────────────────────────────────
  sub_total:      { type: Number, default: 0 },
  discount_total: { type: Number, default: 0 },
  taxable_total:  { type: Number, default: 0 },
  cgst_total:     { type: Number, default: 0 },
  sgst_total:     { type: Number, default: 0 },
  igst_total:     { type: Number, default: 0 },
  gst_total:      { type: Number, default: 0 },
  grand_total:    { type: Number, default: 0 },
  balance_due:    { type: Number, default: 0 },   // grand_total - sum(allocations)
  amount_in_words:{ type: String, default: '' },

  // ── HSN Breakup ────────────────────────────────────────────────────────────
  hsn_breakup: [hsnBreakupSchema],

  // ── Payment Terms ──────────────────────────────────────────────────────────
  payment_terms:  { type: String, default: 'Net 30' },
  due_date:       { type: Date, default: null },     // invoice_date + credit_days
  payment_status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
    default: 'Unpaid',
    index: true,
  },
  payment_allocations: [paymentAllocationSchema],

  // ── e-Invoice (IRP) Fields ─────────────────────────────────────────────────
  irn:             { type: String, default: '', index: true },    // immutable once set
  irn_generated_at:{ type: Date, default: null },
  ack_no:          { type: String, default: '' },
  ack_date:        { type: Date, default: null },
  signed_invoice:  { type: String, default: '' },
  signed_qr_code:  { type: String, default: '' },
  irn_cancelled_at:{ type: Date, default: null },
  irn_cancel_reason:{ type: String, default: '' },
  is_irn_cancelled:{ type: Boolean, default: false },

  // ── PDF ────────────────────────────────────────────────────────────────────
  pdf_path: { type: String, default: '' },

  // ── GL Posting ────────────────────────────────────────────────────────────
  gl_posted:    { type: Boolean, default: false },
  gl_posted_at: { type: Date, default: null },
  gl_entry_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GLJournalEntry' }],

  // ── Status ─────────────────────────────────────────────────────────────────
  status: {
    type:    String,
    enum:    INVOICE_STATUSES,
    default: 'Draft',
    index:   true,
  },
  sent_at:      { type: Date, default: null },
  sent_to:      { type: String, default: '' },
  is_active:    { type: Boolean, default: true, index: true },

  // ── Credit Note linkage ────────────────────────────────────────────────────
  credit_note_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CreditNote' }],

  // ── MSME Alert ────────────────────────────────────────────────────────────
  msme_overdue_flag: { type: Boolean, default: false },

  // ── Audit ──────────────────────────────────────────────────────────────────
  internal_remarks: { type: String, default: '' },
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
salesInvoiceSchema.index({ customer_id: 1, invoice_date: -1 });   // AR aging
salesInvoiceSchema.index({ so_id: 1 });
salesInvoiceSchema.index({ status: 1, payment_status: 1 });
salesInvoiceSchema.index({ due_date: 1, payment_status: 1 });
salesInvoiceSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────
salesInvoiceSchema.virtual('is_overdue').get(function () {
  if (!this.due_date) return false;
  if (['Fully Paid', 'Closed', 'Cancelled'].includes(this.status)) return false;
  return new Date() > new Date(this.due_date);
});

salesInvoiceSchema.virtual('irn_cancellable').get(function () {
  if (!this.irn || this.is_irn_cancelled) return false;
  if (!this.irn_generated_at) return false;
  const hoursSince = (Date.now() - new Date(this.irn_generated_at).getTime()) / 3_600_000;
  return hoursSince <= 24;
});

salesInvoiceSchema.virtual('hours_since_irn').get(function () {
  if (!this.irn_generated_at) return null;
  return +((Date.now() - new Date(this.irn_generated_at).getTime()) / 3_600_000).toFixed(2);
});

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOK 1: Auto-generate Invoice Number
// ─────────────────────────────────────────────────────────────────────────────
salesInvoiceSchema.pre('save', async function (next) {
  if (this.invoice_no) return next();
  try {
    const y   = new Date().getFullYear();
    const m   = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const key = `inv-${y}${m}`;
    const counter = await mongoose.model('InvoiceIdCounter').findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.invoice_no = `INV-${y}${m}-${counter.seq.toString().padStart(4, '0')}`;
    return next();
  } catch (e) {
    return next(e);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOK 2: Recompute totals, HSN breakup, balance_due
// ─────────────────────────────────────────────────────────────────────────────
salesInvoiceSchema.pre('save', function (next) {
  let sub = 0, disc = 0, taxable = 0, cgst = 0, sgst = 0, igst = 0;
  const hsnMap = {};

  this.items.forEach(item => {
    const base    = +(item.unit_price * item.dispatched_qty).toFixed(4);
    const discAmt = +(base * (item.discount_percent / 100)).toFixed(4);
    const tax     = +(base - discAmt).toFixed(4);
    const gstPct  = item.gst_percentage || 18;

    item.discount_amount = +discAmt.toFixed(2);
    item.taxable_amount  = +tax.toFixed(2);

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

    sub     += base;
    disc    += discAmt;
    taxable += tax;

    // HSN breakup aggregation
    const hsn = item.hsn_code || 'UNKNOWN';
    if (!hsnMap[hsn]) {
      hsnMap[hsn] = { hsn_code: hsn, taxable_value: 0, gst_percentage: gstPct,
                      cgst_amount: 0, sgst_amount: 0, igst_amount: 0, total_tax: 0 };
    }
    hsnMap[hsn].taxable_value  += tax;
    hsnMap[hsn].cgst_amount    += item.cgst_amount;
    hsnMap[hsn].sgst_amount    += item.sgst_amount;
    hsnMap[hsn].igst_amount    += item.igst_amount;
    hsnMap[hsn].total_tax      += item.cgst_amount + item.sgst_amount + item.igst_amount;
  });

  this.sub_total      = +sub.toFixed(2);
  this.discount_total = +disc.toFixed(2);
  this.taxable_total  = +taxable.toFixed(2);
  this.cgst_total     = +cgst.toFixed(2);
  this.sgst_total     = +sgst.toFixed(2);
  this.igst_total     = +igst.toFixed(2);
  this.gst_total      = +(cgst + sgst + igst).toFixed(2);
  this.grand_total    = +(taxable + cgst + sgst + igst).toFixed(2);

  // HSN breakup (round values)
  this.hsn_breakup = Object.values(hsnMap).map(h => ({
    ...h,
    taxable_value: +h.taxable_value.toFixed(2),
    cgst_amount:   +h.cgst_amount.toFixed(2),
    sgst_amount:   +h.sgst_amount.toFixed(2),
    igst_amount:   +h.igst_amount.toFixed(2),
    total_tax:     +h.total_tax.toFixed(2),
  }));

  // balance_due: grand_total - sum of all payment allocations
  const paid = this.payment_allocations.reduce((s, a) => s + (a.allocated_amount || 0), 0);
  this.balance_due = +Math.max(0, this.grand_total - paid).toFixed(2);

  // Payment status
  if (paid === 0) {
    this.payment_status = 'Unpaid';
  } else if (this.balance_due <= 0.01) {
    this.payment_status = 'Fully Paid';
  } else {
    this.payment_status = 'Partially Paid';
  }

  // Amount in words
  this.amount_in_words = amountToWords(this.grand_total);

  return next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Amount in words helper (Indian: Lakhs/Crores)
// ─────────────────────────────────────────────────────────────────────────────
function amountToWords(amount) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const cvt = n => {
    if (n === 0) return '';
    let r = '';
    if (n >= 100) { r += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20)  { r += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0)    { r += ones[n] + ' '; }
    return r.trim();
  };
  const toWords = n => {
    if (n === 0) return 'Zero';
    let res = '', gi = 0;
    while (n > 0) {
      let g;
      if (gi === 0) { g = n % 1000; n = Math.floor(n / 1000); }
      else          { g = n % 100;  n = Math.floor(n / 100); }
      if (g > 0) {
        const scales = ['', 'Thousand', 'Lakh', 'Crore'];
        let w = cvt(g);
        if (scales[gi]) w += ' ' + scales[gi];
        res = w + ' ' + res;
      }
      gi++;
    }
    return res.trim();
  };
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let result = (toWords(rupees) || 'Zero') + ' Rupees';
  if (paise > 0) result += ' and ' + toWords(paise) + ' Paise';
  return (result + ' Only').replace(/\s+/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// STATICS
// ─────────────────────────────────────────────────────────────────────────────
salesInvoiceSchema.statics.isValidTransition = function (from, to) {
  return (INVOICE_STATUS_TRANSITIONS[from] || []).includes(to);
};

const SalesInvoice = mongoose.model('SalesInvoice', salesInvoiceSchema);

module.exports = {
  SalesInvoice,
  INVOICE_STATUSES,
  INVOICE_STATUS_TRANSITIONS,
};