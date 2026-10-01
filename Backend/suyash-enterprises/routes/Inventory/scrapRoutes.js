// routes/Inventory/scrapRoutes.js
const express = require('express');
const router = express.Router();
const {
  createScrapRecord,
  recordScrapSale,
  getScrapRecord,
  getScrapByWorkOrder,
  getScrapSummary,
  listScrapRecords,
  updateScrapRecord
} = require('../../controllers/Inventory/scrapController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Scrap Record
 *   description: Scrap management - recording production waste material for recovery value
 */

// ======================================================
// CREATE SCRAP APIs
// ======================================================

/**
 * @swagger
 * /api/scrap-records:
 *   post:
 *     summary: Create a new scrap record
 *     description: |
 *       Records scrap generated during production. This can be from:
 *       - Punching skeleton (copper/brass frame left after stamping)
 *       - Offcuts (edge trim from sheet cutting)
 *       - Rejected pieces (failed QC parts)
 *       - Machining chips (lathe/milling waste)
 *       - Flash (rubber gasket moulding excess)
 *       
 *       When from_warehouse_id is provided, stock automatically moves to Scrap Warehouse.
 *     tags: [Scrap Record]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scrap_qty
 *               - unit
 *               - scrap_type
 *             properties:
 *               wo_id:
 *                 type: string
 *                 description: Work Order ID (if scrap is from production)
 *                 example: "65f123456789abcdef123456"
 *               wo_number:
 *                 type: string
 *                 example: "WO-202504-0001"
 *               op_sequence:
 *                 type: number
 *                 description: Operation sequence where scrap occurred
 *                 example: 10
 *               operation_name:
 *                 type: string
 *                 example: "Stamping"
 *               item_id:
 *                 type: string
 *                 description: Parent item being produced
 *                 example: "item_busbar_001"
 *               part_no:
 *                 type: string
 *                 example: "BUS-10X50-200"
 *               scrap_material_id:
 *                 type: string
 *                 description: Scrap material item (if different from parent)
 *                 example: "item_copper_scrap_001"
 *               scrap_material_code:
 *                 type: string
 *                 example: "COPPER-SCRAP-CLEAN"
 *               scrap_qty:
 *                 type: number
 *                 required: true
 *                 minimum: 0.001
 *                 example: 75
 *               scrap_weight_kg:
 *                 type: number
 *                 description: Weight in kg (for weight-based items)
 *                 example: 75
 *               unit:
 *                 type: string
 *                 required: true
 *                 enum: [Nos, Kg, Meter, Sheet, Roll]
 *                 example: "Kg"
 *               scrap_type:
 *                 type: string
 *                 required: true
 *                 enum: [Punching Skeleton, Offcut, Rejected Piece, Grinding Swarf, Machining Chip, Flash, Other]
 *                 example: "Punching Skeleton"
 *               scrap_grade:
 *                 type: string
 *                 description: Material grade for valuation
 *                 example: "Copper C11000 Clean"
 *               estimated_scrap_rate:
 *                 type: number
 *                 description: Current market rate per unit (Rs)
 *                 example: 720
 *               scrap_realisation_pct:
 *                 type: number
 *                 default: 100
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Percentage of value recoverable (e.g., 80% for mixed scrap)
 *                 example: 100
 *               from_warehouse_id:
 *                 type: string
 *                 description: Source warehouse (WIP or RM) - triggers stock transaction
 *                 example: "65f123456789abcdef123457"
 *               batch_no:
 *                 type: string
 *                 example: "COIL-2025-001"
 *               remarks:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Skeleton from 1000 pcs busbar stamping"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs of scrap photos for verification
 *     responses:
 *       201:
 *         description: Scrap record created successfully
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
 *                   example: "Scrap record created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     scrap_id:
 *                       type: string
 *                       example: "SCR-202504-0001"
 *                     scrap_qty:
 *                       type: number
 *                       example: 75
 *                     estimated_value:
 *                       type: number
 *                       example: 54000
 *                     status:
 *                       type: string
 *                       example: "Generated"
 *                     next_step:
 *                       type: string
 *                       example: "POST /api/scrap-records/:id/sold to record sale"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Work Order not found
 *       500:
 *         description: Server error
 */
router.post('/', createScrapRecord);

// ======================================================
// SCRAP SALE APIs
// ======================================================

/**
 * @swagger
 * /api/scrap-records/{id}/sold:
 *   put:
 *     summary: Record scrap sale to recycler
 *     description: |
 *       Marks scrap as sold and records actual recovery value.
 *       Updates job costing with actual scrap credit.
 *     tags: [Scrap Record]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scrap record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actual_value
 *               - sold_to
 *             properties:
 *               actual_value:
 *                 type: number
 *                 required: true
 *                 minimum: 0
 *                 description: Actual amount received from scrap dealer
 *                 example: 54750
 *               sold_to:
 *                 type: string
 *                 required: true
 *                 description: Scrap dealer / recycler name
 *                 example: "Mumbai Metal Recyclers"
 *               sold_date:
 *                 type: string
 *                 format: date
 *                 description: Date of sale (defaults to today)
 *                 example: "2025-04-15"
 *               invoice_number:
 *                 type: string
 *                 description: Sale invoice number
 *                 example: "INV-MMR-2025-089"
 *               remarks:
 *                 type: string
 *                 example: "Sold at ₹730/kg"
 *     responses:
 *       200:
 *         description: Scrap sale recorded successfully
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
 *                   example: "Scrap sale recorded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     scrap_id:
 *                       type: string
 *                       example: "SCR-202504-0001"
 *                     actual_value:
 *                       type: number
 *                       example: 54750
 *                     sold_to:
 *                       type: string
 *                       example: "Mumbai Metal Recyclers"
 *                     sold_date:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       example: "Sold"
 *       400:
 *         description: Scrap already sold or invalid data
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Scrap record not found
 *       500:
 *         description: Server error
 */
router.put('/:id/sold', recordScrapSale);

// ======================================================
// UPDATE SCRAP APIs
// ======================================================

/**
 * @swagger
 * /api/scrap-records/{id}:
 *   put:
 *     summary: Update scrap record (only for unsold scrap)
 *     description: Updates scrap details. Cannot update sold scrap.
 *     tags: [Scrap Record]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scrap record ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scrap_qty:
 *                 type: number
 *                 example: 80
 *               scrap_weight_kg:
 *                 type: number
 *                 example: 80
 *               scrap_type:
 *                 type: string
 *                 enum: [Punching Skeleton, Offcut, Rejected Piece, Grinding Swarf, Machining Chip, Flash, Other]
 *               scrap_grade:
 *                 type: string
 *               estimated_scrap_rate:
 *                 type: number
 *                 example: 750
 *               scrap_realisation_pct:
 *                 type: number
 *                 example: 100
 *               remarks:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Scrap record updated successfully
 *       400:
 *         description: Cannot update sold scrap
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Scrap record not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateScrapRecord);

// ======================================================
// GET SCRAP APIs
// ======================================================

/**
 * @swagger
 * /api/scrap-records:
 *   get:
 *     summary: List all scrap records with filters
 *     description: Returns paginated list of scrap records with optional filters
 *     tags: [Scrap Record]
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
 *           enum: [Generated, In Scrap Store, Sold, Scrapped]
 *         description: Filter by scrap status
 *       - in: query
 *         name: scrap_type
 *         schema:
 *           type: string
 *           enum: [Punching Skeleton, Offcut, Rejected Piece, Grinding Swarf, Machining Chip, Flash, Other]
 *         description: Filter by scrap type
 *       - in: query
 *         name: wo_id
 *         schema:
 *           type: string
 *         description: Filter by Work Order ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for scrap_date filter
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for scrap_date filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by scrap_id, part_no, or wo_number
 *     responses:
 *       200:
 *         description: Scrap records retrieved successfully
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
 *                     $ref: '#/components/schemas/ScrapRecord'
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
router.get('/', listScrapRecords);

/**
 * @swagger
 * /api/scrap-records/summary:
 *   get:
 *     summary: Get scrap summary dashboard data
 *     description: Returns aggregated scrap statistics by type and period
 *     tags: [Scrap Record]
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
 *         name: scrap_type
 *         schema:
 *           type: string
 *         description: Filter by specific scrap type
 *     responses:
 *       200:
 *         description: Scrap summary retrieved successfully
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
 *                     by_type:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           total_qty:
 *                             type: number
 *                           total_weight:
 *                             type: number
 *                           total_estimated_value:
 *                             type: number
 *                           total_actual_value:
 *                             type: number
 *                           records_count:
 *                             type: number
 *                     totals:
 *                       type: object
 *                       properties:
 *                         total_qty:
 *                           type: number
 *                         total_weight:
 *                           type: number
 *                         total_estimated_value:
 *                           type: number
 *                         total_actual_value:
 *                           type: number
 *                         total_records:
 *                           type: number
 *                     pending_scrap:
 *                       type: object
 *                       properties:
 *                         total_qty:
 *                           type: number
 *                         total_weight:
 *                           type: number
 *                         total_value:
 *                           type: number
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/summary', getScrapSummary);

/**
 * @swagger
 * /api/scrap-records/{id}:
 *   get:
 *     summary: Get scrap record by ID
 *     description: Returns complete scrap record details
 *     tags: [Scrap Record]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scrap record ID
 *     responses:
 *       200:
 *         description: Scrap record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ScrapRecord'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Scrap record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getScrapRecord);

/**
 * @swagger
 * /api/scrap-records/by-wo/{wo_id}:
 *   get:
 *     summary: Get all scrap records for a Work Order
 *     description: Returns all scrap generated during a specific Work Order with summary
 *     tags: [Scrap Record]
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
 *         description: Scrap records retrieved successfully
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
 *                     $ref: '#/components/schemas/ScrapRecord'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_scrap_qty:
 *                       type: number
 *                     total_scrap_weight:
 *                       type: number
 *                     total_estimated_value:
 *                       type: number
 *                     total_actual_value:
 *                       type: number
 *                     by_type:
 *                       type: object
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/by-wo/:wo_id', getScrapByWorkOrder);

// ======================================================
// SWAGGER COMPONENTS
// ======================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     ScrapRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         scrap_id:
 *           type: string
 *           example: "SCR-202504-0001"
 *         scrap_date:
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
 *         wo_number:
 *           type: string
 *         op_sequence:
 *           type: number
 *         operation_name:
 *           type: string
 *         item_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             part_no:
 *               type: string
 *         part_no:
 *           type: string
 *         scrap_material_id:
 *           type: object
 *         scrap_material_code:
 *           type: string
 *         scrap_qty:
 *           type: number
 *         scrap_weight_kg:
 *           type: number
 *         unit:
 *           type: string
 *         scrap_type:
 *           type: string
 *         scrap_grade:
 *           type: string
 *         estimated_scrap_rate:
 *           type: number
 *         estimated_scrap_value:
 *           type: number
 *         scrap_realisation_pct:
 *           type: number
 *         actual_scrap_value:
 *           type: number
 *         sold_to:
 *           type: string
 *         sold_date:
 *           type: string
 *           format: date
 *         invoice_number:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Generated, In Scrap Store, Sold, Scrapped]
 *         remarks:
 *           type: string
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *         created_by:
 *           type: object
 *         recorded_by:
 *           type: object
 *         verified_by:
 *           type: object
 *         verified_at:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;