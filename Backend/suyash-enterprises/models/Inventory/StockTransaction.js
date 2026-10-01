// models/Inventory/StockTransaction.js
const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  // Primary Identifier (matches spec 7.3.1)
  txn_id: {
    type: String,
    unique: true,
    sparse: true,
    description: "Format: TXN-YYYYMMDD-XXXX. e.g. TXN-20250315-0234"
  },
  txn_date: {
    type: Date,
    required: true,
    default: Date.now,
    description: "Exact date and time of the transaction"
  },
  
  // Transaction Type (11 types from spec)
  txn_type: {
    type: String,
    required: true,
    enum: [
      'GRN Receipt',           // Increases RM stock
      'Material Issue',        // Decreases RM, increases WIP
      'Material Return',       // Increases RM, decreases WIP
      'Production Receipt',    // Decreases WIP, increases FG
      'Stock Transfer',        // Moves stock between locations
      'Scrap',                 // Decreases WIP or RM
      'Adjustment',            // Increases/decreases any WH
      'Opening Stock',         // System go-live one-time entry
      'Physical Count',        // Replaces balance from PSV
      'Subcontract Send',      // Decreases RM/WIP, increases Subcontract
      'Subcontract Receive'    // Decreases Subcontract, increases WIP/FG
    ],
    description: "Complete transaction type matrix covering all stock movements"
  },

  // Item Details
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true
  },
  part_no: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
    description: "Denormalized for fast queries"
  },

  // Location Details (Source and Destination)
  from_warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    description: "Source warehouse for issues, returns, transfers"
  },
  to_warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    description: "Destination warehouse for receipts, returns, transfers"
  },
  from_bin: {
    type: String,
    description: "Source bin location within from_warehouse"
  },
  to_bin: {
    type: String,
    description: "Destination bin location within to_warehouse"
  },

  // Quantity and Cost
  quantity: {
    type: Number,
    required: true,
    min: 0,
    description: "Quantity transacted. Always a positive number"
  },
  unit: {
    type: String,
    required: true,
    enum: ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll','Set'],
    description: "Unit of measure. Must match item's unit"
  },
  unit_cost: {
    type: Number,
    min: 0,
    description: "Cost per unit at time of this transaction"
  },
  total_value: {
    type: Number,
    min: 0,
    description: "quantity × unit_cost. Used for inventory valuation and GL auto-posting"
  },

  // Traceability Fields
  batch_no: {
    type: String,
    trim: true,
    index: true,
    description: "Batch/lot number carried from GRN for complete traceability"
  },
  heat_no: {
    type: String,
    trim: true,
    description: "Mill heat number for metals. For automotive/transformer customers"
  },

  // Reference Document (for audit trail)
  ref_document_type: {
    type: String,
    enum: ['GRN', 'WO', 'SO', 'DC', 'PR', 'Subcontract', 'PSV', 'MIV', 'MRV', 'Manual'],
    description: "Type of triggering document"
  },
  ref_document_id: {
    type: String,
    description: "Document number of the triggering document. e.g. GRN-202503-0088"
  },
  ref_id: {
    type: mongoose.Schema.Types.ObjectId,
    description: "ObjectId of the triggering document for database joins"
  },

  // Additional Details
  remarks: {
    type: String,
    maxlength: 500,
    description: "Transaction notes for audit trail"
  },

  // Status and Audit
  status: {
    type: String,
    enum: ['Pending', 'Posted', 'Cancelled', 'Reversed'],
    default: 'Posted',
    description: "Transaction status. Reversal transactions reference original"
  },
  reversal_of_txn_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction',
    description: "If this is a reversal, reference to original transaction"
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
    description: "User who created this transaction. Immutable after creation"
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: "User who posted to GL (if applicable)"
  },
  posted_at: {
    type: Date,
    description: "Timestamp when posted to GL"
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ======================================================
// INDEXES
// ======================================================

// Transaction lookup indexes
stockTransactionSchema.index({ txn_id: 1 }, { unique: true });
stockTransactionSchema.index({ txn_type: 1, txn_date: -1 });
stockTransactionSchema.index({ item_id: 1, txn_date: -1 });
stockTransactionSchema.index({ batch_no: 1, txn_date: -1 });
stockTransactionSchema.index({ ref_document_type: 1, ref_document_id: 1 });
stockTransactionSchema.index({ from_warehouse: 1, to_warehouse: 1 });
stockTransactionSchema.index({ created_at: -1 });

// Compound indexes for reporting
stockTransactionSchema.index({ txn_date: 1, txn_type: 1 });
stockTransactionSchema.index({ warehouse_id: 1, txn_date: -1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate txn_id before save
stockTransactionSchema.pre('save', async function(next) {
  if (!this.txn_id && this.isNew) {
    const date = new Date(this.txn_date || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // Get last transaction for the day
    const lastTxn = await this.constructor.findOne({
      txn_id: new RegExp(`^TXN-${datePrefix}`)
    }).sort({ txn_id: -1 });
    
    let sequence = 1;
    if (lastTxn && lastTxn.txn_id) {
      const lastSeq = parseInt(lastTxn.txn_id.split('-')[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.txn_id = `TXN-${datePrefix}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Auto-calculate total_value if not provided
  if (this.quantity && this.unit_cost && !this.total_value) {
    this.total_value = this.quantity * this.unit_cost;
  }
  
  next();
});

// Prevent modification of immutable fields
stockTransactionSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.created_by || update.txn_id || update.txn_date) {
    next(new Error('Cannot modify immutable fields: created_by, txn_id, txn_date'));
  }
  next();
});

// ======================================================
// VIRTUAL FIELDS
// ======================================================

// Direction of stock movement
stockTransactionSchema.virtual('movement_direction').get(function() {
  const inflowTypes = ['GRN Receipt', 'Production Receipt', 'Material Return', 'Opening Stock', 'Subcontract Receive'];
  const outflowTypes = ['Material Issue', 'Scrap', 'Subcontract Send', 'Adjustment'];
  
  if (inflowTypes.includes(this.txn_type)) return 'IN';
  if (outflowTypes.includes(this.txn_type)) return 'OUT';
  return 'TRANSFER';
});

// ======================================================
// STATIC METHODS
// ======================================================

/**
 * Get batch traceability chain
 * Complete genealogy from GRN through MIV to FG
 */
stockTransactionSchema.statics.getBatchTraceability = async function(batch_no) {
  const transactions = await this.find({ batch_no })
    .populate('item_id', 'part_no description')
    .populate('from_warehouse', 'warehouse_name warehouse_type')
    .populate('to_warehouse', 'warehouse_name warehouse_type')
    .sort({ txn_date: 1 });
  
  return transactions;
};

/**
 * Get stock movements for an item with summary
 */
stockTransactionSchema.statics.getItemMovements = async function(item_id, fromDate, toDate) {
  const matchFilter = { item_id: mongoose.Types.ObjectId(item_id) };
  if (fromDate) matchFilter.txn_date = { $gte: new Date(fromDate) };
  if (toDate) matchFilter.txn_date = { ...matchFilter.txn_date, $lte: new Date(toDate) };
  
  const movements = await this.aggregate([
    { $match: matchFilter },
    { $sort: { txn_date: -1 } },
    {
      $group: {
        _id: '$txn_type',
        total_quantity: { $sum: '$quantity' },
        total_value: { $sum: '$total_value' },
        transactions: { $push: '$$ROOT' }
      }
    }
  ]);
  
  return movements;
};

/**
 * Create reversal transaction for corrections
 */
stockTransactionSchema.statics.createReversal = async function(originalTxnId, reversalReason, userId) {
  const originalTxn = await this.findById(originalTxnId);
  if (!originalTxn) {
    throw new Error('Original transaction not found');
  }
  
  if (originalTxn.status === 'Reversed') {
    throw new Error('Transaction already reversed');
  }
  
  // Create reversal transaction
  const reversalTxn = new this({
    txn_type: originalTxn.txn_type === 'GRN Receipt' ? 'Adjustment' : 
              originalTxn.txn_type === 'Material Issue' ? 'Material Return' : 'Adjustment',
    txn_date: new Date(),
    item_id: originalTxn.item_id,
    part_no: originalTxn.part_no,
    from_warehouse: originalTxn.to_warehouse, // Reverse direction
    to_warehouse: originalTxn.from_warehouse,
    quantity: originalTxn.quantity,
    unit: originalTxn.unit,
    unit_cost: originalTxn.unit_cost,
    total_value: originalTxn.total_value,
    batch_no: originalTxn.batch_no,
    heat_no: originalTxn.heat_no,
    ref_document_type: 'Manual',
    ref_document_id: `REVERSAL-${originalTxn.txn_id}`,
    remarks: `Reversal of ${originalTxn.txn_id}: ${reversalReason}`,
    status: 'Posted',
    reversal_of_txn_id: originalTxn._id,
    created_by: userId
  });
  
  await reversalTxn.save();
  
  // Mark original as reversed
  originalTxn.status = 'Reversed';
  await originalTxn.save();
  
  return reversalTxn;
};

const StockTransaction = mongoose.models.StockTransaction || mongoose.model('StockTransaction', stockTransactionSchema);
module.exports = StockTransaction;