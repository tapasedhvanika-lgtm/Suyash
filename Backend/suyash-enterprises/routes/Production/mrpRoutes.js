'use strict';
const express = require('express');
const router  = express.Router();
const {
  triggerMrpRun,
  listMrpRuns,
  getMrpRunById,
  getMrpRunStatus,
  deleteMrpRun,
} = require('../../controllers/Production/mrpController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: MRP
 *   description: Material Requirements Planning — Phase 05 BE-018
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MrpLine:
 *       type: object
 *       properties:
 *         item_id:
 *           type: string
 *         part_no:
 *           type: string
 *           example: "BUSBAR-CU-40X5"
 *         requirement_date:
 *           type: string
 *           format: date
 *         gross_requirement:
 *           type: number
 *           example: 500
 *         scheduled_receipt:
 *           type: number
 *           example: 100
 *         opening_stock:
 *           type: number
 *           example: 50
 *         net_requirement:
 *           type: number
 *           example: 350
 *         planned_order_qty:
 *           type: number
 *           example: 400
 *         planned_order_release_date:
 *           type: string
 *           format: date
 *         action:
 *           type: string
 *           enum: [Create PO, Create WO, Reschedule, No Action]
 *         source:
 *           type: string
 *           enum: [Purchase, Manufacture, Subcontract, ""]
 *         so_references:
 *           type: array
 *           items:
 *             type: string
 *
 *     MrpRunResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         mrp_run_id:
 *           type: string
 *           example: "MRP-20250315-001"
 *         run_date:
 *           type: string
 *           format: date-time
 *         run_type:
 *           type: string
 *           enum: [Full, Incremental, Item-Specific]
 *         planning_horizon:
 *           type: integer
 *           example: 30
 *         status:
 *           type: string
 *           enum: [Queued, Running, Completed, Failed]
 *         pr_count:
 *           type: integer
 *         wo_count:
 *           type: integer
 *         completed_at:
 *           type: string
 *           format: date-time
 *         mrp_lines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MrpLine'
 */

/**
 * @swagger
 * /api/mrp/run:
 *   post:
 *     summary: Trigger MRP Run (async — returns immediately with job_id)
 *     description: |
 *       Starts an MRP calculation job in the background via Bull queue.
 *       Returns job_id immediately — does NOT block.
 *       Poll GET /api/mrp/runs/:id/status to check progress.
 *
 *       **MRP Calculation:**
 *       1. Explodes BOMs for all confirmed SOs within planning_horizon
 *       2. Fetches opening stock from StockLedger
 *       3. Fetches scheduled receipts (open POs + open WOs)
 *       4. Computes: net_requirement = gross - opening_stock - scheduled_receipt
 *       5. Auto-creates PRs for Purchase items, WOs for Manufacture items
 *     tags: [MRP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - run_type
 *               - planning_horizon
 *             properties:
 *               run_type:
 *                 type: string
 *                 enum: [Full, Incremental, Item-Specific]
 *                 example: "Full"
 *                 description: |
 *                   Full = all confirmed SOs;
 *                   Incremental = only SOs changed since last run;
 *                   Item-Specific = only provided so_ids
 *               planning_horizon:
 *                 type: integer
 *                 example: 30
 *                 minimum: 1
 *                 maximum: 365
 *                 description: Days ahead to plan
 *               so_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required only for Item-Specific runs
 *     responses:
 *       202:
 *         description: MRP Run queued successfully
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
 *                     mrp_run_id:
 *                       type: string
 *                       example: "MRP-20250315-001"
 *                     _id:
 *                       type: string
 *                     job_id:
 *                       type: string
 *                     run_type:
 *                       type: string
 *                     planning_horizon:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "Queued"
 *       400:
 *         description: Invalid run_type or planning_horizon
 *       401:
 *         description: Unauthorized
 */
router.post('/run', authorize('admin', 'manager', 'production'), triggerMrpRun);

/**
 * @swagger
 * /api/mrp/runs:
 *   get:
 *     summary: List all MRP Runs
 *     tags: [MRP]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Queued, Running, Completed, Failed]
 *       - in: query
 *         name: run_type
 *         schema:
 *           type: string
 *           enum: [Full, Incremental, Item-Specific]
 *     responses:
 *       200:
 *         description: MRP runs retrieved successfully
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
 *                     $ref: '#/components/schemas/MrpRunResponse'
 *                 pagination:
 *                   type: object
 */
router.get('/runs', authorize('admin', 'manager', 'production'), listMrpRuns);

/**
 * @swagger
 * /api/mrp/runs/{id}:
 *   get:
 *     summary: Get full MRP Run with all MRP lines per item
 *     tags: [MRP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRP Run MongoDB _id
 *     responses:
 *       200:
 *         description: Full MRP run result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MrpRunResponse'
 *       404:
 *         description: MRP Run not found
 */
router.get('/runs/:id', authorize('admin', 'manager', 'production'), getMrpRunById);

/**
 * @swagger
 * /api/mrp/runs/{id}/status:
 *   get:
 *     summary: Poll MRP Run async job status
 *     description: |
 *       Poll this endpoint after triggering a run.
 *       Returns Bull queue job state + MRP run DB status.
 *       queue_status.state values: waiting | active | completed | failed | delayed | unknown
 *     tags: [MRP]
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
 *         description: MRP run status
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
 *                     mrp_run_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Queued, Running, Completed, Failed]
 *                     pr_count:
 *                       type: integer
 *                     wo_count:
 *                       type: integer
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                     queue_status:
 *                       type: object
 *                       properties:
 *                         state:
 *                           type: string
 *                         progress:
 *                           type: integer
 *                         failedReason:
 *                           type: string
 *                     log_tail:
 *                       type: string
 *                       description: Last 10 lines of execution log
 *       404:
 *         description: MRP Run not found
 */
router.get('/runs/:id/status', getMrpRunStatus);

/**
 * @swagger
 * /api/mrp/runs/{id}:
 *   delete:
 *     summary: Delete an MRP run
 *     description: |
 *       Deletes an MRP run document. Only allowed for 'Completed' or 'Failed' runs.
 *       Will fail if any PRs/WOs generated from this run are already in approved/ordered/in-progress status.
 *     tags: [MRP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MRP Run MongoDB _id
 *     responses:
 *       200:
 *         description: MRP run deleted successfully
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
 *                     _id:
 *                       type: string
 *                     mrp_run_id:
 *                       type: string
 *                     deleted_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cannot delete running/queued run
 *       404:
 *         description: MRP Run not found
 *       409:
 *         description: Cannot delete because PRs/WOs are already in use
 *       401:
 *         description: Unauthorized
 */
router.delete('/runs/:id', authorize('admin', 'manager'), deleteMrpRun);

module.exports = router;