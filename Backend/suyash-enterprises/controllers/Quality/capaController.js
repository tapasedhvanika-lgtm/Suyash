'use strict';
const fs = require('fs');
const path = require('path');
const CAPA = require('../../models/Quality/CAPA');
const NCR = require('../../models/Quality/NCR');

// ======================================================
// HELPER: Delete old evidence file
// ======================================================
const deleteOldEvidence = (filePath) => {
  if (filePath && filePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, '../..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted old evidence: ${fullPath}`);
    }
  }
};

// ======================================================
// CREATE CAPA
// POST /api/capas
// ======================================================
exports.createCAPA = async (req, res) => {
  try {
    const {
      capa_type, source,
      ncr_id, complaint_id, audit_finding_id,
      problem_statement, defect_description,
      quantity_affected, customer_impact,
      root_cause, assigned_to, target_close_date,
      corrective_actions, preventive_actions,
    } = req.body;

    const capa = new CAPA({
      capa_date: new Date(),
      capa_type,
      source,
      ncr_id: ncr_id || null,
      complaint_id: complaint_id || null,
      audit_finding_id: audit_finding_id || '',
      problem_statement,
      defect_description,
      quantity_affected: quantity_affected || 0,
      customer_impact: customer_impact || false,
      root_cause,
      assigned_to: assigned_to || null,
      target_close_date: new Date(target_close_date),
      corrective_actions: corrective_actions || [],
      preventive_actions: preventive_actions || [],
      status: 'Open',
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await capa.save();

    // Update NCR if linked
    if (ncr_id) {
      await NCR.findByIdAndUpdate(ncr_id, {
        capa_id: capa._id,
        status: 'CAPA Initiated',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'CAPA created successfully',
      data: {
        _id: capa._id,
        capa_id: capa.capa_id,
        status: capa.status,
        completion_percentage: capa.completion_percentage,
      },
    });

  } catch (error) {
    console.error('Create CAPA error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ALL CAPAs
// GET /api/capas
// ======================================================
exports.getAllCAPAs = async (req, res) => {
  try {
    const { status, source, capa_type, assigned_to, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (capa_type) filter.capa_type = capa_type;
    if (assigned_to) filter.assigned_to = assigned_to;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [capas, total] = await Promise.all([
      CAPA.find(filter)
        .sort({ capa_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('ncr_id', 'ncr_number severity')
        .populate('assigned_to', 'Username Email')
        .populate('created_by', 'Username Email'),
      CAPA.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: capas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error('Get all CAPAs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET CAPA BY ID
// GET /api/capas/:id
// ======================================================
exports.getCAPAById = async (req, res) => {
  try {
    const capa = await CAPA.findById(req.params.id)
      .populate('ncr_id')
      .populate('assigned_to', 'Username Email')
      .populate('corrective_actions.responsible_person_id', 'Username Email')
      .populate('preventive_actions.responsible_person_id', 'Username Email')
      .populate('created_by', 'Username Email')
      .populate('closed_by', 'Username Email');

    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA not found' });
    }
    return res.status(200).json({ success: true, data: capa });

  } catch (error) {
    console.error('Get CAPA error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE CAPA ACTION (with image upload for evidence)
// PUT /api/capas/:id/actions/:action_id
// ======================================================
exports.updateAction = async (req, res) => {
  try {
    const { id, action_id } = req.params;
    const { status, verification_notes } = req.body;
    let completion_evidence_path = '';

    const capa = await CAPA.findById(id);
    if (!capa) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'CAPA not found' });
    }

    // Search in both arrays
    let action =
      capa.corrective_actions.id(action_id) ||
      capa.preventive_actions.id(action_id);

    if (!action) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Action not found' });
    }

    // Handle file upload - if evidence file is uploaded
    if (req.file) {
      completion_evidence_path = `/uploads/capa-evidence/${req.file.filename}`;
      
      // Delete old evidence file if exists
      if (action.completion_evidence_path) {
        deleteOldEvidence(action.completion_evidence_path);
      }
    }

    if (status) action.status = status;
    if (verification_notes) action.verification_notes = verification_notes;
    if (completion_evidence_path) action.completion_evidence_path = completion_evidence_path;

    // When marking as Completed, record timestamp
    if (action.status === 'Completed') {
      action.completion_date = action.completion_date || new Date();
    }

    // Recompute CAPA-level status
    const allCorrectiveDone = capa.corrective_actions.every(a => a.status === 'Completed');
    const allPreventiveDone = capa.preventive_actions.every(a => a.status === 'Completed');

    if (allCorrectiveDone && allPreventiveDone) {
      capa.status = 'Completed';
    } else if (capa.status === 'Open') {
      capa.status = 'In Progress';
    }

    capa.updated_by = req.user._id;
    await capa.save();

    return res.status(200).json({
      success: true,
      message: 'Action updated',
      data: {
        action_id: action._id,
        action_status: action.status,
        completion_evidence_path: action.completion_evidence_path,
        capa_status: capa.status,
        completion_percentage: capa.completion_percentage,
      },
    });

  } catch (error) {
    console.error('Update action error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// RECORD EFFECTIVENESS REVIEW
// PUT /api/capas/:id/effectiveness
// ======================================================
exports.recordEffectiveness = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      effectiveness_verified,
      effectiveness_criteria,
      effectiveness_evidence,
      effectiveness_notes,
    } = req.body;

    const capa = await CAPA.findById(id);
    if (!capa) return res.status(404).json({ success: false, message: 'CAPA not found' });

    if (capa.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'CAPA is already closed' });
    }

    capa.effectiveness_review_date = new Date();
    capa.effectiveness_criteria = effectiveness_criteria || capa.effectiveness_criteria;
    capa.effectiveness_verified = effectiveness_verified !== undefined
      ? effectiveness_verified
      : capa.effectiveness_verified;
    capa.effectiveness_evidence = effectiveness_evidence || capa.effectiveness_evidence;
    capa.effectiveness_notes = effectiveness_notes || capa.effectiveness_notes;
    capa.status = 'Effectiveness Under Review';
    capa.updated_by = req.user._id;

    await capa.save();

    return res.status(200).json({
      success: true,
      message: 'Effectiveness review recorded',
      data: { effectiveness_verified: capa.effectiveness_verified },
    });

  } catch (error) {
    console.error('Record effectiveness error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// CLOSE CAPA
// PUT /api/capas/:id/close
// ======================================================
exports.closeCAPA = async (req, res) => {
  try {
    const { id } = req.params;

    const capa = await CAPA.findById(id);
    if (!capa) return res.status(404).json({ success: false, message: 'CAPA not found' });

    if (capa.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'CAPA is already closed' });
    }

    if (!capa.effectiveness_verified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot close CAPA: Effectiveness not verified yet',
      });
    }

    capa.status = 'Closed';
    capa.closed_by = req.user._id;
    capa.closed_at = new Date();
    capa.updated_by = req.user._id;

    await capa.save();

    return res.status(200).json({
      success: true,
      message: 'CAPA closed successfully',
      data: { capa_id: capa.capa_id, closed_at: capa.closed_at },
    });

  } catch (error) {
    console.error('Close CAPA error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE CAPA (general field update)
// PUT /api/capas/:id
// ======================================================
exports.updateCAPA = async (req, res) => {
  try {
    const { id } = req.params;

    const capa = await CAPA.findById(id);
    if (!capa) return res.status(404).json({ success: false, message: 'CAPA not found' });

    if (capa.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'Cannot modify a closed CAPA' });
    }

    const allowedFields = [
      'problem_statement', 'defect_description', 'root_cause',
      'quantity_affected', 'customer_impact', 'assigned_to',
      'target_close_date', 'capa_type', 'corrective_actions', 'preventive_actions',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        capa[field] = req.body[field];
      }
    }

    capa.updated_by = req.user._id;
    await capa.save();

    return res.status(200).json({
      success: true,
      message: 'CAPA updated',
      data: { capa_id: capa.capa_id, status: capa.status },
    });

  } catch (error) {
    console.error('Update CAPA error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};