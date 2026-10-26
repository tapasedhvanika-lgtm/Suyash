


// const mongoose = require('mongoose');
// const rmPurchaseSchema = new mongoose.Schema({
//   ref_no: { type: String, unique: true, sparse: true, index: true },
//   purchase_date: { type: Date, required: [true, 'Date is required'], default: Date.now, index: true },
//   rm_type: { type: String, required: [true, 'RM Type is required'], enum: ['Existing', 'New'] },
//   item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
//   name: { type: String, required: [true, 'Name is required'], trim: true },
//   code: { type: String, required: [true, 'Code is required'], trim: true, uppercase: true },
//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     validate: { validator: (v) => v > 0, message: 'Quantity must be greater than 0' }
//   },
//   unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'], default: 'Kg' },
//   party_name: { type: String, required: [true, 'Party Name is required'], trim: true },
//   invoice_no: { type: String, required: [true, 'Invoice No is required'], trim: true },
  
//   used_qty: { type: Number, default: 0 },
//   remaining_qty: { type: Number, default: 0 },
  
//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// rmPurchaseSchema.index({ party_name: 1, invoice_no: 1 });

// module.exports = mongoose.model('RMPurchase', rmPurchaseSchema);
//================================================
//=============================================
// const mongoose = require('mongoose');
// const rmPurchaseSchema = new mongoose.Schema({
//   // 👇 Yahan se unique: true hata diya hai 👇
//   ref_no: { type: String, sparse: true, index: true },
//   purchase_date: { type: Date, required: [true, 'Date is required'], default: Date.now, index: true },
//   rm_type: { type: String, required: [true, 'RM Type is required'], enum: ['Existing', 'New'] },
//   item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
//   name: { type: String, required: [true, 'Name is required'], trim: true },
//   code: { type: String, required: [true, 'Code is required'], trim: true, uppercase: true },
//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     validate: { validator: (v) => v > 0, message: 'Quantity must be greater than 0' }
//   },
//   unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'], default: 'Kg' },
//   party_name: { type: String, required: [true, 'Party Name is required'], trim: true },
//   invoice_no: { type: String, required: [true, 'Invoice No is required'], trim: true },
  
//   used_qty: { type: Number, default: 0 },
//   remaining_qty: { type: Number, default: 0 },
  
//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// rmPurchaseSchema.index({ party_name: 1, invoice_no: 1 });

// module.exports = mongoose.model('RMPurchase', rmPurchaseSchema);

const mongoose = require('mongoose');

const rmPurchaseSchema = new mongoose.Schema({
 
  ref_no: { type: String, sparse: true, index: true },
  purchase_date: { type: Date, required: [true, 'Date is required'], default: Date.now, index: true },
  rm_type: { type: String, required: [true, 'RM Type is required'], enum: ['Existing', 'New'] },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  code: { type: String, required: [true, 'Code is required'], trim: true, uppercase: true },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    validate: { validator: (v) => v > 0, message: 'Quantity must be greater than 0' }
  },
  unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'], default: 'Kg' },
  party_name: { type: String, required: [true, 'Party Name is required'], trim: true },
  invoice_no: { type: String, required: [true, 'Invoice No is required'], trim: true },
  
  used_qty: { type: Number, default: 0 },
  remaining_qty: { type: Number, default: 0 },
  
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

rmPurchaseSchema.index({ party_name: 1, invoice_no: 1 });

const RMPurchase = mongoose.model('RMPurchase', rmPurchaseSchema);


RMPurchase.collection.dropIndex('ref_no_1')
  .then(() => {
    console.log('✅ Purana Unique Index (ref_no_1) Database se drop ho gaya.');
  })
  .catch((error) => {
    
    if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
      console.log('ℹ️ Index drop status:', error.message);
    }
  });

module.exports = RMPurchase;