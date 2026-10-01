'use strict';
const mongoose = require('mongoose');
const NCR = require('../../models/Quality/NCR');
const CAPA = require('../../models/Quality/CAPA');
const GRN = require('../../models/Procurement/GRN');
const WorkOrder = require('../../models/Production/WorkOrder').WorkOrder;
const PurchaseOrder = require('../../models/Procurement/PurchaseOrder');
const Vendor = require('../../models/CRM/Vendor');

// ======================================================
// CREATE NCR
// POST /api/ncrs
// ======================================================
exports.createNCR = async (req, res) => {
  try {
    const {
      ncr_type, severity,
      source_inspection_id,
      item_id, part_no, drawing_no, drawing_revision,
      quantity, quantity_unit, lot_no,
      wo_id, grn_id, po_id, vendor_id, customer_id,
      defect_codes, defect_description,
      detected_at_operation, immediate_action,
      rejected_qty, estimated_loss
    } = req.body;

    // Resolve part_no from Item if not provided
    let finalPartNo = part_no;
    if (item_id && !finalPartNo) {
      const Item = require('../../models/CRM/Item');
      const item = await Item.findById(item_id);
      if (item) finalPartNo = item.part_no;
    }

    // Resolve vendor from GRN if not provided
    let finalVendorId = vendor_id;
    if (grn_id && !finalVendorId) {
      const grn = await GRN.findById(grn_id);
      if (grn?.vendor_id) finalVendorId = grn.vendor_id;
    }

    const ncr = new NCR({
      ncr_date: new Date(),
      ncr_type,
      severity,
      source_inspection_id: source_inspection_id || null,
      item_id,
      part_no: finalPartNo,
      drawing_no: drawing_no || '',
      drawing_revision: drawing_revision || '',
      quantity,
      quantity_unit: quantity_unit || 'Nos',
      rejected_qty: rejected_qty || quantity, // Default to full quantity
      lot_no: lot_no || '',
      wo_id: wo_id || null,
      grn_id: grn_id || null,
      po_id: po_id || null,
      vendor_id: finalVendorId || null,
      customer_id: customer_id || null,
      defect_codes: defect_codes || [],
      defect_description,
      detected_at_operation: detected_at_operation || '',
      detected_by: req.user._id,
      immediate_action: immediate_action || '',
      estimated_loss: estimated_loss || 0,
      actual_loss: 0,
      recovery_amount: 0,
      status: 'Open',
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await ncr.save();

    // Side-effects on source documents
    if (grn_id) {
      await GRN.findByIdAndUpdate(grn_id, { ncr_id: ncr._id, status: 'Rejected' });
    }
    if (wo_id) {
      await WorkOrder.findByIdAndUpdate(wo_id, {
        status: 'On Hold',
        hold_reason: `NCR ${ncr.ncr_number}: ${defect_description.substring(0, 100)}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'NCR created successfully',
      data: {
        _id: ncr._id,
        ncr_number: ncr.ncr_number,
        status: ncr.status,
        severity: ncr.severity,
        estimated_loss: ncr.estimated_loss
      },
    });

  } catch (error) {
    console.error('Create NCR error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ALL NCRs (with filters & statistics)
// GET /api/ncrs
// ======================================================
exports.getAllNCRs = async (req, res) => {
  try {
    const {
      status, severity, ncr_type, vendor_id, item_id, po_id, grn_id,
      systemic_failure, from_date, to_date,
      page = 1, limit = 20,
      sort_by = 'ncr_date', sort_order = 'desc',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (ncr_type) filter.ncr_type = ncr_type;
    if (vendor_id) filter.vendor_id = vendor_id;
    if (item_id) filter.item_id = item_id;
    if (po_id) filter.po_id = po_id;
    if (grn_id) filter.grn_id = grn_id;
    if (systemic_failure !== undefined) filter.systemic_failure = systemic_failure === 'true';
    if (from_date || to_date) {
      filter.ncr_date = {};
      if (from_date) filter.ncr_date.$gte = new Date(from_date);
      if (to_date) filter.ncr_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sort_by]: sort_order === 'asc' ? 1 : -1 };

    const [ncrs, total, stats] = await Promise.all([
      NCR.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('item_id', 'part_no part_name')
        .populate('vendor_id', 'vendor_name vendor_code')
        .populate('po_id', 'po_number po_date')
        .populate('grn_id', 'grn_number grn_date')
        .populate('capa_id', 'capa_id status')
        .populate('detected_by', 'Username Email'),
      NCR.countDocuments(filter),
      // Financial statistics
      NCR.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total_rejected_qty: { $sum: '$rejected_qty' },
            total_estimated_loss: { $sum: '$estimated_loss' },
            total_actual_loss: { $sum: '$actual_loss' },
            total_recovered: { $sum: '$recovery_amount' },
            open_count: { $sum: { $cond: [{ $ne: ['$status', 'Closed'] }, 1, 0] } },
            closed_count: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
          }
        }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: ncrs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      statistics: stats[0] || {
        total_rejected_qty: 0,
        total_estimated_loss: 0,
        total_actual_loss: 0,
        total_recovered: 0,
        open_count: 0,
        closed_count: 0
      }
    });

  } catch (error) {
    console.error('Get all NCRs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET NCR BY ID (Enhanced with all populations)
// GET /api/ncrs/:id
// ======================================================
exports.getNCRById = async (req, res) => {
  try {
    const ncr = await NCR.findById(req.params.id)
      .populate('item_id')
      .populate('vendor_id', 'vendor_name vendor_code email phone address')
      .populate('customer_id')
      .populate('wo_id', 'wo_number status')
      .populate('grn_id', 'grn_number grn_date receiving_store')
      .populate('po_id', 'po_number po_date')
      .populate('capa_id')
      .populate('source_inspection_id', 'inspection_id overall_result')
      .populate('disposition_approved_by', 'Username Email')
      .populate('closed_by', 'Username Email')
      .populate('detected_by', 'Username Email')
      .populate('created_by', 'Username Email')
      .populate('updated_by', 'Username Email')
      .populate('photo_evidence.uploaded_by', 'Username Email')
      .populate('immediate_actions.assigned_to', 'Username Email')
      .populate('immediate_actions.completed_by', 'Username Email')
      .populate('corrective_actions.assigned_to', 'Username Email')
      .populate('corrective_actions.completed_by', 'Username Email')
      .populate('preventive_actions.assigned_to', 'Username Email')
      .populate('preventive_actions.completed_by', 'Username Email')
      .lean(); // Convert to plain JavaScript object for safe manipulation

    if (!ncr) {
      return res.status(404).json({ success: false, message: 'NCR not found' });
    }

    // Safely ensure all array fields exist to prevent reduce errors
    if (!ncr.photo_evidence) ncr.photo_evidence = [];
    if (!ncr.defect_codes) ncr.defect_codes = [];
    if (!ncr.immediate_actions) ncr.immediate_actions = [];
    if (!ncr.corrective_actions) ncr.corrective_actions = [];
    if (!ncr.preventive_actions) ncr.preventive_actions = [];

    // Clean up any null/undefined values in arrays
    ncr.photo_evidence = ncr.photo_evidence.filter(photo => photo != null);
    ncr.defect_codes = ncr.defect_codes.filter(code => code != null);
    ncr.immediate_actions = ncr.immediate_actions.filter(action => action != null);
    ncr.corrective_actions = ncr.corrective_actions.filter(action => action != null);
    ncr.preventive_actions = ncr.preventive_actions.filter(action => action != null);

    // Ensure all nested populated fields are properly handled
    if (ncr.photo_evidence && ncr.photo_evidence.length > 0) {
      ncr.photo_evidence = ncr.photo_evidence.map(photo => ({
        ...photo,
        uploaded_by: photo.uploaded_by || null
      }));
    }

    // Safely handle reference fields that might be null
    const safePopulate = (field) => {
      if (ncr[field] === null || ncr[field] === undefined) return null;
      return ncr[field];
    };

    // Create a clean response object with safe defaults
    const responseData = {
      _id: ncr._id,
      ncr_number: ncr.ncr_number,
      ncr_date: ncr.ncr_date,
      ncr_type: ncr.ncr_type,
      severity: ncr.severity,
      source_inspection_id: safePopulate('source_inspection_id'),
      item_id: safePopulate('item_id'),
      part_no: ncr.part_no,
      drawing_no: ncr.drawing_no || '',
      drawing_revision: ncr.drawing_revision || '',
      quantity: ncr.quantity,
      quantity_unit: ncr.quantity_unit || 'Nos',
      rejected_qty: ncr.rejected_qty,
      lot_no: ncr.lot_no || '',
      wo_id: safePopulate('wo_id'),
      grn_id: safePopulate('grn_id'),
      po_id: safePopulate('po_id'),
      vendor_id: safePopulate('vendor_id'),
      customer_id: safePopulate('customer_id'),
      defect_codes: ncr.defect_codes,
      defect_description: ncr.defect_description,
      detected_at_operation: ncr.detected_at_operation || '',
      detected_by: safePopulate('detected_by'),
      photo_evidence: ncr.photo_evidence,
      immediate_action: ncr.immediate_action || '',
      disposition: ncr.disposition,
      disposition_basis: ncr.disposition_basis || '',
      concession_number: ncr.concession_number || '',
      customer_concession_no: ncr.customer_concession_no || '',
      disposition_approved_by: safePopulate('disposition_approved_by'),
      disposition_date: ncr.disposition_date,
      rework_job_card: ncr.rework_job_card,
      vendor_return_challan: ncr.vendor_return_challan || '',
      debit_note_id: ncr.debit_note_id,
      financial_impact: ncr.financial_impact || 0,
      root_cause_method: ncr.root_cause_method,
      root_cause: ncr.root_cause || '',
      escape_cause: ncr.escape_cause || '',
      systemic_failure: ncr.systemic_failure || false,
      capa_id: safePopulate('capa_id'),
      supplier_caution_letter: ncr.supplier_caution_letter || false,
      scl_number: ncr.scl_number || '',
      immediate_actions: ncr.immediate_actions,
      corrective_actions: ncr.corrective_actions,
      preventive_actions: ncr.preventive_actions,
      status: ncr.status,
      estimated_loss: ncr.estimated_loss || 0,
      actual_loss: ncr.actual_loss || 0,
      recovery_amount: ncr.recovery_amount || 0,
      closed_by: safePopulate('closed_by'),
      closed_at: ncr.closed_at,
      recurrence_check: ncr.recurrence_check || false,
      closure_remarks: ncr.closure_remarks || '',
      created_by: safePopulate('created_by'),
      updated_by: safePopulate('updated_by'),
      createdAt: ncr.createdAt,
      updatedAt: ncr.updatedAt
    };

    // Remove any undefined values
    Object.keys(responseData).forEach(key => {
      if (responseData[key] === undefined) {
        responseData[key] = null;
      }
    });

    return res.status(200).json({ 
      success: true, 
      data: responseData 
    });

  } catch (error) {
    console.error('Get NCR error:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error message to help debug
    let errorMessage = error.message;
    if (error.message.includes('reduce')) {
      errorMessage = 'Error processing NCR data. Please check array fields in the database.';
    }
    
    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ======================================================
// GET NCR BY GRN ID
// GET /api/ncrs/grn/:grnId
// ======================================================
exports.getNCRByGRNId = async (req, res) => {
  try {
    const { grnId } = req.params;

    const ncr = await NCR.findOne({ grn_id: grnId })
      .populate('grn_id', 'grn_number grn_date')
      .populate('po_id', 'po_number')
      .populate('vendor_id', 'vendor_name vendor_code email phone')
      .populate('item_id', 'part_no part_description')
      .populate('created_by', 'Username Email')
      .populate('closed_by', 'Username Email')
      .populate('disposition_approved_by', 'Username Email');

    if (!ncr) {
      return res.status(404).json({
        success: false,
        message: 'NCR not found for this GRN',
        error: 'NCR_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: ncr
    });

  } catch (error) {
    console.error('Get NCR by GRN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NCR',
      error: error.message
    });
  }
};

// ======================================================
// GET NCRs BY VENDOR
// GET /api/ncrs/vendor/:vendorId
// ======================================================
exports.getNCRsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, from_date, to_date, page = 1, limit = 20 } = req.query;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
        error: 'VENDOR_NOT_FOUND'
      });
    }

    let filter = { vendor_id: vendorId };
    if (status) filter.status = status;
    if (from_date || to_date) {
      filter.ncr_date = {};
      if (from_date) filter.ncr_date.$gte = new Date(from_date);
      if (to_date) filter.ncr_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ncrs, total, vendorStats] = await Promise.all([
      NCR.find(filter)
        .sort({ ncr_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('po_id', 'po_number')
        .populate('grn_id', 'grn_number')
        .populate('item_id', 'part_no part_description'),
      NCR.countDocuments(filter),
      NCR.aggregate([
        { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: null,
            total_ncrs: { $sum: 1 },
            total_rejected_qty: { $sum: '$rejected_qty' },
            total_estimated_loss: { $sum: '$estimated_loss' },
            total_actual_loss: { $sum: '$actual_loss' },
            total_recovered: { $sum: '$recovery_amount' },
            open_ncrs: { $sum: { $cond: [{ $ne: ['$status', 'Closed'] }, 1, 0] } },
            closed_ncrs: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
            avg_resolution_days: { $avg: { $subtract: ['$closed_at', '$ncr_date'] } }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          _id: vendor._id,
          vendor_name: vendor.vendor_name,
          vendor_code: vendor.vendor_code
        },
        statistics: vendorStats[0] || {
          total_ncrs: 0,
          total_rejected_qty: 0,
          total_estimated_loss: 0,
          total_actual_loss: 0,
          total_recovered: 0,
          open_ncrs: 0,
          closed_ncrs: 0,
          avg_resolution_days: 0
        },
        ncrs: ncrs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get NCRs by vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NCRs by vendor',
      error: error.message
    });
  }
};

// ======================================================
// GET NCRs BY PO ID
// GET /api/ncrs/po/:poId
// ======================================================
exports.getNCRsByPO = async (req, res) => {
  try {
    const { poId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const po = await PurchaseOrder.findById(poId);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
        error: 'PO_NOT_FOUND'
      });
    }

    let filter = { po_id: poId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ncrs, total, poStats] = await Promise.all([
      NCR.find(filter)
        .sort({ ncr_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('grn_id', 'grn_number grn_date')
        .populate('vendor_id', 'vendor_name vendor_code')
        .populate('item_id', 'part_no part_description')
        .populate('created_by', 'Username Email'),
      NCR.countDocuments(filter),
      NCR.aggregate([
        { $match: { po_id: new mongoose.Types.ObjectId(poId) } },
        {
          $group: {
            _id: null,
            total_ncrs: { $sum: 1 },
            total_rejected_qty: { $sum: '$rejected_qty' },
            total_estimated_loss: { $sum: '$estimated_loss' },
            total_actual_loss: { $sum: '$actual_loss' },
            total_recovered: { $sum: '$recovery_amount' },
            open_ncrs: { $sum: { $cond: [{ $ne: ['$status', 'Closed'] }, 1, 0] } },
            closed_ncrs: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        po: {
          _id: po._id,
          po_number: po.po_number,
          po_date: po.po_date
        },
        statistics: poStats[0] || {
          total_ncrs: 0,
          total_rejected_qty: 0,
          total_estimated_loss: 0,
          total_actual_loss: 0,
          total_recovered: 0,
          open_ncrs: 0,
          closed_ncrs: 0
        },
        ncrs: ncrs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get NCRs by PO error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NCRs by PO',
      error: error.message
    });
  }
};

// ======================================================
// SET NCR DISPOSITION
// PUT /api/ncrs/:id/disposition
// ======================================================
exports.setDisposition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      disposition, disposition_basis, immediate_action,
      concession_number, customer_concession_no,
      vendor_return_challan, financial_impact,
      estimated_loss
    } = req.body;

    const ncr = await NCR.findById(id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found' });

    if (ncr.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'Cannot modify a closed NCR' });
    }

    const validDispositions = [
      'Scrap', 'Rework', 'Use As-Is', 'Return to Vendor',
      'Sort', 'MRB Review', 'Customer Concession', 'Pending Decision',
    ];
    if (!validDispositions.includes(disposition)) {
      return res.status(400).json({ success: false, message: `Invalid disposition. Valid: ${validDispositions.join(', ')}` });
    }

    ncr.disposition = disposition;
    ncr.disposition_basis = disposition_basis || ncr.disposition_basis;
    ncr.immediate_action = immediate_action || ncr.immediate_action;
    ncr.concession_number = concession_number || ncr.concession_number;
    ncr.customer_concession_no = customer_concession_no || ncr.customer_concession_no;
    ncr.vendor_return_challan = vendor_return_challan || ncr.vendor_return_challan;
    ncr.financial_impact = financial_impact != null ? financial_impact : ncr.financial_impact;
    if (estimated_loss) ncr.estimated_loss = estimated_loss;
    ncr.disposition_approved_by = req.user._id;
    ncr.disposition_date = new Date();
    ncr.status = 'Disposition Given';
    ncr.updated_by = req.user._id;

    await ncr.save();

    return res.status(200).json({
      success: true,
      message: 'NCR disposition set successfully',
      data: {
        ncr_number: ncr.ncr_number,
        disposition: ncr.disposition,
        status: ncr.status,
        estimated_loss: ncr.estimated_loss
      },
    });

  } catch (error) {
    console.error('Set disposition error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE FINANCIAL DETAILS
// PUT /api/ncrs/:id/financial
// ======================================================
exports.updateFinancialDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_loss, recovery_amount, debit_note_id } = req.body;

    const ncr = await NCR.findById(id);
    if (!ncr) {
      return res.status(404).json({
        success: false,
        message: 'NCR not found',
        error: 'NCR_NOT_FOUND'
      });
    }

    if (actual_loss !== undefined) ncr.actual_loss = actual_loss;
    if (recovery_amount !== undefined) ncr.recovery_amount = recovery_amount;
    if (debit_note_id !== undefined) ncr.debit_note_id = debit_note_id;
    
    ncr.updated_by = req.user._id;
    await ncr.save();

    res.status(200).json({
      success: true,
      message: 'Financial details updated successfully',
      data: {
        ncr_number: ncr.ncr_number,
        estimated_loss: ncr.estimated_loss,
        actual_loss: ncr.actual_loss,
        recovery_amount: ncr.recovery_amount,
        net_loss: ncr.actual_loss - ncr.recovery_amount,
        debit_note_id: ncr.debit_note_id
      }
    });

  } catch (error) {
    console.error('Update financial details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update financial details',
      error: error.message
    });
  }
};

// ======================================================
// RECORD ROOT CAUSE
// PUT /api/ncrs/:id/root-cause
// ======================================================
exports.recordRootCause = async (req, res) => {
  try {
    const { id } = req.params;
    const { root_cause_method, root_cause, escape_cause, systemic_failure } = req.body;

    const ncr = await NCR.findById(id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found' });

    if (ncr.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'Cannot modify a closed NCR' });
    }

    ncr.root_cause_method = root_cause_method || null;
    ncr.root_cause = root_cause || '';
    ncr.escape_cause = escape_cause || '';
    ncr.systemic_failure = systemic_failure !== undefined ? systemic_failure : ncr.systemic_failure;

    if (ncr.status === 'Disposition Given') {
      ncr.status = 'Under Investigation';
    }
    ncr.updated_by = req.user._id;

    await ncr.save();

    const capaRequired = ncr.severity !== 'Minor' && ncr.systemic_failure;
    return res.status(200).json({
      success: true,
      message: 'Root cause recorded',
      data: {
        systemic_failure: ncr.systemic_failure,
        capa_required: capaRequired
      },
    });

  } catch (error) {
    console.error('Record root cause error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// ADD ACTION TO NCR (Direct Action Management)
// POST /api/ncrs/:id/actions
// ======================================================
exports.addAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action_type, description, assigned_to, due_date } = req.body;

    if (!action_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'action_type and description are required',
        error: 'ACTION_REQUIRED'
      });
    }

    const validActionTypes = ['Corrective', 'Preventive', 'Immediate'];
    if (!validActionTypes.includes(action_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action_type. Must be one of: ${validActionTypes.join(', ')}`,
        error: 'INVALID_ACTION_TYPE'
      });
    }

    const ncr = await NCR.findById(id);
    if (!ncr) {
      return res.status(404).json({
        success: false,
        message: 'NCR not found',
        error: 'NCR_NOT_FOUND'
      });
    }

    if (ncr.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add actions to closed NCR',
        error: 'NCR_CLOSED'
      });
    }

    const action = {
      action_type,
      description,
      assigned_to: assigned_to || null,
      due_date: due_date ? new Date(due_date) : null,
      status: 'Pending',
      created_at: new Date()
    };

    switch (action_type) {
      case 'Corrective':
        ncr.corrective_actions.push(action);
        break;
      case 'Preventive':
        ncr.preventive_actions.push(action);
        break;
      case 'Immediate':
        ncr.immediate_actions.push(action);
        break;
    }

    ncr.updated_by = req.user._id;
    await ncr.save();

    const populatedNCR = await NCR.findById(id)
      .populate('immediate_actions.assigned_to', 'Username Email')
      .populate('corrective_actions.assigned_to', 'Username Email')
      .populate('preventive_actions.assigned_to', 'Username Email');

    let addedAction = null;
    const actionArrays = {
      'Corrective': populatedNCR.corrective_actions,
      'Preventive': populatedNCR.preventive_actions,
      'Immediate': populatedNCR.immediate_actions
    };
    const actionArray = actionArrays[action_type];
    addedAction = actionArray[actionArray.length - 1];

    res.status(200).json({
      success: true,
      message: `${action_type} added successfully`,
      data: {
        ncr_number: ncr.ncr_number,
        action: {
          id: addedAction._id,
          action_type: addedAction.action_type,
          description: addedAction.description,
          assigned_to: addedAction.assigned_to,
          due_date: addedAction.due_date,
          status: addedAction.status
        }
      }
    });

  } catch (error) {
    console.error('Add action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add action',
      error: error.message
    });
  }
};

// ======================================================
// UPDATE ACTION STATUS
// PUT /api/ncrs/:id/actions/:actionId
// ======================================================
exports.updateActionStatus = async (req, res) => {
  try {
    const { id, actionId } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
        error: 'STATUS_REQUIRED'
      });
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        error: 'INVALID_STATUS'
      });
    }

    const ncr = await NCR.findById(id);
    if (!ncr) {
      return res.status(404).json({
        success: false,
        message: 'NCR not found',
        error: 'NCR_NOT_FOUND'
      });
    }

    let actionFound = false;
    let actionArray = null;
    let actionIndex = -1;
    let actionType = null;

    const checkArray = (arr, type) => {
      const index = arr.findIndex(a => a._id.toString() === actionId);
      if (index !== -1) {
        actionFound = true;
        actionArray = arr;
        actionIndex = index;
        actionType = type;
      }
    };

    checkArray(ncr.immediate_actions, 'Immediate');
    if (!actionFound) checkArray(ncr.corrective_actions, 'Corrective');
    if (!actionFound) checkArray(ncr.preventive_actions, 'Preventive');

    if (!actionFound) {
      return res.status(404).json({
        success: false,
        message: 'Action not found',
        error: 'ACTION_NOT_FOUND'
      });
    }

    const action = actionArray[actionIndex];
    const oldStatus = action.status;
    action.status = status;

    if (status === 'Completed') {
      action.completed_at = new Date();
      action.completed_by = req.user._id;
    }
    if (remarks) action.remarks = remarks;

    ncr.updated_by = req.user._id;
    await ncr.save();

    res.status(200).json({
      success: true,
      message: `Action status updated from ${oldStatus} to ${status}`,
      data: {
        ncr_number: ncr.ncr_number,
        action_type: actionType,
        action_id: action._id,
        old_status: oldStatus,
        new_status: action.status,
        completed_at: action.completed_at
      }
    });

  } catch (error) {
    console.error('Update action status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update action status',
      error: error.message
    });
  }
};

// ======================================================
// ADD PHOTO EVIDENCE
// POST /api/ncrs/:id/photo-evidence
// ======================================================
exports.addPhotoEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_name, file_path, description } = req.body;

    if (!file_name || !file_path) {
      return res.status(400).json({ success: false, message: 'file_name and file_path are required' });
    }

    const ncr = await NCR.findById(id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found' });

    ncr.photo_evidence.push({
      file_name,
      file_path,
      description: description || '',
      uploaded_by: req.user._id,
      uploaded_at: new Date(),
    });
    ncr.updated_by = req.user._id;
    await ncr.save();

    return res.status(200).json({
      success: true,
      message: 'Photo evidence added',
      data: { photo_count: ncr.photo_evidence.length },
    });

  } catch (error) {
    console.error('Add photo evidence error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// LINK CAPA TO NCR
// PUT /api/ncrs/:id/link-capa/:capa_id
// ======================================================
exports.linkCAPA = async (req, res) => {
  try {
    const { id, capa_id } = req.params;

    const [ncr, capa] = await Promise.all([
      NCR.findById(id),
      CAPA.findById(capa_id),
    ]);

    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found' });
    if (!capa) return res.status(404).json({ success: false, message: 'CAPA not found' });

    ncr.capa_id = capa._id;
    ncr.status = 'CAPA Initiated';
    ncr.updated_by = req.user._id;
    await ncr.save();

    return res.status(200).json({
      success: true,
      message: 'CAPA linked successfully',
      data: { ncr_number: ncr.ncr_number, capa_id: capa.capa_id },
    });

  } catch (error) {
    console.error('Link CAPA error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// CLOSE NCR (Enhanced with financial validation & WO update)
// PUT /api/ncrs/:id/close
// ======================================================
exports.closeNCR = async (req, res) => {
  try {
    const { id } = req.params;
    const { recurrence_check, resolution, actual_loss, recovery_amount, closure_remarks } = req.body;

    const ncr = await NCR.findById(id);
    if (!ncr) return res.status(404).json({ success: false, message: 'NCR not found' });

    if (ncr.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'NCR is already closed' });
    }

    // ==============================================
    // BUSINESS RULE 1: CAPA required for Critical/Major with systemic failure
    // ==============================================
    if (ncr.severity !== 'Minor' && ncr.systemic_failure && !ncr.capa_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot close NCR: CAPA required for systemic failure with Critical/Major severity',
        error: 'CAPA_REQUIRED',
      });
    }

    // ==============================================
    // BUSINESS RULE 2: Linked CAPA must be closed
    // ==============================================
    if (ncr.capa_id) {
      const capa = await CAPA.findById(ncr.capa_id);
      if (capa && capa.status !== 'Closed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot close NCR: Linked CAPA is not closed yet',
          capa_status: capa.status,
        });
      }
    }

    // ==============================================
    // BUSINESS RULE 3: Update financials if provided
    // ==============================================
    if (actual_loss !== undefined) ncr.actual_loss = actual_loss;
    if (recovery_amount !== undefined) ncr.recovery_amount = recovery_amount;

    // ==============================================
    // Update NCR closure fields
    // ==============================================
    ncr.recurrence_check = recurrence_check || false;
    ncr.status = 'Closed';
    ncr.closed_by = req.user._id;
    ncr.closed_at = new Date();
    ncr.updated_by = req.user._id;
    ncr.closure_remarks = closure_remarks || resolution;

    await ncr.save();

    // ==============================================
    // BUSINESS RULE 4: Update Work Order status if NCR was holding it
    // ==============================================
    if (ncr.wo_id) {
      // Check if there are any other OPEN NCRs for this Work Order
      const otherOpenNCRs = await NCR.findOne({
        wo_id: ncr.wo_id,
        _id: { $ne: ncr._id },
        status: { $ne: 'Closed' }
      });

      if (!otherOpenNCRs) {
        // No other open NCRs - release the Work Order
        await WorkOrder.findByIdAndUpdate(ncr.wo_id, {
          status: 'In Progress',
          hold_reason: null,
          updated_by: req.user._id
        });
        
        console.log(`[NCR Close] Work Order ${ncr.wo_id} released from hold - No pending NCRs`);
      } else {
        console.log(`[NCR Close] Work Order ${ncr.wo_id} remains on hold - Other NCRs pending`);
      }
    }

    // ==============================================
    // BUSINESS RULE 5: Update GRN status if NCR was for incoming material
    // ==============================================
    if (ncr.grn_id && ncr.disposition === 'Return to Vendor') {
      // Check if this NCR was the only one for this GRN
      const otherNCRsForGRN = await NCR.findOne({
        grn_id: ncr.grn_id,
        _id: { $ne: ncr._id }
      });

      if (!otherNCRsForGRN) {
        await GRN.findByIdAndUpdate(ncr.grn_id, {
          status: 'Closed',
          updated_by: req.user._id
        });
        
        console.log(`[NCR Close] GRN ${ncr.grn_id} closed`);
      }
    }

    // ==============================================
    // BUSINESS RULE 6: If disposition was "Rework", update rework tracking
    // ==============================================
    if (ncr.disposition === 'Rework' && ncr.rework_job_card) {
      const ReworkJobCard = require('../../models/Production/ReworkJobCard');
      await ReworkJobCard.findByIdAndUpdate(ncr.rework_job_card, {
        status: 'Completed',
        completed_at: new Date(),
        completed_by: req.user._id
      });
      
      console.log(`[NCR Close] Rework Job Card ${ncr.rework_job_card} marked as completed`);
    }

    // ==============================================
    // BUSINESS RULE 7: If supplier caution letter was issued, track it
    // ==============================================
    if (ncr.supplier_caution_letter && !ncr.scl_number) {
      // Auto-generate SCL number if not already assigned
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      
      const Counter = mongoose.model('SequenceCounter');
      const counter = await Counter.findByIdAndUpdate(
        `scl_${year}${month}`,
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      
      ncr.scl_number = `SCL-${year}${month}-${counter.seq.toString().padStart(4, '0')}`;
      await ncr.save();
    }

    // ==============================================
    // Prepare response data
    // ==============================================
    const responseData = {
      ncr_number: ncr.ncr_number,
      closed_at: ncr.closed_at,
      closed_by: req.user.Username,
      actual_loss: ncr.actual_loss,
      recovery_amount: ncr.recovery_amount,
      net_loss: (ncr.actual_loss || 0) - (ncr.recovery_amount || 0),
      recurrence_check: ncr.recurrence_check,
      scl_number: ncr.scl_number || null
    };

    // Add WO release info if applicable
    if (ncr.wo_id) {
      responseData.wo_status = 'Released';
      responseData.wo_message = 'Work Order has been released from hold';
    }

    // Add GRN status if applicable
    if (ncr.grn_id) {
      responseData.grn_status = 'Closed';
    }

    return res.status(200).json({
      success: true,
      message: 'NCR closed successfully',
      data: responseData,
    });

  } catch (error) {
    console.error('Close NCR error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ======================================================
// NCR DASHBOARD STATISTICS (Complete Dashboard)
// GET /api/ncrs/dashboard/stats
// ======================================================
exports.getNCRDashboardStats = async (req, res) => {
  try {
    const { from_date, to_date, vendor_id } = req.query;

    let filter = {};
    if (from_date || to_date) {
      filter.ncr_date = {};
      if (from_date) filter.ncr_date.$gte = new Date(from_date);
      if (to_date) filter.ncr_date.$lte = new Date(to_date);
    }
    if (vendor_id) filter.vendor_id = vendor_id;

    // Overall stats
    const overallStats = await NCR.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total_ncrs: { $sum: 1 },
          total_rejected_qty: { $sum: '$rejected_qty' },
          total_estimated_loss: { $sum: '$estimated_loss' },
          total_actual_loss: { $sum: '$actual_loss' },
          total_recovered: { $sum: '$recovery_amount' },
          open_ncrs: { $sum: { $cond: [{ $ne: ['$status', 'Closed'] }, 1, 0] } },
          closed_ncrs: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
          systemic_ncrs: { $sum: { $cond: ['$systemic_failure', 1, 0] } }
        }
      }
    ]);

    // NCRs by severity
    const severityStats = await NCR.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          rejected_qty: { $sum: '$rejected_qty' },
          estimated_loss: { $sum: '$estimated_loss' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // NCRs by type
    const typeStats = await NCR.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$ncr_type',
          count: { $sum: 1 },
          rejected_qty: { $sum: '$rejected_qty' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // NCRs by disposition
    const dispositionStats = await NCR.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$disposition',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top vendors by NCR count
    const topVendors = await NCR.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$vendor_id',
          count: { $sum: 1 },
          rejected_qty: { $sum: '$rejected_qty' },
          estimated_loss: { $sum: '$estimated_loss' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || {
          total_ncrs: 0,
          total_rejected_qty: 0,
          total_estimated_loss: 0,
          total_actual_loss: 0,
          total_recovered: 0,
          open_ncrs: 0,
          closed_ncrs: 0,
          systemic_ncrs: 0
        },
        by_severity: severityStats,
        by_type: typeStats,
        by_disposition: dispositionStats,
        top_vendors: topVendors.map(v => ({
          vendor_id: v._id,
          vendor_name: v.vendor?.vendor_name || 'Unknown',
          ncr_count: v.count,
          rejected_qty: v.rejected_qty,
          estimated_loss: v.estimated_loss
        }))
      }
    });

  } catch (error) {
    console.error('Get NCR dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NCR statistics',
      error: error.message
    });
  }
};

// ======================================================
// NCR TREND ANALYSIS (Pareto & Monthly Trends)
// GET /api/ncrs/trend
// ======================================================
exports.getNCRTrend = async (req, res) => {
  try {
    const { from, to } = req.query;

    const matchFilter = {};
    if (from || to) {
      matchFilter.ncr_date = {};
      if (from) matchFilter.ncr_date.$gte = new Date(from);
      if (to) matchFilter.ncr_date.$lte = new Date(to);
    }

    const [trendData, monthlyTrend, summary] = await Promise.all([
      // Trend by defect code (Pareto)
      NCR.aggregate([
        { $match: matchFilter },
        { $unwind: { path: '$defect_codes', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$defect_codes.code',
            name: { $first: '$defect_codes.name' },
            category: { $first: '$defect_codes.category' },
            count: { $sum: 1 },
            total_quantity: { $sum: '$quantity' },
            total_loss: { $sum: '$estimated_loss' }
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),

      // Monthly trend with severity breakdown
      NCR.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: { year: { $year: '$ncr_date' }, month: { $month: '$ncr_date' } },
            count: { $sum: 1 },
            critical_count: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } },
            major_count: { $sum: { $cond: [{ $eq: ['$severity', 'Major'] }, 1, 0] } },
            minor_count: { $sum: { $cond: [{ $eq: ['$severity', 'Minor'] }, 1, 0] } },
            total_financial_impact: { $sum: '$estimated_loss' },
            total_rejected_qty: { $sum: '$rejected_qty' }
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Summary
      NCR.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            total_ncrs: { $sum: 1 },
            total_quantity: { $sum: '$quantity' },
            total_rejected_qty: { $sum: '$rejected_qty' },
            open_ncrs: { $sum: { $cond: [{ $ne: ['$status', 'Closed'] }, 1, 0] } },
            closed_ncrs: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
            systemic_ncrs: { $sum: { $cond: ['$systemic_failure', 1, 0] } },
            total_financial_impact: { $sum: '$estimated_loss' },
            total_actual_loss: { $sum: '$actual_loss' },
            total_recovered: { $sum: '$recovery_amount' }
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        period: { from: from || 'all', to: to || 'all' },
        summary: summary[0] || { total_ncrs: 0 },
        monthly_trend: monthlyTrend,
        by_defect: trendData,
      },
    });

  } catch (error) {
    console.error('NCR trend error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

