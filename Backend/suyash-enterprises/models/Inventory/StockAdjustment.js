// models/Inventory/StockAdjustment.js
const mongoose = require('mongoose');

const adjustmentItemSchema = new mongoose.Schema({
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
  current_quantity: {
    type: Number,
    required: true,
    description: "Quantity before adjustment"
  },
  adjusted_quantity: {
    type: Number,
    required: true,
    description: "New quantity after adjustment"
  },
  difference: {
    type: Number,
    required: true,
    description: "adjusted_quantity - current_quantity (positive = addition, negative = removal)"
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
    min: 0
  },
  adjustment_value: {
    type: Number,
    min: 0,
    description: "Difference × unit_cost"
  }
});

const stockAdjustmentSchema = new mongoose.Schema({
  // Primary Identifier
  adjustment_number: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    description: "Format: ADJ-YYYYMM-XXXX. e.g. ADJ-202503-0003"
  },
  
  adjustment_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Adjustment Type
  adjustment_type: {
    type: String,
    required: true,
    enum: ['Physical Count', 'Damage', 'Obsolescence', 'Theft', 'Correction', 'Opening Balance'],
    description: "Reason for adjustment"
  },
  
  // Items
  items: [adjustmentItemSchema],
  
  // Totals
  total_adjustment_value: {
    type: Number,
    default: 0,
    description: "Sum of all adjustment values (absolute value)"
  },
  net_adjustment_value: {
    type: Number,
    default: 0,
    description: "Sum of adjustment values (can be negative)"
  },
  
  // Reference (if from Physical Stock Verification)
  psv_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PhysicalVerification',
    description: "If this adjustment came from a PSV"
  },
  psv_number: {
    type: String
  },
  
  // Approval
  requires_approval: {
    type: Boolean,
    default: true,
    description: "Whether this adjustment needs manager approval"
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Completed'],
    default: 'Draft'
  },
  
  // Audit Trail
  transaction_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction'
  }],
  
  // Reason
  reason: {
    type: String,
    required: true,
    trim: true,
    description: "Detailed explanation for the adjustment"
  },
  
  // Supporting Documents
  attachments: [{
    filename: String,
    path: String,
    uploaded_at: Date
  }],
  
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
stockAdjustmentSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total_adjustment_value = this.items.reduce((sum, item) => sum + Math.abs(item.adjustment_value || 0), 0);
    this.net_adjustment_value = this.items.reduce((sum, item) => sum + (item.adjustment_value || 0), 0);
  }
  next();
});

// Indexes
stockAdjustmentSchema.index({ adjustment_number: 1 });
stockAdjustmentSchema.index({ adjustment_type: 1, status: 1 });
stockAdjustmentSchema.index({ psv_id: 1 });
stockAdjustmentSchema.index({ adjustment_date: -1 });
stockAdjustmentSchema.index({ status: 1, requires_approval: 1 });

const StockAdjustment = mongoose.models.StockAdjustment || mongoose.model('StockAdjustment', stockAdjustmentSchema);

module.exports = StockAdjustment;