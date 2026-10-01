'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/CRM/InvoiceIdCounter.js
//
// Atomic counter for Invoice number generation.
// Key format: inv-YYYYMM  e.g. "inv-202503"
// Sequence resets each financial year (by key change).
// Invoice number format: INV-YYYYMM-XXXX (gapless, sequential)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const invoiceIdCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },   // e.g. "inv-202503"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('InvoiceIdCounter', invoiceIdCounterSchema);