const Bom = require('../../models/BOM/Bom');
const BomRevision = require('../../models/BOM/BomRevision');
const Item = require('../../models/CRM/Item');
const User = require("../../models/user_settings/User");
const mongoose = require('mongoose');
const { generateBomId } = require('../../utils/BOM/bomHelpers');
const { validateComponents } = require('../../services/BOM/bomValidationService');

// ===================== HELPER FUNCTIONS =====================

// Helper function to get current RM rates
async function getCurrentRMRates(as_of_date) {
  try {
    const RmRate = require('../../models/CRM/RawMaterial');
    const rates = await RmRate.find({
      IsActive: true
    }).lean();

    const rateMap = new Map();
    rates.forEach(rate => {
      rateMap.set(rate.Grade, rate);
    });

    return rateMap;
  } catch (error) {
    console.warn('RM Rate lookup failed:', error.message);
    return new Map();
  }
}

// Recursive BOM explosion function
async function explodeBOMRecursive(bom, quantity, effectiveDate, level = 0, visited = new Set()) {
  const result = {
    components: [],
    summary: {
      total_unique_components: 0,
      total_quantity_by_unit: {}
    }
  };

  // Check for circular reference
  const bomKey = bom._id.toString();
  if (visited.has(bomKey)) {
    throw new Error(`Circular reference detected in BOM: ${bom.bom_id}`);
  }
  visited.add(bomKey);

  for (const component of bom.components) {
    const componentQty = component.quantity_per * quantity * (1 + (component.scrap_percent || 0) / 100);
    
    // Check if component has its own BOM (sub-assembly)
    const childBom = await Bom.findOne({
      parent_item_id: component.component_item_id,
      is_default: true,
      is_active: true,
      status: { $in: ['Active', 'Approved'] },
      effective_from: { $lte: effectiveDate },
      $or: [
        { effective_to: null },
        { effective_to: { $gte: effectiveDate } }
      ]
    }).populate('components.component_item_id');

    if (childBom && !component.is_phantom) {
      // Recursively explode sub-assembly
      const childResult = await explodeBOMRecursive(childBom, componentQty, effectiveDate, level + 1, new Set(visited));
      
      result.components.push(...childResult.components);
      
      // Update summary
      for (const [unit, qty] of Object.entries(childResult.summary.total_quantity_by_unit)) {
        result.summary.total_quantity_by_unit[unit] = (result.summary.total_quantity_by_unit[unit] || 0) + qty;
      }
    } else {
      // Add as raw component
      result.components.push({
        level: level + 1,
        part_no: component.component_part_no,
        description: component.component_desc,
        quantity: componentQty,
        unit: component.unit,
        scrap_percent: component.scrap_percent || 0,
        is_phantom: component.is_phantom || false,
        is_subcontract: component.is_subcontract || false,
        component_id: component.component_item_id?._id || component.component_item_id
      });
      
      // Update summary
      const unit = component.unit || 'Nos';
      result.summary.total_quantity_by_unit[unit] = (result.summary.total_quantity_by_unit[unit] || 0) + componentQty;
    }
  }

  result.summary.total_unique_components = result.components.length;
  visited.delete(bomKey);
  
  return result;
}

// Recursive cost calculation function
async function calculateCostRecursive(bom, quantity, rmRates, visited, level = 0) {
  const result = {
    total_cost: 0,
    breakdown: [],
    summary: {
      material_cost: 0,
      process_cost: 0,
      subcontract_cost: 0
    }
  };

  const parentId = bom.parent_item_id?._id 
    ? bom.parent_item_id._id.toString() 
    : bom.parent_item_id?.toString();

  if (!parentId) {
    throw new Error('Invalid parent item reference');
  }

  if (visited.has(parentId)) {
    throw new Error(`Circular reference detected: item ${parentId}`);
  }
  visited.add(parentId);

  for (const component of bom.components) {
    const componentItem = component.component_item_id;
    const componentQty = component.quantity_per * quantity * (1 + (component.scrap_percent || 0) / 100);

    let componentCost = 0;
    let costDetails = {
      part_no: component.component_part_no,
      description: component.component_desc,
      level: component.level || 1,
      base_quantity: component.quantity_per * quantity,
      quantity_with_scrap: componentQty,
      scrap_percent: component.scrap_percent || 0,
      unit: component.unit,
      cost_breakdown: {}
    };

    // Check if component is a sub-assembly
    const childBom = await Bom.findOne({
      parent_item_id: component.component_item_id,
      is_default: true,
      is_active: true,
      status: { $in: ['Active', 'Approved'] },
    }).populate('components.component_item_id');

    if (childBom && !component.is_phantom) {
      const childResult = await calculateCostRecursive(
        childBom, 
        componentQty, 
        rmRates, 
        new Set(visited),
        level + 1
      );
      
      componentCost = childResult.total_cost;
      costDetails.cost_breakdown = {
        type: 'sub-assembly',
        child_bom_id: childBom.bom_id,
        child_cost: childResult.total_cost,
        components: childResult.breakdown
      };
      
      result.summary.process_cost += childResult.summary.process_cost || 0;
      result.summary.subcontract_cost += childResult.summary.subcontract_cost || 0;
    } else if (component.is_subcontract) {
      let subcontractRate = 0;
      try {
        const ProcessMaster = require('../../models/BOM/ProcessMaster');
        const process = await ProcessMaster.findOne({
          is_subcontract_allowed: true,
          is_active: true,
        }).sort('-standard_rate').lean();
        if (process) subcontractRate = process.standard_rate || 0;
      } catch (err) {
        console.warn('ProcessMaster lookup failed:', err.message);
      }

      componentCost = componentQty * subcontractRate;
      costDetails.cost_breakdown = {
        type: 'subcontract',
        rate_per_unit: subcontractRate,
        vendor: component.subcontract_vendor,
        note: subcontractRate === 0 ? 'No subcontract rate found' : undefined,
      };
      result.summary.subcontract_cost += componentCost;
    } else {
      const rmGrade = componentItem?.rm_grade;
      if (!rmGrade) {
        throw new Error(`No RM grade defined for component ${component.component_part_no}`);
      }
      
      const rmRate = rmRates.get(rmGrade);
      if (!rmRate && componentItem?.item_category === 'Raw Material') {
        throw new Error(`No RM rate found for grade ${rmGrade} (${component.component_part_no})`);
      }
      
      componentCost = componentQty * (rmRate?.EffectiveRate || rmRate?.RatePerKG || 0);
      costDetails.cost_breakdown = {
        type: 'raw_material',
        rm_grade: rmGrade,
        rate_per_kg: rmRate?.RatePerKG,
        effective_rate: rmRate?.EffectiveRate,
        source: rmRate?.MaterialName
      };
      result.summary.material_cost += componentCost;
    }

    result.total_cost += componentCost;
    costDetails.total_cost = componentCost;
    result.breakdown.push(costDetails);
  }

  // Apply yield loss at this level
  if (bom.yield_percent && bom.yield_percent < 100) {
    const yieldFactor = 100 / bom.yield_percent;
    result.total_cost *= yieldFactor;
    
    result.breakdown.forEach(item => {
      item.quantity_with_scrap *= yieldFactor;
      item.total_cost *= yieldFactor;
    });
  }

  visited.delete(parentId);
  return result;
}

// ===================== BOM CONTROLLER FUNCTIONS =====================
// In bomController.js — REPLACE createBOM function

const createBOM = async (req, res) => {
  try {
    const {
      parent_item_id,
      bom_version,
      bom_type,
      bom_category = 'Standard',   // NEW
      batch_size,
      yield_percent,
      setup_time_min,
      cycle_time_min,
      components = [],             // default to empty array
      effective_from,
      effective_to,
      status = 'Pending'
    } = req.body;

    // ── Required fields (components no longer required for Assembly) ──────────
    if (!parent_item_id || !bom_version || !bom_type || !batch_size) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: parent_item_id, bom_version, bom_type, batch_size'
      });
    }

    // ── Validate bom_category ─────────────────────────────────────────────────
    if (!['Standard', 'Assembly'].includes(bom_category)) {
      return res.status(400).json({
        success: false,
        message: "bom_category must be 'Standard' or 'Assembly'"
      });
    }
// Assembly BOM MUST have components (because you assemble things)
if (bom_category === 'Assembly') {
  if (!Array.isArray(components) || components.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Assembly BOM requires at least one component. Use bom_category: 'Standard' for component-less BOMs."
    });
  }
}

// Standard BOM CANNOT have components
if (bom_category === 'Standard') {
  if (components && components.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Standard BOM cannot have components. Use bom_category: 'Assembly' for BOMs with components."
    });
  }
}
    // ── Find parent item ──────────────────────────────────────────────────────
    let parentItem;
    if (mongoose.Types.ObjectId.isValid(parent_item_id)) {
      parentItem = await Item.findById(parent_item_id);
    } else {
      parentItem = await Item.findOne({ item_id: parent_item_id.toString().toUpperCase() });
    }

    if (!parentItem) {
      return res.status(404).json({
        success: false,
        message: `Parent item not found: ${parent_item_id}`
      });
    }

    const VALID_PARENT_CATEGORIES = ['Finished Good', 'Semi-Finished'];
    if (!VALID_PARENT_CATEGORIES.includes(parentItem.item_category)) {
      return res.status(400).json({
        success: false,
        message: `'${parentItem.part_no}' is a '${parentItem.item_category}' and cannot be a BOM parent.`
      });
    }

    // ── BOM version uniqueness ────────────────────────────────────────────────
    const existingBOM = await Bom.findOne({
      parent_item_id: parentItem._id,
      bom_version
    });
    if (existingBOM) {
      return res.status(400).json({
        success: false,
        message: `BOM version '${bom_version}' already exists for item '${parentItem.part_no}'`
      });
    }

    // ── Resolve & validate components only for Standard BOMs ─────────────────
    let resolvedComponents = [];

    if (bom_category === 'Assembly' && components.length > 0) {
      const componentIds = components.map(c => c.component_item_id);

      const objectIdRefs = componentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      const itemIdRefs   = componentIds.filter(id => !mongoose.Types.ObjectId.isValid(id));

      const [byObjectId, byItemId] = await Promise.all([
        objectIdRefs.length > 0 ? Item.find({ _id: { $in: objectIdRefs } }) : Promise.resolve([]),
        itemIdRefs.length > 0   ? Item.find({ item_id: { $in: itemIdRefs.map(id => id.toString().toUpperCase()) } }) : Promise.resolve([]),
      ]);

      const componentItems = [...byObjectId, ...byItemId];

      if (componentItems.length !== componentIds.length) {
        const foundRefs = new Set([
          ...byObjectId.map(i => i._id.toString()),
          ...byItemId.map(i => i.item_id),
        ]);
        const missingIds = componentIds.filter(id =>
          !foundRefs.has(id.toString()) &&
          !foundRefs.has(id.toString().toUpperCase())
        );
        return res.status(400).json({
          success: false,
          message: 'Some component items not found in Item Master',
          missing_ids: missingIds
        });
      }

      const selfRef = componentItems.find(ci => ci._id.toString() === parentItem._id.toString());
      if (selfRef) {
        return res.status(400).json({
          success: false,
          message: `Component '${selfRef.part_no}' is the same as the parent — circular reference`
        });
      }

      const toolComponents = componentItems.filter(ci => ci.item_category === 'Tool');
      if (toolComponents.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Tool items cannot be BOM components: ${toolComponents.map(t => t.part_no).join(', ')}`
        });
      }

      const itemMap = new Map();
      componentItems.forEach(item => {
        itemMap.set(item._id.toString(), item);
        itemMap.set(item.item_id, item);
      });

      const validationResult = await validateComponents(components, componentItems);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
          errors: validationResult.errors
        });
      }

      resolvedComponents = components.map(c => {
        const item = itemMap.get(c.component_item_id.toString())
                  || itemMap.get(c.component_item_id.toString().toUpperCase());
        return {
          component_item_id:    item._id,
          component_part_no:    item.part_no,
          component_desc:       item.part_description,
          unit:                 c.unit || item.unit,
          level:                c.level          ?? 1,
          quantity_per:         c.quantity_per,
          scrap_percent:        c.scrap_percent   ?? 0,
          is_phantom:           c.is_phantom      ?? false,
          is_subcontract:       c.is_subcontract  ?? false,
          subcontract_vendor:   c.subcontract_vendor   || undefined,
          reference_designator: c.reference_designator || undefined,
          remarks:              c.remarks               || undefined,
        };
      });
    }

    // ── Create BOM ────────────────────────────────────────────────────────────
    const bom_id = await generateBomId();

    const bom = await Bom.create({
      bom_id,
      parent_item_id:  parentItem._id,
      parent_part_no:  parentItem.part_no,
      bom_version,
      bom_type,
      bom_category,                        // NEW
      batch_size,
      yield_percent:   yield_percent  ?? 100,
      setup_time_min:  setup_time_min ?? 0,
      cycle_time_min:  cycle_time_min ?? 0,
      effective_from:  effective_from || new Date(),
      effective_to:    effective_to   || null,
      status,
      created_by:      req.user._id,
      current_revision: 0,
      components:      resolvedComponents,  // [] for Assembly, filled for Standard
    });

    // ── Initial revision snapshot ─────────────────────────────────────────────
    await BomRevision.create({
      revision_id:      `REV-${bom_id}-000`,
      bom_id:           bom._id,
      revision_no:      0,
      snapshot_data: {
        bom_id:       bom.bom_id,
        bom_category,
        parent_item: {
          _id:              parentItem._id,
          part_no:          parentItem.part_no,
          part_description: parentItem.part_description,
        },
        bom_version:   bom.bom_version,
        bom_type:      bom.bom_type,
        batch_size:    bom.batch_size,
        components:    bom.components,
      },
      change_description: bom_category === 'Assembly'
        ? 'Initial Assembly BOM creation (no components)'
        : 'Initial BOM creation',
      created_by:  req.user._id,
      is_current:  true,
    });

    const populatedBom = await Bom.findById(bom._id)
      .populate('parent_item_id', 'part_no part_description drawing_no revision_no item_category')
      .populate('components.component_item_id', 'part_no part_description unit rm_grade item_category')
      .populate('components.subcontract_vendor', 'name vendor_code')
      .populate('created_by', 'name email')
      .populate('approved_by', 'name email');

    res.status(201).json({
      success: true,
      message: bom_category === 'Assembly'
        ? 'Assembly BOM created successfully (no components)'
        : 'BOM created successfully',
      data: populatedBom
    });

  } catch (error) {
    console.error('Create BOM error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'BOM with this ID already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all BOMs with filters
// @route   GET /api/boms
// @access  All roles
// @desc    Get all BOMs with filters and search
// @route   GET /api/boms
// @access  All roles
const getBOMs = async (req, res) => {
  try {
    const {
      parent_item,
      bom_type,
      bom_category,
      is_default,
      status,
      bom_version,
      search,                    // ← ADD THIS - for searching by part_no or description
      page = 1,
      limit = 20,
      sort = '-created_at'
    } = req.query;

    const filter = { is_active: true };
    
    // Existing filters
    if (parent_item) filter.parent_item_id = parent_item;
    if (bom_type) filter.bom_type = bom_type;
    if (bom_category) filter.bom_category = bom_category;
    if (is_default !== undefined) filter.is_default = is_default === 'true';
    if (status) filter.status = status;
    if (bom_version) filter.bom_version = new RegExp(bom_version, 'i');
    
    // ← ADD SEARCH FILTER - searches in parent_part_no and parent_item_id.part_description
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // First find items matching the search
      const matchingItems = await Item.find({
        $or: [
          { part_no: { $regex: searchTerm, $options: 'i' } },
          { part_description: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id');
      
      const itemIds = matchingItems.map(item => item._id);
      
      filter.$or = [
        { parent_part_no: { $regex: searchTerm, $options: 'i' } },
        { parent_item_id: { $in: itemIds } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [boms, total] = await Promise.all([
      Bom.find(filter)
        .populate('parent_item_id', 'part_no part_description drawing_no')
        .populate('components.component_item_id', 'part_no part_description unit')
        .populate('components.subcontract_vendor', 'name vendor_code')
        .populate('created_by', 'name email')
        .populate('approved_by', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Bom.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: boms,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get single BOM by ID
// @route   GET /api/boms/:id
// @access  All roles
const getBOMById = async (req, res) => {
  try {
    const bom = await Bom.findById(req.params.id)
      .populate('parent_item_id', 'part_no part_description drawing_no revision_no rm_grade density unit hsn_code')
      .populate({
        path: 'components.component_item_id',
        select: 'part_no part_description unit rm_grade density'
      })
      .populate('components.subcontract_vendor', 'name vendor_code gstin')
      .populate('created_by', 'name email')
      .populate('approved_by', 'name email')
      .populate('updated_by', 'name email');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    const revisionCount = await BomRevision.countDocuments({ bom_id: bom._id });

    res.status(200).json({
      success: true,
      data: {
        ...bom.toObject(),
        revision_count: revisionCount
      }
    });

  } catch (error) {
    console.error('Get BOM by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update BOM
// @route   PUT /api/boms/:id
// @access  Manager, Production
const updateBOM = async (req, res) => {
  try {
    const {
      bom_version,
      bom_type,
      batch_size,
      yield_percent,
      setup_time_min,
      cycle_time_min,
      components,
      effective_from,
      effective_to,
      status
    } = req.body;

    const bom = await Bom.findById(req.params.id)
      .populate('parent_item_id');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    if (bom.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update cancelled BOM'
      });
    }

if (bom.bom_category === 'Standard' && components && components.length > 0) {
  return res.status(400).json({
    success: false,
    message: 'Standard BOMs cannot have components. Use Assembly BOM for components.'
  });
}

if (bom.bom_category === 'Assembly') {
  if (!components || components.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Assembly BOM must have at least one component'
    });
  }
}
    let itemMap = null;
    if (components) {
      const componentIds = components.map(c => c.component_item_id);
      const componentItems = await Item.find({
        _id: { $in: componentIds }
      });

      if (componentItems.length !== componentIds.length) {
        const foundIds = componentItems.map(i => i._id.toString());
        const missingIds = componentIds.filter(id => !foundIds.includes(id.toString()));
        return res.status(400).json({
          success: false,
          message: 'Some component items not found',
          missing_ids: missingIds
        });
      }

      itemMap = new Map(componentItems.map(i => [i._id.toString(), i]));

      const validationResult = await validateComponents(components, componentItems);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
          errors: validationResult.errors
        });
      }
    }

    if (bom_version && bom_version !== bom.bom_version) {
      const existingBOM = await Bom.findOne({
        parent_item_id: bom.parent_item_id,
        bom_version
      });

      if (existingBOM && existingBOM._id.toString() !== bom._id.toString()) {
        return res.status(400).json({
          success: false,
          message: `BOM version ${bom_version} already exists for this item`
        });
      }
    }

    const changes = [];
    if (bom_version && bom_version !== bom.bom_version) changes.push('version');
    if (components) changes.push('components');
    if (batch_size && batch_size !== bom.batch_size) changes.push('batch_size');
    if (bom_type && bom_type !== bom.bom_type) changes.push('type');

    if (bom_version) bom.bom_version = bom_version;
    if (bom_type) bom.bom_type = bom_type;
    if (batch_size) bom.batch_size = batch_size;
    if (yield_percent !== undefined) bom.yield_percent = yield_percent;
    if (setup_time_min !== undefined) bom.setup_time_min = setup_time_min;
    if (cycle_time_min !== undefined) bom.cycle_time_min = cycle_time_min;
    
    if (components && itemMap) {
      bom.components = components.map(c => {
       // Look up by ObjectId string or by item_id string — whichever was sent
const item = itemMap.get(c.component_item_id.toString())
          || itemMap.get(c.component_item_id.toString().toUpperCase());
        return {
          ...c,
          component_part_no: c.component_part_no || (item ? item.part_no : ''),
          component_desc: c.component_desc || (item ? item.part_description : ''),
          unit: c.unit || (item ? item.unit : 'Nos'),
          level: c.level !== undefined ? c.level : 1,
          scrap_percent: c.scrap_percent !== undefined ? c.scrap_percent : 0,
          is_phantom: c.is_phantom !== undefined ? c.is_phantom : false,
          is_subcontract: c.is_subcontract !== undefined ? c.is_subcontract : false,
        };
      });
    }
    
    if (effective_from) bom.effective_from = effective_from;
    if (effective_to !== undefined) bom.effective_to = effective_to;
    if (status) bom.status = status;
    
    bom.updated_by = req.user._id;

    await bom.save();

    if (components || bom_version) {
      const newRevisionNo = (bom.current_revision || 0) + 1;

      const revisionData = {
        revision_id: `REV-${bom.bom_id}-${String(newRevisionNo).padStart(3, '0')}`,
        bom_id: bom._id,
        revision_no: newRevisionNo,
        snapshot_data: {
          bom_id: bom.bom_id,
          bom_category: bom.bom_category, 
          parent_item: {
            _id: bom.parent_item_id._id,
            part_no: bom.parent_item_id.part_no,
            part_description: bom.parent_item_id.part_description
          },
          bom_version: bom.bom_version,
          bom_type: bom.bom_type,
          batch_size: bom.batch_size,
          components: bom.components
        },
        change_description: `Updated: ${changes.join(', ')}`,
        created_by: req.user._id,
        previous_revision_no: bom.current_revision,
        is_current: true
      };

      await BomRevision.create(revisionData);

      if (bom.current_revision !== undefined && bom.current_revision > 0) {
        await BomRevision.updateMany(
          { bom_id: bom._id, revision_no: bom.current_revision },
          { $set: { is_current: false } }
        );
      }

      bom.current_revision = newRevisionNo;
      await bom.save();
    }

    const updatedBom = await Bom.findById(bom._id)
      .populate('parent_item_id', 'part_no part_description')
      .populate('components.component_item_id', 'part_no part_description unit')
      .populate('components.subcontract_vendor', 'name vendor_code')
      .populate('updated_by', 'name email');

    res.status(200).json({
      success: true,
      message: 'BOM updated successfully',
      data: updatedBom
    });

  } catch (error) {
    console.error('Update BOM error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Set BOM as default
// @route   POST /api/boms/:id/set-default
// @access  Manager
const setDefaultBOM = async (req, res) => {
  try {
    const bom = await Bom.findById(req.params.id)
      .populate('parent_item_id');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    if (!bom.approved_by) {
      return res.status(400).json({
        success: false,
        message: 'BOM must be approved before setting as default'
      });
    }

    if (bom.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Only Active BOMs can be set as default'
      });
    }

    await Bom.updateMany(
      { 
        parent_item_id: bom.parent_item_id,
        _id: { $ne: bom._id }
      },
      { $set: { is_default: false } }
    );

    bom.is_default = true;
    await bom.save();

    res.status(200).json({
      success: true,
      message: 'BOM set as default successfully',
      data: {
        bom_id: bom.bom_id,
        parent_part_no: bom.parent_part_no,
        bom_version: bom.bom_version,
        is_default: true
      }
    });

  } catch (error) {
    console.error('Set default BOM error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get BOM explosion (multi-level)
// @route   GET /api/boms/:id/explosion
// @access  All roles
const explodeBOM = async (req, res) => {
  try {
    const { quantity = 1, effective_date = new Date() } = req.query;

    const bom = await Bom.findById(req.params.id)
      .populate('parent_item_id')
      .populate({
        path: 'components.component_item_id',
        select: 'part_no part_description item_type is_phantom'
      });

    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }

    // Assembly BOM early return
  if (bom.bom_category === 'Standard') {
  return res.status(200).json({
    success: true,
    data: {
      bom_id: bom.bom_id,
      bom_category: 'Standard',
      parent_item: {
        part_no: bom.parent_part_no,
        description: bom.parent_item_id?.part_description || ''
      },
      requested_quantity: parseFloat(quantity),
      total_components: 0,
      total_quantity_by_unit: {},
      explosion: [],
      summary: {
        total_unique_components: 0,
        total_quantity_by_unit: {},
        note: 'Standard BOM has no components to explode.'
      }
    }
  });
}
    const explosionResult = await explodeBOMRecursive(bom, parseFloat(quantity), new Date(effective_date));

    res.status(200).json({
      success: true,
      data: {
        bom_id: bom.bom_id,
        parent_item: {
          part_no:     bom.parent_part_no,
          description: bom.parent_item_id?.part_description || ''
        },
        requested_quantity:     parseFloat(quantity),
        total_components:       explosionResult.summary.total_unique_components,
        total_quantity_by_unit: explosionResult.summary.total_quantity_by_unit,
        explosion:              explosionResult.components,
        summary:                explosionResult.summary
      }
    });

  } catch (error) {
    console.error('BOM explosion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Where used (find all BOMs where item is a component)
// @route   GET /api/boms/where-used/:componentId
// @access  All roles
const whereUsed = async (req, res) => {
  try {
    const { componentId } = req.params;

    const component = await Item.findById(componentId);
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component item not found'
      });
    }

    const boms = await Bom.find({
      'components.component_item_id': componentId,
      is_active: true
    })
      .populate('parent_item_id', 'part_no part_description')
      .populate('created_by', 'name email')
      .select('bom_id parent_part_no bom_version is_default status effective_from effective_to');

    res.status(200).json({
      success: true,
      data: {
        component: {
          _id: component._id,
          part_no: component.part_no,
          part_description: component.part_description
        },
        used_in_boms: boms.map(bom => ({
          bom_id: bom.bom_id,
          parent_part_no: bom.parent_part_no,
          parent_description: bom.parent_item_id?.part_description,
          bom_version: bom.bom_version,
          is_default: bom.is_default,
          status: bom.status,
          effective_from: bom.effective_from,
          effective_to: bom.effective_to
        }))
      }
    });

  } catch (error) {
    console.error('Where used error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Validate BOM
// @route   GET /api/boms/:id/validate
// @access  All roles
// @desc    Validate BOM
// @route   GET /api/boms/:id/validate
// @access  All roles
const validateBOM = async (req, res) => {
  try {
    const bom = await Bom.findById(req.params.id)
      .populate('parent_item_id')
      .populate({
        path: 'components.component_item_id',
        select: 'part_no part_description is_active'
      });

    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }

    const issues = [];
    const isStandard = bom.bom_category === 'Standard';

    // Parent check - for all BOM types
    if (!bom.parent_item_id) {
      issues.push({ type: 'error', message: 'Parent item reference is missing' });
    } else if (!bom.parent_item_id.is_active) {
      issues.push({ type: 'error', message: `Parent item ${bom.parent_part_no} is inactive` });
    }

    // Standard BOM - has NO components, skip component validation
    if (isStandard) {
      issues.push({
        type: 'info',
        message: 'Standard BOM — no component validation required.'
      });
    } 
    // Assembly BOM - MUST have components, perform full validation
    else {
      // Assembly BOM - check if components exist
      if (!bom.components || bom.components.length === 0) {
        issues.push({ 
          type: 'error', 
          message: 'Assembly BOM must have at least one component' 
        });
      }

      // Full component checks for Assembly BOM
      for (const comp of bom.components) {
        if (!comp.component_item_id) {
          issues.push({ type: 'error', message: `Component at level ${comp.level} has invalid item reference` });
          continue;
        }

        if (!comp.component_item_id.is_active) {
          issues.push({ type: 'warning', message: `Component ${comp.component_part_no} is inactive` });
        }

        if (comp.component_item_id._id.toString() === bom.parent_item_id._id.toString()) {
          issues.push({ type: 'error', message: `Circular reference: Component ${comp.component_part_no} is same as parent item` });
        }

        if (comp.quantity_per <= 0) {
          issues.push({ type: 'error', message: `Component ${comp.component_part_no} has invalid quantity: ${comp.quantity_per}` });
        }

        if (comp.scrap_percent < 0 || comp.scrap_percent > 100) {
          issues.push({ type: 'error', message: `Component ${comp.component_part_no} has invalid scrap percent: ${comp.scrap_percent}` });
        }
      }

      // Duplicate component check
      const seen = new Map();
      for (const comp of bom.components) {
        const key = `${comp.level}-${comp.component_part_no}`;
        if (seen.has(key)) {
          issues.push({ type: 'warning', message: `Duplicate component ${comp.component_part_no} at level ${comp.level}` });
        }
        seen.set(key, true);
      }
    }

    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;

    res.status(200).json({
      success: true,
      data: {
        bom_id: bom.bom_id,
        bom_category: bom.bom_category,
        parent_part_no: bom.parent_part_no,
        is_valid: errorCount === 0,
        issues,
        summary: { error_count: errorCount, warning_count: warningCount, info_count: infoCount }
      }
    });

  } catch (error) {
    console.error('Validate BOM error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Copy BOM to new version
// @route   POST /api/boms/:id/copy
// @access  Manager, Production
const copyBOM = async (req, res) => {
  try {
    const { new_version, change_description } = req.body;

    if (!new_version) {
      return res.status(400).json({
        success: false,
        message: 'New version number is required'
      });
    }

    const sourceBom = await Bom.findById(req.params.id)
      .populate('parent_item_id');

    if (!sourceBom) {
      return res.status(404).json({
        success: false,
        message: 'Source BOM not found'
      });
    }

    const existingBom = await Bom.findOne({
      parent_item_id: sourceBom.parent_item_id,
      bom_version: new_version
    });

    if (existingBom) {
      return res.status(400).json({
        success: false,
        message: `BOM version ${new_version} already exists for this item`
      });
    }

    const bom_id = await generateBomId();

    const newBom = await Bom.create({
      bom_id,
      parent_item_id: sourceBom.parent_item_id,
      parent_part_no: sourceBom.parent_part_no,
      bom_version: new_version,
      bom_type: sourceBom.bom_type,
       bom_category:    sourceBom.bom_category || 'Standard',   
      batch_size: sourceBom.batch_size,
      yield_percent: sourceBom.yield_percent,
      setup_time_min: sourceBom.setup_time_min,
      cycle_time_min: sourceBom.cycle_time_min,
      components: sourceBom.components.map(c => {
        const componentObj = c.toObject ? c.toObject() : c;
        return {
          ...componentObj,
          level: componentObj.level !== undefined ? componentObj.level : 1,
          scrap_percent: componentObj.scrap_percent !== undefined ? componentObj.scrap_percent : 0,
          is_phantom: componentObj.is_phantom !== undefined ? componentObj.is_phantom : false,
          is_subcontract: componentObj.is_subcontract !== undefined ? componentObj.is_subcontract : false,
        };
      }),
      effective_from: new Date(),
      effective_to: null,
      status: 'Pending',
      created_by: req.user._id,
      current_revision: 0
    });

    const revisionData = {
      revision_id: `REV-${bom_id}-000`,
      bom_id: newBom._id,
      revision_no: 0,
      snapshot_data: {
        bom_id: newBom.bom_id,
        bom_category: newBom.bom_category,
        parent_item: {
          _id: sourceBom.parent_item_id._id,
          part_no: sourceBom.parent_item_id.part_no,
          part_description: sourceBom.parent_item_id.part_description
        },
        bom_version: newBom.bom_version,
        bom_type: newBom.bom_type,
        batch_size: newBom.batch_size,
        components: newBom.components
      },
      change_description: change_description || `Copied from ${sourceBom.bom_id} v${sourceBom.bom_version}`,
      created_by: req.user._id,
      is_current: true
    };

    await BomRevision.create(revisionData);

    const populatedBom = await Bom.findById(newBom._id)
      .populate('parent_item_id', 'part_no part_description')
      .populate('components.component_item_id', 'part_no part_description');

    res.status(201).json({
      success: true,
      message: 'BOM copied successfully',
      data: populatedBom
    });

  } catch (error) {
    console.error('Copy BOM error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const approveBOM = async (req, res) => {
  try {
    const bom = await Bom.findById(req.params.id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    if (bom.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve BOM in ${bom.status} status. Only Pending BOMs can be approved.`
      });
    }

    bom.status = 'Approved';          // ← was 'Active', now 'Approved'
    bom.approved_by = req.user._id;
    bom.approved_at = new Date();
    await bom.save();

    res.status(200).json({
      success: true,
      message: 'BOM approved successfully',
      data: {
        bom_id: bom.bom_id,
        status: bom.status,           // will now return 'Approved'
        approved_by: req.user._id,
        approved_at: bom.approved_at
      }
    });

  } catch (error) {
    console.error('Approve BOM error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate BOM cost rollup
// @route   GET /api/boms/:id/cost-rollup
// @access  All roles
const costRollup = async (req, res) => {
  try {
    const { quantity = 1, as_of_date = new Date() } = req.query;

    const bom = await Bom.findById(req.params.id)
      .populate('parent_item_id')
      .populate({
        path: 'components.component_item_id',
        select: 'part_no part_description item_category rm_grade density unit'
      });

    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }

    // Assembly BOM early return
  if (bom.bom_category === 'Standard') {
  return res.status(200).json({
    success: true,
    data: {
      bom_id: bom.bom_id,
      bom_category: 'Standard',
      parent_item: {
        part_no: bom.parent_part_no,
        description: bom.parent_item_id?.part_description || ''
      },
      requested_quantity: parseFloat(quantity),
      total_cost: 0,
      cost_breakdown: [],
      summary: {
        total_material_cost: 0,
        total_process_cost: 0,
        total_subcontract_cost: 0,
        cost_per_unit: 0,
        note: 'Standard BOM has no components. Cost cannot be calculated.'
      }
    }
  });
}

    const rmRates    = await getCurrentRMRates(as_of_date);
    const costResult = await calculateCostRecursive(bom, parseFloat(quantity), rmRates, new Set());

    res.status(200).json({
      success: true,
      data: {
        bom_id: bom.bom_id,
        parent_item: {
          part_no:     bom.parent_part_no,
          description: bom.parent_item_id?.part_description || ''
        },
        requested_quantity: parseFloat(quantity),
        total_cost:         costResult.total_cost,
        cost_breakdown:     costResult.breakdown,
        summary: {
          total_material_cost:    costResult.summary.material_cost,
          total_process_cost:     costResult.summary.process_cost || 0,
          total_subcontract_cost: costResult.summary.subcontract_cost || 0,
          cost_per_unit:          costResult.total_cost / parseFloat(quantity)
        }
      }
    });

  } catch (error) {
    console.error('Cost rollup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Calculate cost for single component
// @route   POST /api/boms/calculate-component-cost
// @access  All roles
const calculateComponentCost = async (req, res) => {
  try {
    const { component_item_id, quantity, scrap_percent = 0 } = req.body;

    if (!component_item_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Component item ID and quantity are required'
      });
    }

    const item = await Item.findById(component_item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    let rmRate = null;
    try {
      const RmRate = require('../../models/CRM/RawMaterial');
      rmRate = await RmRate.findOne({
        Grade: item.rm_grade,
        IsActive: true
      }).sort('-DateEffective');
    } catch (err) {
      console.warn('RM Rate lookup failed:', err.message);
    }

    if (!rmRate && item.item_category === 'Raw Material') {
      return res.status(404).json({
        success: false,
        message: `No RM rate found for grade ${item.rm_grade}`
      });
    }

    const baseQuantity = parseFloat(quantity);
    const quantityWithScrap = baseQuantity * (1 + scrap_percent / 100);
    const materialCost = rmRate ? quantityWithScrap * (rmRate.EffectiveRate || rmRate.RatePerKG || 0) : 0;

    res.status(200).json({
      success: true,
      data: {
        item: {
          part_no: item.part_no,
          description: item.part_description,
          rm_grade: item.rm_grade,
          density: item.density,
          item_category: item.item_category
        },
        rm_rate: rmRate ? {
          rate_per_kg: rmRate.RatePerKG,
          effective_rate: rmRate.EffectiveRate,
          effective_from: rmRate.DateEffective,
          source: rmRate.MaterialName
        } : null,
        quantity: {
          base: baseQuantity,
          with_scrap: quantityWithScrap,
          scrap_percent
        },
        material_cost: materialCost,
        cost_per_unit: baseQuantity > 0 ? materialCost / baseQuantity : 0
      }
    });

  } catch (error) {
    console.error('Calculate component cost error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get BOM by parent item ID (get all BOM versions for an item)
// @route   GET /api/boms/by-item/:itemId
// @access  All roles
const getBOMByItemId = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find the item first to validate it exists
    let parentItem;
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      parentItem = await Item.findById(itemId);
    } else {
      parentItem = await Item.findOne({ item_id: itemId.toString().toUpperCase() });
    }
    
    if (!parentItem) {
      return res.status(404).json({
        success: false,
        message: `Item not found: ${itemId}`
      });
    }
    
    // Find all BOMs for this parent item
    const boms = await Bom.find({
      parent_item_id: parentItem._id,
      is_active: true
    })
      .populate('parent_item_id', 'part_no part_description drawing_no revision_no')
      .populate('components.component_item_id', 'part_no part_description unit')
      .populate('components.subcontract_vendor', 'name vendor_code')
      .populate('created_by', 'name email')
      .populate('approved_by', 'name email')
      .sort({ is_default: -1, created_at: -1 }); // Default BOM first, then newest
    
    const defaultBom = boms.find(b => b.is_default === true);
    const activeBom = boms.find(b => b.status === 'Approved' && !b.is_default);
    
    res.status(200).json({
      success: true,
      data: {
        item: {
          _id: parentItem._id,
          item_id: parentItem.item_id,
          part_no: parentItem.part_no,
          part_description: parentItem.part_description,
          item_category: parentItem.item_category
        },
        total_bom_versions: boms.length,
        default_bom: defaultBom || null,
        current_active_bom: activeBom || null,
        all_boms: boms
      }
    });
    
  } catch (error) {
    console.error('Get BOM by item ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get default BOM for an item (single result)
// @route   GET /api/boms/by-item/:itemId/default
// @access  All roles
const getDefaultBOMByItemId = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    let parentItem;
    if (mongoose.Types.ObjectId.isValid(itemId)) {
      parentItem = await Item.findById(itemId);
    } else {
      parentItem = await Item.findOne({ item_id: itemId.toString().toUpperCase() });
    }
    
    if (!parentItem) {
      return res.status(404).json({
        success: false,
        message: `Item not found: ${itemId}`
      });
    }
    
    const bom = await Bom.findOne({
      parent_item_id: parentItem._id,
      is_default: true,
      is_active: true
    })
      .populate('parent_item_id', 'part_no part_description drawing_no revision_no')
      .populate('components.component_item_id', 'part_no part_description unit rm_grade')
      .populate('components.subcontract_vendor', 'name vendor_code')
      .populate('created_by', 'name email')
      .populate('approved_by', 'name email');
    
    if (!bom) {
      return res.status(404).json({
        success: false,
        message: `No default BOM found for item: ${parentItem.part_no}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: bom
    });
    
  } catch (error) {
    console.error('Get default BOM by item ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Deactivate BOM (soft delete)
// @route   DELETE /api/boms/:id
// @access  Manager, Production
const deleteBOM = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BOM ID'
      });
    }

    const bom = await Bom.findById(id);

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    if (!bom.is_active) {
      return res.status(400).json({
        success: false,
        message: 'BOM is already inactive'
      });
    }

    bom.is_active = false;
    bom.is_default = false;
    bom.updated_by = req.user._id;

    await bom.save();

    return res.status(200).json({
      success: true,
      message: 'BOM deactivated successfully',
      data: {
        _id: bom._id,
        bom_id: bom.bom_id,
        is_active: false
      }
    });
  } catch (error) {
    console.error('Delete BOM error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ===================== EXPORTS =====================
module.exports = {
  createBOM,
  getBOMs,
  getBOMById,
  updateBOM,
  setDefaultBOM,
  explodeBOM,
  whereUsed,
  validateBOM,
  copyBOM,
  approveBOM,
  costRollup,
  calculateComponentCost,
  getDefaultBOMByItemId,
  getBOMByItemId,
  deleteBOM
};