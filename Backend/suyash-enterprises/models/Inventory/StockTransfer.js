// models/Inventory/StockTransfer.js
const mongoose = require('mongoose');

const transferItemSchema = new mongoose.Schema({
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
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll']
  },
  batch_no: {
    type: String
  },
  unit_cost: {
    type: Number,
    min: 0
  },
  total_cost: {
    type: Number,
    min: 0
  }
});

const stockTransferSchema = new mongoose.Schema({
  // Primary Identifier
  transfer_number: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    description: "Format: TRF-YYYYMM-XXXX. e.g. TRF-202503-0008"
  },
  
  transfer_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Transfer Type
  transfer_type: {
    type: String,
    required: true,
    enum: ['Warehouse to Warehouse', 'Bin to Bin', 'Warehouse to Production', 'Production to Warehouse', 'Subcontract Send', 'Subcontract Receive'],
    description: "Type of stock movement"
  },
  
  // Source Location
  from_warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  from_bin_id: {
    type: String,
    description: "Source bin location"
  },
  
  // Destination Location
  to_warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  to_bin_id: {
    type: String,
    description: "Destination bin location"
  },
  
  // Items
  items: [transferItemSchema],
  
  // Totals
  total_quantity: {
    type: Number,
    default: 0
  },
  total_transfer_value: {
    type: Number,
    default: 0
  },
  
  // Reference (for subcontract, etc.)
  reference_document_type: {
    type: String,
    enum: ['Work Order', 'Subcontract Challan', 'Manual', null],
    default: null
  },
  reference_document_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reference_document_type'
  },
  reference_number: {
    type: String,
    description: "Denormalized reference number"
  },
  
  // Personnel
  transferred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  received_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  
  // Audit Trail
  transaction_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction'
  }],
  
  // Transport Details (for inter-warehouse transfers)
  vehicle_no: {
    type: String,
    trim: true
  },
  lr_number: {
    type: String,
    trim: true
  },
  expected_delivery_date: {
    type: Date
  },
  actual_delivery_date: {
    type: Date
  },
  
  // Remarks
  remarks: {
    type: String,
    trim: true
  },
  
  // Audit Fields
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware
stockTransferSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total_quantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.total_transfer_value = this.items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  }
  next();
});

// Indexes
stockTransferSchema.index({ transfer_number: 1 });
stockTransferSchema.index({ transfer_type: 1, status: 1 });
stockTransferSchema.index({ from_warehouse_id: 1 });
stockTransferSchema.index({ to_warehouse_id: 1 });
stockTransferSchema.index({ transfer_date: -1 });

const StockTransfer = mongoose.models.StockTransfer || mongoose.model('StockTransfer', stockTransferSchema);

module.exports = StockTransfer;