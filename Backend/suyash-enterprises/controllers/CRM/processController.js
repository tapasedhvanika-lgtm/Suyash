// controllers/CRM/processController.js
'use strict';
const Process = require('../../models/CRM/Process');

// @desc    Get all processes with pagination and filtering
// @route   GET /api/processes
// @access  Private
const getProcesses = async (req, res) => {
  try {
    const { page = 1, limit = 10, is_active, category, rate_type } = req.query;
    
    const query = {};
    if (is_active !== undefined) query.is_active = is_active === 'true';
    if (category) query.category = category;
    if (rate_type) query.rate_type = rate_type;
    
    const processes = await Process.find(query)
      .populate('work_centre', 'machine_id machine_name machine_code machine_type work_centre status')
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
       .sort({ createdAt: -1 }); 
    
    const total = await Process.countDocuments(query);
    
    res.json({
      success: true,
      data: processes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get processes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get processes grouped by category
// @route   GET /api/processes/by-category
// @access  Private
const getProcessesByCategory = async (req, res) => {
  try {
    const processes = await Process.find({ is_active: true })
      .populate('work_centre', 'machine_id machine_name machine_code')
      .select('process_id process_name category rate_type work_centre setup_time_min cycle_time_min')
     .sort({ createdAt: -1 });
    
    const grouped = {
      Core: processes.filter(p => p.category === 'Core'),
      Finishing: processes.filter(p => p.category === 'Finishing'),
      Packing: processes.filter(p => p.category === 'Packing'),
      Other: processes.filter(p => p.category === 'Other')
    };
    
    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Get processes by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single process by ID
// @route   GET /api/processes/:id
// @access  Private
const getProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id)
      .populate('work_centre', 'machine_id machine_name machine_code machine_type work_centre status shifts_per_day hours_per_shift')
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email');
    
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }
    
    res.json({
      success: true,
      data: process
    });
  } catch (error) {
    console.error('Get process error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create process
// @route   POST /api/processes
// @access  Private
const createProcess = async (req, res) => {
  try {
    const processData = {
      process_id: req.body.process_id || `PROC-${Date.now()}`,
      process_name: req.body.process_name,
      description: req.body.description || '',
      category: req.body.category,
      rate_type: req.body.rate_type,
      work_centre: req.body.work_centre || null,
      setup_time_min: req.body.setup_time_min || 0,
      cycle_time_min: req.body.cycle_time_min || 0,
      is_subcontract: req.body.is_subcontract || false,
      default_vendor: req.body.default_vendor || null,
      created_by: req.user._id,
      updated_by: req.user._id
    };
    
    // Validate required fields
    if (!processData.process_name) {
      return res.status(400).json({
        success: false,
        message: 'process_name is required'
      });
    }
    if (!processData.category) {
      return res.status(400).json({
        success: false,
        message: 'category is required'
      });
    }
    if (!processData.rate_type) {
      return res.status(400).json({
        success: false,
        message: 'rate_type is required'
      });
    }
    
    const process = await Process.create(processData);
    
    const populatedProcess = await Process.findById(process._id)
      .populate('work_centre', 'machine_id machine_name')
      .populate('created_by', 'username email');
    
    res.status(201).json({
      success: true,
      data: populatedProcess,
      message: 'Process created successfully'
    });
  } catch (error) {
    console.error('Create process error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update process
// @route   PUT /api/processes/:id
// @access  Private
const updateProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }
    
    // Update allowed fields
    const allowedUpdates = ['process_name', 'description', 'category', 'rate_type', 
                            'work_centre', 'setup_time_min', 'cycle_time_min', 
                            'is_subcontract', 'default_vendor', 'is_active'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        process[field] = req.body[field];
      }
    });
    
    process.updated_by = req.user._id;
    await process.save();
    
    const populatedProcess = await Process.findById(process._id)
      .populate('work_centre', 'machine_id machine_name')
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email');
    
    res.json({
      success: true,
      data: populatedProcess,
      message: 'Process updated successfully'
    });
  } catch (error) {
    console.error('Update process error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete process (soft delete)
// @route   DELETE /api/processes/:id
// @access  Private
const deleteProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    
    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }
    
    // Check if process is used in any active routing or work order
    const Routing = require('../../models/CRM/Routing');
    const routingCount = await Routing.countDocuments({
      'operations.process_id': process._id,
      is_active: true
    });
    
    if (routingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deactivate. Process is used in ${routingCount} active routing(s).`
      });
    }
    
    process.is_active = false;
    process.updated_by = req.user._id;
    await process.save();
    
    res.json({
      success: true,
      message: 'Process deactivated successfully'
    });
  } catch (error) {
    console.error('Delete process error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get processes for dropdown
// @route   GET /api/processes/dropdown
// @access  Private
const getProcessesDropdown = async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { is_active: true };
    if (category) query.category = category;
    
    const processes = await Process.find(query)
      .populate('work_centre', 'machine_id machine_name machine_code')
      .select('_id process_id process_name category rate_type work_centre')
     .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: processes
    });
  } catch (error) {
    console.error('Get processes dropdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProcesses,
  getProcess,
  createProcess,
  updateProcess,
  deleteProcess,
  getProcessesDropdown,
  getProcessesByCategory
};