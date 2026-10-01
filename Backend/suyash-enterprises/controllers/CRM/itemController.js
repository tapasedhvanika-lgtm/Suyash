'use strict';
const mongoose = require('mongoose');
const Item = require('../../models/CRM/Item');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Compute BOM role from item_category (DERIVED — never stored)
// ─────────────────────────────────────────────────────────────────────────────
function getBomRole(item_category) {
  switch (item_category) {
    case 'Finished Good':  return 'parent';
    case 'Semi-Finished':  return 'both';
    case 'Raw Material':   return 'component';
    case 'Consumable':     return 'component';
    case 'Bought-Out':     return 'component';
    case 'Subcontract':    return 'component';
    case 'Tool':           return 'none';
    default:               return 'component';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Auto-generate sequential item_id (Format: ITM-000001)
// ─────────────────────────────────────────────────────────────────────────────
const generateItemId = async () => {
  const last = await Item.findOne({}, { item_id: 1 }).sort({ item_id: -1 }).lean();
  if (!last || !last.item_id) return 'ITM-000001';
  const seq = parseInt(last.item_id.replace('ITM-', ''), 10);
  return `ITM-${String(seq + 1).padStart(6, '0')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Auto-compute gross_weight_kg (used for validation/display)
// ─────────────────────────────────────────────────────────────────────────────
const computeGrossWeight = (thickness, width, density) => {
  if (thickness && width && density) {
    return parseFloat(((thickness * width * 1000 * density) / 1_000_000).toFixed(6));
  }
  return 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all items with pagination, filtering, search
// @route   GET /api/items
// @access  Private
// Query params: page, limit, is_active, search, item_category, item_type,
//               hsn_code, procurement_type, rm_grade, material
// ─────────────────────────────────────────────────────────────────────────────
const getItems = async (req, res) => {
  try {
    const {
      page,
      limit = 10,
      is_active,
      search,
      item_category,
      item_type,
      hsn_code,
      procurement_type,
      rm_grade,
      material,
    } = req.query;

    const query = {};

    if (is_active !== undefined) query.is_active = is_active === 'true';
    if (item_category)   query.item_category   = item_category;
    if (item_type)       query.item_type       = item_type;
    if (hsn_code)        query.hsn_code        = hsn_code;
    if (procurement_type) query.procurement_type = procurement_type;
    if (rm_grade)        query.rm_grade        = new RegExp(rm_grade, 'i');
    if (material)        query.material        = new RegExp(material, 'i');

    if (search) {
      query.$or = [
        { part_no:          new RegExp(search, 'i') },
        { part_name:        new RegExp(search, 'i') },
        { part_description: new RegExp(search, 'i') },
        { drawing_no:       new RegExp(search, 'i') },
        { rm_grade:         new RegExp(search, 'i') },
        { item_no:          new RegExp(search, 'i') },
        { material:         new RegExp(search, 'i') },
        { rm_source:        new RegExp(search, 'i') },
        { rm_type:          new RegExp(search, 'i') },
        { rm_spec:          new RegExp(search, 'i') },
        { hsn_code:         new RegExp(search, 'i') },
      ];
    }

    // Only apply pagination if page parameter is provided
    let itemsQuery = Item.find(query)
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email')
      .populate('drawing_history.approved_by', 'username email')
      .sort({ createdAt: -1 });


    let total = await Item.countDocuments(query);
    let items;

    if (page !== undefined) {
      const pageNum  = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      items = await itemsQuery
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();
      
      var pagination = {
        currentPage:  pageNum,
        totalPages:   Math.ceil(total / limitNum),
        totalItems:   total,
        itemsPerPage: limitNum,
      };
    } else {
      // Return all items without pagination
      items = await itemsQuery.lean();
      var pagination = null;
    }

    const itemsWithRole = items.map(item => ({
      ...item,
      item_role: getBomRole(item.item_category),
      computed_gross_weight_kg: computeGrossWeight(item.thickness, item.width, item.density),
    }));

    res.json({
      success: true,
      data: itemsWithRole,
      pagination: pagination,
    });
  } catch (error) {
    console.error('getItems error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email')
      .populate('drawing_history.approved_by', 'username email');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

   res.json({
  success: true,
  data: {
    ...item.toObject(),
    item_role: getBomRole(item.item_category),
    computed_gross_weight_kg: computeGrossWeight(item.thickness, item.width, item.density),
    weight_per_unit_display: item.unit === 'Kg' ? '1 kg' : `${item.weight_per_unit_kg || 0} kg`,
    requires_weight_input: item.unit !== 'Kg',
  }
});
  } catch (error) {
    console.error('getItem error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create item (all fields supported)
// @route   POST /api/items
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createItem = async (req, res) => {
  try {
    const {
      // Primary Identifiers
      part_no,
      part_name,
      part_description,
      
      // Drawing & Revision Control
      drawing_no,
      revision_no,
      drawing_file_path,
      
      // Classification
      item_category,
      item_type,
      
      // Raw Material Specification
      rm_grade,
      density,
      rm_source,
      rm_type,
      rm_spec,
      material,
      
      // Dimensions
      item_no,
      thickness,
      width,
      strip_size,
      pitch,
      no_of_cavity,
      
      // Weight
      net_weight_kg,

      weight_per_unit_kg,
      
      // Rejection & Scrap
      rm_rejection_percent,
      scrap_realisation_percent,
      
      // Units & Tax
      unit,
      hsn_code,
      
      // Inventory Control
      reorder_level,
      reorder_qty,
      safety_stock,
      min_stock,
      max_stock,
      lead_time_days,
      shelf_life_days,
      
      // Procurement Source
      procurement_type,
    } = req.body;

    // Validate required fields
    if (!part_no) {
      return res.status(400).json({ success: false, message: 'part_no is required' });
    }
    if (!part_name) {
      return res.status(400).json({ success: false, message: 'part_name is required' });
    }
    if (!part_description) {
      return res.status(400).json({ success: false, message: 'part_description is required' });
    }
    if (!item_category) {
      return res.status(400).json({ success: false, message: 'item_category is required' });
    }
    if (!unit) {
      return res.status(400).json({ success: false, message: 'unit is required' });
    }
    if (!hsn_code) {
      return res.status(400).json({ success: false, message: 'hsn_code is required' });
    }

    // HSN → GST auto-set from Tax Master
    let gst_percentage = req.body.gst_percentage;
    try {
      const TaxMaster = require('../../models/settings/TaxMaster');
      const taxEntry = await TaxMaster.findOne({ hsn_code, is_active: true }).lean();
      if (!taxEntry) {
        return res.status(400).json({
          success: false,
          message: `HSN code '${hsn_code}' not found in Tax Master`,
        });
      }
      gst_percentage = taxEntry.gst_percentage;
    } catch (taxErr) {
      console.warn('TaxMaster lookup skipped:', taxErr.message);
    }

    const item_id = await generateItemId();

    const itemData = {
      // Primary Identifiers
      item_id,
      part_no: part_no.toUpperCase().trim(),
      part_name: part_name.trim(),
      part_description: part_description.trim(),
      
      // Drawing & Revision Control
      drawing_no: drawing_no || '',
      revision_no: revision_no || '0',
      drawing_file_path: drawing_file_path || '',
      
      // Classification
      item_category,
      item_type: item_type || 'Other',
      
      // Raw Material Specification
      rm_grade: rm_grade || '',
      density: density || undefined,
      rm_source: rm_source || '',
      rm_type: rm_type || '',
      rm_spec: rm_spec || '',
      material: material || '',
      
      // Dimensions
      item_no: item_no || '',
      thickness: thickness || 0,
      width: width || 0,
      strip_size: strip_size || 0,
      pitch: pitch || 0,
      no_of_cavity: no_of_cavity || 1,
      
      // Weight
      net_weight_kg: net_weight_kg || 0,

       weight_per_unit_kg: unit === 'Kg' ? 1 : (weight_per_unit_kg || 0),
      
      // Rejection & Scrap
      rm_rejection_percent: rm_rejection_percent !== undefined ? rm_rejection_percent : 2.0,
      scrap_realisation_percent: scrap_realisation_percent !== undefined ? scrap_realisation_percent : 85,
      
      // Units & Tax
      unit,
      hsn_code: hsn_code.trim(),
      gst_percentage,
      
      // Inventory Control
      reorder_level: reorder_level || 0,
      reorder_qty: reorder_qty || 0,
      safety_stock: safety_stock || 0,
      min_stock: min_stock || 0,
      max_stock: max_stock || 0,
      lead_time_days: lead_time_days || 0,
      shelf_life_days: shelf_life_days || 0,
      
      // Procurement Source
      procurement_type: procurement_type || 'Manufacture',
      
      // Audit
      created_by: req.user._id,
      updated_by: req.user._id,
    };

    const item = await Item.create(itemData);

    const populated = await Item.findById(item._id)
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: populated,
    });
  } catch (error) {
    console.error('createItem error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Item with this part number already exists',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update item (all fields supported, with lock protection)
// @route   PUT /api/items/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // ── Rule: part_no cannot be changed if locked ───────────────────────────
    if (
      req.body.part_no &&
      req.body.part_no.toUpperCase().trim() !== item.part_no &&
      item.part_no_locked
    ) {
      return res.status(400).json({
        success: false,
        message: 'part_no is locked — a Work Order has already been raised against this item',
      });
    }

    // ── Strip protected fields from payload ──────────────────────────────────
    const { drawing_history, part_no_locked, item_id, created_by, createdAt, updatedAt, ...safeBody } = req.body;

    // ── Handle weight_per_unit_kg: if unit is Kg, force to 1 ────────────────
    if (safeBody.unit === 'Kg') {
      safeBody.weight_per_unit_kg = 1;
    } else if (safeBody.weight_per_unit_kg !== undefined) {
      // User provided value for non-Kg unit - keep it
      safeBody.weight_per_unit_kg = parseFloat(safeBody.weight_per_unit_kg) || 0;
    }

    // ── Re-lookup GST if hsn_code changed ────────────────────────────────────
    if (safeBody.hsn_code && safeBody.hsn_code !== item.hsn_code) {
      try {
        const TaxMaster = require('../../models/settings/TaxMaster');
        const taxEntry = await TaxMaster.findOne({ hsn_code: safeBody.hsn_code, is_active: true }).lean();
        if (!taxEntry) {
          return res.status(400).json({
            success: false,
            message: `HSN code '${safeBody.hsn_code}' not found in Tax Master`,
          });
        }
        safeBody.gst_percentage = taxEntry.gst_percentage;
      } catch (taxErr) {
        console.warn('TaxMaster lookup skipped on update:', taxErr.message);
      }
    }

    // ── Trim/format string fields ───────────────────────────────────────────
    if (safeBody.part_no) safeBody.part_no = safeBody.part_no.toUpperCase().trim();
    if (safeBody.part_name) safeBody.part_name = safeBody.part_name.trim();
    if (safeBody.part_description) safeBody.part_description = safeBody.part_description.trim();
    if (safeBody.rm_grade) safeBody.rm_grade = safeBody.rm_grade.trim();
    if (safeBody.rm_source) safeBody.rm_source = safeBody.rm_source.trim();
    if (safeBody.rm_spec) safeBody.rm_spec = safeBody.rm_spec.trim();
    if (safeBody.material) safeBody.material = safeBody.material.trim();
    if (safeBody.hsn_code) safeBody.hsn_code = safeBody.hsn_code.trim();
    
    safeBody.updated_by = req.user._id;

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      safeBody,
      { new: true, runValidators: true }
    )
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email');

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('updateItem error:', error);

    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Item with this part number already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Deactivate item (soft delete)
// @route   DELETE /api/items/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (!item.is_active) {
      return res.status(400).json({ success: false, message: 'Item is already inactive' });
    }

    // Check for open references
    let woCount = 0, soCount = 0;

    try {
      const WorkOrder = require('../../models/WO/WorkOrder');
      woCount = await WorkOrder.countDocuments({
        item_id: item._id,
        status: { $nin: ['Completed', 'Cancelled'] },
      });
    } catch { /* WO module not available */ }

    try {
      const SalesOrder = require('../../models/Sales/SalesOrder');
      soCount = await SalesOrder.countDocuments({
        'line_items.item_id': item._id,
        status: { $nin: ['Completed', 'Cancelled'] },
      });
    } catch { /* SO module not available */ }

    if (woCount > 0 || soCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deactivate — ${woCount} open Work Order(s) and ${soCount} open Sales Order(s) still reference this item`,
        data: { open_work_orders: woCount, open_sales_orders: soCount },
      });
    }

    item.is_active = false;
    item.updated_by = req.user._id;
    await item.save();

    res.json({ success: true, message: 'Item deactivated successfully' });
  } catch (error) {
    console.error('deleteItem error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload drawing revision (multipart/form-data)
// @route   POST /api/items/:id/drawing
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadDrawing = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const { revision_no, change_description, approved_by } = req.body;

    if (!revision_no) {
      return res.status(400).json({ success: false, message: 'revision_no is required' });
    }
    if (!approved_by) {
      return res.status(400).json({ success: false, message: 'approved_by (User ID) is required' });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Drawing file is required — send as multipart/form-data field named "drawing"',
      });
    }

    // Archive all previous revisions
    item.drawing_history.forEach(rev => { rev.is_latest = false; });

    // Append new revision (append-only)
    item.drawing_history.push({
      revision_no,
      file_path: req.file.path,
      approved_by,
      approved_at: new Date(),
      change_description: change_description || '',
      is_latest: true,
    });

    item.revision_no = revision_no;
    item.drawing_file_path = req.file.path;
    item.updated_by = req.user._id;

    await item.save();

    // Alert open WOs
    let alert;
    try {
      const WorkOrder = require('../../models/WO/WorkOrder');
      const openWOs = await WorkOrder.find({
        item_id: item._id,
        status: { $nin: ['Completed', 'Cancelled'] },
      }).select('wo_number').lean();

      if (openWOs.length) {
        alert = {
          open_wo_count: openWOs.length,
          wo_numbers: openWOs.map(w => w.wo_number),
          message: 'Drawing revised — verify correct revision is in use on all open Work Orders',
        };
      }
    } catch { /* WO model not available */ }

    res.status(200).json({
      success: true,
      message: `Drawing revision ${revision_no} uploaded successfully`,
      data: { revision_no, file_path: req.file.path },
      ...(alert && { alert }),
    });
  } catch (error) {
    console.error('uploadDrawing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Where-used — all BOMs, open WOs, open SOs referencing this item
// @route   GET /api/items/:id/where-used
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const whereUsed = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).select('part_no part_name part_description item_category').lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const Bom = require('../../models/BOM/Bom');

    const boms = await Bom.find({
      'components.component_item_id': item._id,
      is_active: true,
    })
      .populate('parent_item_id', 'part_no part_name part_description')
      .select('bom_id parent_part_no bom_version is_default status')
      .lean();

    let openWOs = [], openSOs = [];

    try {
      const WorkOrder = require('../../models/WO/WorkOrder');
      openWOs = await WorkOrder.find({
        item_id: item._id,
        status: { $nin: ['Completed', 'Cancelled'] },
      }).select('wo_number status planned_qty').lean();
    } catch { /* WO not available */ }

    try {
      const SalesOrder = require('../../models/Sales/SalesOrder');
      openSOs = await SalesOrder.find({
        'line_items.item_id': item._id,
        status: { $nin: ['Completed', 'Cancelled'] },
      }).select('so_number status').lean();
    } catch { /* SO not available */ }

    res.json({
      success: true,
      data: {
        item,
        used_in_boms: boms,
        open_work_orders: openWOs,
        open_sales_orders: openSOs,
      },
    });
  } catch (error) {
    console.error('whereUsed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reorder alerts — items where current stock < reorder_level
// @route   GET /api/items/reorder-alerts
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const reorderAlerts = async (req, res) => {
  try {
    const items = await Item.find({ reorder_level: { $gt: 0 }, is_active: true })
      .select('part_no part_name part_description item_category reorder_level reorder_qty safety_stock lead_time_days min_stock max_stock')
      .lean();

    const alerts = [];

    for (const item of items) {
      let currentStock = 0;
      try {
        const StockLedger = require('../../models/Inventory/StockLedger');
        const ledger = await StockLedger.findOne({ item_id: item._id }).select('available_qty').lean();
        currentStock = ledger ? ledger.available_qty : 0;
      } catch { /* StockLedger not available */ }

      if (currentStock < item.reorder_level) {
        alerts.push({
          item_id: item._id,
          part_no: item.part_no,
          part_name: item.part_name,
          part_description: item.part_description,
          item_category: item.item_category,
          current_stock: currentStock,
          reorder_level: item.reorder_level,
          shortage: parseFloat((item.reorder_level - currentStock).toFixed(4)),
          suggested_order_qty: item.reorder_qty,
          safety_stock: item.safety_stock,
          lead_time_days: item.lead_time_days,
          min_stock: item.min_stock,
          max_stock: item.max_stock,
        });
      }
    }

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('reorderAlerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get items for dropdown (lightweight — includes key fields)
// @route   GET /api/items/dropdown
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getItemsDropdown = async (req, res) => {
  try {
    const { item_category, search } = req.query;
    const query = { is_active: true };
    
    if (item_category) query.item_category = item_category;
    
    if (search) {
      query.$or = [
        { part_no: new RegExp(search, 'i') },
        { part_name: new RegExp(search, 'i') },
        { part_description: new RegExp(search, 'i') }
      ];
    }
    
    const items = await Item.find(query)
      .select('item_id part_no part_name part_description unit item_no material rm_grade density hsn_code gst_percentage item_category procurement_type thickness width net_weight_kg weight_per_unit_kg')  // <-- ADDED weight_per_unit_kg
       .sort({ createdAt: -1 })
      .lean();

    const itemsWithRole = items.map(item => ({
      ...item,
      item_role: getBomRole(item.item_category),
    }));

    res.json({ success: true, data: itemsWithRole });
  } catch (error) {
    console.error('getItemsDropdown error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Bulk create items
// @route   POST /api/items/bulk
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const bulkCreateItems = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }
    
    const created = [], errors = [];
    
    for (const itemData of items) {
      try {
        const item_id = await generateItemId();
        
        // Validate required fields per item
        if (!itemData.part_no || !itemData.part_name || !itemData.part_description || 
            !itemData.item_category || !itemData.unit || !itemData.hsn_code) {
          errors.push({ 
            part_no: itemData.part_no || 'unknown', 
            error: 'Missing required fields (part_no, part_name, part_description, item_category, unit, hsn_code)' 
          });
          continue;
        }
        
        const doc = await Item.create({
          ...itemData,
          item_id,
          part_no: itemData.part_no.toUpperCase().trim(),
          part_name: itemData.part_name.trim(),
          part_description: itemData.part_description.trim(),
          created_by: req.user._id,
          updated_by: req.user._id,
        });
        created.push(doc);
      } catch (err) {
        errors.push({ part_no: itemData.part_no || 'unknown', error: err.message });
      }
    }
    
    return res.status(201).json({
      success: true,
      data: {
        created,
        errors,
        total_processed: items.length,
        total_created: created.length,
        total_errors: errors.length,
      },
      message: `${created.length} items created successfully`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get item by part number
// @route   GET /api/items/part/:part_no
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getItemByPartNo = async (req, res) => {
  try {
    const item = await Item.findOne({ part_no: req.params.part_no.toUpperCase().trim(), is_active: true })
      .populate('created_by', 'username email')
      .populate('updated_by', 'username email')
      .populate('drawing_history.approved_by', 'username email');
      
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    return res.json({
      success: true,
      data: {
        ...item.toObject(),
        item_role: getBomRole(item.item_category),
        computed_gross_weight_kg: computeGrossWeight(item.thickness, item.width, item.density),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all unique item categories (for filters)
// @route   GET /api/items/categories
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getItemCategories = async (req, res) => {
  try {
    const categories = await Item.distinct('item_category', { is_active: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('getItemCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all unique item types (for filters)
// @route   GET /api/items/types
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getItemTypes = async (req, res) => {
  try {
    const types = await Item.distinct('item_type', { is_active: true, item_type: { $ne: '' } });
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('getItemTypes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  uploadDrawing,
  whereUsed,
  reorderAlerts,
  getItemsDropdown,
  bulkCreateItems,
  getItemByPartNo,
  getItemCategories,
  getItemTypes,
};