const mongoose = require('mongoose');

const CheckpointSchema = new mongoose.Schema({
  step_no: { type: Number, required: true },
  
  characteristic: { type: String, required: true },
  
  characteristic_type: {
    type: String,
    enum: ['Dimensional', 'Visual', 'Functional', 'Material', 'Surface', 'Mechanical', 'Electrical', 'Chemical'],
    required: true,
  },
  specification: { type: String, required: true },
  nominal_value: { type: Number },
  upper_tolerance: { type: Number },
  lower_tolerance: { type: Number },
  unit: { type: String },
  gauge_type: { type: String },
  gauge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GaugeMaster' },
  
  // CHANGE THIS: from 'measurement_method' to 'method'
  method: { type: String },
  
  is_critical: { type: Boolean, default: false },
  is_significant: { type: Boolean, default: false },
  is_spc: { type: Boolean, default: false },
  control_chart_type: {
    type: String,
    enum: ['X-bar R', 'X-bar S', 'I-MR', 'p-chart', 'np-chart', 'c-chart', 'u-chart'],
  },
  subgroup_size: { type: Number },
  aql_level: { type: String },
  sample_size: { type: Number },
  frequency: { type: String },
  
  // CHANGE THIS: from 'accept_criteria' to 'acceptance_criteria'
  acceptance_criteria: { type: String },
  
  photo_required: { type: Boolean, default: false },
}, { _id: false });

// Rest of the schema remains the same...
const InspectionPlanSchema = new mongoose.Schema({
  plan_id: { type: String, unique: true },
  plan_name: { type: String, required: true },
  plan_type: {
    type: String,
    enum: ['Incoming', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer-Specific', 'Combined'],
    required: true,
  },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  drawing_no: { type: String },
  drawing_revision: { type: String },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  applicable_process: { type: String },
  frequency: {
    type: String,
    enum: ['100%', 'AQL', 'First Article Only', 'Per Lot', 'Per Shift', 'Per Batch'],
  },
  aql_level: { type: String },
  inspection_level: { type: String, enum: ['I', 'II', 'III'] },
  sample_size: { type: Number },
  accept_number: { type: Number },
  reject_number: { type: Number },
  is_ppap_plan: { type: Boolean, default: false },
  ppap_level: { type: Number, min: 1, max: 5 },
  approval_status: {
    type: String,
    enum: ['Pending', 'Pending Approval', 'Approved', 'Rejected', 'Superseded'],
    default: 'Pending',
    required: true,
  },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_at: { type: Date },
  effective_from: { type: Date },
  superseded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionPlan' },
  is_active: { type: Boolean, default: true },
  checkpoints: { type: [CheckpointSchema], required: true },
}, { timestamps: true });

InspectionPlanSchema.pre('save', async function (next) {
  if (!this.plan_id) {
    const count = await mongoose.model('InspectionPlan').countDocuments();
    this.plan_id = `QP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('InspectionPlan', InspectionPlanSchema);