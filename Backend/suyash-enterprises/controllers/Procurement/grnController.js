// controllers/Procurement/grnController.js
const GRN = require('../../models/Procurement/GRN');
const PurchaseOrder = require('../../models/Procurement/PurchaseOrder');
const StockTransaction = require('../../models/Inventory/StockTransaction');
const InspectionRecord = require('../../models/Quality/InspectionRecord');
const NCR = require('../../models/Quality/NCR');
const mongoose = require('mongoose');

// ======================================================
// CREATE GRN (Fixed for Partial Deliveries)
// POST /api/grns
// ======================================================
exports.createGRN = async (req, res) => {
  try {
    const {
      po_id,
      vehicle_no,
      lr_number,
      lr_date,
      transporter_name,
      vendor_invoice_no,
      vendor_invoice_date,
      receiving_store,
      items,
      remarks
    } = req.body;

    // 1. Validate PO exists
    const po = await PurchaseOrder.findById(po_id)
      .populate('vendor_id')
      .populate('items.item_id');

    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
        error: 'PO_NOT_FOUND'
      });
    }

    // 2. Check PO status - Allow GRN even if partially received
    const allowedStatuses = ['Acknowledged', 'Sent', 'Partially Received', 'Approved'];
    if (!allowedStatuses.includes(po.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot create GRN for PO with status: ${po.status}. PO must be Acknowledged, Sent, or Partially Received`,
        error: 'INVALID_PO_STATUS'
      });
    }

    // 3. Validate Warehouse exists
    const Warehouse = mongoose.model('Warehouse');
    const targetWarehouse = await Warehouse.findById(receiving_store);
    
    if (!targetWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiving_store. Warehouse not found',
        error: 'INVALID_WAREHOUSE'
      });
    }

    // Validate warehouse type
    const validReceivingTypes = ['Raw Material', 'Consumable', 'Tool', 'Subcontract', 'Quarantine'];
    if (!validReceivingTypes.includes(targetWarehouse.warehouse_type)) {
      return res.status(400).json({
        success: false,
        message: `Cannot receive material to warehouse type: ${targetWarehouse.warehouse_type}`,
        error: 'INVALID_WAREHOUSE_TYPE_FOR_RECEIPT'
      });
    }

    if (!targetWarehouse.is_active) {
      return res.status(400).json({
        success: false,
        message: `Warehouse ${targetWarehouse.warehouse_id} is inactive`,
        error: 'WAREHOUSE_INACTIVE'
      });
    }

    // 4. Validate items - Check if received quantity doesn't exceed pending quantity
    const grnItems = [];
    for (const receivedItem of items) {
      const poItem = po.items.find(
        item => item._id.toString() === receivedItem.po_item_id
      );

      if (!poItem) {
        return res.status(400).json({
          success: false,
          message: `PO item not found for ID: ${receivedItem.po_item_id}`,
          error: 'PO_ITEM_NOT_FOUND'
        });
      }

      // Calculate current pending quantity (ordered - received from ALL GRNs)
      const currentPendingQty = poItem.ordered_qty - poItem.received_qty;
      
      if (receivedItem.received_qty > poItem.ordered_qty) {
        return res.status(400).json({
          success: false,
          message: `Received quantity ${receivedItem.received_qty} exceeds ordered quantity ${poItem.ordered_qty} for item ${poItem.part_no}`,
          error: 'EXCESS_QUANTITY'
        });
      }

      if (receivedItem.received_qty > currentPendingQty) {
        return res.status(400).json({
          success: false,
          message: `Received quantity ${receivedItem.received_qty} exceeds pending quantity ${currentPendingQty} for item ${poItem.part_no}. Already received: ${poItem.received_qty}`,
          error: 'EXCESS_PENDING_QUANTITY'
        });
      }

      // Validate batch number is provided for traceability
      if (!receivedItem.batch_no) {
        return res.status(400).json({
          success: false,
          message: `Batch number is required for item ${poItem.part_no}`,
          error: 'BATCH_NO_REQUIRED'
        });
      }

      // Check for duplicate batch in same PO
      const existingBatchGRN = await GRN.findOne({
        po_id: po._id,
        'items.batch_no': receivedItem.batch_no,
        'items.item_id': poItem.item_id._id
      });

      if (existingBatchGRN) {
        return res.status(400).json({
          success: false,
          message: `Batch number ${receivedItem.batch_no} already exists for this PO item. Please use a unique batch number.`,
          error: 'DUPLICATE_BATCH'
        });
      }

      // Validate bin if provided
      if (receivedItem.storage_location) {
        const binExists = targetWarehouse.bins.some(
          bin => bin.bin_id === receivedItem.storage_location && bin.is_active
        );
        if (!binExists) {
          return res.status(400).json({
            success: false,
            message: `Bin ${receivedItem.storage_location} not found or inactive`,
            error: 'INVALID_BIN_LOCATION'
          });
        }
      }

      grnItems.push({
        po_item_id: receivedItem.po_item_id,
        item_id: poItem.item_id._id,
        part_no: poItem.part_no,
        description: poItem.description,
        received_qty: receivedItem.received_qty,
        accepted_qty: 0,  // Will be set after QC
        rejected_qty: 0,   // Will be set after QC
        unit: poItem.unit,
        batch_no: receivedItem.batch_no,
        heat_no: receivedItem.heat_no || '',
        mill_cert_path: receivedItem.mill_cert_path || '',
        expiry_date: receivedItem.expiry_date || null,
        storage_location: receivedItem.storage_location || '',
        item_status: 'Pending'
      });
    }

    // 5. Create GRN
    const grn = new GRN({
      grn_date: new Date(),
      po_id: po._id,
      po_number: po.po_number,
      vendor_id: po.vendor_id._id,
      vendor_name: po.vendor_name,
      vendor_invoice_no: vendor_invoice_no || '',
      vendor_invoice_date: vendor_invoice_date || null,
      vehicle_no: vehicle_no || '',
      lr_number: lr_number || '',
      lr_date: lr_date || null,
      transporter_name: transporter_name || '',
      receiving_store: targetWarehouse._id,
      received_by: req.user._id,
      receipt_time: new Date(),
      items: grnItems,
      qc_required: true,
      qc_status: 'Pending',
      status: 'Created',
      remarks: remarks || '',
      created_by: req.user._id,
      updated_by: req.user._id
    });

    await grn.save();

    // 6. Update PO received quantities (but NOT pending_qty yet - QC pending)
    // Only update received_qty, pending_qty will be updated after QC
    for (const receivedItem of items) {
      const poItem = po.items.find(
        item => item._id.toString() === receivedItem.po_item_id
      );
      
      if (poItem) {
        poItem.received_qty += receivedItem.received_qty;
        // pending_qty remains ordered_qty - received_qty
        poItem.pending_qty = poItem.ordered_qty - poItem.received_qty;
        
        if (poItem.pending_qty === 0) {
          poItem.item_status = 'Fully Received';
        } else if (poItem.received_qty > 0) {
          poItem.item_status = 'Partially Received';
        }
      }
    }

    // Update PO status
    const anyItemReceived = po.items.some(item => item.received_qty > 0);
    const allItemsFullyReceived = po.items.every(item => item.pending_qty === 0);

    if (allItemsFullyReceived) {
      po.status = 'Fully Received';
    } else if (anyItemReceived) {
      po.status = 'Partially Received';
    }

    await po.save();

    // 7. Create Inspection Record
    const inspectionItems = grn.items.map(item => ({
      item_id: item.item_id,
      part_no: item.part_no,
      description: item.description,
      received_qty: item.received_qty,
      batch_no: item.batch_no,
      sample_qty: Math.ceil(item.received_qty * 0.1),
      status: 'Pending'
    }));

    const inspectionRecord = new InspectionRecord({
      grn_id: grn._id,
      po_id: po._id,
      vendor_id: po.vendor_id._id,
      items: inspectionItems,
      inspection_type: 'Incoming',
      status: 'Pending',
      created_by: req.user._id
    });

    await inspectionRecord.save();
    
    grn.qc_id = inspectionRecord._id;
    await grn.save();

    res.status(201).json({
      success: true,
      message: 'GRN created successfully. QC inspection pending.',
      data: {
        _id: grn._id,
        grn_number: grn.grn_number,
        po_number: grn.po_number,
        status: grn.status,
        qc_status: grn.qc_status,
        total_received_qty: grn.total_received_qty,
        items: grn.items.map(item => ({
          part_no: item.part_no,
          batch_no: item.batch_no,
          received_qty: item.received_qty,
          pending_qc: true
        })),
        receiving_warehouse: {
          _id: targetWarehouse._id,
          warehouse_id: targetWarehouse.warehouse_id,
          warehouse_name: targetWarehouse.warehouse_name
        },
        inspection_record_id: inspectionRecord._id,
        next_step: 'QC inspection required'
      }
    });

  } catch (error) {
    console.error('Create GRN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create GRN',
      error: error.message
    });
  }
};


// ======================================================
// RECORD QC RESULTS (Fixed for Partial Acceptance)
// PUT /api/grns/:id/qc-result
// ======================================================
exports.recordQCResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, qc_remarks } = req.body;

    const grn = await GRN.findById(id)
      .populate('po_id')
      .populate('vendor_id');

    if (!grn) {
      return res.status(404).json({
        success: false,
        message: 'GRN not found',
        error: 'GRN_NOT_FOUND'
      });
    }

    if (grn.qc_status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `QC already completed with status: ${grn.qc_status}`,
        error: 'QC_ALREADY_COMPLETED'
      });
    }

    let totalAccepted = 0;
    let totalRejected = 0;
    const stockTransactions = [];

    for (const qcItem of items) {
      const grnItem = grn.items.find(
        item => item._id.toString() === qcItem.item_id
      );

      if (!grnItem) {
        return res.status(400).json({
          success: false,
          message: `Item not found in GRN: ${qcItem.item_id}`,
          error: 'ITEM_NOT_FOUND'
        });
      }

      if (qcItem.accepted_qty + qcItem.rejected_qty > grnItem.received_qty) {
        return res.status(400).json({
          success: false,
          message: `Accepted + Rejected quantity exceeds received quantity for item ${grnItem.part_no}`,
          error: 'INVALID_QUANTITY'
        });
      }

      // Update GRN item
      grnItem.accepted_qty = qcItem.accepted_qty;
      grnItem.rejected_qty = qcItem.rejected_qty;
      grnItem.rejection_reason = qcItem.rejection_reason || '';
      
      totalAccepted += qcItem.accepted_qty;
      totalRejected += qcItem.rejected_qty;

      if (qcItem.rejected_qty === grnItem.received_qty) {
        grnItem.item_status = 'Rejected';
      } else if (qcItem.accepted_qty === grnItem.received_qty) {
        grnItem.item_status = 'Accepted';
      } else if (qcItem.accepted_qty > 0) {
        grnItem.item_status = 'Partially Accepted';
      }

      // CREATE STOCK TRANSACTION & UPDATE STOCK LEDGER for accepted items
      if (qcItem.accepted_qty > 0) {
        const poItem = grn.po_id.items.find(i => i.part_no === grnItem.part_no);
        const unitCost = poItem?.unit_price || 0;
        
        const Warehouse = mongoose.model('Warehouse');
        const StockLedger = mongoose.model('StockLedger');
        
        const targetWarehouse = await Warehouse.findById(grn.receiving_store);
        
        if (!targetWarehouse) {
          return res.status(400).json({
            success: false,
            message: `Warehouse not found with ID: ${grn.receiving_store}`,
            error: 'WAREHOUSE_NOT_FOUND'
          });
        }

        let targetBin = grnItem.storage_location;
        if (!targetBin) {
          const activeBin = targetWarehouse.bins.find(bin => bin.is_active);
          if (activeBin) {
            targetBin = activeBin.bin_id;
            grnItem.storage_location = targetBin;
          }
        }

        // Create Stock Transaction with batch number
        const stockTransaction = new StockTransaction({
          txn_type: 'GRN Receipt',
          txn_date: new Date(),
          item_id: grnItem.item_id,
          part_no: grnItem.part_no,
          to_warehouse: targetWarehouse._id,
          to_bin: targetBin || null,
          quantity: qcItem.accepted_qty,
          unit: grnItem.unit,
          batch_no: grnItem.batch_no,  // IMPORTANT: Store batch number
          heat_no: grnItem.heat_no,
          unit_cost: unitCost,
          total_value: qcItem.accepted_qty * unitCost,
          ref_document_type: 'GRN',
          ref_document_id: grn.grn_number,
          ref_id: grn._id,
          remarks: `GRN Receipt - QC Accepted. Vendor: ${grn.vendor_name}, Batch: ${grnItem.batch_no}`,
          status: 'Posted',
          created_by: req.user._id,
          posted_by: req.user._id,
          posted_at: new Date()
        });
        
        await stockTransaction.save();
        stockTransactions.push(stockTransaction);
        grn.stock_transaction_ids.push(stockTransaction._id);

        // Update Stock Ledger with batch tracking
        let stockLedger = await StockLedger.findOne({
          item_id: grnItem.item_id,
          warehouse_id: targetWarehouse._id,
          bin_id: targetBin || null,
          batch_no: grnItem.batch_no  // Track by batch
        });

        if (stockLedger) {
          const oldQty = stockLedger.quantity;
          const oldCost = stockLedger.unit_cost;
          const oldValue = oldQty * oldCost;
          const newValue = qcItem.accepted_qty * unitCost;
          const totalQty = oldQty + qcItem.accepted_qty;
          const newAvgCost = (oldValue + newValue) / totalQty;
          
          stockLedger.quantity = totalQty;
          stockLedger.unit_cost = newAvgCost;
          stockLedger.total_value = totalQty * newAvgCost;
          stockLedger.last_updated = new Date();
          stockLedger.last_txn_id = stockTransaction._id;
          stockLedger.last_updated_by = req.user._id;
          
          await stockLedger.save();
        } else {
          let stockId;
          try {
            stockId = await StockLedger.generateStockId();
          } catch (idError) {
            stockId = `STK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          }
          
          stockLedger = new StockLedger({
            stock_id: stockId,
            item_id: grnItem.item_id,
            part_no: grnItem.part_no,
            warehouse_id: targetWarehouse._id,
            bin_id: targetBin || null,
            batch_no: grnItem.batch_no,  // Store batch number
            receipt_date: new Date(),
            quantity: qcItem.accepted_qty,
            reserved_qty: 0,
            unit: grnItem.unit,
            valuation_method: 'FIFO',  // Better for batch tracking
            unit_cost: unitCost,
            total_value: qcItem.accepted_qty * unitCost,
            min_stock: 0,
            max_stock: null,
            is_below_reorder: false,
            last_updated: new Date(),
            last_txn_id: stockTransaction._id,
            last_updated_by: req.user._id
          });
          
          await stockLedger.save();
        }
      }
    }

    // Update GRN totals and status
    grn.total_accepted_qty = totalAccepted;
    grn.total_rejected_qty = totalRejected;
    
    // Determine GRN status
    if (totalRejected === grn.total_received_qty) {
      grn.qc_status = 'Failed';
      grn.status = 'Rejected';
    } else if (totalAccepted === grn.total_received_qty) {
      grn.qc_status = 'Passed';
      grn.status = 'Accepted';
    } else {
      grn.qc_status = 'Partially Passed';
      grn.status = 'Partially Accepted';
    }
    
    grn.qc_completed_at = new Date();
    grn.qc_completed_by = req.user._id;
    grn.updated_by = req.user._id;
    grn.remarks = qc_remarks || grn.remarks;

    await grn.save();

    // CRITICAL: Update PO pending quantity based on QC results
    // Only accepted quantity reduces pending quantity
    // Rejected quantity should NOT reduce pending quantity
    const po = await PurchaseOrder.findById(grn.po_id);
    
    for (const grnItem of grn.items) {
      const poItem = po.items.find(
        item => item._id.toString() === grnItem.po_item_id.toString()
      );
      
      if (poItem) {
        // IMPORTANT: Only accepted quantity counts toward received
        // The received_qty was already increased on GRN creation
        // But if some quantity was rejected, we need to adjust
        // Actually, the correct approach:
        // received_qty = SUM of accepted_qty across all GRNs for this PO item
        // pending_qty = ordered_qty - received_qty
        
        // Recalculate received_qty as sum of all accepted quantities from all GRNs
        const allGRNsForPO = await GRN.find({ 
          po_id: po._id,
          'items.po_item_id': poItem._id
        });
        
        let totalAcceptedQty = 0;
        for (const grnDoc of allGRNsForPO) {
          for (const item of grnDoc.items) {
            if (item.po_item_id.toString() === poItem._id.toString()) {
              totalAcceptedQty += item.accepted_qty;
            }
          }
        }
        
        poItem.received_qty = totalAcceptedQty;
        poItem.pending_qty = poItem.ordered_qty - poItem.received_qty;
        
        if (poItem.pending_qty <= 0) {
          poItem.item_status = 'Fully Received';
        } else if (poItem.received_qty > 0) {
          poItem.item_status = 'Partially Received';
        }
      }
    }
    
    // Update PO status
    const allItemsFullyReceived = po.items.every(item => item.pending_qty <= 0);
    const anyItemReceived = po.items.some(item => item.received_qty > 0);
    
    if (allItemsFullyReceived) {
      po.status = 'Fully Received';
    } else if (anyItemReceived) {
      po.status = 'Partially Received';
    }
    
    await po.save();

    // Populate stock transactions for response
    const populatedStockTransactions = await StockTransaction.find({
      _id: { $in: stockTransactions.map(t => t._id) }
    }).populate('to_warehouse', 'warehouse_id warehouse_name');

    res.status(200).json({
      success: true,
      message: 'QC results recorded successfully',
      data: {
        grn_number: grn.grn_number,
        status: grn.status,
        qc_status: grn.qc_status,
        summary: {
          total_received: grn.total_received_qty,
          total_accepted: grn.total_accepted_qty,
          total_rejected: grn.total_rejected_qty,
          acceptance_rate: grn.total_received_qty > 0 
            ? ((grn.total_accepted_qty / grn.total_received_qty) * 100).toFixed(2) + '%' 
            : '0%',
          stock_updated: stockTransactions.length > 0
        },
        po_status: {
          status: po.status,
          items: po.items.map(item => ({
            part_no: item.part_no,
            ordered_qty: item.ordered_qty,
            received_qty: item.received_qty,
            pending_qty: item.pending_qty,
            item_status: item.item_status
          }))
        },
        stock_transactions: populatedStockTransactions.map(t => ({
          id: t._id,
          txn_id: t.txn_id,
          transaction_type: t.txn_type,
          quantity: t.quantity,
          batch_no: t.batch_no,
          to_warehouse: t.to_warehouse?.warehouse_id,
          to_bin: t.to_bin
        }))
      }
    });

  } catch (error) {
    console.error('Record QC result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record QC results',
      error: error.message
    });
  }
};


// ======================================================
// GET PURCHASE ORDER TIMELINE WITH BATCH TRACKING
// GET /api/grns/po/:po_id/timeline
// ======================================================
exports.getPOTimeline = async (req, res) => {
  try {
    const { po_id } = req.params;
    const { include_rejected = 'true', include_pending = 'true' } = req.query;

    // 1. Get Purchase Order details
    const po = await PurchaseOrder.findById(po_id)
      .populate('vendor_id', 'vendor_name vendor_code gst_number')
      .populate('created_by', 'Username Email')
      .populate('approved_by', 'Username Email');

    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
        error: 'PO_NOT_FOUND'
      });
    }

    // 2. Get all GRNs for this PO
    const grns = await GRN.find({ po_id: po._id })
      .populate('received_by', 'Username Email')
      .populate('qc_completed_by', 'Username Email')
      .populate('receiving_store', 'warehouse_id warehouse_name warehouse_type')
      .sort({ grn_date: 1 });  // Chronological order

    // 3. Get all stock transactions for these GRNs
    const stockTransactionIds = grns.flatMap(grn => grn.stock_transaction_ids);
    const stockTransactions = await StockTransaction.find({
      _id: { $in: stockTransactionIds }
    }).populate('to_warehouse', 'warehouse_id warehouse_name')
      .populate('from_warehouse', 'warehouse_id warehouse_name');

    // 4. Build timeline for each PO item
    const timeline = [];

    for (const poItem of po.items) {
      const itemTimeline = {
        po_item_id: poItem._id,
        part_no: poItem.part_no,
        description: poItem.description,
        hsn_code: poItem.hsn_code,
        unit: poItem.unit,
        unit_price: poItem.unit_price,
        ordered_qty: poItem.ordered_qty,
        received_qty: poItem.received_qty,
        pending_qty: poItem.pending_qty,
        item_status: poItem.item_status,
        
        // Batch-wise breakdown
        batches: [],
        
        // Timeline events
        events: [],
        
        // Summary statistics
        summary: {
          total_accepted: 0,
          total_rejected: 0,
          total_pending: poItem.pending_qty,
          total_grns: 0,
          acceptance_rate: 0,
          rejection_rate: 0
        }
      };

      // Process each GRN for this PO item
      for (const grn of grns) {
        const grnItem = grn.items.find(
          item => item.po_item_id.toString() === poItem._id.toString()
        );

        if (!grnItem) continue;

        itemTimeline.summary.total_grns++;
        
        // Get stock transaction for this GRN item
        const stockTxn = stockTransactions.find(
          txn => txn.ref_id?.toString() === grn._id.toString() && 
                 txn.item_id?.toString() === grnItem.item_id?.toString()
        );

        // Find warehouse details
        let warehouseDetails = null;
        if (grn.receiving_store) {
          warehouseDetails = {
            id: grn.receiving_store._id,
            warehouse_id: grn.receiving_store.warehouse_id,
            warehouse_name: grn.receiving_store.warehouse_name,
            warehouse_type: grn.receiving_store.warehouse_type
          };
        }

        // Create batch record
        const batchRecord = {
          batch_no: grnItem.batch_no,
          heat_no: grnItem.heat_no,
          grn_number: grn.grn_number,
          grn_date: grn.grn_date,
          received_qty: grnItem.received_qty,
          accepted_qty: grnItem.accepted_qty,
          rejected_qty: grnItem.rejected_qty,
          rejection_reason: grnItem.rejection_reason,
          expiry_date: grnItem.expiry_date,
          
          // Storage information
          storage_location: {
            warehouse: warehouseDetails,
            bin: grnItem.storage_location || 'Not assigned',
            bin_updated_at: grnItem.storage_location ? grn.updatedAt : null
          },
          
          // QC information
          qc: {
            status: grnItem.item_status,
            qc_status: grn.qc_status,
            qc_completed_at: grn.qc_completed_at,
            qc_completed_by: grn.qc_completed_by?.Username || 'System',
            remarks: grn.remarks
          },
          
          // Stock transaction details
          stock_transaction: stockTxn ? {
            txn_id: stockTxn.txn_id,
            txn_type: stockTxn.txn_type,
            quantity: stockTxn.quantity,
            unit_cost: stockTxn.unit_cost,
            total_value: stockTxn.total_value,
            posted_at: stockTxn.posted_at || stockTxn.createdAt,
            posted_by: stockTxn.posted_by
          } : null,
          
          // Acceptance rate for this batch
          batch_acceptance_rate: grnItem.received_qty > 0 
            ? ((grnItem.accepted_qty / grnItem.received_qty) * 100).toFixed(2) + '%'
            : '0%'
        };

        itemTimeline.batches.push(batchRecord);
        
        // Update summary totals
        itemTimeline.summary.total_accepted += grnItem.accepted_qty;
        itemTimeline.summary.total_rejected += grnItem.rejected_qty;

        // Create timeline events for this GRN
        // Event 1: GRN Created
        itemTimeline.events.push({
          event_id: `${grn.grn_number}_created`,
          event_type: 'GRN_CREATED',
          event_date: grn.createdAt,
          title: `GRN Created - ${grn.grn_number}`,
          description: `Goods Receipt Note created for ${grnItem.received_qty} ${grnItem.unit}`,
          details: {
            grn_number: grn.grn_number,
            received_quantity: grnItem.received_qty,
            transport: {
              vehicle_no: grn.vehicle_no,
              lr_number: grn.lr_number,
              transporter: grn.transporter_name
            },
            invoice: {
              number: grn.vendor_invoice_no,
              date: grn.vendor_invoice_date
            }
          },
          icon: '📦',
          color: 'blue'
        });

        // Event 2: QC Inspection
        if (grn.qc_status !== 'Pending') {
          itemTimeline.events.push({
            event_id: `${grn.grn_number}_qc`,
            event_type: 'QC_COMPLETED',
            event_date: grn.qc_completed_at || grn.updatedAt,
            title: `QC Inspection Completed - ${grn.qc_status}`,
            description: `QC Status: ${grn.qc_status}. Accepted: ${grnItem.accepted_qty}, Rejected: ${grnItem.rejected_qty}`,
            details: {
              qc_status: grn.qc_status,
              accepted_quantity: grnItem.accepted_qty,
              rejected_quantity: grnItem.rejected_qty,
              rejection_reason: grnItem.rejection_reason,
              qc_completed_by: grn.qc_completed_by?.Username || 'System',
              remarks: grn.remarks
            },
            icon: grnItem.accepted_qty > 0 ? '✅' : '❌',
            color: grnItem.accepted_qty > 0 ? 'green' : 'red'
          });
        }

        // Event 3: Stock Updated (if accepted quantity > 0)
        if (grnItem.accepted_qty > 0 && stockTxn) {
          itemTimeline.events.push({
            event_id: `${grn.grn_number}_stock`,
            event_type: 'STOCK_UPDATED',
            event_date: stockTxn.posted_at || stockTxn.createdAt,
            title: `Stock Updated - ${grnItem.batch_no}`,
            description: `${grnItem.accepted_qty} ${grnItem.unit} added to ${warehouseDetails?.warehouse_id || 'Warehouse'} at bin ${grnItem.storage_location || 'Not assigned'}`,
            details: {
              batch_no: grnItem.batch_no,
              quantity: grnItem.accepted_qty,
              unit: grnItem.unit,
              warehouse: warehouseDetails,
              bin: grnItem.storage_location,
              unit_cost: stockTxn.unit_cost,
              total_value: stockTxn.total_value,
              transaction_id: stockTxn.txn_id
            },
            icon: '📍',
            color: 'green'
          });
        }

        // Event 4: Inventory Aging Alert (if applicable)
        if (grnItem.expiry_date) {
          const daysToExpiry = Math.floor((new Date(grnItem.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
          if (daysToExpiry <= 30 && daysToExpiry > 0 && grnItem.accepted_qty > 0) {
            itemTimeline.events.push({
              event_id: `${grn.grn_number}_expiry`,
              event_type: 'EXPIRY_WARNING',
              event_date: new Date(),
              title: `Batch Expiry Warning - ${grnItem.batch_no}`,
              description: `Batch will expire in ${daysToExpiry} days on ${new Date(grnItem.expiry_date).toLocaleDateString()}`,
              details: {
                batch_no: grnItem.batch_no,
                expiry_date: grnItem.expiry_date,
                days_to_expiry: daysToExpiry,
                current_stock: grnItem.accepted_qty,
                action_required: daysToExpiry <= 7 ? 'IMMEDIATE ACTION REQUIRED' : 'Plan for usage'
              },
              icon: '⚠️',
              color: 'orange'
            });
          }
        }
      }

      // Calculate rates
      if (itemTimeline.summary.total_accepted + itemTimeline.summary.total_rejected > 0) {
        const totalProcessed = itemTimeline.summary.total_accepted + itemTimeline.summary.total_rejected;
        itemTimeline.summary.acceptance_rate = ((itemTimeline.summary.total_accepted / totalProcessed) * 100).toFixed(2) + '%';
        itemTimeline.summary.rejection_rate = ((itemTimeline.summary.total_rejected / totalProcessed) * 100).toFixed(2) + '%';
      }

      // Sort events chronologically
      itemTimeline.events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

      timeline.push(itemTimeline);
    }

    // 5. Get pending items that are not yet received
    let pendingItems = [];
    if (include_pending === 'true') {
      pendingItems = po.items
        .filter(item => item.pending_qty > 0)
        .map(item => ({
          po_item_id: item._id,
          part_no: item.part_no,
          description: item.description,
          pending_qty: item.pending_qty,
          unit: item.unit,
          unit_price: item.unit_price,
          required_date: item.required_date,
          status: 'Pending Receipt'
        }));
    }

    // 6. Get rejected items summary
    let rejectedItems = [];
    if (include_rejected === 'true') {
      rejectedItems = grns.flatMap(grn =>
        grn.items
          .filter(item => item.rejected_qty > 0)
          .map(item => ({
            grn_number: grn.grn_number,
            grn_date: grn.grn_date,
            part_no: item.part_no,
            description: item.description,
            batch_no: item.batch_no,
            rejected_qty: item.rejected_qty,
            unit: item.unit,
            rejection_reason: item.rejection_reason,
            qc_status: grn.qc_status
          }))
      );
    }

    // 7. Create PO header timeline
    const poHeaderTimeline = [
      {
        event_id: 'po_created',
        event_type: 'PO_CREATED',
        event_date: po.createdAt,
        title: 'Purchase Order Created',
        description: `PO ${po.po_number} created`,
        details: {
          po_number: po.po_number,
          po_date: po.po_date,
          po_type: po.po_type,
          created_by: po.created_by?.Username || 'System'
        },
        icon: '📄',
        color: 'blue'
      },
      {
        event_id: 'po_approved',
        event_type: 'PO_APPROVED',
        event_date: po.approved_at || po.createdAt,
        title: 'Purchase Order Approved',
        description: `PO approved for processing`,
        details: {
          approved_by: po.approved_by?.Username || 'System',
          approved_at: po.approved_at
        },
        icon: '✓',
        color: 'green'
      }
    ];

    // Add vendor acknowledgment if available
    if (po.vendor_acknowledgement && po.ack_date) {
      poHeaderTimeline.push({
        event_id: 'po_acknowledged',
        event_type: 'PO_ACKNOWLEDGED',
        event_date: po.ack_date,
        title: 'Vendor Acknowledged',
        description: `Vendor has acknowledged the purchase order`,
        details: {
          acknowledged_at: po.ack_date
        },
        icon: '🤝',
        color: 'purple'
      });
    }

    // 8. Prepare final response
    const response = {
      success: true,
      data: {
        po: {
          _id: po._id,
          po_number: po.po_number,
          po_date: po.po_date,
          po_type: po.po_type,
          status: po.status,
          vendor: {
            _id: po.vendor_id?._id,
            vendor_name: po.vendor_name,
            vendor_code: po.vendor_id?.vendor_code,
            gst_number: po.vendor_id?.gst_number
          },
          grand_total: po.grand_total,
          delivery_date: po.delivery_date,
          delivery_address: po.delivery_address
        },
        
        // Overall summary
        overall_summary: {
          total_ordered_qty: po.items.reduce((sum, item) => sum + item.ordered_qty, 0),
          total_received_qty: po.items.reduce((sum, item) => sum + item.received_qty, 0),
          total_accepted_qty: timeline.reduce((sum, item) => sum + item.summary.total_accepted, 0),
          total_rejected_qty: timeline.reduce((sum, item) => sum + item.summary.total_rejected, 0),
          total_pending_qty: po.items.reduce((sum, item) => sum + item.pending_qty, 0),
          total_grns_created: grns.length,
          completion_percentage: po.items.reduce((sum, item) => sum + item.ordered_qty, 0) > 0
            ? ((po.items.reduce((sum, item) => sum + item.received_qty, 0) / 
                po.items.reduce((sum, item) => sum + item.ordered_qty, 0)) * 100).toFixed(2) + '%'
            : '0%'
        },
        
        // Timeline
        po_timeline: poHeaderTimeline,
        
        // Item-wise details with batch tracking
        item_timeline: timeline,
        
        // Pending items for future GRNs
        pending_items: pendingItems,
        
        // Rejected items summary
        rejected_items: rejectedItems,
        
        // All GRNs summary
        grn_summary: grns.map(grn => ({
          grn_number: grn.grn_number,
          grn_date: grn.grn_date,
          qc_status: grn.qc_status,
          total_received: grn.total_received_qty,
          total_accepted: grn.total_accepted_qty,
          total_rejected: grn.total_rejected_qty,
          status: grn.status,
          warehouse: grn.receiving_store?.warehouse_id || 'Unknown',
          created_by: grn.created_by?.Username || 'System'
        }))
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Get PO timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PO timeline',
      error: error.message
    });
  }
};

// ======================================================
// GET PENDING ITEMS FOR GRN CREATION
// GET /api/grns/po/:po_id/pending-items
// ======================================================
exports.getPONewGRNItems = async (req, res) => {
  try {
    const { po_id } = req.params;

    const po = await PurchaseOrder.findById(po_id)
      .populate('items.item_id');

    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
        error: 'PO_NOT_FOUND'
      });
    }

    // Get all existing GRNs for this PO to see which batches were already received
    const existingGRNs = await GRN.find({ po_id: po._id });
    
    // Get all previously used batch numbers
    const usedBatches = new Set();
    existingGRNs.forEach(grn => {
      grn.items.forEach(item => {
        if (item.batch_no) {
          usedBatches.add(item.batch_no);
        }
      });
    });

    // Calculate pending items (only items with pending_qty > 0)
    const pendingItems = po.items
      .filter(item => item.pending_qty > 0)
      .map(item => ({
        po_item_id: item._id,
        part_no: item.part_no,
        description: item.description,
        ordered_qty: item.ordered_qty,
        received_qty: item.received_qty,
        pending_qty: item.pending_qty,
        unit: item.unit,
        unit_price: item.unit_price,
        required_date: item.required_date,
        previous_batches: existingGRNs
          .flatMap(grn => grn.items)
          .filter(grnItem => grnItem.po_item_id.toString() === item._id.toString())
          .map(grnItem => ({
            batch_no: grnItem.batch_no,
            received_qty: grnItem.received_qty,
            accepted_qty: grnItem.accepted_qty,
            rejected_qty: grnItem.rejected_qty,
            grn_number: existingGRNs.find(g => g.items.includes(grnItem))?.grn_number,
            grn_date: existingGRNs.find(g => g.items.includes(grnItem))?.grn_date
          }))
      }));

    res.status(200).json({
      success: true,
      data: {
        po_id: po._id,
        po_number: po.po_number,
        po_date: po.po_date,
        vendor_name: po.vendor_name,
        status: po.status,
        pending_items: pendingItems,
        used_batch_numbers: Array.from(usedBatches),
        total_pending_quantity: pendingItems.reduce((sum, item) => sum + item.pending_qty, 0)
      }
    });

  } catch (error) {
    console.error('Get PO pending items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending items',
      error: error.message
    });
  }
};

// ======================================================
// GET ALL GRNs
// GET /api/grns
// ======================================================
exports.getAllGRNs = async (req, res) => {
  try {
    const {
      status,
      qc_status,
      po_id,
      vendor_id,
      from_date,
      to_date,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (qc_status) filter.qc_status = qc_status;
    if (po_id) filter.po_id = po_id;
    if (vendor_id) filter.vendor_id = vendor_id;

    if (from_date || to_date) {
      filter.grn_date = {};
      if (from_date) filter.grn_date.$gte = new Date(from_date);
      if (to_date) filter.grn_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sort_by] = sort_order === 'asc' ? 1 : -1;

    // Get GRNs - DON'T populate receiving_store yet (handle manually)
    const grns = await GRN.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('po_id', 'po_number')
      .populate('vendor_id', 'vendor_name vendor_code')
      .populate('received_by', 'Username Email')
      .populate('created_by', 'Username Email');
      // REMOVED: .populate('receiving_store') - to avoid errors

    const total = await GRN.countDocuments(filter);

    // Get all warehouses for lookup
    const Warehouse = mongoose.model('Warehouse');
    const allWarehouses = await Warehouse.find({}, '_id warehouse_id warehouse_name');
    
    // Create lookup maps
    const warehouseById = {};
    const warehouseByCode = {};
    allWarehouses.forEach(wh => {
      warehouseById[wh._id.toString()] = wh.warehouse_name;
      warehouseByCode[wh.warehouse_id] = wh.warehouse_name;
    });

    // Process each GRN
    const processedGrns = grns.map(grn => {
      const grnObj = grn.toObject();
      let warehouseName = 'Unknown Warehouse';
      
      // Try to get warehouse name
      if (grn.receiving_store) {
        const receivingStoreStr = grn.receiving_store.toString();
        
        // Check if it's a valid ObjectId and exists in our map
        if (warehouseById[receivingStoreStr]) {
          warehouseName = warehouseById[receivingStoreStr];
        }
        // Check if it's a warehouse code like "WH-RM01"
        else if (warehouseByCode[receivingStoreStr]) {
          warehouseName = warehouseByCode[receivingStoreStr];
        }
      }
      
      grnObj.warehouse_name = warehouseName;
      return grnObj;
    });

    res.status(200).json({
      success: true,
      data: processedGrns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all GRNs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GRNs',
      error: error.message
    });
  }
};


// ======================================================
// GET GRN BY ID
// GET /api/grns/:id
// ======================================================
exports.getGRNById = async (req, res) => {
  try {
    const { id } = req.params;

    const grn = await GRN.findById(id)
      .populate('po_id')
      .populate('vendor_id')
      .populate('received_by', 'Username Email')
      .populate('qc_completed_by', 'Username Email')
      .populate('created_by', 'Username Email')
      .populate('updated_by', 'Username Email')
      .populate('items.item_id')
      .populate('stock_transaction_ids')
      .populate('ncr_id');

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
    console.error('Get GRN by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GRN',
      error: error.message
    });
  }
};