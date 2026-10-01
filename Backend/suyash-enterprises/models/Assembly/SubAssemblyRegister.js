'use strict';
const mongoose = require('mongoose');

const subAssemblyRegisterSchema = new mongoose.Schema({
  register_id: { type: String, unique: true, required: true, trim: true, uppercase: true },
  parent_wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true, index: true },
  parent_wo_number: { type: String, required: true },
  parent_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  child_wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true, index: true },
  child_wo_number: { type: String, required: true },
  child_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  child_part_no: { type: String, required: true, trim: true, uppercase: true },
  required_qty: { type: Number, required: true, min: 0.001 },
  available_qty: { type: Number, default: 0 },
  shortage_qty: { type: Number, default: 0 },
  child_wo_status: { type: String, default: '' },
  child_wo_completed_qty: { type: Number, default: 0 },
  dependency_met: { type: Boolean, default: false },
  expected_completion_date: { type: Date },
  priority_escalated: { type: Boolean, default: false },
  escalation_date: { type: Date },
  notes: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

subAssemblyRegisterSchema.pre('save', function(next) {
  this.shortage_qty = Math.max(0, this.required_qty - this.available_qty);
  this.dependency_met = this.available_qty >= this.required_qty;
  next();
});

subAssemblyRegisterSchema.pre('save', async function(next) {
  if (this.register_id) return next();
  try {
    const d = new Date();
    const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `sar-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.register_id = `SAR-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('SubAssemblyRegister', subAssemblyRegisterSchema);