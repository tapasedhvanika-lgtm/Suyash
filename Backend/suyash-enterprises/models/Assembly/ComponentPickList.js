'use strict';
const mongoose = require('mongoose');

const pickListItemSchema = new mongoose.Schema({
  bom_line_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  component_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  component_part_no: { type: String, required: true, trim: true, uppercase: true },
  component_description: { type: String, required: true, trim: true },
  component_type: { type: String, enum: ['Raw Material', 'Sub-Assembly', 'Bought-Out', 'Consumable'], required: true },
  bom_qty_per: { type: Number, required: true, min: 0.0001 },
  required_qty: { type: Number, required: true, min: 0 },
  picked_qty: { type: Number, default: 0, min: 0 },
  shortage_qty: { type: Number, default: 0 },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  bin_id: { type: String, trim: true },
  batch_no: { type: String, trim: true },
  serial_no: { type: String, trim: true },
  unit_cost: { type: Number, default: 0 },
  total_cost: { type: Number, default: 0 },
  is_substitute: { type: Boolean, default: false },
  substitute_reason: { type: String, default: '' },
  original_part_no: { type: String, default: '' },
  pick_status: { type: String, enum: ['Pending', 'Picked', 'Short', 'Substituted'], default: 'Pending' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const componentPickListSchema = new mongoose.Schema({
  picklist_id: { type: String, unique: true, trim: true, uppercase: true },
  picklist_date: { type: Date, default: Date.now },
  wo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true, index: true },
  wo_number: { type: String, required: true },
  assembly_qty: { type: Number, required: true, min: 0.001 },
  status: { type: String, enum: ['Generated', 'Partially Picked', 'Fully Picked', 'Issued', 'Closed'], default: 'Generated' },
  items: [pickListItemSchema],
  picked_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  issued_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  picked_at: { type: Date },
  issued_at: { type: Date },
  total_cost: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

componentPickListSchema.pre('save', function(next) {
  let total = 0;
  this.items.forEach(item => {
    item.shortage_qty = Math.max(0, item.required_qty - item.picked_qty);
    item.total_cost = item.picked_qty * item.unit_cost;
    total += item.total_cost;
    
    if (item.picked_qty === 0) item.pick_status = 'Pending';
    else if (item.picked_qty < item.required_qty) item.pick_status = 'Short';
    else if (item.is_substitute) item.pick_status = 'Substituted';
    else item.pick_status = 'Picked';
  });
  this.total_cost = total;
  
  const allPicked = this.items.every(i => i.pick_status === 'Picked' || i.pick_status === 'Substituted');
  const anyPicked = this.items.some(i => i.picked_qty > 0);
  
  if (this.status === 'Generated') {
    if (allPicked) this.status = 'Fully Picked';
    else if (anyPicked) this.status = 'Partially Picked';
  }
  next();
});

componentPickListSchema.pre('save', async function(next) {
  if (this.picklist_id) return next();
  try {
    const d = new Date();
    const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const Counter = mongoose.model('SalesOrderIdCounter');
    const counter = await Counter.findOneAndUpdate(
      { _id: `cpl-${yyyymm}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.picklist_id = `CPL-${yyyymm}-${String(counter.seq).padStart(4, '0')}`;
    next();
  } catch (e) { next(e); }
});

componentPickListSchema.index({ wo_id: 1 });
componentPickListSchema.index({ status: 1 });

module.exports = mongoose.model('ComponentPickList', componentPickListSchema);