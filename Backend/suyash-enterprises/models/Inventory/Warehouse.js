const mongoose = require('mongoose');

const binSubSchema = new mongoose.Schema({
  bin_id: {
    type: String,
    required: true,
    trim: true
  },
  bin_code: {
    type: String,
    required: true,
    trim: true
  },
  rack: {
    type: String,
    trim: true,
    default: ''
  },
  row: {
    type: Number,
    min: 1,
    default: null
  },
  col: {
    type: Number,
    min: 1,
    default: null
  },
  capacity: {
    type: Number,
    min: 0,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const warehouseSchema = new mongoose.Schema({
  warehouse_id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: /^WH-[A-Z0-9]{3,10}$/
  },
  warehouse_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  warehouse_type: {
    type: String,
    required: true,
    enum: ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine']
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  bins: [binSubSchema],
  is_active: {
    type: Boolean,
    default: true
  },
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
warehouseSchema.index({ warehouse_id: 1 });
warehouseSchema.index({ warehouse_type: 1, is_active: 1 });
warehouseSchema.index({ 'bins.bin_id': 1 });
warehouseSchema.index({ warehouse_name: 'text', location: 'text' });

// Add this method to warehouseSchema.statics
warehouseSchema.statics.getAvailableBinsForItem = async function(warehouseId, requiredQuantity) {
  const StockLedger = mongoose.model('StockLedger');
  
  // Get current bin utilization
  const currentStock = await StockLedger.aggregate([
    { $match: { warehouse_id: warehouseId } },
    { $group: {
      _id: '$bin_id',
      total_quantity: { $sum: '$quantity' }
    }}
  ]);

  const utilizationMap = {};
  currentStock.forEach(s => {
    utilizationMap[s._id] = s.total_quantity;
  });

  const warehouse = await this.findById(warehouseId);
  if (!warehouse) return [];

  // Find bins with capacity for the required quantity
  const availableBins = warehouse.bins
    .filter(bin => bin.is_active)
    .map(bin => ({
      bin_id: bin.bin_id,
      bin_code: bin.bin_code,
      capacity: bin.capacity,
      current_quantity: utilizationMap[bin.bin_id] || 0,
      available_capacity: bin.capacity ? 
        bin.capacity - (utilizationMap[bin.bin_id] || 0) : 
        null
    }))
    .filter(bin => {
      if (requiredQuantity && bin.capacity) {
        return bin.available_capacity >= parseFloat(requiredQuantity);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.available_capacity && b.available_capacity) {
        return b.available_capacity - a.available_capacity;
      }
      if (!a.available_capacity) return 1;
      if (!b.available_capacity) return -1;
      return 0;
    });

  return availableBins;
};

// Virtuals - FIXED to handle undefined
warehouseSchema.virtual('total_bins').get(function() {
  return this.bins ? this.bins.length : 0;  // ← Check if bins exists
});

warehouseSchema.virtual('active_bins').get(function() {
  return this.bins ? this.bins.filter(bin => bin.is_active).length : 0;  // ← Check if bins exists
});

module.exports = mongoose.model('Warehouse', warehouseSchema);