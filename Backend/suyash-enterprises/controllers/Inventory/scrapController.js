// controllers/Inventory/scrapController.js
'use strict';

const mongoose = require('mongoose');
const ScrapRecord = require('../../models/Inventory/ScrapRecord');

// ======================================================
// CREATE SCRAP RECORD
// POST /api/scrap-records
// ======================================================
exports.createScrapRecord = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      wo_id,
      wo_number,
      op_sequence,
      operation_name,
      item_id,
      part_no,
      scrap_material_id,
      scrap_material_code,
      scrap_qty,
      scrap_weight_kg,
      unit,
      scrap_type,
      scrap_grade,
      estimated_scrap_rate,
      scrap_realisation_pct,
      from_warehouse_id,
      batch_no,
      remarks,
      photos
    } = req.body;

    // Validation
    if (!wo_id && !item_id) {
      return res.status(400).json({
        success: false,
        message: 'Either wo_id or item_id is required'
      });
    }

    if (!scrap_qty || scrap_qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'scrap_qty must be greater than 0'
      });
    }

    if (!unit) {
      return res.status(400).json({
        success: false,
        message: 'unit is required'
      });
    }

    // If WO ID provided, verify work order exists
    let workOrder = null;
    let actualPartNo = part_no;
    let actualItemId = item_id;

    if (wo_id) {
      const WorkOrder = mongoose.model('WorkOrder');
      workOrder = await WorkOrder.findById(wo_id).session(session);
      
      if (!workOrder) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Work Order not found'
        });
      }

      actualPartNo = workOrder.part_no;
      actualItemId = workOrder.item_id;
    }

    // Get scrap warehouse
    const Warehouse = mongoose.model('Warehouse');
    let scrapWarehouse = await Warehouse.findOne({ 
      warehouse_type: 'Scrap',
      is_active: true 
    }).session(session);

    if (!scrapWarehouse) {
      // Create default scrap warehouse if not exists
      scrapWarehouse = new Warehouse({
        warehouse_id: 'WH-SCRAP-01',
        warehouse_name: 'Scrap Store - Main',
        warehouse_type: 'Scrap',
        location: 'Factory Rear Storage',
        is_active: true,
        created_by: req.user._id,
        updated_by: req.user._id
      });
      await scrapWarehouse.save({ session });
    }

    // Create scrap record
    const scrapData = {
      wo_id: wo_id || null,
      wo_number: wo_number || (workOrder ? workOrder.wo_number : null),
      op_sequence: op_sequence || null,
      operation_name: operation_name || null,
      item_id: actualItemId,
      part_no: actualPartNo,
      scrap_material_id: scrap_material_id || null,
      scrap_material_code: scrap_material_code || null,
      scrap_qty: scrap_qty,
      scrap_weight_kg: scrap_weight_kg || scrap_qty,
      unit: unit,
      scrap_type: scrap_type,
      scrap_grade: scrap_grade || '',
      estimated_scrap_rate: estimated_scrap_rate || 0,
      scrap_realisation_pct: scrap_realisation_pct || 100,
      status: 'Generated',
      remarks: remarks || '',
      photos: photos || [],
      recorded_by: req.user._id,
      created_by: req.user._id
    };

    // Calculate estimated value
    if (scrapData.scrap_weight_kg && scrapData.estimated_scrap_rate) {
      scrapData.estimated_scrap_value = scrapData.scrap_weight_kg * 
                                        scrapData.estimated_scrap_rate * 
                                        (scrapData.scrap_realisation_pct / 100);
    }

    const scrapRecord = new ScrapRecord(scrapData);
    await scrapRecord.save({ session });

    // Create stock transaction if from_warehouse_id provided
    if (from_warehouse_id) {
      const StockLedger = mongoose.model('StockLedger');
      const StockTransaction = mongoose.model('StockTransaction');

      // Find or create scrap stock ledger
      let scrapStock = await StockLedger.findOne({
        item_id: scrap_material_id || actualItemId,
        warehouse_id: scrapWarehouse._id,
        batch_no: batch_no || null
      }).session(session);

      if (scrapStock) {
        const oldQty = scrapStock.quantity;
        const oldValue = scrapStock.total_value;
        const newQty = oldQty + scrap_qty;
        const newValue = oldValue + (scrapData.estimated_scrap_value || 0);
        
        scrapStock.quantity = newQty;
        scrapStock.total_value = newValue;
        scrapStock.unit_cost = newQty > 0 ? newValue / newQty : 0;
        scrapStock.last_updated = new Date();
        scrapStock.last_updated_by = req.user._id;
        await scrapStock.save({ session });
      } else {
        const stockId = await StockLedger.generateStockId();
        scrapStock = new StockLedger({
          stock_id: stockId,
          item_id: scrap_material_id || actualItemId,
          part_no: scrap_material_code || actualPartNo,
          warehouse_id: scrapWarehouse._id,
          bin_id: 'SCRAP-BIN-01',
          batch_no: batch_no || null,
          quantity: scrap_qty,
          unit: unit,
          valuation_method: 'Weighted Average',
          unit_cost: estimated_scrap_rate || 0,
          total_value: scrapData.estimated_scrap_value || 0,
          created_by: req.user._id
        });
        await scrapStock.save({ session });
      }

      // Create stock transaction
      const transaction = new StockTransaction({
        txn_type: 'Scrap',
        txn_date: new Date(),
        item_id: scrap_material_id || actualItemId,
        part_no: scrap_material_code || actualPartNo,
        from_warehouse: from_warehouse_id,
        to_warehouse: scrapWarehouse._id,
        quantity: scrap_qty,
        unit: unit,
        unit_cost: estimated_scrap_rate || 0,
        total_value: scrapData.estimated_scrap_value || 0,
        batch_no: batch_no || null,
        ref_document_type: wo_id ? 'WO' : 'Manual',
        ref_document_id: workOrder ? workOrder.wo_number : null,
        ref_id: wo_id || null,
        remarks: `Scrap recorded from ${operation_name || 'production'}. ${remarks || ''}`,
        created_by: req.user._id
      });
      await transaction.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Scrap record created successfully',
      data: {
        scrap_id: scrapRecord.scrap_id,
        scrap_qty: scrapRecord.scrap_qty,
        estimated_value: scrapRecord.estimated_scrap_value,
        status: scrapRecord.status,
        next_step: 'POST /api/scrap-records/:id/sold to record sale'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('[SCRAP] createScrapRecord:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scrap record',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ======================================================
// RECORD SCRAP SALE
// PUT /api/scrap-records/:id/sold
// ======================================================
exports.recordScrapSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      actual_value,
      sold_to,
      sold_date,
      invoice_number,
      remarks
    } = req.body;

    if (!actual_value || actual_value <= 0) {
      return res.status(400).json({
        success: false,
        message: 'actual_value must be greater than 0'
      });
    }

    if (!sold_to) {
      return res.status(400).json({
        success: false,
        message: 'sold_to is required'
      });
    }

    const scrapRecord = await ScrapRecord.findById(id).session(session);
    if (!scrapRecord) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Scrap record not found'
      });
    }

    if (scrapRecord.status === 'Sold') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Scrap already marked as sold'
      });
    }

    // Update scrap record
    scrapRecord.actual_scrap_value = actual_value;
    scrapRecord.sold_to = sold_to;
    scrapRecord.sold_date = sold_date || new Date();
    scrapRecord.invoice_number = invoice_number || '';
    scrapRecord.status = 'Sold';
    scrapRecord.verified_by = req.user._id;
    scrapRecord.verified_at = new Date();
    scrapRecord.remarks = remarks ? `${scrapRecord.remarks || ''}\nSale: ${remarks}` : scrapRecord.remarks;

    await scrapRecord.save({ session });

    // Create journal entry for scrap sale (simplified - actual GL posting would be separate)
    // This would typically go to Accounts Receivable and Scrap Sales Revenue

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Scrap sale recorded successfully',
      data: {
        scrap_id: scrapRecord.scrap_id,
        actual_value: scrapRecord.actual_scrap_value,
        sold_to: scrapRecord.sold_to,
        sold_date: scrapRecord.sold_date,
        status: scrapRecord.status
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('[SCRAP] recordScrapSale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record scrap sale',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ======================================================
// GET SCRAP RECORD BY ID
// GET /api/scrap-records/:id
// ======================================================
exports.getScrapRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const scrapRecord = await ScrapRecord.findById(id)
      .populate('wo_id', 'wo_number status part_no part_name')
      .populate('item_id', 'part_no part_description')
      .populate('scrap_material_id', 'part_no part_description')
      .populate('created_by', 'name email')
      .populate('recorded_by', 'name employee_id')
      .populate('verified_by', 'name email');

    if (!scrapRecord) {
      return res.status(404).json({
        success: false,
        message: 'Scrap record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scrapRecord
    });

  } catch (error) {
    console.error('[SCRAP] getScrapRecord:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scrap record',
      error: error.message
    });
  }
};

// ======================================================
// GET SCRAP RECORDS BY WORK ORDER
// GET /api/scrap-records/by-wo/:wo_id
// ======================================================
exports.getScrapByWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;

    const scrapRecords = await ScrapRecord.find({ wo_id })
      .populate('scrap_material_id', 'part_no')
      .sort({ scrap_date: -1 });

    const summary = {
      total_scrap_qty: scrapRecords.reduce((sum, s) => sum + s.scrap_qty, 0),
      total_scrap_weight: scrapRecords.reduce((sum, s) => sum + (s.scrap_weight_kg || 0), 0),
      total_estimated_value: scrapRecords.reduce((sum, s) => sum + (s.estimated_scrap_value || 0), 0),
      total_actual_value: scrapRecords.reduce((sum, s) => sum + (s.actual_scrap_value || 0), 0),
      by_type: {}
    };

    // Group by scrap type
    scrapRecords.forEach(record => {
      if (!summary.by_type[record.scrap_type]) {
        summary.by_type[record.scrap_type] = {
          qty: 0,
          weight: 0,
          estimated_value: 0,
          actual_value: 0
        };
      }
      summary.by_type[record.scrap_type].qty += record.scrap_qty;
      summary.by_type[record.scrap_type].weight += record.scrap_weight_kg || 0;
      summary.by_type[record.scrap_type].estimated_value += record.estimated_scrap_value || 0;
      summary.by_type[record.scrap_type].actual_value += record.actual_scrap_value || 0;
    });

    res.status(200).json({
      success: true,
      data: scrapRecords,
      summary: summary
    });

  } catch (error) {
    console.error('[SCRAP] getScrapByWorkOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scrap records',
      error: error.message
    });
  }
};

// ======================================================
// GET SCRAP SUMMARY (Dashboard)
// GET /api/scrap-records/summary
// ======================================================
exports.getScrapSummary = async (req, res) => {
  try {
    const { from_date, to_date, scrap_type } = req.query;

    let matchFilter = {};
    
    if (from_date || to_date) {
      matchFilter.scrap_date = {};
      if (from_date) matchFilter.scrap_date.$gte = new Date(from_date);
      if (to_date) matchFilter.scrap_date.$lte = new Date(to_date);
    }
    
    if (scrap_type) matchFilter.scrap_type = scrap_type;

    const summary = await ScrapRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$scrap_type',
          total_qty: { $sum: '$scrap_qty' },
          total_weight: { $sum: '$scrap_weight_kg' },
          total_estimated_value: { $sum: '$estimated_scrap_value' },
          total_actual_value: { $sum: '$actual_scrap_value' },
          records_count: { $sum: 1 }
        }
      },
      { $sort: { total_estimated_value: -1 } }
    ]);

    const totalSummary = {
      total_qty: summary.reduce((sum, s) => sum + s.total_qty, 0),
      total_weight: summary.reduce((sum, s) => sum + s.total_weight, 0),
      total_estimated_value: summary.reduce((sum, s) => sum + s.total_estimated_value, 0),
      total_actual_value: summary.reduce((sum, s) => sum + s.total_actual_value, 0),
      total_records: summary.reduce((sum, s) => sum + s.records_count, 0)
    };

    // Get pending scrap (generated but not sold)
    const pendingScrap = await ScrapRecord.aggregate([
      { $match: { status: 'Generated' } },
      {
        $group: {
          _id: null,
          total_qty: { $sum: '$scrap_qty' },
          total_weight: { $sum: '$scrap_weight_kg' },
          total_value: { $sum: '$estimated_scrap_value' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        by_type: summary,
        totals: totalSummary,
        pending_scrap: pendingScrap[0] || { total_qty: 0, total_weight: 0, total_value: 0 }
      }
    });

  } catch (error) {
    console.error('[SCRAP] getScrapSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scrap summary',
      error: error.message
    });
  }
};

// ======================================================
// LIST ALL SCRAP RECORDS
// GET /api/scrap-records
// ======================================================
exports.listScrapRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      scrap_type,
      wo_id,
      from_date,
      to_date,
      search
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (scrap_type) filter.scrap_type = scrap_type;
    if (wo_id) filter.wo_id = wo_id;
    
    if (from_date || to_date) {
      filter.scrap_date = {};
      if (from_date) filter.scrap_date.$gte = new Date(from_date);
      if (to_date) filter.scrap_date.$lte = new Date(to_date);
    }

    if (search) {
      filter.$or = [
        { scrap_id: { $regex: search, $options: 'i' } },
        { part_no: { $regex: search, $options: 'i' } },
        { wo_number: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    const [scrapRecords, total] = await Promise.all([
      ScrapRecord.find(filter)
        .populate('wo_id', 'wo_number status')
        .populate('item_id', 'part_no')
        .sort({ scrap_date: -1 })
        .skip(skip)
        .limit(lim),
      ScrapRecord.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: scrapRecords,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total,
        pages: Math.ceil(total / lim)
      }
    });

  } catch (error) {
    console.error('[SCRAP] listScrapRecords:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scrap records',
      error: error.message
    });
  }
};

// ======================================================
// UPDATE SCRAP RECORD
// PUT /api/scrap-records/:id
// ======================================================
exports.updateScrapRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating sold records
    const scrapRecord = await ScrapRecord.findById(id);
    if (!scrapRecord) {
      return res.status(404).json({
        success: false,
        message: 'Scrap record not found'
      });
    }

    if (scrapRecord.status === 'Sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update sold scrap record'
      });
    }

    // Allowed fields for update
    const allowedUpdates = [
      'scrap_qty', 'scrap_weight_kg', 'scrap_type', 'scrap_grade',
      'estimated_scrap_rate', 'scrap_realisation_pct', 'remarks', 'photos'
    ];

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        scrapRecord[field] = updateData[field];
      }
    });

    // Recalculate estimated value
    if (scrapRecord.scrap_weight_kg && scrapRecord.estimated_scrap_rate) {
      scrapRecord.estimated_scrap_value = scrapRecord.scrap_weight_kg * 
                                          scrapRecord.estimated_scrap_rate * 
                                          (scrapRecord.scrap_realisation_pct / 100);
    }

    await scrapRecord.save();

    res.status(200).json({
      success: true,
      message: 'Scrap record updated successfully',
      data: scrapRecord
    });

  } catch (error) {
    console.error('[SCRAP] updateScrapRecord:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scrap record',
      error: error.message
    });
  }
};