// const mongoose = require('mongoose');

// const finishedGoodSchema = new mongoose.Schema({
//   ref_no: { type: String, unique: true, sparse: true, index: true },
//   fg_date: { type: Date, required: true, default: Date.now },
  
//   product_type: { type: String, required: true, enum: ['Existing', 'New'] },
//   item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  
//   name: { type: String, required: true },
//   code: { type: String, required: true },
  
//   quantity: { type: Number, required: true },
//   unit: { type: String, default: 'Nos' },
  
//   scrap_quantity: { type: Number, default: 0 },
//   scrap_unit: { type: String, default: 'Kg' },
  
//   remarks: { type: String },
//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// module.exports = mongoose.model('FinishedGood', finishedGoodSchema);

const mongoose = require('mongoose');

const finishedGoodSchema = new mongoose.Schema({
  ref_no: { type: String, unique: true, sparse: true, index: true },
  fg_date: { type: Date, required: true, default: Date.now },
  
  // 👇 NAYA CODE: MIS ka link add kiya gaya hai 👇
  mis_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialIssueSlip', default: null },
  mis_ref_no: { type: String },

  product_type: { type: String, required: true, enum: ['Existing', 'New'] },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  
  name: { type: String, required: true },
  code: { type: String, required: true },
  
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Nos' },
  
  scrap_quantity: { type: Number, default: 0 },
  scrap_unit: { type: String, default: 'Kg' },
  
  remarks: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FinishedGood', finishedGoodSchema);