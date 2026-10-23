const mongoose = require('mongoose');

const materialIssueSlipSchema = new mongoose.Schema({
  ref_no: { type: String, unique: true, sparse: true, index: true },
  issue_date: { type: Date, required: true, default: Date.now },
  department: { type: String, required: true },
  issued_to: { type: String, required: true },
  
  rmp_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RMPurchase' },
  rmp_ref_no: { type: String },

  items: [{
    rm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RMPurchase' },
    name: { type: String, required: true },
    code: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Kg' }
  }],
  
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('MaterialIssueSlip', materialIssueSlipSchema);