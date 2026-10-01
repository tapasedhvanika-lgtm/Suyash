// models/Inventory/
const mongoose = require('mongoose');

const mrvItemSchema = new mongoose.Schema({
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
  returned_qty: {
    type: Number,
    required: true,
    min: 0
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
    type: String
  },
  batch_no: {
    type: String
  },
  unit_cost: {
    type: Number,
    required: true,
    min: 0
  },
  total_value: {
    type: Number,
    required: true,
    min: 0
  }
});

const materialReturnVoucherSchema = new mongoose.Schema({
  // Primary Identifier
  mrv_number: {
    type: String,
    unique: true,
    description: "Format: MRV-YYYYMM-XXXX"
  },
  mrv_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Reference to original MIV
  miv_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialIssueVoucher',
    required: true,
    index: true
  },
  miv_number: {
    type: String,
    required: true,
    description: "Denormalized MIV number"
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
    required: true
  },
    deleted_at: {
    type: Date
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deleted_reason: {
    type: String
  },
  deleted_original_status: {
    type: String,
    enum: ['Draft', 'Posted', 'Returned']
  },
  restored_at: {
    type: Date
  },
  restored_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  
  // Personnel
  returned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    description: "Production person returning the material"
  },
  received_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    description: "Store person accepting the return"
  },
  
  // Items
  items: [mrvItemSchema],
  
  // Totals
  total_return_value: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Condition of returned material
  condition: {
    type: String,
    enum: ['Good', 'Partially Damaged', 'Scrap'],
    default: 'Good',
    description: "Good (usable) | Partially Damaged (to Quarantine) | Scrap (to WH-SCRAP)"
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Returned', 'Posted', 'Cancelled','Deleted'],
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
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  posted_at: {
    type: Date
  }
}, {
  timestamps: true
});

// ======================================================
// INDEXES
// ======================================================

materialReturnVoucherSchema.index({ mrv_number: 1 }, { unique: true });
materialReturnVoucherSchema.index({ miv_id: 1, status: 1 });
materialReturnVoucherSchema.index({ wo_id: 1 });
materialReturnVoucherSchema.index({ mrv_date: -1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate MRV number
materialReturnVoucherSchema.pre('save', async function(next) {
  if (!this.mrv_number && this.isNew) {
    const date = new Date(this.mrv_date || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `MRV-${year}${month}`;
    
    const lastMRV = await this.constructor.findOne({
      mrv_number: new RegExp(`^${prefix}`)
    }).sort({ mrv_number: -1 });
    
    let sequence = 1;
    if (lastMRV && lastMRV.mrv_number) {
      const lastSeq = parseInt(lastMRV.mrv_number.split('-')[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.mrv_number = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Calculate total return value
  this.total_return_value = this.items.reduce((sum, item) => sum + item.total_value, 0);
  
  next();
});

// ======================================================
// STATIC METHODS
// ======================================================


/**
 * Post MRV - Update stock and create transactions
 */
materialReturnVoucherSchema.statics.postMRV = async function(mrvId, userId) {
  const mrv = await this.findById(mrvId)
    .populate('miv_id', 'items wo_number');
  
  if (!mrv) throw new Error('MRV not found');
  if (mrv.status !== 'Draft') throw new Error(`MRV is already ${mrv.status}`);
  
  const StockLedger = mongoose.model('StockLedger');
  const StockTransaction = mongoose.model('StockTransaction');
  const MaterialIssueVoucher = mongoose.model('MaterialIssueVoucher');
  
  const transactions = [];
  
  for (const item of mrv.items) {
    // Determine destination warehouse based on condition
    let toWarehouseId = item.warehouse_id;
    if (mrv.condition === 'Scrap') {
      const scrapWarehouse = await mongoose.model('Warehouse').findOne({ warehouse_type: 'Scrap' });
      if (scrapWarehouse) toWarehouseId = scrapWarehouse._id;
    } else if (mrv.condition === 'Partially Damaged') {
      const quarantineWarehouse = await mongoose.model('Warehouse').findOne({ warehouse_type: 'Quarantine' });
      if (quarantineWarehouse) toWarehouseId = quarantineWarehouse._id;
    }
    
    // Find or create stock ledger record
    let stockRecord = await StockLedger.findOne({
      item_id: item.item_id,
      warehouse_id: toWarehouseId,
      bin_id: item.bin_id,
      batch_no: item.batch_no
    });
    
    if (stockRecord) {
      // Update existing stock
      const oldQty = stockRecord.quantity;
      const oldValue = stockRecord.total_value;
      const newQty = oldQty + item.returned_qty;
      const newValue = oldValue + item.total_value;
      
      if (stockRecord.valuation_method === 'Weighted Average') {
        stockRecord.unit_cost = newValue / newQty;
      }
      
      stockRecord.quantity = newQty;
      stockRecord.total_value = newValue;
      await stockRecord.save();
    } else {
      // Create new stock record
      stockRecord = new StockLedger({
        stock_id: await StockLedger.generateStockId(),
        item_id: item.item_id,
        part_no: item.part_no,
        warehouse_id: toWarehouseId,
        bin_id: item.bin_id,
        batch_no: item.batch_no,
        quantity: item.returned_qty,
        unit: item.unit,
        valuation_method: 'Weighted Average',
        unit_cost: item.unit_cost,
        total_value: item.total_value,
        created_by: userId
      });
      await stockRecord.save();
    }
    
    // Create stock transaction
    const transaction = new StockTransaction({
      txn_type: 'Material Return',
      txn_date: mrv.mrv_date,
      item_id: item.item_id,
      part_no: item.part_no,
      from_warehouse: null,
      to_warehouse: toWarehouseId,
      to_bin: item.bin_id,
      quantity: item.returned_qty,
      unit: item.unit,
      unit_cost: item.unit_cost,
      total_value: item.total_value,
      batch_no: item.batch_no,
      ref_document_type: 'MRV',
      ref_document_id: mrv.mrv_number,
      ref_id: mrv._id,
      remarks: `Material returned from WO ${mrv.wo_number}. Condition: ${mrv.condition}`,
      created_by: userId
    });
    
    await transaction.save();
    transactions.push(transaction);
    
    // Update MIV items
    const miv = await MaterialIssueVoucher.findById(mrv.miv_id);
    if (miv) {
      const mivItem = miv.items.find(i => i.item_id.toString() === item.item_id.toString());
      if (mivItem) {
        mivItem.returned_qty = (mivItem.returned_qty || 0) + item.returned_qty;
        mivItem.net_consumed_qty = mivItem.issued_qty - mivItem.returned_qty;
        await miv.save();
      }
    }
  }
  
  // Update MRV status
  mrv.status = 'Posted';
  mrv.posted_at = new Date();
  mrv.posted_by = userId;
  await mrv.save();
  
  return { mrv, transactions };
};

const MaterialReturnVoucher = mongoose.models.MaterialReturnVoucher || mongoose.model('MaterialReturnVoucher', materialReturnVoucherSchema);
module.exports = MaterialReturnVoucher;