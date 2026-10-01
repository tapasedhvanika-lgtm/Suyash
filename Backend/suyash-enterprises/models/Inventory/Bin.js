const binSchema = new mongoose.Schema({
  // Identifiers
  bin_id: {
    type: String,
    required: true,
    unique: true,
    description: "Global unique bin identifier. e.g. WH-RM01-A-3-07"
  },
  
  bin_code: {
    type: String,
    required: true,
    description: "Short display code. e.g. A-3-07"
  },
  
  // Warehouse Reference
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  
  // Location Details
  rack: {
    type: String,
    trim: true
  },
  row: {
    type: Number,
    min: 1
  },
  col: {
    type: Number,
    min: 1
  },
  
  // Capacity
  capacity: {
    type: Number,
    min: 0,
    default: null
  },
  
  // Current Utilization (updated via triggers)
  current_utilization: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status
  is_active: {
    type: Boolean,
    default: true
  },
  
  // Audit
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true
});

// Indexes
binSchema.index({ warehouse_id: 1, bin_code: 1 }, { unique: true });
binSchema.index({ warehouse_id: 1, is_active: 1 });
binSchema.index({ current_utilization: 1, capacity: 1 });

module.exports = mongoose.model('Bin', binSchema);