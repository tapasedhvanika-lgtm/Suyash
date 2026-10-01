'use strict';
const mongoose = require('mongoose');

const torqueRecordSchema = new mongoose.Schema({
  torque_record_id: { type: String, unique: true, trim: true, uppercase: true },
  wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true, index: true },
  wo_number: { type: String, required: true },
  assembly_serial_no: { type: String, trim: true, index: true },
  assembly_seq_no: { type: Number, min: 1 },
  op_sequence: { type: Number, required: true },
  operation_name: { type: String, required: true },
  joint_reference: { type: String, required: true, trim: true },
  bolt_part_no: { type: String, trim: true },
  bolt_size: { type: String, trim: true },
  specified_torque_nm: { type: Number, required: true, min: 0 },
  torque_min_nm: { type: Number, required: true },
  torque_max_nm: { type: Number, required: true },
  actual_torque_nm: { type: Number, required: true },
  within_spec: { type: Boolean, default: false },
  torque_tool_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', default: null },
  torque_tool_name: { type: String, default: '' },
  torque_tool_calibration_valid: { type: Boolean, default: true },
  applied_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  applied_by_name: { type: String, default: '' },
  applied_at: { type: Date, required: true, default: Date.now },
  pass_fail: { type: String, enum: ['Pass', 'Fail'], required: true },
  failure_action: { type: String, default: '' },
  retry_count: { type: Number, default: 0 },
  previous_attempt_torque: { type: Number },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  verified_at: { type: Date },
  remarks: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

torqueRecordSchema.pre('save', function(next) {
  this.within_spec = this.actual_torque_nm >= this.torque_min_nm && 
                     this.actual_torque_nm <= this.torque_max_nm;
  this.pass_fail = this.within_spec ? 'Pass' : 'Fail';
  next();
});

torqueRecordSchema.pre('save', async function(next) {
  if (this.torque_record_id) return next();
  try {
    const d = new Date();
    const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `tqr-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.torque_record_id = `TQR-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('TorqueRecord', torqueRecordSchema);