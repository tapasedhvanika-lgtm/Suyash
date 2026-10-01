const mongoose = require('mongoose');

const CalibrationRecordSchema = new mongoose.Schema({
  cal_record_id: { 
    type: String
 },

  calibration_date: {
     type: Date, 
     required: true 
    },

  calibration_type: {
    type: String,
    enum: ['Internal', 'External NABL', 'Manufacturer Service'],
    required: true,
  },
  calibrating_agency: {
     type: String,
      required: true
     },

  certificate_no: { 
    type: String,
     required: true
     },

  certificate_path: { 
    type: String, 
    required: true 
},

  found_condition: {
    type: String,
    enum: ['Within Tolerance', 'Out of Tolerance', 'Damaged'],
  },
  adjustment_made: { 
    type: Boolean, 
    default: false 
},

  adjustment_details: {
     type: String
     },

  next_calibration_date: { 
    type: Date, 
    required: true 
},

  calibrated_by: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee' 
    },

  traceability: { type: String 

  },
  
}, { _id: false });

const GaugeMasterSchema = new mongoose.Schema({
  gauge_id: { type: String, unique: true },
  gauge_name: { type: String, required: true },
  gauge_type: {
    type: String,
    enum: [
      'Vernier Caliper', 'Outside Micrometer', 'Inside Micrometer',
      'Depth Gauge', 'Dial Gauge', 'CMM', 'Go-NoGo Gauge', 'Thread Gauge',
      'Pressure Gauge', 'Torque Wrench', 'Shore Durometer',
      'Rockwell Hardness Tester', 'XRF Gauge', 'Megger',
      'Micro-Ohmmeter', 'HiPot Tester', 'Surface Roughness Tester',
      'Optical Comparator', 'Other',
    ],
    required: true,
  },
  gauge_code: { type: String, required: true, unique: true },
  make: { type: String },
  model: { type: String },
  serial_no: { type: String },
  range: { type: String },
  least_count: { type: String },
  accuracy: { type: String },
  department: { type: String },
  location: { type: String },
  custodian_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  calibration_frequency_days: { type: Number, required: true },
  last_calibration_date: { type: Date },
  next_calibration_date: { type: Date, index: true },
  calibration_agency: { type: String },
  nabl_accredited: { type: Boolean, default: false },
  
 status: {
  type: String,
  enum: ['Pending Calibration', 'Calibrated', 'Overdue', 'Under Calibration', 'Out of Service', 'Condemned'],
  default: 'Pending Calibration',
  required: true,
},
  // MSA fields for IATF 16949
  msa_required: { type: Boolean, default: false },
  msa_last_done: { type: Date },
  msa_result: {
    type: String,
    enum: ['Acceptable', 'Marginally Acceptable', 'Unacceptable'],
  },
  msa_grr_pct: { type: Number },
  gage_r_and_r_percent: { type: Number },
  bias: { type: Number },
  linearity: { type: Number },
  calibration_records: [CalibrationRecordSchema],
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate gauge_id before save
GaugeMasterSchema.pre('save', async function (next) {
  if (!this.gauge_id) {
    const count = await mongoose.model('GaugeMaster').countDocuments();
    this.gauge_id = `GAUGE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('GaugeMaster', GaugeMasterSchema);