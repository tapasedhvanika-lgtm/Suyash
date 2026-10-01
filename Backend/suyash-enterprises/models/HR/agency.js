const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  agencyCode: { type: String, required: true, unique: true },
  agencyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String, required: true },
  address: { type: String },
  notes: { type: String },
  status: { type: String, default: 'Active' } 
}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);