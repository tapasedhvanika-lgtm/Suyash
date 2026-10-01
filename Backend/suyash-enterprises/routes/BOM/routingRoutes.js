const express = require('express');
const router = express.Router();
const {
  createRouting,
  getRoutings,
  getRoutingById,
  getRoutingsByItem,
  updateRouting,
  activateRouting,
  approveRouting,
  rejectRouting,
  deleteRouting
} = require('../../controllers/BOM/routingController');
const { protect, authorize } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Routing
 *   description: Process routing management - Phase 04
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RoutingOperation:
 *       type: object
 *       required:
 *         - op_sequence
 *         - operation_id
 *         - operation_name
 *         - work_centre
 *         - planned_run_min
 *       properties:
 *         op_sequence:
 *           type: integer
 *           example: 10
 *           description: "Operation sequence: 10, 20, 30 ... Gaps allow inserting steps later."
 *         operation_id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         operation_name:
 *           type: string
 *           example: "Sawing"
 *         work_centre:
 *           type: string
 *           example: "Sawing Bay"
 *         machine_id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7c5"
 *         is_subcontract:
 *           type: boolean
 *           default: false
 *         subcontract_vendor:
 *           type: string
 *         planned_setup_min:
 *           type: number
 *           example: 15
 *           default: 0
 *         planned_run_min:
 *           type: number
 *           example: 2.5
 *         scrap_pct:
 *           type: number
 *           example: 0.5
 *           default: 0
 *         description:
 *           type: string
 *
 *     RoutingCreateRequest:
 *       type: object
 *       required:
 *         - routing_name
 *         - routing_type
 *         - operations
 *       properties:
 *         routing_name:
 *           type: string
 *           example: "Copper Busbar Standard Route"
 *         routing_type:
 *           type: string
 *           enum: [Stamping, Busbar, Gasket, Assembly, Toolroom, General]
 *           example: "Busbar"
 *         applicable_items:
 *           type: array
 *           items:
 *             type: string
 *         operations:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/RoutingOperation'
 *         version:
 *           type: string
 *           default: "1.0"
 *
 *     Routing:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         routing_id:
 *           type: string
 *           example: "RTG-202503-0001"
 *         routing_name:
 *           type: string
 *         routing_type:
 *           type: string
 *         applicable_items:
 *           type: array
 *           items:
 *             type: object
 *         operations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoutingOperation'
 *         total_cycle_time_min:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Draft, Active, Approved, Rejected]
 *           description: |
 *             Draft    — Newly created, not yet activated. Cannot approve/reject.
 *             Active   — Activated, ready for approve/reject review.
 *             Approved — Engineering-approved for production. Cannot be edited.
 *             Rejected — Failed review. Edit then re-activate before re-approving.
 *         approved_by:
 *           type: object
 *         approved_at:
 *           type: string
 *           format: date-time
 *         rejected_by:
 *           type: object
 *         rejected_at:
 *           type: string
 *           format: date-time
 *         rejection_reason:
 *           type: string
 *         is_active:
 *           type: boolean
 *           description: "Soft-delete flag. Completely separate from status/approval flow."
 *         version:
 *           type: string
 *         created_by:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     RoutingNotFound:
 *       description: Routing not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Routing not found"
 */

router.use(protect);

/**
 * @swagger
 * /api/routings:
 *   get:
 *     summary: Get all routings with pagination and filtering
 *     tags: [Routing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: routing_type
 *         schema:
 *           type: string
 *           enum: [Stamping, Busbar, Gasket, Assembly, Toolroom, General]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Active, Approved, Rejected]
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: applicable_item
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Routings retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', getRoutings);

/**
 * @swagger
 * /api/routings/by-item/{item_id}:
 *   get:
 *     summary: Get all active routings for a specific item
 *     tags: [Routing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Routings retrieved successfully
 */
router.get('/by-item/:item_id', getRoutingsByItem);

/**
 * @swagger
 * /api/routings/{id}:
 *   get:
 *     summary: Get routing by ID
 *     tags: [Routing]
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
 *         description: Routing retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Routing'
 *       404:
 *         $ref: '#/components/responses/RoutingNotFound'
 */
router.get('/:id', getRoutingById);

/**
 * @swagger
 * /api/routings:
 *   post:
 *     summary: Create a new routing (status = Draft)
 *     tags: [Routing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoutingCreateRequest'
 *     responses:
 *       201:
 *         description: Routing created successfully with status Draft
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', createRouting);

/**
 * @swagger
 * /api/routings/{id}:
 *   put:
 *     summary: Update routing
 *     description: |
 *       Allowed statuses for editing: Draft, Active, Rejected.
 *       Approved routings are LOCKED — reject first, then edit.
 *       If a Rejected routing's operations are updated, status resets to Draft.
 *     tags: [Routing]
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
 *               routing_name:
 *                 type: string
 *               routing_type:
 *                 type: string
 *               applicable_items:
 *                 type: array
 *               operations:
 *                 type: array
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Routing updated successfully
 *       400:
 *         description: Validation error or routing is Approved/Deactivated
 *       404:
 *         $ref: '#/components/responses/RoutingNotFound'
 */
router.put('/:id', updateRouting);

/**
 * @swagger
 * /api/routings/{id}/activate:
 *   post:
 *     summary: Activate routing (Draft → Active, or Rejected → Active)
 *     description: |
 *       Moves routing to Active status, making it eligible for Approve/Reject.
 *       Use after creating (Draft) or after correcting a Rejected routing.
 *     tags: [Routing]
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
 *         description: Routing activated successfully
 *       400:
 *         description: Already Active, already Approved, or deactivated
 *       404:
 *         $ref: '#/components/responses/RoutingNotFound'
 */
router.post('/:id/activate', activateRouting);

/**
 * @swagger
 * /api/routings/{id}/approve:
 *   post:
 *     summary: Approve routing for production use (Active → Approved)
 *     description: |
 *       Routing MUST be in Active status to be approved.
 *       Draft routings cannot be approved — activate first.
 *       Rejected routings cannot be approved — re-activate first.
 *     tags: [Routing]
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
 *         description: Routing approved successfully
 *       400:
 *         description: Routing is not Active (Draft / already Approved / Rejected / deactivated)
 *       404:
 *         $ref: '#/components/responses/RoutingNotFound'
 */
router.post('/:id/approve', approveRouting);

/**
 * @swagger
 * /api/routings/{id}/reject:
 *   post:
 *     summary: Reject routing (Active or Approved → Rejected)
 *     description: |
 *       Rejects an Active or Approved routing. rejection_reason is required.
 *       After rejection, user must edit the routing and re-activate it before
 *       re-submitting for approval.
 *     tags: [Routing]
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
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 example: "Run times are incorrect for CNC drilling operation. Please revise."
 *     responses:
 *       200:
 *         description: Routing rejected successfully
 *       400:
 *         description: |
 *           routing is Draft (cannot reject draft) /
 *           already Rejected /
 *           deactivated /
 *           rejection_reason missing
 *       404:
 *         $ref: '#/components/responses/RoutingNotFound'
 */
router.post('/:id/reject', rejectRouting);

/**
 * @swagger
 * /api/routings/{id}:
 *   delete:
 *     summary: Deactivate routing — soft delete (sets is_active = false)
 *     description: |
 *       is_active is a SOFT-DELETE flag, completely separate from status/approval.
 *       Only deactivates if no open Work Orders reference this routing.
 *     tags: [Routing]
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
 *         description: Routing deactivated successfully
 *       400:
 *         description: Cannot deactivate — used in open Work Order
 *       404:
 *         description: Routing not found
 */
router.delete('/:id', deleteRouting);

module.exports = router;