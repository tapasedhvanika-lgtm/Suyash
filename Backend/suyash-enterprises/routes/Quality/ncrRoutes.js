'use strict';
const express = require('express');
const router = express.Router();
const {
  createNCR,
  getAllNCRs,
  getNCRById,
  setDisposition,
  recordRootCause,
  linkCAPA,
  closeNCR,
  getNCRByGRNId,
  getNCRsByVendor,
  getNCRsByPO,
  getNCRDashboardStats,
  updateFinancialDetails,
  addAction,
  updateActionStatus,
  getNCRTrend,
  deleteNCR,
} = require('../../controllers/Quality/ncrController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: NCR
 *   description: Non-Conformance Report — Phase 10 BE-024
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NCRResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         ncr_number:
 *           type: string
 *           example: "NCR-202503-0003"
 *         ncr_date:
 *           type: string
 *           format: date-time
 *         ncr_type:
 *           type: string
 *           enum: [Incoming, In-Process, Final Inspection, Customer Return, Internal Audit Finding, Gauge Calibration Failure]
 *         severity:
 *           type: string
 *           enum: [Critical, Major, Minor]
 *         quantity:
 *           type: number
 *         defect_description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Open, Under Investigation, Disposition Given, CAPA Initiated, Pending Verification, Closed, Escalated]
 *         disposition:
 *           type: string
 *           enum: [Scrap, Rework, Use As-Is, Return to Vendor, Sort, MRB Review, Customer Concession, Pending Decision]
 *         capa_id:
 *           type: string
 *
 *     NCRErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /api/ncrs:
 *   post:
 *     summary: Create a new Non-Conformance Report (NCR)
 *     description: |
 *       Creates an NCR for quality failures at any stage:
 *       - Incoming material rejection
 *       - In-process defects
 *       - Final inspection failures
 *       - Customer complaints
 *       
 *       **Business Rules:**
 *       - If GRN is provided, vendor is auto-fetched
 *       - If WO is provided, WO status changes to 'On Hold'
 *       - Critical/Major severity requires CAPA for closure
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ncr_type
 *               - severity
 *               - item_id
 *               - quantity
 *               - defect_description
 *             properties:
 *               ncr_type:
 *                 type: string
 *                 enum: [Incoming, In-Process, Final Inspection, Customer Return, Internal Audit Finding, Gauge Calibration Failure]
 *                 example: "Incoming"
 *               severity:
 *                 type: string
 *                 enum: [Critical, Major, Minor]
 *                 example: "Major"
 *               source_inspection_id:
 *                 type: string
 *                 description: Inspection Record that triggered this NCR
 *               item_id:
 *                 type: string
 *                 required: true
 *               part_no:
 *                 type: string
 *               drawing_no:
 *                 type: string
 *               drawing_revision:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 required: true
 *                 example: 500
 *               quantity_unit:
 *                 type: string
 *                 enum: [Nos, Kg, Meter, Litre, Set]
 *                 default: "Nos"
 *               lot_no:
 *                 type: string
 *               wo_id:
 *                 type: string
 *                 description: Work Order ID if in-process NCR
 *               grn_id:
 *                 type: string
 *                 description: GRN ID if incoming NCR
 *               po_id:
 *                 type: string
 *               vendor_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               defect_codes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     category:
 *                       type: string
 *               defect_description:
 *                 type: string
 *                 required: true
 *               detected_at_operation:
 *                 type: string
 *               immediate_action:
 *                 type: string
 *               rejected_qty:
 *                 type: number
 *                 description: Quantity of rejected pieces (defaults to full quantity if not provided)
 *                 example: 500
 *               estimated_loss:
 *                 type: number
 *                 description: Estimated financial loss in Rupees
 *                 example: 50000
 *     responses:
 *       201:
 *         description: NCR created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     ncr_number:
 *                       type: string
 *                     status:
 *                       type: string
 *                     severity:
 *                       type: string
 *                     estimated_loss:
 *                       type: number
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/',  createNCR);

/**
 * @swagger
 * /api/ncrs:
 *   get:
 *     summary: List all NCRs with filters
 *     description: |
 *       Returns paginated list of NCRs with filtering options.
 *       Supports filtering by status, severity, type, vendor, item, and date range.
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Under Investigation, Disposition Given, CAPA Initiated, Pending Verification, Closed, Escalated]
 *         description: Filter by NCR status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Critical, Major, Minor]
 *         description: Filter by severity
 *       - in: query
 *         name: ncr_type
 *         schema:
 *           type: string
 *           enum: [Incoming, In-Process, Final Inspection, Customer Return, Internal Audit Finding, Gauge Calibration Failure]
 *         description: Filter by NCR type
 *       - in: query
 *         name: vendor_id
 *         schema:
 *           type: string
 *         description: Filter by vendor
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *         description: Filter by item
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: "ncr_date"
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: NCRs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NCRResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllNCRs);


/**
 * @swagger
 * /api/ncrs/trend:
 *   get:
 *     summary: NCR Trend Analysis
 *     description: |
 *       Returns quality failure trends for Pareto analysis.
 *       
 *       **Output includes:**
 *       - Summary statistics (total NCRs, open/closed counts)
 *       - Monthly trend with severity breakdown
 *       - Top defect codes with counts
 *       
 *       Use this for:
 *       - Identifying most frequent defects
 *       - Tracking quality improvement over time
 *       - Prioritizing CAPA initiatives
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for trend analysis
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for trend analysis
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [defect_code, vendor, severity, ncr_type]
 *           default: "defect_code"
 *         description: Group by dimension for Pareto analysis
 *     responses:
 *       200:
 *         description: Trend data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         from:
 *                           type: string
 *                         to:
 *                           type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_ncrs:
 *                           type: integer
 *                         total_quantity:
 *                           type: integer
 *                         open_ncrs:
 *                           type: integer
 *                         closed_ncrs:
 *                           type: integer
 *                     monthly_trend:
 *                       type: array
 *                       items:
 *                         type: object
 *                     by_defect:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           total_quantity:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/trend', getNCRTrend);

/**
 * @swagger
 * /api/ncrs/{id}:
 *   get:
 *     summary: Get full NCR details by ID
 *     description: Returns complete NCR with all fields including disposition, root cause, and CAPA link
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *     responses:
 *       200:
 *         description: NCR retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NCRResponse'
 *       404:
 *         description: NCR not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getNCRById);
router.delete('/:id', deleteNCR);

/**
 * @swagger
 * /api/ncrs/{id}/disposition:
 *   put:
 *     summary: Set NCR disposition
 *     description: |
 *       Decides what to do with non-conforming material.
 *       
 *       **Disposition Options:**
 *       - Scrap: Material unusable, cannot fix
 *       - Rework: Can be fixed with additional operations
 *       - Use As-Is: Minor deviation, engineering approved
 *       - Return to Vendor: Supplier's fault, send back
 *       - Sort: 100% inspect to separate good from bad
 *       - MRB Review: Material Review Board decision pending
 *       - Customer Concession: Customer approval required
 *       - Pending Decision: Awaiting more information
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disposition
 *             properties:
 *               disposition:
 *                 type: string
 *                 enum: [Scrap, Rework, Use As-Is, Return to Vendor, Sort, MRB Review, Customer Concession, Pending Decision]
 *                 example: "Return to Vendor"
 *               disposition_basis:
 *                 type: string
 *                 description: Engineering justification for the decision
 *               immediate_action:
 *                 type: string
 *                 description: Containment action taken immediately
 *               concession_number:
 *                 type: string
 *                 description: Internal concession number if Use As-Is approved
 *               customer_concession_no:
 *                 type: string
 *                 description: Customer concession number for automotive customers
 *               vendor_return_challan:
 *                 type: string
 *                 description: Return challan number if Return to Vendor
 *               financial_impact:
 *                 type: number
 *                 description: Monetary value of non-conformance
 *     responses:
 *       200:
 *         description: Disposition set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ncr_number:
 *                       type: string
 *                     disposition:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid disposition
 *       404:
 *         description: NCR not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/disposition', setDisposition);

/**
 * @swagger
 * /api/ncrs/{id}/root-cause:
 *   put:
 *     summary: Record root cause analysis
 *     description: |
 *       Documents why the failure happened using structured methods.
 *       
 *       **Root Cause Methods:**
 *       - 5-Why: Ask "why" five times to find root cause
 *       - Fishbone (Ishikawa): Cause and effect diagram
 *       - Fault Tree Analysis: Top-down deductive analysis
 *       - Kepner-Tregoe: Problem analysis and decision making
 *       
 *       **systemic_failure flag:**
 *       - true: This is a recurring issue (appeared in past 3 NCRs)
 *       - false: One-time occurrence
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               root_cause_method:
 *                 type: string
 *                 enum: [5-Why, Fishbone (Ishikawa), Fault Tree Analysis, Kepner-Tregoe, Other]
 *                 example: "5-Why"
 *               root_cause:
 *                 type: string
 *                 example: "5-Why: 1. Hole OOT → 2. Drill worn → 3. Drill life not tracked → 4. No drill life management system → 5. Root cause: No drill replacement schedule defined."
 *               escape_cause:
 *                 type: string
 *                 description: Why was this not detected earlier?
 *                 example: "In-process inspection frequency too low"
 *               systemic_failure:
 *                 type: boolean
 *                 description: Is this a recurring issue?
 *                 default: false
 *     responses:
 *       200:
 *         description: Root cause recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     systemic_failure:
 *                       type: boolean
 *                     capa_required:
 *                       type: boolean
 *                       description: True if CAPA is mandatory for closure
 *       404:
 *         description: NCR not found
 */
router.put('/:id/root-cause', recordRootCause);

/**
 * @swagger
 * /api/ncrs/{id}/link-capa/{capa_id}:
 *   put:
 *     summary: Link CAPA to NCR
 *     description: |
 *       Links a CAPA record to this NCR.
 *       Required for NCRs with severity = Critical/Major AND systemic_failure = true.
 *       Once linked, NCR status changes to 'CAPA Initiated'.
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *       - in: path
 *         name: capa_id
 *         required: true
 *         schema:
 *           type: string
 *         description: CAPA MongoDB _id
 *     responses:
 *       200:
 *         description: CAPA linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ncr_number:
 *                       type: string
 *                     capa_id:
 *                       type: string
 *       404:
 *         description: NCR or CAPA not found
 */
router.put('/:id/link-capa/:capa_id', linkCAPA);

/**
 * @swagger
 * /api/ncrs/{id}/close:
 *   put:
 *     summary: Close NCR
 *     description: |
 *       Closes the NCR after all actions are complete.
 *       
 *       **CRITICAL RULE:** Cannot close if:
 *       - severity = Critical/Major AND systemic_failure = true AND no CAPA linked
 *       - Linked CAPA is not closed yet
 *       
 *       **Business Rule:** For NCRs with severity = Critical or Major, 
 *       a CAPA must be initiated within 7 days of NCR closure (configurable SLA).
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recurrence_check:
 *                 type: boolean
 *                 description: Has this defect recurred after CAPA?
 *                 default: false
 *     responses:
 *       200:
 *         description: NCR closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ncr_number:
 *                       type: string
 *                     closed_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: CAPA required - cannot close
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                   example: "CAPA_REQUIRED"
 *       404:
 *         description: NCR not found
 */
router.put('/:id/close', closeNCR);


/**
 * @swagger
 * /api/ncrs/grn/{grnId}:
 *   get:
 *     summary: Get NCR by GRN ID
 *     description: Returns the NCR associated with a specific Goods Receipt Note
 *     tags:  [NCR Fetch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grnId
 *         required: true
 *         schema:
 *           type: string
 *         description: GRN MongoDB _id
 *     responses:
 *       200:
 *         description: NCR retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NCRResponse'
 *       404:
 *         description: NCR not found for this GRN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                   example: "NCR_NOT_FOUND"
 */
router.get('/grn/:grnId',  getNCRByGRNId);

/**
 * @swagger
 * /api/ncrs/vendor/{vendorId}:
 *   get:
 *     summary: Get NCRs by Vendor
 *     description: Returns all NCRs for a specific vendor with vendor performance statistics
 *     tags:  [NCR Fetch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor MongoDB _id
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Under Investigation, Disposition Given, CAPA Initiated, Pending Verification, Closed, Escalated]
 *         description: Filter by NCR status
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
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
 *     responses:
 *       200:
 *         description: NCRs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     vendor:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         vendor_name:
 *                           type: string
 *                         vendor_code:
 *                           type: string
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total_ncrs:
 *                           type: integer
 *                         total_rejected_qty:
 *                           type: integer
 *                         total_estimated_loss:
 *                           type: number
 *                         total_actual_loss:
 *                           type: number
 *                         total_recovered:
 *                           type: number
 *                         open_ncrs:
 *                           type: integer
 *                         closed_ncrs:
 *                           type: integer
 *                         avg_resolution_days:
 *                           type: number
 *                     ncrs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NCRResponse'
 *                     pagination:
 *                       type: object
 *       404:
 *         description: Vendor not found
 */
router.get('/vendor/:vendorId',  getNCRsByVendor);

/**
 * @swagger
 * /api/ncrs/po/{poId}:
 *   get:
 *     summary: Get NCRs by Purchase Order
 *     description: Returns all NCRs for a specific Purchase Order with PO statistics
 *     tags: [NCR Fetch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase Order MongoDB _id
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Under Investigation, Disposition Given, CAPA Initiated, Pending Verification, Closed, Escalated]
 *         description: Filter by NCR status
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
 *     responses:
 *       200:
 *         description: NCRs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     po:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         po_number:
 *                           type: string
 *                         po_date:
 *                           type: string
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total_ncrs:
 *                           type: integer
 *                         total_rejected_qty:
 *                           type: integer
 *                         total_estimated_loss:
 *                           type: number
 *                         total_actual_loss:
 *                           type: number
 *                         total_recovered:
 *                           type: number
 *                         open_ncrs:
 *                           type: integer
 *                         closed_ncrs:
 *                           type: integer
 *                     ncrs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NCRResponse'
 *                     pagination:
 *                       type: object
 *       404:
 *         description: Purchase Order not found
 */
router.get('/po/:poId', getNCRsByPO);

/**
 * @swagger
 * /api/ncrs/dashboard/stats:
 *   get:
 *     summary: NCR Dashboard Statistics
 *     description: |
 *       Returns comprehensive dashboard statistics including:
 *       - Overall metrics (total NCRs, rejected quantity, financial impact)
 *       - Breakdown by severity, type, and disposition
 *       - Top vendors by NCR count
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: vendor_id
 *         schema:
 *           type: string
 *         description: Filter by specific vendor
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overall:
 *                       type: object
 *                       properties:
 *                         total_ncrs:
 *                           type: integer
 *                         total_rejected_qty:
 *                           type: integer
 *                         total_estimated_loss:
 *                           type: number
 *                         total_actual_loss:
 *                           type: number
 *                         total_recovered:
 *                           type: number
 *                         open_ncrs:
 *                           type: integer
 *                         closed_ncrs:
 *                           type: integer
 *                         systemic_ncrs:
 *                           type: integer
 *                     by_severity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           rejected_qty:
 *                             type: integer
 *                           estimated_loss:
 *                             type: number
 *                     by_type:
 *                       type: array
 *                       items:
 *                         type: object
 *                     by_disposition:
 *                       type: array
 *                       items:
 *                         type: object
 *                     top_vendors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           vendor_id:
 *                             type: string
 *                           vendor_name:
 *                             type: string
 *                           ncr_count:
 *                             type: integer
 *                           rejected_qty:
 *                             type: integer
 *                           estimated_loss:
 *                             type: number
 */
router.get('/dashboard/stats', getNCRDashboardStats);

/**
 * @swagger
 * /api/ncrs/{id}/financial:
 *   put:
 *     summary: Update NCR Financial Details
 *     description: Updates actual loss, recovery amount, and debit note information
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actual_loss:
 *                 type: number
 *                 description: Actual financial loss incurred
 *                 example: 25000
 *               recovery_amount:
 *                 type: number
 *                 description: Amount recovered from vendor/insurance
 *                 example: 20000
 *               debit_note_id:
 *                 type: string
 *                 description: Debit note reference number
 *                 example: "DN-202504-001"
 *     responses:
 *       200:
 *         description: Financial details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ncr_number:
 *                       type: string
 *                     estimated_loss:
 *                       type: number
 *                     actual_loss:
 *                       type: number
 *                     recovery_amount:
 *                       type: number
 *                     net_loss:
 *                       type: number
 *                     debit_note_id:
 *                       type: string
 *       404:
 *         description: NCR not found
 */
router.put('/:id/financial',  updateFinancialDetails);

/**
 * @swagger
 * /api/ncrs/{id}/actions:
 *   post:
 *     summary: Add Action to NCR (Direct)
 *     description: |
 *       Adds corrective, preventive, or immediate actions directly to the NCR.
 *       This is used when CAPA is not required (Minor severity) or as interim actions.
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action_type
 *               - description
 *             properties:
 *               action_type:
 *                 type: string
 *                 enum: [Corrective Action, Preventive Action, Immediate Action]
 *                 description: Type of action to add
 *               description:
 *                 type: string
 *                 description: Detailed description of the action
 *               assigned_to:
 *                 type: string
 *                 description: User ID of responsible person
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Target completion date
 *     responses:
 *       200:
 *         description: Action added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ncr_number:
 *                       type: string
 *                     action:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         action_type:
 *                           type: string
 *                         description:
 *                           type: string
 *                         assigned_to:
 *                           type: object
 *                         due_date:
 *                           type: string
 *                         status:
 *                           type: string
 *       400:
 *         description: Invalid action type or missing required fields
 *       404:
 *         description: NCR not found
 */
router.post('/:id/actions',  addAction);

/**
 * @swagger
 * /api/ncrs/{id}/actions/{actionId}:
 *   put:
 *     summary: Update Action Status
 *     description: Updates the status of a specific action (Pending → In Progress → Completed)
 *     tags: [NCR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: NCR MongoDB _id
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Action subdocument _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, Overdue]
 *                 description: New status for the action
 *               remarks:
 *                 type: string
 *                 description: Additional remarks about the action completion
 *     responses:
 *       200:
 *         description: Action status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ncr_number:
 *                       type: string
 *                     action_type:
 *                       type: string
 *                     action_id:
 *                       type: string
 *                     old_status:
 *                       type: string
 *                     new_status:
 *                       type: string
 *                     completed_at:
 *                       type: string
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: NCR or Action not found
 */
router.put('/:id/actions/:actionId', updateActionStatus);

module.exports = router;