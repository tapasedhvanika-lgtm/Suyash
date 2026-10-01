// routes/Dispatch/packingListRoutes.js
const express = require('express');
const router = express.Router();
const packingListController = require('../../controllers/Dispatch/packingListController');

// Dummy authentication for testing
const authenticate = (req, res, next) => {
  req.user = { _id: 'test_user_id' };
  next();
};

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dispatch - Packing List
 *   description: Packing list management for Delivery Challans
 */


/**
 * @swagger
 * /api/packing-lists:
 *   get:
 *     summary: List all packing lists with filters
 *     tags: [Dispatch - Packing List]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dc_id
 *         schema:
 *           type: string
 *         description: Filter by Delivery Challan ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Completed, Verified]
 *         description: Filter by status
 *       - in: query
 *         name: packed_by
 *         schema:
 *           type: string
 *         description: Filter by employee ID who packed
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (pl_date)
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (pl_date)
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
 *         description: List of packing lists
 *       401:
 *         description: Unauthorized
 */
router.get('/', packingListController.listPackingLists); // 👈 NEW

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
router.post('/', packingListController.createPackingList);

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
router.put('/:id', packingListController.updatePackingList);

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
router.get('/dc/:dcId', packingListController.getPackingListByDC);

module.exports = router;