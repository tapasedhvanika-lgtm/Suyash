
// const mongoose = require('mongoose');

// const issueSlipSchema = new mongoose.Schema({
//   // Auto generated: MIS-YYYYMM-XXXX
//   ref_no: { type: String, unique: true, sparse: true, index: true },

//   issue_date: { type: Date, required: [true, 'Date is required'], default: Date.now, index: true },

//   // Kis Purchase Raw Material (lot) me se material nikal raha hai
//   purchase_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'RMPurchase',
//     required: [true, 'Raw material (purchase) is required'],
//     index: true
//   },
//   purchase_ref: { type: String, trim: true }, // RMP-YYYYMM-XXXX

//   // Purchase se copy kiya hua (slip par wahi dikhega jo issue ke time tha)
//   name: { type: String, required: [true, 'Material name is required'], trim: true },
//   code: { type: String, required: [true, 'Material code is required'], trim: true, uppercase: true },
//   unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'], default: 'Kg' },

//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     validate: { validator: (v) => v > 0, message: 'Quantity must be greater than 0' }
//   },

//   issued_to: { type: String, required: [true, 'To (receiver name) is required'], trim: true },
//   department: { type: String, required: [true, 'Department is required'], trim: true },

//   created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// module.exports = mongoose.model('MaterialIssueSlip', issueSlipSchema);

const mongoose = require('mongoose');

const issueSlipSchema = new mongoose.Schema({
  ref_no: { type: String, unique: true, sparse: true, index: true },
  issue_date: { type: Date, required: [true, 'Date is required'], default: Date.now, index: true },
  purchase_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RMPurchase',
    required: [true, 'Raw material (purchase) is required'],
    index: true
  },
  purchase_ref: { type: String, trim: true },
  name: { type: String, required: [true, 'Material name is required'], trim: true },
  code: { type: String, required: [true, 'Material code is required'], trim: true, uppercase: true },
  unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'], default: 'Kg' },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    validate: { validator: (v) => v > 0, message: 'Quantity must be greater than 0' }
  },
  issued_to: { type: String, required: [true, 'To (receiver name) is required'], trim: true },
  department: { type: String, required: [true, 'Department is required'], trim: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });


module.exports = mongoose.model('MaterialIssueSlip', issueSlipSchema);