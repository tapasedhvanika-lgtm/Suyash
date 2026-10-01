'use strict';
const mongoose = require('mongoose');

const assemblyLineSchema = new mongoose.Schema({
  line_code: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  line_name: {
    type: String,
    required: [true, 'Line name is required'],
    trim: true
  },
  line_type: {
    type: String,
    enum: ['Busbar', 'Panel', 'Gasket', 'EV', 'Transformer', 'General','Assembly'],
    default: 'General'
  },
  work_centre: {
    type: String,
    required: [true, 'Work centre is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
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
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Auto-generate line_code before save
assemblyLineSchema.pre('save', async function(next) {
  if (this.line_code) return next();
  
  try {
    const count = await this.constructor.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.line_code = `AL-${sequence}`;
    next();
  } catch (e) {
    next(e);
  }
});

// Indexes
assemblyLineSchema.index({ line_code: 1 });
assemblyLineSchema.index({ line_type: 1 });
assemblyLineSchema.index({ is_active: 1 });

module.exports = mongoose.model('AssemblyLine', assemblyLineSchema);