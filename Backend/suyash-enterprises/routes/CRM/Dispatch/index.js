// routes/Dispatch/index.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/pod/' });
const mongoose = require('mongoose');

const deliveryChallanController = require('../../controllers/Dispatch/deliveryChallanController');
const deliveryScheduleController = require('../../controllers/Dispatch/deliveryScheduleController');
const packingListController = require('../../controllers/Dispatch/packingListController');
const customerReturnController = require('../../controllers/Dispatch/customerReturnController');

// ======================================================
// AUTHENTICATION MIDDLEWARE - FIXED with valid ObjectId
// ======================================================
const authenticate = (req, res, next) => {
  // Create a valid MongoDB ObjectId
  const validObjectId = new mongoose.Types.ObjectId();
  
req.user = {
    _id: validObjectId,
    company_name: 'Suyash Enterprises',
    company_gstin: '27AAJFS0232P1ZW',  
    company_address: {
      line1: 'Plant 1-W-222, Plant II - E-112',
      line2: 'MIDC, Ambad',
      city: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      state_code: 27,
      pincode: '422010',
      country: 'India'
    },
    dispatch_address: {
      line1: 'Factory Gate',
      line2: 'Plot No. 123',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      state_code: 27,
      pincode: '400001',
      country: 'India'
    },
    company_email: 'suyashents@gmail.com'
  };
  next();
};

// ======================================================
// VALIDATION MIDDLEWARE
// ======================================================
const validateDC = (req, res, next) => {
  const { so_id, dc_type, ship_to, items } = req.body;
  
  if (!so_id) {
    return res.status(400).json({ error: 'so_id is required' });
  }
  if (!dc_type) {
    return res.status(400).json({ error: 'dc_type is required' });
  }
  if (!ship_to || !ship_to.pincode) {
    return res.status(400).json({ error: 'ship_to address with pincode is required' });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' });
  }
  
  for (const item of items) {
    if (!item.so_item_id) {
      return res.status(400).json({ error: 'so_item_id is required for each item' });
    }
    
    if (!item.dispatch_qty || item.dispatch_qty <= 0) {
      return res.status(400).json({ error: `Valid dispatch_qty required for item ${item.part_no}` });
    }
  }
  
  next();
};

const ppapGate = (req, res, next) => {
  // Skip PPAP check for now
  next();
};

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dispatch - Delivery Schedule
 *   description: Delivery schedule planning and management
 */

/**
 * @swagger
 * /api/delivery-schedules:
 *   post:
 *     summary: Create delivery schedule for SO line items
 *     tags: [Dispatch - Delivery Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dispatch_date
 *               - so_id
 *               - customer_id
 *               - items
 *             properties:
 *               dispatch_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-25"
 *               so_id:
 *                 type: string
 *                 example: "65f123456789abcdef123456"
 *               so_number:
 *                 type: string
 *                 example: "SO-202503-0310"
 *               customer_id:
 *                 type: string
 *                 example: "65f123456789abcdef123001"
 *               shipping_address_id:
 *                 type: string
 *                 example: "addr_pune_plant"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     so_item_id:
 *                       type: string
 *                     part_no:
 *                       type: string
 *                     part_name:
 *                       type: string
 *                     scheduled_qty:
 *                       type: number
 *                     available_fg_qty:
 *                       type: number
 *                     remarks:
 *                       type: string
 *               transporter_preference:
 *                 type: string
 *                 example: "VRL Logistics"
 *               vehicle_type:
 *                 type: string
 *                 enum: ["Mini Truck", "Tempo", "Truck", "Container", "Courier", "Hand Delivery"]
 *               special_instructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery schedule created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/delivery-schedules', deliveryScheduleController.createDeliverySchedule);

/**
 * @swagger
 * /api/delivery-schedules:
 *   get:
 *     summary: List delivery schedules with filters
 *     tags: [Dispatch - Delivery Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Confirmed, Packing In Progress, Ready for Dispatch, Dispatched, Cancelled]
 *       - in: query
 *         name: so_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: dispatch_date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dispatch_date_to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of delivery schedules
 *       401:
 *         description: Unauthorized
 */
router.get('/delivery-schedules', deliveryScheduleController.listDeliverySchedules);

/**
 * @swagger
 * /api/delivery-schedules/{id}/confirm:
 *   put:
 *     summary: Confirm delivery schedule
 *     tags: [Dispatch - Delivery Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule confirmed successfully
 *       404:
 *         description: Schedule not found
 *       401:
 *         description: Unauthorized
 */
router.put('/delivery-schedules/:id/confirm', deliveryScheduleController.confirmDeliverySchedule);

/**
 * @swagger
 * tags:
 *   name: Dispatch - Delivery Challan
 *   description: Delivery Challan (DC) lifecycle management
 */

/**
 * @swagger
 * /api/delivery-challans:
 *   post:
 *     summary: Create Delivery Challan from Sales Order
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - so_id
 *               - dc_type
 *               - ship_to
 *               - items
 *             properties:
 *               so_id:
 *                 type: string
 *                 example: "65f123456789abcdef123456"
 *               dc_type:
 *                 type: string
 *                 enum: ["Supply of Goods", "Delivery for Approval", "Job Work Outward", "Sales Return", "Exhibition", "Export"]
 *                 example: "Supply of Goods"
 *               ship_to:
 *                 type: object
 *                 properties:
 *                   line1:
 *                     type: string
 *                     example: "Plot No. A-123, MIDC Area"
 *                   line2:
 *                     type: string
 *                     example: "Chakan Industrial Park"
 *                   city:
 *                     type: string
 *                     example: "Pune"
 *                   district:
 *                     type: string
 *                     example: "Pune"
 *                   state:
 *                     type: string
 *                     example: "Maharashtra"
 *                   state_code:
 *                     type: number
 *                     example: 27
 *                   pincode:
 *                     type: string
 *                     example: "411001"
 *                   country:
 *                     type: string
 *                     example: "India"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - so_item_id
 *                     - part_no
 *                     - part_name
 *                     - hsn_code
 *                     - dispatch_qty
 *                     - unit
 *                     - quality_cert_id
 *                   properties:
 *                     so_item_id:
 *                       type: string
 *                       example: "65f123456789abcdef123457"
 *                     part_no:
 *                       type: string
 *                       example: "CB-100X10-C11000"
 *                     part_name:
 *                       type: string
 *                       example: "Copper Busbar 100x10mm Flat"
 *                     hsn_code:
 *                       type: string
 *                       example: "7407"
 *                     dispatch_qty:
 *                       type: number
 *                       example: 100
 *                     unit:
 *                       type: string
 *                       enum: ["Nos", "Kg", "Meter", "Set", "Piece"]
 *                       example: "Nos"
 *                     unit_price:
 *                       type: number
 *                       example: 2500
 *                     batch_no:
 *                       type: string
 *                       example: "BATCH-2403-001"
 *                     quality_cert_id:
 *                       type: string
 *                       example: "QCR-202503-0019"
 *               packing:
 *                 type: object
 *                 properties:
 *                   no_of_packages:
 *                     type: number
 *                     example: 2
 *                   gross_weight_kg:
 *                     type: number
 *                     example: 350
 *                   net_weight_kg:
 *                     type: number
 *                     example: 320
 *                   packing_type:
 *                     type: string
 *                     example: "Cardboard Box"
 *     responses:
 *       201:
 *         description: Delivery Challan created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sales Order not found
 */
router.post('/delivery-challans', validateDC, ppapGate, deliveryChallanController.createDeliveryChallan);

/**
 * @swagger
 * /api/delivery-challans:
 *   get:
 *     summary: List Delivery Challans with filters
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planned, Packing In Progress, Packed, Dispatched, In Transit, Delivered, Partially Delivered, Rejected by Customer, Returned, Cancelled]
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: so_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of Delivery Challans
 *       401:
 *         description: Unauthorized
 */
router.get('/delivery-challans', deliveryChallanController.listDeliveryChallans);

/**
 * @swagger
 * /api/delivery-challans/pending-dispatch:
 *   get:
 *     summary: Get DCs pending dispatch (Planned or Packed status)
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending DCs
 *       401:
 *         description: Unauthorized
 */
router.get('/delivery-challans/pending-dispatch', deliveryChallanController.getPendingDispatch);

/**
 * @swagger
 * /api/delivery-challans/{id}/print:
 *   get:
 *     summary: Get structured JSON data for frontend Delivery Challan rendering/print
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan MongoDB _id
 *     responses:
 *       200:
 *         description: Structured challan print data
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.get('/delivery-challans/:id/print', deliveryChallanController.getChallanPrintData);


/**
 * @swagger
 * /api/delivery-challans/{id}:
 *   get:
 *     summary: Get single Delivery Challan with full details
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan ID
 *     responses:
 *       200:
 *         description: Delivery Challan details
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.get('/delivery-challans/:id', deliveryChallanController.getDeliveryChallan);

/**
 * @swagger
 * /api/delivery-challans/{id}/generate-ewb:
 *   post:
 *     summary: Generate e-Way Bill for Delivery Challan
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transporter_id:
 *                 type: string
 *                 example: "27AAACT1234A1Z"
 *               transporter_name:
 *                 type: string
 *                 example: "VRL Logistics"
 *               vehicle_no:
 *                 type: string
 *                 example: "MH 12 AB 1234"
 *     responses:
 *       200:
 *         description: e-Way Bill generated successfully
 *       400:
 *         description: e-Way Bill not required or already generated
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.post('/delivery-challans/:id/generate-ewb', deliveryChallanController.generateEwayBill);

/**
 * @swagger
 * /api/delivery-challans/{id}/dispatch:
 *   put:
 *     summary: Confirm physical dispatch with gate pass
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_no
 *               - lr_number
 *               - transporter_name
 *               - gate_pass_no
 *             properties:
 *               dispatch_mode:
 *                 type: string
 *                 enum: ["Road", "Rail", "Air", "Sea", "Hand Delivery", "Courier"]
 *                 default: "Road"
 *               transporter_name:
 *                 type: string
 *                 example: "VRL Logistics"
 *               transporter_gstin:
 *                 type: string
 *                 example: "29AAACV1234A1Z"
 *               transporter_id_ewb:
 *                 type: string
 *                 example: "29AAACV1234A1Z"
 *               vehicle_no:
 *                 type: string
 *                 example: "MH 12 AB 1234"
 *               vehicle_type:
 *                 type: string
 *                 enum: ["Regular", "Over Dimensional Cargo (ODC)", "Water Vessel", "Air Cargo"]
 *               lr_number:
 *                 type: string
 *                 example: "VRL-2025-0033"
 *               freight_terms:
 *                 type: string
 *                 enum: ["Freight Paid", "Freight To Pay", "Freight Prepaid & Charged", "Ex-Works"]
 *               freight_amount:
 *                 type: number
 *                 example: 5000
 *               insurance_required:
 *                 type: boolean
 *                 example: true
 *               insurance_amount:
 *                 type: number
 *                 example: 250000
 *               gate_pass_no:
 *                 type: string
 *                 example: "GP-2025-0088"
 *               security_officer:
 *                 type: string
 *                 example: "Ramesh S."
 *     responses:
 *       200:
 *         description: Dispatch confirmed successfully
 *       400:
 *         description: Cannot dispatch (wrong status)
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.put('/delivery-challans/:id/dispatch', deliveryChallanController.dispatchChallan);

/**
 * @swagger
 * /api/delivery-challans/{id}/pod:
 *   put:
 *     summary: Record Proof of Delivery (POD)
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               actual_delivery_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-22"
 *               pod_signed_by:
 *                 type: string
 *                 example: "Mr. Suresh Kumar - Stores Incharge"
 *               delivery_remarks:
 *                 type: string
 *                 example: "All 4 boxes received in good condition"
 *               pod_document:
 *                 type: string
 *                 format: binary
 *                 description: Upload POD scan (PDF/Image)
 *     responses:
 *       200:
 *         description: POD recorded successfully, invoice triggered
 *       400:
 *         description: Cannot record POD (wrong status)
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.put('/delivery-challans/:id/pod', upload.single('pod_document'), deliveryChallanController.recordPOD);

/**
 * @swagger
 * /api/delivery-challans/{id}/customer-rejection:
 *   put:
 *     summary: Handle customer rejection at delivery
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *               - rejection_details
 *               - items_returned
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 enum: ["Quality Rejection", "Wrong Part", "Short Quantity", "Damage in Transit", "Over Delivery", "Customer Order Change", "Other"]
 *                 example: "Quality Rejection"
 *               rejection_details:
 *                 type: string
 *                 example: "Surface scratches on 15 pieces exceeding acceptable limit"
 *               items_returned:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     so_item_id:
 *                       type: string
 *                     part_no:
 *                       type: string
 *                     return_qty:
 *                       type: number
 *                     unit_price:
 *                       type: number
 *                     condition:
 *                       type: string
 *                       enum: ["Good", "Damaged", "Defective"]
 *     responses:
 *       200:
 *         description: Customer rejection processed, Return DC created, NCR raised
 *       400:
 *         description: Cannot process rejection
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.put('/delivery-challans/:id/customer-rejection', deliveryChallanController.customerRejection);

/**
 * @swagger
 * tags:
 *   name: Dispatch - Packing List
 *   description: Packing list management for Delivery Challans
 */

// Inside routes/Dispatch/index.js, after other packing list routes
router.get('/packing-lists', packingListController.listPackingLists);

/**
 * @swagger
 * /api/packing-lists:
 *   post:
 *     summary: Create packing list for Delivery Challan
 *     tags: [Dispatch - Packing List]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dc_id
 *               - packages
 *               - total_packages
 *             properties:
 *               dc_id:
 *                 type: string
 *                 example: "65f123456789abcdef123789"
 *               packages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     package_no:
 *                       type: number
 *                       example: 1
 *                     package_type:
 *                       type: string
 *                       enum: ["Box", "Crate", "Pallet", "Bag", "Drum"]
 *                       example: "Box"
 *                     dimensions_l_mm:
 *                       type: number
 *                       example: 600
 *                     dimensions_w_mm:
 *                       type: number
 *                       example: 400
 *                     dimensions_h_mm:
 *                       type: number
 *                       example: 200
 *                     gross_weight_kg:
 *                       type: number
 *                       example: 35.5
 *                     net_weight_kg:
 *                       type: number
 *                       example: 32.0
 *                     contents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           part_no:
 *                             type: string
 *                             example: "CB-100X10-C11000"
 *                           description:
 *                             type: string
 *                             example: "Copper Busbar 100x10mm"
 *                           qty:
 *                             type: number
 *                             example: 25
 *                           batch_no:
 *                             type: string
 *                             example: "BATCH-2403-001"
 *                           serial_numbers:
 *                             type: array
 *                             items:
 *                               type: string
 *               total_packages:
 *                 type: number
 *                 example: 2
 *               total_gross_weight_kg:
 *                 type: number
 *                 example: 71.0
 *               total_net_weight_kg:
 *                 type: number
 *                 example: 64.0
 *               packed_by:
 *                 type: string
 *                 example: "EMP-001"
 *     responses:
 *       201:
 *         description: Packing list created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/packing-lists', packingListController.createPackingList);

/**
 * @swagger
 * /api/packing-lists/{id}:
 *   put:
 *     summary: Update packing list
 *     tags: [Dispatch - Packing List]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Packing list updated successfully
 *       404:
 *         description: Packing list not found
 *       401:
 *         description: Unauthorized
 */
router.put('/packing-lists/:id', packingListController.updatePackingList);

/**
 * @swagger
 * /api/packing-lists/dc/{dcId}:
 *   get:
 *     summary: Get packing list by Delivery Challan ID
 *     tags: [Dispatch - Packing List]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dcId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Packing list details
 *       404:
 *         description: Packing list not found
 *       401:
 *         description: Unauthorized
 */
router.get('/packing-lists/dc/:dcId', packingListController.getPackingListByDC);

/**
 * @swagger
 * tags:
 *   name: Dispatch - Customer Returns
 *   description: Customer return and rejection management
 */

/**
 * @swagger
 * /api/customer-returns:
 *   post:
 *     summary: Initiate customer return (after delivery)
 *     tags: [Dispatch - Customer Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - return_type
 *               - original_dc_id
 *               - return_reason
 *               - rejection_details
 *               - items
 *             properties:
 *               return_type:
 *                 type: string
 *                 enum: ["Rejected at Delivery", "Return After Delivery", "Partial Return"]
 *                 example: "Return After Delivery"
 *               original_dc_id:
 *                 type: string
 *                 example: "65f123456789abcdef123789"
 *               return_reason:
 *                 type: string
 *                 enum: ["Quality Rejection", "Wrong Part", "Short Quantity", "Damage in Transit", "Over Delivery", "Customer Order Change", "Other"]
 *                 example: "Wrong Part"
 *               rejection_details:
 *                 type: string
 *                 example: "Customer received wrong part number. Should be CB-100X10 but received CB-80X8."
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     so_item_id:
 *                       type: string
 *                     part_no:
 *                       type: string
 *                     return_qty:
 *                       type: number
 *                     unit_price:
 *                       type: number
 *                     condition:
 *                       type: string
 *                       enum: ["Good", "Damaged", "Defective"]
 *     responses:
 *       201:
 *         description: Return initiated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/customer-returns', customerReturnController.initiateReturn);

/**
 * @swagger
 * /api/customer-returns:
 *   get:
 *     summary: List customer returns with filters
 *     tags: [Dispatch - Customer Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Initiated, Return in Transit, Received, Inspected, Credit Note Raised, Closed]
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: original_dc_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of customer returns
 *       401:
 *         description: Unauthorized
 */
router.get('/customer-returns', customerReturnController.listReturns);

/**
 * @swagger
 * /api/customer-returns/{id}/receive:
 *   put:
 *     summary: Record receipt of returned goods
 *     tags: [Dispatch - Customer Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               return_eway_bill_no:
 *                 type: string
 *                 example: "321045678913"
 *               received_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-25"
 *     responses:
 *       200:
 *         description: Return receipt recorded
 *       404:
 *         description: Return not found
 *       401:
 *         description: Unauthorized
 */
router.put('/customer-returns/:id/receive', customerReturnController.receiveReturn);

/**
 * @swagger
 * /api/customer-returns/{id}/inspect:
 *   put:
 *     summary: Record inward inspection of returned goods
 *     tags: [Dispatch - Customer Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspection_result
 *               - stock_disposition
 *             properties:
 *               inspection_result:
 *                 type: string
 *                 enum: ["Pass", "Fail", "Partial"]
 *                 example: "Pass"
 *               stock_disposition:
 *                 type: string
 *                 enum: ["Return to FG Store", "Rework Required", "Scrap"]
 *                 example: "Return to FG Store"
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inspection recorded
 *       404:
 *         description: Return not found
 *       401:
 *         description: Unauthorized
 */
router.put('/customer-returns/:id/inspect', customerReturnController.inspectReturn);

// ADD before module.exports = router; at the bottom:

/**
 * @swagger
 * /api/delivery-challans/{id}/pre-print:
 *   patch:
 *     summary: Update pre-print required fields (dispatch_through, buyer_order_no, nature_of_processing)
 *     tags: [Dispatch - Delivery Challan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Challan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dispatch_through:
 *                 type: string
 *                 example: "VRL Logistics"
 *               buyer_order_no:
 *                 type: string
 *                 example: "PO-2025-0123"
 *               nature_of_processing:
 *                 type: string
 *                 example: "Tin Plating"
 *     responses:
 *       200:
 *         description: Fields updated successfully
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/delivery-challans/:id/pre-print', deliveryChallanController.updatePrePrintFields);


module.exports = router;