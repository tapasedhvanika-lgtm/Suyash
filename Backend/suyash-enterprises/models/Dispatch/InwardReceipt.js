// models/Dispatch/InwardReceipt.js
const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  dc_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  part_no: { type: String, required: true, uppercase: true },
  part_name: { type: String, required: true },
  hsn_code: { type: String, required: true },
  original_qty: { type: Number, required: true, min: 0 },
  previous_received_qty: { type: Number, default: 0 },
  receiving_qty: { type: Number, required: true, min: 0.001 },
  remaining_qty: { type: Number, default: 0 },
  unit: { type: String, enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'], required: true },
  unit_price: { type: Number, default: 0 },
  taxable_value: { type: Number, default: 0 },
  secondary_qty: { type: Number, default: 0 },
  secondary_unit: { type: String, default: '' },
  item_process_remark: { type: String, default: '' },
  condition: { 
    type: String, 
    enum: ['Good', 'Damaged', 'Defective', 'Partial'], 
    default: 'Good' 
  },
  remarks: { type: String },
  batch_no: { type: String },
  serial_numbers: [{ type: String }],
  location: { type: String },
  quality_status: { 
    type: String, 
    enum: ['Pending', 'Passed', 'Failed', 'Quarantine'], 
    default: 'Pending' 
  }
});

const documentSchema = new mongoose.Schema({
  document_type: { 
    type: String, 
    enum: ['POD', 'GRN', 'Invoice', 'Challan', 'Others'], 
    required: true 
  },
  document_number: { type: String },
  document_date: { type: Date },
  file_path: { type: String, required: true },
  file_name: { type: String },
  file_size: { type: Number },
  mime_type: { type: String },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaded_at: { type: Date, default: Date.now }
}, { _id: false });

const inwardReceiptSchema = new mongoose.Schema({
  receipt_id: { type: String, unique: true },
  receipt_date: { type: Date, default: Date.now },
  
  // Links
  dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan', required: true, index: true },
  dc_number: { type: String, required: true },
  
  // ✅ FIXED: Made optional for vendor-based DCs
  so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: false },
  so_number: { type: String, required: false },
  
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer_name: { type: String, required: true },
  
  // Receipt Details
  receipt_type: { 
    type: String, 
    enum: ['Full Receipt', 'Partial Receipt', 'Final Receipt'], 
    required: true 
  },
  receipt_number: { type: String },
  receipt_note: { type: String },
  
  // Items with receipt tracking
  items: [receiptItemSchema],
  
  // Overall totals
  total_received_qty: { type: Number, default: 0 },
  total_taxable_value: { type: Number, default: 0 },
  total_items_received: { type: Number, default: 0 },
  total_items_pending: { type: Number, default: 0 },
  
  // Documents
  documents: [documentSchema],
  
  // Reference
  reference_document_id: { type: mongoose.Schema.Types.ObjectId },
  reference_document_type: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['Received', 'Partially Received', 'Cancelled'], 
    default: 'Received' 
  },
  is_fully_received: { type: Boolean, default: false },
  
  // Audit
  received_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Stock entry tracking
  stock_entries_created: { type: Boolean, default: false },
  stock_entry_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StockEntry' }]
}, { timestamps: true });

// Indexes
inwardReceiptSchema.index({ receipt_id: 1 });
inwardReceiptSchema.index({ dc_id: 1, status: 1 });
inwardReceiptSchema.index({ so_id: 1 });
inwardReceiptSchema.index({ 'items.part_no': 1 });
inwardReceiptSchema.index({ receipt_date: -1 });

// Generate receipt_id
inwardReceiptSchema.pre('save', async function(next) {
  if (!this.receipt_id) {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `ir-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.receipt_id = `IR-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
  }
  
  // Calculate totals
  this.total_received_qty = this.items.reduce((sum, i) => sum + (i.receiving_qty || 0), 0);
  this.total_taxable_value = this.items.reduce((sum, i) => sum + (i.taxable_value || 0), 0);
  this.total_items_received = this.items.filter(i => i.receiving_qty > 0).length;
  this.total_items_pending = this.items.filter(i => i.remaining_qty > 0).length;
  
  next();
});

module.exports = mongoose.model('InwardReceipt', inwardReceiptSchema);