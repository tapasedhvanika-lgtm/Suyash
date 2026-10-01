// routes/Dispatch/deliveryChallanRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/pod/' });
const deliveryChallanController = require('../../controllers/Dispatch/deliveryChallanController');

// Dummy authentication for testing
const authenticate = (req, res, next) => {
  req.user = {
    _id: 'test_user_id',
    company: {
      _id: 'comp_001',
      name: 'Test Company',
      gstin: '27AAACA1234A1Z',
      address: {
        line1: 'Test Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        state_code: 27,
        pincode: '400001'
      },
      dispatch_address: {
        line1: 'Factory Gate',
        city: 'Mumbai',
        state: 'Maharashtra',
        state_code: 27,
        pincode: '400001'
      }
    }
  };
  next();
};

const { validateDC } = require('../../middleware/dispatch/validateDC');
const { ppapGate } = require('../../middleware/dispatch/ppapGate');

router.use(authenticate);

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
 *     responses:
 *       201:
 *         description: Delivery Challan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error (missing QC cert, insufficient stock, PPAP required)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sales Order not found
 */
router.post('/', validateDC, ppapGate, deliveryChallanController.createDeliveryChallan);

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
 *         description: Filter by status
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: so_id
 *         schema:
 *           type: string
 *         description: Filter by Sales Order ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of Delivery Challans
 *       401:
 *         description: Unauthorized
 */
router.get('/', deliveryChallanController.listDeliveryChallans);

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
router.get('/pending-dispatch', deliveryChallanController.getPendingDispatch);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       type: object
 *                       description: Challan header info (number, date, type, payment terms)
 *                     seller:
 *                       type: object
 *                       description: Company (consignor) details with address
 *                     buyer:
 *                       type: object
 *                       description: Customer (consignee) dispatch + billing address
 *                     transport:
 *                       type: object
 *                       description: Transport mode, vehicle, LR, destination
 *                     job_work:
 *                       type: object
 *                       nullable: true
 *                       description: Nature of processing + duration (only for Job Work Outward, else null)
 *                     items:
 *                       type: array
 *                       description: Line items with dual qty display, HSN, rate, amount
 *                     totals:
 *                       type: object
 *                       description: Grand total, tax lines, amount in words, NIL tax flag
 *                     hsn_summary:
 *                       type: array
 *                       description: HSN-wise taxable value summary
 *                     packing:
 *                       type: array
 *                       description: Package details
 *                     eway_bill:
 *                       type: object
 *                       description: e-Way Bill number and validity
 *                     gst:
 *                       type: object
 *                       description: GST type, inter/intra state flag, job work flag
 *                     footer:
 *                       type: object
 *                       description: Jurisdiction, declaration, signatory label
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/print', deliveryChallanController.getChallanPrintData);

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
router.get('/:id', deliveryChallanController.getDeliveryChallan);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ewb_number:
 *                       type: string
 *                       example: "321045678912"
 *                     validity_date:
 *                       type: string
 *                       format: date-time
 *                     qr_code:
 *                       type: string
 *       400:
 *         description: e-Way Bill not required or already generated
 *       404:
 *         description: Delivery Challan not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/generate-ewb', deliveryChallanController.generateEwayBill);

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
router.put('/:id/dispatch', deliveryChallanController.dispatchChallan);

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
router.put('/:id/pod', upload.single('pod_document'), deliveryChallanController.recordPOD);

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
router.put('/:id/customer-rejection', deliveryChallanController.customerRejection);
router.post('/bulk-delete', deliveryChallanController.bulkDeleteDeliveryChallans);



module.exports = router;