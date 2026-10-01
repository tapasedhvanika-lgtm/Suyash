const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  so_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  part_no: { type: String, required: true, uppercase: true },
  return_qty: { type: Number, required: true, min: 0 },
  unit_price: { type: Number, default: 0 },
  taxable_value: { type: Number, default: 0 },
  reason_per_item: { type: String },
  condition: { type: String, enum: ['Good', 'Damaged', 'Defective'], default: 'Defective' }
});

const customerReturnSchema = new mongoose.Schema({
  return_id: { type: String, unique: true },
  return_date: { type: Date, default: Date.now },
  return_type: { 
    type: String, 
    enum: ['Rejected at Delivery', 'Return After Delivery', 'Partial Return'], 
    required: true 
  },
  
  original_dc_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryChallan', required: true, index: true },
  original_dc_number: { type: String },
  
  so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  return_reason: { 
    type: String, 
    enum: ['Quality Rejection', 'Wrong Part', 'Short Quantity', 'Damage in Transit', 'Over Delivery', 'Customer Order Change', 'Other'], 
    required: true 
  },
  rejection_details: { type: String, required: true },
  
  items: [returnItemSchema],
  total_return_value: { type: Number, default: 0 },
  
  return_dc_number: { type: String },
  return_eway_bill_no: { type: String },
  
  inward_inspection_done: { type: Boolean, default: false },
  inward_inspection_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionRecord' },
  
  ncr_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NCR' },
  credit_note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesInvoice' },
  replacement_so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  
  stock_disposition: { type: String, enum: ['Return to FG Store', 'Rework Required', 'Scrap'] },
  
  status: { 
    type: String, 
    enum: ['Initiated', 'Return in Transit', 'Received', 'Inspected', 'Credit Note Raised', 'Closed'], 
    default: 'Initiated' 
  },
  
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
customerReturnSchema.index({ return_id: 1 });
customerReturnSchema.index({ original_dc_id: 1 });
customerReturnSchema.index({ status: 1 });
customerReturnSchema.index({ so_id: 1 });

// Generate return_id
customerReturnSchema.pre('save', async function(next) {
  if (!this.return_id) {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `ret-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.return_id = `RET-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
  }
  
  // Calculate total return value
  for (const item of this.items) {
    if (item.return_qty && item.unit_price && !item.taxable_value) {
      item.taxable_value = +(item.return_qty * item.unit_price).toFixed(2);
    }
  }
  this.total_return_value = this.items.reduce((sum, i) => sum + (i.taxable_value || 0), 0);
  next();
});

module.exports = mongoose.model('CustomerReturn', customerReturnSchema);