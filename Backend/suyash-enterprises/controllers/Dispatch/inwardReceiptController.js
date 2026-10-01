// controllers/Dispatch/inwardReceiptController.js

const InwardReceipt = require('../../models/Dispatch/InwardReceipt');
const DeliveryChallan = require('../../models/Dispatch/DeliveryChallan');
const mongoose = require('mongoose');

// ============================================================
// 1. GET RECEIPT STATUS (Your desired format)
// ============================================================
exports.getReceiptStatus = async (req, res) => {
  try {
    const { dc_id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(dc_id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Delivery Challan ID format' 
      });
    }

    // Get the delivery challan
    const deliveryChallan = await DeliveryChallan.findById(dc_id);
    if (!deliveryChallan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Delivery Challan not found' 
      });
    }

    // Get all receipts for this DC
    const receipts = await InwardReceipt.find({ 
      dc_id: dc_id,
      status: { $in: ['Received', 'Partially Received'] }
    });

    // Build received map from receipts
    const receivedMap = {};
    receipts.forEach(receipt => {
      if (receipt.items && receipt.items.length > 0) {
        receipt.items.forEach(item => {
          const itemId = item.dc_item_id || item._id;
          if (itemId) {
            const key = itemId.toString();
            if (!receivedMap[key]) {
              receivedMap[key] = 0;
            }
            receivedMap[key] += item.receiving_qty || item.received_qty || 0;
          }
        });
      }
    });

    // Calculate totals
    let totalDispatchQty = 0;
    let totalReceivedQty = 0;
    let totalPendingQty = 0;

    const items = deliveryChallan.items.map(item => {
      const itemId = item._id.toString();
      const received = receivedMap[itemId] || 0;
      const dispatchQty = item.planned_qty || item.dispatch_qty || 0;
      const pending = Math.max(0, dispatchQty - received);
      
      totalDispatchQty += dispatchQty;
      totalReceivedQty += received;
      totalPendingQty += pending;

      let statusText = 'Pending';
      if (pending <= 0 && received > 0) {
        statusText = 'Fully Received';
      } else if (received > 0 && pending > 0) {
        statusText = 'Partially Received';
      }

      return {
        part_no: item.part_no || 'N/A',
        part_name: item.part_name || 'N/A',
        dispatch_qty: dispatchQty,
        received_qty: received,
        pending_qty: pending,
        is_fully_received: pending <= 0 && received > 0,
        status: statusText
      };
    });

    const isFullyReceived = totalPendingQty <= 0 && totalReceivedQty > 0;
    const receiptStatus = isFullyReceived ? 'Fully Received' : 
                         totalReceivedQty > 0 ? 'Partially Received' : 'Pending';

    // Build response in your desired format
    res.json({
      success: true,
      data: {
        dc_number: deliveryChallan.dc_number || 'N/A',
        dc_status: deliveryChallan.status || 'Unknown',
        receipt_status: receiptStatus,
        is_fully_received: isFullyReceived,
        total_dispatch_qty: totalDispatchQty,
        total_received_qty: totalReceivedQty,
        total_pending_qty: totalPendingQty,
        receipt_count: receipts.length,
        receipts: receipts.map(r => ({
          receipt_id: r.receipt_id || r._id,
          receipt_date: r.receipt_date,
          receipt_type: r.receipt_type || 'Inward',
          status: r.status || 'Draft',
          documents_count: r.documents ? r.documents.length : 0
        })),
        items: items
      }
    });

  } catch (error) {
    console.error('getReceiptStatus error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ============================================================
// 2. GET PENDING RECEIPTS
// ============================================================
exports.getPendingReceipts = async (req, res) => {
  try {
    const { dc_id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(dc_id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Delivery Challan ID format' 
      });
    }
    
    const deliveryChallan = await DeliveryChallan.findById(dc_id);
    if (!deliveryChallan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Delivery Challan not found' 
      });
    }

    const previousReceipts = await InwardReceipt.find({ 
      dc_id: dc_id,
      status: { $in: ['Received', 'Partially Received'] }
    });

    // Build received map
    const receivedMap = {};
    previousReceipts.forEach(receipt => {
      if (receipt.items && receipt.items.length > 0) {
        receipt.items.forEach(item => {
          const itemId = item.dc_item_id || item._id;
          if (itemId) {
            const key = itemId.toString();
            if (!receivedMap[key]) {
              receivedMap[key] = 0;
            }
            receivedMap[key] += item.receiving_qty || item.received_qty || 0;
          }
        });
      }
    });

    const pendingItems = deliveryChallan.items.map(item => {
      const itemId = item._id.toString();
      const received = receivedMap[itemId] || 0;
      const originalQty = item.planned_qty || item.dispatch_qty || 0;
      const pending = Math.max(0, originalQty - received);
      
      let statusText = 'Pending';
      if (pending <= 0 && received > 0) {
        statusText = 'Fully Received';
      } else if (received > 0 && pending > 0) {
        statusText = 'Partially Received';
      }

      return {
        dc_item_id: item._id,
        part_no: item.part_no || 'N/A',
        part_name: item.part_name || 'N/A',
        hsn_code: item.hsn_code || '',
        original_qty: originalQty,
        received_so_far: received,
        pending_qty: pending,
        unit: item.unit || 'Nos',
        unit_price: item.unit_price || 0,
        secondary_qty: item.secondary_qty || 0,
        secondary_unit: item.secondary_unit || '',
        item_process_remark: item.item_process_remark || '',
        batch_no: item.batch_no || '',
        serial_numbers: item.serial_numbers || [],
        is_fully_received: pending <= 0 && received > 0,
        status: statusText
      };
    });

    const totalPending = pendingItems.reduce((sum, i) => sum + i.pending_qty, 0);
    const totalReceived = pendingItems.reduce((sum, i) => sum + i.received_so_far, 0);
    const totalOriginal = pendingItems.reduce((sum, i) => sum + i.original_qty, 0);
    const isFullyReceived = totalPending <= 0 && totalReceived > 0;

    res.json({
      success: true,
      data: {
        dc_id: deliveryChallan._id,
        dc_number: deliveryChallan.dc_number || 'N/A',
        dc_date: deliveryChallan.dc_date,
        customer_name: deliveryChallan.customer_name || 'N/A',
        so_number: deliveryChallan.so_number || 'N/A',
        is_fully_received: isFullyReceived,
        total_original_qty: totalOriginal,
        total_received_so_far: totalReceived,
        total_pending_qty: totalPending,
        items: pendingItems,
        previous_receipts: previousReceipts.map(r => ({
          receipt_id: r.receipt_id || r._id,
          receipt_date: r.receipt_date,
          receipt_type: r.receipt_type || 'Inward',
          status: r.status || 'Draft',
          total_received_qty: r.total_received_qty || r.items?.reduce((sum, i) => sum + (i.receiving_qty || i.received_qty || 0), 0) || 0,
          documents: r.documents ? r.documents.map(d => ({
            document_type: d.document_type,
            file_name: d.file_name
          })) : []
        }))
      }
    });

  } catch (error) {
    console.error('getPendingReceipts error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ============================================================
// 3. CREATE INWARD RECEIPT
// ============================================================
exports.createInwardReceipt = async (req, res) => {
  try {
    const { 
      dc_id, 
      items, 
      receipt_type, 
      receipt_number, 
      receipt_note,
      document_types,
      reference_document_id,
      reference_document_type
    } = req.body;

    console.log('📦 Received body:', req.body);
    console.log('📁 Files received:', req.files ? req.files.length : 0);

    // Parse items if it's a string (coming from form-data)
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid items format. Must be valid JSON.' 
        });
      }
    }

    // Validate items is an array
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Items must be a non-empty array' 
      });
    }

    // Parse document_types if it's a string
    let parsedDocumentTypes = [];
    if (document_types) {
      try {
        parsedDocumentTypes = typeof document_types === 'string' 
          ? JSON.parse(document_types) 
          : document_types;
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid document_types format. Must be valid JSON array.' 
        });
      }
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(dc_id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Delivery Challan ID format' 
      });
    }

    // Validate DC exists
    const deliveryChallan = await DeliveryChallan.findById(dc_id);
    if (!deliveryChallan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Delivery Challan not found. Please check the dc_id' 
      });
    }

    console.log('✅ Found DC:', deliveryChallan.dc_number);

    // Get previous receipts
    const previousReceipts = await InwardReceipt.find({ 
      dc_id: dc_id,
      status: { $in: ['Received', 'Partially Received'] }
    });

    const receivedMap = {};
    previousReceipts.forEach(receipt => {
      if (receipt.items) {
        receipt.items.forEach(item => {
          const itemId = item.dc_item_id || item._id;
          if (itemId) {
            const key = itemId.toString();
            if (!receivedMap[key]) {
              receivedMap[key] = 0;
            }
            receivedMap[key] += item.receiving_qty || item.received_qty || 0;
          }
        });
      }
    });

    // Process each item
    const processedItems = [];
    let isFullyReceived = true;

    for (const item of parsedItems) {
      // Validate required fields
      if (!item.dc_item_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'dc_item_id is required for each item' 
        });
      }

      if (!item.receiving_qty || item.receiving_qty <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Valid receiving_qty is required for item ${item.dc_item_id}` 
        });
      }

      const dcItem = deliveryChallan.items.id(item.dc_item_id);
      if (!dcItem) {
        return res.status(400).json({ 
          success: false, 
          error: `DC item ${item.dc_item_id} not found in Delivery Challan` 
        });
      }

      const itemId = item.dc_item_id.toString();
      const previouslyReceived = receivedMap[itemId] || 0;
      const originalQty = dcItem.planned_qty || dcItem.dispatch_qty || 0;
      const pendingQty = originalQty - previouslyReceived;
      const receivingQty = item.receiving_qty;

      console.log(`📊 Item ${dcItem.part_no}: Pending=${pendingQty}, Receiving=${receivingQty}`);

      if (receivingQty > pendingQty) {
        return res.status(400).json({ 
          success: false, 
          error: `Receiving quantity (${receivingQty}) exceeds pending quantity (${pendingQty}) for item ${dcItem.part_no}` 
        });
      }

      const remainingQty = pendingQty - receivingQty;
      if (remainingQty > 0) {
        isFullyReceived = false;
      }

      processedItems.push({
        dc_item_id: item.dc_item_id,
        part_no: dcItem.part_no || 'N/A',
        part_name: dcItem.part_name || 'N/A',
        hsn_code: dcItem.hsn_code || '',
        original_qty: originalQty,
        previous_received_qty: previouslyReceived,
        receiving_qty: receivingQty,
        remaining_qty: remainingQty,
        unit: dcItem.unit || 'Nos',
        unit_price: dcItem.unit_price || 0,
        taxable_value: receivingQty * (dcItem.unit_price || 0),
        secondary_qty: dcItem.secondary_qty || 0,
        secondary_unit: dcItem.secondary_unit || '',
        item_process_remark: dcItem.item_process_remark || '',
        condition: item.condition || 'Good',
        remarks: item.remarks || '',
        batch_no: item.batch_no || dcItem.batch_no || '',
        serial_numbers: item.serial_numbers || dcItem.serial_numbers || [],
        location: item.location || '',
        quality_status: 'Pending'
      });
    }

    // Handle uploaded documents
    const uploadedDocuments = [];
    
    if (req.files && req.files.length > 0) {
      console.log('📁 Processing', req.files.length, 'files');
      req.files.forEach((file, index) => {
        const docType = parsedDocumentTypes[index] || 'GRN';
        uploadedDocuments.push({
          document_type: docType,
          document_number: '',
          document_date: null,
          file_path: file.path,
          file_name: file.originalname,
          file_size: file.size,
          mime_type: file.mimetype,
          uploaded_by: req.user._id,
          uploaded_at: new Date()
        });
      });
    }

    // Determine receipt type
    let finalReceiptType = receipt_type;
    if (!finalReceiptType) {
      const totalPending = processedItems.reduce((sum, i) => sum + i.remaining_qty, 0);
      if (totalPending === 0) {
        finalReceiptType = 'Full Receipt';
      } else {
        finalReceiptType = 'Partial Receipt';
      }
    }

    const finalStatus = isFullyReceived ? 'Received' : 'Partially Received';

    // Create the receipt
    const receipt = new InwardReceipt({
      dc_id: deliveryChallan._id,
      dc_number: deliveryChallan.dc_number,
      so_id: deliveryChallan.so_id,
      so_number: deliveryChallan.so_number,
      customer_id: deliveryChallan.customer_id,
      customer_name: deliveryChallan.customer_name,
      receipt_type: finalReceiptType,
      receipt_number: receipt_number || '',
      receipt_note: receipt_note || '',
      items: processedItems,
      documents: uploadedDocuments,
      reference_document_id: reference_document_id || null,
      reference_document_type: reference_document_type || '',
      received_by: req.user._id,
      created_by: req.user._id,
      status: finalStatus,
      is_fully_received: isFullyReceived,
      total_received_qty: processedItems.reduce((sum, i) => sum + i.receiving_qty, 0),
      total_items_pending: processedItems.reduce((sum, i) => sum + i.remaining_qty, 0)
    });

    await receipt.save();
    console.log('✅ Receipt created:', receipt.receipt_id);

    // Update DC status if fully received
    if (isFullyReceived) {
      deliveryChallan.status = 'Delivered';
      await deliveryChallan.save();
      console.log('✅ DC status updated to Delivered');
    }

    res.status(201).json({
      success: true,
      message: `Inward receipt ${receipt.receipt_id} created successfully`,
      data: {
        receipt_id: receipt.receipt_id,
        receipt_type: finalReceiptType,
        status: finalStatus,
        is_fully_received: isFullyReceived,
        total_received: receipt.total_received_qty,
        total_pending: receipt.total_items_pending,
        documents_uploaded: uploadedDocuments.length,
        items: receipt.items
      }
    });

  } catch (error) {
    console.error('❌ createInwardReceipt error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ============================================================
// 4. LIST INWARD RECEIPTS
// ============================================================
exports.listInwardReceipts = async (req, res) => {
  try {
    const { 
      dc_id, 
      so_id, 
      customer_id, 
      status, 
      from_date, 
      to_date,
      page = 1, 
      limit = 50 
    } = req.query;

    const query = {};
    if (dc_id) query.dc_id = dc_id;
    if (so_id) query.so_id = so_id;
    if (customer_id) query.customer_id = customer_id;
    if (status) query.status = status;
    if (from_date || to_date) {
      query.receipt_date = {};
      if (from_date) query.receipt_date.$gte = new Date(from_date);
      if (to_date) query.receipt_date.$lte = new Date(to_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [receipts, total] = await Promise.all([
      InwardReceipt.find(query)
        .populate('received_by', 'name email')
        .populate('created_by', 'name email')
        .sort({ receipt_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InwardReceipt.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('listInwardReceipts error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// 5. GET SINGLE INWARD RECEIPT
// ============================================================
exports.getInwardReceipt = async (req, res) => {
  try {
    const receipt = await InwardReceipt.findById(req.params.id)
      .populate('received_by', 'name email')
      .populate('created_by', 'name email');

    if (!receipt) {
      return res.status(404).json({ error: 'Inward receipt not found' });
    }

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('getInwardReceipt error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// 6. UPLOAD DOCUMENT FOR INWARD RECEIPT
// ============================================================
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type, document_number, document_date } = req.body;

    const receipt = await InwardReceipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ error: 'Inward receipt not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = {
      document_type: document_type || 'GRN',
      document_number: document_number || '',
      document_date: document_date ? new Date(document_date) : null,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user._id,
      uploaded_at: new Date()
    };

    receipt.documents.push(document);
    await receipt.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: document,
        receipt_id: receipt.receipt_id
      }
    });

  } catch (error) {
    console.error('uploadDocument error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// 7. GET RECEIPT SUMMARY
// ============================================================
exports.getReceiptSummary = async (req, res) => {
  try {
    const { dc_id } = req.params;

    const receipts = await InwardReceipt.find({ 
      dc_id: dc_id,
      status: { $in: ['Received', 'Partially Received'] }
    });

    if (receipts.length === 0) {
      return res.json({
        success: true,
        data: {
          dc_id: dc_id,
          has_receipts: false,
          message: 'No receipts found for this DC'
        }
      });
    }

    let totalReceived = 0;
    let totalTaxable = 0;
    const itemSummary = {};

    receipts.forEach(receipt => {
      if (receipt.items) {
        receipt.items.forEach(item => {
          const key = item.dc_item_id ? item.dc_item_id.toString() : item._id?.toString();
          if (key) {
            if (!itemSummary[key]) {
              itemSummary[key] = {
                part_no: item.part_no || 'N/A',
                part_name: item.part_name || 'N/A',
                total_received: 0,
                total_original: item.original_qty || 0
              };
            }
            itemSummary[key].total_received += item.receiving_qty || item.received_qty || 0;
            totalReceived += item.receiving_qty || item.received_qty || 0;
            totalTaxable += item.taxable_value || 0;
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        dc_id: dc_id,
        has_receipts: true,
        total_receipts: receipts.length,
        total_received_qty: totalReceived,
        total_taxable_value: totalTaxable,
        receipts: receipts.map(r => ({
          receipt_id: r.receipt_id || r._id,
          receipt_date: r.receipt_date,
          receipt_type: r.receipt_type || 'Inward',
          status: r.status || 'Draft',
          is_fully_received: r.is_fully_received || false,
          documents_count: r.documents ? r.documents.length : 0
        })),
        item_summary: Object.values(itemSummary)
      }
    });

  } catch (error) {
    console.error('getReceiptSummary error:', error);
    res.status(500).json({ error: error.message });
  }
};