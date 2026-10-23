// models/Inventory/RMPurchase.js
const mongoose = require('mongoose');

const rmPurchaseSchema = new mongoose.Schema({
  ref_no: { type: String, unique: true, sparse: true, index: true },
  purchase_date: { type: Date, required: [true, 'Date is required'], default: Date.now, index: true },
  rm_type: { type: String, required: [true, 'RM Type is required'], enum: ['Existing', 'New'] },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  code: { type: String, required: [true, 'Code is required'], trim: true, uppercase: true },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    validate: { validator: (v) => v > 0, message: 'Quantity must be greater than 0' }
  },
  unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'], default: 'Kg' },
  party_name: { type: String, required: [true, 'Party Name is required'], trim: true },
  invoice_no: { type: String, required: [true, 'Invoice No is required'], trim: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

rmPurchaseSchema.index({ party_name: 1, invoice_no: 1 });

module.exports = mongoose.model('RMPurchase', rmPurchaseSchema);