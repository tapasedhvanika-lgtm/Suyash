'use strict';
const AssemblyLine = require('../../models/Assembly/AssemblyLine');

// ======================================================
// CREATE Assembly Line
// ======================================================
exports.createAssemblyLine = async (req, res) => {
  try {
    const {
      line_name,
      line_type,
      work_centre,
      description
    } = req.body;

    if (!line_name || !work_centre) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: line_name, work_centre'
      });
    }

    const assemblyLine = new AssemblyLine({
      line_name,
      line_type: line_type || 'General',
      work_centre,
      description,
      created_by: req.user._id
    });

    await assemblyLine.save();

    res.status(201).json({
      success: true,
      message: 'Assembly line created successfully',
      data: assemblyLine
    });

  } catch (error) {
    console.error('Create assembly line error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// GET ALL Assembly Lines
// ======================================================
exports.getAssemblyLines = async (req, res) => {
  try {
    const {
      line_type,
      is_active,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (line_type) filter.line_type = line_type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [lines, total] = await Promise.all([
      AssemblyLine.find(filter)
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AssemblyLine.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: lines,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get assembly lines error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// GET Assembly Line by ID
// ======================================================
exports.getAssemblyLineById = async (req, res) => {
  try {
    const assemblyLine = await AssemblyLine.findById(req.params.id);

    if (!assemblyLine) {
      return res.status(404).json({
        success: false,
        message: 'Assembly line not found'
      });
    }

    res.json({
      success: true,
      data: assemblyLine
    });

  } catch (error) {
    console.error('Get assembly line by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// GET Assembly Lines Dropdown (for forms)
// ======================================================
exports.getAssemblyLinesDropdown = async (req, res) => {
  try {
    const { line_type } = req.query;
    
    const filter = { is_active: true };
    if (line_type) filter.line_type = line_type;

    const lines = await AssemblyLine.find(filter)
      .select('line_code line_name line_type')
      .sort({ line_name: 1 });

    res.json({
      success: true,
      data: lines
    });

  } catch (error) {
    console.error('Get assembly lines dropdown error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// UPDATE Assembly Line
// ======================================================
exports.updateAssemblyLine = async (req, res) => {
  try {
    const assemblyLine = await AssemblyLine.findById(req.params.id);
    
    if (!assemblyLine) {
      return res.status(404).json({
        success: false,
        message: 'Assembly line not found'
      });
    }

    const {
      line_name,
      line_type,
      work_centre,
      description,
      is_active
    } = req.body;

    if (line_name !== undefined) assemblyLine.line_name = line_name;
    if (line_type !== undefined) assemblyLine.line_type = line_type;
    if (work_centre !== undefined) assemblyLine.work_centre = work_centre;
    if (description !== undefined) assemblyLine.description = description;
    if (is_active !== undefined) assemblyLine.is_active = is_active;

    assemblyLine.updated_by = req.user._id;
    await assemblyLine.save();

    res.json({
      success: true,
      message: 'Assembly line updated successfully',
      data: assemblyLine
    });

  } catch (error) {
    console.error('Update assembly line error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// DELETE Assembly Line (Soft Delete)
// ======================================================
exports.deleteAssemblyLine = async (req, res) => {
  try {
    const assemblyLine = await AssemblyLine.findById(req.params.id);
    
    if (!assemblyLine) {
      return res.status(404).json({
        success: false,
        message: 'Assembly line not found'
      });
    }

    // Check if assembly line is used in any active Work Order
    const { WorkOrder } = require('../../models/Production/WorkOrder');
    
    // FIXED: Search using the ObjectId, not the line_code
    const activeWO = await WorkOrder.findOne({
      assembly_line: assemblyLine._id,  // ← Use ObjectId, not line_code
      status: { $in: ['Planned', 'Released', 'In Progress', 'Partially Completed', 'Components Kitted'] }
    });

    if (activeWO) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete assembly line - used in active Work Order ${activeWO.wo_number}`,
        work_order: {
          wo_number: activeWO.wo_number,
          status: activeWO.status
        }
      });
    }

    // Soft delete - set inactive
    assemblyLine.is_active = false;
    assemblyLine.updated_by = req.user._id;
    await assemblyLine.save();

    res.json({
      success: true,
      message: 'Assembly line deactivated successfully',
      data: {
        line_code: assemblyLine.line_code,
        line_name: assemblyLine.line_name,
        is_active: false
      }
    });

  } catch (error) {
    console.error('Delete assembly line error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};