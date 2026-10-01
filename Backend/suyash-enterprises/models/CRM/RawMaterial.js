'use strict';
const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({

  // ── Link to Material Master ──────────────────────────────────────────────
  MaterialID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: [true, 'MaterialID is required - must link to Material Master'],
  },

  // ── Auto-filled from Material Master (not required in request body) ──────
  MaterialName: { type: String, required: true, trim: true },
  Grade: { type: String, required: true, trim: true },
  density: { type: Number, default: 0, min: 0 },
  unit: { type: String, enum: ['Kg', 'Gram', 'Ton', 'Meter'], default: 'Kg' },

  // ── Optional Description ─────────────────────────────────────────────────
  Description: { type: String, default: '', trim: true },

  // ── Rates (These come from request body) ─────────────────────────────────
  RatePerKG: {
    type: Number,
    required: [true, 'Rate per KG is required'],
    min: 0,
  },
  profile_conversion_rate: {
    type: Number,
    default: 0,
    min: 0,
  },
  total_rm_rate: { type: Number, default: 0, min: 0 },

  // ── Scrap ─────────────────────────────────────────────────────────────────
  ScrapPercentage: { type: Number, default: 0, min: 0, max: 100 },
  scrap_rate_per_kg: { type: Number, default: 0, min: 0 },

  // ── Transport ─────────────────────────────────────────────────────────────
  TransportLossPercentage: { type: Number, default: 0, min: 0, max: 100 },
  transport_rate_per_kg: { type: Number, default: 0, min: 0 },

  // ── Effective Rate (auto-computed) ────────────────────────────────────────
  EffectiveRate: { type: Number, min: 0 },

  // ── Validity ──────────────────────────────────────────────────────────────
  DateEffective: { type: Date, default: Date.now, required: true },
  DateExpiry: { type: Date, default: null },

  // ── Audit ─────────────────────────────────────────────────────────────────
  IsActive: { type: Boolean, default: true },
  CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
rawMaterialSchema.index({ MaterialID: 1, DateEffective: -1 });
rawMaterialSchema.index({ MaterialName: 1, Grade: 1 });
rawMaterialSchema.index({ IsActive: 1 });
rawMaterialSchema.index({ Grade: 1 });
rawMaterialSchema.index({ DateEffective: -1 });

// ── Pre-save: auto-compute all derived rates ──────────────────────────────────
rawMaterialSchema.pre('save', function (next) {
  this.total_rm_rate = this.RatePerKG + (this.profile_conversion_rate || 0);

  if (this.scrap_rate_per_kg === 0 && this.ScrapPercentage > 0) {
    this.scrap_rate_per_kg = (this.RatePerKG * this.ScrapPercentage) / 100;
  }

  if (this.transport_rate_per_kg === 0 && this.TransportLossPercentage > 0) {
    this.transport_rate_per_kg = (this.RatePerKG * this.TransportLossPercentage) / 100;
  }

  const totalPct = (this.ScrapPercentage + this.TransportLossPercentage) / 100;
  this.EffectiveRate = this.RatePerKG * (1 + totalPct);

  next();
});

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);