// controllers/Inventory/stockLedgerController.js
const StockLedger = require('../../models/Inventory/StockLedger');
const StockTransaction = require('../../models/Inventory/StockTransaction');
const mongoose = require('mongoose');

// ======================================================
// HELPER FUNCTIONS
// ======================================================

/**
 * FIFO Batch Selection - Get oldest batches first
 */
async function getFIFOBatches(item_id, warehouse_id, required_qty) {
    const batches = await StockLedger.find({
        item_id: item_id,
        warehouse_id: warehouse_id,
        quantity: { $gt: 0 }
    }).sort({ receipt_date: 1 }); // Oldest first
    
    const selectedBatches = [];
    let remainingQty = required_qty;
    
    for (const batch of batches) {
        if (remainingQty <= 0) break;
        
        const availableQty = batch.quantity - (batch.reserved_qty || 0);
        if (availableQty <= 0) continue;
        
        const takeQty = Math.min(availableQty, remainingQty);
        
        selectedBatches.push({
            ledger_id: batch._id,
            batch_no: batch.batch_no,
            receipt_date: batch.receipt_date,
            quantity: takeQty,
            unit_cost: batch.unit_cost,
            total_value: takeQty * batch.unit_cost,
            unit: batch.unit
        });
        
        remainingQty -= takeQty;
    }
    
    if (remainingQty > 0) {
        throw new Error(`Insufficient stock. Required: ${required_qty}, Shortage: ${remainingQty}`);
    }
    
    return selectedBatches;
}

/**
 * Weighted Average Calculation
 */
function calculateWeightedAverage(currentQty, currentCost, newQty, newCost) {
    const currentValue = currentQty * currentCost;
    const newValue = newQty * newCost;
    const totalQty = currentQty + newQty;
    return totalQty > 0 ? (currentValue + newValue) / totalQty : 0;
}

// ======================================================
// MAIN API ENDPOINTS
// ======================================================

// ======================================================
// GET STOCK LEDGER (Real-time stock balances)
// GET /api/stock-ledger
// ======================================================
exports.getStockLedger = async (req, res) => {
  try {
    const {
      item_id,
      part_no,
      warehouse_id,
      bin_id,
      batch_no,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    let filter = {};

    if (item_id) filter.item_id = item_id;
    if (part_no) filter.part_no = { $regex: part_no, $options: 'i' };
    if (warehouse_id) filter.warehouse_id = warehouse_id;
    if (bin_id) filter.bin_id = bin_id;
    if (batch_no) filter.batch_no = batch_no;

    // Only show items with quantity > 0 OR reserved_qty > 0
    filter.$or = [
      { quantity: { $gt: 0 } },
      { reserved_qty: { $gt: 0 } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    const stockLedger = await StockLedger.find(filter)
      .populate('item_id', 'part_no description item_type')
      .populate('warehouse_id', 'warehouse_id warehouse_name warehouse_type')
      .populate('last_txn_id', 'txn_id txn_type txn_date')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockLedger.countDocuments(filter);

    const enrichedData = [];
    if (stockLedger && stockLedger.length > 0) {
      for (const record of stockLedger) {
        const obj = record.toObject({ virtuals: false });
        obj.available_qty = (record.quantity || 0) - (record.reserved_qty || 0);
        enrichedData.push(obj);
      }
    }

    let summary = {
      total_quantity: 0,
      total_reserved: 0,
      total_value: 0,
      unique_items_count: 0
    };

    try {
      const summaryResult = await StockLedger.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total_quantity: { $sum: '$quantity' },
            total_reserved: { $sum: '$reserved_qty' },
            total_value: { $sum: '$total_value' },
            unique_items: { $addToSet: '$item_id' }
          }
        }
      ]);

      if (summaryResult && summaryResult.length > 0 && summaryResult[0]) {
        summary = {
          total_quantity: summaryResult[0].total_quantity || 0,
          total_reserved: summaryResult[0].total_reserved || 0,
          total_value: summaryResult[0].total_value || 0,
          unique_items_count: (summaryResult[0].unique_items || []).length || 0
        };
      }
    } catch (aggError) {
      console.error('Aggregation error:', aggError);
    }

    res.status(200).json({
      success: true,
      data: enrichedData,
      summary: summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: total ? Math.ceil(total / parseInt(limit)) : 0
      }
    });

  } catch (error) {
    console.error('Get stock ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock ledger',
      error: error.message
    });
  }
};

// ======================================================
// GET STOCK LEDGER BY ITEM ID
// GET /api/stock-ledger/item/:item_id
// ======================================================
exports.getStockByItemId = async (req, res) => {
  try {
    const { item_id } = req.params;

    const stockRecords = await StockLedger.find({
      item_id: item_id,
      $or: [
        { quantity: { $gt: 0 } },
        { reserved_qty: { $gt: 0 } }
      ]
    })
      .populate('warehouse_id', 'warehouse_id warehouse_name warehouse_type location')
      .populate('last_txn_id', 'txn_id txn_type txn_date');

    const enrichedRecords = (stockRecords || []).map(record => {
      const obj = record.toObject({ virtuals: false });
      obj.available_qty = (record.quantity || 0) - (record.reserved_qty || 0);
      return obj;
    });

    const totalQuantity = enrichedRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalReserved = enrichedRecords.reduce((sum, r) => sum + (r.reserved_qty || 0), 0);
    const totalValue = enrichedRecords.reduce((sum, r) => sum + (r.total_value || 0), 0);

    res.status(200).json({
      success: true,
      data: enrichedRecords,
      summary: {
        total_quantity: totalQuantity,
        total_reserved: totalReserved,
        total_available: totalQuantity - totalReserved,
        total_value: totalValue
      }
    });

  } catch (error) {
    console.error('Get stock by item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock for item',
      error: error.message
    });
  }
};

// ======================================================
// GET INVENTORY VALUATION REPORT
// GET /api/stock-ledger/valuation
// ======================================================
exports.getInventoryValuation = async (req, res) => {
  try {
    const { warehouse_id, valuation_method } = req.query;

    let matchFilter = { quantity: { $gt: 0 } };
    if (warehouse_id && mongoose.Types.ObjectId.isValid(warehouse_id)) {
      matchFilter.warehouse_id = new mongoose.Types.ObjectId(warehouse_id);
    }
    if (valuation_method) {
      matchFilter.valuation_method = valuation_method;
    }

    const valuation = await StockLedger.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse_id',
          foreignField: '_id',
          as: 'warehouse'
        }
      },
      { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$warehouse_id',
          warehouse_id: { $first: '$warehouse.warehouse_id' },
          warehouse_name: { $first: '$warehouse.warehouse_name' },
          warehouse_type: { $first: '$warehouse.warehouse_type' },
          total_quantity: { $sum: '$quantity' },
          total_value: { $sum: '$total_value' },
          items_count: { $sum: 1 }
        }
      },
      { $sort: { warehouse_name: 1 } }
    ]);

    const grandTotal = await StockLedger.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total_quantity: { $sum: '$quantity' },
          total_value: { $sum: '$total_value' },
          unique_items: { $addToSet: '$item_id' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: valuation || [],
      summary: {
        total_quantity: grandTotal[0]?.total_quantity || 0,
        total_value: grandTotal[0]?.total_value || 0,
        unique_items_count: grandTotal[0]?.unique_items?.length || 0
      }
    });

  } catch (error) {
    console.error('Get inventory valuation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory valuation',
      error: error.message
    });
  }
};

// ======================================================
// GET STOCK AGING (Slow-moving items)
// GET /api/stock-aging
// ======================================================
exports.getStockAging = async (req, res) => {
  try {
    const { days = 30, warehouse_id } = req.query;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - parseInt(days));

    let matchFilter = {
      quantity: { $gt: 0 },
      last_updated: { $lt: thresholdDate }
    };
    if (warehouse_id && mongoose.Types.ObjectId.isValid(warehouse_id)) {
      matchFilter.warehouse_id = new mongoose.Types.ObjectId(warehouse_id);
    }

    const agingStock = await StockLedger.find(matchFilter)
      .populate('item_id', 'part_no description item_type')
      .populate('warehouse_id', 'warehouse_id warehouse_name')
      .sort({ last_updated: 1 });

    const now = new Date();
    const agingGroups = {
      '30-60 days': [],
      '60-90 days': [],
      '90-180 days': [],
      '180+ days': []
    };

    (agingStock || []).forEach(record => {
      const daysSinceUpdate = Math.floor((now - new Date(record.last_updated)) / (1000 * 60 * 60 * 24));
      const obj = record.toObject();
      obj.days_since_update = daysSinceUpdate;
      obj.available_qty = (record.quantity || 0) - (record.reserved_qty || 0);
      obj.aging_value = obj.available_qty * record.unit_cost;

      if (daysSinceUpdate >= 30 && daysSinceUpdate < 60) agingGroups['30-60 days'].push(obj);
      else if (daysSinceUpdate >= 60 && daysSinceUpdate < 90) agingGroups['60-90 days'].push(obj);
      else if (daysSinceUpdate >= 90 && daysSinceUpdate < 180) agingGroups['90-180 days'].push(obj);
      else if (daysSinceUpdate >= 180) agingGroups['180+ days'].push(obj);
    });

    res.status(200).json({
      success: true,
      data: agingGroups,
      summary: {
        total_slow_moving: agingStock?.length || 0,
        total_value: (agingStock || []).reduce((sum, r) => sum + (r.total_value || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get stock aging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock aging',
      error: error.message
    });
  }
};

// ======================================================
// GET BATCHES NEARING EXPIRY
// GET /api/stock-ledger/batch-expiry
// ======================================================
exports.getBatchExpiry = async (req, res) => {
  try {
    const { days = 30, warehouse_id } = req.query;

    let matchFilter = {
      quantity: { $gt: 0 },
      batch_no: { $ne: null, $exists: true },
      receipt_date: { $exists: true }
    };
    
    if (warehouse_id && mongoose.Types.ObjectId.isValid(warehouse_id)) {
      matchFilter.warehouse_id = new mongoose.Types.ObjectId(warehouse_id);
    }

    const expiringBatches = await StockLedger.find(matchFilter)
      .populate('item_id', 'part_no description shelf_life_days')
      .populate('warehouse_id', 'warehouse_id warehouse_name')
      .sort({ receipt_date: 1 });

    const expiringItems = (expiringBatches || [])
      .map(record => {
        const obj = record.toObject();
        if (record.item_id?.shelf_life_days && record.receipt_date) {
          const expiryDate = new Date(record.receipt_date);
          expiryDate.setDate(expiryDate.getDate() + record.item_id.shelf_life_days);
          const daysToExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
          
          if (daysToExpiry <= parseInt(days) && daysToExpiry >= 0) {
            obj.expiry_date = expiryDate;
            obj.days_to_expiry = daysToExpiry;
            obj.expiry_status = daysToExpiry <= 7 ? 'Critical' : daysToExpiry <= 30 ? 'Warning' : 'Normal';
            obj.expiry_value = record.quantity * record.unit_cost;
            return obj;
          }
        }
        return null;
      })
      .filter(item => item !== null)
      .sort((a, b) => a.days_to_expiry - b.days_to_expiry);

    res.status(200).json({
      success: true,
      data: expiringItems,
      summary: {
        total_expiring: expiringItems.length,
        critical_count: expiringItems.filter(i => i.days_to_expiry <= 7).length,
        warning_count: expiringItems.filter(i => i.days_to_expiry > 7 && i.days_to_expiry <= 30).length
      }
    });

  } catch (error) {
    console.error('Get batch expiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch expiry',
      error: error.message
    });
  }
};

// ======================================================
// GET STOCK TRANSACTIONS (Audit Trail)
// GET /api/stock-transactions
// ======================================================
exports.getStockTransactions = async (req, res) => {
  try {
    const {
      item_id,
      part_no,
      txn_type,
      from_warehouse,
      to_warehouse,
      batch_no,
      from_date,
      to_date,
      ref_document_type,
      ref_document_id,
      page = 1,
      limit = 50,
      sort_by = 'txn_date',
      sort_order = 'desc'
    } = req.query;

    let filter = {};

    if (item_id && mongoose.Types.ObjectId.isValid(item_id)) filter.item_id = new mongoose.Types.ObjectId(item_id);
    if (part_no) filter.part_no = { $regex: part_no, $options: 'i' };
    if (txn_type) filter.txn_type = txn_type;
    if (from_warehouse && mongoose.Types.ObjectId.isValid(from_warehouse)) filter.from_warehouse = new mongoose.Types.ObjectId(from_warehouse);
    if (to_warehouse && mongoose.Types.ObjectId.isValid(to_warehouse)) filter.to_warehouse = new mongoose.Types.ObjectId(to_warehouse);
    if (batch_no) filter.batch_no = batch_no;
    if (ref_document_type) filter.ref_document_type = ref_document_type;
    if (ref_document_id) filter.ref_document_id = ref_document_id;

    if (from_date || to_date) {
      filter.txn_date = {};
      if (from_date) filter.txn_date.$gte = new Date(from_date);
      if (to_date) filter.txn_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    const transactions = await StockTransaction.find(filter)
      .populate('item_id', 'part_no description')
      .populate('from_warehouse', 'warehouse_id warehouse_name')
      .populate('to_warehouse', 'warehouse_id warehouse_name')
      .populate('created_by', 'Username Email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockTransaction.countDocuments(filter);

    const safeTransactions = (transactions || []).map(txn => {
      const obj = txn.toObject({ virtuals: false });
      return obj;
    });

    res.status(200).json({
      success: true,
      data: safeTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: total ? Math.ceil(total / parseInt(limit)) : 0
      }
    });

  } catch (error) {
    console.error('Get stock transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock transactions',
      error: error.message
    });
  }
};

// ======================================================
// GET BATCH TRACEABILITY (FIXED VERSION)
// GET /api/stock-transactions/batch-trace/:batch_no
// ======================================================
exports.getBatchTraceability = async (req, res) => {
  try {
    const { batch_no } = req.params;

    const transactions = await StockTransaction.find({ batch_no: batch_no })
      .populate('item_id', 'part_no description')
      .populate('from_warehouse', 'warehouse_id warehouse_name warehouse_type')
      .populate('to_warehouse', 'warehouse_id warehouse_name warehouse_type')
      .populate('created_by', 'Username Email')
      .sort({ txn_date: 1 });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No transactions found for batch: ${batch_no}`,
        error: 'BATCH_NOT_FOUND'
      });
    }

    const traceChain = {
      batch_no: batch_no,
      grn_receipt: null,
      material_issues: [],
      production_receipts: [],
      returns: [],
      scrap: [],
      current_location: null
    };

    for (const txn of transactions) {
      const txnObj = txn.toObject();
      
      // Handle both schema formats
      const txnType = txn.txn_type || txn.transaction_type;
      
      // Safely get warehouse info (handle both formats)
      let fromWarehouse = txn.from_warehouse;
      let toWarehouse = txn.to_warehouse;
      
      // If old format with to_location, try to extract warehouse info
      if (!toWarehouse && txn.to_location) {
        toWarehouse = txn.to_location;
      }
      
      switch (txnType) {
        case 'GRN Receipt':
          traceChain.grn_receipt = {
            date: txn.txn_date,
            quantity: txn.quantity,
            from: txn.from_warehouse?.warehouse_id || 'External Vendor',
            to: toWarehouse?.warehouse_id || toWarehouse?.bin_code || 'Unknown',
            ref_document: txn.ref_document_id || txn.reference_doc,
            unit_cost: txn.unit_cost,
            total_value: txn.total_value
          };
          break;
        case 'Material Issue':
          traceChain.material_issues.push({
            date: txn.txn_date,
            quantity: txn.quantity,
            from: fromWarehouse?.warehouse_id || 'Unknown',
            to: toWarehouse?.warehouse_id || 'Production',
            ref_document: txn.ref_document_id || txn.reference_doc
          });
          break;
        case 'Material Return':
          traceChain.returns.push({
            date: txn.txn_date,
            quantity: txn.quantity,
            from: fromWarehouse?.warehouse_id || 'Production',
            to: toWarehouse?.warehouse_id || 'Store',
            ref_document: txn.ref_document_id || txn.reference_doc
          });
          break;
        case 'Production Receipt':
          traceChain.production_receipts.push({
            date: txn.txn_date,
            quantity: txn.quantity,
            from: fromWarehouse?.warehouse_id || 'WIP',
            to: toWarehouse?.warehouse_id || 'FG Store',
            ref_document: txn.ref_document_id || txn.reference_doc
          });
          break;
        case 'Scrap':
          traceChain.scrap.push({
            date: txn.txn_date,
            quantity: txn.quantity,
            from: fromWarehouse?.warehouse_id || 'Production',
            to: toWarehouse?.warehouse_id || 'Scrap Yard',
            ref_document: txn.ref_document_id || txn.reference_doc
          });
          break;
      }
    }

    // Get current location from last transaction
    const lastTxn = transactions[transactions.length - 1];
    if (lastTxn) {
      const lastTxnType = lastTxn.txn_type || lastTxn.transaction_type;
      const lastToWarehouse = lastTxn.to_warehouse || lastTxn.to_location;
      
      traceChain.current_location = {
        warehouse: lastToWarehouse?.warehouse_id || lastToWarehouse?.bin_code || 'Unknown',
        bin: lastTxn.to_bin || lastTxn.from_bin,
        date: lastTxn.txn_date,
        status: lastTxnType,
        quantity_remaining: lastTxn.quantity
      };
    }

    // Calculate summary statistics
    const totalReceived = traceChain.grn_receipt?.quantity || 0;
    const totalIssued = traceChain.material_issues.reduce((sum, i) => sum + i.quantity, 0);
    const totalReturned = traceChain.returns.reduce((sum, i) => sum + i.quantity, 0);
    const totalScrap = traceChain.scrap.reduce((sum, i) => sum + i.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        batch_no,
        item_info: transactions[0]?.item_id,
        traceability_chain: traceChain,
        all_transactions: transactions.map(t => ({
          id: t._id,
          type: t.txn_type || t.transaction_type,
          date: t.txn_date,
          quantity: t.quantity,
          from: t.from_warehouse?.warehouse_id || t.from_warehouse,
          to: t.to_warehouse?.warehouse_id || t.to_location?.bin_code || t.to_warehouse,
          document: t.ref_document_id || t.reference_doc
        })),
        summary: {
          total_received: totalReceived,
          total_issued: totalIssued,
          total_returned: totalReturned,
          total_scrap: totalScrap,
          net_consumed: totalIssued - totalReturned - totalScrap,
          current_balance: totalReceived - totalIssued + totalReturned - totalScrap
        }
      }
    });

  } catch (error) {
    console.error('Get batch traceability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch traceability',
      error: error.message
    });
  }
};

// Add this to stockLedgerController.js

// ======================================================
// GET STOCK BY WAREHOUSE - FIXED VERSION
// GET /api/stock-ledger/warehouse/:warehouse_id
// ======================================================
exports.getStockByWarehouse = async (req, res) => {
  try {
    const { warehouse_id } = req.params;
    const { include_zero_stock = false } = req.query;

    console.log('Fetching stock for warehouse:', warehouse_id);

    // Validate warehouse exists
    const Warehouse = mongoose.model('Warehouse');
    const warehouse = await Warehouse.findById(warehouse_id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Build filter
    let filter = { warehouse_id: new mongoose.Types.ObjectId(warehouse_id) };
    if (!include_zero_stock || include_zero_stock === 'false') {
      filter.quantity = { $gt: 0 };
    }

    // Get stock ledger entries
    const stockEntries = await StockLedger.find(filter)
      .populate('item_id', 'part_no description item_type uom')
      .populate('last_txn_id', 'txn_id txn_type txn_date')
      .sort({ 'item_id.part_no': 1, bin_id: 1 });

    console.log(`Found ${stockEntries.length} stock entries for warehouse ${warehouse.warehouse_id}`);

    // Enrich with available quantity
    const enrichedEntries = stockEntries.map(entry => {
      const obj = entry.toObject();
      obj.available_qty = (entry.quantity || 0) - (entry.reserved_qty || 0);
      return obj;
    });

    // Calculate summaries
    const summary = {
      total_quantity: enrichedEntries.reduce((sum, e) => sum + (e.quantity || 0), 0),
      total_reserved: enrichedEntries.reduce((sum, e) => sum + (e.reserved_qty || 0), 0),
      total_value: enrichedEntries.reduce((sum, e) => sum + (e.total_value || 0), 0),
      unique_items: new Set(enrichedEntries.map(e => e.item_id?._id?.toString())).size,
      bins_utilized: new Set(enrichedEntries.map(e => e.bin_id).filter(b => b)).size
    };

    // Group by bin for detailed view
    const stockByBin = {};
    enrichedEntries.forEach(entry => {
      const binId = entry.bin_id || 'NO_BIN';
      if (!stockByBin[binId]) {
        stockByBin[binId] = {
          bin_id: binId,
          items: [],
          total_quantity: 0,
          total_value: 0
        };
      }
      stockByBin[binId].items.push(entry);
      stockByBin[binId].total_quantity += entry.quantity;
      stockByBin[binId].total_value += entry.total_value;
    });

    res.status(200).json({
      success: true,
      data: {
        warehouse: {
          _id: warehouse._id,
          warehouse_id: warehouse.warehouse_id,
          warehouse_name: warehouse.warehouse_name,
          warehouse_type: warehouse.warehouse_type
        },
        stock_entries: enrichedEntries,
        stock_by_bin: Object.values(stockByBin),
        summary: summary
      }
    });

  } catch (error) {
    console.error('Get stock by warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock for warehouse',
      error: error.message
    });
  }
};

// ======================================================
// FIFO BATCH SELECTION API
// POST /api/stock-ledger/fifo-select
// ======================================================
exports.selectFIFOBatches = async (req, res) => {
  try {
    const { item_id, warehouse_id, quantity } = req.body;
    
    if (!item_id || !warehouse_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'item_id, warehouse_id, and quantity are required'
      });
    }
    
    const selectedBatches = await getFIFOBatches(item_id, warehouse_id, quantity);
    
    res.status(200).json({
      success: true,
      data: {
        selected_batches: selectedBatches,
        total_quantity: selectedBatches.reduce((sum, b) => sum + b.quantity, 0),
        total_value: selectedBatches.reduce((sum, b) => sum + b.total_value, 0),
        average_cost: selectedBatches.reduce((sum, b) => sum + b.total_value, 0) / quantity
      }
    });
    
  } catch (error) {
    console.error('FIFO selection error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

