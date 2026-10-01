// models/BOM/Bom.js — COMPLETE FILE

//'use strict';
const mongoose = require('mongoose');

const bomComponentSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: [true, 'Component level is required'],
    min: 0,
    default: 1,
  },
  component_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Component item ID is required'],
  },
  // Denormalized from Item — auto-filled by controller from Item Master
  component_part_no: {
    type: String,
    required: [true, 'Component part number is required'],
    trim: true,
    uppercase: true,
  },
  component_desc: {
    type: String,
    required: [true, 'Component description is required'],
    trim: true,
  },
  quantity_per: {
    type: Number,
    required: [true, 'Quantity per is required'],
    min: 0.0001,
  },
  unit: {
    type: String,
    enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'],
    required: [true, 'Unit is required'],
  },
  scrap_percent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  is_phantom: {
    type: Boolean,
    default: false,
  },
  is_subcontract: {
    type: Boolean,
    default: false,
  },
  subcontract_vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  reference_designator: { type: String, trim: true },
  remarks:              { type: String, trim: true },
}, { _id: true });

const bomSchema = new mongoose.Schema({
  bom_id: {
    type: String,
    required: [true, 'BOM ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  parent_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Parent item ID is required'],
  },
  // Denormalized from Item — auto-filled by controller
  parent_part_no: {
    type: String,
    required: [true, 'Parent part number is required'],
    trim: true,
    uppercase: true,
  },
  bom_version: {
    type: String,
    required: [true, 'BOM version is required'],
    trim: true,
  },
  is_default: {
    type: Boolean,
    default: false,
  },
  effective_from: {
    type: Date,
    default: Date.now,
  },
  effective_to: {
    type: Date,
    default: null,
  },
  bom_type: {
    type: String,
    enum: ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'],
    required: [true, 'BOM type is required'],
  },
  batch_size: {
    type: Number,
    required: [true, 'Batch size is required'],
    min: 1,
    default: 1,
  },
  yield_percent: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  setup_time_min: {
    type: Number,
    min: 0,
    default: 0,
  },
  cycle_time_min: {
    type: Number,
    min: 0,
    default: 0,
  },
 // In bomSchema
bom_category: {
  type: String,
  enum: ['Standard', 'Assembly'],  // Assembly = no components
  default: 'Standard',
},

components: {
  type: [bomComponentSchema],
  default: [],
  validate: {
    validator: function (v) {
      // Assembly BOM MUST have components (because you assemble things)
      if (this.bom_category === 'Assembly') {
        return v && v.length > 0;
      }
      // Standard BOM CANNOT have components (simple item)
      if (this.bom_category === 'Standard') {
        return !v || v.length === 0;
      }
      return true;
    },
    message: function() {
      if (this.bom_category === 'Assembly') {
        return 'Assembly BOM must have at least one component';
      }
      return 'Standard BOM cannot have components';
    },
  },
},
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approved_at: Date,
  is_active: {
    type: Boolean,
    default: true,
  },
 status: {
  type: String,
  enum: ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'],
  default: 'Pending',
},
  current_revision: {
    type: Number,
    default: 0,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Unique: one BOM version per parent item
bomSchema.index({ parent_item_id: 1, bom_version: 1 }, { unique: true });
bomSchema.index({ parent_item_id: 1, is_default: 1 });
bomSchema.index({ status: 1, is_active: 1 });
bomSchema.index({ bom_id: 1 }, { unique: true });
// For where-used queries on components
bomSchema.index({ 'components.component_item_id': 1 });

module.exports = mongoose.model('Bom', bomSchema);