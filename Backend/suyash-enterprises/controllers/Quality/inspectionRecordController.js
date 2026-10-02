// controllers/Quality/inspectionRecordController.js
const InspectionRecord = require('../../models/Quality/InspectionRecord');
const mongoose = require('mongoose');
const InspectionPlan = require('../../models/Quality/InspectionPlan');
const WorkOrder = require('../../models/Production/WorkOrder');
const { validateGaugeCalibration } = require('../../middleware/Quality/calibrationGate');
const {
  computeOverallResult,
  enrichCheckpointResult,
  handleFAIGate,
  handleFinalGate,
} = require('../../services/Quality/inspectionResultService');
const { addSpcSubgroup } = require('../../services/Quality/spcService');

// ======================================================
// CREATE INSPECTION RECORD (with Calibration Gate)
// ======================================================
const createInspectionRecord = async (req, res) => {
  try {
    const {
      plan_id,
      inspection_type,
      item_id,
      part_no,
      lot_size,
      sample_size,
      inspector_id,
      grn_id,
      wo_id,
      op_sequence,
      vendor_id,
      customer_id,
      drawing_no,
      drawing_revision,
    } = req.body;

    // Required field validation
    if (!inspection_type || !item_id || !part_no || !lot_size || !sample_size || !inspector_id) {
      return res.status(400).json({
        success: false,
        message: 'inspection_type, item_id, part_no, lot_size, sample_size and inspector_id are required',
      });
    }

    // Type-specific validations
    if (inspection_type === 'Incoming' && !grn_id) {
      return res.status(400).json({ success: false, message: 'grn_id is required for Incoming inspection' });
    }
    if (['In-Process', 'Final', 'First Article'].includes(inspection_type) && !wo_id) {
      return res.status(400).json({ success: false, message: 'wo_id is required for this inspection type' });
    }

    // ==============================================
    // CALIBRATION GATE - HARD BLOCK
    // ==============================================
    if (plan_id) {
      try {
        await validateGaugeCalibration(plan_id);
      } catch (gateError) {
        return res.status(gateError.status || 400).json({
          success: false,
          message: gateError.message,
          overdueGauges: gateError.overdueGauges || [],
        });
      }
    }

    const record = new InspectionRecord({
      inspection_type,
      item_id,
      part_no,
      lot_size,
      sample_size,
      inspector_id,
      plan_id,
      grn_id,
      wo_id,
      op_sequence,
      vendor_id,
      customer_id,
      drawing_no,
      drawing_revision,
      overall_result: 'Pending',
    });

    await record.save();
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// SAVE CHECKPOINT RESULTS (with SPC integration)
// ======================================================
const saveCheckpointResults = async (req, res) => {
  try {
    const record = await InspectionRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    
    // ✅ ALLOW BOTH Pending AND Partially Completed
    if (record.overall_result !== 'Pending' && record.overall_result !== 'Partially Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot update results. Inspection is already ${record.overall_result}`,
      });
    }

    // Fetch plan checkpoints
    let planCheckpoints = [];
    if (record.plan_id) {
      const plan = await InspectionPlan.findById(record.plan_id).lean();
      planCheckpoints = plan?.checkpoints || [];
    }

    const rawResults = req.body.checkpoint_results || [];
    if (rawResults.length === 0) {
      return res.status(400).json({ success: false, message: 'checkpoint_results array is empty' });
    }

    // Enrich each result with computed fields
    const enriched = rawResults.map(cp => {
      const planCp = planCheckpoints.find(p => p.sequence === cp.checkpoint_seq) || {};
      const usl = cp.usl ?? (planCp.nominal_value != null ? planCp.nominal_value + (planCp.upper_tolerance ?? 0) : undefined);
      const lsl = cp.lsl ?? (planCp.nominal_value != null ? planCp.nominal_value - (planCp.lower_tolerance ?? 0) : undefined);
      return enrichCheckpointResult({
        ...cp,
        is_critical: planCp.is_critical || false,
        usl,
        lsl,
      });
    });

    record.checkpoint_results = enriched;

    // ✅ UPDATE STATUS TO "Partially Completed" (if results exist and status is Pending)
    if (record.checkpoint_results.length > 0 && record.overall_result === 'Pending') {
      record.overall_result = 'Partially Completed';
    }

    // SPC: Push readings for checkpoints marked is_spc
    const spcAlerts = [];
    for (const cp of enriched) {
      const planCp = planCheckpoints.find(p => p.sequence === cp.checkpoint_seq);
      if (planCp?.is_spc && cp.readings?.length > 0) {
        const { oocAlert } = await addSpcSubgroup({
          item_id: record.item_id,
          plan_id: record.plan_id,
          checkpoint_seq: cp.checkpoint_seq,
          characteristic: cp.characteristic,
          control_chart_type: planCp.control_chart_type || 'X-bar R',
          usl: cp.usl,
          lsl: cp.lsl,
          target: planCp.nominal_value,
          subgroup_size: planCp.subgroup_size || cp.readings.length,
          readings: cp.readings,
          inspection_record_id: record._id,
        });
        if (oocAlert) spcAlerts.push(oocAlert);
      }
    }

    await record.save();
    return res.json({
      success: true,
      data: record,
      spc_alerts: spcAlerts,
      spc_alert_count: spcAlerts.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ======================================================
// COMPLETE INSPECTION (with FAI and Final gates)
// ======================================================
const completeInspection = async (req, res) => {
  try {
    const record = await InspectionRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

       // Only allow completion from Pending or Partially Completed
if (record.overall_result !== 'Pending' && record.overall_result !== 'Partially Completed') {
  return res.status(400).json({ 
    success: false, 
    message: `Cannot complete inspection. Current status: ${record.overall_result}` 
  });
}
    if (!record.checkpoint_results || record.checkpoint_results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No checkpoint results saved. Save results before completing.',
      });
    }

    const { accepted_qty, rejected_qty, rework_qty, on_hold_qty, disposition } = req.body;

    // Fetch plan to get critical flags
    let planCheckpoints = [];
    if (record.plan_id) {
      const plan = await InspectionPlan.findById(record.plan_id).lean();
      planCheckpoints = plan?.checkpoints || [];
    }

    const resultsWithCritical = record.checkpoint_results.map(cp => {
      const planCp = planCheckpoints.find(p => p.sequence === cp.checkpoint_seq);
      return { ...cp.toObject(), is_critical: planCp?.is_critical || false };
    });

    const overall_result = computeOverallResult(resultsWithCritical);

    record.overall_result = overall_result;
    if (accepted_qty !== undefined) record.accepted_qty = accepted_qty;
    if (rejected_qty !== undefined) record.rejected_qty = rejected_qty;
    if (rework_qty !== undefined) record.rework_qty = rework_qty;
    if (on_hold_qty !== undefined) record.on_hold_qty = on_hold_qty;
    if (disposition) record.disposition = disposition;

    // ==============================================
    // FAI GATE: Unlock bulk production
    // ==============================================
    if (record.inspection_type === 'First Article' && record.wo_id && record.op_sequence != null) {
      await handleFAIGate(record.wo_id, record.op_sequence, overall_result);
    }

    // ==============================================
    // FINAL GATE: Unlock WO completion
    // ==============================================
    if (record.inspection_type === 'Final' && record.wo_id) {
      await handleFinalGate(record.wo_id, overall_result);
    }

    await record.save();
    return res.json({
      success: true,
      data: record,
      overall_result,
      message: `Inspection completed with result: ${overall_result}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET ALL INSPECTION RECORDS (with filters, pagination, sorting)
// ======================================================
// ======================================================
// GET ALL INSPECTION RECORDS (with filters, pagination, sorting)
// ======================================================
const getAllInspectionRecords = async (req, res) => {
  try {
    // 1. PAGINATION PARAMETERS
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 2. BUILD FILTER
    const filter = {};

    if (req.query.inspection_type) {
      filter.inspection_type = req.query.inspection_type;
    }
    if (req.query.overall_result) {
      filter.overall_result = req.query.overall_result;
    }
    if (req.query.item_id) {
      filter.item_id = req.query.item_id;
    }
    if (req.query.wo_id) {
      filter.wo_id = req.query.wo_id;
    }
    if (req.query.grn_id) {
      filter.grn_id = req.query.grn_id;
    }
    if (req.query.vendor_id) {
      filter.vendor_id = req.query.vendor_id;
    }
    if (req.query.customer_id) {
      filter.customer_id = req.query.customer_id;
    }
    if (req.query.inspector_id) {
      filter.inspector_id = req.query.inspector_id;
    }

    // NEW: Search filter - searches across inspection_id, part_no, and drawing_no
    if (req.query.search) {
      filter.$or = [
        { inspection_id: { $regex: req.query.search, $options: 'i' } },
        { part_no: { $regex: req.query.search, $options: 'i' } },
        { drawing_no: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (req.query.from_date || req.query.to_date) {
      filter.inspection_date = {};
      if (req.query.from_date) {
        filter.inspection_date.$gte = new Date(req.query.from_date);
      }
      if (req.query.to_date) {
        filter.inspection_date.$lte = new Date(req.query.to_date);
      }
    }

    // 3. SORTING
    const sort_by = req.query.sort_by || 'inspection_date';
    const sort_order = req.query.sort_order === 'asc' ? 1 : -1;
    const sort = {};
    sort[sort_by] = sort_order;

    // 4. EXECUTE QUERIES
    const [records, total] = await Promise.all([
      InspectionRecord.find(filter)
        .populate('plan_id', 'plan_id plan_name plan_type')
        .populate('item_id', 'part_no item_name')
        .populate('inspector_id', 'name employee_code FirstName LastName')
        .populate('wo_id', 'wo_number status')
        .populate('grn_id', 'grn_number grn_date')
        .populate('vendor_id', 'vendor_name vendor_code')
        .populate('customer_id', 'company_name')
        .populate('ncr_id', 'ncr_number severity status')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Add .lean() for better performance
      InspectionRecord.countDocuments(filter)
    ]);

    // 5. PAGINATION METADATA
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 6. SUMMARY STATISTICS - FIXED VERSION with error handling
    let summary = {
      total_accepted: 0,
      total_rejected: 0,
      total_conditionally_accepted: 0,
      total_pending: 0,
      total_partially_completed: 0,
      total_qty_inspected: 0,
      total_accepted_qty: 0,
      total_rejected_qty: 0
    };

    // Only run aggregation if total > 0 to avoid aggregation errors on empty collections
    if (total > 0) {
      try {
        const aggregationResult = await InspectionRecord.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              total_accepted: {
                $sum: { $cond: [{ $eq: ['$overall_result', 'Accepted'] }, 1, 0] }
              },
              total_rejected: {
                $sum: { $cond: [{ $eq: ['$overall_result', 'Rejected'] }, 1, 0] }
              },
              total_conditionally_accepted: {
                $sum: { $cond: [{ $eq: ['$overall_result', 'Conditionally Accepted'] }, 1, 0] }
              },
              total_pending: {
                $sum: { $cond: [{ $eq: ['$overall_result', 'Pending'] }, 1, 0] }
              },
              total_partially_completed: {
                $sum: { $cond: [{ $eq: ['$overall_result', 'Partially Completed'] }, 1, 0] }
              },
              total_qty_inspected: { $sum: '$sample_size' },
              total_accepted_qty: { $sum: { $ifNull: ['$accepted_qty', 0] } },
              total_rejected_qty: { $sum: { $ifNull: ['$rejected_qty', 0] } }
            }
          }
        ]);
        
        if (aggregationResult && aggregationResult.length > 0 && aggregationResult[0]) {
          summary = aggregationResult[0];
        }
      } catch (aggError) {
        console.error('Aggregation failed, using default summary:', aggError.message);
        // Keep default summary values
      }
    }

    // Transform records to ensure consistent structure for frontend
    const transformedRecords = records.map(record => {
      // Ensure all numeric fields are numbers
      return {
        ...record,
        accepted_qty: record.accepted_qty || 0,
        rejected_qty: record.rejected_qty || 0,
        rework_qty: record.rework_qty || 0,
        on_hold_qty: record.on_hold_qty || 0,
        lot_size: record.lot_size || 0,
        sample_size: record.sample_size || 0,
        checkpoint_results: record.checkpoint_results || [],
        attachments: record.attachments || []
      };
    });

    // 7. RESPONSE
    return res.json({
      success: true,
      count: records.length,
      total: total,
      data: transformedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, total)
      },
      filters: {
        inspection_type: req.query.inspection_type || null,
        overall_result: req.query.overall_result || null,
        item_id: req.query.item_id || null,
        wo_id: req.query.wo_id || null,
        grn_id: req.query.grn_id || null,
        search: req.query.search || null,
        from_date: req.query.from_date || null,
        to_date: req.query.to_date || null,
        sort_by,
        sort_order: req.query.sort_order || 'desc'
      },
      summary: summary
    });
  } catch (err) {
    console.error('[GET /all] Error:', err);
    // Send a proper error response that won't break the frontend
    return res.status(500).json({ 
      success: false, 
      message: err.message,
      data: [],
      total: 0,
      count: 0,
      summary: {
        total_accepted: 0,
        total_rejected: 0,
        total_conditionally_accepted: 0,
        total_pending: 0,
        total_partially_completed: 0,
        total_qty_inspected: 0,
        total_accepted_qty: 0,
        total_rejected_qty: 0
      }
    });
  }
};

// ======================================================
// START BULK PRODUCTION (after FAI passes)
// ======================================================
const startBulkProduction = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.params.woId);
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const seq = parseInt(req.params.seq);
    const operation = wo.operations?.find(op => op.op_sequence === seq);
    if (!operation) {
      return res.status(404).json({ success: false, message: 'Operation not found on this work order' });
    }

    // CRITICAL GATE: FAI must be approved
    if (!operation.first_article_approved) {
      return res.status(400).json({
        success: false,
        message: 'FAI not approved — bulk production cannot start until First Article Inspection passes for this operation',
      });
    }

    if (operation.bulk_started) {
      return res.status(400).json({ success: false, message: 'Bulk production is already started for this operation' });
    }

    await WorkOrder.findByIdAndUpdate(
      req.params.woId,
      {
        $set: {
          'operations.$[op].bulk_started': true,
          'operations.$[op].bulk_start_time': new Date(),
        },
      },
      { arrayFilters: [{ 'op.op_sequence': seq }] }
    );

    return res.json({ success: true, message: 'Bulk production started successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET RECORDS BY WORK ORDER
// ======================================================
const getRecordsByWO = async (req, res) => {
  try {
    const records = await InspectionRecord.find({ wo_id: req.params.wo_id })
      .populate('inspector_id', 'name employee_code')
      .populate('plan_id', 'plan_id plan_name')
      .sort({ inspection_date: -1 });
    return res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET RECORDS BY GRN
// ======================================================
const getRecordsByGRN = async (req, res) => {
  try {
    const records = await InspectionRecord.find({
      grn_id: req.params.grn_id,
      inspection_type: 'Incoming',
    })
      .populate('inspector_id', 'name employee_code')
      .sort({ inspection_date: -1 });
    return res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GET RECORD BY ID
// ======================================================
const getRecordById = async (req, res) => {
  try {
    const record = await InspectionRecord.findById(req.params.id)
      .populate('plan_id', 'plan_id plan_name checkpoints')
      .populate('item_id', 'part_no item_name')
      .populate('inspector_id', 'name employee_code')
      .populate('reviewed_by', 'name')
      .populate('wo_id', 'wo_number')
      .populate('grn_id', 'grn_number');
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// GENERATE INSPECTION REPORT PDF
// ======================================================
const generateInspectionReport = async (req, res) => {
  try {
    const record = await InspectionRecord.findById(req.params.id)
      .populate('plan_id', 'plan_name plan_id')
      .populate('inspector_id', 'name employee_code')
      .populate('item_id', 'part_no item_name');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Return JSON for frontend PDF generation
    return res.json({
      success: true,
      data: {
        inspection_id: record.inspection_id,
        inspection_date: record.inspection_date,
        inspection_type: record.inspection_type,
        part_no: record.part_no,
        part_name: record.item_id?.item_name || '',
        lot_size: record.lot_size,
        sample_size: record.sample_size,
        accepted_qty: record.accepted_qty,
        rejected_qty: record.rejected_qty,
        overall_result: record.overall_result,
        inspector_name: record.inspector_id?.name || '',
        checkpoint_results: record.checkpoint_results,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createInspectionRecord,
  saveCheckpointResults,
  completeInspection,
  startBulkProduction,
  getRecordsByWO,
  getRecordsByGRN,
  getRecordById,
  generateInspectionReport,
  getAllInspectionRecords, 
};