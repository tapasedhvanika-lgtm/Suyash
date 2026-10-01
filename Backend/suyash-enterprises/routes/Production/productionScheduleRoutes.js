'use strict';
const express = require('express');
const router  = express.Router();
const {
  createScheduleSlot,
  listScheduleSlots,
  getConflicts,
  updateScheduleSlot,
  completeScheduleSlot,
   confirmScheduleSlot,    
  startScheduleSlot,       
  cancelScheduleSlot,      
  postponeScheduleSlot     
 
} = require('../../controllers/Production/productionScheduleController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: ProductionSchedule
 *   description: Production schedule slot management with conflict detection — BE-021
 */

/**
 * @swagger
 * /api/production-schedule:
 *   post:
 *     summary: Create production schedule slot (auto conflict detection)
 *     tags: [ProductionSchedule]
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
 *               - wo_id
 *               - operation_seq
 *               - planned_qty
 *               - scheduled_date
 *             properties:
 *               machine_id:
 *                 type: string
 *               wo_id:
 *                 type: string
 *               operation_seq:
 *                 type: integer
 *                 example: 10
 *               planned_qty:
 *                 type: number
 *                 example: 200
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-15"
 *               shift:
 *                 type: string
 *                 enum: [Morning, Afternoon, Night, General]
 *                 default: General
 *               start_time:
 *                 type: string
 *                 example: "08:00"
 *               end_time:
 *                 type: string
 *                 example: "12:00"
 *               planned_hours:
 *                 type: number
 *                 example: 4
 *               part_no:
 *                 type: string
 *     responses:
 *       201:
 *         description: Slot created (check conflict field)
 */
router.post('/', createScheduleSlot);

/**
 * @swagger
 * /api/production-schedule:
 *   get:
 *     summary: List slots — machine-wise grouped view
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: machine_id
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
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: wo_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Schedule slots with grouped_view
 */
router.get('/', listScheduleSlots);

/**
 * @swagger
 * /api/production-schedule/conflicts:
 *   get:
 *     summary: All conflicted slots (planner resolution queue)
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conflicted slots
 */
router.get('/conflicts', getConflicts);

/**
 * @swagger
 * /api/production-schedule/{id}:
 *   put:
 *     summary: Reschedule a slot (re-runs conflict detection)
 *     tags: [ProductionSchedule]
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
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               shift:
 *                 type: string
 *                 enum: [Morning, Afternoon, Night, General]
 *               start_time:
 *                 type: string
 *                 example: "14:00"
 *               end_time:
 *                 type: string
 *                 example: "18:00"
 *               planned_hours:
 *                 type: number
 *               planned_qty:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Planned, Confirmed, In Progress, Completed, Postponed, Cancelled]
 *     responses:
 *       200:
 *         description: Slot updated — conflict field shows re-check result
 */
router.put('/:id', authorize('admin', 'manager', 'production'), updateScheduleSlot);

/**
 * @swagger
 * /api/production-schedule/{id}/complete:
 *   post:
 *     summary: Mark slot completed and record actual hours
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actual_hours
 *             properties:
 *               actual_hours:
 *                 type: number
 *                 example: 3.75
 *               actual_qty:
 *                 type: number
 *                 example: 195
 *     responses:
 *       200:
 *         description: Slot completed with utilization %
 */
router.post('/:id/complete', authorize('admin', 'manager', 'production'), completeScheduleSlot);
/**
 * @swagger
 * /api/production-schedule/{id}/confirm:
 *   post:
 *     summary: Confirm a schedule slot
 *     description: |
 *       Transitions slot status from **Planned** → **Confirmed**.
 *       
 *       **When to use:** After production manager reviews and approves the schedule.
 *       Only slots in 'Planned' status can be confirmed.
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production schedule slot ID
 *     responses:
 *       200:
 *         description: Slot confirmed successfully
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
 *                   example: "Schedule slot confirmed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     schedule_id:
 *                       type: string
 *                       example: "SCH-20250415-0001"
 *                     status:
 *                       type: string
 *                       example: "Confirmed"
 *                     confirmed_at:
 *                       type: string
 *                       format: date-time
 *                     confirmed_by:
 *                       type: string
 *       400:
 *         description: Cannot confirm - slot not in Planned status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot confirm slot with status: Completed. Only Planned slots can be confirmed."
 *                 current_status:
 *                   type: string
 *                 allowed_statuses:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Schedule slot not found
 */
router.post('/:id/confirm', confirmScheduleSlot);

/**
 * @swagger
 * /api/production-schedule/{id}/start:
 *   post:
 *     summary: Start production on a schedule slot
 *     description: |
 *       Transitions slot status from **Confirmed** → **In Progress**.
 *       
 *       **When to use:** When operator actually begins production on this slot.
 *       Only slots in 'Confirmed' status can be started.
 *       Also validates that the corresponding Work Order operation is 'In Progress'.
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production schedule slot ID
 *     responses:
 *       200:
 *         description: Production started successfully
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
 *                   example: "Production started on schedule slot"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     schedule_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "In Progress"
 *                     started_at:
 *                       type: string
 *                       format: date-time
 *                     started_by:
 *                       type: string
 *       400:
 *         description: Cannot start - slot not in Confirmed status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot start slot with status: Planned. Must be Confirmed."
 *                 current_status:
 *                   type: string
 *                 allowed_statuses:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Schedule slot not found
 */
router.post('/:id/start', startScheduleSlot)
;
/**
 * @swagger
 * /api/production-schedule/{id}/cancel:
 *   post:
 *     summary: Cancel a schedule slot
 *     description: |
 *       Transitions slot status to **Cancelled**.
 *       
 *       **When to use:** When a planned production slot is no longer needed.
 *       Only slots in 'Planned', 'Confirmed', or 'Postponed' status can be cancelled.
 *       Requires cancellation reason for audit trail.
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production schedule slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancel_reason
 *             properties:
 *               cancel_reason:
 *                 type: string
 *                 description: Reason for cancellation
 *                 example: "Work Order cancelled by customer"
 *     responses:
 *       200:
 *         description: Slot cancelled successfully
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
 *                   example: "Schedule slot cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     schedule_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "Cancelled"
 *                     cancel_reason:
 *                       type: string
 *                     cancelled_at:
 *                       type: string
 *                       format: date-time
 *                     cancelled_by:
 *                       type: string
 *       400:
 *         description: Cannot cancel - invalid status or missing reason
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot cancel slot with status: Completed. Only Planned, Confirmed, Postponed slots can be cancelled."
 *       404:
 *         description: Schedule slot not found
 */

router.post('/:id/cancel', cancelScheduleSlot);
/**
 * @swagger
 * /api/production-schedule/{id}/postpone:
 *   post:
 *     summary: Postpone a schedule slot to a new date/time
 *     description: |
 *       **Two-step operation:**
 *       1. Marks current slot as **Postponed** with reason
 *       2. Creates a **new slot** with status 'Planned' on the new date/time
 *       
 *       **When to use:** When a slot cannot run as scheduled due to machine breakdown, material shortage, etc.
 *       Only slots in 'Planned', 'Confirmed', or 'In Progress' status can be postponed.
 *       Automatically checks for conflicts on the new schedule.
 *     tags: [ProductionSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production schedule slot ID to postpone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_scheduled_date
 *               - postpone_reason
 *             properties:
 *               new_scheduled_date:
 *                 type: string
 *                 format: date
 *                 description: New production date
 *                 example: "2025-04-20"
 *               new_shift:
 *                 type: string
 *                 enum: [Morning, Afternoon, Night, General]
 *                 description: New shift (defaults to original shift)
 *                 example: "Morning"
 *               new_start_time:
 *                 type: string
 *                 description: New start time in HH:MM format
 *                 example: "08:00"
 *               new_end_time:
 *                 type: string
 *                 description: New end time in HH:MM format
 *                 example: "12:00"
 *               postpone_reason:
 *                 type: string
 *                 description: Reason for postponement
 *                 example: "Machine breakdown - waiting for repair"
 *     responses:
 *       201:
 *         description: Slot postponed and new slot created
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
 *                   example: "Schedule slot postponed. New slot created for 2025-04-20"
 *                 data:
 *                   type: object
 *                   properties:
 *                     original_slot:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         schedule_id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "Postponed"
 *                         original_date:
 *                           type: string
 *                           format: date
 *                         postpone_reason:
 *                           type: string
 *                     new_slot:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         schedule_id:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "Planned"
 *                         scheduled_date:
 *                           type: string
 *                           format: date
 *                         shift:
 *                           type: string
 *                         start_time:
 *                           type: string
 *                         end_time:
 *                           type: string
 *       400:
 *         description: Cannot postpone - invalid status or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot postpone slot with status: Completed. Only Planned, Confirmed, In Progress slots can be postponed."
 *       409:
 *         description: Conflict detected on new schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot postpone: Time conflict detected on new schedule"
 *                 conflict:
 *                   type: boolean
 *                   example: true
 *                 conflicting_slot_id:
 *                   type: string
 *                 suggestion:
 *                   type: string
 *       404:
 *         description: Schedule slot not found
 */
router.post('/:id/postpone', postponeScheduleSlot);

module.exports = router;