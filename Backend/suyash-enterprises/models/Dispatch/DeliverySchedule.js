const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  so_item_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  part_no: { type: String, required: true, uppercase: true },
  part_name: { type: String, required: true },
  scheduled_qty: { type: Number, required: true, min: 0 },
  available_fg_qty: { type: Number, default: 0 },
  remarks: { type: String }
});

const deliveryScheduleSchema = new mongoose.Schema({
  schedule_id: { type: String, unique: true },
  schedule_date: { type: Date, default: Date.now },
  dispatch_date: { type: Date, required: true, index: true },
  
  so_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true, index: true },
  so_number: { type: String, required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  shipping_address_id: { type: String },
  
  items: [scheduleItemSchema],
  total_scheduled_qty: { type: Number, default: 0 },
  
  transporter_preference: { type: String },
  vehicle_type: { type: String, enum: ['Mini Truck', 'Tempo', 'Truck', 'Container', 'Courier', 'Hand Delivery'] },
  special_instructions: { type: String },
  
  status: { 
    type: String, 
    enum: ['Draft', 'Confirmed', 'Packing In Progress', 'Ready for Dispatch', 'Dispatched', 'Cancelled'], 
    default: 'Draft' 
  },
  
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
deliveryScheduleSchema.index({ schedule_id: 1 });
deliveryScheduleSchema.index({ so_id: 1, status: 1 });
deliveryScheduleSchema.index({ dispatch_date: 1, status: 1 });

// Generate schedule_id
deliveryScheduleSchema.pre('save', async function(next) {
  if (!this.schedule_id) {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `ds-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.schedule_id = `DS-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
  }
  
  // Calculate total
  this.total_scheduled_qty = this.items.reduce((sum, i) => sum + i.scheduled_qty, 0);
  next();
});

module.exports = mongoose.model('DeliverySchedule', deliveryScheduleSchema);