// controllers/Quality/inspectionPlanController.js
const InspectionPlan = require('../../models/Quality/InspectionPlan');
const GaugeMaster = require('../../models/Quality/GaugeMaster');

// ======================================================
// CREATE INSPECTION PLAN
// ======================================================
const createPlan = async (req, res) => {
  try {
    const body = req.body;

    // Validate all gauge_ids in checkpoints exist in GaugeMaster
    const gaugeIds = (body.checkpoints || [])
      .filter(cp => cp.gauge_id)
      .map(cp => cp.gauge_id);

    if (gaugeIds.length > 0) {
      const found = await GaugeMaster.find({ _id: { $in: gaugeIds } }).select('_id');
      const foundSet = new Set(found.map(g => g._id.toString()));
      const missing = gaugeIds.filter(id => !foundSet.has(id.toString()));
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some gauge_ids do not exist in Gauge Master',
          missingIds: missing,
        });
      }
    }

    // Critical checkpoints must have a gauge assigned
    const criticalWithoutGauge = (body.checkpoints || []).filter(
      cp => cp.is_critical && !cp.gauge_id
    );
    if (criticalWithoutGauge.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Critical checkpoints must have a gauge_id assigned',
        checkpoints: criticalWithoutGauge.map(cp => cp.sequence),
      });
    }

    const plan = new InspectionPlan(body);
    await plan.save();
    return res.status(201).json({ success: true, data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET ALL PLANS (with filters)
// ======================================================
const getAllPlans = async (req, res) => {
  try {
    const { item_id, plan_type, is_active } = req.query;
    const filter = {};
    if (item_id) filter.item_id = item_id;
    if (plan_type) filter.plan_type = plan_type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const plans = await InspectionPlan.find(filter)
      .populate('item_id', 'part_no item_name')
      .populate('approved_by', 'name')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET PLAN BY ID
// ======================================================
const getPlanById = async (req, res) => {
  try {
    const plan = await InspectionPlan.findById(req.params.id)
      .populate('item_id', 'part_no item_name')
      .populate('approved_by', 'name')
      .populate('checkpoints.gauge_id', 'gauge_id gauge_name gauge_code status next_calibration_date');

    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    return res.json({ success: true, data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET PLANS BY ITEM (latest active per plan_type)
// ======================================================
const getPlansByItem = async (req, res) => {
  try {
    const plans = await InspectionPlan.find({
      item_id: req.params.item_id,
      is_active: true,
    }).sort({ createdAt: -1 });

    // Return latest plan per plan_type
    const latestByType = {};
    for (const plan of plans) {
      if (!latestByType[plan.plan_type]) {
        latestByType[plan.plan_type] = plan;
      }
    }

    return res.json({ success: true, data: Object.values(latestByType) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// UPDATE PLAN (creates new version if approved plan checkpoints change)
// ======================================================
const updatePlan = async (req, res) => {
  try {
    const existing = await InspectionPlan.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Plan not found' });

    // If checkpoints are changing on an already-approved plan, supersede and create a new version
    const checkpointsChanging = req.body.checkpoints && existing.approved_at;
    if (checkpointsChanging) {
      existing.is_active = false;
      await existing.save();

      const newPlan = new InspectionPlan({
        ...existing.toObject(),
        _id: undefined,
        plan_id: undefined,
        approved_by: undefined,
        approved_at: undefined,
        approval_status: 'Pending',
        checkpoints: req.body.checkpoints,
        is_active: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
      await newPlan.save();

      existing.superseded_by = newPlan._id;
      await existing.save();

      return res.status(201).json({
        success: true,
        message: 'New plan version created (previous plan superseded)',
        data: newPlan,
      });
    }

    const updated = await InspectionPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// SUBMIT FOR APPROVAL
// ======================================================
const submitForApproval = async (req, res) => {
  try {
    const plan = await InspectionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (plan.approval_status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit plan with status: ${plan.approval_status}`,
      });
    }

    if (!plan.checkpoints || plan.checkpoints.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit a plan with no checkpoints',
      });
    }

    plan.approval_status = 'Pending Approval';
    plan.submitted_by = req.user?._id || req.body.submitted_by;
    plan.submitted_at = new Date();

    await plan.save();
    return res.json({ success: true, message: 'Plan submitted for approval', data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// APPROVE PLAN
// ======================================================
const approvePlan = async (req, res) => {
  try {
    const plan = await InspectionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (plan.approval_status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Plan is already approved' });
    }

    if (plan.approval_status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve a rejected plan. Please create a new version.',
      });
    }

    if (!plan.checkpoints || plan.checkpoints.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve a plan with no checkpoints',
      });
    }

    plan.approval_status = 'Approved';
    plan.approved_by = req.body.approved_by;
    plan.approved_at = new Date();
    plan.effective_from = req.body.effective_from ? new Date(req.body.effective_from) : new Date();

    await plan.save();
    return res.json({ success: true, message: 'Plan approved', data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// REJECT PLAN
// ======================================================
const rejectPlan = async (req, res) => {
  try {
    const plan = await InspectionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (plan.approval_status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Can only reject plans with status 'Pending Approval'. Current status: ${plan.approval_status}`,
      });
    }

    plan.approval_status = 'Rejected';
    plan.rejection_reason = req.body.rejection_reason || 'No reason provided';
    plan.rejected_by = req.user?._id || req.body.rejected_by;
    plan.rejected_at = new Date();

    await plan.save();
    return res.json({ success: true, message: 'Plan rejected', data: plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ======================================================
// DELETE INSPECTION PLAN (SOFT DELETE)
// ======================================================
const deletePlan = async (req, res) => {
  try {
    const plan = await InspectionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Inspection Plan not found'
      });
    }

    if (!plan.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Inspection Plan is already inactive'
      });
    }

    plan.is_active = false;

    await plan.save();

    return res.json({
      success: true,
      message: 'Inspection Plan deleted successfully',
      data: plan
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  getPlansByItem,
  updatePlan,
  submitForApproval,
  approvePlan,
  rejectPlan,
    deletePlan,
};