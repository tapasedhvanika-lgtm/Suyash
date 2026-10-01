const Warehouse = require('../../models/Inventory/Warehouse');
const StockLedger = require('../../models/Inventory/StockLedger');
const mongoose = require('mongoose');

// ======================================================
// CREATE WAREHOUSE
// POST /api/warehouses
// ======================================================
exports.createWarehouse = async (req, res) => {
  try {
    const {
      warehouse_name,
      warehouse_type,
      location,
      manager_id,
      bins,
      is_active
    } = req.body;

    // Validate required fields
    if (!warehouse_name || !warehouse_type) {
      return res.status(400).json({
        success: false,
        message: 'warehouse_name and warehouse_type are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate warehouse type
    const validTypes = ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine'];
    if (!validTypes.includes(warehouse_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid warehouse_type. Must be one of: ${validTypes.join(', ')}`,
        error: 'INVALID_WAREHOUSE_TYPE'
      });
    }

    
    // Generate warehouse_id automatically
    const typePrefix = getWarehouseTypePrefix(warehouse_type);
    const lastWarehouse = await Warehouse.findOne({
      warehouse_id: new RegExp(`^WH-${typePrefix}`)
    }).sort({ warehouse_id: -1 });

    let sequence = 1;
    if (lastWarehouse) {
      const lastSeq = parseInt(lastWarehouse.warehouse_id.split('-')[1].slice(-2));
      sequence = lastSeq + 1;
    }

    const warehouse_id = `WH-${typePrefix}${String(sequence).padStart(2, '0')}`;

    // Validate bin uniqueness within warehouse
    if (bins && bins.length > 0) {
      const binIds = bins.map(b => b.bin_id);
      if (new Set(binIds).size !== binIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate bin_id within warehouse',
          error: 'DUPLICATE_BIN_ID'
        });
      }

      // Validate each bin has required fields
      for (const bin of bins) {
        if (!bin.bin_id || !bin.bin_code) {
          return res.status(400).json({
            success: false,
            message: 'Each bin must have bin_id and bin_code',
            error: 'INVALID_BIN_DATA'
          });
        }
      }
    }

    const warehouse = new Warehouse({
      warehouse_id,
      warehouse_name,
      warehouse_type,
      location: location || '',
      manager_id: manager_id || null,
      bins: bins ? bins.map(bin => ({
        bin_id: bin.bin_id,
        bin_code: bin.bin_code,
        rack: bin.rack || '',
        row: bin.row || null,
        col: bin.col || null,
        capacity: bin.capacity || null,
        is_active: bin.is_active !== false,
        created_at: new Date(),
        updated_at: new Date()
      })) : [],
      is_active: is_active !== false,
      created_by: req.user._id,
      updated_by: req.user._id
    });

    await warehouse.save();

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse
    });

  } catch (error) {
    console.error('Create warehouse error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Warehouse already exists',
        error: 'DUPLICATE_WAREHOUSE'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create warehouse',
      error: error.message
    });
  }
};

// Helper function to get prefix based on warehouse type
function getWarehouseTypePrefix(type) {
  const prefixes = {
    'Raw Material': 'RM',
    'WIP': 'WP',
    'Finished Goods': 'FG',
    'Consumable': 'CS',
    'Tool': 'TL',
    'Scrap': 'SC',
    'Subcontract': 'SB',
    'Quarantine': 'QT'
  };
  return prefixes[type] || 'WH';
}

// ======================================================
// GET ALL WAREHOUSES
// GET /api/warehouses
// ======================================================
exports.getAllWarehouses = async (req, res) => {
  try {
    const {
      type,
      is_active,
      manager_id,
      search,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    let filter = {};

    if (type) filter.warehouse_type = type;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    if (manager_id) filter.manager_id = manager_id;

    if (search) {
      filter.$or = [
        { warehouse_name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { warehouse_id: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    const warehouses = await Warehouse.find(filter)
      .populate('manager_id', 'name email employee_code department')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Warehouse.countDocuments(filter);

    // Get stock summary for each warehouse
    const warehouseIds = warehouses.map(w => w._id);
    const stockSummary = await StockLedger.aggregate([
      { $match: { warehouse_id: { $in: warehouseIds } } },
      { $group: {
        _id: '$warehouse_id',
        total_quantity: { $sum: '$quantity' },
        total_value: { $sum: '$total_value' },
        unique_items: { $addToSet: '$item_id' }
      }}
    ]);

    const summaryMap = {};
    stockSummary.forEach(s => {
      summaryMap[s._id] = {
        total_quantity: s.total_quantity,
        total_value: s.total_value,
        unique_items_count: s.unique_items.length
      };
    });

    const enrichedWarehouses = warehouses.map(w => ({
      ...w.toObject(),
      stock_summary: summaryMap[w._id] || {
        total_quantity: 0,
        total_value: 0,
        unique_items_count: 0
      }
    }));

    res.status(200).json({
      success: true,
      data: enrichedWarehouses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouses',
      error: error.message
    });
  }
};

// ======================================================
// GET WAREHOUSE BY ID
// GET /api/warehouses/:id
// ======================================================
exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await Warehouse.findById(id)
      .populate('manager_id', 'name email employee_code department phone')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Get stock summary per bin
    const stockSummary = await StockLedger.aggregate([
      { $match: { warehouse_id: warehouse._id } },
      { $group: {
        _id: '$bin_id',
        total_quantity: { $sum: '$quantity' },
        total_value: { $sum: '$total_value' },
        items_count: { $sum: 1 }
      }},
      { $lookup: {
        from: 'warehouses',
        localField: '_id',
        foreignField: 'bins.bin_id',
        as: 'bin_details'
      }}
    ]);

    const stockMap = {};
    stockSummary.forEach(s => {
      stockMap[s._id] = {
        quantity: s.total_quantity,
        value: s.total_value,
        items: s.items_count
      };
    });

    // Enrich bins with current stock
    const enrichedBins = warehouse.bins.map(bin => ({
      ...bin.toObject(),
      current_stock: stockMap[bin.bin_id] || { quantity: 0, value: 0, items: 0 },
      utilization_percentage: bin.capacity ? 
        ((stockMap[bin.bin_id]?.quantity || 0) / bin.capacity * 100).toFixed(2) : null
    }));

    const response = {
      ...warehouse.toObject(),
      bins: enrichedBins,
      total_stock_value: stockSummary.reduce((sum, s) => sum + s.total_value, 0),
      total_stock_quantity: stockSummary.reduce((sum, s) => sum + s.total_quantity, 0)
    };

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Get warehouse by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse',
      error: error.message
    });
  }
};

// // ======================================================
// // UPDATE WAREHOUSE
// // PUT /api/warehouses/:id
// // ======================================================
// exports.updateWarehouse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { warehouse_name, location, manager_id, is_active } = req.body;

//     const warehouse = await Warehouse.findById(id);

//     if (!warehouse) {
//       return res.status(404).json({
//         success: false,
//         message: 'Warehouse not found',
//         error: 'WAREHOUSE_NOT_FOUND'
//       });
//     }

//     // Update allowed fields
//     if (warehouse_name) warehouse.warehouse_name = warehouse_name;
//     if (location !== undefined) warehouse.location = location;
//     if (manager_id !== undefined) warehouse.manager_id = manager_id;
//     if (is_active !== undefined) {
//       // Check if trying to deactivate warehouse with stock
//       if (!is_active && warehouse.is_active) {
//         const hasStock = await StockLedger.exists({
//           warehouse_id: warehouse._id,
//           quantity: { $gt: 0 }
//         });
        
//         if (hasStock) {
//           return res.status(400).json({
//             success: false,
//             message: 'Cannot deactivate warehouse with existing stock. Transfer or issue all stock first.',
//             error: 'WAREHOUSE_HAS_STOCK'
//           });
//         }
//       }
//       warehouse.is_active = is_active;
//     }

//     warehouse.updated_by = req.user._id;
//     warehouse.updated_at = new Date();

//     await warehouse.save();

//     res.status(200).json({
//       success: true,
//       message: 'Warehouse updated successfully',
//       data: warehouse
//     });

//   } catch (error) {
//     console.error('Update warehouse error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update warehouse',
//       error: error.message
//     });
//   }
// };


// ======================================================
// UPDATE WAREHOUSE
// PUT /api/warehouses/:id
// ======================================================
exports.updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      warehouse_name, 
      warehouse_type,
      location, 
      manager_id, 
      is_active,
      bins
    } = req.body;

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Validate warehouse type if being updated
    if (warehouse_type) {
      const validTypes = ['Raw Material', 'WIP', 'Finished Goods', 'Consumable', 'Tool', 'Scrap', 'Subcontract', 'Quarantine'];
      if (!validTypes.includes(warehouse_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid warehouse_type. Must be one of: ${validTypes.join(', ')}`,
          error: 'INVALID_WAREHOUSE_TYPE'
        });
      }
      
      // Check if changing warehouse type is allowed (no stock)
      if (warehouse_type !== warehouse.warehouse_type) {
        const hasStock = await StockLedger.exists({
          warehouse_id: warehouse._id,
          quantity: { $gt: 0 }
        });
        
        if (hasStock) {
          return res.status(400).json({
            success: false,
            message: 'Cannot change warehouse type when it has stock. Transfer all stock first.',
            error: 'WAREHOUSE_HAS_STOCK'
          });
        }
      }
      
      warehouse.warehouse_type = warehouse_type;
    }

    // Update basic fields
    if (warehouse_name) warehouse.warehouse_name = warehouse_name;
    if (location !== undefined) warehouse.location = location;
    if (manager_id !== undefined) warehouse.manager_id = manager_id;
    
    // Handle is_active with stock check
    if (is_active !== undefined) {
      if (!is_active && warehouse.is_active) {
        const hasStock = await StockLedger.exists({
          warehouse_id: warehouse._id,
          quantity: { $gt: 0 }
        });
        
        if (hasStock) {
          return res.status(400).json({
            success: false,
            message: 'Cannot deactivate warehouse with existing stock. Transfer or issue all stock first.',
            error: 'WAREHOUSE_HAS_STOCK'
          });
        }
      }
      warehouse.is_active = is_active;
    }

    // Handle bins update if provided
    if (bins !== undefined) {
      // Validate bins data
      if (bins && bins.length > 0) {
        const binIds = bins.map(b => b.bin_id);
        if (new Set(binIds).size !== binIds.length) {
          return res.status(400).json({
            success: false,
            message: 'Duplicate bin_id within warehouse',
            error: 'DUPLICATE_BIN_ID'
          });
        }

        for (const bin of bins) {
          if (!bin.bin_id || !bin.bin_code) {
            return res.status(400).json({
              success: false,
              message: 'Each bin must have bin_id and bin_code',
              error: 'INVALID_BIN_DATA'
            });
          }
        }
        
        // Check if bins being removed have stock
        const existingBinIds = warehouse.bins.map(b => b.bin_id);
        const newBinIds = bins.map(b => b.bin_id);
        const removedBins = existingBinIds.filter(id => !newBinIds.includes(id));
        
        if (removedBins.length > 0) {
          const hasStockInRemovedBins = await StockLedger.exists({
            warehouse_id: warehouse._id,
            bin_id: { $in: removedBins },
            quantity: { $gt: 0 }
          });
          
          if (hasStockInRemovedBins) {
            return res.status(400).json({
              success: false,
              message: 'Cannot remove bins that contain stock. Transfer stock from these bins first.',
              error: 'BINS_HAVE_STOCK',
              bins_with_stock: removedBins
            });
          }
        }
        
        // Update bins
        warehouse.bins = bins.map(bin => ({
          bin_id: bin.bin_id,
          bin_code: bin.bin_code,
          rack: bin.rack || '',
          row: bin.row || null,
          col: bin.col || null,
          capacity: bin.capacity || null,
          is_active: bin.is_active !== false,
          created_at: bin.created_at || new Date(),
          updated_at: new Date()
        }));
      } else {
        // If bins is empty array, check if warehouse has stock
        const hasStock = await StockLedger.exists({
          warehouse_id: warehouse._id,
          quantity: { $gt: 0 }
        });
        
        if (hasStock) {
          return res.status(400).json({
            success: false,
            message: 'Cannot remove all bins when warehouse has stock. Transfer stock first.',
            error: 'WAREHOUSE_HAS_STOCK'
          });
        }
        warehouse.bins = [];
      }
    }

    warehouse.updated_by = req.user._id;
    warehouse.updated_at = new Date();

    await warehouse.save();

    // Populate the updated warehouse
    const updatedWarehouse = await Warehouse.findById(warehouse._id)
      .populate('manager_id', 'name email employee_code department')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    res.status(200).json({
      success: true,
      message: 'Warehouse updated successfully',
      data: updatedWarehouse
    });

  } catch (error) {
    console.error('Update warehouse error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Warehouse name or ID already exists',
        error: 'DUPLICATE_WAREHOUSE'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update warehouse',
      error: error.message
    });
  }
};

// ======================================================
// ADD BIN TO WAREHOUSE
// POST /api/warehouses/:id/bins
// ======================================================
exports.addBin = async (req, res) => {
  try {
    const { id } = req.params;
    const { bin_id, bin_code, rack, row, col, capacity, is_active } = req.body;

    // Validate required fields
    if (!bin_id || !bin_code) {
      return res.status(400).json({
        success: false,
        message: 'bin_id and bin_code are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Check if bin already exists
    const binExists = warehouse.bins.some(b => b.bin_id === bin_id);
    if (binExists) {
      return res.status(400).json({
        success: false,
        message: `Bin with ID ${bin_id} already exists in this warehouse`,
        error: 'DUPLICATE_BIN_ID'
      });
    }

    const newBin = {
      bin_id,
      bin_code,
      rack: rack || '',
      row: row || null,
      col: col || null,
      capacity: capacity || null,
      is_active: is_active !== false,
      created_at: new Date(),
      updated_at: new Date()
    };

    warehouse.bins.push(newBin);
    warehouse.updated_by = req.user._id;
    warehouse.updated_at = new Date();

    await warehouse.save();

    res.status(201).json({
      success: true,
      message: 'Bin added successfully',
      data: newBin
    });

  } catch (error) {
    console.error('Add bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bin',
      error: error.message
    });
  }
};

// ======================================================
// UPDATE BIN
// PUT /api/warehouses/:warehouseId/bins/:binId
// ======================================================
exports.updateBin = async (req, res) => {
  try {
    const { warehouseId, binId } = req.params;
    const { bin_code, rack, row, col, capacity, is_active } = req.body;

    const warehouse = await Warehouse.findById(warehouseId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Find bin by either bin_id (string) or by _id (if it's a valid ObjectId)
    let binIndex = -1;
    
    // First, try to find by bin_id string
    binIndex = warehouse.bins.findIndex(b => b.bin_id === binId);
    
    // If not found and binId looks like a MongoDB ObjectId, try to find by _id
    if (binIndex === -1 && mongoose.Types.ObjectId.isValid(binId)) {
      binIndex = warehouse.bins.findIndex(b => b._id && b._id.toString() === binId);
    }
    
    if (binIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Bin not found with identifier: ${binId}`,
        error: 'BIN_NOT_FOUND',
        available_bins: warehouse.bins.map(b => ({ 
          bin_id: b.bin_id, 
          _id: b._id 
        }))
      });
    }

    // If trying to deactivate bin, check if it has stock
    if (is_active === false && warehouse.bins[binIndex].is_active === true) {
      const StockLedger = mongoose.model('StockLedger');
      const hasStock = await StockLedger.exists({
        warehouse_id: warehouse._id,
        bin_id: warehouse.bins[binIndex].bin_id, // Use the string bin_id
        quantity: { $gt: 0 }
      });
      
      if (hasStock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate bin with existing stock. Transfer stock first.',
          error: 'BIN_HAS_STOCK'
        });
      }
    }

    // Update bin fields
    if (bin_code) warehouse.bins[binIndex].bin_code = bin_code;
    if (rack !== undefined) warehouse.bins[binIndex].rack = rack;
    if (row !== undefined) warehouse.bins[binIndex].row = row;
    if (col !== undefined) warehouse.bins[binIndex].col = col;
    if (capacity !== undefined) warehouse.bins[binIndex].capacity = capacity;
    if (is_active !== undefined) warehouse.bins[binIndex].is_active = is_active;
    
    warehouse.bins[binIndex].updated_at = new Date();
    warehouse.updated_by = req.user._id;
    warehouse.updated_at = new Date();

    await warehouse.save();

    res.status(200).json({
      success: true,
      message: 'Bin updated successfully',
      data: warehouse.bins[binIndex]
    });

  } catch (error) {
    console.error('Update bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bin',
      error: error.message
    });
  }
};

// ======================================================
// DELETE/DISABLE BIN
// DELETE /api/warehouses/:warehouseId/bins/:binId
// ======================================================
exports.deleteBin = async (req, res) => {
  try {
    const { warehouseId, binId } = req.params;

    const warehouse = await Warehouse.findById(warehouseId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Find bin by either bin_id (string) or by _id (if it's a valid ObjectId)
    let binIndex = -1;
    let binIdentifier = binId;
    
    // First, try to find by bin_id string
    binIndex = warehouse.bins.findIndex(b => b.bin_id === binId);
    
    // If not found and binId looks like a MongoDB ObjectId, try to find by _id
    if (binIndex === -1 && mongoose.Types.ObjectId.isValid(binId)) {
      binIndex = warehouse.bins.findIndex(b => b._id && b._id.toString() === binId);
      if (binIndex !== -1) {
        binIdentifier = warehouse.bins[binIndex].bin_id; // Store the actual bin_id for stock check
      }
    }
    
    if (binIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Bin not found with identifier: ${binId}`,
        error: 'BIN_NOT_FOUND',
        available_bins: warehouse.bins.map(b => ({ 
          bin_id: b.bin_id, 
          _id: b._id 
        }))
      });
    }

    // Check if bin has stock - use the actual bin_id string
    const StockLedger = mongoose.model('StockLedger');
    const hasStock = await StockLedger.exists({
      warehouse_id: warehouse._id,
      bin_id: binIdentifier, // Use the actual bin_id string
      quantity: { $gt: 0 }
    });

    if (hasStock) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bin with existing stock. Transfer stock first.',
        error: 'BIN_HAS_STOCK',
        bin_details: {
          bin_id: warehouse.bins[binIndex].bin_id,
          bin_code: warehouse.bins[binIndex].bin_code,
          current_stock: await StockLedger.findOne({
            warehouse_id: warehouse._id,
            bin_id: binIdentifier,
            quantity: { $gt: 0 }
          }).select('quantity total_value')
        }
      });
    }

    // Soft delete by setting is_active to false
    warehouse.bins[binIndex].is_active = false;
    warehouse.bins[binIndex].updated_at = new Date();
    warehouse.updated_by = req.user._id;
    warehouse.updated_at = new Date();

    await warehouse.save();

    res.status(200).json({
      success: true,
      message: `Bin ${warehouse.bins[binIndex].bin_code} deactivated successfully`,
      data: {
        bin_id: warehouse.bins[binIndex].bin_id,
        bin_code: warehouse.bins[binIndex].bin_code,
        is_active: false,
        deactivated_at: new Date()
      }
    });

  } catch (error) {
    console.error('Delete bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bin',
      error: error.message
    });
  }
};

// ======================================================
// GET ALL BINS IN WAREHOUSE
// GET /api/warehouses/:id/bins
// ======================================================
exports.getWarehouseBins = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, has_capacity, search } = req.query;

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    let bins = [...warehouse.bins];

    // Filter by active status
    if (is_active !== undefined) {
      bins = bins.filter(b => b.is_active === (is_active === 'true'));
    }

    // Get current stock for all bins
    const stockData = await StockLedger.aggregate([
      { $match: { warehouse_id: warehouse._id } },
      { $group: {
        _id: '$bin_id',
        total_quantity: { $sum: '$quantity' },
        total_items: { $sum: 1 },
        total_value: { $sum: '$total_value' }
      }}
    ]);

    const stockMap = {};
    stockData.forEach(s => {
      stockMap[s._id] = {
        quantity: s.total_quantity,
        items: s.total_items,
        value: s.total_value
      };
    });

    // Filter by capacity availability
    if (has_capacity === 'true') {
      bins = bins.filter(bin => {
        const currentQty = stockMap[bin.bin_id]?.quantity || 0;
        return !bin.capacity || currentQty < bin.capacity;
      });
    }

    // Search by bin_code or bin_id
    if (search) {
      bins = bins.filter(bin => 
        bin.bin_code.toLowerCase().includes(search.toLowerCase()) ||
        bin.bin_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Enrich bins with current stock
    const enrichedBins = bins.map(bin => ({
      ...bin.toObject(),
      current_stock: stockMap[bin.bin_id] || { quantity: 0, items: 0, value: 0 },
      utilization_percentage: bin.capacity ? 
        ((stockMap[bin.bin_id]?.quantity || 0) / bin.capacity * 100).toFixed(2) : null
    }));

    // Sort by bin_code
    enrichedBins.sort((a, b) => a.bin_code.localeCompare(b.bin_code));

    res.status(200).json({
      success: true,
      data: enrichedBins,
      total_bins: enrichedBins.length,
      total_active_bins: enrichedBins.filter(b => b.is_active).length
    });

  } catch (error) {
    console.error('Get warehouse bins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bins',
      error: error.message
    });
  }
};

// ======================================================
// GET AVAILABLE BINS FOR STOCK RECEIPT
// GET /api/warehouses/:id/available-bins
// ======================================================
exports.getAvailableBins = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_id, quantity } = req.query;

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Get current bin utilization
    const currentStock = await StockLedger.aggregate([
      { $match: { warehouse_id: warehouse._id } },
      { $group: {
        _id: '$bin_id',
        total_quantity: { $sum: '$quantity' }
      }}
    ]);

    const utilizationMap = {};
    currentStock.forEach(s => {
      utilizationMap[s._id] = s.total_quantity;
    });

    // Find bins with capacity
    const availableBins = warehouse.bins
      .filter(bin => bin.is_active)
      .map(bin => ({
        bin_id: bin.bin_id,
        bin_code: bin.bin_code,
        rack: bin.rack,
        row: bin.row,
        col: bin.col,
        capacity: bin.capacity,
        current_quantity: utilizationMap[bin.bin_id] || 0,
        available_capacity: bin.capacity ? 
          bin.capacity - (utilizationMap[bin.bin_id] || 0) : 
          null
      }))
      .filter(bin => {
        if (quantity && bin.capacity) {
          return bin.available_capacity >= parseFloat(quantity);
        }
        return true;
      })
      .sort((a, b) => {
        // Prioritize bins with more available space
        if (a.available_capacity && b.available_capacity) {
          return b.available_capacity - a.available_capacity;
        }
        // Bins without capacity limit come last
        if (!a.available_capacity) return 1;
        if (!b.available_capacity) return -1;
        return 0;
      });

    res.status(200).json({
      success: true,
      data: availableBins,
      total_available: availableBins.length
    });

  } catch (error) {
    console.error('Get available bins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available bins',
      error: error.message
    });
  }
};

// ======================================================
// GET WAREHOUSE CAPACITY REPORT
// GET /api/warehouses/capacity-report
// ======================================================
exports.getWarehouseCapacityReport = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ is_active: true });

    const report = [];

    for (const warehouse of warehouses) {
      // Get total stock per warehouse
      const stockTotal = await StockLedger.aggregate([
        { $match: { warehouse_id: warehouse._id } },
        { $group: {
          _id: null,
          total_quantity: { $sum: '$quantity' },
          total_value: { $sum: '$total_value' },
          unique_items: { $addToSet: '$item_id' }
        }}
      ]);

      // Calculate bin utilization
      let totalCapacity = 0;
      let usedCapacity = 0;
      let binsWithCapacity = 0;
      const binUtilization = [];

      for (const bin of warehouse.bins) {
        if (bin.capacity && bin.is_active) {
          totalCapacity += bin.capacity;
          binsWithCapacity++;
          
          const binStock = await StockLedger.aggregate([
            { $match: { warehouse_id: warehouse._id, bin_id: bin.bin_id } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
          ]);
          
          const currentQty = binStock[0]?.total || 0;
          usedCapacity += currentQty;
          
          binUtilization.push({
            bin_code: bin.bin_code,
            capacity: bin.capacity,
            current: currentQty,
            utilization: ((currentQty / bin.capacity) * 100).toFixed(2)
          });
        }
      }

      report.push({
        warehouse_id: warehouse.warehouse_id,
        warehouse_name: warehouse.warehouse_name,
        warehouse_type: warehouse.warehouse_type,
        location: warehouse.location,
        total_bins: warehouse.bins.length,
        active_bins: warehouse.bins.filter(b => b.is_active).length,
        bins_with_capacity: binsWithCapacity,
        total_capacity: totalCapacity,
        used_capacity: usedCapacity,
        utilization_percentage: totalCapacity > 0 ? 
          ((usedCapacity / totalCapacity) * 100).toFixed(2) : 0,
        total_stock_quantity: stockTotal[0]?.total_quantity || 0,
        total_stock_value: stockTotal[0]?.total_value || 0,
        unique_items_count: stockTotal[0]?.unique_items?.length || 0,
        bin_utilization: binUtilization
      });
    }

    // Sort by utilization percentage
    report.sort((a, b) => parseFloat(b.utilization_percentage) - parseFloat(a.utilization_percentage));

    res.status(200).json({
      success: true,
      data: report,
      summary: {
        total_warehouses: warehouses.length,
        total_stock_value: report.reduce((sum, w) => sum + w.total_stock_value, 0),
        total_capacity: report.reduce((sum, w) => sum + w.total_capacity, 0),
        overall_utilization: report.reduce((sum, w) => sum + parseFloat(w.utilization_percentage), 0) / report.length,
        warehouses_needing_attention: report.filter(w => w.utilization_percentage > 85).length
      }
    });

  } catch (error) {
    console.error('Get warehouse capacity report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch capacity report',
      error: error.message
    });
  }
};


// ======================================================
// DELETE WAREHOUSE (HARD DELETE)
// DELETE /api/warehouses/:id
// ======================================================
exports.deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if warehouse exists
    const warehouse = await Warehouse.findById(id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
        error: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Check if warehouse has any stock
    const StockLedger = mongoose.model('StockLedger');
    const hasStock = await StockLedger.exists({
      warehouse_id: warehouse._id,
      quantity: { $gt: 0 }
    });

    if (hasStock) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete warehouse with existing stock. Transfer or issue all stock first.',
        error: 'WAREHOUSE_HAS_STOCK',
        stock_details: await StockLedger.aggregate([
          { $match: { warehouse_id: warehouse._id, quantity: { $gt: 0 } } },
          { $group: {
            _id: null,
            total_quantity: { $sum: '$quantity' },
            total_value: { $sum: '$total_value' },
            unique_items: { $addToSet: '$item_id' }
          }}
        ])
      });
    }

    // Check if warehouse has any pending transactions
    const StockTransaction = mongoose.model('StockTransaction');
    const hasTransactions = await StockTransaction.exists({
      $or: [
        { from_warehouse: warehouse._id },
        { to_warehouse: warehouse._id }
      ]
    });

    if (hasTransactions) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete warehouse with existing transaction history. Archive instead.',
        error: 'WAREHOUSE_HAS_TRANSACTIONS',
        recommendation: 'Use soft delete (is_active = false) instead of hard delete'
      });
    }

    // Get warehouse details before deletion for response
    const warehouseDetails = {
      _id: warehouse._id,
      warehouse_id: warehouse.warehouse_id,
      warehouse_name: warehouse.warehouse_name,
      warehouse_type: warehouse.warehouse_type,
      total_bins: warehouse.bins.length,
      active_bins: warehouse.bins.filter(b => b.is_active).length,
      created_at: warehouse.createdAt,
      deleted_at: new Date(),
      deleted_by: req.user._id
    };

    // Hard delete the warehouse
    await Warehouse.findByIdAndDelete(id);

    // Log the deletion (optional - create an audit log)
    console.log(`Warehouse deleted: ${warehouse.warehouse_id} (${warehouse.warehouse_name}) by user: ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: `Warehouse ${warehouse.warehouse_id} deleted successfully`,
      data: warehouseDetails
    });

  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete warehouse',
      error: error.message
    });
  }
};


// ======================================================
// GET GRN BY GRN NUMBER
// GET /api/grns/number/:number
// ======================================================
exports.getGRNByNumber = async (req, res) => {
  try {
    const { number } = req.params;

    const grn = await GRN.findOne({ grn_number: number })
      .populate('po_id')
      .populate('vendor_id')
      .populate('received_by', 'Username Email')
      .populate('qc_completed_by', 'Username Email')
      .populate('created_by', 'Username Email')
      .populate('updated_by', 'Username Email')
      .populate('items.item_id')
      .populate('stock_transaction_ids')
      .populate('ncr_id')
      .populate('receiving_store', 'warehouse_id warehouse_name warehouse_type location');

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found',
        error: 'GRN_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: grn
    });

  } catch (error) {
    console.error('Get GRN by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GRN',
      error: error.message
    });
  }
};

// ======================================================
// GET GRNs BY PURCHASE ORDER
// GET /api/grns/po/:po_id
// ======================================================
exports.getGRNsByPO = async (req, res) => {
  try {
    const { po_id } = req.params;
    const {
      page = 1,
      limit = 20,
      sort_by = 'grn_date',
      sort_order = 'desc'
    } = req.query;

    const filter = { po_id };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    const grns = await GRN.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('vendor_id', 'vendor_name vendor_code')
      .populate('received_by', 'Username Email')
      .populate('receiving_store', 'warehouse_id warehouse_name');

    const total = await GRN.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: grns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get GRNs by PO error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GRNs',
      error: error.message
    });
  }
};

// ======================================================
// GET GRNs BY VENDOR
// GET /api/grns/vendor/:vendor_id
// ======================================================
exports.getGRNsByVendor = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      qc_status,
      from_date,
      to_date,
      sort_by = 'grn_date',
      sort_order = 'desc'
    } = req.query;

    let filter = { vendor_id };

    if (status) filter.status = status;
    if (qc_status) filter.qc_status = qc_status;
    
    if (from_date || to_date) {
      filter.grn_date = {};
      if (from_date) filter.grn_date.$gte = new Date(from_date);
      if (to_date) filter.grn_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    const grns = await GRN.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('po_id', 'po_number')
      .populate('received_by', 'Username Email')
      .populate('receiving_store', 'warehouse_id warehouse_name');

    const total = await GRN.countDocuments(filter);

    // Calculate summary statistics
    const summary = await GRN.aggregate([
      { $match: { vendor_id: mongoose.Types.ObjectId(vendor_id) } },
      {
        $group: {
          _id: null,
          total_grns: { $sum: 1 },
          total_received_qty: { $sum: '$total_received_qty' },
          total_accepted_qty: { $sum: '$total_accepted_qty' },
          total_rejected_qty: { $sum: '$total_rejected_qty' },
          avg_acceptance_rate: {
            $avg: {
              $cond: [
                { $gt: ['$total_received_qty', 0] },
                { $multiply: [{ $divide: ['$total_accepted_qty', '$total_received_qty'] }, 100] },
                0
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: grns,
      summary: summary[0] || {
        total_grns: 0,
        total_received_qty: 0,
        total_accepted_qty: 0,
        total_rejected_qty: 0,
        avg_acceptance_rate: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get GRNs by vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GRNs',
      error: error.message
    });
  }
};

// ======================================================
// GET QC RESULTS FOR A GRN
// GET /api/grns/:id/qc-results
// ======================================================
exports.getQCResults = async (req, res) => {
  try {
    const { id } = req.params;

    const grn = await GRN.findById(id)
      .populate('items.item_id', 'part_no description')
      .populate('qc_id');

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found',
        error: 'GRN_NOT_FOUND'
      });
    }

    // Get inspection record
    const inspectionRecord = await InspectionRecord.findById(grn.qc_id)
      .populate('items.item_id', 'part_no description')
      .populate('created_by', 'Username Email')
      .populate('completed_by', 'Username Email');

    // Get NCR if exists
    let ncr = null;
    if (grn.ncr_id) {
      ncr = await NCR.findById(grn.ncr_id)
        .populate('created_by', 'Username Email');
    }

    // Get stock transactions for accepted items
    const stockTransactions = await StockTransaction.find({
      _id: { $in: grn.stock_transaction_ids }
    }).populate('item_id', 'part_no description');

    const qcResults = {
      grn: {
        _id: grn._id,
        grn_number: grn.grn_number,
        grn_date: grn.grn_date,
        po_number: grn.po_number,
        vendor_name: grn.vendor_name,
        status: grn.status,
        qc_status: grn.qc_status
      },
      summary: {
        total_received: grn.total_received_qty,
        total_accepted: grn.total_accepted_qty,
        total_rejected: grn.total_rejected_qty,
        acceptance_rate: grn.total_received_qty > 0 
          ? ((grn.total_accepted_qty / grn.total_received_qty) * 100).toFixed(2) + '%'
          : '0%',
        rejection_rate: grn.total_received_qty > 0
          ? ((grn.total_rejected_qty / grn.total_received_qty) * 100).toFixed(2) + '%'
          : '0%'
      },
      items: grn.items.map(item => ({
        _id: item._id,
        part_no: item.part_no,
        description: item.description,
        received_qty: item.received_qty,
        accepted_qty: item.accepted_qty,
        rejected_qty: item.rejected_qty,
        batch_no: item.batch_no,
        heat_no: item.heat_no,
        storage_location: item.storage_location,
        rejection_reason: item.rejection_reason,
        item_status: item.item_status
      })),
      inspection_record: inspectionRecord,
      ncr: ncr,
      stock_transactions: stockTransactions.map(t => ({
        _id: t._id,
        txn_id: t.txn_id,
        transaction_type: t.txn_type,
        quantity: t.quantity,
        total_value: t.total_value,
        batch_no: t.batch_no,
        heat_no: t.heat_no,
        created_at: t.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: qcResults
    });

  } catch (error) {
    console.error('Get QC results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QC results',
      error: error.message
    });
  }
};