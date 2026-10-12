'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// controllers/Production/mrpController.js
// Phase 05 — BE-018
// UPDATED: Added missing mongoose import (needed for deleteMrpRun)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose'); // ✅ Added missing import
const { MrpRun } = require('../../models/Production/MrpRun');
const { enqueueMrpRun, getJobStatus } = require('../../services/Production/mrpQueue');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mrp/run
// Trigger an MRP run — returns job_id immediately (non-blocking)
// ─────────────────────────────────────────────────────────────────────────────
exports.triggerMrpRun = async (req, res) => {
  try {
    const run_type = req.body.run_type || 'Full';
    const planning_horizon = parseInt(req.body.planning_horizon) || 30;
    const so_ids = (req.body.so_ids || []).filter(id =>
      typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)
    );

    if (!['Full', 'Incremental', 'Item-Specific'].includes(run_type)) {
      return res.status(400).json({ success: false, message: 'Invalid run_type. Use Full | Incremental | Item-Specific' });
    }
    if (planning_horizon < 1 || planning_horizon > 365) {
      return res.status(400).json({ success: false, message: 'planning_horizon must be between 1 and 365 days' });
    }

    let lastRunReference = null;
    if (run_type === 'Incremental') {
      const lastRun = await MrpRun.findOne({ status: 'Completed' }).sort({ run_date: -1 }).lean();
      lastRunReference = lastRun ? lastRun.run_date : null;
    }

    const run = await MrpRun.create({
      run_type,
      planning_horizon,
      triggered_by: req.user._id,
      status: 'Queued',
      so_ids_considered: so_ids,
      last_run_reference: lastRunReference,
    });

    let jobId;
    try {
      ({ jobId } = await enqueueMrpRun(String(run._id)));
    } catch (queueErr) {
      console.error('[MRP] enqueueMrpRun failed, Redis unreachable:', queueErr.message);
      await MrpRun.deleteOne({ _id: run._id });   // remove orphaned Queued run
      return res.status(503).json({
        success: false,
        message: 'MRP queue is unavailable. Redis connection failed — check queue service.',
      });
    }

    run.job_id = jobId;
    await run.save();

    return res.status(202).json({
      success: true,
      message: 'MRP Run queued. Poll /api/mrp/runs/:id/status for progress.',
      data: {
        mrp_run_id: run.mrp_run_id,
        _id: run._id,
        job_id: jobId,
        run_type,
        planning_horizon,
        status: 'Queued',
      },
    });
  } catch (err) {
    console.error('[MRP] triggerMrpRun:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mrp/runs
// List all MRP runs
// ─────────────────────────────────────────────────────────────────────────────
exports.listMrpRuns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, run_type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status)   filter.status   = status;
    if (run_type) filter.run_type = run_type;

    const [runs, total] = await Promise.all([
      MrpRun.find(filter)
        .select('-mrp_lines')
        .populate('triggered_by', 'name email')
        .sort({ run_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      MrpRun.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: runs.map(r => ({
        ...r,
        pr_count: r.pr_generated ? r.pr_generated.length : 0,
        wo_count: r.wo_generated ? r.wo_generated.length : 0,
      })),
      pagination: {
        total,
        page:    parseInt(page),
        limit:   parseInt(limit),
        pages:   Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[MRP] listMrpRuns:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mrp/runs/:id
// Full run result with all MRP lines
// ─────────────────────────────────────────────────────────────────────────────
exports.getMrpRunById = async (req, res) => {
  try {
    const run = await MrpRun.findById(req.params.id)
      .populate('triggered_by', 'name email')
      .populate('so_ids_considered', 'so_number customer_name grand_total status')
      .populate('pr_generated', 'requisition_no status')
      .populate('wo_generated', 'wo_number part_no status planned_qty')
      .lean();

    if (!run) {
      return res.status(404).json({ success: false, message: 'MRP Run not found' });
    }

    return res.json({
      success: true,
      data: {
        ...run,
        pr_count:   (run.pr_generated || []).length,
        wo_count:   (run.wo_generated || []).length,
        lines_count: (run.mrp_lines || []).length,
      },
    });
  } catch (err) {
    console.error('[MRP] getMrpRunById:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mrp/runs/:id/status
// Poll async job status
// ─────────────────────────────────────────────────────────────────────────────
exports.getMrpRunStatus = async (req, res) => {
  try {
    const run = await MrpRun.findById(req.params.id)
      .select('mrp_run_id status job_id completed_at pr_generated wo_generated log run_type run_date')
      .lean();

    if (!run) {
      return res.status(404).json({ success: false, message: 'MRP Run not found' });
    }

    let queueStatus = null;
    if (run.job_id) {
      try {
        queueStatus = await getJobStatus(run.job_id);
      } catch (err) {
        // Redis might be down — don't crash the request
        console.warn('[MRP] getJobStatus failed (Redis unreachable):', err.message);
      }
    }

    return res.json({
      success: true,
      data: {
        _id:          run._id,
        mrp_run_id:   run.mrp_run_id,
        status:       run.status,
        run_type:     run.run_type,
        run_date:     run.run_date,
        completed_at: run.completed_at,
        pr_count:     (run.pr_generated || []).length,
        wo_count:     (run.wo_generated || []).length,
        queue_status: queueStatus,
        log_tail:     run.log ? run.log.split('\n').slice(-10).join('\n') : '',
      },
    });
  } catch (err) {
    console.error('[MRP] getMrpRunStatus:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/mrp/runs/:id
// Delete an MRP run (only if status is 'Completed' or 'Failed')
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteMrpRun = async (req, res) => {
  try {
    const run = await MrpRun.findById(req.params.id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        message: 'MRP Run not found' 
      });
    }

    if (run.status === 'Running' || run.status === 'Queued') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete MRP run with status '${run.status}'. Please wait for completion or cancel the job first.` 
      });
    }

    if (run.pr_generated && run.pr_generated.length > 0) {
      const PurchaseRequisition = mongoose.model('PurchaseRequisition');
      const prs = await PurchaseRequisition.find({
        _id: { $in: run.pr_generated },
        status: { $in: ['Approved', 'Ordered', 'Partially Received'] }
      });
      
      if (prs.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete MRP run because ${prs.length} Purchase Requisition(s) from this run are already in approved/ordered status.`
        });
      }
    }

    if (run.wo_generated && run.wo_generated.length > 0) {
      const WorkOrder = mongoose.model('WorkOrder');
      const wos = await WorkOrder.find({
        _id: { $in: run.wo_generated },
        status: { $in: ['Released', 'In Progress', 'Completed'] }
      });
      
      if (wos.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete MRP run because ${wos.length} Work Order(s) from this run are already in progress/completed.`
        });
      }
    }

    await run.deleteOne();

    console.log(`[MRP] MRP run ${run.mrp_run_id} (${run._id}) deleted by user ${req.user._id}`);

    return res.json({
      success: true,
      message: `MRP run ${run.mrp_run_id} deleted successfully`,
      data: {
        _id: run._id,
        mrp_run_id: run.mrp_run_id,
        deleted_at: new Date().toISOString(),
        deleted_by: req.user._id
      }
    });
  } catch (err) {
    console.error('[MRP] deleteMrpRun:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};