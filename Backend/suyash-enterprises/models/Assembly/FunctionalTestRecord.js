'use strict';
const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  serial_no: { type: String, required: true, trim: true },
  actual_value: { type: String, required: true },
  pass_fail: { type: String, enum: ['Pass', 'Fail'], required: true },
  remarks: { type: String, default: '' },
  retest_count: { type: Number, default: 0 },
  tested_at: { type: Date, default: Date.now }
}, { _id: true });

const functionalTestRecordSchema = new mongoose.Schema({
  test_record_id: { type: String, unique: true, trim: true, uppercase: true },
  wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true, index: true },
  wo_number: { type: String, required: true },
  test_date: { type: Date, required: true, default: Date.now },
  test_type: { type: String, enum: ['Continuity Test', 'HiPot Test', 'Pressure Test', 'Leak Test', 'Dimensional Verification', 'Functional Operation Test', 'Insulation Resistance', 'Visual Inspection', 'Other'], required: true },
  test_standard: { type: String, default: '' },
  test_equipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GaugeMaster' },
  test_equipment_name: { type: String, default: '' },
  test_equipment_calibration_valid: { type: Boolean, default: true },
  test_parameter: { type: String, required: true },
  specified_value: { type: String, required: true },
  tested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  tested_by_name: { type: String, default: '' },
  witness_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  witness_name: { type: String, default: '' },
  results: [testResultSchema],
  test_report_path: { type: String, default: '' },
  ncr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NCR' },
  overall_result: { type: String, enum: ['Passed', 'Failed', 'Partially Passed'], required: true },
  passed_count: { type: Number, default: 0 },
  failed_count: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

functionalTestRecordSchema.pre('save', function(next) {
  this.passed_count = this.results.filter(r => r.pass_fail === 'Pass').length;
  this.failed_count = this.results.filter(r => r.pass_fail === 'Fail').length;
  
  if (this.failed_count === 0) this.overall_result = 'Passed';
  else if (this.passed_count === 0) this.overall_result = 'Failed';
  else this.overall_result = 'Partially Passed';
  next();
});

functionalTestRecordSchema.pre('save', async function(next) {
  if (this.test_record_id) return next();
  try {
    const d = new Date();
    const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `ftr-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.test_record_id = `FTR-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('FunctionalTestRecord', functionalTestRecordSchema);