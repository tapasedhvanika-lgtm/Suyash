// models/Inventory/StockReservation.js
const mongoose = require('mongoose');

const stockReservationSchema = new mongoose.Schema({
  // Primary Identifier (matches spec 7.4.1)
  reservation_id: {
    type: String,
    unique: true,
    description: "Format: RES-XXXXXX"
  },
  
  // Item being reserved
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true
  },
  
  // Location
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
    index: true
  },
  
  // Specific batch reserved (for FIFO items)
  batch_no: {
    type: String,
    index: true,
    description: "Specific batch reserved (for FIFO items)"
  },
  
  // Quantity
  reserved_qty: {
    type: Number,
    required: true,
    min: 0,
    description: "Quantity reserved"
  },
  
  // Reference to triggering document
  ref_type: {
    type: String,
    required: true,
    enum: ['Work Order', 'Sales Order', 'Transfer'],
    description: "What this reservation is for"
  },
  ref_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    description: "ObjectId of the WO or SO that caused this reservation"
  },
  ref_number: {
    type: String,
    description: "Denormalized reference number for quick lookup"
  },
  
  // Audit
  reserved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: "Who created the reservation"
  },
  reserved_at: {
    type: Date,
    default: Date.now,
    description: "When reservation was created"
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['Active', 'Consumed', 'Released', 'Expired'],
    default: 'Active',
    index: true,
    description: "Current status of reservation"
  },
  
  // Timeline
  consumed_at: {
    type: Date,
    description: "When MIV was created and stock physically issued"
  },
  consumed_qty: {
    type: Number,
    default: 0,
    description: "Quantity actually consumed (may be less than reserved)"
  },
  released_at: {
    type: Date,
    description: "When WO is cancelled - reservation released back to available"
  },
  expires_at: {
    type: Date,
    description: "Auto-expiry date (e.g., 7 days after creation for unconfirmed orders)"
  },
  
  // Additional
  remarks: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// ======================================================
// INDEXES
// ======================================================

stockReservationSchema.index({ reservation_id: 1 }, { unique: true });
stockReservationSchema.index({ item_id: 1, warehouse_id: 1, status: 1 });
stockReservationSchema.index({ ref_type: 1, ref_id: 1 });
stockReservationSchema.index({ status: 1, expires_at: 1 });
stockReservationSchema.index({ reserved_at: -1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate reservation_id
stockReservationSchema.pre('save', async function(next) {
  if (!this.reservation_id && this.isNew) {
    const lastRes = await this.constructor.findOne({})
      .sort({ reservation_id: -1 })
      .limit(1);
    
    let nextNumber = 1;
    if (lastRes && lastRes.reservation_id) {
      const lastNum = parseInt(lastRes.reservation_id.split('-')[1]);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }
    
    this.reservation_id = `RES-${String(nextNumber).padStart(6, '0')}`;
  }
  
  // Set expiry if not set (default 7 days)
  if (!this.expires_at && this.status === 'Active') {
    this.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// ======================================================
// STATIC METHODS
// ======================================================

/**
 * Create reservation with stock validation
 */
stockReservationSchema.statics.createReservation = async function(data, userId) {
  const StockLedger = mongoose.model('StockLedger');
  
  // Check available stock
  const stockRecord = await StockLedger.findOne({
    item_id: data.item_id,
    warehouse_id: data.warehouse_id,
    ...(data.batch_no && { batch_no: data.batch_no })
  });
  
  if (!stockRecord) {
    throw new Error('No stock record found for this item/location');
  }
  
  const availableQty = stockRecord.quantity - stockRecord.reserved_qty;
  if (availableQty < data.reserved_qty) {
    throw new Error(`Insufficient available stock. Required: ${data.reserved_qty}, Available: ${availableQty}`);
  }
  
  // Create reservation
  const reservation = new this({
    ...data,
    reserved_by: userId
  });
  
  // Update stock ledger reserved_qty
  stockRecord.reserved_qty = (stockRecord.reserved_qty || 0) + data.reserved_qty;
  await stockRecord.save();
  
  await reservation.save();
  
  return reservation;
};

/**
 * Consume reservation (when material is issued)
 */
stockReservationSchema.statics.consumeReservation = async function(reservationId, consumedQty, userId) {
  const reservation = await this.findById(reservationId);
  if (!reservation) {
    throw new Error('Reservation not found');
  }
  
  if (reservation.status !== 'Active') {
    throw new Error(`Reservation is ${reservation.status}, cannot consume`);
  }
  
  if (consumedQty > reservation.reserved_qty) {
    throw new Error(`Cannot consume more than reserved. Reserved: ${reservation.reserved_qty}, Consuming: ${consumedQty}`);
  }
  
  const StockLedger = mongoose.model('StockLedger');
  const stockRecord = await StockLedger.findOne({
    item_id: reservation.item_id,
    warehouse_id: reservation.warehouse_id,
    ...(reservation.batch_no && { batch_no: reservation.batch_no })
  });
  
  if (stockRecord) {
    stockRecord.reserved_qty = Math.max(0, stockRecord.reserved_qty - consumedQty);
    await stockRecord.save();
  }
  
  reservation.consumed_qty = (reservation.consumed_qty || 0) + consumedQty;
  
  if (reservation.consumed_qty >= reservation.reserved_qty) {
    reservation.status = 'Consumed';
    reservation.consumed_at = new Date();
  }
  
  await reservation.save();
  
  return reservation;
};

/**
 * Release reservation (when WO is cancelled)
 */
stockReservationSchema.statics.releaseReservation = async function(reservationId, userId) {
  const reservation = await this.findById(reservationId);
  if (!reservation) {
    throw new Error('Reservation not found');
  }
  
  if (reservation.status !== 'Active') {
    throw new Error(`Reservation is ${reservation.status}, cannot release`);
  }
  
  const StockLedger = mongoose.model('StockLedger');
  const stockRecord = await StockLedger.findOne({
    item_id: reservation.item_id,
    warehouse_id: reservation.warehouse_id,
    ...(reservation.batch_no && { batch_no: reservation.batch_no })
  });
  
  if (stockRecord) {
    const remainingReserved = (reservation.reserved_qty - (reservation.consumed_qty || 0));
    stockRecord.reserved_qty = Math.max(0, stockRecord.reserved_qty - remainingReserved);
    await stockRecord.save();
  }
  
  reservation.status = 'Released';
  reservation.released_at = new Date();
  await reservation.save();
  
  return reservation;
};

/**
 * Auto-expire old reservations
 */
stockReservationSchema.statics.expireOldReservations = async function() {
  const expired = await this.updateMany(
    {
      status: 'Active',
      expires_at: { $lt: new Date() }
    },
    {
      status: 'Expired',
      released_at: new Date()
    }
  );
  
  // Release stock for expired reservations
  const expiredReservations = await this.find({
    status: 'Expired',
    released_at: { $exists: true }
  });
  
  const StockLedger = mongoose.model('StockLedger');
  for (const reservation of expiredReservations) {
    const stockRecord = await StockLedger.findOne({
      item_id: reservation.item_id,
      warehouse_id: reservation.warehouse_id,
      ...(reservation.batch_no && { batch_no: reservation.batch_no })
    });
    
    if (stockRecord) {
      const remainingReserved = (reservation.reserved_qty - (reservation.consumed_qty || 0));
      stockRecord.reserved_qty = Math.max(0, stockRecord.reserved_qty - remainingReserved);
      await stockRecord.save();
    }
  }
  
  return expired;
};

// ======================================================
// VIRTUAL FIELDS
// ======================================================

stockReservationSchema.virtual('remaining_qty').get(function() {
  return this.reserved_qty - (this.consumed_qty || 0);
});

stockReservationSchema.virtual('is_expired').get(function() {
  return this.expires_at && new Date() > this.expires_at;
});

const StockReservation = mongoose.models.StockReservation || mongoose.model('StockReservation', stockReservationSchema);
module.exports = StockReservation;