'use strict';
const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  createOeeRecord,
  updateOeeRecord,
  listOeeRecords,
  addDowntimeLog,
  getOeeTrend,
  getMachineLoading,
  recordToolUsage,
  listToolUsage,
  deleteOeeRecord
} = require('../../controllers/Production/productionScheduleController');

// All OEE routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: OEE
 *   description: OEE tracking, downtime logs, machine loading, tool usage — BE-021
 */

// ─── Machine loading ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/machines/{id}/loading:
 *   get:
 *     summary: Machine loading — planned vs available hours per day
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Machine loading per day
 */
router.get('/machines/:id/loading', getMachineLoading);

/**
 * @swagger
 * /api/machines/{id}/oee-trend:
 *   get:
 *     summary: OEE trend over time for a machine
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: shift
 *         schema: { type: string, enum: [Morning, Afternoon, Night, General] }
 *     responses:
 *       200:
 *         description: OEE trend data with avg_oee summary
 */
router.get('/machines/:id/oee-trend', getOeeTrend);

// ─── OEE Records ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/oee-records:
 *   get:
 *     summary: List OEE records with filters
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: machine_id
 *         schema: { type: string }
 *       - in: query
 *         name: shift
 *         schema: { type: string, enum: [Morning, Afternoon, Night, General] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: OEE records list
 */
router.get('/oee-records', listOeeRecords);

/**
 * @swagger
 * /api/oee-records:
 *   post:
 *     summary: Create OEE record for a machine shift
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machine_id
 *               - date
 *               - planned_production_time
 *               - good_qty
 *               - total_qty
 *             properties:
 *               machine_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               shift:
 *                 type: string
 *                 enum: [Morning, Afternoon, Night, General]
 *                 default: General
 *               planned_production_time:
 *                 type: number
 *                 description: Minutes
 *                 example: 480
 *               actual_run_time:
 *                 type: number
 *                 description: Minutes
 *                 example: 440
 *               theoretical_capacity:
 *                 type: number
 *                 description: Units achievable in shift at ideal speed
 *                 example: 500
 *               good_qty:
 *                 type: integer
 *                 example: 460
 *               total_qty:
 *                 type: integer
 *                 example: 480
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: OEE record created with computed A, P, Q, OEE values
 *       409:
 *         description: Record already exists — use PUT to update
 */
router.post('/oee-records', authorize('manager', 'production'), createOeeRecord);

/**
 * @swagger
 * /api/oee-records/{id}:
 *   put:
 *     summary: Update OEE record (re-computes OEE automatically)
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planned_production_time:
 *                 type: number
 *               actual_run_time:
 *                 type: number
 *               good_qty:
 *                 type: integer
 *               total_qty:
 *                 type: integer
 *               theoretical_capacity:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: OEE record updated and recomputed
 */
router.put('/oee-records/:id', authorize('manager', 'production'), updateOeeRecord);

// ─── Downtime Logs ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/downtime-logs:
 *   post:
 *     summary: Record downtime event within an OEE record (OEE recomputed)
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oee_record_id
 *               - type
 *               - start_time
 *               - end_time
 *             properties:
 *               oee_record_id:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Breakdown, Planned Maintenance, Setup, Quality Hold, No Material, Other]
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               root_cause:
 *                 type: string
 *               action_taken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Downtime logged, OEE recomputed
 */
router.post('/downtime-logs', authorize('manager', 'production'), addDowntimeLog);

// ─── Tool Usage ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tool-usage:
 *   get:
 *     summary: List tool usage records with filters
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tool_id
 *         schema: { type: string }
 *       - in: query
 *         name: wo_id
 *         schema: { type: string }
 *       - in: query
 *         name: machine_id
 *         schema: { type: string }
 *       - in: query
 *         name: near_maintenance
 *         schema: { type: boolean }
 *         description: Filter tools near maintenance threshold
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Tool usage records
 */
router.get('/tool-usage', listToolUsage);

/**
 * @swagger
 * /api/tool-usage:
 *   post:
 *     summary: Record tool shots fired per WO operation
 *     tags: [OEE]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tool_id
 *               - wo_id
 * 
 *               - operation_seq
 *               - shots_fired
 *             properties:
 *               tool_id:
 *                 type: string
 *               wo_id:
 *                 type: string
 *               operation_seq:
 *                 type: integer
 *               machine_id:
 *                 type: string
 *               shots_fired:
 *                 type: integer
 *                 example: 5000
 *               usage_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tool usage recorded. Alert if near maintenance threshold.
 */
router.post('/tool-usage', authorize('admin', 'manager', 'production', 'operator'), recordToolUsage);


/**
 * @swagger
 * /api/oee-records/{id}:
 *   delete:
 *     summary: Delete OEE record
 *     description: |
 *       Deletes an OEE record. Cannot delete records older than 90 days (configurable).
 *     tags: [OEE]
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
 *         description: OEE record deleted successfully
 *       400:
 *         description: Cannot delete old records
 *       404:
 *         description: OEE record not found
 */
router.delete('/oee-records/:id', authorize('admin', 'manager'), deleteOeeRecord);

module.exports = router;