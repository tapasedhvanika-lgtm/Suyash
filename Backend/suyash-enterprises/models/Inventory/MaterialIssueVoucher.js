const mongoose = require('mongoose');

const mivItemSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  part_no: {
    type: String,
    required: true,
    uppercase: true
  },
  item_description: {
    type: String,
    required: true
  },
  bom_required_qty: {
    type: Number,
    min: 0,
    description: "Quantity specified in the BOM for this WO's planned_qty"
  },
  issued_qty: {
    type: Number,
    required: true,
    min: 0,
    description: "Actual quantity issued"
  },
  unit: {
    type: String,
    required: true,
    enum: ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll']
  },
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  bin_id: {
    type: String,
    description: "Specific bin location picked from"
  },
  batch_no: {
    type: String,
    description: "Batch number of material issued"
  },
  heat_no: {
    type: String,
    description: "Mill heat number for metals"
  },
  unit_cost: {
    type: Number,
    required: true,
    min: 0
  },
  total_cost: {
    type: Number,
    required: true,
    min: 0
  },
  returned_qty: {
    type: Number,
    default: 0,
    min: 0
  },
  net_consumed_qty: {
    type: Number,
    default: 0
  },
  // FIFO batch tracking (not stored in DB, used for processing)
  _fifoBatches: {
    type: Array,
    default: undefined,
    select: false
  }
});

const materialIssueVoucherSchema = new mongoose.Schema({
  // Primary Identifier
  miv_number: {
    type: String,
    unique: true,
    description: "Format: MIV-YYYYMM-XXXX. e.g. MIV-202503-0055"
  },
  miv_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Work Order Reference
  wo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true,
    index: true
  },
  wo_number: {
    type: String,
    required: true,
    description: "Denormalized WO number for physical document printing"
  },
  so_number: {
    type: String,
    description: "Denormalized SO number for end-to-end traceability"
  },
  customer_name: {
    type: String,
    description: "Denormalized customer name for job card"
  },
  
  // Department (Linked to Department model)
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    description: "Receiving department reference"
  },
  department_name: {
    type: String,
    description: "Denormalized department name for quick display"
  },
  
  // Personnel
  issued_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    description: "Store person who physically picked and handed over material"
  },
  received_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    description: "Production supervisor or operator who received material"
  },
  authorised_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: "Manager who pre-authorised the issue (for high-value materials)"
  },
  
  // Items
  items: [mivItemSchema],
  
  // Totals
  total_issue_cost: {
    type: Number,
    required: true,
    default: 0,
    description: "Sum of all item total_cost"
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Partially Returned', 'Fully Returned', 'Closed', 'Cancelled'],
    default: 'Draft',
    index: true
  },
  
  // Additional
  remarks: {
    type: String,
    maxlength: 500
  },
  
  // Audit
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  posted_at: {
    type: Date,
    description: "When MIV was posted (stock updated)"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ======================================================
// INDEXES
// ======================================================

materialIssueVoucherSchema.index({ miv_number: 1 }, { unique: true });
materialIssueVoucherSchema.index({ wo_id: 1, status: 1 });
materialIssueVoucherSchema.index({ miv_date: -1 });
materialIssueVoucherSchema.index({ issued_by: 1 });
materialIssueVoucherSchema.index({ 'items.batch_no': 1 });
materialIssueVoucherSchema.index({ department: 1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate MIV number
materialIssueVoucherSchema.pre('save', async function(next) {
  if (!this.miv_number && this.isNew) {
    const date = new Date(this.miv_date || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `MIV-${year}${month}`;
    
    const lastMIV = await this.constructor.findOne({
      miv_number: new RegExp(`^${prefix}`)
    }).sort({ miv_number: -1 });
    
    let sequence = 1;
    if (lastMIV && lastMIV.miv_number) {
      const lastSeq = parseInt(lastMIV.miv_number.split('-')[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.miv_number = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Calculate net consumed quantity for each item
  this.items.forEach(item => {
    item.net_consumed_qty = item.issued_qty - (item.returned_qty || 0);
  });
  
  // Calculate total issue cost
  this.total_issue_cost = this.items.reduce((sum, item) => sum + item.total_cost, 0);
  
  next();
});

// ======================================================
// VIRTUAL FIELDS
// ======================================================

materialIssueVoucherSchema.virtual('department_info', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// ======================================================
// STATIC METHODS
// ======================================================

/**
 * Post MIV - Update stock and create transactions
 */
materialIssueVoucherSchema.statics.postMIV = async function(mivId, userId) {
  const miv = await this.findById(mivId);
  if (!miv) throw new Error('MIV not found');
  if (miv.status !== 'Draft') throw new Error(`MIV is already ${miv.status}`);
  
  const StockLedger = mongoose.model('StockLedger');
  const StockTransaction = mongoose.model('StockTransaction');
  const StockReservation = mongoose.model('StockReservation');
  
  const transactions = [];
  
  for (const item of miv.items) {
    // Check available stock (including reservations)
    const stockRecord = await StockLedger.findOne({
      item_id: item.item_id,
      warehouse_id: item.warehouse_id,
      bin_id: item.bin_id,
      ...(item.batch_no && { batch_no: item.batch_no })
    });
    
    if (!stockRecord) {
      throw new Error(`No stock record found for item ${item.part_no}`);
    }
    
    const availableQty = stockRecord.quantity - (stockRecord.reserved_qty || 0);
    if (availableQty < item.issued_qty) {
      throw new Error(`Insufficient stock for item ${item.part_no}. Required: ${item.issued_qty}, Available: ${availableQty}`);
    }
    
    // Update stock ledger
    stockRecord.quantity -= item.issued_qty;
    stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
    await stockRecord.save();
    
    // Create stock transaction
    const transaction = new StockTransaction({
      txn_type: 'Material Issue',
      txn_date: miv.miv_date,
      item_id: item.item_id,
      part_no: item.part_no,
      from_warehouse: item.warehouse_id,
      from_bin: item.bin_id,
      to_warehouse: null,
      quantity: item.issued_qty,
      unit: item.unit,
      unit_cost: item.unit_cost,
      total_value: item.total_cost,
      batch_no: item.batch_no,
      heat_no: item.heat_no,
      ref_document_type: 'MIV',
      ref_document_id: miv.miv_number,
      ref_id: miv._id,
      remarks: `Material issued against WO ${miv.wo_number}`,
      created_by: userId
    });
    
    await transaction.save();
    transactions.push(transaction);
    
    // Consume reservation if exists
    if (miv.wo_id) {
      const reservation = await StockReservation.findOne({
        ref_type: 'Work Order',
        ref_id: miv.wo_id,
        item_id: item.item_id,
        status: 'Active'
      });
      
      if (reservation) {
        await StockReservation.consumeReservation(reservation._id, item.issued_qty, userId);
      }
    }
  }
  
  // Update MIV status
  miv.status = 'Issued';
  miv.posted_at = new Date();
  miv.updated_by = userId;
  await miv.save();
  
  return { miv, transactions };
};

/**
 * Create reversal/return
 */
materialIssueVoucherSchema.statics.createReturn = async function(mivId, returnItems, userId) {
  const miv = await this.findById(mivId);
  if (!miv) throw new Error('MIV not found');
  
  const StockLedger = mongoose.model('StockLedger');
  const StockTransaction = mongoose.model('StockTransaction');
  
  const returnTransactions = [];
  
  for (const returnItem of returnItems) {
    const mivItem = miv.items.find(i => i.item_id.toString() === returnItem.item_id);
    if (!mivItem) throw new Error(`Item not found in original MIV`);
    
    if (returnItem.returned_qty > mivItem.issued_qty - mivItem.returned_qty) {
      throw new Error(`Cannot return more than issued. Issued: ${mivItem.issued_qty}, Already returned: ${mivItem.returned_qty}, Returning: ${returnItem.returned_qty}`);
    }
    
    // Update stock ledger
    const stockRecord = await StockLedger.findOne({
      item_id: mivItem.item_id,
      warehouse_id: returnItem.warehouse_id || mivItem.warehouse_id,
      batch_no: mivItem.batch_no
    });
    
    if (stockRecord) {
      stockRecord.quantity += returnItem.returned_qty;
      stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
      await stockRecord.save();
    }
    
    // Create return transaction
    const transaction = new StockTransaction({
      txn_type: 'Material Return',
      txn_date: new Date(),
      item_id: mivItem.item_id,
      part_no: mivItem.part_no,
      from_warehouse: null,
      to_warehouse: returnItem.warehouse_id || mivItem.warehouse_id,
      to_bin: returnItem.bin_id,
      quantity: returnItem.returned_qty,
      unit: mivItem.unit,
      unit_cost: mivItem.unit_cost,
      total_value: returnItem.returned_qty * mivItem.unit_cost,
      batch_no: mivItem.batch_no,
      heat_no: mivItem.heat_no,
      ref_document_type: 'MRV',
      ref_document_id: `MRV-${miv.miv_number}`,
      remarks: `Return of unused material from MIV ${miv.miv_number}`,
      created_by: userId
    });
    
    await transaction.save();
    returnTransactions.push(transaction);
    
    // Update MIV item
    mivItem.returned_qty = (mivItem.returned_qty || 0) + returnItem.returned_qty;
    mivItem.net_consumed_qty = mivItem.issued_qty - mivItem.returned_qty;
  }
  
  // Update MIV status
  const allReturned = miv.items.every(i => i.returned_qty === i.issued_qty);
  const someReturned = miv.items.some(i => i.returned_qty > 0);
  
  if (allReturned) {
    miv.status = 'Fully Returned';
  } else if (someReturned) {
    miv.status = 'Partially Returned';
  }
  
  miv.updated_by = userId;
  await miv.save();
  
  return { miv, returnTransactions };
};

const MaterialIssueVoucher = mongoose.models.MaterialIssueVoucher || mongoose.model('MaterialIssueVoucher', materialIssueVoucherSchema);
module.exports = MaterialIssueVoucher;