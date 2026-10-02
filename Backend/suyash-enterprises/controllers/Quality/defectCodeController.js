'use strict';
const fs = require('fs');
const path = require('path');
const DefectCode = require('../../models/Quality/DefectCode');
const Process = require('../../models/CRM/Process');

// ======================================================
// HELPER: Delete old image file
// ======================================================
const deleteOldImage = (imagePath) => {
  if (imagePath && imagePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, '../..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted old image: ${fullPath}`);
    }
  }
};

// ======================================================
// HELPER: Parse applicable_processes from FormData
// ======================================================
const parseApplicableProcesses = (processesInput) => {
  if (!processesInput) return [];
  
  // If it's already an array
  if (Array.isArray(processesInput)) {
    return processesInput;
  }
  
  // If it's a string
  if (typeof processesInput === 'string') {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(processesInput);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Not JSON, check if it's comma-separated
      if (processesInput.includes(',')) {
        return processesInput.split(',').map(id => id.trim());
      }
      return [processesInput];
    }
  }
  
  return [];
};

// ======================================================
// CREATE DEFECT CODE (with image upload)
// POST /api/defect-codes
// ======================================================
exports.createDefectCode = async (req, res) => {
  try {
    const defect_code = req.body.defect_code;
    const defect_name = req.body.defect_name;
    const defect_category = req.body.defect_category;
    const defect_description = req.body.defect_description;
    let applicable_processes = [];
    let severity_default = 'Major';
    let photo_reference = '';

    // Parse applicable_processes
    if (req.body.applicable_processes) {
      applicable_processes = parseApplicableProcesses(req.body.applicable_processes);
    }

    if (req.body.severity_default) severity_default = req.body.severity_default;

    // Handle image upload from FormData
    if (req.file) {
      photo_reference = `/uploads/defect-codes/${req.file.filename}`;
    }

    // Validation
    if (!defect_code || !defect_name || !defect_category || !defect_description) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'defect_code, defect_name, defect_category, and defect_description are required',
      });
    }

    // Check for duplicate
    const existing = await DefectCode.findOne({ defect_code: defect_code.toUpperCase() });
    if (existing) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(409).json({
        success: false,
        message: `Defect code ${defect_code.toUpperCase()} already exists`,
      });
    }

    const defectCode = new DefectCode({
      defect_code: defect_code.toUpperCase(),
      defect_name,
      defect_category,
      defect_description,
      applicable_processes: applicable_processes || [],
      severity_default: severity_default || 'Major',
      photo_reference: photo_reference || '',
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await defectCode.save();

    // Populate the saved defect code with process details
    const populatedDefectCode = await DefectCode.findById(defectCode._id)
      .populate('applicable_processes', 'process_id process_name')
      .populate('created_by', 'Username Email')
      .populate('updated_by', 'Username Email');

    return res.status(201).json({
      success: true,
      message: 'Defect code created successfully',
      data: populatedDefectCode,
    });

  } catch (error) {
    console.error('Create defect code error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE DEFECT CODE
// PUT /api/defect-codes/:id
// ======================================================
exports.updateDefectCode = async (req, res) => {
  try {
    const { id } = req.params;

    const defectCode = await DefectCode.findById(id);
    if (!defectCode) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Defect code not found' });
    }

    // Update text fields if provided
    if (req.body.defect_name) defectCode.defect_name = req.body.defect_name;
    if (req.body.defect_category) defectCode.defect_category = req.body.defect_category;
    if (req.body.defect_description) defectCode.defect_description = req.body.defect_description;
    if (req.body.severity_default) defectCode.severity_default = req.body.severity_default;
    
    // Handle is_active (boolean)
    if (req.body.is_active !== undefined) {
      defectCode.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    }

    // Handle applicable_processes array
    if (req.body.applicable_processes) {
      defectCode.applicable_processes = parseApplicableProcesses(req.body.applicable_processes);
    }

    // Handle image upload - if image is uploaded, replace existing image
    if (req.file) {
      if (defectCode.photo_reference) {
        deleteOldImage(defectCode.photo_reference);
      }
      defectCode.photo_reference = `/uploads/defect-codes/${req.file.filename}`;
    }

    defectCode.updated_by = req.user._id;
    await defectCode.save();

    // Populate the updated defect code with process details
    const populatedDefectCode = await DefectCode.findById(defectCode._id)
      .populate('applicable_processes', 'process_id process_name')
      .populate('created_by', 'Username Email')
      .populate('updated_by', 'Username Email');

    return res.status(200).json({
      success: true,
      message: 'Defect code updated successfully',
      data: populatedDefectCode,
    });

  } catch (error) {
    console.error('Update defect code error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET ALL DEFECT CODES (with populated process names)
// GET /api/defect-codes
// ======================================================
exports.getAllDefectCodes = async (req, res) => {
  try {
    const { category, is_active, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (category) filter.defect_category = category;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    if (search) {
      filter.$or = [
        { defect_code: new RegExp(search, 'i') },
        { defect_name: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [defectCodes, total] = await Promise.all([
      DefectCode.find(filter)
        .sort({ defect_code: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('applicable_processes', 'process_id process_name')
        .populate('created_by', 'Username Email')
        .populate('updated_by', 'Username Email'),
      DefectCode.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: defectCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error('Get defect codes error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET DEFECT CODE BY ID (with populated process names)
// GET /api/defect-codes/:id
// ======================================================
exports.getDefectCodeById = async (req, res) => {
  try {
    const defectCode = await DefectCode.findById(req.params.id)
      .populate('applicable_processes', 'process_id process_name')
      .populate('created_by', 'Username Email')
      .populate('updated_by', 'Username Email');

    if (!defectCode) {
      return res.status(404).json({ success: false, message: 'Defect code not found' });
    }
    return res.status(200).json({ success: true, data: defectCode });

  } catch (error) {
    console.error('Get defect code error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// SOFT DELETE DEFECT CODE
// DELETE /api/defect-codes/:id
// ======================================================
exports.deleteDefectCode = async (req, res) => {
  try {
    const defectCode = await DefectCode.findByIdAndUpdate(
      req.params.id,
      { is_active: false, updated_by: req.user._id },
      { new: true },
    );

    if (!defectCode) {
      return res.status(404).json({ success: false, message: 'Defect code not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Defect code deactivated successfully'
    });

  } catch (error) {
    console.error('Delete defect code error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ======================================================
// TOGGLE DEFECT CODE STATUS
// PUT /api/defect-codes/:id/toggle-status
// ======================================================
exports.toggleDefectCodeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const defectCode = await DefectCode.findById(id);

    if (!defectCode) {
      return res.status(404).json({
        success: false,
        message: 'Defect code not found'
      });
    }

    defectCode.is_active = !defectCode.is_active;
    defectCode.updated_by = req.user._id;

    await defectCode.save();

    return res.status(200).json({
      success: true,
      message: `Defect code ${defectCode.is_active ? 'activated' : 'deactivated'} successfully`,
      data: defectCode
    });

  } catch (error) {
    console.error('Toggle defect code status error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle defect code status'
    });
  }
};
// ======================================================
// BULK DELETE DEFECT CODES
// POST /api/defect-codes/bulk-delete
// Soft-deletes selected defect codes
// ======================================================
exports.bulkDeleteDefectCodes = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Defect Code IDs'
      });
    }

    const results = [];
    let deletedCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      try {
        const defectCode = await DefectCode.findByIdAndUpdate(
          id,
          {
            is_active: false,
            updated_by: req.user._id
          },
          {
            new: true
          }
        );

        if (!defectCode) {
          results.push({
            id,
            success: false,
            message: 'Defect code not found'
          });

          failedCount++;
          continue;
        }

        results.push({
          id,
          success: true,
          message: `Defect code "${defectCode.defect_code}" deactivated`
        });

        deletedCount++;

      } catch (error) {
        console.error(
          `[bulkDeleteDefectCodes] Error deleting ${id}:`,
          error
        );

        results.push({
          id,
          success: false,
          message: error.message || 'Failed to delete Defect Code'
        });

        failedCount++;
      }
    }

    return res.status(200).json({
      success: deletedCount > 0,
      message: `${deletedCount} Defect Code(s) processed successfully, ${failedCount} failed`,
      deletedCount,
      failedCount,
      results
    });

  } catch (error) {
    console.error('[bulkDeleteDefectCodes] Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to bulk delete Defect Codes'
    });
  }
};