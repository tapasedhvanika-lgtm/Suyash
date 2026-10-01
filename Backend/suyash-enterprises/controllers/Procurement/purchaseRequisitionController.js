
// controllers/Procurement/purchaseRequisitionController.js
const PurchaseRequisition = require('../../models/Procurement/PurchaseRequisition');
const Item = require('../../models/CRM/Item');
const Department = require('../../models/HR/Department');
const Vendor = require('../../models/CRM/Vendor');

// ======================================================
// CREATE PURCHASE REQUISITION
// POST /api/purchase-requisitions
// ======================================================
exports.createPurchaseRequisition = async (req, res) => {
  try {
    const {
      pr_type,
      source,
      mrp_run_id,
      department,
      required_by,
      items
    } = req.body;

    console.log('Creating PR with data:', req.body);

    // ===== VALIDATIONS =====

    // 1. Validate department exists
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required',
        error: 'DEPARTMENT_REQUIRED'
      });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found',
        error: 'DEPARTMENT_NOT_FOUND'
      });
    }

    // 2. Validate required_by is a future date
    const requiredDate = new Date(required_by);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requiredDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Required by date must be a future date',
        error: 'INVALID_REQUIRED_DATE'
      });
    }

    // 3. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required',
        error: 'ITEMS_REQUIRED'
      });
    }

    // 4. Validate each item and fetch item details
    const validatedItems = [];
    for (const item of items) {
      const itemDetails = await Item.findById(item.item_id);
      if (!itemDetails) {
        return res.status(400).json({
          success: false,
          message: `Item with ID ${item.item_id} not found`,
          error: 'ITEM_NOT_FOUND'
        });
      }

      if (!item.required_qty || item.required_qty < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item ${itemDetails.part_no}`,
          error: 'INVALID_QUANTITY'
        });
      }

      validatedItems.push({
        item_id: item.item_id,
        part_no: itemDetails.part_no,
        description: itemDetails.part_description,
        required_qty: item.required_qty,
        unit: itemDetails.unit,
        estimated_price: item.estimated_price || 0,
        required_date: requiredDate,
        remarks: item.remarks || '',
        status: 'Pending',
        po_ids: []
      });
    }

    // 5. Create PR
    const prData = {
      pr_type,
      source: source || 'Manual',
      department: department, // Now storing ObjectId
      items: validatedItems,
      requested_by: req.user._id,
      required_by: requiredDate,
      status: 'Submitted',
      po_ids: [],
      created_by: req.user._id,
      updated_by: req.user._id
    };

    if (mrp_run_id && mrp_run_id !== 'null' && mrp_run_id !== '') {
      prData.mrp_run_id = mrp_run_id;
    }

    const pr = new PurchaseRequisition(prData);
    await pr.save();

    // 6. Populate references for response
    await pr.populate([
      { path: 'requested_by', select: 'Username Email' },
      { path: 'department', select: 'DepartmentName Description HeadOfDepartment' },
      { path: 'items.item_id', select: 'part_no part_description hsn_code unit' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Purchase requisition created successfully',
      data: {
        _id: pr._id,
        pr_number: pr.pr_number,
        pr_date: pr.pr_date,
        pr_type: pr.pr_type,
        source: pr.source,
        mrp_run_id: pr.mrp_run_id,
        department: pr.department ? {
          _id: pr.department._id,
          name: pr.department.DepartmentName,
          description: pr.department.Description
        } : null,
        status: pr.status,
        required_by: pr.required_by,
        items: pr.items.map(item => ({
          item_id: item.item_id._id,
          part_no: item.part_no,
          description: item.description,
          required_qty: item.required_qty,
          unit: item.unit,
          estimated_price: item.estimated_price,
          required_date: item.required_date,
          remarks: item.remarks,
          status: item.status
        })),
        requested_by: {
          _id: pr.requested_by._id,
          username: pr.requested_by.Username,
          email: pr.requested_by.Email
        },
        po_ids: pr.po_ids,
        created_at: pr.createdAt
      }
    });

  } catch (error) {
    console.error('Create PR error details:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate PR number generated. Please try again.',
        error: 'DUPLICATE_PR_NUMBER'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create purchase requisition',
      error: error.message
    });
  }
};

// ======================================================
// APPROVE PURCHASE REQUISITION
// PUT /api/purchase-requisitions/:id/approve
// ======================================================
exports.approvePurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_notes } = req.body;

    const pr = await PurchaseRequisition.findById(id);
    if (!pr) {
      return res.status(404).json({
        success: false,
        message: 'Purchase requisition not found',
        error: 'PR_NOT_FOUND'
      });
    }

    if (pr.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve PR with status: ${pr.status}. PR must be in 'Submitted' state`,
        error: 'INVALID_PR_STATUS'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requiredDate = new Date(pr.required_by);
    
    if (requiredDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve PR as required_by date has passed. Please create a new PR.',
        error: 'REQUIRED_DATE_PASSED'
      });
    }

    pr.status = 'Approved';
    pr.approved_by = req.user._id;
    pr.approved_at = new Date();
    pr.updated_by = req.user._id;
    
    if (approval_notes) {
      pr.remarks = approval_notes;
    }

    await pr.save();

    await pr.populate([
      { path: 'requested_by', select: 'Username Email' },
      { path: 'approved_by', select: 'Username Email' },
      { path: 'department', select: 'DepartmentName' },
      { path: 'items.item_id', select: 'part_no part_description' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Purchase requisition approved successfully',
      data: {
        _id: pr._id,
        pr_number: pr.pr_number,
        status: pr.status,
        department: pr.department ? pr.department.DepartmentName : null,
        approved_by: {
          _id: pr.approved_by._id,
          username: pr.approved_by.Username,
          email: pr.approved_by.Email
        },
        approved_at: pr.approved_at,
        required_by: pr.required_by,
        items: pr.items.map(item => ({
          part_no: item.part_no,
          description: item.description,
          required_qty: item.required_qty,
          unit: item.unit
        }))
      }
    });

  } catch (error) {
    console.error('Approve PR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve purchase requisition',
      error: error.message
    });
  }
};

// ======================================================
// REJECT PURCHASE REQUISITION
// PUT /api/purchase-requisitions/:id/reject
// ======================================================
exports.rejectPurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
        error: 'REJECTION_REASON_REQUIRED'
      });
    }

    const pr = await PurchaseRequisition.findById(id);
    if (!pr) {
      return res.status(404).json({
        success: false,
        message: 'Purchase requisition not found',
        error: 'PR_NOT_FOUND'
      });
    }

    if (pr.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject PR with status: ${pr.status}. PR must be in 'Submitted' state`,
        error: 'INVALID_PR_STATUS'
      });
    }

    pr.status = 'Rejected';
    pr.rejection_reason = rejection_reason;
    pr.approved_by = req.user._id;
    pr.approved_at = new Date();
    pr.updated_by = req.user._id;

    await pr.save();

    res.status(200).json({
      success: true,
      message: 'Purchase requisition rejected successfully',
      data: {
        _id: pr._id,
        pr_number: pr.pr_number,
        status: pr.status,
        rejection_reason: pr.rejection_reason,
        rejected_by: req.user.Username,
        rejected_at: pr.approved_at
      }
    });

  } catch (error) {
    console.error('Reject PR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject purchase requisition',
      error: error.message
    });
  }
};

// ======================================================
// GET PURCHASE REQUISITION BY ID
// GET /api/purchase-requisitions/:id
// ======================================================
exports.getPurchaseRequisitionById = async (req, res) => {
  try {
    const { id } = req.params;

    const pr = await PurchaseRequisition.findById(id)
      .populate('requested_by', 'Username Email')
      .populate('approved_by', 'Username Email')
      .populate('department', 'DepartmentName Description HeadOfDepartment')
      .populate('items.item_id', 'part_no part_description hsn_code unit')
      .populate('mrp_run_id')
      .populate('wo_id')
      .populate('po_ids');

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: 'Purchase requisition not found',
        error: 'PR_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: pr
    });

  } catch (error) {
    console.error('Get PR by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase requisition',
      error: error.message
    });
  }
};

// ======================================================
// GET ALL PURCHASE REQUISITIONS
// GET /api/purchase-requisitions
// ======================================================
exports.getAllPurchaseRequisitions = async (req, res) => {
  try {
    const {
      status,
      pr_type,
      department,
      from_date,
      to_date,
      search,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (pr_type) filter.pr_type = pr_type;
    if (department) filter.department = department;

    if (from_date || to_date) {
      filter.createdAt = {};
      if (from_date) filter.createdAt.$gte = new Date(from_date);
      if (to_date) filter.createdAt.$lte = new Date(to_date);
    }

    if (search) {
      filter.pr_number = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    const prs = await PurchaseRequisition.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requested_by', 'Username Email')
      .populate('approved_by', 'Username Email')
      .populate('department', 'DepartmentName');

    const total = await PurchaseRequisition.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: prs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all PRs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase requisitions',
      error: error.message
    });
  }
};

// ======================================================
// UPDATE PURCHASE REQUISITION
// PUT /api/purchase-requisitions/:id
// ======================================================
exports.updatePurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pr_type,
      source,
      mrp_run_id,
      wo_id,
      department,
      items,
      required_by,
      status,
      rejection_reason
    } = req.body;

    const pr = await PurchaseRequisition.findById(id);
    if (!pr) {
      return res.status(404).json({
        success: false,
        message: 'Purchase requisition not found',
        error: 'PR_NOT_FOUND'
      });
    }

    if (pr.status !== 'Draft' && pr.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot update PR with status: ${pr.status}. Only Draft or Submitted PRs can be updated`,
        error: 'INVALID_PR_STATUS'
      });
    }

    // Validate department if provided
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Department not found',
          error: 'DEPARTMENT_NOT_FOUND'
        });
      }
      pr.department = department;
    }

    if (required_by) {
      const requiredDate = new Date(required_by);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (requiredDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Required by date must be a future date',
          error: 'INVALID_REQUIRED_DATE'
        });
      }
      pr.required_by = requiredDate;
    }

    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one item is required',
          error: 'ITEMS_REQUIRED'
        });
      }

      const validatedItems = [];
      for (const item of items) {
        const itemDetails = await Item.findById(item.item_id);
        if (!itemDetails) {
          return res.status(400).json({
            success: false,
            message: `Item with ID ${item.item_id} not found`,
            error: 'ITEM_NOT_FOUND'
          });
        }

        if (!item.required_qty || item.required_qty < 1) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity for item ${itemDetails.part_no}`,
            error: 'INVALID_QUANTITY'
          });
        }

        const existingItemIndex = pr.items.findIndex(
          i => i.item_id.toString() === item.item_id.toString()
        );

        const itemData = {
          item_id: item.item_id,
          part_no: itemDetails.part_no,
          description: itemDetails.part_description,
          required_qty: item.required_qty,
          unit: itemDetails.unit,
          estimated_price: item.estimated_price || 0,
          required_date: required_by ? new Date(required_by) : pr.required_by,
          remarks: item.remarks || '',
          status: item.status || 'Pending'
        };

        if (existingItemIndex >= 0) {
          validatedItems.push({
            ...itemData,
            _id: pr.items[existingItemIndex]._id
          });
        } else {
          validatedItems.push(itemData);
        }
      }

      pr.items = validatedItems;
    }

    if (pr_type) pr.pr_type = pr_type;
    if (source) pr.source = source;
    if (mrp_run_id) pr.mrp_run_id = mrp_run_id;
    if (wo_id) pr.wo_id = wo_id;
    
    if (status) {
      const allowedStatuses = ['Draft', 'Submitted', 'Rejected'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot manually set status to ${status}. Use approve/reject endpoints for status changes`,
          error: 'INVALID_STATUS_UPDATE'
        });
      }
      pr.status = status;
    }

    if (rejection_reason !== undefined) {
      pr.rejection_reason = rejection_reason;
    }

    pr.updated_by = req.user._id;
    await pr.save();

    await pr.populate([
      { path: 'requested_by', select: 'Username Email' },
      { path: 'updated_by', select: 'Username Email' },
      { path: 'department', select: 'DepartmentName' },
      { path: 'items.item_id', select: 'part_no part_description hsn_code unit' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Purchase requisition updated successfully',
      data: {
        _id: pr._id,
        pr_number: pr.pr_number,
        pr_date: pr.pr_date,
        pr_type: pr.pr_type,
        source: pr.source,
        department: pr.department ? pr.department.DepartmentName : null,
        status: pr.status,
        required_by: pr.required_by,
        items: pr.items.map(item => ({
          _id: item._id,
          item_id: item.item_id._id,
          part_no: item.part_no,
          description: item.description,
          required_qty: item.required_qty,
          unit: item.unit,
          estimated_price: item.estimated_price,
          required_date: item.required_date,
          remarks: item.remarks,
          status: item.status
        })),
        requested_by: pr.requested_by ? {
          _id: pr.requested_by._id,
          username: pr.requested_by.Username,
          email: pr.requested_by.Email
        } : null,
        rejection_reason: pr.rejection_reason,
        created_at: pr.createdAt,
        updated_at: pr.updatedAt
      }
    });

  } catch (error) {
    console.error('Update PR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase requisition',
      error: error.message
    });
  }
};

// ======================================================
// GET AGING REQUISITIONS
// GET /api/purchase-requisitions/aging
// ======================================================
exports.getAgingRequisitions = async (req, res) => {
  try {
    const { days = 3 } = req.query;
    const slaDays = parseInt(days);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - slaDays);

    const agingPRs = await PurchaseRequisition.find({
      status: 'Submitted',
      createdAt: { $lte: cutoffDate }
    })
      .populate('requested_by', 'Username Email')
      .populate('department', 'DepartmentName')
      .populate('items.item_id', 'part_no part_description')
      .sort({ createdAt: 1 });

    const now = new Date();
    const enrichedPRs = agingPRs.map(pr => {
      const createdDate = new Date(pr.createdAt);
      const agingDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      
      const totalValue = pr.items.reduce((sum, item) => 
        sum + (item.estimated_price * item.required_qty), 0);

      return {
        _id: pr._id,
        pr_number: pr.pr_number,
        pr_date: pr.pr_date,
        created_at: pr.createdAt,
        aging_days: agingDays,
        requested_by: pr.requested_by ? pr.requested_by.Username : 'Unknown',
        department: pr.department ? pr.department.DepartmentName : 'Unknown',
        total_value: totalValue,
        items_count: pr.items.length,
        required_by: pr.required_by,
        status: pr.status,
        is_critical: agingDays > slaDays * 2,
        days_exceeded: agingDays - slaDays
      };
    });

    const criticalPRs = enrichedPRs.filter(pr => pr.is_critical);
    const warningPRs = enrichedPRs.filter(pr => !pr.is_critical && pr.aging_days > slaDays);
    
    const summary = {
      total_pending_approval: await PurchaseRequisition.countDocuments({ status: 'Submitted' }),
      aging_count: enrichedPRs.length,
      critical_count: criticalPRs.length,
      warning_count: warningPRs.length,
      average_aging_days: enrichedPRs.length > 0 
        ? Math.round(enrichedPRs.reduce((sum, pr) => sum + pr.aging_days, 0) / enrichedPRs.length)
        : 0,
      oldest_pr: enrichedPRs.length > 0 ? enrichedPRs[0].pr_number : null,
      oldest_aging_days: enrichedPRs.length > 0 ? enrichedPRs[0].aging_days : 0
    };

    const departmentWise = {};
    enrichedPRs.forEach(pr => {
      const deptName = pr.department;
      if (!departmentWise[deptName]) {
        departmentWise[deptName] = {
          count: 0,
          total_value: 0,
          aging_days_sum: 0
        };
      }
      departmentWise[deptName].count++;
      departmentWise[deptName].total_value += pr.total_value;
      departmentWise[deptName].aging_days_sum += pr.aging_days;
    });

    Object.keys(departmentWise).forEach(dept => {
      departmentWise[dept].average_aging = Math.round(
        departmentWise[dept].aging_days_sum / departmentWise[dept].count
      );
      delete departmentWise[dept].aging_days_sum;
    });

    res.status(200).json({
      success: true,
      data: {
        sla_days: slaDays,
        cutoff_date: cutoffDate,
        aging_prs: enrichedPRs,
        critical_prs: criticalPRs,
        warning_prs: warningPRs,
        department_wise: departmentWise,
        summary
      }
    });

  } catch (error) {
    console.error('Get aging requisitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aging requisitions',
      error: error.message
    });
  }
};

// ======================================================
// HARD DELETE PURCHASE REQUISITION
// DELETE /api/purchase-requisitions/:id/permanent
// ======================================================
exports.hardDeletePurchaseRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirm_permanent = false } = req.body;

    const pr = await PurchaseRequisition.findById(id);
    
    if (!pr) {
      return res.status(404).json({
        success: false,
        message: 'Purchase requisition not found',
        error: 'PR_NOT_FOUND'
      });
    }

    if (!confirm_permanent) {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required for permanent deletion. Set confirm_permanent: true',
        error: 'CONFIRMATION_REQUIRED'
      });
    }

    const deletableStatuses = ['Draft', 'Submitted', 'Rejected','Approved'];
    if (!deletableStatuses.includes(pr.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete PR with status: ${pr.status}. Only Draft, Submitted, or Rejected PRs can be permanently deleted`,
        error: 'INVALID_PR_STATUS_FOR_DELETION'
      });
    }

    if (pr.po_ids && pr.po_ids.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete PR as it has ${pr.po_ids.length} associated Purchase Order(s). Remove PO associations first`,
        error: 'PR_HAS_ASSOCIATED_POS'
      });
    }

    const prInfo = {
      pr_number: pr.pr_number,
      status: pr.status,
      department: pr.department,
      items_count: pr.items.length
    };

    await pr.deleteOne();

    console.log(`🗑️ PERMANENTLY DELETED PR: ${prInfo.pr_number} by user: ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: `Purchase requisition ${prInfo.pr_number} permanently deleted successfully`,
      data: {
        deleted_pr: prInfo,
        deleted_at: new Date(),
        deleted_by: {
          _id: req.user._id,
          username: req.user.Username || req.user.email
        }
      }
    });

  } catch (error) {
    console.error('Hard delete PR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete purchase requisition',
      error: error.message
    });
  }
};


// ======================================================
// GET PENDING RFQ REQUISITIONS (FIXED - Handles both string and ObjectId department)
// GET /api/purchase-requisitions/pending-rfq
// ======================================================
exports.getPendingRFQRequisitions = async (req, res) => {
  try {
    // First, get all pending PRs WITHOUT populating department (to avoid the cast error)
    const pendingPRs = await PurchaseRequisition.find({
      status: 'Approved',
      $or: [
        { po_ids: { $exists: false } },
        { po_ids: { $size: 0 } },
        { po_ids: null }
      ]
    })
      .populate({
        path: 'requested_by',
        select: 'Username Email'
      })
      .populate({
        path: 'items.item_id',
        model: 'Item',
        select: 'part_no part_description unit hsn_code'
      })
      .sort({ required_by: 1 })
      .lean();
    
    if (pendingPRs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        meta: {
          total_pending: 0,
          actionable_count: 0,
          insufficient_vendors_count: 0
        }
      });
    }
    
    // Process each PR to get department name safely
    const validPRs = [];
    for (const pr of pendingPRs) {
      // Check if items are valid
      const hasValidItems = pr.items && pr.items.length > 0 && 
        pr.items.every(item => item.item_id && item.item_id._id);
      
      if (!hasValidItems) continue;
      
      // Get department name safely (handles both string and ObjectId)
      let departmentObject = null;
      
      if (pr.department) {
        if (typeof pr.department === 'string') {
          // Department is stored as string - find the department by name
          const dept = await Department.findOne({ 
            DepartmentName: { $regex: new RegExp(`^${pr.department}$`, 'i') }
          });
          if (dept) {
            departmentObject = {
              _id: dept._id,
              DepartmentName: dept.DepartmentName
            };
          } else {
            // If not found, return as string for backward compatibility
            departmentObject = pr.department;
          }
        } else if (pr.department._id) {
          // Department is already populated
          departmentObject = {
            _id: pr.department._id,
            DepartmentName: pr.department.DepartmentName
          };
        } else if (typeof pr.department === 'object') {
          // Try to fetch department by ID
          try {
            const dept = await Department.findById(pr.department);
            if (dept) {
              departmentObject = {
                _id: dept._id,
                DepartmentName: dept.DepartmentName
              };
            }
          } catch (err) {
            // If it fails, use the string representation
            departmentObject = pr.department.toString();
          }
        }
      }
      
      validPRs.push({
        ...pr,
        departmentData: departmentObject
      });
    }
    
    const enrichedPRs = await Promise.all(validPRs.map(async (pr) => {
      const itemIds = pr.items
        .filter(item => item.item_id && item.item_id._id)
        .map(item => item.item_id._id);
      
      if (itemIds.length === 0) {
        return {
          _id: pr._id,
          pr_number: pr.pr_number,
          pr_date: pr.pr_date,
          required_by: pr.required_by,
          department: pr.departmentData,
          requested_by: pr.requested_by ? pr.requested_by.Username : null,
          items: [],
          suggested_vendors: [],
          vendor_count: 0,
          days_to_required: 0,
          priority: 'Low',
          total_estimated_value: 0
        };
      }
      
      // Get vendors that supply these items
      let eligibleVendors = await Vendor.find({
        avl_approved: true,
        blacklisted: false,
        avl_items: { $in: itemIds }
      })
        .select('vendor_name vendor_code quality_rating delivery_rating price_rating overall_rating payment_terms credit_days avl_items avl_approved')
        .sort({ overall_rating: -1 })
        .lean();
      
      // If no vendors found with matching items, get all AVL vendors
      if (eligibleVendors.length === 0) {
        eligibleVendors = await Vendor.find({
          avl_approved: true,
          blacklisted: false
        })
          .select('vendor_name vendor_code quality_rating delivery_rating price_rating overall_rating payment_terms credit_days avl_items avl_approved')
          .limit(10)
          .lean();
      }
      
      const today = new Date();
      const requiredDate = new Date(pr.required_by);
      const daysToRequired = !isNaN(requiredDate) && requiredDate > today 
        ? Math.ceil((requiredDate - today) / (1000 * 60 * 60 * 24)) 
        : null;
      
      return {
        _id: pr._id,
        pr_number: pr.pr_number,
        pr_date: pr.pr_date,
        required_by: pr.required_by,
        department: pr.departmentData,
        requested_by: pr.requested_by ? pr.requested_by.Username : null,
        items: pr.items.map(item => ({
          item_id: item.item_id._id,
          part_no: item.item_id.part_no,
          description: item.item_id.part_description,
          required_qty: item.required_qty,
          unit: item.unit,
          estimated_price: item.estimated_price,
          hsn_code: item.item_id.hsn_code
        })),
        suggested_vendors: eligibleVendors.map(v => ({
          _id: v._id,
          vendor_name: v.vendor_name,
          vendor_code: v.vendor_code,
          avl_approved: v.avl_approved || false,
          ratings: {
            quality: v.quality_rating || 0,
            delivery: v.delivery_rating || 0,
            price: v.price_rating || 0,
            overall: v.overall_rating || 0
          },
          payment_terms: v.payment_terms,
          credit_days: v.credit_days
        })),
        vendor_count: eligibleVendors.length,
        days_to_required: daysToRequired,
        priority: daysToRequired !== null && daysToRequired <= 7 ? 'High' 
          : (daysToRequired !== null && daysToRequired <= 15 ? 'Medium' : 'Low'),
        total_estimated_value: pr.items.reduce((sum, item) => 
          sum + ((item.estimated_price || 0) * (item.required_qty || 0)), 0)
      };
    }));
    
    const actionablePRs = enrichedPRs;
    actionablePRs.sort((a, b) => {
      const dateA = a.required_by ? new Date(a.required_by) : new Date(0);
      const dateB = b.required_by ? new Date(b.required_by) : new Date(0);
      return dateA - dateB;
    });
    
    res.status(200).json({
      success: true,
      data: actionablePRs,
      meta: {
        total_pending: pendingPRs.length,
        valid_prs: validPRs.length,
        actionable_count: actionablePRs.length,
        insufficient_vendors_count: 0
      }
    });
    
  } catch (error) {
    console.error('Get pending RFQ with vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending RFQ with vendors',
      error: error.message
    });
  }
};