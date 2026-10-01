'use strict';
const mongoose = require('mongoose');

// DefectCode model is correct — no changes from original.
// Re-exported here for completeness.

const defectCodeSchema = new mongoose.Schema({

  defect_code: {
    type: String, required: true, unique: true, uppercase: true,
  },
  defect_name: {
    type: String, required: true,
  },
  defect_category: {
    type: String, required: true,
    enum: ['Dimensional', 'Visual/Surface', 'Material', 'Functional', 'Process', 'Quantity', 'Documentation'],
  },
  defect_description: {
    type: String, required: true,
  },
  applicable_processes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Process'
  }],
  severity_default: {
    type: String, enum: ['Critical', 'Major', 'Minor'], default: 'Major',
  },
  photo_reference: { type: String, default: '' },
  is_active:       { type: Boolean, default: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

defectCodeSchema.index({ defect_code: 1 },         { unique: true });
defectCodeSchema.index({ defect_category: 1, is_active: 1 });

module.exports = mongoose.model('DefectCode', defectCodeSchema);
