// controllers/Inventory/psvController.js
'use strict';

const mongoose = require('mongoose');
const PhysicalStockVerification = require('../../models/Inventory/PhysicalVerification');

// ======================================================
// INITIATE PHYSICAL VERIFICATION
// POST /api/physical-verifications
// ======================================================
exports.initiateVerification = async (req, res) => {
  try {
    const {
      warehouse_id,
      verification_type,
      conducted_by,
      witness,
      variance_threshold_percent,
      variance_threshold_amount,
      remarks
    } = req.body;

    // Validation
    if (!warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'warehouse_id is required'
      });
    }

    if (!verification_type) {
      return res.status(400).json({
        success: false,
        message: 'verification_type is required'
      });
    }

    // Check for active PSV in same warehouse
    const existingActivePSV = await PhysicalStockVerification.findOne({
      warehouse_id: warehouse_id,
      status: { $in: ['Initiated', 'In Progress', 'Count Completed', 'Under Review'] }
    });

    if (existingActivePSV) {
      return res.status(400).json({
        success: false,
        message: `Active verification already exists for this warehouse: ${existingActivePSV.verification_id}`,
        error: 'ACTIVE_PSV_EXISTS'
      });
    }

    const psv = await PhysicalStockVerification.initiateVerification({
      warehouse_id,
      verification_type,
      conducted_by,
      witness: witness || null,
      variance_threshold_percent,
      variance_threshold_amount,
      remarks
    }, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Physical verification initiated',
      data: {
        verification_id: psv.verification_id,
        warehouse_name: psv.warehouse_name,
        total_items: psv.items.length,
        freeze_datetime: psv.freeze_datetime,
        status: psv.status,
        next_step: 'POST /api/physical-verifications/:id/counts to enter physical counts'
      }
    });

  } catch (error) {
    console.error('[PSV] initiateVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate verification',
      error: error.message
    });
  }
};

// ======================================================
// ENTER PHYSICAL COUNTS
// PUT /api/physical-verifications/:id/counts
// ======================================================
exports.enterCounts = async (req, res) => {
  try {
    const { id } = req.params;
    const { counts } = req.body;

    if (!counts || !Array.isArray(counts) || counts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'counts array is required'
      });
    }

    const psv = await PhysicalStockVerification.findById(id);
    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    if (psv.status !== 'Initiated' && psv.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot enter counts. PSV is in status: ${psv.status}`
      });
    }

    await PhysicalStockVerification.updateCount(id, counts, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Counts entered successfully',
      data: {
        verification_id: psv.verification_id,
        total_items_counted: psv.total_items_counted,
        total_items: psv.items.length,
        completion_percentage: psv.completion_percentage
      }
    });

  } catch (error) {
    console.error('[PSV] enterCounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enter counts',
      error: error.message
    });
  }
};

// ======================================================
// ENTER SECOND COUNTS (for high variance items)
// PUT /api/physical-verifications/:id/second-counts
// ======================================================
exports.enterSecondCounts = async (req, res) => {
  try {
    const { id } = req.params;
    const { counts } = req.body;

    if (!counts || !Array.isArray(counts) || counts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'counts array is required'
      });
    }

    const psv = await PhysicalStockVerification.findById(id);
    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    if (psv.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot enter second counts. PSV is in status: ${psv.status}`
      });
    }

    // Mark counts as second count
    const secondCounts = counts.map(c => ({
      ...c,
      is_second_count: true
    }));

    await PhysicalStockVerification.updateCount(id, secondCounts, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Second counts entered successfully'
    });

  } catch (error) {
    console.error('[PSV] enterSecondCounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enter second counts',
      error: error.message
    });
  }
};

// ======================================================
// COMPLETE COUNTING (calculate final variances)
// POST /api/physical-verifications/:id/complete
// ======================================================
exports.completeCounting = async (req, res) => {
  try {
    const { id } = req.params;
    const { third_counts } = req.body;

    const psv = await PhysicalStockVerification.findById(id);
    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    if (psv.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete counting. PSV is in status: ${psv.status}`
      });
    }

    // Handle third counts if provided
    if (third_counts && third_counts.length > 0) {
      for (const thirdCount of third_counts) {
        const item = psv.items.id(thirdCount.item_id);
        if (item && item.final_qty === null) {
          item.third_count_qty = thirdCount.counted_qty;
          item.final_qty = thirdCount.counted_qty;
        }
      }
    }

    await PhysicalStockVerification.completeCounting(id, req.user._id);

    // Get items with significant variance for reporting
    const highVarianceItems = psv.items.filter(i => 
      Math.abs(i.variance_value) > 5000 || Math.abs(i.variance_pct) > 10
    );

    res.status(200).json({
      success: true,
      message: 'Counting completed. Variances calculated.',
      data: {
        verification_id: psv.verification_id,
        total_variance_value: psv.total_variance_value,
        net_variance_value: psv.net_variance_value,
        items_with_variance: psv.items_with_variance,
        high_variance_items: highVarianceItems.map(i => ({
          part_no: i.part_no,
          system_qty: i.system_qty,
          final_qty: i.final_qty,
          variance: i.variance,
          variance_value: i.variance_value,
          variance_pct: i.variance_pct
        })),
        status: 'Count Completed',
        next_step: 'Investigate variances, then POST /api/physical-verifications/:id/approve'
      }
    });

  } catch (error) {
    console.error('[PSV] completeCounting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete counting',
      error: error.message
    });
  }
};

// ======================================================
// UPDATE VARIANCE REASONS
// PUT /api/physical-verifications/:id/items/:itemId/reason
// ======================================================
exports.updateVarianceReason = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { variance_reason, action } = req.body;

    const psv = await PhysicalStockVerification.findById(id);
    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    const item = psv.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in PSV'
      });
    }

    item.variance_reason = variance_reason;
    if (action) item.action = action;

    await psv.save();

    res.status(200).json({
      success: true,
      message: 'Variance reason updated',
      data: {
        part_no: item.part_no,
        variance: item.variance,
        variance_reason: item.variance_reason,
        action: item.action
      }
    });

  } catch (error) {
    console.error('[PSV] updateVarianceReason:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variance reason',
      error: error.message
    });
  }
};

// ======================================================
// APPROVE VERIFICATION & POST ADJUSTMENTS
// POST /api/physical-verifications/:id/approve
// ======================================================
exports.approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_by, remarks, items } = req.body;

    if (!approved_by) {
      return res.status(400).json({
        success: false,
        message: 'approved_by is required'
      });
    }

    const psv = await PhysicalStockVerification.findById(id);
    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    if (psv.status !== 'Count Completed' && psv.status !== 'Under Review') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve. PSV is in status: ${psv.status}`
      });
    }

    // Update status to Under Review if needed
    if (psv.status === 'Count Completed') {
      psv.status = 'Under Review';
      await psv.save();
    }

    const result = await PhysicalStockVerification.approveAndAdjust(id, {
      approved_by,
      remarks,
      items
    }, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Verification approved and adjustments posted',
      data: {
        verification_id: result.verification_id,
        adjustment_txns: result.adjustment_txn_ids.length,
        total_variance_adjusted: result.total_variance_value,
        net_variance_adjusted: result.net_variance_value,
        status: result.status,
        next_step: 'POST /api/physical-verifications/:id/close to close verification'
      }
    });

  } catch (error) {
    console.error('[PSV] approveVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification',
      error: error.message
    });
  }
};

// ======================================================
// CLOSE VERIFICATION
// POST /api/physical-verifications/:id/close
// ======================================================
exports.closeVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const psv = await PhysicalStockVerification.findById(id);
    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    if (psv.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot close. PSV must be approved first. Current status: ${psv.status}`
      });
    }

    await PhysicalStockVerification.closeVerification(id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Physical verification closed',
      data: {
        verification_id: psv.verification_id,
        status: 'Closed',
        closed_at: new Date()
      }
    });

  } catch (error) {
    console.error('[PSV] closeVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close verification',
      error: error.message
    });
  }
};

// ======================================================
// GET PSV BY ID
// GET /api/physical-verifications/:id
// ======================================================
exports.getVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const psv = await PhysicalStockVerification.findById(id)
      .populate('warehouse_id', 'warehouse_id warehouse_name location')
      .populate('conducted_by', 'FirstName LastName EmployeeID')
      .populate('second_count_by', 'FirstName LastName EmployeeID')
      .populate('witness', 'FirstName LastName EmployeeID')
      .populate('approved_by', 'name email')
      .populate('created_by', 'name email');

    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    res.status(200).json({
      success: true,
      data: psv
    });

  } catch (error) {
    console.error('[PSV] getVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification',
      error: error.message
    });
  }
};
// ======================================================
// LIST ALL VERIFICATIONS
// GET /api/physical-verifications
// ======================================================
exports.listVerifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      verification_type,
      warehouse_id,
      from_date,
      to_date
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (verification_type) filter.verification_type = verification_type;
    if (warehouse_id) filter.warehouse_id = warehouse_id;
    
    if (from_date || to_date) {
      filter.verification_date = {};
      if (from_date) filter.verification_date.$gte = new Date(from_date);
      if (to_date) filter.verification_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    const [verifications, total] = await Promise.all([
      PhysicalStockVerification.find(filter)
        .populate({
          path: 'warehouse_id',
          select: 'warehouse_id warehouse_name',
          // Add this to handle missing warehouse documents
          justOne: false
        })
        .populate('conducted_by', 'name employee_id')
        .populate('approved_by', 'name')
        .sort({ verification_date: -1 })
        .skip(skip)
        .limit(lim)
        .lean(), // Use lean() to avoid Mongoose document conversion issues
      PhysicalStockVerification.countDocuments(filter)
    ]);

    // Clean up any null warehouse_id references
    const cleanedVerifications = verifications.map(v => ({
      ...v,
      warehouse_id: v.warehouse_id || null
    }));

    res.status(200).json({
      success: true,
      data: cleanedVerifications,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total,
        pages: Math.ceil(total / lim)
      }
    });

  } catch (error) {
    console.error('[PSV] listVerifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verifications',
      error: error.message
    });
  }
};

// ======================================================
// GENERATE PSV REPORT
// GET /api/physical-verifications/:id/report
// ======================================================
exports.generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const psv = await PhysicalStockVerification.findById(id)
      .populate('warehouse_id', 'warehouse_id warehouse_name location')
      .populate('conducted_by', 'name employee_id')
      .populate('second_count_by', 'name employee_id')
      .populate('witness', 'name employee_id')
      .populate('approved_by', 'name email')
      .populate('created_by', 'name email');

    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    // Categorize variances
    const varianceCategories = {
      surplus: [],
      shortage: [],
      zero_variance: []
    };

    psv.items.forEach(item => {
      if (item.variance > 0) {
        varianceCategories.surplus.push(item);
      } else if (item.variance < 0) {
        varianceCategories.shortage.push(item);
      } else {
        varianceCategories.zero_variance.push(item);
      }
    });

    const report = {
      header: {
        verification_id: psv.verification_id,
        verification_date: psv.verification_date,
        warehouse_name: psv.warehouse_name,
        verification_type: psv.verification_type,
        freeze_datetime: psv.freeze_datetime
      },
      personnel: {
        conducted_by: psv.conducted_by,
        second_count_by: psv.second_count_by,
        witness: psv.witness,
        approved_by: psv.approved_by,
        approved_at: psv.approved_at
      },
      summary: {
        total_items: psv.items.length,
        total_items_counted: psv.total_items_counted,
        items_with_variance: psv.items_with_variance,
        total_variance_value: psv.total_variance_value,
        net_variance_value: psv.net_variance_value,
        surplus_items: varianceCategories.surplus.length,
        shortage_items: varianceCategories.shortage.length,
        zero_variance_items: varianceCategories.zero_variance.length
      },
      variances: {
        surplus: varianceCategories.surplus.map(i => ({
          part_no: i.part_no,
          system_qty: i.system_qty,
          counted_qty: i.counted_qty,
          final_qty: i.final_qty,
          variance: i.variance,
          variance_value: i.variance_value,
          variance_pct: i.variance_pct,
          reason: i.variance_reason,
          action: i.action
        })),
        shortage: varianceCategories.shortage.map(i => ({
          part_no: i.part_no,
          system_qty: i.system_qty,
          counted_qty: i.counted_qty,
          final_qty: i.final_qty,
          variance: i.variance,
          variance_value: i.variance_value,
          variance_pct: i.variance_pct,
          reason: i.variance_reason,
          action: i.action
        }))
      },
      adjustments: {
        total_adjustments: psv.adjustment_txn_ids.length,
        status: psv.status
      },
      remarks: psv.remarks,
      approval_remarks: psv.approval_remarks
    };

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('[PSV] generateReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// ======================================================
// GET ACTIVE VERIFICATION FOR WAREHOUSE
// GET /api/physical-verifications/active/:warehouse_id
// ======================================================
exports.getActiveVerification = async (req, res) => {
  try {
    const { warehouse_id } = req.params;

    const activePSV = await PhysicalStockVerification.findOne({
      warehouse_id: warehouse_id,
      status: { $in: ['Initiated', 'In Progress', 'Count Completed', 'Under Review'] }
    }).populate('warehouse_id', 'warehouse_id warehouse_name');

    if (!activePSV) {
      return res.status(404).json({
        success: false,
        message: 'No active verification found for this warehouse'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        verification_id: activePSV.verification_id,
        status: activePSV.status,
        verification_type: activePSV.verification_type,
        freeze_datetime: activePSV.freeze_datetime,
        total_items: activePSV.items.length,
        total_items_counted: activePSV.total_items_counted,
        completion_percentage: activePSV.completion_percentage
      }
    });

  } catch (error) {
    console.error('[PSV] getActiveVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active verification',
      error: error.message
    });
  }
};

// ======================================================
// DELETE PHYSICAL STOCK VERIFICATION
// DELETE /api/physical-verifications/:id
// ======================================================

exports.deleteVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const psv = await PhysicalStockVerification.findById(id);

    if (!psv) {
      return res.status(404).json({
        success: false,
        message: 'PSV not found'
      });
    }

    // Do not allow deletion of completed/approved/closed PSV
    if (['Count Completed', 'Under Review', 'Approved', 'Closed'].includes(psv.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete PSV in status: ${psv.status}`
      });
    }

    await PhysicalStockVerification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Physical verification deleted successfully'
    });

  } catch (error) {
    console.error('[PSV] deleteVerification:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete verification',
      error: error.message
    });
  }
};