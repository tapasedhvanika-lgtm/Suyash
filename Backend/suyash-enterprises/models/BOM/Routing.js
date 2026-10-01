const mongoose = require('mongoose');

const routingOperationSchema = new mongoose.Schema({
  op_sequence: {
    type: Number,
    required: [true, 'Operation sequence is required'],
    min: 10
  },
  operation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Process',
    required: [true, 'Operation ID is required']
  },
  operation_name: {
    type: String,
    required: [true, 'Operation name is required'],
    trim: true
  },
  work_centre: {
    type: String,
    required: [true, 'Work centre is required'],
    trim: true
  },
  machine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  },
  requires_torque_recording: {
    type: Boolean,
    default: false,
    description: 'Set to true for operations that need torque recording (e.g., bolt tightening)'
  },
  requires_functional_test: {
    type: Boolean,
    default: false,
    description: 'Set to true for operations that require functional testing after completion'
  },
  expected_joints: {
    type: [String],
    default: [],
    description: 'List of joint names that need torque records (e.g., ["Phase A", "Phase B", "Earth"])'
  },
  is_subcontract: {
    type: Boolean,
    default: false
  },
  subcontract_vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  planned_setup_min: {
    type: Number,
    default: 0,
    min: 0
  },
  planned_run_min: {
    type: Number,
    required: [true, 'Planned run time is required'],
    min: 0
  },
  scrap_pct: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: false });

const routingSchema = new mongoose.Schema({
  routing_id: {
    type: String,
    required: [true, 'Routing ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  routing_name: {
    type: String,
    required: [true, 'Routing name is required'],
    trim: true
  },
  routing_type: {
    type: String,
    required: [true, 'Routing type is required'],
    enum: ['Stamping', 'Busbar', 'Gasket', 'Assembly', 'Toolroom', 'General']
  },
  applicable_items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  operations: {
    type: [routingOperationSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Routing must have at least one operation'
    }
  },
  total_cycle_time_min: {
    type: Number,
    default: 0
  },

  // ─── STATUS FIELD ──────────────────────────────────────────────────────────
  // Draft    : Newly created, not yet activated. Cannot be approved/rejected.
  //            Can still be edited freely.
  // Active   : Activated by manager. Ready for approval review.
  //            Approve or Reject actions are available in this state.
  // Approved : Engineering-approved for production use.
  //            Cannot be edited. Can be rejected back if needed.
  // Rejected : Failed review. Cannot be used in Work Orders.
  //            Can be re-activated (set back to Active) after corrections.
  // ──────────────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Approved', 'Rejected'],
    default: 'Draft'
  },

  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: {
    type: Date
  },

  // Rejection tracking
  rejected_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejected_at: {
    type: Date
  },
  rejection_reason: {
    type: String,
    trim: true
  },

  // is_active is ONLY a soft-delete flag — completely separate from status/approval flow
  // true  = record is live and usable (subject to status rules)
  // false = soft-deleted, hidden from all normal queries
  is_active: {
    type: Boolean,
    default: true
  },

  version: {
    type: String,
    default: '1.0'
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

// Pre-save middleware to calculate total cycle time
routingSchema.pre('save', function(next) {
  if (this.operations && this.operations.length > 0) {
    this.total_cycle_time_min = this.operations.reduce((sum, op) => sum + op.planned_run_min, 0);
  }
  next();
});

// Indexes
routingSchema.index({ routing_id: 1 }, { unique: true });
routingSchema.index({ routing_type: 1 });
routingSchema.index({ applicable_items: 1 });
routingSchema.index({ is_active: 1 });
routingSchema.index({ status: 1 });

module.exports = mongoose.model('Routing', routingSchema);