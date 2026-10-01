// routes/Dispatch/customerReturnRoutes.js
const express = require('express');
const router = express.Router();
const customerReturnController = require('../../controllers/Dispatch/customerReturnController');

// Dummy authentication for testing
const authenticate = (req, res, next) => {
  req.user = { _id: 'test_user_id' };
  next();
};

router.use(authenticate);

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
router.post('/', customerReturnController.initiateReturn);

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
router.get('/', customerReturnController.listReturns);

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
router.put('/:id/receive', customerReturnController.receiveReturn);

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
router.put('/:id/inspect', customerReturnController.inspectReturn);

module.exports = router;