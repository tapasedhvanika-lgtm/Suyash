// routes/Inventory/materialIssueRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMaterialIssueVoucher,
  postMaterialIssueVoucher,
  getMaterialIssueVoucher,
  listMaterialIssueVouchers,
  getMIVByWorkOrder,
  autoCreateMIVFromBOM,
  cancelMaterialIssueVoucher,
  getMIVPrintData,
  updateMaterialIssueVoucher,
  deleteMaterialIssueVoucher,
  getIssueSummary,
  bulkIssueForWorkOrders
} = require('../../controllers/Inventory/materialIssueController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Material Issue Voucher (MIV)
 *   description: Material Issue Voucher management - formal authorization for issuing raw materials to production
 */

// ======================================================
// CREATE MIV APIs
// ======================================================

/**
 * @swagger
 * /api/miv:
 *   post:
 *     summary: Create a new Material Issue Voucher (Draft)
 *     description: |
 *       Creates a draft MIV. Materials are not deducted from stock until MIV is posted.
 *       One MIV can be created per Work Order (or multiple MIVs for additional material mid-job).
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wo_id
 *               - items
 *               - issued_by
 *             properties:
 *               wo_id:
 *                 type: string
 *                 description: Work Order ID
 *                 example: "65f123456789abcdef123456"
 *               department:
 *                 type: string
 *                 description: Receiving department (can be Department ID or Name)
 *                 example: "Press Shop"
 *               issued_by:
 *                 type: string
 *                 description: Employee ID of store person issuing material
 *                 example: "emp_001"
 *               received_by:
 *                 type: string
 *                 description: Employee ID of production person receiving material
 *                 example: "prod_sup_001"
 *               authorised_by:
 *                 type: string
 *                 description: User ID of manager authorizing (for high-value items)
 *                 example: "user_mgr_001"
 *               items:
 *                 type: array
 *                 description: List of materials to issue
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - part_no
 *                     - issued_qty
 *                     - unit
 *                     - warehouse_id
 *                   properties:
 *                     item_id:
 *                       type: string
 *                       example: "item_copper_001"
 *                     part_no:
 *                       type: string
 *                       example: "COPPER-001"
 *                     item_description:
 *                       type: string
 *                       example: "Copper Strip 25mm x 5mm"
 *                     issued_qty:
 *                       type: number
 *                       example: 50
 *                       minimum: 0.001
 *                     unit:
 *                       type: string
 *                       enum: [Nos, Kg, Meter, Sheet, Roll]
 *                       example: "Kg"
 *                     warehouse_id:
 *                       type: string
 *                       example: "WH-RM-001"
 *                     bin_id:
 *                       type: string
 *                       example: "RACK-A-01"
 *                     batch_no:
 *                       type: string
 *                       example: "BATCH-001"
 *                     heat_no:
 *                       type: string
 *                       example: "HEAT-12345"
 *                     unit_cost:
 *                       type: number
 *                       example: 500
 *                       description: Optional - if not provided, taken from Stock Ledger
 *               remarks:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Full kit issue for 20 pieces including 5% scrap allowance"
 *     responses:
 *       201:
 *         description: MIV created successfully
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
 *                   example: "Material Issue Voucher created in Draft status with FIFO batch selection"
 *                 data:
 *                   type: object
 *                   properties:
 *                     miv_number:
 *                       type: string
 *                       example: "MIV-202504-0001"
 *                     miv_id:
 *                       type: string
 *                       example: "65f123456789abcdef123457"
 *                     department:
 *                       type: string
 *                       example: "Press Shop"
 *                     total_issue_cost:
 *                       type: number
 *                       example: 27000
 *                     items_count:
 *                       type: number
 *                       example: 2
 *                     status:
 *                       type: string
 *                       example: "Draft"
 *                     fifo_summary:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           part_no:
 *                             type: string
 *                           batches_used:
 *                             type: number
 *                           total_quantity:
 *                             type: number
 *                           total_cost:
 *                             type: number
 *                           average_cost:
 *                             type: number
 *                     next_step:
 *                       type: string
 *                       example: "POST /api/miv/:id/post to issue materials and update stock"
 *       400:
 *         description: Validation error - insufficient stock or invalid data
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Work Order not found
 *       500:
 *         description: Server error
 */
router.post('/', createMaterialIssueVoucher);

/**
 * @swagger
 * /api/miv/summary:
 *   get:
 *     summary: Get MIV issue summary by date range
 *     description: Returns aggregated summary of material issues for reporting
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for summary
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for summary
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by warehouse ID
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by Department ID
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/summary', getIssueSummary);

/**
 * @swagger
 * /api/miv/auto-from-bom:
 *   post:
 *     summary: Auto-create MIV from BOM (Full Kit Issue)
 *     description: |
 *       Automatically creates a complete MIV by fetching all BOM components for the Work Order.
 *       Uses FIFO batch selection for each component.
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wo_id
 *               - warehouse_id
 *               - issued_by
 *             properties:
 *               wo_id:
 *                 type: string
 *                 example: "65f123456789abcdef123456"
 *               warehouse_id:
 *                 type: string
 *                 example: "WH-RM-001"
 *               issued_by:
 *                 type: string
 *                 example: "emp_001"
 *               department:
 *                 type: string
 *                 description: Receiving department (can be Department ID or Name)
 *                 example: "Press Shop"
 *     responses:
 *       201:
 *         description: Auto-created MIV successfully
 *       400:
 *         description: BOM has no components or stock shortage
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Work Order or BOM not found
 *       500:
 *         description: Server error
 */
router.post('/auto-from-bom', autoCreateMIVFromBOM);

// ======================================================
// POST (ISSUE) MIV APIs
// ======================================================

/**
 * @swagger
 * /api/miv/{id}/post:
 *   post:
 *     summary: Post MIV - Actually issue materials and update stock
 *     description: |
 *       Posts a draft MIV. This operation:
 *       - Decrements stock from Stock Ledger using FIFO batch selection
 *       - Creates StockTransaction records for each batch
 *       - Consumes active reservations
 *       - Updates Work Order actual_rm_cost
 *       - Changes MIV status from Draft to Issued
 *       This operation is irreversible (use Material Return Voucher to reverse)
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     responses:
 *       200:
 *         description: Materials issued successfully
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
 *                   example: "Materials issued successfully using FIFO"
 *                 data:
 *                   type: object
 *                   properties:
 *                     miv_number:
 *                       type: string
 *                       example: "MIV-202504-0001"
 *                     wo_number:
 *                       type: string
 *                       example: "WO-202504-0001"
 *                     total_rm_cost_added:
 *                       type: number
 *                       example: 27000
 *                     total_rm_cost_accumulated:
 *                       type: number
 *                       example: 27000
 *                     transactions_count:
 *                       type: number
 *                       example: 2
 *                     fifo_details:
 *                       type: array
 *                       description: FIFO batch breakdown for each item
 *                       items:
 *                         type: object
 *                         properties:
 *                           part_no:
 *                             type: string
 *                           batches:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 batch_no:
 *                                   type: string
 *                                 quantity:
 *                                   type: number
 *                                 unit_cost:
 *                                   type: number
 *                                 total_value:
 *                                   type: number
 *                                 receipt_date:
 *                                   type: string
 *                                   format: date-time
 *                     variance_alerts:
 *                       type: array
 *                       description: BOM vs actual consumption variance >5%
 *                       items:
 *                         type: object
 *                         properties:
 *                           part_no:
 *                             type: string
 *                           bom_required:
 *                             type: number
 *                           issued:
 *                             type: number
 *                           variance_percent:
 *                             type: string
 *                           fifo_batches_used:
 *                             type: array
 *                     status:
 *                       type: string
 *                       example: "Issued"
 *       400:
 *         description: MIV already posted or insufficient stock
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MIV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/post', postMaterialIssueVoucher);

/**
 * @swagger
 * /api/miv/{id}/cancel:
 *   post:
 *     summary: Cancel draft MIV
 *     description: Cancels a draft MIV (cannot cancel posted MIV - use MRV instead)
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Work Order cancelled"
 *     responses:
 *       200:
 *         description: MIV cancelled successfully
 *       400:
 *         description: Cannot cancel posted MIV
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MIV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/cancel', cancelMaterialIssueVoucher);

// ======================================================
// UPDATE & DELETE MIV APIs
// ======================================================

/**
 * @swagger
 * /api/miv/{id}:
 *   put:
 *     summary: Update draft Material Issue Voucher
 *     description: Updates a draft MIV. Only Draft status MIV can be updated.
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 description: Receiving department (ID or Name)
 *               issued_by:
 *                 type: string
 *                 description: Employee ID of store person
 *               received_by:
 *                 type: string
 *                 description: Employee ID of production person
 *               authorised_by:
 *                 type: string
 *                 description: User ID of manager authorizing
 *               items:
 *                 type: array
 *                 description: Updated list of materials to issue
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: MIV updated successfully
 *       400:
 *         description: Cannot update non-draft MIV
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MIV not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateMaterialIssueVoucher);

/**
 * @swagger
 * /api/miv/{id}:
 *   delete:
 *     summary: Hard delete draft Material Issue Voucher
 *     description: |
 *       Permanently deletes a draft MIV from the database.
 *       Only Draft status MIV can be deleted.
 *       This operation is irreversible.
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     responses:
 *       200:
 *         description: MIV deleted successfully
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
 *                   example: "Material Issue Voucher MIV-202504-0001 deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     miv_number:
 *                       type: string
 *                     wo_number:
 *                       type: string
 *                     status:
 *                       type: string
 *                     total_issue_cost:
 *                       type: number
 *                     items_count:
 *                       type: number
 *                     created_at:
 *                       type: string
 *                     deleted_at:
 *                       type: string
 *                     deleted_by:
 *                       type: string
 *       400:
 *         description: Cannot delete non-draft MIV
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MIV not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteMaterialIssueVoucher);

// ======================================================
// GET MIV APIs
// ======================================================

/**
 * @swagger
 * /api/miv:
 *   get:
 *     summary: List all Material Issue Vouchers with filters
 *     description: Returns paginated list of MIVs with optional filters including department
 *     tags: [Material Issue Voucher (MIV)]
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
 *         name: wo_id
 *         schema:
 *           type: string
 *         description: Filter by Work Order ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Issued, Partially Returned, Fully Returned, Closed, Cancelled]
 *         description: Filter by MIV status
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by Department ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for miv_date filter
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for miv_date filter
 *       - in: query
 *         name: miv_number
 *         schema:
 *           type: string
 *         description: Search by MIV number (partial match)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search across MIV number, WO number, SO number, and department name
 *     responses:
 *       200:
 *         description: MIVs retrieved successfully
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
 *                     $ref: '#/components/schemas/MaterialIssueVoucher'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_issues:
 *                       type: number
 *                     total_issue_value:
 *                       type: number
 *                     by_status:
 *                       type: object
 *                     by_department:
 *                       type: object
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
router.get('/', listMaterialIssueVouchers);

/**
 * @swagger
 * /api/miv/{id}:
 *   get:
 *     summary: Get Material Issue Voucher by ID
 *     description: Returns complete MIV details including all items and populated references (Work Order, Department, Personnel)
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     responses:
 *       200:
 *         description: MIV retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MaterialIssueVoucher'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_items:
 *                       type: number
 *                     total_issued_qty:
 *                       type: number
 *                     total_cost:
 *                       type: number
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MIV not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getMaterialIssueVoucher);

/**
 * @swagger
 * /api/miv/by-workorder/{wo_id}:
 *   get:
 *     summary: Get all MIVs for a specific Work Order
 *     description: Returns all MIVs issued against a Work Order with consumption summary
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID
 *     responses:
 *       200:
 *         description: MIVs retrieved successfully
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
 *                     work_order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         number:
 *                           type: string
 *                         part_no:
 *                           type: string
 *                         part_name:
 *                           type: string
 *                         planned_qty:
 *                           type: number
 *                         actual_rm_cost:
 *                           type: number
 *                     mivs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaterialIssueVoucher'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_mivs:
 *                           type: number
 *                         total_issued_cost:
 *                           type: number
 *                         total_returned_value:
 *                           type: number
 *                         net_consumed:
 *                           type: number
 *                         returned_items_breakdown:
 *                           type: array
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/by-workorder/:wo_id', getMIVByWorkOrder);

/**
 * @swagger
 * /api/miv/{id}/print:
 *   get:
 *     summary: Get MIV data formatted for printing
 *     description: Returns MIV data in a print-friendly format for physical document
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     responses:
 *       200:
 *         description: Print data retrieved successfully
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
 *                     work_order:
 *                       type: object
 *                     customer:
 *                       type: object
 *                     department:
 *                       type: string
 *                     personnel:
 *                       type: object
 *                     items:
 *                       type: array
 *                     totals:
 *                       type: object
 *                     remarks:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MIV not found
 *       500:
 *         description: Server error
 */
router.get('/:id/print', getMIVPrintData);



/**
 * @swagger
 * /api/miv/bulk-issue:
 *   post:
 *     summary: Bulk issue materials for multiple Work Orders
 *     description: Creates MIVs for multiple Work Orders in bulk
 *     tags: [Material Issue Voucher (MIV)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - work_orders
 *               - issued_by
 *             properties:
 *               work_orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - wo_id
 *                     - warehouse_id
 *                   properties:
 *                     wo_id:
 *                       type: string
 *                     warehouse_id:
 *                       type: string
 *               issued_by:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bulk issue completed
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/bulk-issue', bulkIssueForWorkOrders);

// ======================================================
// SWAGGER COMPONENTS
// ======================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     MaterialIssueVoucher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f123456789abcdef123457"
 *         miv_number:
 *           type: string
 *           example: "MIV-202504-0001"
 *         miv_date:
 *           type: string
 *           format: date-time
 *         wo_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             wo_number:
 *               type: string
 *             status:
 *               type: string
 *             part_no:
 *               type: string
 *             part_name:
 *               type: string
 *             planned_qty:
 *               type: number
 *         wo_number:
 *           type: string
 *         so_number:
 *           type: string
 *         customer_name:
 *           type: string
 *         department:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             DepartmentName:
 *               type: string
 *             Description:
 *               type: string
 *         department_name:
 *           type: string
 *           description: Denormalized department name for quick display
 *         issued_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             FirstName:
 *               type: string
 *             LastName:
 *               type: string
 *             EmployeeID:
 *               type: string
 *         received_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             FirstName:
 *               type: string
 *             LastName:
 *               type: string
 *             EmployeeID:
 *               type: string
 *         authorised_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             Username:
 *               type: string
 *             Email:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               item_id:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   part_no:
 *                     type: string
 *                   part_description:
 *                     type: string
 *               part_no:
 *                 type: string
 *               item_description:
 *                 type: string
 *               bom_required_qty:
 *                 type: number
 *               issued_qty:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [Nos, Kg, Meter, Sheet, Roll]
 *               warehouse_id:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   warehouse_id:
 *                     type: string
 *                   warehouse_name:
 *                     type: string
 *               bin_id:
 *                 type: string
 *               batch_no:
 *                 type: string
 *               heat_no:
 *                 type: string
 *               unit_cost:
 *                 type: number
 *               total_cost:
 *                 type: number
 *               returned_qty:
 *                 type: number
 *               net_consumed_qty:
 *                 type: number
 *         total_issue_cost:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Draft, Issued, Partially Returned, Fully Returned, Closed, Cancelled]
 *         remarks:
 *           type: string
 *         created_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             Username:
 *               type: string
 *             Email:
 *               type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         posted_at:
 *           type: string
 *           format: date-time
 */

module.exports = router;