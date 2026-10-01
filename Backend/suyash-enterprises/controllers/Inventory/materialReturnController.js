// controllers/Inventory/materialReturnController.js
'use strict';

const mongoose = require('mongoose');
const MaterialReturnVoucher = require('../../models/Inventory/MaterialReturnVoucher');
const MaterialIssueVoucher = require('../../models/Inventory/MaterialIssueVoucher');
const {WorkOrder} = require('../../models/Production/WorkOrder');
const StockLedger = require('../../models/Inventory/StockLedger');
const StockTransaction = require('../../models/Inventory/StockTransaction');

// ======================================================
// CREATE MATERIAL RETURN VOUCHER
// ======================================================
exports.createMaterialReturnVoucher = async (req, res) => {
  try {
    const {
      miv_id,
      items,
      condition,
      returned_by,
      received_by,
      remarks
    } = req.body;

    // Validation
    if (!miv_id) {
      return res.status(400).json({ success: false, message: 'miv_id is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }
    if (!returned_by) {
      return res.status(400).json({ success: false, message: 'returned_by is required' });
    }

    // Fetch original MIV
    const originalMIV = await MaterialIssueVoucher.findById(miv_id);
    if (!originalMIV) {
      return res.status(404).json({ success: false, message: 'Original MIV not found' });
    }

    // Validate return quantities
    const returnItems = [];
    let totalReturnValue = 0;

    for (const returnItem of items) {
      const mivItem = originalMIV.items.find(i => 
        i.item_id.toString() === returnItem.item_id.toString()
      );

      if (!mivItem) {
        return res.status(404).json({
          success: false,
          message: `Item ${returnItem.part_no} not found in original MIV`
        });
      }

      const alreadyReturned = mivItem.returned_qty || 0;
      const maxReturnable = mivItem.issued_qty - alreadyReturned;

      if (returnItem.returned_qty > maxReturnable) {
        return res.status(400).json({
          success: false,
          message: `Cannot return ${returnItem.returned_qty} of ${returnItem.part_no}. Max returnable: ${maxReturnable}`
        });
      }

      const returnValue = returnItem.returned_qty * mivItem.unit_cost;
      totalReturnValue += returnValue;

      returnItems.push({
        item_id: mivItem.item_id,
        part_no: mivItem.part_no,
        returned_qty: returnItem.returned_qty,
        unit: mivItem.unit,
        warehouse_id: returnItem.warehouse_id || mivItem.warehouse_id,
        bin_id: returnItem.bin_id,
        batch_no: mivItem.batch_no,
        unit_cost: mivItem.unit_cost,
        total_value: returnValue
      });
    }

    // Create MRV
    const mrv = new MaterialReturnVoucher({
      mrv_date: new Date(),
      miv_id: originalMIV._id,
      miv_number: originalMIV.miv_number,
      wo_id: originalMIV.wo_id,
      wo_number: originalMIV.wo_number,
      so_number: originalMIV.so_number,
      customer_name: originalMIV.customer_name,
      returned_by: returned_by,
      received_by: received_by,
      items: returnItems,
      total_return_value: totalReturnValue,
      condition: condition || 'Good',
      status: 'Draft',
      remarks: remarks,
      created_by: req.user._id
    });

    await mrv.save();

    return res.status(201).json({
      success: true,
      message: 'Material Return Voucher created',
      data: {
        mrv_number: mrv.mrv_number,
        mrv_id: mrv._id,
        total_return_value: totalReturnValue,
        status: 'Draft',
        next_step: 'POST /api/mrv/:id/post to process return and update stock'
      }
    });

  } catch (error) {
    console.error('[MRV] createMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// POST MRV - PROCESS RETURN (Without Transactions)
// ======================================================
exports.postMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find MRV
    const mrv = await MaterialReturnVoucher.findById(id);
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }

    if (mrv.status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: `MRV is already ${mrv.status}` 
      });
    }

    // Fetch original MIV and Work Order
    const originalMIV = await MaterialIssueVoucher.findById(mrv.miv_id);
    const workOrder = await WorkOrder.findById(mrv.wo_id);

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    const transactions = [];
    let totalReturnValue = 0;

    // Helper function to generate stock ID
    const generateStockId = async () => {
      const lastStock = await StockLedger.findOne({}, { stock_id: 1 })
        .sort({ createdAt: -1 })
        .limit(1);
      
      let nextNumber = 1;
      if (lastStock && lastStock.stock_id) {
        const match = lastStock.stock_id.match(/STK-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      return `STK-${String(nextNumber).padStart(6, '0')}`;
    };

    // Process each returned item
    for (const item of mrv.items) {
      // Determine destination warehouse based on condition
      let destinationWarehouse = item.warehouse_id;
      
      if (mrv.condition === 'Scrap') {
        const scrapWH = await mongoose.model('Warehouse').findOne({ 
          warehouse_type: 'Scrap' 
        });
        if (scrapWH) destinationWarehouse = scrapWH._id;
      } else if (mrv.condition === 'Partially Damaged') {
        const quarantineWH = await mongoose.model('Warehouse').findOne({ 
          warehouse_type: 'Quarantine' 
        });
        if (quarantineWH) destinationWarehouse = quarantineWH._id;
      }

      // Find or create stock ledger record
      let stockRecord = await StockLedger.findOne({
        item_id: item.item_id,
        warehouse_id: destinationWarehouse,
        batch_no: item.batch_no
      });

      if (stockRecord) {
        // Update existing stock
        const oldQty = stockRecord.quantity;
        const oldValue = stockRecord.total_value;
        const newQty = oldQty + item.returned_qty;
        const newValue = oldValue + item.total_value;

        if (stockRecord.valuation_method === 'Weighted Average') {
          stockRecord.unit_cost = newValue / newQty;
        }

        stockRecord.quantity = newQty;
        stockRecord.total_value = newValue;
        stockRecord.last_updated = new Date();
        stockRecord.last_updated_by = req.user._id;
        await stockRecord.save();
      } else {
        // Create new stock record with generated ID
        const newStockId = await generateStockId();
        
        stockRecord = new StockLedger({
          stock_id: newStockId,
          item_id: item.item_id,
          part_no: item.part_no,
          warehouse_id: destinationWarehouse,
          bin_id: item.bin_id,
          batch_no: item.batch_no,
          quantity: item.returned_qty,
          unit: item.unit,
          valuation_method: 'Weighted Average',
          unit_cost: item.unit_cost,
          total_value: item.total_value,
          created_by: req.user._id,
          created_at: new Date()
        });
        await stockRecord.save();
      }

      // Create stock transaction
      const transaction = new StockTransaction({
        txn_type: 'Material Return',
        txn_date: mrv.mrv_date,
        item_id: item.item_id,
        part_no: item.part_no,
        from_warehouse: mrv.warehouse_id, // Original warehouse
        to_warehouse: destinationWarehouse,
        from_bin: item.bin_id,
        to_bin: item.bin_id,
        quantity: item.returned_qty,
        unit: item.unit,
        unit_cost: item.unit_cost,
        total_value: item.total_value,
        batch_no: item.batch_no,
        ref_document_type: 'MRV',
        ref_document_id: mrv.mrv_number,
        ref_id: mrv._id,
        remarks: mrv.remarks || `Material returned from WO ${mrv.wo_number}`,
        created_by: req.user._id,
        status: 'Posted'
      });
      await transaction.save();
      transactions.push(transaction);

      // Update original MIV item
      const mivItem = originalMIV.items.find(i => 
        i.item_id.toString() === item.item_id.toString() && 
        i.batch_no === item.batch_no
      );
      if (mivItem) {
        mivItem.returned_qty = (mivItem.returned_qty || 0) + item.returned_qty;
        mivItem.net_consumed_qty = mivItem.issued_qty - mivItem.returned_qty;
      }

      totalReturnValue += item.total_value;
    }

    // Update Work Order actual RM cost
    workOrder.actual_rm_cost = Math.max(0, (workOrder.actual_rm_cost || 0) - totalReturnValue);
    workOrder.actual_total_cost = (workOrder.actual_rm_cost || 0) + (workOrder.actual_process_cost || 0);
    
    // ✅ FIXED: Push only the MRV ID, not an object
    if (!workOrder.material_returns) workOrder.material_returns = [];
    workOrder.material_returns.push(mrv._id); // Push just the ObjectId
    
    workOrder.updated_by = req.user._id;
    workOrder.updated_at = new Date();
    await workOrder.save();

    // Update original MIV
    const allReturned = originalMIV.items.every(i => (i.returned_qty || 0) === i.issued_qty);
    if (allReturned) {
      originalMIV.status = 'Fully Returned';
    } else if (originalMIV.items.some(i => (i.returned_qty || 0) > 0)) {
      originalMIV.status = 'Partially Returned';
    }
    originalMIV.updated_by = req.user._id;
    originalMIV.updated_at = new Date();
    await originalMIV.save();

    // Update MRV status
    mrv.status = 'Posted';
    mrv.posted_at = new Date();
    mrv.posted_by = req.user._id;
    await mrv.save();

    // Determine destination warehouse name for response
    let destinationWarehouseName = 'RM Store';
    if (mrv.condition === 'Scrap') {
      destinationWarehouseName = 'Scrap Yard';
    } else if (mrv.condition === 'Partially Damaged') {
      destinationWarehouseName = 'Quarantine';
    }

    return res.json({
      success: true,
      message: 'Materials returned successfully',
      data: {
        mrv_number: mrv.mrv_number,
        wo_number: workOrder.wo_number,
        total_return_value: totalReturnValue,
        updated_rm_cost: workOrder.actual_rm_cost,
        updated_total_cost: workOrder.actual_total_cost,
        transactions_count: transactions.length,
        condition: mrv.condition,
        destination_warehouse: destinationWarehouseName,
        status: 'Posted',
        posted_at: mrv.posted_at,
        posted_by: req.user.name || req.user.email
      }
    });

  } catch (error) {
    console.error('[MRV] postMaterialReturnVoucher Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ======================================================
// GET MRV BY ID (WITH PROPER BIN & WAREHOUSE TRANSFORMATION)
// ======================================================
exports.getMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const mrv = await MaterialReturnVoucher.findById(id)
      .populate('miv_id', 'miv_number miv_date total_issue_cost')
      .populate('wo_id', 'wo_number status part_no part_name planned_qty')
      .populate('returned_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .populate('created_by', 'Username Email')
      .populate('posted_by', 'Username Email')
      .populate('items.warehouse_id', 'warehouse_name warehouse_code location')
      .populate('items.item_id', 'part_no part_description unit')
      .lean();

    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }

    // Collect all unique warehouse IDs to fetch bins
    const warehouseIds = [...new Set(
      mrv.items
        .map(item => item.warehouse_id?._id || item.warehouse_id)
        .filter(Boolean)
    )];

    // Fetch all warehouses with their bins
    const Warehouse = mongoose.model('Warehouse');
    const warehouses = await Warehouse.find({
      _id: { $in: warehouseIds }
    }).select('_id bins').lean();

    // Create a map of warehouse_id -> bins array
    const warehouseBinsMap = new Map();
    warehouses.forEach(warehouse => {
      warehouseBinsMap.set(warehouse._id.toString(), warehouse.bins || []);
    });

    // Helper function to find bin details from warehouse bins
    const findBinDetails = (warehouseId, binId) => {
      if (!warehouseId || !binId) return null;

      const warehouseIdStr = warehouseId.toString();
      const bins = warehouseBinsMap.get(warehouseIdStr);

      if (!bins || !Array.isArray(bins)) return null;

      // Find bin by bin_id (string comparison)
      const bin = bins.find(b => b.bin_id === binId);
      return bin || null;
    };

    // ✅ TRANSFORM ITEMS - Convert populated objects back to IDs with name fields
    if (mrv.items && mrv.items.length > 0) {
      mrv.items = mrv.items.map(item => {
        // Get warehouse ID as string
        const warehouseId = item.warehouse_id?._id || item.warehouse_id;

        // Get bin details from warehouse bins
        const binDetails = findBinDetails(warehouseId, item.bin_id);

        // Create a new object with transformed fields
        const transformedItem = {
          _id: item._id,
          item_id: item.item_id?._id || item.item_id,
          part_no: item.part_no,
          returned_qty: item.returned_qty,
          unit: item.unit,
          // Warehouse fields
          warehouse_id: warehouseId,
          warehouse_name: item.warehouse_id?.warehouse_name,
          warehouse_code: item.warehouse_id?.warehouse_code,
          warehouse_location: item.warehouse_id?.location,
          // Bin fields - extracted from warehouse.bins
          bin_id: item.bin_id,
          bin_code: binDetails?.bin_code || null,
          bin_name: binDetails?.bin_code || null, // Using bin_code as name
          bin_rack: binDetails?.rack || null,
          bin_row: binDetails?.row || null,
          bin_col: binDetails?.col || null,
          bin_location: binDetails ? 
            `${binDetails.rack || ''} ${binDetails.row ? `Row ${binDetails.row}` : ''} ${binDetails.col ? `Col ${binDetails.col}` : ''}`.trim() : 
            null,
          batch_no: item.batch_no,
          unit_cost: item.unit_cost,
          total_value: item.total_value
        };

        // Add item details if populated
        if (item.item_id && typeof item.item_id === 'object') {
          transformedItem.item_part_no = item.item_id.part_no;
          transformedItem.item_description = item.item_id.part_description;
          transformedItem.item_unit = item.item_id.unit;
        }

        return transformedItem;
      });
    }

    // Ensure items is an array
    if (!mrv.items) {
      mrv.items = [];
    }

    // Safely calculate summary
    const summary = {
      total_items: mrv.items.length,
      total_returned_qty: mrv.items.reduce((sum, item) => sum + (item.returned_qty || 0), 0),
      total_return_value: mrv.total_return_value || 0
    };

    return res.json({ 
      success: true, 
      data: mrv,
      summary: summary
    });
  } catch (error) {
    console.error('[MRV] getMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// LIST MATERIAL RETURN VOUCHERS (WITH RECEIVED_BY)
// ======================================================
exports.listMaterialReturnVouchers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      wo_id,
      miv_id,
      status,
      condition,
      from_date,
      to_date,
      search,
      sort_by = 'createdAt',  // Add sort parameter
      sort_order = 'desc'      // Add order parameter
    } = req.query;

    const filter = {};
    if (wo_id) filter.wo_id = wo_id;
    if (miv_id) filter.miv_id = miv_id;
    if (status) filter.status = status;
    if (condition) filter.condition = condition;
    if (search) {
      filter.$or = [
        { mrv_number: new RegExp(search, 'i') },
        { miv_number: new RegExp(search, 'i') },
        { wo_number: new RegExp(search, 'i') }
      ];
    }
    if (from_date || to_date) {
      filter.mrv_date = {};
      if (from_date) filter.mrv_date.$gte = new Date(from_date);
      if (to_date) filter.mrv_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);
    
    // Create sort object - default to createdAt descending (newest first)
    const sortObject = {};
    sortObject[sort_by] = sort_order === 'desc' ? -1 : 1;

    const [mrvs, total] = await Promise.all([
      MaterialReturnVoucher.find(filter)
        .populate('wo_id', 'wo_number part_no status')
        .populate('miv_id', 'miv_number')
        .populate('returned_by', 'FirstName LastName EmployeeID')
        .populate('received_by', 'FirstName LastName EmployeeID')
        .sort(sortObject)  // Use dynamic sort object
        .skip(skip)
        .limit(lim)
        .lean(),
      MaterialReturnVoucher.countDocuments(filter)
    ]);

    // Safety check - ensure mrvs is an array
    const safeMrvs = mrvs || [];

    // Transform each MRV to show received_by properly
    const transformedMrvs = safeMrvs.map(mrv => ({
      ...mrv,
      received_by: mrv.received_by || null,
      // Optionally add a formatted name for easy display
      received_by_name: mrv.received_by 
        ? `${mrv.received_by.FirstName} ${mrv.received_by.LastName} (${mrv.received_by.EmployeeID})`
        : null,
      returned_by_name: mrv.returned_by
        ? `${mrv.returned_by.FirstName} ${mrv.returned_by.LastName} (${mrv.returned_by.EmployeeID})`
        : null
    }));

    // Calculate summary statistics
    const summary = {
      total_returns: transformedMrvs.length,
      total_return_value: transformedMrvs.length > 0 
        ? transformedMrvs.reduce((sum, mrv) => sum + (mrv.total_return_value || 0), 0) 
        : 0,
      by_status: {
        draft: transformedMrvs.filter(m => m.status === 'Draft').length,
        posted: transformedMrvs.filter(m => m.status === 'Posted').length,
        cancelled: transformedMrvs.filter(m => m.status === 'Cancelled').length,
        deleted: transformedMrvs.filter(m => m.status === 'Deleted').length
      },
      by_condition: {
        good: transformedMrvs.filter(m => m.condition === 'Good').length,
        partially_damaged: transformedMrvs.filter(m => m.condition === 'Partially Damaged').length,
        scrap: transformedMrvs.filter(m => m.condition === 'Scrap').length
      }
    };

    return res.json({
      success: true,
      data: transformedMrvs,
      summary: summary,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total: total || 0,
        pages: Math.ceil((total || 0) / lim)
      },
      sorting: {
        sort_by: sort_by,
        sort_order: sort_order
      }
    });
  } catch (error) {
    console.error('[MRV] listMaterialReturnVouchers:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ======================================================
// GET MRV BY MIV ID
// ======================================================
exports.getMRVByMIV = async (req, res) => {
  try {
    const { miv_id } = req.params;
    
    const mrvs = await MaterialReturnVoucher.find({ miv_id })
      .populate('returned_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .sort({ mrv_date: -1 })
      .lean();
    
    // Get original MIV details
    const originalMIV = await MaterialIssueVoucher.findById(miv_id)
      .select('miv_number miv_date total_issue_cost items')
      .lean();
    
    if (!originalMIV) {
      return res.status(404).json({ success: false, message: 'Original MIV not found' });
    }
    
    const safeMrvs = mrvs || [];
    
    // Calculate summary
    const summary = {
      total_returns: safeMrvs.length,
      total_returned_qty: {},
      total_return_value: safeMrvs.length > 0 ? safeMrvs.reduce((sum, mrv) => sum + (mrv.total_return_value || 0), 0) : 0,
      total_issued_qty: originalMIV.items ? originalMIV.items.reduce((sum, item) => sum + (item.issued_qty || 0), 0) : 0,
      total_issued_value: originalMIV.total_issue_cost || 0,
      net_consumed_value: (originalMIV.total_issue_cost || 0) - (safeMrvs.length > 0 ? safeMrvs.reduce((sum, mrv) => sum + (mrv.total_return_value || 0), 0) : 0)
    };
    
    // Calculate returned quantities by item
    for (const mrv of safeMrvs) {
      if (mrv.items) {
        for (const item of mrv.items) {
          if (!summary.total_returned_qty[item.part_no]) {
            summary.total_returned_qty[item.part_no] = 0;
          }
          summary.total_returned_qty[item.part_no] += (item.returned_qty || 0);
        }
      }
    }
    
    return res.json({
      success: true,
      data: {
        miv_id: miv_id,
        miv_number: originalMIV.miv_number,
        original_issue: {
          date: originalMIV.miv_date,
          total_value: originalMIV.total_issue_cost
        },
        returns: safeMrvs,
        summary: summary
      }
    });
  } catch (error) {
    console.error('[MRV] getMRVByMIV:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MRV BY WORK ORDER
// ======================================================
exports.getMRVByWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;
    
    const mrvs = await MaterialReturnVoucher.find({ wo_id })
      .populate('miv_id', 'miv_number')
      .populate('returned_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .sort({ mrv_date: -1 })
      .lean();
    
    const workOrder = await WorkOrder.findById(wo_id)
      .select('wo_number part_no part_name planned_qty actual_rm_cost')
      .lean();
    
    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }
    
    const safeMrvs = mrvs || [];
    
    // Safely calculate summary with checks
    const summary = {
      total_returns: safeMrvs.length,
      total_return_value: safeMrvs.length > 0 ? safeMrvs.reduce((sum, mrv) => sum + (mrv.total_return_value || 0), 0) : 0,
      by_condition: {
        Good: safeMrvs.filter(m => m.condition === 'Good').reduce((sum, m) => sum + (m.total_return_value || 0), 0),
        'Partially Damaged': safeMrvs.filter(m => m.condition === 'Partially Damaged').reduce((sum, m) => sum + (m.total_return_value || 0), 0),
        Scrap: safeMrvs.filter(m => m.condition === 'Scrap').reduce((sum, m) => sum + (m.total_return_value || 0), 0)
      },
      net_rm_cost: (workOrder.actual_rm_cost || 0)
    };
    
    return res.json({
      success: true,
      data: {
        work_order: {
          id: wo_id,
          number: workOrder.wo_number,
          part_no: workOrder.part_no,
          part_name: workOrder.part_name
        },
        returns: safeMrvs,
        summary: summary
      }
    });
  } catch (error) {
    console.error('[MRV] getMRVByWorkOrder:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// CANCEL MATERIAL RETURN VOUCHER
// ======================================================
exports.cancelMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const mrv = await MaterialReturnVoucher.findById(id);
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }
    
    if (mrv.status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel MRV with status: ${mrv.status}. Only Draft MRV can be cancelled.` 
      });
    }
    
    mrv.status = 'Cancelled';
    mrv.remarks = mrv.remarks ? `${mrv.remarks} | Cancelled: ${reason || 'No reason provided'}` : `Cancelled: ${reason || 'No reason provided'}`;
    mrv.updated_by = req.user._id;
    await mrv.save();
    
    return res.json({
      success: true,
      message: 'Material Return Voucher cancelled successfully',
      data: {
        mrv_number: mrv.mrv_number,
        status: mrv.status,
        cancelled_at: new Date(),
        cancelled_by: req.user._id
      }
    });
  } catch (error) {
    console.error('[MRV] cancelMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// GET MRV PRINT DATA
// ======================================================
exports.getMRVPrintData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mrv = await MaterialReturnVoucher.findById(id)
      .populate('miv_id', 'miv_number miv_date')
      .populate('wo_id', 'wo_number part_no part_name planned_qty')
      .populate('returned_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .populate('created_by', 'Username Email')
      .lean();
    
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }
    
    // Safely handle items array
    const safeItems = mrv.items || [];
    
    // Format for printing
    const printData = {
      document: {
        title: 'Material Return Voucher',
        number: mrv.mrv_number,
        date: mrv.mrv_date,
        status: mrv.status
      },
      work_order: {
        number: mrv.wo_id?.wo_number,
        part_no: mrv.wo_id?.part_no,
        part_name: mrv.wo_id?.part_name,
        planned_qty: mrv.wo_id?.planned_qty
      },
      original_miv: {
        number: mrv.miv_number,
        date: mrv.miv_id?.miv_date
      },
      personnel: {
        returned_by: mrv.returned_by ? `${mrv.returned_by.FirstName} ${mrv.returned_by.LastName} (${mrv.returned_by.EmployeeID})` : 'N/A',
        received_by: mrv.received_by ? `${mrv.received_by.FirstName} ${mrv.received_by.LastName} (${mrv.received_by.EmployeeID})` : 'Pending',
        created_by: mrv.created_by?.Username,
        posted_by: mrv.posted_by ? mrv.posted_by.Username : null,
        posted_at: mrv.posted_at
      },
      items: safeItems.map(item => ({
        part_no: item.part_no,
        returned_qty: item.returned_qty,
        unit: item.unit,
        unit_cost: item.unit_cost,
        total_value: item.total_value,
        batch_no: item.batch_no,
        bin_location: item.bin_id
      })),
      totals: {
        total_return_value: mrv.total_return_value || 0,
        item_count: safeItems.length
      },
      condition: mrv.condition,
      remarks: mrv.remarks,
      destination: {
        condition_based: mrv.condition === 'Good' ? 'Raw Material Store' : 
                         mrv.condition === 'Scrap' ? 'Scrap Yard' : 'Quarantine Area',
        warehouse_id: safeItems[0]?.warehouse_id
      }
    };
    
    return res.json({
      success: true,
      data: printData
    });
  } catch (error) {
    console.error('[MRV] getMRVPrintData:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// UPDATE MATERIAL RETURN VOUCHER (PUT)
// ======================================================
exports.updateMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      items,
      condition,
      returned_by,
      received_by,
      remarks,
      mrv_date
    } = req.body;

    // Find existing MRV
    const mrv = await MaterialReturnVoucher.findById(id);
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }

    // Check if MRV can be updated (only Draft status)
    if (mrv.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot update MRV with status: ${mrv.status}. Only Draft MRV can be updated.`
      });
    }

    // Fetch original MIV for validation
    const originalMIV = await MaterialIssueVoucher.findById(mrv.miv_id);
    if (!originalMIV) {
      return res.status(404).json({ success: false, message: 'Original MIV not found' });
    }

    let returnItems = [];
    let totalReturnValue = 0;

    // If items are being updated, validate them
    if (items && items.length > 0) {
      // Track already returned quantities from existing returns (excluding current MRV)
      const existingReturns = await MaterialReturnVoucher.find({
        miv_id: mrv.miv_id,
        _id: { $ne: id },
        status: { $in: ['Draft', 'Posted'] }
      });

      for (const returnItem of items) {
        const mivItem = originalMIV.items.find(i =>
          i.item_id.toString() === returnItem.item_id.toString()
        );

        if (!mivItem) {
          return res.status(404).json({
            success: false,
            message: `Item ${returnItem.part_no} not found in original MIV`
          });
        }

        // Calculate already returned quantity from other MRVs
        let alreadyReturnedFromOthers = 0;
        for (const existingReturn of existingReturns) {
          const existingItem = existingReturn.items.find(i =>
            i.item_id.toString() === returnItem.item_id.toString()
          );
          if (existingItem) {
            alreadyReturnedFromOthers += existingItem.returned_qty;
          }
        }

        const maxReturnable = mivItem.issued_qty - alreadyReturnedFromOthers;

        if (returnItem.returned_qty > maxReturnable) {
          return res.status(400).json({
            success: false,
            message: `Cannot return ${returnItem.returned_qty} of ${returnItem.part_no}. Max returnable: ${maxReturnable}`
          });
        }

        const returnValue = returnItem.returned_qty * mivItem.unit_cost;
        totalReturnValue += returnValue;

        returnItems.push({
          item_id: mivItem.item_id,
          part_no: mivItem.part_no,
          returned_qty: returnItem.returned_qty,
          unit: mivItem.unit,
          warehouse_id: returnItem.warehouse_id || mivItem.warehouse_id,
          bin_id: returnItem.bin_id,
          batch_no: mivItem.batch_no,
          unit_cost: mivItem.unit_cost,
          total_value: returnValue
        });
      }
    } else {
      // Keep existing items but recalculate totals
      returnItems = mrv.items;
      totalReturnValue = returnItems.reduce((sum, item) => sum + item.total_value, 0);
    }

    // Update MRV fields
    if (mrv_date) mrv.mrv_date = new Date(mrv_date);
    if (returned_by) mrv.returned_by = returned_by;
    if (received_by) mrv.received_by = received_by;
    if (condition) mrv.condition = condition;
    if (remarks !== undefined) mrv.remarks = remarks;
    
    mrv.items = returnItems;
    mrv.total_return_value = totalReturnValue;
    mrv.updated_by = req.user._id;

    await mrv.save();

    // Populate referenced fields for response
    const updatedMRV = await MaterialReturnVoucher.findById(mrv._id)
      .populate('returned_by', 'FirstName LastName EmployeeID')
      .populate('received_by', 'FirstName LastName EmployeeID')
      .populate('created_by', 'Username Email')
      .lean();

    return res.json({
      success: true,
      message: 'Material Return Voucher updated successfully',
      data: {
        mrv_number: updatedMRV.mrv_number,
        mrv_id: updatedMRV._id,
        mrv_date: updatedMRV.mrv_date,
        condition: updatedMRV.condition,
        status: updatedMRV.status,
        total_return_value: updatedMRV.total_return_value,
        items_count: updatedMRV.items.length,
        items: updatedMRV.items,
        returned_by: updatedMRV.returned_by,
        received_by: updatedMRV.received_by,
        remarks: updatedMRV.remarks
      }
    });

  } catch (error) {
    console.error('[MRV] updateMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// DELETE MATERIAL RETURN VOUCHER
// ======================================================
exports.deleteMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { force_delete = false } = req.query; // Optional force delete for admin

    // Find MRV
    const mrv = await MaterialReturnVoucher.findById(id);
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }

    // Check if MRV can be deleted
    if (mrv.status === 'Posted' && !force_delete) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a Posted MRV. Use force_delete=true for admin override, or cancel it first.',
        suggestion: 'POST /api/mrv/:id/cancel to cancel before deletion'
      });
    }

    if (mrv.status === 'Posted' && force_delete) {
      // Force delete - need to reverse stock transactions
      const StockLedger = mongoose.model('StockLedger');
      const StockTransaction = mongoose.model('StockTransaction');
      const MaterialIssueVoucher = mongoose.model('MaterialIssueVoucher');

      // Find and reverse stock transactions
      const transactions = await StockTransaction.find({
        ref_document_type: 'MRV',
        ref_id: mrv._id
      });

      for (const transaction of transactions) {
        // Reverse the stock ledger update
        let destinationWarehouse = transaction.to_warehouse;

        const stockRecord = await StockLedger.findOne({
          item_id: transaction.item_id,
          warehouse_id: destinationWarehouse,
          batch_no: transaction.batch_no
        });

        if (stockRecord) {
          const oldQty = stockRecord.quantity;
          const oldValue = stockRecord.total_value;
          const newQty = oldQty - transaction.quantity;
          const newValue = oldValue - transaction.total_value;

          if (newQty <= 0) {
            // Remove stock record if quantity becomes zero or negative
            await StockLedger.deleteOne({ _id: stockRecord._id });
          } else {
            if (stockRecord.valuation_method === 'Weighted Average') {
              stockRecord.unit_cost = newValue / newQty;
            }
            stockRecord.quantity = newQty;
            stockRecord.total_value = newValue;
            await stockRecord.save();
          }
        }

        // Delete the transaction
        await StockTransaction.deleteOne({ _id: transaction._id });
      }

      // Update original MIV - revert returned quantities
      const originalMIV = await MaterialIssueVoucher.findById(mrv.miv_id);
      if (originalMIV) {
        for (const item of mrv.items) {
          const mivItem = originalMIV.items.find(i =>
            i.item_id.toString() === item.item_id.toString()
          );
          if (mivItem) {
            mivItem.returned_qty = Math.max(0, (mivItem.returned_qty || 0) - item.returned_qty);
            mivItem.net_consumed_qty = mivItem.issued_qty - (mivItem.returned_qty || 0);
          }
        }

        // Update MIV status
        const allReturned = originalMIV.items.every(i => (i.returned_qty || 0) === i.issued_qty);
        if (allReturned) {
          originalMIV.status = 'Fully Returned';
        } else if (originalMIV.items.some(i => (i.returned_qty || 0) > 0)) {
          originalMIV.status = 'Partially Returned';
        } else {
          originalMIV.status = 'Issued';
        }
        await originalMIV.save();

        // Update Work Order - revert RM cost
        const WorkOrder = mongoose.model('WorkOrder');
        const workOrder = await WorkOrder.findById(mrv.wo_id);
        if (workOrder) {
          workOrder.actual_rm_cost = Math.max(0, (workOrder.actual_rm_cost || 0) + mrv.total_return_value);
          workOrder.actual_total_cost = (workOrder.actual_rm_cost || 0) + (workOrder.actual_process_cost || 0);
          workOrder.material_returns = workOrder.material_returns.filter(
            returnId => returnId.toString() !== mrv._id.toString()
          );
          await workOrder.save();
        }
      }
    }

    // For Draft MRV or after reversing Posted MRV, delete the document
    const deletedMRV = await MaterialReturnVoucher.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: mrv.status === 'Posted' && force_delete
        ? 'Material Return Voucher deleted successfully with stock reversal'
        : 'Material Return Voucher deleted successfully',
      data: {
        mrv_number: deletedMRV.mrv_number,
        mrv_id: deletedMRV._id,
        original_status: mrv.status,
        was_posted: mrv.status === 'Posted',
        stock_reversed: mrv.status === 'Posted' && force_delete
      }
    });

  } catch (error) {
    console.error('[MRV] deleteMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// BULK DELETE MATERIAL RETURN VOUCHERS (Admin)
// ======================================================
exports.bulkDeleteMaterialReturnVouchers = async (req, res) => {
  try {
    const { ids } = req.body;
    const { force_delete = false } = req.query;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of MRV IDs to delete'
      });
    }

    const results = {
      deleted: [],
      failed: [],
      total_posted: 0,
      total_deleted: 0
    };

    for (const id of ids) {
      try {
        // Create a mock request object for each deletion
        const mockReq = {
          params: { id },
          query: { force_delete },
          user: req.user
        };
        const mockRes = {
          status: function(code) {
            this.statusCode = code;
            return this;
          },
          json: function(data) {
            this.data = data;
            return this;
          }
        };

        // Use the delete function
        await exports.deleteMaterialReturnVoucher(mockReq, mockRes);

        if (mockRes.data && mockRes.data.success) {
          results.deleted.push({
            id,
            mrv_number: mockRes.data.data.mrv_number,
            was_posted: mockRes.data.data.was_posted || false
          });
          if (mockRes.data.data.was_posted) results.total_posted++;
          results.total_deleted++;
        } else {
          results.failed.push({
            id,
            reason: mockRes.data?.message || 'Unknown error'
          });
        }
      } catch (error) {
        results.failed.push({
          id,
          reason: error.message
        });
      }
    }

    return res.json({
      success: true,
      message: `Bulk delete completed. Deleted: ${results.deleted.length}, Failed: ${results.failed.length}`,
      data: results
    });

  } catch (error) {
    console.error('[MRV] bulkDeleteMaterialReturnVouchers:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// SOFT DELETE MATERIAL RETURN VOUCHER
// ======================================================
exports.softDeleteMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const mrv = await MaterialReturnVoucher.findById(id);
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }

    if (mrv.status === 'Deleted') {
      return res.status(400).json({
        success: false,
        message: 'MRV is already deleted'
      });
    }

    // Store original status before soft delete
    const originalStatus = mrv.status;

    // Soft delete - just mark as deleted without reversing transactions
    mrv.status = 'Deleted';
    mrv.remarks = mrv.remarks
      ? `${mrv.remarks} | Soft Deleted: ${reason || 'No reason provided'}`
      : `Soft Deleted: ${reason || 'No reason provided'}`;
    mrv.deleted_at = new Date();
    mrv.deleted_by = req.user._id;
    mrv.deleted_reason = reason || 'Not specified';

    await mrv.save();

    return res.json({
      success: true,
      message: 'Material Return Voucher soft deleted successfully',
      data: {
        mrv_number: mrv.mrv_number,
        mrv_id: mrv._id,
        original_status: originalStatus,
        deleted_at: mrv.deleted_at,
        deleted_by: req.user._id,
        deleted_reason: mrv.deleted_reason,
        note: 'Soft deleted MRV can be restored using restore endpoint'
      }
    });

  } catch (error) {
    console.error('[MRV] softDeleteMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
// RESTORE SOFT DELETED MATERIAL RETURN VOUCHER
// ======================================================
exports.restoreMaterialReturnVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const mrv = await MaterialReturnVoucher.findById(id);
    if (!mrv) {
      return res.status(404).json({ success: false, message: 'MRV not found' });
    }

    if (mrv.status !== 'Deleted') {
      return res.status(400).json({
        success: false,
        message: `Cannot restore MRV with status: ${mrv.status}. Only Deleted MRV can be restored.`
      });
    }

    // Restore to original status (Draft or Posted)
    // Note: For Posted MRV, you'll need to reapply stock transactions
    if (mrv.status === 'Deleted' && mrv.deleted_original_status === 'Posted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot automatically restore a Posted MRV. Please use force restore with stock reversal.',
        suggestion: 'Contact administrator to manually restore stock transactions'
      });
    }

    const restoredStatus = mrv.deleted_original_status || 'Draft';
    mrv.status = restoredStatus;
    mrv.remarks = mrv.remarks
      ? `${mrv.remarks} | Restored at ${new Date().toISOString()}`
      : `Restored at ${new Date().toISOString()}`;
    mrv.deleted_at = null;
    mrv.deleted_by = null;
    mrv.deleted_reason = null;
    mrv.restored_at = new Date();
    mrv.restored_by = req.user._id;

    await mrv.save();

    return res.json({
      success: true,
      message: 'Material Return Voucher restored successfully',
      data: {
        mrv_number: mrv.mrv_number,
        mrv_id: mrv._id,
        restored_status: restoredStatus,
        restored_at: mrv.restored_at,
        restored_by: req.user._id
      }
    });

  } catch (error) {
    console.error('[MRV] restoreMaterialReturnVoucher:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add to module.exports at the bottom
module.exports = {
  createMaterialReturnVoucher: exports.createMaterialReturnVoucher,
  updateMaterialReturnVoucher: exports.updateMaterialReturnVoucher,
  postMaterialReturnVoucher: exports.postMaterialReturnVoucher,
  getMaterialReturnVoucher: exports.getMaterialReturnVoucher,
  listMaterialReturnVouchers: exports.listMaterialReturnVouchers,
  getMRVByMIV: exports.getMRVByMIV,
  getMRVByWorkOrder: exports.getMRVByWorkOrder,
  cancelMaterialReturnVoucher: exports.cancelMaterialReturnVoucher,
  deleteMaterialReturnVoucher: exports.deleteMaterialReturnVoucher,
  bulkDeleteMaterialReturnVouchers: exports.bulkDeleteMaterialReturnVouchers,
  softDeleteMaterialReturnVoucher: exports.softDeleteMaterialReturnVoucher,
  restoreMaterialReturnVoucher: exports.restoreMaterialReturnVoucher,
  getMRVPrintData: exports.getMRVPrintData,
};