// routes/Inventory/psvRoutes.js
const express = require('express');
const router = express.Router();
const {
  initiateVerification,
  enterCounts,
  enterSecondCounts,
  completeCounting,
  updateVarianceReason,
  approveVerification,
  closeVerification,
  getVerification,
  listVerifications,
  generateReport,
  getActiveVerification,
  deleteVerification
} = require('../../controllers/Inventory/psvController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Physical Stock Verification (PSV)
 *   description: Periodic physical counting of inventory to ensure ledger accuracy
 */

// ======================================================
// INITIATE PSV APIs
// ======================================================

/**
 * @swagger
 * /api/physical-verifications:
 *   post:
 *     summary: Initiate a new physical verification
 *     description: |
 *       Starts a physical verification process for a warehouse.
 *       - Freezes stock snapshot at current time
 *       - Creates count sheets for all items with quantity > 0
 *       - No stock transactions can be posted during active PSV
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_id
 *               - verification_type
 *             properties:
 *               warehouse_id:
 *                 type: string
 *                 required: true
 *                 description: Warehouse to verify
 *                 example: "65f123456789abcdef123456"
 *               verification_type:
 *                 type: string
 *                 required: true
 *                 enum: [Full Count, Cycle Count, Spot Check, Pre-Audit Count]
 *                 description: Type of verification
 *                 example: "Cycle Count"
 *               conducted_by:
 *                 type: string
 *                 description: Employee ID of person conducting count
 *                 example: "emp_store_001"
 *               witness:
 *                 type: string
 *                 description: Employee ID of independent witness
 *                 example: "emp_qa_001"
 *               variance_threshold_percent:
 *                 type: number
 *                 default: 5
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Percentage threshold for second count flag
 *                 example: 5
 *               variance_threshold_amount:
 *                 type: number
 *                 default: 1000
 *                 minimum: 0
 *                 description: Amount threshold (Rs) for second count flag
 *                 example: 1000
 *               remarks:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Monthly cycle count - Copper items"
 *     responses:
 *       201:
 *         description: Verification initiated successfully
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
 *                   example: "Physical verification initiated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_id:
 *                       type: string
 *                       example: "PSV-202504-0001"
 *                     warehouse_name:
 *                       type: string
 *                       example: "Raw Material Store"
 *                     total_items:
 *                       type: number
 *                       example: 47
 *                     freeze_datetime:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       example: "Initiated"
 *                     next_step:
 *                       type: string
 *                       example: "POST /api/physical-verifications/:id/counts to enter physical counts"
 *       400:
 *         description: Active PSV already exists for warehouse
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Warehouse not found
 *       500:
 *         description: Server error
 */
router.post('/', initiateVerification);

// ======================================================
// COUNTING APIs
// ======================================================

/**
 * @swagger
 * /api/physical-verifications/{id}/counts:
 *   put:
 *     summary: Enter physical count quantities
 *     description: |
 *       Store team enters the quantities physically counted.
 *       Can be done in multiple batches (e.g., rack by rack).
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - counts
 *             properties:
 *               counts:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - counted_qty
 *                   properties:
 *                     item_id:
 *                       type: string
 *                       description: Item's _id from PSV items array
 *                       example: "65f123456789abcdef123456"
 *                     counted_qty:
 *                       type: number
 *                       minimum: 0
 *                       description: Physical quantity counted
 *                       example: 485
 *                     remarks:
 *                       type: string
 *                       example: "Counted by Ramesh, 10:30 AM"
 *     responses:
 *       200:
 *         description: Counts entered successfully
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
 *                   example: "Counts entered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_id:
 *                       type: string
 *                       example: "PSV-202504-0001"
 *                     total_items_counted:
 *                       type: number
 *                     total_items:
 *                       type: number
 *                     completion_percentage:
 *                       type: number
 *       400:
 *         description: PSV not in counting state
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.put('/:id/counts', enterCounts);

/**
 * @swagger
 * /api/physical-verifications/{id}/second-counts:
 *   put:
 *     summary: Enter second count quantities (for high variance items)
 *     description: |
 *       Items with variance exceeding thresholds require a second count by a different person.
 *       If second count matches first, variance is confirmed.
 *       If not, third count is required.
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - counts
 *             properties:
 *               counts:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - counted_qty
 *                   properties:
 *                     item_id:
 *                       type: string
 *                       description: Item's _id from PSV items array
 *                     counted_qty:
 *                       type: number
 *                       description: Second count quantity
 *                     remarks:
 *                       type: string
 *     responses:
 *       200:
 *         description: Second counts entered successfully
 *       400:
 *         description: PSV not in progress
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.put('/:id/second-counts', enterSecondCounts);

/**
 * @swagger
 * /api/physical-verifications/{id}/complete:
 *   post:
 *     summary: Complete counting and calculate variances
 *     description: |
 *       Finalizes the counting phase. Calculates variances for all items.
 *       Items with first/second count mismatch require third count input.
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               third_counts:
 *                 type: array
 *                 description: Third count for items with first/second mismatch
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - counted_qty
 *                   properties:
 *                     item_id:
 *                       type: string
 *                     counted_qty:
 *                       type: number
 *     responses:
 *       200:
 *         description: Counting completed
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
 *                   example: "Counting completed. Variances calculated."
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_id:
 *                       type: string
 *                     total_variance_value:
 *                       type: number
 *                     net_variance_value:
 *                       type: number
 *                     items_with_variance:
 *                       type: number
 *                     high_variance_items:
 *                       type: array
 *                     status:
 *                       type: string
 *                       example: "Count Completed"
 *                     next_step:
 *                       type: string
 *                       example: "Investigate variances, then POST /api/physical-verifications/:id/approve"
 *       400:
 *         description: Items require third count
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/complete', completeCounting);

// ======================================================
// VARIANCE INVESTIGATION APIs
// ======================================================

/**
 * @swagger
 * /api/physical-verifications/{id}/items/{itemId}/reason:
 *   put:
 *     summary: Update variance reason for an item
 *     description: |
 *       Store manager investigates each variance and documents root cause.
 *       Also selects action (Adjust Up/Down/No Action/Write Off/Investigate Further)
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item's _id from PSV items array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variance_reason
 *             properties:
 *               variance_reason:
 *                 type: string
 *                 required: true
 *                 maxLength: 500
 *                 description: Root cause of variance
 *                 example: "Operator mistakenly placed 15 kg good copper strip in scrap bin"
 *               action:
 *                 type: string
 *                 enum: [Adjust Up, Adjust Down, No Action, Write Off, Investigate Further]
 *                 default: "No Action"
 *                 description: Recommended action
 *                 example: "No Action"
 *     responses:
 *       200:
 *         description: Variance reason updated
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
 *                   example: "Variance reason updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     part_no:
 *                       type: string
 *                     variance:
 *                       type: number
 *                     variance_reason:
 *                       type: string
 *                     action:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: PSV or item not found
 *       500:
 *         description: Server error
 */
router.put('/:id/items/:itemId/reason', updateVarianceReason);

// ======================================================
// APPROVAL & ADJUSTMENT APIs
// ======================================================

/**
 * @swagger
 * /api/physical-verifications/{id}/approve:
 *   post:
 *     summary: Approve verification and post stock adjustments
 *     description: |
 *       Management approval for variance adjustments.
 *       This operation:
 *       - Creates StockTransaction records for each variance
 *       - Updates Stock Ledger quantities
 *       - Posts GL journal entries
 *       - Changes PSV status to Approved
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved_by
 *             properties:
 *               approved_by:
 *                 type: string
 *                 required: true
 *                 description: User ID of approving manager
 *                 example: "user_md_001"
 *               remarks:
 *                 type: string
 *                 description: Approval remarks
 *                 example: "Variance investigated and resolved. Material recovered. No adjustment needed."
 *               items:
 *                 type: array
 *                 description: Override actions for specific items
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_id:
 *                       type: string
 *                     action:
 *                       type: string
 *                       enum: [Adjust Up, Adjust Down, No Action, Write Off, Investigate Further]
 *     responses:
 *       200:
 *         description: Verification approved and adjustments posted
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
 *                   example: "Verification approved and adjustments posted"
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_id:
 *                       type: string
 *                     adjustment_txns:
 *                       type: number
 *                     total_variance_adjusted:
 *                       type: number
 *                     net_variance_adjusted:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: "Approved"
 *                     next_step:
 *                       type: string
 *                       example: "POST /api/physical-verifications/:id/close to close verification"
 *       400:
 *         description: PSV not ready for approval
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions (Admin/Manager only)
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/approve', approveVerification);

/**
 * @swagger
 * /api/physical-verifications/{id}/close:
 *   post:
 *     summary: Close physical verification
 *     description: |
 *       Final step. Closes the verification after all adjustments are verified.
 *       No further changes allowed.
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     responses:
 *       200:
 *         description: Verification closed successfully
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
 *                   example: "Physical verification closed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "Closed"
 *                     closed_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: PSV must be approved first
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/close', closeVerification);

// ======================================================
// GET PSV APIs
// ======================================================

/**
 * @swagger
 * /api/physical-verifications:
 *   get:
 *     summary: List all physical verifications
 *     description: Returns paginated list of PSVs with optional filters
 *     tags: [Physical Stock Verification (PSV)]
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
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Initiated, In Progress, Count Completed, Under Review, Adjusted, Approved, Closed]
 *         description: Filter by PSV status
 *       - in: query
 *         name: verification_type
 *         schema:
 *           type: string
 *           enum: [Full Count, Cycle Count, Spot Check, Pre-Audit Count]
 *         description: Filter by verification type
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for verification_date filter
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for verification_date filter
 *     responses:
 *       200:
 *         description: Verifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PhysicalStockVerification'
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
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', listVerifications);

/**
 * @swagger
 * /api/physical-verifications/active/{warehouse_id}:
 *   get:
 *     summary: Get active verification for a warehouse
 *     description: Returns the currently active (not closed) verification for a warehouse
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouse_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Active verification found
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
 *                     verification_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     verification_type:
 *                       type: string
 *                     freeze_datetime:
 *                       type: string
 *                     total_items:
 *                       type: number
 *                     total_items_counted:
 *                       type: number
 *                     completion_percentage:
 *                       type: number
 *       404:
 *         description: No active verification found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/active/:warehouse_id', getActiveVerification);

/**
 * @swagger
 * /api/physical-verifications/{id}:
 *   get:
 *     summary: Get physical verification by ID
 *     description: Returns complete PSV details including all items with counts and variances
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     responses:
 *       200:
 *         description: PSV retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PhysicalStockVerification'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteVerification);
router.get('/:id', getVerification);

/**
 * @swagger
 * /api/physical-verifications/{id}/report:
 *   get:
 *     summary: Generate detailed PSV report
 *     description: Returns formatted report with variance categorization and summary statistics
 *     tags: [Physical Stock Verification (PSV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PSV ID
 *     responses:
 *       200:
 *         description: Report generated successfully
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
 *                     header:
 *                       type: object
 *                     personnel:
 *                       type: object
 *                     summary:
 *                       type: object
 *                     variances:
 *                       type: object
 *                       properties:
 *                         surplus:
 *                           type: array
 *                         shortage:
 *                           type: array
 *                     adjustments:
 *                       type: object
 *                     remarks:
 *                       type: string
 *                     approval_remarks:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: PSV not found
 *       500:
 *         description: Server error
 */
router.get('/:id/report', generateReport);

// ======================================================
// SWAGGER COMPONENTS
// ======================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     PhysicalStockVerification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         verification_id:
 *           type: string
 *           example: "PSV-202504-0001"
 *         verification_date:
 *           type: string
 *           format: date-time
 *         warehouse_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             warehouse_id:
 *               type: string
 *             warehouse_name:
 *               type: string
 *         warehouse_name:
 *           type: string
 *         verification_type:
 *           type: string
 *           enum: [Full Count, Cycle Count, Spot Check, Pre-Audit Count]
 *         freeze_datetime:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               item_id:
 *                 type: object
 *               part_no:
 *                 type: string
 *               item_description:
 *                 type: string
 *               bin_id:
 *                 type: string
 *               batch_no:
 *                 type: string
 *               system_qty:
 *                 type: number
 *               system_value:
 *                 type: number
 *               unit_cost:
 *                 type: number
 *               counted_qty:
 *                 type: number
 *               second_count_qty:
 *                 type: number
 *               third_count_qty:
 *                 type: number
 *               final_qty:
 *                 type: number
 *               variance:
 *                 type: number
 *               variance_value:
 *                 type: number
 *               variance_pct:
 *                 type: number
 *               variance_reason:
 *                 type: string
 *               action:
 *                 type: string
 *               counted_by:
 *                 type: object
 *               second_count_by:
 *                 type: object
 *               counted_at:
 *                 type: string
 *               second_counted_at:
 *                 type: string
 *         total_items_counted:
 *           type: number
 *         total_variance_value:
 *           type: number
 *         net_variance_value:
 *           type: number
 *         items_with_variance:
 *           type: number
 *         conducted_by:
 *           type: object
 *         second_count_by:
 *           type: object
 *         witness:
 *           type: object
 *         approved_by:
 *           type: object
 *         approved_at:
 *           type: string
 *           format: date-time
 *         approval_remarks:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Initiated, In Progress, Count Completed, Under Review, Adjusted, Approved, Closed]
 *         variance_threshold_percent:
 *           type: number
 *         variance_threshold_amount:
 *           type: number
 *         adjustment_txn_ids:
 *           type: array
 *           items:
 *             type: string
 *         remarks:
 *           type: string
 *         created_by:
 *           type: object
 *         completed_at:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         completion_percentage:
 *           type: number
 *         requires_management_approval:
 *           type: boolean
 */

module.exports = router;