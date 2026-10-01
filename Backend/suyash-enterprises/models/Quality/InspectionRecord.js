const mongoose = require('mongoose');

const CheckpointResultSchema = new mongoose.Schema({
  checkpoint_seq: { 
    type: Number,
    required: true 
  },

  characteristic: { 
    type: String,
    required: true 
  },

  specification: { 
    type: String,
    required: true 
  },

  nominal: { 
    type: Number
  },

  usl: { 
    type: Number
  },

  lsl: { 
    type: Number 
  },

  readings: { 
    type: [Number],
    required: true
  },

  average_reading: { 
    type: Number 
  },

  min_reading: { 
    type: Number 
  },

  max_reading: { 
    type: Number
  },

  within_spec: { 
    type: Boolean,
    required: true
  },

  gauge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GaugeMaster' },
  gauge_calibration_valid: { type: Boolean },
  inspector_note: { type: String },
  photo_path: { type: String },

  result: {
    type: String,
    enum: ['Pass', 'Fail', 'Observation'],
    required: true,
  },
}, { _id: false });

const InspectionRecordSchema = new mongoose.Schema({
  inspection_id: { type: String, unique: true },
  inspection_date: { type: Date, required: true, default: Date.now },

  inspection_type: {
    type: String,
    enum: ['Incoming', 'First Article', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer Audit', 'Periodic', 'Concession Review'],
    required: true,
  },

  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionPlan' },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item'},
  part_no: { type: String },
  drawing_no: { type: String },
  drawing_revision: { type: String },
  grn_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GRN' },
  wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  op_sequence: { type: Number },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },

  // ==============================================
  // CHANGED: Made lot_size and sample_size optional
  // ==============================================
  lot_size: { type: Number, default: 0 },
  sample_size: { type: Number, default: 0 },

  accepted_qty: { type: Number },
  rejected_qty: { type: Number },
  rework_qty: { type: Number },
  on_hold_qty: { type: Number },


overall_result: {
  type: String,
  enum: ['Pending', 'Partially Completed', 'Accepted', 'Rejected', 'Conditionally Accepted', 'Rework Required', 'On Hold'],
  default: 'Pending',
},

  disposition: {
    type: String,
    enum: ['Use As-Is', 'Sort', 'Rework', 'Return to Vendor', 'Scrap', 'MRB Review', 'Customer Concession'],
  },

  ncr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NCR' },
  inspector_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee'},
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewed_at: { type: Date },
  report_path: { type: String },
  checkpoint_results: [CheckpointResultSchema],

  attachments: [{
    file_name: String,
    file_path: String,
    description: String,
    uploaded_at: { type: Date, default: Date.now },
  }],

  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate inspection_id before save
InspectionRecordSchema.pre('save', async function (next) {
  if (!this.inspection_id) {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.model('InspectionRecord').countDocuments();
    this.inspection_id = `IR-${ym}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('InspectionRecord', InspectionRecordSchema);