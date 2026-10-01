const mongoose = require('mongoose');

const packageContentSchema = new mongoose.Schema({
  part_no: { type: String, required: true, uppercase: true },
  description: { type: String },
  qty: { type: Number, required: true, min: 0 },
  batch_no: { type: String },
  serial_numbers: [{ type: String }]
});

const packageSchema = new mongoose.Schema({
  package_no: { type: Number, required: true },
  package_type: {
    type: String,
    enum: [
      'Cardboard Box',
      'Wooden Crate',
      'Pallet',
      'Gunny Bag',
      'Bare Bundle',
      'Polybag',
      'Drum',
      'Box',           // kept for backward compatibility
      'Crate',         // kept for backward compatibility
      'Bag'  ,
      'Tray'       
    ],
    default: 'Cardboard Box'
  },
  dimensions_l_mm: { type: Number },
  dimensions_w_mm: { type: Number },
  dimensions_h_mm: { type: Number },
  gross_weight_kg: { type: Number },
  net_weight_kg: { type: Number },
  contents: [packageContentSchema]
});

const packingListSchema = new mongoose.Schema({
  packing_list_id: { type: String, unique: true },
  pl_date: { type: Date, default: Date.now },
  dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan', required: true, index: true },
  packages: [packageSchema],
  total_packages: { type: Number, required: true },
  total_gross_weight_kg: { type: Number },
  total_net_weight_kg: { type: Number },
  packed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  packing_date: { type: Date },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pdf_path: { type: String },
  status: { type: String, enum: ['Draft', 'Completed', 'Verified'], default: 'Draft' }
}, { timestamps: true });

// Indexes
packingListSchema.index({ packing_list_id: 1 });
packingListSchema.index({ dc_id: 1 });
packingListSchema.index({ status: 1 });

// Generate packing_list_id
packingListSchema.pre('save', async function(next) {
  if (!this.packing_list_id) {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `pl-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.packing_list_id = `PL-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PackingList', packingListSchema);