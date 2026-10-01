const express = require('express');
const router = express.Router();
const {
  createInspectionRecord,
  saveCheckpointResults,
  completeInspection,
  startBulkProduction,
  getRecordsByWO,
  getRecordsByGRN,
  getAllInspectionRecords,
  getRecordById,
  generateInspectionReport,
} = require('../../controllers/Quality/inspectionRecordController');
const { protect, authorize } = require('../../middleware/authMiddleware');
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Inspection Records
 *   description: Quality inspection record management for all inspection types
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckpointResult:
 *       type: object
 *       required:
 *         - checkpoint_seq
 *         - characteristic
 *         - specification
 *         - readings
 *       properties:
 *         checkpoint_seq:
 *           type: integer
 *           example: 1
 *         characteristic:
 *           type: string
 *           example: "Length"
 *         specification:
 *           type: string
 *           example: "100mm ± 0.5mm"
 *         nominal:
 *           type: number
 *           example: 100
 *         usl:
 *           type: number
 *           example: 100.5
 *         lsl:
 *           type: number
 *           example: 99.5
 *         readings:
 *           type: array
 *           items:
 *             type: number
 *           example: [100.02, 100.01, 100.03, 100.00, 100.01]
 *         gauge_id:
 *           type: string
 *           example: "69e8558253e23b98c95f0601"
 *         inspector_note:
 *           type: string
 *         photo_path:
 *           type: string
 *
 *     InspectionRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         inspection_id:
 *           type: string
 *           example: "IR-202603-0044"
 *         inspection_date:
 *           type: string
 *           format: date-time
 *         inspection_type:
 *           type: string
 *           enum: ['Incoming', 'First Article', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer Audit']
 *         plan_id:
 *           type: object
 *         item_id:
 *           type: object
 *         part_no:
 *           type: string
 *         lot_size:
 *           type: number
 *         sample_size:
 *           type: number
 *         accepted_qty:
 *           type: number
 *         rejected_qty:
 *           type: number
 *         overall_result:
 *           type: string
 *           enum: ['Accepted', 'Rejected', 'Conditionally Accepted', 'Pending', 'Partially Completed']
 *         checkpoint_results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckpointResult'
 *
 *     CreateInspectionRecord:
 *       type: object
 *       required:
 *         - inspection_type
 *         - item_id
 *         - part_no
 *         - inspector_id
 *       properties:
 *         plan_id:
 *           type: string
 *         inspection_type:
 *           type: string
 *           enum: ['Incoming', 'First Article', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer Audit']
 *         item_id:
 *           type: string
 *         part_no:
 *           type: string
 *         lot_size:
 *           type: number
 *         sample_size:
 *           type: number
 *         inspector_id:
 *           type: string
 *         grn_id:
 *           type: string
 *           description: Required for Incoming inspection
 *         wo_id:
 *           type: string
 *           description: Required for In-Process, Final, First Article
 *         op_sequence:
 *           type: integer
 *         vendor_id:
 *           type: string
 *         customer_id:
 *           type: string
 *         drawing_no:
 *           type: string
 *         drawing_revision:
 *           type: string
 *
 *     SaveResultsRequest:
 *       type: object
 *       required:
 *         - checkpoint_results
 *       properties:
 *         checkpoint_results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckpointResult'
 *
 *     CompleteInspectionRequest:
 *       type: object
 *       properties:
 *         accepted_qty:
 *           type: number
 *         rejected_qty:
 *           type: number
 *         rework_qty:
 *           type: number
 *         on_hold_qty:
 *           type: number
 *         disposition:
 *           type: string
 *           enum: ['Use As-Is', 'Sort', 'Rework', 'Return to Vendor', 'Scrap', 'MRB Review', 'Customer Concession']
 */

// ======================================================
// CREATE
// ======================================================

/**
 * @swagger
 * /api/inspection-records:
 *   post:
 *     summary: Create a new inspection record
 *     tags: [Inspection Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInspectionRecord'
 *     responses:
 *       201:
 *         description: Inspection record created successfully
 *       400:
 *         description: Validation error or calibration gate blocked
 *       500:
 *         description: Server error
 */
router.post('/', createInspectionRecord);

// ======================================================
// SAVE CHECKPOINT RESULTS
// ======================================================

/**
 * @swagger
 * /api/inspection-records/{id}/results:
 *   put:
 *     summary: Save checkpoint results for an inspection
 *     tags: [Inspection Records]
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
 *             $ref: '#/components/schemas/SaveResultsRequest'
 *     responses:
 *       200:
 *         description: Results saved successfully
 *       400:
 *         description: Inspection already completed or empty results
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.put('/:id/results', saveCheckpointResults);

// ======================================================
// COMPLETE INSPECTION
// ======================================================

/**
 * @swagger
 * /api/inspection-records/{id}/complete:
 *   put:
 *     summary: Complete an inspection and compute overall result
 *     tags: [Inspection Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteInspectionRequest'
 *     responses:
 *       200:
 *         description: Inspection completed successfully
 *       400:
 *         description: No checkpoint results saved or already completed
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.put('/:id/complete', completeInspection);

// ======================================================
// GENERATE REPORT
// ======================================================

/**
 * @swagger
 * /api/inspection-records/{id}/report:
 *   get:
 *     summary: Get inspection report data for a record
 *     tags: [Inspection Records]
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
 *         description: Report data retrieved successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/:id/report', generateInspectionReport);

// ======================================================
// START BULK PRODUCTION (FAI Gate)
// ======================================================

/**
 * @swagger
 * /api/inspection-records/wo/{woId}/operations/{seq}/bulk-start:
 *   post:
 *     summary: Start bulk production after FAI approval
 *     tags: [Inspection Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: woId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: seq
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bulk production started
 *       400:
 *         description: FAI not approved or bulk already started
 *       404:
 *         description: Work order or operation not found
 *       500:
 *         description: Server error
 */
router.post('/wo/:woId/operations/:seq/bulk-start', startBulkProduction);

// ======================================================
// GET BY WORK ORDER
// ======================================================

/**
 * @swagger
 * /api/inspection-records/by-wo/{wo_id}:
 *   get:
 *     summary: Get all inspection records for a Work Order
 *     tags: [Inspection Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/by-wo/:wo_id', getRecordsByWO);

// ======================================================
// GET BY GRN
// ======================================================

/**
 * @swagger
 * /api/inspection-records/by-grn/{grn_id}:
 *   get:
 *     summary: Get incoming inspection records for a GRN
 *     tags: [Inspection Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grn_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/by-grn/:grn_id', getRecordsByGRN);

// ======================================================
// GET ALL (filters + pagination) — must come before /:id
// ======================================================

/**
 * @swagger
 * /api/inspection-records/all:
 *   get:
 *     summary: Get all inspection records with filters and pagination
 *     tags: [Inspection Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: inspection_type
 *         schema:
 *           type: string
 *           enum: ['Incoming', 'First Article', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer Audit', 'Periodic', 'Concession Review']
 *       - in: query
 *         name: overall_result
 *         schema:
 *           type: string
 *           enum: ['Accepted', 'Rejected', 'Conditionally Accepted', 'Rework Required', 'On Hold', 'Pending', 'Partially Completed']
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: wo_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: grn_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: vendor_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: inspector_id
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
 *           default: 20
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: ['inspection_date', 'inspection_id', 'overall_result', 'lot_size', 'createdAt']
 *           default: 'inspection_date'
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: ['asc', 'desc']
 *           default: 'desc'
 *     responses:
 *       200:
 *         description: Records retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/all', getAllInspectionRecords);

// ======================================================
// GET BY ID — must be last to avoid swallowing named routes
// ======================================================

/**
 * @swagger
 * /api/inspection-records/{id}:
 *   get:
 *     summary: Get inspection record by ID
 *     tags: [Inspection Records]
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
 *         description: Record retrieved successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getRecordById);

module.exports = router;