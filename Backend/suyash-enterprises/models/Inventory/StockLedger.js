const mongoose = require('mongoose');

/**
 * Stock Ledger Schema
 * One record per unique combination of: item + warehouse + bin + batch
 * Tracks real-time inventory balance with valuation
 */
const stockLedgerSchema = new mongoose.Schema({
  // Primary Identifier
  stock_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: "Format: STK-XXXXXX. e.g. STK-004821"
  },

  // Item Reference
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true,
    description: "Item reference from Item Master"
  },
  
  part_no: {
    type: String,
    required: true,
    index: true,
    description: "Denormalized part number for fast queries without join"
  },

  // Location
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
    index: true,
    description: "Warehouse reference"
  },
  
  bin_id: {
    type: String,
    index: true,
    description: "Bin location within warehouse. e.g. A-3-07"
  },

  // Batch Tracking (for FIFO)
  batch_no: {
    type: String,
    index: true,
    description: "Vendor batch / lot number from GRN. Enables FIFO costing and batch traceability"
  },
  
  receipt_date: {
    type: Date,
    default: Date.now,
    description: "Date when this batch was received (for FIFO sorting)"
  },

  // Quantity Management
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    description: "Current physical stock quantity"
  },
  
  reserved_qty: {
    type: Number,
    min: 0,
    default: 0,
    description: "Quantity reserved for confirmed Work Orders or Sales Orders"
  },

  // Unit
  unit: {
    type: String,
    required: true,
    enum: ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll'],
    description: "Unit of measure. Must match Item Master unit"
  },

  // Valuation
  valuation_method: {
    type: String,
    enum: ['FIFO', 'Weighted Average'],
    required: true,
    description: "Set per item in Item Master. Determines how unit_cost changes on each new receipt"
  },
  
  unit_cost: {
    type: Number,
    min: 0,
    required: true,
    description: "Current cost per unit. FIFO: cost of specific batch. Weighted Average: total_value/quantity"
  },
  
  total_value: {
    type: Number,
    min: 0,
    required: true,
    description: "Computed: quantity × unit_cost. Feeds inventory line on Balance Sheet"
  },

  // Add to StockLedger schema if missing
min_stock: {
  type: Number,
  default: 0
},
max_stock: {
  type: Number,
  default: null
},
reorder_level: {
  type: Number,
  default: 0
},
reorder_qty: {
  type: Number,
  default: 0
},
safety_stock: {
  type: Number,
  default: 0
},
lead_time_days: {
  type: Number,
  default: 0
}, 
  is_below_reorder: {
    type: Boolean,
    default: false,
    description: "Auto-set to true when quantity falls below min_stock"
  },
  
  reorder_alert_sent_at: {
    type: Date,
    default: null,
    description: "Track when reorder alert was last sent"
  },

  // Audit Trail
  last_updated: {
    type: Date,
    default: Date.now,
    description: "Timestamp of the last stock transaction affecting this record"
  },
  
  last_txn_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction',
    description: "Reference to the last StockTransaction that changed this record"
  },
  
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: "User who last updated this record"
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ======================================================
// VIRTUAL FIELDS
// ======================================================

/**
 * Available Quantity (Virtual)
 * quantity - reserved_qty = available for new allocations
 */
stockLedgerSchema.virtual('available_qty').get(function() {
  return this.quantity - (this.reserved_qty || 0);
});

/**
 * Overstock Status (Virtual)
 * Check if quantity exceeds max_stock
 */
stockLedgerSchema.virtual('is_overstock').get(function() {
  if (!this.max_stock) return false;
  return this.quantity > this.max_stock;
});

/**
 * Utilization Percentage (Virtual)
 * For bins with capacity
 */
stockLedgerSchema.virtual('utilization_percentage').get(function() {
  if (!this.max_stock) return null;
  return ((this.quantity / this.max_stock) * 100).toFixed(2);
});

// ======================================================
// INDEXES
// ======================================================

// Compound unique index: One record per item + warehouse + bin + batch
stockLedgerSchema.index(
  { item_id: 1, warehouse_id: 1, bin_id: 1, batch_no: 1 }, 
  { unique: true, name: 'unique_stock_location' }
);

// Index for inventory valuation by warehouse
stockLedgerSchema.index({ warehouse_id: 1, item_id: 1 });

// Index for reorder alerts
stockLedgerSchema.index({ is_below_reorder: 1, quantity: 1 });

// Index for FIFO batch picking (oldest batch first)
stockLedgerSchema.index({ valuation_method: 1, receipt_date: 1, quantity: 1 });

// Index for stock aging queries
stockLedgerSchema.index({ last_updated: 1, quantity: 1 });

// Text index for part_no search
stockLedgerSchema.index({ part_no: 'text' });

// Index for overstock monitoring
stockLedgerSchema.index({ max_stock: 1, quantity: 1 });

// ======================================================
// MIDDLEWARE
// ======================================================

/**
 * Pre-save middleware to auto-compute total_value
 * and check reorder level
 */
stockLedgerSchema.pre('save', function(next) {
  // Auto-compute total_value
  if (this.quantity !== undefined && this.unit_cost !== undefined) {
    this.total_value = this.quantity * this.unit_cost;
  }
  
  // Auto-update last_updated timestamp
  this.last_updated = new Date();
  
  // Check reorder level
  if (this.quantity < this.min_stock) {
    this.is_below_reorder = true;
  } else {
    this.is_below_reorder = false;
  }
  
  next();
});

stockLedgerSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  if (update.quantity !== undefined || update.unit_cost !== undefined) {
    // Get current document to calculate new total_value
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      const newQuantity = update.quantity !== undefined ? update.quantity : doc.quantity;
      const newUnitCost = update.unit_cost !== undefined ? update.unit_cost : doc.unit_cost;
      update.total_value = newQuantity * newUnitCost;
      
      // Check reorder level
      if (newQuantity < (update.min_stock || doc.min_stock)) {
        update.is_below_reorder = true;
      } else {
        update.is_below_reorder = false;
      }
    }
  }
  
  update.last_updated = new Date();
  next();
});



stockLedgerSchema.statics.getItemStockAcrossWarehouses = async function(item_id) {
  return await this.aggregate([
    { $match: { item_id: mongoose.Types.ObjectId(item_id), quantity: { $gt: 0 } } },
    { $group: {
      _id: '$warehouse_id',
      total_quantity: { $sum: '$quantity' },
      total_reserved: { $sum: '$reserved_qty' },
      total_value: { $sum: '$total_value' },
      batches: { $push: {
        batch_no: '$batch_no',
        quantity: '$quantity',
        unit_cost: '$unit_cost',
        warehouse_id: '$warehouse_id',
        bin_id: '$bin_id'
      }}
    }},
    { $lookup: {
      from: 'warehouses',
      localField: '_id',
      foreignField: '_id',
      as: 'warehouse_details'
    }},
    { $unwind: { path: '$warehouse_details', preserveNullAndEmptyArrays: true } }
  ]);
};


stockLedgerSchema.statics.generateStockId = async function() {
  const lastStock = await this.findOne({}, { stock_id: 1 })
    .sort({ createdAt: -1 })
    .limit(1);
  
  let nextNumber = 1;
  if (lastStock && lastStock.stock_id) {
    const lastNumber = parseInt(lastStock.stock_id.split('-')[1]);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return `STK-${String(nextNumber).padStart(6, '0')}`;
};

stockLedgerSchema.statics.updateWeightedAverageCost = async function(
  item_id, 
  warehouse_id, 
  bin_id, 
  newQty, 
  newUnitCost
) {
  const stockRecord = await this.findOne({
    item_id,
    warehouse_id,
    bin_id,
    valuation_method: 'Weighted Average'
  });
  
  if (stockRecord) {
    const oldQty = stockRecord.quantity;
    const oldCost = stockRecord.unit_cost;
    const oldValue = oldQty * oldCost;
    const newValue = newQty * newUnitCost;
    const totalQty = oldQty + newQty;
    const newAvgCost = (oldValue + newValue) / totalQty;
    
    stockRecord.quantity = totalQty;
    stockRecord.unit_cost = newAvgCost;
    stockRecord.total_value = totalQty * newAvgCost;
    
    await stockRecord.save();
    return stockRecord;
  }
  
  return null;
};


stockLedgerSchema.statics.getFIFOBatches = async function(
  item_id, 
  warehouse_id, 
  requiredQty
) {
  const batches = await this.find({
    item_id,
    warehouse_id,
    valuation_method: 'FIFO',
    quantity: { $gt: 0 }
  }).sort({ receipt_date: 1 });
  
  const batchesToIssue = [];
  let remainingQty = requiredQty;
  
  for (const batch of batches) {
    if (remainingQty <= 0) break;
    
    const issueQty = Math.min(batch.quantity, remainingQty);
    batchesToIssue.push({
      stock_id: batch.stock_id,
      batch_no: batch.batch_no,
      quantity: issueQty,
      unit_cost: batch.unit_cost,
      total_cost: issueQty * batch.unit_cost
    });
    
    remainingQty -= issueQty;
  }
  
  if (remainingQty > 0) {
    throw new Error(`Insufficient stock: Need ${requiredQty}, only ${requiredQty - remainingQty} available`);
  }
  
  return batchesToIssue;
};


stockLedgerSchema.statics.checkReorderAlerts = async function() {
  const belowReorderStocks = await this.find({
    is_below_reorder: false,
    quantity: { $lt: '$min_stock' }
  }).populate('item_id');
  
  const alerts = [];
  
  for (const stock of belowReorderStocks) {
    stock.is_below_reorder = true;
    stock.reorder_alert_sent_at = new Date();
    await stock.save();
    
    alerts.push({
      item_id: stock.item_id._id,
      part_no: stock.part_no,
      current_quantity: stock.quantity,
      reorder_level: stock.min_stock,
      warehouse_id: stock.warehouse_id,
      bin_id: stock.bin_id
    });
  }
  
  return alerts;
};


// Check if model already exists to prevent OverwriteModelError
const StockLedger = mongoose.models.StockLedger || mongoose.model('StockLedger', stockLedgerSchema);

module.exports = StockLedger;