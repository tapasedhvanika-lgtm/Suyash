// routes/Dispatch/deliveryScheduleRoutes.js
const express = require('express');
const router = express.Router();
const deliveryScheduleController = require('../../controllers/Dispatch/deliveryScheduleController');

// Dummy authentication for testing
const authenticate = (req, res, next) => {
  req.user = { _id: 'test_user_id' };
  next();
};

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
router.post('/', deliveryScheduleController.createDeliverySchedule);

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
router.get('/', deliveryScheduleController.listDeliverySchedules);

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
router.put('/:id/confirm', deliveryScheduleController.confirmDeliverySchedule);

module.exports = router;