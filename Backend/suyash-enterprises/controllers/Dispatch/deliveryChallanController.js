// controllers/Dispatch/deliveryChallanController.js
const DeliveryChallan = require('../../models/Dispatch/DeliveryChallan');
const mongoose = require('mongoose');
const EwayBillService = require('../../services/Dispatch/ewayBillService');
const DistanceCalculator = require('../../services/Dispatch/distanceCalculator');
const Vendor = require('../../models/CRM/Vendor');
const Item = require('../../models/CRM/Item');
const Bom = require('../../models/BOM/Bom');

// Helper function to generate dummy EWB number (for development/fallback)
const generateDummyEwbNumber = () => {
  return 'EWB' + Date.now().toString().slice(-12) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

// Helper function to generate auto-manual EWB number when GST is not accessible
const generateAutoManualEwbNumber = (deliveryChallan) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const digits = (datePart + random).split('');
  const sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
  const checksum = sum % 9;
  return `AUTO${datePart}${random}${checksum}`;
};

// Helper function to get Sales Order
async function getSalesOrder(soId) {
  try {
    const SalesOrder = mongoose.model('SalesOrder');
    return await SalesOrder.findById(soId);
  } catch (error) {
    console.error('Error fetching Sales Order:', error);
    return null;
  }
}

// Helper function to check GST connectivity
async function checkGstConnectivity() {
  try {
    const axios = require('axios');
    await axios.get('https://api.ewaybillgst.gov.in', {
      timeout: 5000,
      validateStatus: false
    });
    console.log('[GST] Connectivity check: SUCCESS');
    return true;
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      console.log('[GST] Connectivity check: TIMEOUT - Server unreachable');
    } else if (error.code === 'ENOTFOUND') {
      console.log('[GST] Connectivity check: DNS FAILURE - Cannot resolve host');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('[GST] Connectivity check: CONNECTION REFUSED');
    } else {
      console.log('[GST] Connectivity check: FAILED -', error.code || error.message);
    }
    return false;
  }
}

// Create Delivery Challan (With Weight Fields)
exports.createDeliveryChallan = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      so_id,  
       so_number, 
      vendor_id,
      dc_date,
      nature_of_processing,
      items,
      ship_to,
      packing,
      job_work,
      dc_type,
      dispatch_through,
      transport,
      challan_meta
    } = req.body;

    // =============================================================
    // ✅ FETCH VENDOR INSTEAD OF SALES ORDER
    // =============================================================
    if (!vendor_id) {
      return res.status(400).json({ error: 'vendor_id is required' });
    }

    const vendor = await Vendor.findById(vendor_id);
    if (!vendor) {
      return res.status(404).json({ error: `Vendor ${vendor_id} not found` });
    }

    // =============================================================
    // ✅ VALIDATE nature_of_processing
    // =============================================================
    if (nature_of_processing) {
      const allowedValues = [
        'Chamfer',
        'Zinc blue plating',
        'Yellow plating',
        'Brazing',
        'Dimple and forming',
        'Hardening',
        'Paint',
        'Phosphating',
        'Tapping',
        'Blackodising',
        'Machining',
        'Thin plating',
        'Silver Plating'
      ];
      if (!allowedValues.includes(nature_of_processing)) {
        return res.status(400).json({ 
          error: `Invalid nature_of_processing. Allowed values: ${allowedValues.join(', ')}` 
        });
      }
    }

    // =============================================================
    // ✅ Validate items (if any)
    // =============================================================
    if (items && items.length > 0) {
      for (const item of items) {
        if (!item.part_no || !item.dispatch_qty) {
          return res.status(400).json({
            error: 'Each item must have part_no and dispatch_qty'
          });
        }
      }
    }

    // =============================================================
    // ✅ Generate DC Number
    // =============================================================
    const dcNumber = await DeliveryChallan.generateDCNumber();

    // =============================================================
    // ✅ Company Details
    // =============================================================
    const companyObjectId = new mongoose.Types.ObjectId();
    const vendorObjectId = vendor._id instanceof mongoose.Types.ObjectId
      ? vendor._id
      : new mongoose.Types.ObjectId(vendor._id);

    const company = {
      _id: companyObjectId,
      name: req.user.company_name || 'Suyash Enterprises',
      gstin: req.user.company_gstin || '27AAJFS0232P1ZW',
      email: req.user.company_email || 'suyashents@gmail.com',
      address: {
        line1: req.user.company_address?.line1 || 'Plant 1-W-222, Plant II - E-112',
        line2: req.user.company_address?.line2 || 'MIDC, Ambad',
        city: req.user.company_address?.city || 'Nashik',
        district: req.user.company_address?.district || 'Nashik',
        state: req.user.company_address?.state || 'Maharashtra',
        state_code: req.user.company_address?.state_code || 27,
        pincode: req.user.company_address?.pincode || '422010',
        country: req.user.company_address?.country || 'India'
      },
      dispatch_address: req.user.dispatch_address || {
        line1: 'Plant 1-W-222, Plant II - E-112',
        line2: 'MIDC, Ambad',
        city: 'Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        state_code: 27,
        pincode: '422010',
        country: 'India'
      }
    };

    // =============================================================
    // ✅ Vendor as Customer (Consignee)
    // =============================================================
    const customer = {
      _id: vendorObjectId,
      name: vendor.vendor_name,
      gstin: vendor.gstin || ''
    };

    // =============================================================
    // ✅ GST Type
    // =============================================================
    const companyStateCode = company.address.state_code || 27;
    const shipToStateCode = ship_to?.state_code || 27;
    const isInterState = companyStateCode !== shipToStateCode;
    const gstType = isInterState ? 'IGST' : 'CGST/SGST';

    // =============================================================
    // ✅ Calculate Total Value
    // =============================================================
    const totalValue = items ? items.reduce((sum, i) => sum + (i.dispatch_qty * (i.unit_price || 0)), 0) : 0;
    const ewayBillRequired = totalValue > 50000;

    // =============================================================
    // ✅ Prepare Items WITH WEIGHT FETCHING
    // =============================================================
  // In createDeliveryChallan, when preparing items:

const preparedItems = items ? await Promise.all(items.map(async (item) => {
  let itemWeight = 0;
  let bomWeight = 0;
  let weightPerUnit = 0;
  let finalDispatchQty = item.dispatch_qty;

  try {
    const itemMaster = await Item.findOne({ part_no: item.part_no.toUpperCase() });
    if (itemMaster) {
      // ✅ Get weight_per_unit_kg from item master
      weightPerUnit = itemMaster.weight_per_unit_kg || 0;
      
      // ✅ If weight_kg is provided instead of dispatch_qty
      if (item.weight_kg && item.weight_kg > 0 && weightPerUnit > 0) {
        // Calculate quantity from weight
        finalDispatchQty = item.weight_kg / weightPerUnit;
        
        // Round for Nos, Piece, Set
        if (['Nos', 'Piece', 'Set'].includes(item.unit || itemMaster.unit)) {
          finalDispatchQty = Math.round(finalDispatchQty);
        }
        
        // Store weight_kg for reference
        item.weight_kg_used = item.weight_kg;
      }
      
      // Existing weight fetching logic
      itemWeight = itemMaster.net_weight_kg || itemMaster.gross_weight_kg || 0;
      
      const bom = await Bom.findOne({
        parent_item_id: itemMaster._id,
        is_default: true,
        is_active: true,
        status: { $in: ['Active', 'Approved'] }
      }).select('bom_weight');
      
      bomWeight = bom?.bom_weight || 0;
    }
  } catch (err) {
    console.warn(`[DC Weight] Failed to fetch weight for ${item.part_no}:`, err.message);
  }

  return {
    so_item_id: new mongoose.Types.ObjectId(),
    part_no: item.part_no,
    part_name: item.part_name || item.part_no,
    hsn_code: item.hsn_code || '',
    dispatch_qty: finalDispatchQty,  // ← Use calculated quantity
    unit: item.unit || 'Nos',
    unit_price: item.unit_price || 0,
    taxable_value: (finalDispatchQty * (item.unit_price || 0)),
    batch_no: item.batch_no || '',
    quality_cert_id: item.quality_cert_id || null,
    qc_passed: true,
    secondary_qty: item.secondary_qty || 0,
    secondary_unit: item.secondary_unit || '',
    item_process_remark: item.item_process_remark || '',
    bom_weight_kg: +(bomWeight * finalDispatchQty).toFixed(3),
    item_weight_kg: +(itemWeight * finalDispatchQty).toFixed(3),
    weight_per_unit_kg: weightPerUnit,  // ← Store for reference
    weight_kg_used: item.weight_kg || 0  // ← Store input weight
  };
})) : [];

    // =============================================================
    // ✅ Prepare Packing
    // =============================================================
    let packingArray = [];
    if (packing) {
      packingArray = Array.isArray(packing) ? packing : [packing];
    }

    // =============================================================
    // ✅ CREATE DELIVERY CHALLAN
    // =============================================================
    const deliveryChallan = new DeliveryChallan({
      dc_number: dcNumber,
      dc_date: new Date(),
      nature_of_processing: nature_of_processing || '',
     // so_id: new mongoose.Types.ObjectId(),
     so_id: so_id ? new mongoose.Types.ObjectId(so_id) : null,
      so_number: so_number || '',
      customer_po_number: '',
      company_id: company._id,
      company_name: company.name,
      company_gstin: company.gstin,
      company_address: company.address,
      company_email: company.email,
      customer_id: customer._id,
      customer_name: customer.name,
      customer_gstin: customer.gstin,
      ship_from: company.dispatch_address,
      ship_to: ship_to || company.dispatch_address,
      billing_address: ship_to || company.dispatch_address,
      gst_type: gstType,
      items: preparedItems,
      packing: packingArray.map(p => ({
        no_of_packages: p.no_of_packages || 1,
        gross_weight_kg: p.gross_weight_kg || 0,
        net_weight_kg: p.net_weight_kg || 0,
        packing_type: p.packing_type || 'Cardboard Box',
        packing_details: p.packing_details || '',
        dimension_l_mm: p.dimension_l_mm || 0,
        dimension_w_mm: p.dimension_w_mm || 0,
        dimension_h_mm: p.dimension_h_mm || 0,
        volumetric_weight_kg: p.volumetric_weight_kg || 0
      })),
      eway_bill: {
        eway_bill_required: ewayBillRequired,
        eway_bill_status: ewayBillRequired ? 'Pending' : 'Not Required'
      },
      transport: {
        dispatch_mode: '',
        dispatch_through: dispatch_through || transport?.dispatch_through || '',
        freight_terms: ''
      },
      gate_pass: {},
      pod: {},
      status: 'Planned',
      created_by: new mongoose.Types.ObjectId(req.user._id),
      is_active: true,
      job_work: {
        nature_of_processing: job_work?.nature_of_processing || nature_of_processing || '',
        duration_of_process_days: job_work?.duration_of_process_days || 0,
        destination: job_work?.destination || ''
      },
      challan_meta: challan_meta ? {
        challan_series: challan_meta.challan_series || '',
        reference_no: challan_meta.reference_no || '',
        reference_date: challan_meta.reference_date ? new Date(challan_meta.reference_date) : null,
        buyer_order_no: challan_meta.buyer_order_no || '',
        buyer_order_date: challan_meta.buyer_order_date ? new Date(challan_meta.buyer_order_date) : null,
        dispatch_doc_no: challan_meta.dispatch_doc_no || '',
        other_references: challan_meta.other_references || '',
        payment_terms: challan_meta.payment_terms || '30 Days',
        company_email: challan_meta.company_email || req.user.company_email || 'suyashents@gmail.com',
        company_pan: challan_meta.company_pan || ''
      } : {
        company_email: req.user.company_email || 'suyashents@gmail.com'
      }
    });

    await deliveryChallan.save();

    res.status(201).json({
      success: true,
      data: deliveryChallan,
      message: `Delivery Challan ${dcNumber} created successfully`
    });

  } catch (error) {
    console.error('Create DC error:', error);
    res.status(500).json({ error: error.message });
  }
};
// List Delivery Challans with weight fields
exports.listDeliveryChallans = async (req, res) => {
  try {
    const { 
      customer_id, 
      so_id, 
      status, 
      search,           
      page = 1, 
      limit = 50 
    } = req.query;

    const query = { is_active: true };

    // Existing exact filters
    if (customer_id) query.customer_id = customer_id;
    if (so_id) query.so_id = so_id;
    if (status) query.status = status;

    // Search across dc_number, so_number, customer_name
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      const searchCondition = {
        $or: [
          { dc_number: searchRegex },
          { so_number: searchRegex },
          { customer_name: searchRegex }
        ]
      };
      if (Object.keys(query).length > 1 || (query.is_active !== undefined && Object.keys(query).length > 1)) {
        query.$and = [query, searchCondition];
        delete query.is_active;
        query.$and[0].is_active = true;
      } else {
        Object.assign(query, searchCondition);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [deliveryChallans, total] = await Promise.all([
      DeliveryChallan.find(query)
        .sort({ dc_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DeliveryChallan.countDocuments(query)
    ]);

    // Transform response - add vendor_name, source_type, and total weight
    const transformedData = deliveryChallans.map(dc => {
      const isVendorDC = !dc.so_number || dc.so_number === '';
      
      // Process items to ensure weight fields are included
      const processedItems = (dc.items || []).map(item => ({
        ...item,
        bom_weight_kg: item.bom_weight_kg || 0,
        item_weight_kg: item.item_weight_kg || 0
      }));
      
      // ✅ CALCULATE TOTAL WEIGHT CORRECTLY: weight per unit × quantity
      // If item_weight_kg is per unit, multiply by dispatch_qty
      // If item_weight_kg is already total, just sum it up
      const totalItemWeightKg = processedItems.reduce((sum, item) => {
        // Check if item_weight_kg is per unit or total
        // If item_weight_kg is less than dispatch_qty, it's likely per unit
        const isPerUnit = item.item_weight_kg > 0 && 
                         item.item_weight_kg < item.dispatch_qty;
        
        const weightToAdd = isPerUnit 
          ? (item.item_weight_kg * item.dispatch_qty)  // per unit × quantity
          : item.item_weight_kg;                        // already total
        
        return sum + weightToAdd;
      }, 0);
      
      // Also calculate BOM weight (which is typically per unit × quantity)
      const totalBomWeightKg = processedItems.reduce((sum, item) => {
        // BOM weight is typically total weight, but let's handle both cases
        const isPerUnit = item.bom_weight_kg > 0 && 
                         item.bom_weight_kg < item.dispatch_qty;
        
        const weightToAdd = isPerUnit 
          ? (item.bom_weight_kg * item.dispatch_qty)  // per unit × quantity
          : item.bom_weight_kg;                        // already total
        
        return sum + weightToAdd;
      }, 0);
      
      // ✅ CALCULATE PER ITEM WEIGHT WITH QUANTITY
      const itemsWithCalculatedWeight = processedItems.map(item => {
        const isPerUnit = item.item_weight_kg > 0 && 
                         item.item_weight_kg < item.dispatch_qty;
        
        const totalItemWeight = isPerUnit 
          ? (item.item_weight_kg * item.dispatch_qty)
          : item.item_weight_kg;
        
        return {
          ...item,
          total_item_weight_kg: +totalItemWeight.toFixed(3),
          weight_calculation: isPerUnit 
            ? `${item.item_weight_kg} kg × ${item.dispatch_qty} ${item.unit}`
            : `${item.item_weight_kg} kg (total)`
        };
      });
      
      return {
        ...dc,
        items: itemsWithCalculatedWeight,
        vendor_name: isVendorDC ? dc.customer_name : null,
        source_type: isVendorDC ? 'vendor' : 'sales_order',
        customer_name: dc.customer_name,
        // ✅ ADD CORRECT TOTAL WEIGHT FIELDS AT ROOT LEVEL
        total_weight_kg: {
          item_weight: +totalItemWeightKg.toFixed(3),
          bom_weight: +totalBomWeightKg.toFixed(3),
          display: totalItemWeightKg > 0 
            ? `${totalItemWeightKg.toFixed(3)} kg` 
            : (totalBomWeightKg > 0 ? `${totalBomWeightKg.toFixed(3)} kg (BOM)` : '0 kg'),
          // ✅ ADD DETAILED BREAKDOWN
          breakdown: processedItems.map(item => {
            const isPerUnit = item.item_weight_kg > 0 && 
                             item.item_weight_kg < item.dispatch_qty;
            const total = isPerUnit 
              ? (item.item_weight_kg * item.dispatch_qty)
              : item.item_weight_kg;
            
            return {
              part_no: item.part_no,
              per_unit_weight: item.item_weight_kg,
              quantity: item.dispatch_qty,
              unit: item.unit,
              total_weight: +total.toFixed(3),
              calculation: isPerUnit 
                ? `${item.item_weight_kg} × ${item.dispatch_qty}`
                : `${item.item_weight_kg} (total)`
            };
          })
        }
      };
    });

    res.json({
      success: true,
      data: transformedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List DC error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single Delivery Challan
exports.getDeliveryChallan = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallan.findById(req.params.id);
    
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }

    res.json({
      success: true,
      data: deliveryChallan
    });
  } catch (error) {
    console.error('Get DC error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get pending dispatch list
exports.getPendingDispatch = async (req, res) => {
  try {
    const pendingDCs = await DeliveryChallan.find({
      status: { $in: ['Planned', 'Packed'] },
      is_active: true
    }).sort({ dc_date: 1 });

    res.json({
      success: true,
      data: pendingDCs,
      count: pendingDCs.length
    });
  } catch (error) {
    console.error('Pending dispatch error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate e-Way Bill (AUTO GENERATE WHEN GST NOT ACCESSIBLE)
exports.generateEwayBill = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallan.findById(req.params.id);
   
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }
 
    // --- Validation ---
    const allowedStatuses = ['Planned', 'Packed'];
    if (!allowedStatuses.includes(deliveryChallan.status)) {
      return res.status(400).json({
        error: `Cannot generate e-Way Bill. DC status must be ${allowedStatuses.join(' or ')}. Current: ${deliveryChallan.status}`
      });
    }
 
    if (deliveryChallan.eway_bill?.eway_bill_status === 'Generated') {
      return res.status(400).json({
        error: `e-Way Bill already generated: ${deliveryChallan.eway_bill.eway_bill_number}`
      });
    }
 
    // ✅ E-WAY BILL REQUIREMENT CHECK REMOVED - Always generate EWB
    // No more totalValue, distance, or isEWayBillRequired checks
 
    // ---- Merge transport details from request body ----
    const transportUpdates = {};
    if (req.body.transporter_name) transportUpdates.transporter_name = req.body.transporter_name;
    if (req.body.transporter_id) transportUpdates.transporter_id_ewb = req.body.transporter_id;
    if (req.body.transporter_gstin) transportUpdates.transporter_gstin = req.body.transporter_gstin;
    if (req.body.vehicle_no) transportUpdates.vehicle_no = req.body.vehicle_no;
    if (req.body.dispatch_mode) transportUpdates.dispatch_mode = req.body.dispatch_mode;
    if (req.body.freight_terms) transportUpdates.freight_terms = req.body.freight_terms;
    if (req.body.freight_amount !== undefined) transportUpdates.freight_amount = req.body.freight_amount;
 
    // Merge with existing transport data
    const existingTransport = deliveryChallan.transport || {};
    deliveryChallan.transport = {
      ...(existingTransport.toObject ? existingTransport.toObject() : existingTransport),
      ...transportUpdates
    };
 
    // --- Check if manual EWB number is provided in request ---
    if (req.body.ewb_number && req.body.ewb_number.length >= 12) {
      const validityDate = req.body.validity_date ? new Date(req.body.validity_date) : new Date();
      if (!req.body.validity_date) validityDate.setDate(validityDate.getDate() + 7);
 
      deliveryChallan.eway_bill = {
        eway_bill_required: true,
        eway_bill_number: req.body.ewb_number,
        eway_bill_date: req.body.ewb_date ? new Date(req.body.ewb_date) : new Date(),
        eway_bill_validity_date: validityDate,
        eway_bill_generated_by: req.user._id,
        eway_bill_mode: 'Manual',
        eway_bill_status: 'Generated',
        eway_bill_part_b_updated: false
      };
 
      deliveryChallan.status = 'EWB Generated';
      await deliveryChallan.save();
 
      return res.json({
        success: true,
        message: `e-Way Bill ${req.body.ewb_number} updated successfully`,
        data: {
          ewb_number: req.body.ewb_number,
          validity_date: validityDate,
          dc_status: deliveryChallan.status,
          transport: deliveryChallan.transport,
          manual_entry: true
        }
      });
    }
 
    // --- Try to call real GST API ---
    const useMock = process.env.EWB_MOCK_MODE === 'true';
    let ewbResponse = null;
    let apiSuccess = false;
 
    if (!useMock) {
      const isGstReachable = await checkGstConnectivity();
      if (isGstReachable) {
        try {
          // Calculate total value for API (still needed for GST API call)
          const totalValue = deliveryChallan.items.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
          const distance = await DistanceCalculator.calculateDistance(
            deliveryChallan.company_address.pincode,
            deliveryChallan.ship_to.pincode
          );
         
          const ewayBillData = {
            dc_number: deliveryChallan.dc_number,
            dc_date: deliveryChallan.dc_date,
            company_name: deliveryChallan.company_name,
            company_gstin: deliveryChallan.company_gstin,
            company_address: deliveryChallan.company_address,
            customer_name: deliveryChallan.customer_name,
            customer_gstin: deliveryChallan.customer_gstin,
            ship_to: deliveryChallan.ship_to,
            gst_type: deliveryChallan.gst_type,
            items: deliveryChallan.items,
            total_value: totalValue,
            transport: deliveryChallan.transport,
            distance: distance
          };
 
          ewbResponse = await EwayBillService.generateEwayBill(ewayBillData);
          if (ewbResponse && ewbResponse.success) {
            apiSuccess = true;
          }
        } catch (apiError) {
          console.warn('[EWB] GST API call failed:', apiError.message);
        }
      } else {
        console.log('[EWB] GST not reachable, will auto-generate manual EWB');
      }
    } else {
      console.log('[EWB] Running in MOCK mode');
    }
 
    // If API success - use real EWB
    if (apiSuccess && ewbResponse && ewbResponse.ewbNo) {
      deliveryChallan.eway_bill = {
        eway_bill_required: true,
        eway_bill_number: ewbResponse.ewbNo,
        eway_bill_date: new Date(ewbResponse.ewbDate),
        eway_bill_validity_date: new Date(ewbResponse.validUpto),
        eway_bill_generated_by: req.user._id,
        eway_bill_mode: 'API',
        eway_bill_status: 'Generated',
        eway_bill_part_b_updated: false
      };
 
      deliveryChallan.status = 'EWB Generated';
      await deliveryChallan.save();
 
      return res.json({
        success: true,
        message: `e-Way Bill ${ewbResponse.ewbNo} generated successfully via GST API`,
        data: {
          ewb_number: ewbResponse.ewbNo,
          validity_date: ewbResponse.validUpto,
          qr_code: ewbResponse.qrCode,
          dc_status: deliveryChallan.status,
          transport: deliveryChallan.transport,
          mode: 'API'
        }
      });
    }
 
    // --- AUTO GENERATE MANUAL EWB (when API fails or not reachable) ---
    const autoEwbNumber = generateAutoManualEwbNumber(deliveryChallan);
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 7);
    const ewbDate = new Date();
 
    deliveryChallan.eway_bill = {
      eway_bill_required: true,
      eway_bill_number: autoEwbNumber,
      eway_bill_date: ewbDate,
      eway_bill_validity_date: validityDate,
      eway_bill_generated_by: req.user._id,
      eway_bill_mode: 'Manual',
      eway_bill_status: 'Generated',
      eway_bill_part_b_updated: false,
      auto_generated: true,
      generation_reason: useMock ? 'Mock mode enabled' : 'GST API not accessible'
    };
 
    deliveryChallan.status = 'EWB Generated';
    await deliveryChallan.save();
 
    // Log auto-generated EWB for tracking
    console.log(`[AUTO EWB] Generated: ${autoEwbNumber} for DC: ${deliveryChallan.dc_number} (${deliveryChallan._id})`);
 
    return res.json({
      success: true,
      message: `e-Way Bill ${autoEwbNumber} generated automatically (GST API not accessible)`,
      info: "This is an auto-generated EWB number. GST portal was not reachable.",
      data: {
        ewb_number: autoEwbNumber,
        ewb_date: ewbDate,
        validity_date: validityDate,
        dc_status: deliveryChallan.status,
        transport: deliveryChallan.transport,
        mode: 'Auto-Manual',
        auto_generated: true
      }
    });
 
  } catch (error) {
    console.error('Generate EWB error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Dispatch Challan
exports.dispatchChallan = async (req, res) => {
  try {
    const { vehicle_no, lr_number, transporter_name, gate_pass_no } = req.body;
    const deliveryChallan = await DeliveryChallan.findById(req.params.id);
    
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }
    
    const allowedStatuses = ['Planned', 'Packed', 'EWB Generated'];
    if (!allowedStatuses.includes(deliveryChallan.status)) {
      return res.status(400).json({ 
        error: `Cannot dispatch. Current status: ${deliveryChallan.status}. Allowed: ${allowedStatuses.join(', ')}`
      });
    }
    
   deliveryChallan.transport = {
      dispatch_through: deliveryChallan.transport?.dispatch_through || '',
      dispatch_mode: req.body.dispatch_mode || 'Road',
      transporter_name: transporter_name || 'Self',
      transporter_gstin: req.body.transporter_gstin || '',
      transporter_id_ewb: req.body.transporter_id_ewb || '',
      vehicle_no: vehicle_no || 'NA',
      vehicle_type: req.body.vehicle_type || 'Regular',
      lr_number: lr_number || 'NA',
      lr_date: new Date(),
      freight_terms: req.body.freight_terms || 'Freight Paid',
      freight_amount: req.body.freight_amount || 0,
      insurance_required: req.body.insurance_required || false,
      insurance_amount: req.body.insurance_amount || 0,
      insurance_policy_no: req.body.insurance_policy_no || ''
    };
    
    deliveryChallan.gate_pass = {
      gate_pass_no: gate_pass_no || 'GP' + Date.now(),
      gate_pass_time: new Date(),
      dispatched_at: new Date(),
      security_officer: req.body.security_officer || '',
      dispatch_confirmed_by: req.user._id
    };
    
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);
    deliveryChallan.pod = { expected_delivery_date: expectedDeliveryDate };
    deliveryChallan.status = 'Dispatched';
    
    await deliveryChallan.save();
    
    res.json({
      success: true,
      message: `DC ${deliveryChallan.dc_number} dispatched successfully`,
      data: {
        dc_number: deliveryChallan.dc_number,
        dispatched_at: deliveryChallan.gate_pass.dispatched_at,
        expected_delivery_date: expectedDeliveryDate,
        status: deliveryChallan.status
      }
    });
    
  } catch (error) {
    console.error('Dispatch error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Record POD
exports.recordPOD = async (req, res) => {
  try {
    const { actual_delivery_date, pod_signed_by, delivery_remarks } = req.body;
    const deliveryChallan = await DeliveryChallan.findById(req.params.id);
    
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }
    
    if (deliveryChallan.status !== 'Dispatched') {
      return res.status(400).json({ 
        error: `Cannot record POD. Current status: ${deliveryChallan.status}`
      });
    }
    
    deliveryChallan.pod = {
      actual_delivery_date: actual_delivery_date || new Date(),
      pod_received: true,
      pod_date: new Date(),
      pod_signed_by: pod_signed_by || 'Customer',
      delivery_remarks: delivery_remarks || 'Delivered'
    };
    
    deliveryChallan.status = 'Delivered';
    await deliveryChallan.save();
    
    res.json({
      success: true,
      message: `POD recorded for DC ${deliveryChallan.dc_number}`
    });
    
  } catch (error) {
    console.error('POD error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Customer Rejection
exports.customerRejection = async (req, res) => {
  try {
    const { rejection_reason, rejection_details, items_returned } = req.body;
    const deliveryChallan = await DeliveryChallan.findById(req.params.id);
    
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }
    
    deliveryChallan.status = 'Rejected by Customer';
    deliveryChallan.rejection_reason = rejection_reason || 'Quality Issue';
    await deliveryChallan.save();
    
    // Create Return DC
    const returnDCNumber = await DeliveryChallan.generateDCNumber();
    
  const returnDC = new DeliveryChallan({
      dc_number: returnDCNumber,
      dc_date: new Date(),
      dc_type: 'Sales Return',
      so_id: deliveryChallan.so_id,
      so_number: deliveryChallan.so_number,
      company_id: deliveryChallan.company_id,
      company_name: deliveryChallan.company_name,
      company_gstin: deliveryChallan.company_gstin,
      company_address: deliveryChallan.company_address,
      customer_id: deliveryChallan.customer_id,
      customer_name: deliveryChallan.customer_name,
      customer_gstin: deliveryChallan.customer_gstin,
      ship_from: deliveryChallan.ship_to,
      ship_to: deliveryChallan.ship_from,
      items: deliveryChallan.items.map(item => ({
        ...item.toObject(),
        dispatch_qty: item.dispatch_qty
      })),
      job_work: deliveryChallan.job_work ? deliveryChallan.job_work.toObject() : {},
      challan_meta: deliveryChallan.challan_meta ? deliveryChallan.challan_meta.toObject() : {},
      packing: deliveryChallan.packing,
      status: 'Planned',
      return_dc_id: deliveryChallan._id,
      created_by: deliveryChallan.created_by,
      is_active: true
    });
    await returnDC.save();
    
    res.json({
      success: true,
      message: `Rejection processed. Return DC ${returnDCNumber} created.`,
      data: {
        original_dc: deliveryChallan.dc_number,
        return_dc: returnDCNumber
      }
    });
    
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: error.message });
  }
};

// =====================================================================
// GET CHALLAN PRINT DATA — Returns structured JSON for frontend rendering
// GET /api/delivery-challans/:id/print
// =====================================================================
exports.getChallanPrintData = async (req, res) => {
  try {
    const deliveryChallan = await DeliveryChallan.findById(req.params.id);

    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }

    // ---- Helper: Convert number to words (INR) ----
    const numberToWords = (amount) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
        'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
        'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
        'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const convertHundreds = (n) => {
        let result = '';
        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        }
        if (n > 0) result += ones[n] + ' ';
        return result;
      };

      if (!amount || amount === 0) return 'Zero';

      const rupees = Math.floor(amount);
      const paise = Math.round((amount - rupees) * 100);

      let words = '';
      if (rupees >= 10000000) {
        words += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore ';
      }
      if (rupees % 10000000 >= 100000) {
        words += convertHundreds(Math.floor((rupees % 10000000) / 100000)) + 'Lakh ';
      }
      if (rupees % 100000 >= 1000) {
        words += convertHundreds(Math.floor((rupees % 100000) / 1000)) + 'Thousand ';
      }
      if (rupees % 1000 > 0) {
        words += convertHundreds(rupees % 1000);
      }

      let result = 'INR ' + words.trim();
      if (paise > 0) {
        result += ' and ' + convertHundreds(paise).trim() + ' paise';
      }
      result += ' Only';
      return result;
    };

    // ---- Compute totals ----
    const totalTaxableValue = deliveryChallan.items.reduce(
      (sum, item) => sum + (item.taxable_value || 0), 0
    );
    const totalQty = deliveryChallan.items.reduce(
      (sum, item) => sum + (item.dispatch_qty || 0), 0
    );

    // ✅ CALCULATE TOTAL WEIGHT IN KG
    const totalItemWeightKg = deliveryChallan.items.reduce(
      (sum, item) => sum + (item.item_weight_kg || 0), 0
    );
    const totalBomWeightKg = deliveryChallan.items.reduce(
      (sum, item) => sum + (item.bom_weight_kg || 0), 0
    );

    // ---- HSN-wise summary ----
    const hsnSummary = {};
    deliveryChallan.items.forEach(item => {
      const hsn = item.hsn_code;
      if (!hsnSummary[hsn]) {
        hsnSummary[hsn] = { hsn_code: hsn, taxable_value: 0 };
      }
      hsnSummary[hsn].taxable_value += (item.taxable_value || 0);
    });

    // ---- Determine tax (job work intra-state = NIL tax) ----
    const isJobWork = deliveryChallan.dc_type === 'Job Work Outward';
    const taxLines = [];
    let totalTax = 0;
    if (!isJobWork && totalTaxableValue > 0) {
      if (deliveryChallan.gst_type === 'IGST') {
        taxLines.push({ tax_type: 'IGST @18%', amount: +(totalTaxableValue * 0.18).toFixed(2) });
        totalTax = +(totalTaxableValue * 0.18).toFixed(2);
      } else {
        taxLines.push({ tax_type: 'CGST @9%', amount: +(totalTaxableValue * 0.09).toFixed(2) });
        taxLines.push({ tax_type: 'SGST @9%', amount: +(totalTaxableValue * 0.09).toFixed(2) });
        totalTax = +(totalTaxableValue * 0.18).toFixed(2);
      }
    }

    const grandTotal = +(totalTaxableValue + totalTax).toFixed(2);

    // ---- Build structured print response ----
    const printData = {
      // ---- Document Header ----
      document: {
        title: 'Delivery Challan',
        challan_number: deliveryChallan.dc_number,
        challan_series: deliveryChallan.challan_meta?.challan_series || deliveryChallan.dc_number,
        eway_bill_number: deliveryChallan.eway_bill?.eway_bill_number || '',
        dc_date: deliveryChallan.dc_date,
        dc_date_formatted: new Date(deliveryChallan.dc_date).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: '2-digit'
        }),
        dc_type: deliveryChallan.dc_type,
        payment_terms: deliveryChallan.challan_meta?.payment_terms || '30 Days',
        reference_no: deliveryChallan.challan_meta?.reference_no || '',
        reference_date: deliveryChallan.challan_meta?.reference_date || null,
        buyer_order_no: deliveryChallan.challan_meta?.buyer_order_no || deliveryChallan.customer_po_number || '',
        buyer_order_date: deliveryChallan.challan_meta?.buyer_order_date || null,
        dispatch_doc_no: deliveryChallan.challan_meta?.dispatch_doc_no || '',
        other_references: deliveryChallan.challan_meta?.other_references || '',
        so_number: deliveryChallan.so_number
      },

      // ---- Seller / Consignor ----
      seller: {
        name: deliveryChallan.company_name,
        gstin: deliveryChallan.company_gstin,
        pan: deliveryChallan.challan_meta?.company_pan || '',
        email: deliveryChallan.challan_meta?.company_email || '',
        address: {
          line1: deliveryChallan.company_address?.line1 || '',
          line2: deliveryChallan.company_address?.line2 || '',
          city: deliveryChallan.company_address?.city || '',
          district: deliveryChallan.company_address?.district || '',
          state: deliveryChallan.company_address?.state || '',
          state_code: deliveryChallan.company_address?.state_code || '',
          pincode: deliveryChallan.company_address?.pincode || '',
          country: deliveryChallan.company_address?.country || 'India'
        },
        dispatch_from: {
          line1: deliveryChallan.ship_from?.line1 || '',
          line2: deliveryChallan.ship_from?.line2 || '',
          city: deliveryChallan.ship_from?.city || '',
          state: deliveryChallan.ship_from?.state || '',
          state_code: deliveryChallan.ship_from?.state_code || '',
          pincode: deliveryChallan.ship_from?.pincode || ''
        }
      },

      // ---- Buyer / Consignee ----
      buyer: {
        name: deliveryChallan.customer_name,
        gstin: deliveryChallan.customer_gstin || '',
        address: {
          line1: deliveryChallan.ship_to?.line1 || '',
          line2: deliveryChallan.ship_to?.line2 || '',
          city: deliveryChallan.ship_to?.city || '',
          district: deliveryChallan.ship_to?.district || '',
          state: deliveryChallan.ship_to?.state || '',
          state_code: deliveryChallan.ship_to?.state_code || '',
          pincode: deliveryChallan.ship_to?.pincode || '',
          country: deliveryChallan.ship_to?.country || 'India'
        },
        billing_address: {
          line1: deliveryChallan.billing_address?.line1 || deliveryChallan.ship_to?.line1 || '',
          line2: deliveryChallan.billing_address?.line2 || deliveryChallan.ship_to?.line2 || '',
          city: deliveryChallan.billing_address?.city || deliveryChallan.ship_to?.city || '',
          state: deliveryChallan.billing_address?.state || deliveryChallan.ship_to?.state || '',
          state_code: deliveryChallan.billing_address?.state_code || deliveryChallan.ship_to?.state_code || '',
          pincode: deliveryChallan.billing_address?.pincode || deliveryChallan.ship_to?.pincode || ''
        }
      },

      // ---- Transport ----
      transport: {
        dispatch_mode: deliveryChallan.transport?.dispatch_mode || 'Road',
        dispatched_through: deliveryChallan.transport?.dispatch_through || deliveryChallan.transport?.dispatch_mode || 'By Road',
        transporter_name: deliveryChallan.transport?.transporter_name || '',
        transporter_gstin: deliveryChallan.transport?.transporter_gstin || '',
        vehicle_no: deliveryChallan.transport?.vehicle_no || '',
        lr_number: deliveryChallan.transport?.lr_number || '',
        lr_date: deliveryChallan.transport?.lr_date || null,
        destination: deliveryChallan.job_work?.destination || deliveryChallan.ship_to?.city || '',
        date_time_of_issue: deliveryChallan.gate_pass?.gate_pass_time || deliveryChallan.dc_date,
        date_time_of_issue_formatted: new Date(
          deliveryChallan.gate_pass?.gate_pass_time || deliveryChallan.dc_date
        ).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: false
        })
      },

      // ---- Job Work Details (shown only for Job Work Outward) ----
      job_work: isJobWork ? {
        nature_of_processing: deliveryChallan.job_work?.nature_of_processing || '',
        duration_of_process_days: deliveryChallan.job_work?.duration_of_process_days || 0,
        duration_label: deliveryChallan.job_work?.duration_of_process_days
          ? `${deliveryChallan.job_work.duration_of_process_days} Days`
          : ''
      } : null,

      // ---- Items with weight fields ----
      items: deliveryChallan.items.map((item, index) => ({
        sl_no: index + 1,
        part_no: item.part_no,
        part_name: item.part_name,
        item_process_remark: item.item_process_remark || '',
        hsn_sac: item.hsn_code,
        dispatch_qty: item.dispatch_qty,
        unit: item.unit,
        secondary_qty: item.secondary_qty || 0,
        secondary_unit: item.secondary_unit || '',
        quantity_display: item.secondary_qty
          ? `${item.dispatch_qty} ${item.unit}\n${item.secondary_qty} ${item.secondary_unit}`
          : `${item.dispatch_qty} ${item.unit}`,
        unit_price: item.unit_price || 0,
        per: item.unit,
        taxable_value: item.taxable_value || 0,
        amount: item.taxable_value || 0,
        batch_no: item.batch_no || '',
        remarks: item.remarks || '',
        bom_weight_kg: item.bom_weight_kg || 0,
        item_weight_kg: item.item_weight_kg || 0,
        weight_display: item.bom_weight_kg 
          ? `${item.bom_weight_kg.toFixed(3)} kg` 
          : (item.item_weight_kg ? `${item.item_weight_kg.toFixed(3)} kg` : '-')
      })),

      // ---- Totals with weight totals ----
      totals: {
        total_qty: +totalQty.toFixed(3),
        total_qty_unit: deliveryChallan.items[0]?.unit || '',
        total_taxable_value: +totalTaxableValue.toFixed(2),
        tax_lines: taxLines,
        total_tax: totalTax,
        grand_total: grandTotal,
        grand_total_rounded: Math.round(grandTotal),
        amount_in_words: numberToWords(grandTotal),
        tax_amount_in_words: totalTax === 0 ? 'NIL' : numberToWords(totalTax),
        is_tax_nil: totalTax === 0,
        // ✅ WEIGHT TOTALS - CALCULATED FROM ITEMS
        total_bom_weight: +totalBomWeightKg.toFixed(3),
        total_item_weight: +totalItemWeightKg.toFixed(3),
        // ✅ ADD TOTAL WEIGHT DISPLAY
        total_weight_display: totalItemWeightKg > 0 
          ? `${totalItemWeightKg.toFixed(3)} kg` 
          : (totalBomWeightKg > 0 ? `${totalBomWeightKg.toFixed(3)} kg (BOM)` : '0 kg')
      },

      // ---- HSN Summary ----
      hsn_summary: Object.values(hsnSummary).map(h => ({
        hsn_sac: h.hsn_code,
        taxable_value: +h.taxable_value.toFixed(2)
      })),

      // ---- Packing ----
      packing: (deliveryChallan.packing || []).map(p => ({
        no_of_packages: p.no_of_packages,
        packing_type: p.packing_type,
        gross_weight_kg: p.gross_weight_kg,
        net_weight_kg: p.net_weight_kg,
        dimensions: p.dimension_l_mm
          ? `${p.dimension_l_mm} x ${p.dimension_w_mm} x ${p.dimension_h_mm} mm`
          : ''
      })),

      // ---- e-Way Bill ----
      eway_bill: {
        required: deliveryChallan.eway_bill?.eway_bill_required || false,
        number: deliveryChallan.eway_bill?.eway_bill_number || '',
        status: deliveryChallan.eway_bill?.eway_bill_status || 'Not Required',
        validity_date: deliveryChallan.eway_bill?.eway_bill_validity_date || null,
        mode: deliveryChallan.eway_bill?.eway_bill_mode || ''
      },

      // ---- GST Info ----
      gst: {
        gst_type: deliveryChallan.gst_type,
        is_inter_state: deliveryChallan.gst_type === 'IGST',
        is_job_work: isJobWork,
        tax_note: isJobWork
          ? 'Job Work — Tax Not Applicable under Schedule II of CGST Act'
          : ''
      },

      // ---- Status ----
      status: deliveryChallan.status,

      // ---- Footer / Legal ----
      footer: {
        jurisdiction: 'SUBJECT TO NASHIK JURISDICTION',
        declaration: 'This is a Computer Generated Document',
        authorised_signatory_label: `for ${deliveryChallan.company_name}`
      }
    };

    return res.json({
      success: true,
      data: printData
    });

  } catch (error) {
    console.error('getChallanPrintData error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update pre-print fields
exports.updatePrePrintFields = async (req, res) => {
  try {
    const { 
      dispatch_through,
      duration_of_process_days,
      duration_of_process
    } = req.body;

    const deliveryChallan = await DeliveryChallan.findById(req.params.id);
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }

    // 1. Update dispatch_through – free text
    if (dispatch_through !== undefined) {
      deliveryChallan.set('transport.dispatch_through', dispatch_through);
    }

    // 2. Update duration – supports both field names
    let durationValue = duration_of_process_days;
    if (duration_of_process !== undefined) {
      durationValue = Number(duration_of_process);
    }
    if (durationValue !== undefined && !isNaN(durationValue)) {
      deliveryChallan.set('job_work.duration_of_process_days', durationValue);
    }

    await deliveryChallan.save();
    const updated = await DeliveryChallan.findById(req.params.id);

    res.json({
      success: true,
      message: 'Pre-print fields updated successfully',
      data: {
        dispatch_through: updated.transport?.dispatch_through || '',
        duration_of_process_days: updated.job_work?.duration_of_process_days || 0
      }
    });

  } catch (error) {
    console.error('updatePrePrintFields error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check receipt status of a Delivery Challan
 * Returns whether fully received, partially received, or pending
 */
exports.getReceiptStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryChallan = await DeliveryChallan.findById(id);
    if (!deliveryChallan) {
      return res.status(404).json({ error: 'Delivery Challan not found' });
    }

    // Get all receipts for this DC
    const InwardReceipt = require('../../models/Dispatch/InwardReceipt');
    const receipts = await InwardReceipt.find({ 
      dc_id: id,
      status: { $in: ['Received', 'Partially Received', 'Completed'] }
    });

    // Calculate received quantities per item
    const receivedMap = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const key = item.dc_item_id.toString();
        if (!receivedMap[key]) {
          receivedMap[key] = 0;
        }
        receivedMap[key] += item.receiving_qty;
      });
    });

    // Check each item's receipt status
    const itemStatus = deliveryChallan.items.map(item => {
      const received = receivedMap[item._id.toString()] || 0;
      const pending = item.dispatch_qty - received;
      return {
        part_no: item.part_no,
        part_name: item.part_name,
        dispatch_qty: item.dispatch_qty,
        received_qty: received,
        pending_qty: Math.max(0, pending),
        is_fully_received: pending <= 0,
        status: pending <= 0 ? 'Fully Received' : pending === item.dispatch_qty ? 'Not Received' : 'Partially Received'
      };
    });

    const totalPending = itemStatus.reduce((sum, i) => sum + i.pending_qty, 0);
    const totalReceived = itemStatus.reduce((sum, i) => sum + i.received_qty, 0);
    const isFullyReceived = totalPending === 0;

    // Determine overall status
    let overallStatus = 'Pending';
    if (isFullyReceived) {
      overallStatus = 'Fully Received';
    } else if (totalReceived > 0) {
      overallStatus = 'Partially Received';
    }

    res.json({
      success: true,
      data: {
        dc_number: deliveryChallan.dc_number,
        dc_status: deliveryChallan.status,
        receipt_status: overallStatus,
        is_fully_received: isFullyReceived,
        total_dispatch_qty: deliveryChallan.items.reduce((sum, i) => sum + i.dispatch_qty, 0),
        total_received_qty: totalReceived,
        total_pending_qty: totalPending,
        receipt_count: receipts.length,
        receipts: receipts.map(r => ({
          receipt_id: r.receipt_id,
          receipt_date: r.receipt_date,
          receipt_type: r.receipt_type,
          status: r.status,
          documents_count: r.documents.length
        })),
        items: itemStatus
      }
    });

  } catch (error) {
    console.error('getReceiptStatus error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add this function at the end of deliveryChallanController.js

/**
 * Get items for DC dropdown (lightweight - only needed fields)
 * GET /api/delivery-challans/items-dropdown
 */
exports.getItemsForDCDropdown = async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = { is_active: true };
    
    if (search && search.trim() !== '') {
      query.$or = [
        { part_no: { $regex: search.trim(), $options: 'i' } },
        { part_name: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // ✅ ADD weight_per_unit_kg to selection
    const items = await Item.find(query)
      .select('part_no part_name unit weight_per_unit_kg')  // <-- ADDED
      .sort({ part_no: 1 })
      .limit(50)
      .lean();
    
    const formattedItems = items.map(item => ({
      part_no: item.part_no,
      part_name: item.part_name,
      unit: item.unit,
      weight_per_unit_kg: item.weight_per_unit_kg || 0,
      display_text: `${item.part_no} - ${item.part_name} (${item.unit})`,
      // Add flag to show if weight input is supported
      supports_weight_input: item.unit !== 'Kg' && (item.weight_per_unit_kg || 0) > 0
    }));
    
    res.json({
      success: true,
      data: formattedItems,
      count: formattedItems.length
    });
    
  } catch (error) {
    console.error('getItemsForDCDropdown error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.calculateQtyFromWeight = async (req, res) => {
  try {
    const { part_no, weight_kg, unit } = req.body;

    // Validation
    if (!part_no) {
      return res.status(400).json({ 
        success: false, 
        error: 'part_no is required' 
      });
    }

    if (!weight_kg || weight_kg <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'weight_kg must be a positive number' 
      });
    }

    // Fetch item from master
    const item = await Item.findOne({ 
      part_no: part_no.toUpperCase().trim(), 
      is_active: true 
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: `Item ${part_no} not found` 
      });
    }

    // Check if item has weight_per_unit_kg defined
    if (!item.weight_per_unit_kg || item.weight_per_unit_kg <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item ${part_no} does not have weight_per_unit_kg defined. Please define it in Item Master first.`
      });
    }

    // If unit is provided in request, verify it matches item's unit
    if (unit && unit !== item.unit) {
      return res.status(400).json({
        success: false,
        error: `Unit mismatch. Item unit is '${item.unit}', but you provided '${unit}'`
      });
    }

    // If unit is "Kg", no calculation needed
    if (item.unit === 'Kg') {
      return res.json({
        success: true,
        data: {
          part_no: item.part_no,
          part_name: item.part_name,
          unit: item.unit,
          weight_per_unit_kg: 1,
          weight_kg: weight_kg,
          calculated_qty: weight_kg,
          display_text: `${weight_kg} Kg`,
          note: 'Unit is Kg - weight and quantity are equal'
        }
      });
    }

    // Calculate quantity: qty = total_weight / weight_per_unit
    const calculatedQty = weight_kg / item.weight_per_unit_kg;
    
    // Round to nearest whole number (since Nos, Piece, etc. should be whole)
    // But preserve precision if user wants exact
    const roundedQty = Math.round(calculatedQty * 1000) / 1000;

    // If unit is Nos, Piece, Set - we should round to integer
    let finalQty = roundedQty;
    if (['Nos', 'Piece', 'Set'].includes(item.unit)) {
      finalQty = Math.round(calculatedQty);
      // If rounding loses too much weight, warn user
      const weightFromRounded = finalQty * item.weight_per_unit_kg;
      const weightDifference = Math.abs(weight_kg - weightFromRounded);
      if (weightDifference > 0.001) {
        return res.json({
          success: true,
          data: {
            part_no: item.part_no,
            part_name: item.part_name,
            unit: item.unit,
            weight_per_unit_kg: item.weight_per_unit_kg,
            weight_kg: weight_kg,
            calculated_qty: finalQty,
            display_text: `${finalQty} ${item.unit} (${weight_kg} kg)`,
            actual_qty_from_weight: calculatedQty,
            warning: `Rounding to ${finalQty} ${item.unit} gives ${weightFromRounded.toFixed(3)} kg instead of ${weight_kg} kg`,
            weight_from_calculated_qty: weightFromRounded
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        part_no: item.part_no,
        part_name: item.part_name,
        unit: item.unit,
        weight_per_unit_kg: item.weight_per_unit_kg,
        weight_kg: weight_kg,
        calculated_qty: finalQty,
        display_text: `${finalQty} ${item.unit} (${weight_kg} kg)`,
        weight_from_calculated_qty: +(finalQty * item.weight_per_unit_kg).toFixed(3),
        is_rounded: finalQty !== calculatedQty
      }
    });

  } catch (error) {
    console.error('calculateQtyFromWeight error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
// Bulk delete Delivery Challans
// Soft-deletes multiple Delivery Challans by setting is_active = false
exports.bulkDeleteDeliveryChallans = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Delivery Challan IDs'
      });
    }

    const results = [];
    let deletedCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          results.push({
            id,
            success: false,
            message: 'Invalid Delivery Challan ID format'
          });
          failedCount++;
          continue;
        }

        const deliveryChallan = await DeliveryChallan.findOneAndUpdate(
          {
            _id: id,
            is_active: true
          },
          {
            is_active: false,
            updated_by: req.user?._id
          },
          {
            new: true
          }
        );

        if (!deliveryChallan) {
          results.push({
            id,
            success: false,
            message: 'Delivery Challan not found or already inactive'
          });
          failedCount++;
          continue;
        }

        results.push({
          id,
          success: true,
          message: `Delivery Challan "${deliveryChallan.dc_number}" deactivated`
        });

        deletedCount++;
      } catch (error) {
        console.error(
          `[bulkDeleteDeliveryChallans] Error deleting Delivery Challan ${id}:`,
          error
        );

        results.push({
          id,
          success: false,
          message: error.message || 'Failed to delete Delivery Challan'
        });

        failedCount++;
      }
    }

    return res.status(200).json({
      success: deletedCount > 0,
      message: `${deletedCount} Delivery Challan(s) processed successfully, ${failedCount} failed`,
      deletedCount,
      failedCount,
      results
    });
  } catch (error) {
    console.error('[bulkDeleteDeliveryChallans] Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to bulk delete Delivery Challans'
    });
  }
};



