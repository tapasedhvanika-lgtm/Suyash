// routes/Inventory/materialReturnRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMaterialReturnVoucher,
  updateMaterialReturnVoucher,        // Add this
  postMaterialReturnVoucher,
  getMaterialReturnVoucher,
  listMaterialReturnVouchers,
  getMRVByMIV,
  getMRVByWorkOrder,
  cancelMaterialReturnVoucher,
  deleteMaterialReturnVoucher,            
  getMRVPrintData
} = require('../../controllers/Inventory/materialReturnController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Material Return Voucher (MRV)
 *   description: Material Return Voucher management - returning unused materials to store
 */

// ======================================================
// CREATE MRV APIs
// ======================================================

/**
 * @swagger
 * /api/mrv:
 *   post:
 *     summary: Create a new Material Return Voucher (Draft)
 *     description: |
 *       Creates a draft MRV for returning unused materials to store.
 *       Materials are not added back to stock until MRV is posted.
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - miv_id
 *               - items
 *               - returned_by
 *             properties:
 *               miv_id:
 *                 type: string
 *                 description: Original MIV ID
 *                 example: "65f123456789abcdef123457"
 *               returned_by:
 *                 type: string
 *                 description: Employee ID of production person returning material
 *                 example: "prod_sup_001"
 *               received_by:
 *                 type: string
 *                 description: Employee ID of store person accepting return
 *                 example: "store_keeper_001"
 *               condition:
 *                 type: string
 *                 enum: [Good, Partially Damaged, Scrap]
 *                 default: Good
 *                 description: |
 *                   Good - returned to RM store
 *                   Partially Damaged - sent to Quarantine warehouse for QC
 *                   Scrap - sent to Scrap warehouse
 *               items:
 *                 type: array
 *                 description: List of materials to return
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - part_no
 *                     - returned_qty
 *                   properties:
 *                     item_id:
 *                       type: string
 *                       example: "item_copper_001"
 *                     part_no:
 *                       type: string
 *                       example: "COPPER-001"
 *                     returned_qty:
 *                       type: number
 *                       example: 5
 *                       minimum: 0.001
 *                     warehouse_id:
 *                       type: string
 *                       description: Destination warehouse (overrides default based on condition)
 *                       example: "WH-RM-001"
 *                     bin_id:
 *                       type: string
 *                       example: "RACK-A-01"
 *               remarks:
 *                 type: string
 *                 maxLength: 500
 *                 example: "5 kg copper unused after setup - returned to store"
 *     responses:
 *       201:
 *         description: MRV created successfully
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
 *                   example: "Material Return Voucher created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mrv_number:
 *                       type: string
 *                       example: "MRV-202504-0001"
 *                     mrv_id:
 *                       type: string
 *                       example: "65f123456789abcdef123458"
 *                     total_return_value:
 *                       type: number
 *                       example: 2500
 *                     status:
 *                       type: string
 *                       example: "Draft"
 *                     next_step:
 *                       type: string
 *                       example: "POST /api/mrv/:id/post to process return and update stock"
 *       400:
 *         description: Validation error - exceeds issued quantity
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Original MIV not found
 *       500:
 *         description: Server error
 */
router.post('/', createMaterialReturnVoucher);

// ======================================================
// POST (PROCESS) MRV APIs
// ======================================================

/**
 * @swagger
 * /api/mrv/{id}/post:
 *   post:
 *     summary: Post MRV - Process return and update stock
 *     description: |
 *       Posts a draft MRV. This operation:
 *       - Adds stock back to Stock Ledger (to appropriate warehouse based on condition)
 *       - Creates StockTransaction records
 *       - Updates original MIV with returned quantities
 *       - Updates Work Order actual_rm_cost
 *       - Changes MRV status from Draft to Posted
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRV ID
 *     responses:
 *       200:
 *         description: Materials returned successfully
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
 *                   example: "Materials returned successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mrv_number:
 *                       type: string
 *                       example: "MRV-202504-0001"
 *                     wo_number:
 *                       type: string
 *                       example: "WO-202504-0001"
 *                     total_return_value:
 *                       type: number
 *                       example: 2500
 *                     updated_rm_cost:
 *                       type: number
 *                       example: 24500
 *                     transactions_count:
 *                       type: number
 *                       example: 1
 *                     condition:
 *                       type: string
 *                       example: "Good"
 *                     destination_warehouse:
 *                       type: string
 *                       example: "WH-RM-001"
 *                     status:
 *                       type: string
 *                       example: "Posted"
 *       400:
 *         description: MRV already posted
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MRV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/post', postMaterialReturnVoucher);

/**
 * @swagger
 * /api/mrv/{id}/cancel:
 *   post:
 *     summary: Cancel draft MRV
 *     description: Cancels a draft MRV (cannot cancel posted MRV)
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRV ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Return cancelled - material required for rework"
 *     responses:
 *       200:
 *         description: MRV cancelled successfully
 *       400:
 *         description: Cannot cancel posted MRV
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MRV not found
 *       500:
 *         description: Server error
 */
router.post('/:id/cancel', cancelMaterialReturnVoucher);

// ======================================================
// GET MRV APIs
// ======================================================

/**
 * @swagger
 * /api/mrv:
 *   get:
 *     summary: List all Material Return Vouchers with filters
 *     description: Returns paginated list of MRVs with optional filters
 *     tags: [Material Return Voucher (MRV)]
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
 *         name: miv_id
 *         schema:
 *           type: string
 *         description: Filter by original MIV ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Returned, Posted]
 *         description: Filter by MRV status
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [Good, Partially Damaged, Scrap]
 *         description: Filter by material condition
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for mrv_date filter
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for mrv_date filter
 *     responses:
 *       200:
 *         description: MRVs retrieved successfully
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
 *                     $ref: '#/components/schemas/MaterialReturnVoucher'
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
router.get('/', listMaterialReturnVouchers);

/**
 * @swagger
 * /api/mrv/{id}:
 *   get:
 *     summary: Get Material Return Voucher by ID
 *     description: Returns complete MRV details including all items and populated references
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRV ID
 *     responses:
 *       200:
 *         description: MRV retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MaterialReturnVoucher'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MRV not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getMaterialReturnVoucher);

// Add these routes to your existing routes file

// ======================================================
// UPDATE MRV API
// ======================================================

/**
 * @swagger
 * /api/mrv/{id}:
 *   put:
 *     summary: Update draft Material Return Voucher
 *     description: Updates an existing draft MRV. Cannot update posted MRVs.
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRV ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: Updated items list
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_id:
 *                       type: string
 *                     part_no:
 *                       type: string
 *                     returned_qty:
 *                       type: number
 *                     warehouse_id:
 *                       type: string
 *                     bin_id:
 *                       type: string
 *               condition:
 *                 type: string
 *                 enum: [Good, Partially Damaged, Scrap]
 *               returned_by:
 *                 type: string
 *               received_by:
 *                 type: string
 *               remarks:
 *                 type: string
 *               mrv_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: MRV updated successfully
 *       400:
 *         description: Cannot update posted MRV or validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MRV not found
 */
router.put('/:id', updateMaterialReturnVoucher);

// ======================================================
// DELETE MRV APIs
// ======================================================

/**
 * @swagger
 * /api/mrv/{id}:
 *   delete:
 *     summary: Delete Material Return Voucher
 *     description: |
 *       Deletes an MRV. For draft MRVs - simple deletion.
 *       For posted MRVs - requires force_delete=true to reverse stock transactions.
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRV ID
 *       - in: query
 *         name: force_delete
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force delete posted MRV (reverses stock transactions)
 *     responses:
 *       200:
 *         description: MRV deleted successfully
 *       400:
 *         description: Cannot delete posted MRV without force_delete
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MRV not found
 */
router.delete('/:id', deleteMaterialReturnVoucher);


/**
 * @swagger
 * /api/mrv/by-miv/{miv_id}:
 *   get:
 *     summary: Get all MRVs for a specific MIV
 *     description: Returns all returns against a specific Material Issue Voucher
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: miv_id
 *         required: true
 *         schema:
 *           type: string
 *         description: MIV ID
 *     responses:
 *       200:
 *         description: MRVs retrieved successfully
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
 *                     miv_id:
 *                       type: string
 *                     miv_number:
 *                       type: string
 *                     returns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaterialReturnVoucher'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_returns:
 *                           type: number
 *                         total_returned_qty:
 *                           type: object
 *                         total_return_value:
 *                           type: number
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/by-miv/:miv_id', getMRVByMIV);

/**
 * @swagger
 * /api/mrv/by-workorder/{wo_id}:
 *   get:
 *     summary: Get all MRVs for a specific Work Order
 *     description: Returns all returns against a Work Order (across all MIVs)
 *     tags: [Material Return Voucher (MRV)]
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
 *         description: MRVs retrieved successfully
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
 *                       type: string
 *                     returns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MaterialReturnVoucher'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_returns:
 *                           type: number
 *                         total_return_value:
 *                           type: number
 *                         by_condition:
 *                           type: object
 *                           properties:
 *                             Good:
 *                               type: number
 *                             Partially Damaged:
 *                               type: number
 *                             Scrap:
 *                               type: number
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/by-workorder/:wo_id', getMRVByWorkOrder);

/**
 * @swagger
 * /api/mrv/{id}/print:
 *   get:
 *     summary: Get MRV data formatted for printing
 *     description: Returns MRV data in a print-friendly format for physical document
 *     tags: [Material Return Voucher (MRV)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRV ID
 *     responses:
 *       200:
 *         description: Print data retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: MRV not found
 *       500:
 *         description: Server error
 */
router.get('/:id/print', getMRVPrintData);

// ======================================================
// SWAGGER COMPONENTS
// ======================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     MaterialReturnVoucher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         mrv_number:
 *           type: string
 *           example: "MRV-202504-0001"
 *         mrv_date:
 *           type: string
 *           format: date-time
 *         miv_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             miv_number:
 *               type: string
 *             total_issue_cost:
 *               type: number
 *         miv_number:
 *           type: string
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
 *         wo_number:
 *           type: string
 *         returned_by:
 *           type: object
 *           properties:
 *             FirstName:
 *               type: string
 *             LastName:
 *               type: string
 *             EmployeeID:
 *               type: string
 *         received_by:
 *           type: object
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               item_id:
 *                 type: object
 *               part_no:
 *                 type: string
 *               returned_qty:
 *                 type: number
 *               unit:
 *                 type: string
 *               warehouse_id:
 *                 type: object
 *               bin_id:
 *                 type: string
 *               batch_no:
 *                 type: string
 *               unit_cost:
 *                 type: number
 *               total_value:
 *                 type: number
 *         total_return_value:
 *           type: number
 *         condition:
 *           type: string
 *           enum: [Good, Partially Damaged, Scrap]
 *         status:
 *           type: string
 *           enum: [Draft, Returned, Posted]
 *         remarks:
 *           type: string
 *         created_by:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         posted_at:
 *           type: string
 *           format: date-time
 */

module.exports = router;