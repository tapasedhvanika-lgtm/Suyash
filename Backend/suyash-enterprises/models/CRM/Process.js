// models/CRM/Process.js
'use strict';
const mongoose = require('mongoose');

/**
 * PROCESS MASTER
 * 
 * Defines every manufacturing operation available in the factory.
 * Each process has a rate_type that determines HOW cost is calculated,
 * but NOT the actual price. The actual price (rate_entered) is added
 * during Quotation creation.
 * 
 * Used by:
 *   Phase 01 — Lead feasibility (is the required process available?)
 *   Phase 02 — Quotation process cost line items
 *   Phase 04 — Routing (operation sequence per part)
 *   Phase 05 — Work Order operations
 */

const processSchema = new mongoose.Schema({

  // ── Identity ──────────────────────────────────────────────────────────────
  process_id: {
    type: String,
    required: [true, 'Process ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  process_name: {
    type: String,
    required: [true, 'Process name is required'],
    trim: true,
    unique: true,
  },
  description: { 
    type: String, 
    default: '', 
    trim: true 
  },

  // ── Classification ────────────────────────────────────────────────────────
  category: {
    type: String,
    required: [true, 'Process category is required'],
    enum: ['Core', 'Finishing', 'Packing', 'Other'],
    default: 'Core',
  },

  // ── Rate Type (HOW to calculate, NOT the price) ──────────────────────────
  // This tells the quotation system:
  // - "Per Hour" → cost = user_entered_rate × hours
  // - "Per Kg"   → cost = user_entered_rate × weight
  // - "Per Nos"  → cost = user_entered_rate
  // - "Fixed"    → cost = user_entered_rate (one-time charge)
  rate_type: {
    type: String,
    required: [true, 'Rate type is required'],
    enum: ['Per Kg', 'Per Nos', 'Per Hour', 'Fixed'],
  },

  // ❌ REMOVED: standard_rate (price goes in Quotation, not Master)

  // ── Work Centre Linkage (references Machine Master) ───────────────────────
  work_centre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    default: null,
  },

  // ── Time Standards (Operational data - NO PRICE) ──────────────────────────
  setup_time_min: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  cycle_time_min: { 
    type: Number, 
    default: 0, 
    min: 0 
  },

  // ── Subcontract Flag ──────────────────────────────────────────────────────
  is_subcontract: { 
    type: Boolean, 
    default: false 
  },
  default_vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  is_active: { 
    type: Boolean, 
    default: true 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updated_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

}, { timestamps: true });


// ── Indexes ───────────────────────────────────────────────────────────────────
processSchema.index({ process_id: 1 }, { unique: true });
processSchema.index({ process_name: 1 }, { unique: true });
processSchema.index({ category: 1, is_active: 1 });
processSchema.index({ is_active: 1 });
processSchema.index({ work_centre: 1 });


module.exports = mongoose.model('Process', processSchema);