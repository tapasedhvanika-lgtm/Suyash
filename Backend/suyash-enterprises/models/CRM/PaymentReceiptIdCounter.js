'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// models/CRM/PaymentReceiptIdCounter.js
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const paymentReceiptIdCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
module.exports = mongoose.model('PaymentReceiptIdCounter', paymentReceiptIdCounterSchema);