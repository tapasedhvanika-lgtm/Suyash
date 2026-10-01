// models/Inventory/ScrapRecord.js
const mongoose = require('mongoose');

const scrapRecordSchema = new mongoose.Schema({
  // Primary Identifier
  scrap_id: {
    type: String,
    required: true,
    unique: true,
    description: "Format: SCR-YYYYMM-XXXX. e.g. SCR-202503-0019"
  },
  scrap_date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  // Work Order Reference
  wo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    index: true,
    description: "Work Order during which scrap was generated"
  },
  wo_number: {
    type: String,
    description: "Denormalized WO number"
  },
  op_sequence: {
    type: Number,
    description: "Routing operation sequence at which scrap occurred"
  },
  operation_name: {
    type: String,
    description: "Name of the operation where scrap was generated"
  },
  
  // Parent Item (being produced)
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    description: "Finished item being produced (parent item of the WO)"
  },
  part_no: {
    type: String,
    required: true,
    uppercase: true
  },
  
  // Scrap Material Details
  scrap_material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    description: "Actual scrap material item. e.g. 'Copper Scrap — C11000 Clean'"
  },
  scrap_material_code: {
    type: String,
    description: "Scrap material code"
  },
  scrap_qty: {
    type: Number,
    required: true,
    min: 0,
    description: "Quantity of scrap generated"
  },
  scrap_weight_kg: {
    type: Number,
    min: 0,
    description: "Weight in kg. For dimensional items, computed from physical weighing"
  },
  unit: {
    type: String,
    required: true,
    enum: ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll']
  },
  
  // Classification
  scrap_type: {
    type: String,
    required: true,
    enum: [
      'Punching Skeleton',
      'Offcut',
      'Rejected Piece',
      'Grinding Swarf',
      'Machining Chip',
      'Flash',
      'Other'
    ],
    description: "Type of scrap generated"
  },
  scrap_grade: {
    type: String,
    description: "Material grade of scrap. e.g. 'Copper C11000 Clean'"
  },
  
  // Valuation
  estimated_scrap_rate: {
    type: Number,
    min: 0,
    description: "Rs/kg estimated recovery rate at current market"
  },
  estimated_scrap_value: {
    type: Number,
    min: 0,
    description: "Computed: scrap_weight_kg × estimated_scrap_rate × scrap_realisation_pct"
  },
  scrap_realisation_pct: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
    description: "Percentage of scrap value that can be recovered (e.g., 80% for mixed scrap)"
  },
  
  // Sale Information
  actual_scrap_value: {
    type: Number,
    min: 0,
    description: "Actual amount received from scrap dealer"
  },
  sold_to: {
    type: String,
    description: "Scrap dealer / recycler name"
  },
  sold_date: {
    type: Date,
    description: "Date scrap was sold"
  },
  invoice_number: {
    type: String,
    description: "Sale invoice number"
  },
  
  // Status
  status: {
    type: String,
    enum: ['Generated', 'In Scrap Store', 'Sold', 'Scrapped'],
    default: 'Generated',
    index: true
  },
  
  // Additional
  remarks: {
    type: String,
    maxlength: 500
  },
  photos: [{
    type: String,
    description: "Photos of scrap for verification"
  }],
  
  // Audit
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recorded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    description: "Production operator who recorded the scrap"
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: "Supervisor who verified scrap quantity"
  },
  verified_at: {
    type: Date
  }
}, {
  timestamps: true
});

// ======================================================
// INDEXES
// ======================================================

scrapRecordSchema.index({ scrap_id: 1 }, { unique: true });
scrapRecordSchema.index({ wo_id: 1, status: 1 });
scrapRecordSchema.index({ scrap_date: -1 });
scrapRecordSchema.index({ scrap_type: 1 });
scrapRecordSchema.index({ status: 1, sold_date: 1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate scrap_id
scrapRecordSchema.pre('save', async function(next) {
  if (!this.scrap_id && this.isNew) {
    const date = new Date(this.scrap_date || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `SCR-${year}${month}`;
    
    const lastScrap = await this.constructor.findOne({
      scrap_id: new RegExp(`^${prefix}`)
    }).sort({ scrap_id: -1 });
    
    let sequence = 1;
    if (lastScrap && lastScrap.scrap_id) {
      const lastSeq = parseInt(lastScrap.scrap_id.split('-')[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.scrap_id = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Calculate estimated scrap value
  if (this.scrap_weight_kg && this.estimated_scrap_rate && !this.estimated_scrap_value) {
    this.estimated_scrap_value = this.scrap_weight_kg * this.estimated_scrap_rate * (this.scrap_realisation_pct / 100);
  }
  
  next();
});

// ======================================================
// STATIC METHODS
// ======================================================

/**
 * Record scrap from production
 */
scrapRecordSchema.statics.recordScrap = async function(data, userId) {
  const StockLedger = mongoose.model('StockLedger');
  const StockTransaction = mongoose.model('StockTransaction');
  
  // Get scrap warehouse
  const scrapWarehouse = await mongoose.model('Warehouse').findOne({ warehouse_type: 'Scrap' });
  if (!scrapWarehouse) {
    throw new Error('Scrap warehouse not configured. Please create a warehouse with type "Scrap"');
  }
  
  // Create scrap record
  const scrapRecord = new this({
    ...data,
    created_by: userId
  });
  
  await scrapRecord.save();
  
  // If scrap is from WIP or RM, create stock transaction to move to scrap store
  if (data.from_warehouse_id) {
    // Find or create stock ledger for scrap
    let scrapStock = await StockLedger.findOne({
      item_id: scrapRecord.scrap_material_id || scrapRecord.item_id,
      warehouse_id: scrapWarehouse._id,
      batch_no: data.batch_no
    });
    
    if (scrapStock) {
      scrapStock.quantity += scrapRecord.scrap_qty;
      scrapStock.total_value = scrapStock.quantity * scrapStock.unit_cost;
      await scrapStock.save();
    } else {
      scrapStock = new StockLedger({
        stock_id: await StockLedger.generateStockId(),
        item_id: scrapRecord.scrap_material_id || scrapRecord.item_id,
        part_no: scrapRecord.scrap_material_code || scrapRecord.part_no,
        warehouse_id: scrapWarehouse._id,
        quantity: scrapRecord.scrap_qty,
        unit: scrapRecord.unit,
        valuation_method: 'Weighted Average',
        unit_cost: scrapRecord.estimated_scrap_rate || 0,
        total_value: scrapRecord.estimated_scrap_value || 0,
        created_by: userId
      });
      await scrapStock.save();
    }
    
    // Create stock transaction
    const transaction = new StockTransaction({
      txn_type: 'Scrap',
      txn_date: scrapRecord.scrap_date,
      item_id: scrapRecord.scrap_material_id || scrapRecord.item_id,
      part_no: scrapRecord.scrap_material_code || scrapRecord.part_no,
      from_warehouse: data.from_warehouse_id,
      to_warehouse: scrapWarehouse._id,
      quantity: scrapRecord.scrap_qty,
      unit: scrapRecord.unit,
      unit_cost: scrapRecord.estimated_scrap_rate || 0,
      total_value: scrapRecord.estimated_scrap_value || 0,
      batch_no: data.batch_no,
      ref_document_type: 'WO',
      ref_document_id: scrapRecord.wo_number,
      ref_id: scrapRecord.wo_id,
      remarks: `Scrap recorded from ${data.operation_name || 'production'}`,
      created_by: userId
    });
    
    await transaction.save();
  }
  
  return scrapRecord;
};

/**
 * Record scrap sale
 */
scrapRecordSchema.statics.recordScrapSale = async function(scrapId, saleData, userId) {
  const scrapRecord = await this.findById(scrapId);
  if (!scrapRecord) throw new Error('Scrap record not found');
  
  scrapRecord.actual_scrap_value = saleData.actual_value;
  scrapRecord.sold_to = saleData.sold_to;
  scrapRecord.sold_date = saleData.sold_date || new Date();
  scrapRecord.invoice_number = saleData.invoice_number;
  scrapRecord.status = 'Sold';
  scrapRecord.verified_by = userId;
  scrapRecord.verified_at = new Date();
  
  await scrapRecord.save();
  
  return scrapRecord;
};

/**
 * Get scrap summary by period
 */
scrapRecordSchema.statics.getScrapSummary = async function(fromDate, toDate) {
  const matchFilter = {};
  if (fromDate) matchFilter.scrap_date = { $gte: new Date(fromDate) };
  if (toDate) matchFilter.scrap_date = { ...matchFilter.scrap_date, $lte: new Date(toDate) };
  
  const summary = await this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$scrap_type',
        total_weight: { $sum: '$scrap_weight_kg' },
        total_quantity: { $sum: '$scrap_qty' },
        estimated_value: { $sum: '$estimated_scrap_value' },
        actual_value: { $sum: '$actual_scrap_value' },
        records_count: { $sum: 1 }
      }
    },
    { $sort: { estimated_value: -1 } }
  ]);
  
  const totalSummary = {
    total_weight: summary.reduce((sum, s) => sum + s.total_weight, 0),
    total_estimated_value: summary.reduce((sum, s) => sum + s.estimated_value, 0),
    total_actual_value: summary.reduce((sum, s) => sum + s.actual_value, 0),
    total_records: summary.reduce((sum, s) => sum + s.records_count, 0)
  };
  
  return { summary, totalSummary };
};

const ScrapRecord = mongoose.models.ScrapRecord || mongoose.model('ScrapRecord', scrapRecordSchema);
module.exports = ScrapRecord;