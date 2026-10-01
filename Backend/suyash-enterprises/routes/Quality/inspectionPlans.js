// routes/Quality/inspectionPlanRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPlan,
  getAllPlans,
  getPlanById,
  getPlansByItem,
  updatePlan,
  submitForApproval,
  approvePlan,
  rejectPlan,
} = require('../../controllers/Quality/inspectionPlanController');

const { protect, authorize } = require('../../middleware/authMiddleware');
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Inspection Plans
 *   description: Quality inspection plan management for items/parts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InspectionCheckpoint:
 *       type: object
 *       properties:
 *         step_no:
 *           type: number
 *         characteristic:
 *           type: string
 *         specification:
 *           type: string
 *         method:
 *           type: string
 *         sample_size:
 *           type: number
 *         frequency:
 *           type: string
 *         gauge_id:
 *           type: string
 *         is_critical:
 *           type: boolean
 *         acceptance_criteria:
 *           type: string
 *         notes:
 *           type: string
 *
 *     InspectionPlan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         plan_id:
 *           type: string
 *         plan_name:
 *           type: string
 *         plan_code:
 *           type: string
 *         plan_type:
 *           type: string
 *           enum: ['Incoming', 'In-Process', 'Final', 'Outgoing', 'Sample']
 *         item_id:
 *           type: object
 *         approval_status:
 *           type: string
 *           enum: ['Pending', 'Pending Approval', 'Approved', 'Rejected']
 *         is_active:
 *           type: boolean
 *         checkpoints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InspectionCheckpoint'
 *
 *     CreateInspectionPlan:
 *       type: object
 *       required:
 *         - plan_name
 *         - plan_type
 *         - item_id
 *         - checkpoints
 *       properties:
 *         plan_name:
 *           type: string
 *         plan_code:
 *           type: string
 *         plan_type:
 *           type: string
 *           enum: ['Incoming', 'In-Process', 'Final', 'Outgoing', 'Sample']
 *         item_id:
 *           type: string
 *         revision_no:
 *           type: number
 *         revision_date:
 *           type: string
 *           format: date
 *         checkpoints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InspectionCheckpoint'
 *         aql_level:
 *           type: string
 *         sampling_plan:
 *           type: string
 *         instructions:
 *           type: string
 *         is_active:
 *           type: boolean
 *
 *     ApprovePlan:
 *       type: object
 *       required:
 *         - approved_by
 *       properties:
 *         approved_by:
 *           type: string
 *         effective_from:
 *           type: string
 *           format: date
 *
 *     RejectPlan:
 *       type: object
 *       required:
 *         - rejected_by
 *       properties:
 *         rejected_by:
 *           type: string
 *         rejection_reason:
 *           type: string
 *
 *     SubmitForApproval:
 *       type: object
 *       properties:
 *         submitted_by:
 *           type: string
 *
 *   parameters:
 *     planIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Inspection Plan ID
 *     itemIdParam:
 *       in: path
 *       name: item_id
 *       required: true
 *       schema:
 *         type: string
 *       description: Item ID
 */

// ======================================================
// CREATE
// ======================================================

/**
 * @swagger
 * /api/inspection-plans:
 *   post:
 *     summary: Create a new inspection plan
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInspectionPlan'
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Invalid gauge_ids or critical checkpoint missing gauge
 *       500:
 *         description: Server error
 */
router.post('/', createPlan);

// ======================================================
// GET ALL (with filters)
// ======================================================

/**
 * @swagger
 * /api/inspection-plans:
 *   get:
 *     summary: Get all inspection plans with optional filters
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: plan_type
 *         schema:
 *           type: string
 *           enum: ['Incoming', 'In-Process', 'Final', 'Outgoing', 'Sample']
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', getAllPlans);

// ======================================================
// GET BY ITEM — must come before /:id
// ======================================================

/**
 * @swagger
 * /api/inspection-plans/by-item/{item_id}:
 *   get:
 *     summary: Get latest active inspection plans by item (one per plan_type)
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/itemIdParam'
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/by-item/:item_id', getPlansByItem);

// ======================================================
// GET BY ID
// ======================================================

/**
 * @swagger
 * /api/inspection-plans/{id}:
 *   get:
 *     summary: Get inspection plan by ID
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/planIdParam'
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getPlanById);

// ======================================================
// UPDATE
// ======================================================

/**
 * @swagger
 * /api/inspection-plans/{id}:
 *   put:
 *     summary: Update an inspection plan
 *     description: If checkpoints are updated on an already-approved plan, a new version is created and the old plan is superseded.
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/planIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInspectionPlan'
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       201:
 *         description: New plan version created (previous superseded)
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updatePlan);

// ======================================================
// SUBMIT FOR APPROVAL
// ======================================================

/**
 * @swagger
 * /api/inspection-plans/{id}/submit:
 *   post:
 *     summary: Submit an inspection plan for approval
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/planIdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitForApproval'
 *     responses:
 *       200:
 *         description: Plan submitted for approval
 *       400:
 *         description: Plan not in Pending status or has no checkpoints
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.post('/:id/submit', submitForApproval);

// ======================================================
// APPROVE
// ======================================================

/**
 * @swagger
 * /api/inspection-plans/{id}/approve:
 *   post:
 *     summary: Approve an inspection plan
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/planIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovePlan'
 *     responses:
 *       200:
 *         description: Plan approved
 *       400:
 *         description: Already approved, rejected, or has no checkpoints
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.post('/:id/approve', approvePlan);

// ======================================================
// REJECT
// ======================================================

/**
 * @swagger
 * /api/inspection-plans/{id}/reject:
 *   post:
 *     summary: Reject an inspection plan
 *     tags: [Inspection Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/planIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectPlan'
 *     responses:
 *       200:
 *         description: Plan rejected
 *       400:
 *         description: Plan is not in Pending Approval status
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Server error
 */
router.post('/:id/reject', rejectPlan);

module.exports = router;