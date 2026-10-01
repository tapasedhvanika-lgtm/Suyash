'use strict';
// controllers/Masters/toolMasterController.js

const mongoose   = require('mongoose');
const ToolMaster = require('../../models/Masters/toolMaster');

const ok  = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const err = (res, msg,  code = 500) => res.status(code).json({ success: false, message: msg });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tool-master
// Create a new tool
// ─────────────────────────────────────────────────────────────────────────────
exports.createTool = async (req, res) => {
  try {
    const {
      tool_code, tool_name, tool_type, description,
      max_shots, maintenance_interval_shots, alert_threshold_percent,
      tool_material, tool_size, tool_weight_kg,
      drawing_no, drawing_revision,
      tool_cost, refurbishment_cost,
      manufactured_by, vendor_id, vendor_name,
      warehouse_id, bin_location,
      compatible_machines, produces_item_id, produces_part_no,
      purchase_date, status,
    } = req.body;

    if (!tool_name || !tool_type || !max_shots) {
      return err(res, 'Required: tool_name, tool_type, max_shots', 400);
    }

    const tool = await ToolMaster.create({
      tool_code:    tool_code    || undefined, // auto-generated if not provided
      tool_name,
      tool_type,
      description:  description  || '',
      max_shots:    Number(max_shots),
      maintenance_interval_shots: Number(maintenance_interval_shots || 0),
      alert_threshold_percent:    Number(alert_threshold_percent || 90),
      tool_material:  tool_material  || '',
      tool_size:      tool_size      || '',
      tool_weight_kg: Number(tool_weight_kg || 0),
      drawing_no:       drawing_no       || '',
      drawing_revision: drawing_revision || '0',
      tool_cost:          Number(tool_cost          || 0),
      refurbishment_cost: Number(refurbishment_cost || 0),
      manufactured_by: manufactured_by || 'In-House',
      vendor_id:   vendor_id   || null,
      vendor_name: vendor_name || '',
      warehouse_id:  warehouse_id  || null,
      bin_location:  bin_location  || '',
      compatible_machines: compatible_machines || [],
      produces_item_id: produces_item_id || null,
      produces_part_no: produces_part_no || '',
      purchase_date: purchase_date ? new Date(purchase_date) : null,
      status:     status     || 'Active',
      is_active:  true,
      created_by: req.user._id,
    });

    return ok(res, { message: 'Tool created', data: tool }, 201);
  } catch (e) {
    if (e.code === 11000) return err(res, `tool_code already exists: ${e.keyValue?.tool_code}`, 400);
    if (e.name === 'ValidationError') {
      return err(res, Object.values(e.errors).map(v => v.message).join(', '), 400);
    }
    return err(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tool-master
// List tools with filters
// ─────────────────────────────────────────────────────────────────────────────
exports.listTools = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      status, tool_type, near_maintenance,
      machine_id, part_no, search,
    } = req.query;

    const filter = { is_active: true };
    if (status)    filter.status    = status;
    if (tool_type) filter.tool_type = tool_type;
    if (machine_id) filter.compatible_machines = machine_id;
    if (part_no)    filter.produces_part_no = { $regex: part_no, $options: 'i' };
    if (search)     filter.tool_name = { $regex: search, $options: 'i' };

    // Filter tools near their maintenance threshold
    if (near_maintenance === 'true') {
      filter.maintenance_alert = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tools, total] = await Promise.all([
      ToolMaster.find(filter)
        .populate('compatible_machines', 'machine_name machine_code')
        .populate('produces_item_id', 'part_no part_description')
        .sort({ status: 1, current_shots: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean({ virtuals: true }),
      ToolMaster.countDocuments(filter),
    ]);

    return ok(res, {
      data: tools,
      pagination: {
        total, page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    return err(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tool-master/:id
// Single tool detail
// ─────────────────────────────────────────────────────────────────────────────
exports.getToolById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return err(res, 'Invalid tool ID', 400);
    }
    const tool = await ToolMaster.findById(req.params.id)
      .populate('compatible_machines', 'machine_name machine_code')
      .populate('produces_item_id',   'part_no part_description')
      .populate('vendor_id',          'vendor_name')
      .lean({ virtuals: true });

    if (!tool || !tool.is_active) return err(res, 'Tool not found', 404);
    return ok(res, { data: tool });
  } catch (e) {
    return err(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/tool-master/:id
// Update tool details (NOT shots — shots are updated via tool-usage)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateTool = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return err(res, 'Invalid tool ID', 400);
    }

    const tool = await ToolMaster.findById(req.params.id);
    if (!tool || !tool.is_active) return err(res, 'Tool not found', 404);

    const allowed = [
      'tool_name', 'tool_type', 'description', 'max_shots',
      'maintenance_interval_shots', 'alert_threshold_percent',
      'tool_material', 'tool_size', 'tool_weight_kg',
      'drawing_no', 'drawing_revision',
      'tool_cost', 'refurbishment_cost',
      'manufactured_by', 'vendor_id', 'vendor_name',
      'warehouse_id', 'bin_location',
      'compatible_machines', 'produces_item_id', 'produces_part_no',
      'status',
    ];

    allowed.forEach(f => {
      if (req.body[f] !== undefined) tool[f] = req.body[f];
    });

    tool.updated_by = req.user._id;
    await tool.save();

    return ok(res, { message: 'Tool updated', data: tool });
  } catch (e) {
    return err(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/tool-master/:id
// Soft delete — set is_active = false
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteTool = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return err(res, 'Invalid tool ID', 400);
    }
    const tool = await ToolMaster.findById(req.params.id);
    if (!tool || !tool.is_active) return err(res, 'Tool not found', 404);

    tool.is_active  = false;
    tool.status     = 'Retired';
    tool.updated_by = req.user._id;
    await tool.save();

    return ok(res, { message: `Tool ${tool.tool_code} retired` });
  } catch (e) {
    return err(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tool-master/:id/maintenance
// Log a maintenance event — resets shots_at_last_maintenance, clears alert
// ─────────────────────────────────────────────────────────────────────────────
exports.logMaintenance = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return err(res, 'Invalid tool ID', 400);
    }

    const { type, cost, performed_by, remarks, reset_shots_to } = req.body;
    if (!type) return err(res, 'maintenance type is required', 400);

    const tool = await ToolMaster.findById(req.params.id);
    if (!tool || !tool.is_active) return err(res, 'Tool not found', 404);

    const shotsBefore = tool.current_shots;

    // Log entry
    tool.maintenance_log.push({
      date:           new Date(),
      type,
      shots_before:   shotsBefore,
      shots_reset_to: reset_shots_to != null ? Number(reset_shots_to) : shotsBefore,
      cost:           Number(cost || 0),
      performed_by:   performed_by || '',
      remarks:        remarks      || '',
    });

    // Reset counters after maintenance
    if (reset_shots_to != null) {
      tool.current_shots = Number(reset_shots_to);
    }
    tool.shots_at_last_maintenance   = tool.current_shots;
    tool.last_maintenance_at         = new Date();
    tool.maintenance_alert           = false;  // clear alert
    tool.replacement_alert           = false;
    tool.status                      = 'Active';
    tool.next_maintenance_due_shots  = tool.current_shots + (tool.maintenance_interval_shots || 0);
    tool.updated_by                  = req.user._id;

    await tool.save();

    return ok(res, {
      message: `Maintenance logged for ${tool.tool_code}. Shots reset from ${shotsBefore} to ${tool.current_shots}.`,
      data: {
        tool_code:           tool.tool_code,
        shots_before:        shotsBefore,
        shots_after:         tool.current_shots,
        next_maintenance_at: tool.next_maintenance_due_shots,
        life_used_percent:   tool.life_used_percent,
      },
    });
  } catch (e) {
    return err(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tool-master/alerts
// All tools with active maintenance or replacement alerts
// ─────────────────────────────────────────────────────────────────────────────
exports.getToolAlerts = async (req, res) => {
  try {
    const tools = await ToolMaster.find({
      is_active: true,
      $or: [{ maintenance_alert: true }, { replacement_alert: true }],
    })
      .populate('compatible_machines', 'machine_name machine_code')
      .lean({ virtuals: true });

    return ok(res, {
      count: tools.length,
      data:  tools.map(t => ({
        _id:                t._id,
        tool_code:          t.tool_code,
        tool_name:          t.tool_name,
        tool_type:          t.tool_type,
        current_shots:      t.current_shots,
        max_shots:          t.max_shots,
        life_used_percent:  t.life_used_percent,
        shots_remaining:    t.shots_remaining,
        maintenance_alert:  t.maintenance_alert,
        replacement_alert:  t.replacement_alert,
        status:             t.status,
        compatible_machines: t.compatible_machines,
        last_used:          t.last_used,
      })),
    });
  } catch (e) {
    return err(res, e.message);
  }
};