// models/Inventory/ReorderAlert.js
const mongoose = require('mongoose');

const reorderAlertSchema = new mongoose.Schema({
  // Primary Identifier
  alert_id: {
    type: String,
    required: true,
    unique: true,
    description: "Format: ROA-YYYYMMDD-XXXX"
  },
  
  // Item that triggered alert
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true
  },
  part_no: {
    type: String,
    required: true,
    uppercase: true
  },
  item_description: {
    type: String
  },
  
  // Location
  warehouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
    index: true
  },
  warehouse_name: {
    type: String
  },
  bin_id: {
    type: String
  },
  
  // Stock levels
  current_qty: {
    type: Number,
    required: true,
    min: 0
  },
  min_stock: {
    type: Number,
    required: true,
    min: 0
  },
  max_stock: {
    type: Number,
    min: 0
  },
  reorder_qty: {
    type: Number,
    min: 0,
    description: "Recommended purchase quantity from Item Master"
  },
  
  // Calculated fields
  shortage_qty: {
    type: Number,
    default: 0
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  
  // Auto-PR
  auto_pr_enabled: {
    type: Boolean,
    default: false
  },
  auto_pr_created: {
    type: Boolean,
    default: false
  },
  pr_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseRequisition',
    description: "Auto-created PR reference"
  },
  pr_number: {
    type: String
  },
  
  // Notifications
  alert_sent_to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  alert_sent_at: {
    type: Date
  },
  email_sent: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['Open', 'PR Created', 'Acknowledged', 'Resolved'],
    default: 'Open',
    index: true
  },
  
  // Timeline
  triggered_at: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  acknowledged_at: {
    type: Date
  },
  acknowledged_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolved_at: {
    type: Date
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional
  remarks: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// ======================================================
// INDEXES
// ======================================================

reorderAlertSchema.index({ alert_id: 1 }, { unique: true });
reorderAlertSchema.index({ status: 1, priority: 1 });
reorderAlertSchema.index({ item_id: 1, status: 1 });
reorderAlertSchema.index({ triggered_at: -1 });
reorderAlertSchema.index({ warehouse_id: 1, status: 1 });

// ======================================================
// MIDDLEWARE
// ======================================================

// Auto-generate alert_id
reorderAlertSchema.pre('save', async function(next) {
  if (!this.alert_id && this.isNew) {
    const date = new Date(this.triggered_at || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `ROA-${year}${month}${day}`;
    
    const lastAlert = await this.constructor.findOne({
      alert_id: new RegExp(`^${prefix}`)
    }).sort({ alert_id: -1 });
    
    let sequence = 1;
    if (lastAlert && lastAlert.alert_id) {
      const lastSeq = parseInt(lastAlert.alert_id.split('-')[3]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
    
    this.alert_id = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
  
  // Calculate shortage and priority
  this.shortage_qty = Math.max(0, this.min_stock - this.current_qty);
  
  // Set priority based on shortage severity
  if (this.current_qty === 0) {
    this.priority = 'Critical';
  } else if (this.shortage_qty > this.min_stock) {
    this.priority = 'Critical';
  } else if (this.shortage_qty > this.min_stock / 2) {
    this.priority = 'High';
  } else if (this.shortage_qty > 0) {
    this.priority = 'Medium';
  } else {
    this.priority = 'Low';
  }
  
  next();
});

// ======================================================
// STATIC METHODS
// ======================================================

/**
 * Check and create reorder alerts for all items below reorder level
 */
reorderAlertSchema.statics.checkAndCreateAlerts = async function() {
  const StockLedger = mongoose.model('StockLedger');
  const Item = mongoose.model('Item');
  
  // Find all items below reorder level
  const belowReorder = await StockLedger.find({
    is_below_reorder: true,
    quantity: { $gt: 0 } // Only active stock
  }).populate('item_id');
  
  const alertsCreated = [];
  
  for (const stock of belowReorder) {
    // Check if open alert already exists for this item/warehouse
    const existingAlert = await this.findOne({
      item_id: stock.item_id._id,
      warehouse_id: stock.warehouse_id,
      status: { $in: ['Open', 'PR Created', 'Acknowledged'] }
    });
    
    if (!existingAlert) {
      const alert = new this({
        item_id: stock.item_id._id,
        part_no: stock.part_no,
        item_description: stock.item_id?.description,
        warehouse_id: stock.warehouse_id,
        warehouse_name: stock.warehouse_id?.warehouse_name,
        bin_id: stock.bin_id,
        current_qty: stock.quantity,
        min_stock: stock.min_stock,
        max_stock: stock.max_stock,
        reorder_qty: stock.item_id?.reorder_qty,
        auto_pr_enabled: stock.item_id?.auto_pr_enabled || false
      });
      
      await alert.save();
      alertsCreated.push(alert);
    }
  }
  
  return alertsCreated;
};

/**
 * Auto-create purchase requisitions for alerts with auto_pr_enabled
 */
reorderAlertSchema.statics.autoCreatePR = async function() {
  const openAlerts = await this.find({
    status: 'Open',
    auto_pr_enabled: true,
    auto_pr_created: false
  }).populate('item_id');
  
  const PurchaseRequisition = mongoose.model('PurchaseRequisition');
  const prsCreated = [];
  
  for (const alert of openAlerts) {
    try {
      const pr = new PurchaseRequisition({
        pr_number: await PurchaseRequisition.generatePRNumber(),
        pr_date: new Date(),
        requester_id: alert.alert_sent_to[0] || null,
        department: 'Stores',
        items: [{
          item_id: alert.item_id._id,
          part_no: alert.part_no,
          description: alert.item_description,
          quantity: alert.reorder_qty || alert.min_stock * 2,
          unit: alert.item_id?.unit || 'Nos',
          required_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          remarks: `Auto-generated from reorder alert ${alert.alert_id}`
        }],
        priority: alert.priority === 'Critical' ? 'Urgent' : 'Normal',
        status: 'Draft',
        created_by: alert.alert_sent_to[0] || null,
        source: 'Auto PR',
        source_document: alert.alert_id
      });
      
      await pr.save();
      
      alert.auto_pr_created = true;
      alert.pr_id = pr._id;
      alert.pr_number = pr.pr_number;
      alert.status = 'PR Created';
      await alert.save();
      
      prsCreated.push({ alert: alert.alert_id, pr: pr.pr_number });
    } catch (error) {
      console.error(`Failed to auto-create PR for alert ${alert.alert_id}:`, error);
    }
  }
  
  return prsCreated;
};

/**
 * Acknowledge alert
 */
reorderAlertSchema.statics.acknowledgeAlert = async function(alertId, userId) {
  const alert = await this.findById(alertId);
  if (!alert) throw new Error('Alert not found');
  
  alert.status = 'Acknowledged';
  alert.acknowledged_at = new Date();
  alert.acknowledged_by = userId;
  await alert.save();
  
  return alert;
};

/**
 * Resolve alert (stock replenished)
 */
reorderAlertSchema.statics.resolveAlert = async function(alertId, userId, remarks) {
  const alert = await this.findById(alertId);
  if (!alert) throw new Error('Alert not found');
  
  alert.status = 'Resolved';
  alert.resolved_at = new Date();
  alert.resolved_by = userId;
  if (remarks) alert.remarks = remarks;
  await alert.save();
  
  return alert;
};

/**
 * Get alert summary
 */
reorderAlertSchema.statics.getAlertSummary = async function() {
  const summary = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        critical_count: { $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] } },
        high_count: { $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] } },
        medium_count: { $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] } },
        low_count: { $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] } }
      }
    }
  ]);
  
  return summary;
};

const ReorderAlert = mongoose.models.ReorderAlert || mongoose.model('ReorderAlert', reorderAlertSchema);
module.exports = ReorderAlert;