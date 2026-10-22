const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  quantity: { type: Number, required: true },
  partyName: { type: String, required: true },
  rmType: { type: String, enum: ['Existing', 'New'], required: true },
  invoiceNo: { type: String, required: true },
  date: { type: Date, default: Date.now },
  refNumber: { type: String, unique: true } // Auto-generated reference
}, { timestamps: true });

module.exports = mongoose.model('PurchaseRawMaterial', purchaseSchema);