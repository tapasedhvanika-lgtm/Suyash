const mongoose = require('mongoose');

const SubgroupSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, default: Date.now },
  inspection_record_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionRecord' },
  readings: { type: [Number], required: true },
  x_bar: { type: Number },
  r_value: { type: Number },
  s_value: { type: Number },
  is_ooc: { type: Boolean, default: false },
  ooc_rule: { type: String }, // "Rule1", "Rule2", "Rule3", "Rule4"
}, { _id: false });

const SpcDataSchema = new mongoose.Schema({
  spc_id: { type: String, unique: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionPlan' },
  checkpoint_seq: { type: Number, required: true },
  characteristic: { type: String, required: true },
  control_chart_type: {
    type: String,
    enum: ['X-bar R', 'X-bar S', 'I-MR', 'p-chart', 'np-chart', 'c-chart', 'u-chart'],
    required: true,
  },
  usl: { type: Number },
  lsl: { type: Number },
  target: { type: Number },
  subgroup_size: { type: Number },
  subgroups: [SubgroupSchema],
  ucl: { type: Number },
  lcl: { type: Number },
  center_line: { type: Number },
  cp: { type: Number },
  cpk: { type: Number },
  pp: { type: Number },
  ppk: { type: Number },
  capability_status: {
    type: String,
    enum: ['Capable', 'Marginally Capable', 'Incapable'],
  },
  last_updated: { type: Date, default: Date.now },
}, { timestamps: true });

SpcDataSchema.pre('save', async function (next) {
  if (!this.spc_id) {
    const count = await mongoose.model('SpcData').countDocuments();
    this.spc_id = `SPC-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('SpcData', SpcDataSchema);