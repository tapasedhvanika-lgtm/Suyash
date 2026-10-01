// models/Inventory/PhysicalStockVerification.js
const mongoose = require('mongoose');

const psvItemSchema = new mongoose.Schema({
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
    type: String
  },
  bin_id: {
    type: String
  },
  batch_no: {
    type: String
  },
  
  // System values (frozen at initiation)
  system_qty: {
    type: Number,
    required: true,
    min: 0
  },
  system_value: {
    type: Number,
    min: 0
  },
  unit_cost: {
    type: Number,
    min: 0
  },
  
  // Physical count values
  counted_qty: {
    type: Number,
    min: 0
  },
  second_count_qty: {
    type: Number,
    min: 0
  },
  third_count_qty: {
    type: Number,
    min: 0
  },
  final_qty: {
    type: Number,
    min: 0
  },
  
  // Variance
  variance: {
    type: Number,
    default: 0
  },
  variance_value: {
    type: Number,
    default: 0
  },
  variance_pct: {
    type: Number,
    default: 0
  },
  
  // Resolution
  variance_reason: {
    type: String,
    maxlength: 500,
    description: "Root cause of variance"
  },
  action: {
    type: String,
    enum: ['Adjust Up', 'Adjust Down', 'No Action', 'Write Off', 'Investigate Further'],
    default: 'No Action'
  },
  action_approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bin_location_confirmed: {
    type: Boolean,
    default: false
  },
  
  // Audit
  counted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  second_count_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  counted_at: {
    type: Date
  },
  second_counted_at: {
    type: Date
  }
});

const physicalStockVerificationSchema = new mongoose.Schema({
  // Primary Identifier
  verification_id: {
    type: String,
    unique: true,
    description: "Format: PSV-YYYYMM-XXXX. e.g. PSV-202503-0004"
  },
  verification_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Warehouse being verified
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
    index: true
  },
  warehouse_name: {
    type: String,
    required: true
  },
  
  // Verification type
  verification_type: {
    type: String,
    required: true,
    enum: ['Full Count', 'Cycle Count', 'Spot Check', 'Pre-Audit Count'],
    description: "Type of verification being performed"
  },
  
  // Freeze timestamp
  freeze_datetime: {
    type: Date,
    required: true,
    description: "Timestamp when system stock snapshot was frozen"
  },
  
  // Items being verified
  items: [psvItemSchema],
  
  // Statistics
  total_items_counted: {
    type: Number,
    default: 0
  },
  total_variance_value: {
    type: Number,
    default: 0,
    description: "Total absolute Rs value of all positive and negative variances"
  },
  net_variance_value: {
    type: Number,
    default: 0,
    description: "Net Rs variance (positive variances minus negative variances)"
  },
  items_with_variance: {
    type: Number,
    default: 0
  },
  
  // Personnel
  conducted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    description: "Primary store team member conducting the count"
  },
  second_count_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    description: "Person doing second count for high-variance items"
  },
  witness: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    description: "Independent witness present during counting"
  },
  
  // Approval
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: "Finance Manager or MD who approves adjustments"
  },
  approved_at: {
    type: Date
  },
  approval_remarks: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['Initiated', 'In Progress', 'Count Completed', 'Under Review', 'Adjusted', 'Approved', 'Closed'],
    default: 'Initiated',
    index: true
  },
  
  // Variance thresholds (configurable)
  variance_threshold_percent: {
    type: Number,
    default: 5,
    description: "Percentage threshold for second count flag"
  },
  variance_threshold_amount: {
    type: Number,
    default: 1000,
    description: "Amount threshold for second count flag (Rs)"
  },
  
  // Adjustment tracking
  adjustment_txn_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction',
    description: "Stock Transaction records created after approval"
  }],
  
  // Additional
  remarks: {
    type: String,
    maxlength: 1000
  },
  
  // Audit
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ======================================================
// INDEXES
// ======================================================

physicalStockVerificationSchema.index({ verification_id: 1 }, { unique: true });
physicalStockVerificationSchema.index({ warehouse_id: 1, status: 1 });
physicalStockVerificationSchema.index({ verification_date: -1 });
physicalStockVerificationSchema.index({ verification_type: 1, status: 1 });
physicalStockVerificationSchema.index({ 'items.item_id': 1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate verification_id
physicalStockVerificationSchema.pre('save', async function(next) {
  if (!this.verification_id && this.isNew) {
    const date = new Date(this.verification_date || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `PSV-${year}${month}`;
    
    const lastPSV = await this.constructor.findOne({
      verification_id: new RegExp(`^${prefix}`)
    }).sort({ verification_id: -1 });
    
    let sequence = 1;
    if (lastPSV && lastPSV.verification_id) {
      const lastSeq = parseInt(lastPSV.verification_id.split('-')[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.verification_id = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
  
  next();
});

// ======================================================
// STATIC METHODS
// ======================================================

/**
 * Initialize a new physical verification
 */
physicalStockVerificationSchema.statics.initiateVerification = async function(data, userId) {
  const StockLedger = mongoose.model('StockLedger');
  const warehouse = await mongoose.model('Warehouse').findById(data.warehouse_id);
  
  if (!warehouse) {
    throw new Error('Warehouse not found');
  }
  
  // Freeze current stock snapshot
  const freezeDateTime = new Date();
  const stockRecords = await StockLedger.find({
    warehouse_id: data.warehouse_id,
    quantity: { $gt: 0 }
  }).populate('item_id', 'description');
  
  // Create PSV items from stock records
  const items = stockRecords.map(record => ({
    item_id: record.item_id._id,
    part_no: record.part_no,
    item_description: record.item_id.description,
    bin_id: record.bin_id,
    batch_no: record.batch_no,
    system_qty: record.quantity,
    system_value: record.total_value,
    unit_cost: record.unit_cost,
    variance: 0,
    variance_value: 0,
    variance_pct: 0
  }));
  
  const psv = new this({
    verification_date: data.verification_date || new Date(),
    warehouse_id: data.warehouse_id,
    warehouse_name: warehouse.warehouse_name,
    verification_type: data.verification_type,
    freeze_datetime: freezeDateTime,
    items: items,
    conducted_by: data.conducted_by,
    witness: data.witness,
    variance_threshold_percent: data.variance_threshold_percent || 5,
    variance_threshold_amount: data.variance_threshold_amount || 1000,
    remarks: data.remarks,
    created_by: userId,
    status: 'Initiated'
  });
  
  await psv.save();
  
  return psv;
};

/**
 * Update counted quantities
 */
physicalStockVerificationSchema.statics.updateCount = async function(psvId, counts, userId) {
  const psv = await this.findById(psvId);
  if (!psv) throw new Error('PSV not found');
  if (psv.status !== 'Initiated' && psv.status !== 'In Progress') {
    throw new Error(`Cannot update count. PSV is in status: ${psv.status}`);
  }
  
  for (const count of counts) {
    // Try to find item by _id first (using the sub-document ID)
    let item = null;
    
    // If count has _id field
    if (count._id) {
      item = psv.items.id(count._id);
    }
    
    // If not found and count has item_id (the sub-document ID)
    if (!item && count.item_id) {
      item = psv.items.id(count.item_id);
    }
    
    // If still not found and count has item_id (but it's actually the Item master ID)
    // Then search by the referenced item_id field
    if (!item && count.item_id) {
      item = psv.items.find(i => i.item_id.toString() === count.item_id.toString());
    }
    
    if (!item) {
      console.warn(`Item not found. Available items:`, psv.items.map(i => ({ 
        _id: i._id, 
        item_id: i.item_id 
      })));
      continue;
    }
    
    if (count.is_second_count) {
      item.second_count_qty = count.counted_qty;
      item.second_count_by = userId;
      item.second_counted_at = new Date();
    } else {
      item.counted_qty = count.counted_qty;
      item.counted_by = userId;
      item.counted_at = new Date();
    }
    
    // Determine final quantity
    if (item.second_count_qty !== undefined && item.second_count_qty !== null) {
      if (item.counted_qty === item.second_count_qty) {
        item.final_qty = item.counted_qty;
      } else {
        // Flag for third count
        item.final_qty = null;
      }
    } else {
      item.final_qty = item.counted_qty;
    }
    
    // Calculate variance if final_qty is set
    if (item.final_qty !== null && item.final_qty !== undefined) {
      item.variance = item.final_qty - item.system_qty;
      item.variance_value = item.variance * item.unit_cost;
      item.variance_pct = item.system_qty > 0 ? (item.variance / item.system_qty) * 100 : 0;
    }
  }
  
  psv.status = 'In Progress';
  psv.total_items_counted = psv.items.filter(i => i.counted_qty !== undefined && i.counted_qty !== null).length;
  
  await psv.save();
  
  return psv;
};

/**
 * Complete counting and calculate variances
 */
physicalStockVerificationSchema.statics.completeCounting = async function(psvId, userId) {
  const psv = await this.findById(psvId);
  if (!psv) throw new Error('PSV not found');
  
  // Ensure all items have final quantities
  for (const item of psv.items) {
    // If final_qty is null, that means first and second counts didn't match
    if (item.final_qty === null || item.final_qty === undefined) {
      throw new Error(`Item ${item.part_no} requires third count due to discrepancy between first count (${item.counted_qty}) and second count (${item.second_count_qty})`);
    }
    
    // Calculate final variance
    item.variance = item.final_qty - item.system_qty;
    item.variance_value = item.variance * item.unit_cost;
    item.variance_pct = item.system_qty > 0 ? (item.variance / item.system_qty) * 100 : 0;
  }
  
  // Calculate totals
  psv.total_variance_value = psv.items.reduce((sum, i) => sum + Math.abs(i.variance_value), 0);
  psv.net_variance_value = psv.items.reduce((sum, i) => sum + i.variance_value, 0);
  psv.items_with_variance = psv.items.filter(i => i.variance !== 0).length;
  psv.status = 'Count Completed';
  psv.completed_at = new Date();
  
  await psv.save();
  
  return psv;
};

/**
 * Approve and post adjustments
 */
physicalStockVerificationSchema.statics.approveAndAdjust = async function(psvId, approvalData, userId) {
  const psv = await this.findById(psvId);
  if (!psv) throw new Error('PSV not found');
  if (psv.status !== 'Under Review' && psv.status !== 'Count Completed') {
    throw new Error(`Cannot approve. PSV is in status: ${psv.status}`);
  }
  
  const StockLedger = mongoose.model('StockLedger');
  const StockTransaction = mongoose.model('StockTransaction');
  const adjustmentTxns = [];
  
  // Process each item with variance
  for (const item of psv.items) {
    if (item.variance === 0) continue;
    
    // Determine action based on approval
    const action = approvalData.items?.find(i => i.item_id === item.item_id.toString())?.action || item.action;
    
    if (action === 'Adjust Up' || action === 'Adjust Down') {
      // Update stock ledger
      let stockRecord = await StockLedger.findOne({
        item_id: item.item_id,
        warehouse_id: psv.warehouse_id,
        bin_id: item.bin_id,
        batch_no: item.batch_no
      });
      
      if (stockRecord) {
        const oldQty = stockRecord.quantity;
        stockRecord.quantity = item.final_qty;
        stockRecord.total_value = stockRecord.quantity * stockRecord.unit_cost;
        await stockRecord.save();
        
        // Create adjustment transaction
        const txn = new StockTransaction({
          txn_type: 'Physical Count',
          txn_date: new Date(),
          item_id: item.item_id,
          part_no: item.part_no,
          from_warehouse: item.variance < 0 ? psv.warehouse_id : null,
          to_warehouse: item.variance > 0 ? psv.warehouse_id : null,
          quantity: Math.abs(item.variance),
          unit: item.unit_cost ? 'Kg' : 'Nos', // Need to get from item
          unit_cost: item.unit_cost,
          total_value: Math.abs(item.variance_value),
          batch_no: item.batch_no,
          ref_document_type: 'PSV',
          ref_document_id: psv.verification_id,
          ref_id: psv._id,
          remarks: `Physical verification adjustment. Variance reason: ${item.variance_reason}`,
          created_by: userId
        });
        
        await txn.save();
        adjustmentTxns.push(txn._id);
      }
    }
    
    // Update item action
    item.action = action;
    item.action_approved_by = userId;
  }
  
  psv.adjustment_txn_ids = adjustmentTxns;
  psv.approved_by = approvalData.approved_by || userId;
  psv.approved_at = new Date();
  psv.approval_remarks = approvalData.remarks;
  psv.status = 'Approved';
  
  await psv.save();
  
  return psv;
};

/**
 * Close PSV after all adjustments are verified
 */
physicalStockVerificationSchema.statics.closeVerification = async function(psvId, userId) {
  const psv = await this.findById(psvId);
  if (!psv) throw new Error('PSV not found');
  if (psv.status !== 'Approved') {
    throw new Error(`Cannot close. PSV must be approved first. Current status: ${psv.status}`);
  }
  
  psv.status = 'Closed';
  await psv.save();
  
  return psv;
};

// ======================================================
// VIRTUAL FIELDS
// ======================================================

physicalStockVerificationSchema.virtual('completion_percentage').get(function() {
  if (!this.total_items_counted) return 0;
  return (this.total_items_counted / this.items.length) * 100;
});

physicalStockVerificationSchema.virtual('requires_management_approval').get(function() {
  // Items with variance above threshold need management approval
  const highVarianceItems = this.items.filter(i => 
    Math.abs(i.variance_value) > 5000 || Math.abs(i.variance_pct) > 10
  );
  return highVarianceItems.length > 0;
});

const PhysicalStockVerification = mongoose.models.PhysicalStockVerification || mongoose.model('PhysicalStockVerification', physicalStockVerificationSchema);
module.exports = PhysicalStockVerification;