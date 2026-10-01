'use strict';
const express = require('express');
const router  = express.Router();
const {
  createWorkOrder,
  listWorkOrders,
  getWorkOrderById,
  getWorkOrdersByPartNo,
  updateWorkOrder,
  releaseWorkOrder,
  holdWorkOrder,
  cancelWorkOrder,
  resumeWorkOrder,
  startNextOperation,
  startOperation,
  completeOperation,
  addLabourBooking,
  completeWorkOrder,
  getJobCosting,
  getWipReport,
  getJobCard,
  getAssemblyQueue,
  updateOperationOutputQty,
  addOperations,               
  getOperationsTimeline,
   calculateDeliveryDate,
  getProductionTime,
} = require('../../controllers/Production/workOrderController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: WorkOrders
 *   description: Work Order / Job Card — Phase 05 BE-019 + BE-020 + Phase 09 Assembly
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WoOperation:
 *       type: object
 *       properties:
 *         op_sequence:
 *           type: integer
 *           example: 10
 *         operation_name:
 *           type: string
 *           example: "Blanking"
 *         work_centre:
 *           type: string
 *           example: "Press Shop"
 *         machine_id:
 *           type: string
 *         is_subcontract:
 *           type: boolean
 *           default: false
 *         planned_qty:
 *           type: number
 *         planned_setup_min:
 *           type: number
 *           example: 15
 *         planned_run_min:
 *           type: number
 *           example: 1.5
 *         actual_setup_min:
 *           type: number
 *         actual_run_min:
 *           type: number
 *         employee_id:
 *           type: string
 *         output_qty:
 *           type: number
 *         rejection_qty:
 *           type: number
 *         rejection_reason:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Pending, In Progress, Completed, Skipped]
 *
 *     LabourBooking:
 *       type: object
 *       properties:
 *         employee_id:
 *           type: string
 *         operation_seq:
 *           type: integer
 *         hours_booked:
 *           type: number
 *           example: 4
 *         start_time:
 *           type: string
 *           format: date-time
 *         end_time:
 *           type: string
 *           format: date-time
 *         hourly_rate:
 *           type: number
 *           example: 125
 *         total_labour_cost:
 *           type: number
 *           example: 500
 *
 *     WorkOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         wo_number:
 *           type: string
 *           example: "WO-202503-0122"
 *         wo_date:
 *           type: string
 *           format: date
 *         wo_type:
 *           type: string
 *           enum: [Machining, Assembly, SubAssembly, Kit]
 *           default: Machining
 *           description: "Type of Work Order"
 *         so_id:
 *           type: string
 *         so_number:
 *           type: string
 *         item_id:
 *           type: string
 *         part_no:
 *           type: string
 *           example: "BUSBAR-CU-40X5"
 *         part_name:
 *           type: string
 *         drawing_revision:
 *           type: string
 *           description: "LOCKED at creation — never changes even if item drawing is updated"
 *         bom_id:
 *           type: string
 *         bom_version:
 *           type: string
 *         routing_id:
 *           type: string
 *         planned_qty:
 *           type: number
 *         completed_qty:
 *           type: number
 *         rejected_qty:
 *           type: number
 *         rework_qty:
 *           type: number
 *           description: "Number of units sent for rework (Assembly specific)"
 *         planned_start:
 *           type: string
 *           format: date
 *         planned_end:
 *           type: string
 *           format: date
 *         actual_start:
 *           type: string
 *           format: date-time
 *         actual_end:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *         status:
 *           type: string
 *           enum: [Planned, Released, In Progress, Partially Completed, Completed, On Hold, Cancelled, Components Kitted]
 *           description: "Components Kitted is Assembly-specific status"
 *         hold_reason:
 *           type: string
 *         assembly_line:
 *           type: string
 *           description: "Assembly line or station (Assembly WOs only)"
 *         serial_tracking:
 *           type: boolean
 *           description: "Does this product require serial number tracking?"
 *         serial_numbers_assigned:
 *           type: array
 *           items:
 *             type: string
 *           description: "Serial numbers assigned to completed units"
 *         component_picklist_id:
 *           type: string
 *           description: "Reference to ComponentPickList (Assembly WOs only)"
 *         operations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WoOperation'
 *         labour_bookings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LabourBooking'
 *         actual_rm_cost:
 *           type: number
 *         actual_process_cost:
 *           type: number
 *         actual_overhead:
 *           type: number
 *         actual_total_cost:
 *           type: number
 *
 *     JobCosting:
 *       type: object
 *       properties:
 *         wo_id:
 *           type: string
 *         wo_number:
 *           type: string
 *         completed_qty:
 *           type: number
 *         actual_rm_cost:
 *           type: number
 *         actual_process_cost:
 *           type: number
 *         actual_overhead:
 *           type: number
 *         actual_total_cost:
 *           type: number
 *         actual_unit_cost:
 *           type: number
 *         estimated_total_cost:
 *           type: number
 *         variance_amount:
 *           type: number
 *           description: "Positive = cost overrun"
 *         variance_percent:
 *           type: number
 *         gross_margin_percent:
 *           type: number
 *
 *     ComponentPickList:
 *       type: object
 *       properties:
 *         picklist_id:
 *           type: string
 *           example: "CPL-202504-0001"
 *         status:
 *           type: string
 *           enum: [Generated, Partially Picked, Fully Picked, Issued, Closed]
 *         items:
 *           type: array
 *         total_cost:
 *           type: number
 *
 *     TorqueRecord:
 *       type: object
 *       properties:
 *         torque_record_id:
 *           type: string
 *           example: "TQR-202504-0001"
 *         joint_reference:
 *           type: string
 *         specified_torque_nm:
 *           type: number
 *         actual_torque_nm:
 *           type: number
 *         pass_fail:
 *           type: string
 *           enum: [Pass, Fail]
 *
 *     FunctionalTestRecord:
 *       type: object
 *       properties:
 *         test_record_id:
 *           type: string
 *           example: "FTR-202504-0001"
 *         test_type:
 *           type: string
 *           enum: [Continuity Test, HiPot Test, Pressure Test, Leak Test, Dimensional Verification, Functional Operation Test, Insulation Resistance]
 *         overall_result:
 *           type: string
 *           enum: [Passed, Failed, Partially Passed]
 */

// ─── SPECIAL ROUTES (must be before /:id) ────────────────────────────────────

/**
 * @swagger
 * /api/work-orders/wip-report:
 *   get:
 *     summary: WIP Valuation Report — all open WOs with accumulated costs
 *     description: Returns all Released/In Progress/Partially Completed WOs with actual RM cost and labour cost accumulated so far.
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WIP report generated
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
 *                     open_wo_count:
 *                       type: integer
 *                     total_wip_value:
 *                       type: number
 *                     machining_wip_value:
 *                       type: number
 *                     assembly_wip_value:
 *                       type: number
 *                     work_orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkOrder'
 */
router.get('/wip-report', getWipReport);

/**
 * @swagger
 * /api/work-orders/assembly-queue:
 *   get:
 *     summary: Get Assembly Queue (Assembly WOs in Released/In Progress/Components Kitted status)
 *     description: Returns all Assembly Work Orders that are currently in production queue with sub-assembly dependency status.
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assembly queue with dependency status
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
 *                     $ref: '#/components/schemas/WorkOrder'
 *                 count:
 *                   type: integer
 */
router.get('/assembly-queue', getAssemblyQueue);

/**
 * @swagger
 * /api/work-orders/by-item/{part_no}:
 *   get:
 *     summary: Get all Work Orders for a specific part number
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: part_no
 *         required: true
 *         schema:
 *           type: string
 *         example: "BUSBAR-CU-40X5"
 *     responses:
 *       200:
 *         description: Work orders for the part
 */
router.get('/by-item/:part_no', getWorkOrdersByPartNo);

// ─── MAIN CRUD ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/work-orders:
 *   get:
 *     summary: List Work Orders with filters
 *     tags: [WorkOrders]
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
 *           description: Comma-separated. e.g. "Released,In Progress"
 *       - in: query
 *         name: item_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *       - in: query
 *         name: wo_type
 *         schema:
 *           type: string
 *           enum: [Machining, Assembly, SubAssembly, Kit]
 *         description: "Filter by Work Order type"
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by planned_start >= from
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: part_no
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work orders list
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
 *                     $ref: '#/components/schemas/WorkOrder'
 *                 pagination:
 *                   type: object
 */
router.get('/', listWorkOrders);

/**
 * @swagger
 * /api/work-orders:
 *   post:
 *     summary: Create Work Order (Supports both Machining and Assembly)
 *     description: |
 *       Creates a WO with drawing_revision LOCKED at item's current revision.
 *       For Assembly WOs, operations are auto-created if routing not provided.
 *       Operations array is populated from the Routing (snapshot — not live).
 *       BOM version is locked at creation.
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - so_id
 *               - item_id
 *               - bom_id
 *               - planned_qty
 *               - planned_start
 *               - planned_end
 *               - required_by
 *             properties:
 *               so_id:
 *                 type: string
 *               so_item_id:
 *                 type: string
 *                 description: SO line item _id
 *               item_id:
 *                 type: string
 *               bom_id:
 *                 type: string
 *               routing_id:
 *                 type: string
 *                 description: Operations will be copied from this routing (Machining WOs)
 *               planned_qty:
 *                 type: number
 *                 example: 500
 *               planned_start:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-15"
 *               planned_end:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-20"
 *               required_by:
 *                 type: string
 *                 format: date
 *                 description: Customer requirement date - drives MRP priority
 *               priority:
 *                 type: string
 *                 enum: [Critical, High, Medium, Low]
 *                 default: "Medium"
 *               wo_type:
 *                 type: string
 *                 enum: [Machining, Assembly, SubAssembly, Kit]
 *                 default: "Machining"
 *                 description: "Type of Work Order"
 *               assembly_line:
 *                 type: string
 *                 description: "Assembly line or station (for Assembly WOs)"
 *               serial_tracking:
 *                 type: boolean
 *                 default: false
 *                 description: "Enable serial number tracking for finished products"
 *               mrp_run_id:
 *                 type: string
 *                 description: Set if WO was triggered by MRP run
 *     responses:
 *       201:
 *         description: Work Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WorkOrder'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Item / BOM / Routing not found
 */
router.post('/', createWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}:
 *   get:
 *     summary: Get full Work Order detail (includes assembly data if applicable)
 *     tags: [WorkOrders]
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
 *         description: Full WO with operations, labour bookings, costs, and assembly data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WorkOrder'
 *                 assembly_data:
 *                   type: object
 *                   properties:
 *                     picklist:
 *                       $ref: '#/components/schemas/ComponentPickList'
 *                     torque_records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TorqueRecord'
 *                     functional_tests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FunctionalTestRecord'
 *       404:
 *         description: Work Order not found
 */
router.get('/:id', getWorkOrderById);

/**
 * @swagger
 * /api/work-orders/{id}:
 *   put:
 *     summary: Update Work Order (status, priority, hold_reason, assembly_line)
 *     description: |
 *       Valid status transitions:
 *       - Planned → Released | Cancelled
 *       - Released → In Progress | On Hold | Cancelled
 *       - In Progress → Partially Completed | On Hold | Completed
 *       - On Hold → In Progress | Cancelled
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Planned, Released, In Progress, Partially Completed, Completed, On Hold, Cancelled, Components Kitted]
 *               priority:
 *                 type: string
 *                 enum: [Critical, High, Medium, Low]
 *               hold_reason:
 *                 type: string
 *               assembly_line:
 *                 type: string
 *                 description: "Update assembly line (Assembly WOs only)"
 *     responses:
 *       200:
 *         description: Work Order updated
 *       400:
 *         description: Invalid status transition
 */
router.put('/:id', updateWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}/release:
 *   post:
 *     summary: Release Work Order to shop floor (reserves stock for BOM components)
 *     description: |
 *       Transitions WO from Planned → Released.
 *       Triggers stock reservation for all BOM components.
 *       For Assembly WOs, automatically generates Component Pick List.
 *       After release, store team can issue materials against this WO.
 *     tags: [WorkOrders]
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
 *         description: WO released and stock reserved
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
 *                     wo_number:
 *                       type: string
 *                     wo_type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     reservedComponents:
 *                       type: array
 *                     reserved_components:
 *                       type: array
 *                     total_components_reserved:
 *                       type: integer
 *       400:
 *         description: WO not in Planned status
 */
router.post('/:id/release', releaseWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}/hold:
 *   post:
 *     summary: Put Work Order On Hold (requires hold_reason)
 *     tags: [WorkOrders]
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
 *               - hold_reason
 *             properties:
 *               hold_reason:
 *                 type: string
 *                 example: "Awaiting copper strip from store"
 *     responses:
 *       200:
 *         description: WO put On Hold
 *       400:
 *         description: hold_reason missing or invalid transition
 */
router.post('/:id/hold',  holdWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}/cancel:
 *   post:
 *     summary: Cancel Work Order
 *     description: |
 *       Cancels a Work Order. Only allowed for statuses: Planned, Released, On Hold.
 *       - For Released WOs, releases stock reservations automatically.
 *       - Requires cancel_reason.
 *     tags: [WorkOrders]
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
 *               - cancel_reason
 *             properties:
 *               cancel_reason:
 *                 type: string
 *                 example: "Customer cancelled order"
 *     responses:
 *       200:
 *         description: Work Order cancelled successfully
 *       400:
 *         description: Cannot cancel - invalid status or missing reason
 *       404:
 *         description: Work Order not found
 */
router.post('/:id/cancel',  cancelWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}/resume:
 *   post:
 *     summary: Resume Work Order from On Hold
 *     description: |
 *       Resumes a Work Order that was On Hold.
 *       Restores previous status (In Progress or Released).
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution_notes:
 *                 type: string
 *                 example: "Material received from store"
 *     responses:
 *       200:
 *         description: Work Order resumed successfully
 *       400:
 *         description: Cannot resume - not On Hold
 *       404:
 *         description: Work Order not found
 */
router.post('/:id/resume', resumeWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}/operations/{seq}/start:
 *   post:
 *     summary: Start a specific operation (marks In Progress, validates operator skill)
 *     description: |
 *       Sets operation status to In Progress. Records actual_start time.
 *       If operator does not have required skill code, logs a skill override warning.
 *       WO transitions to In Progress when first operation starts.
 *       
 *       **routing_id** is optional - can be passed for frontend convenience
 *       to fetch routing data without an extra API call.
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: seq
 *         required: true
 *         schema:
 *           type: integer
 *         description: Operation sequence number (e.g. 10, 20, 30...)
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operator_id
 *             properties:
 *               employee_id:
 *                 type: string
 *                 description: Employee _id. Skill validated against operation required_skill.
 *               routing_id:
 *                 type: string
 *                 description: Optional - Routing ID for frontend to fetch routing data. System validates it matches WO's routing.
 *                 example: "64f8e9b7a1b2c3d4e5f6a7c5"
 *     responses:
 *       200:
 *         description: Operation started
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
 *                     op_sequence:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     actual_start:
 *                       type: string
 *                       format: date-time
 *                     skill_override:
 *                       type: boolean
 *                     routing_id:
 *                       type: string
 *                       description: Routing ID of the Work Order
 *       400:
 *         description: Operation not in Pending state, WO not released, or routing mismatch
 */
router.post('/:id/operations/:seq/start', startOperation);

/**
 * @swagger
 * /api/work-orders/{id}/start:
 *   post:
 *     summary: Auto-start the next pending operation (no request body needed)
 *     description: |
 *       Automatically finds and starts the first Pending operation.
 *       No request body required - just the Work Order ID in URL.
 *       
 *       **How it works:**
 *       1. After adding operations via /operations/add, call this API
 *       2. System finds the first Pending operation (lowest op_sequence)
 *       3. Marks it as In Progress
 *       4. Updates WO status to In Progress if needed
 *       
 *       **Note:** After completing an operation, the next operation is
 *       AUTO-STARTED by the completeOperation API. You don't need to call
 *       start again unless you want to manually start a specific operation.
 *     tags: [WorkOrders]
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
 *         description: Operation started successfully
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
 *                     started_op:
 *                       type: object
 *                       properties:
 *                         op_sequence:
 *                           type: integer
 *                         operation_name:
 *                           type: string
 *                         status:
 *                           type: string
 *                         actual_start:
 *                           type: string
 *                           format: date-time
 *                     remaining_pending_ops:
 *                       type: integer
 *                     total_operations:
 *                       type: integer
 *                     completed_ops:
 *                       type: integer
 *                     wo_status:
 *                       type: string
 *       400:
 *         description: No pending operations or prior operation not completed
 *       404:
 *         description: Work Order not found
 */
router.post('/:id/start',  startNextOperation);

/**
 * @swagger
 * /api/work-orders/{id}/operations/{seq}/complete:
 *   post:
 *     summary: Complete a specific operation (record output, rejection, actual times)
 *     description: |
 *       Records output_qty, rejection_qty, actual_setup_min, actual_run_min.
 *       If rejection exceeds AQL threshold (default 5%), WO is auto-put On Hold and NCR is triggered.
 *       When all operations complete, WO moves to Partially Completed.
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: seq
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               output_qty:
 *                 type: number
 *                 example: 490
 *               rejection_qty:
 *                 type: number
 *                 example: 10
 *               rejection_reason:
 *                 type: string
 *                 example: "Dimensional OOT"
 *               actual_setup_min:
 *                 type: number
 *                 example: 18
 *               actual_run_min:
 *                 type: number
 *                 example: 1.6
 *     responses:
 *       200:
 *         description: Operation completed (or WO put On Hold if rejection exceeds AQL)
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
 *                     ncr_required:
 *                       type: boolean
 *                     rejection_percent:
 *                       type: number
 */
router.post('/:id/operations/:seq/complete', completeOperation);

/**
 * @swagger
 * /api/work-orders/{id}/labour:
 *   post:
 *     summary: Add labour booking to Work Order (BE-020)
 *     description: |
 *       Records operator hours against a WO operation.
 *       Automatically pulls hourly_rate from Employee Master.
 *       total_labour_cost = hours_booked × hourly_rate.
 *       Validates: total booked hours for an operator on a date ≤ 24h.
 *       Updates WO.actual_process_cost immediately.
 *     tags: [WorkOrders]
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
 *               - operator_id
 *               - operation_seq
 *               - hours_booked
 *               - start_time
 *               - end_time
 *             properties:
 *               employee_id:
 *                 type: string
 *               operation_seq:
 *                 type: integer
 *                 example: 10
 *               hours_booked:
 *                 type: number
 *                 example: 4
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-15T08:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-15T12:00:00Z"
 *     responses:
 *       201:
 *         description: Labour booking added
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
 *                     hours_booked:
 *                       type: number
 *                     hourly_rate:
 *                       type: number
 *                     total_labour_cost:
 *                       type: number
 *                     accumulated_process_cost:
 *                       type: number
 *       400:
 *         description: Hours exceed 24h limit for this operator/day
 */
router.post('/:id/labour',  addLabourBooking);

/**
 * @swagger
 * /api/work-orders/{id}/complete:
 *   post:
 *     summary: Complete Work Order — atomic FG receipt + WIP clearance + job costing (BE-020)
 *     description: |
 *       **ATOMIC TRANSACTION** — all steps succeed or all roll back:
 *       1. Validates all operations are Completed
 *       2. Creates FG StockTransaction (FG store += completed_qty)
 *       3. Clears WIP
 *       4. Updates SO line item_status = Ready
 *       5. For Assembly WOs with serial tracking, assigns serial numbers
 *       6. Computes actual_overhead = actual_process_hours × overhead_rate (from Company Settings)
 *       7. Creates JobCosting record with variance vs Quotation estimate
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed_qty:
 *                 type: number
 *                 example: 490
 *                 description: Accepted quantity from Final QC. Defaults to planned_qty.
 *               rejected_qty:
 *                 type: number
 *                 example: 10
 *               serial_numbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Serial numbers for completed units (for Assembly WOs with serial_tracking)"
 *     responses:
 *       200:
 *         description: WO completed. FG stock receipted. Job costing created.
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
 *                     wo_number:
 *                       type: string
 *                     wo_type:
 *                       type: string
 *                     completed_qty:
 *                       type: number
 *                     actual_total_cost:
 *                       type: number
 *                     actual_unit_cost:
 *                       type: number
 *                     variance_amount:
 *                       type: number
 *                     gross_margin_percent:
 *                       type: number
 *                     serial_numbers:
 *                       type: array
 *       400:
 *         description: Not all operations completed
 */
router.post('/:id/complete',  completeWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}/job-costing:
 *   get:
 *     summary: Job Costing report for a Work Order (BE-020)
 *     description: Returns actual vs estimated cost breakdown with variance and gross margin.
 *     tags: [WorkOrders]
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
 *         description: Job costing report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/JobCosting'
 */
router.get('/:id/job-costing', getJobCosting);

/**
 * @swagger
 * /api/work-orders/{id}/job-card:
 *   get:
 *     summary: Download printable Job Card PDF (BE-019)
 *     description: |
 *       Generates a printable PDF job card with:
 *       - WO header details (part, drawing, BOM version, WO type)
 *       - Operations list with planned times
 *       - For Assembly WOs: Pick list reference and torque/test sections
 *       - Drawing reference (locked revision)
 *       - Signature lines for issue, QC, and torque verification
 *       Returns PDF if pdfkit available, otherwise returns JSON.
 *     tags: [WorkOrders]
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
 *         description: Job Card PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/job-card', getJobCard);

 
/**
 * @swagger
 * /api/work-orders/{id}/operations/{seq}/output:
 *   patch:
 *     summary: Update output_qty for an In Progress operation (cascades to next op)
 *     description: |
 *       Updates output_qty on a specific operation. Operation MUST be In Progress.
 *
 *       **Cascade rule:** If the next operation (by op_sequence) is still Pending,
 *       its planned_qty is automatically updated to match this output_qty.
 *       If the next operation is already In Progress or Completed, cascade is
 *       blocked and a warning is returned — the caller must handle manually.
 *
 *       **Validation:**
 *       - output_qty must be >= 0
 *       - output_qty cannot exceed op.planned_qty
 *       - output_qty + rejection_qty cannot exceed op.planned_qty
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: seq
 *         required: true
 *         schema:
 *           type: integer
 *         description: Operation sequence number (e.g. 10, 20, 30)
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - output_qty
 *             properties:
 *               output_qty:
 *                 type: number
 *                 example: 480
 *                 description: Quantity successfully produced at this operation so far
 *               rejection_qty:
 *                 type: number
 *                 example: 10
 *                 description: Optional — updates rejection_qty alongside output_qty
 *     responses:
 *       200:
 *         description: output_qty updated (with cascade info)
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
 *                     op_sequence: { type: integer }
 *                     operation_name: { type: string }
 *                     planned_qty: { type: number }
 *                     output_qty: { type: number }
 *                     rejection_qty: { type: number }
 *                     previous_output_qty: { type: number }
 *                     cascade:
 *                       type: object
 *                       properties:
 *                         op_sequence: { type: integer }
 *                         operation_name: { type: string }
 *                         previous_planned_qty: { type: number }
 *                         new_planned_qty: { type: number }
 *                         cascade_blocked:
 *                           type: boolean
 *                           description: true if next op already started — cascade did not apply
 *       400:
 *         description: Operation not In Progress, or qty validation failed
 */
router.patch('/:id/operations/:seq/output',updateOperationOutputQty);

/**
 * @swagger
 * /api/work-orders/{id}/operations/timeline:
 *   get:
 *     summary: Get operations timeline for a Work Order
 *     description: |
 *       Returns all operations sorted by op_sequence with:
 *       - `is_current: true` on the single In Progress op
 *       - `is_next: true` on the next Pending op waiting to start
 *       - Planned vs actual time breakdown per op
 *       - yield_percent, time_vs_plan_percent per completed op
 *       - elapsed_label ("2h 15m elapsed") on the currently running op
 *       - WO-level summary: percent_complete, current_active_op, next_pending_op
 *
 *       **Use this endpoint to power your timeline/stepper UI.**
 *     tags: [WorkOrders]
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
 *         description: Operations timeline with WO summary
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         wo_number: { type: string }
 *                         percent_complete: { type: number, example: 50.0 }
 *                         total_operations: { type: integer }
 *                         completed_operations: { type: integer }
 *                         current_active_op:
 *                           type: object
 *                           properties:
 *                             op_sequence: { type: integer }
 *                             operation_name: { type: string }
 *                             actual_start: { type: string, format: date-time }
 *                         next_pending_op:
 *                           type: object
 *                           properties:
 *                             op_sequence: { type: integer }
 *                             operation_name: { type: string }
 *                         overall_yield_percent: { type: number }
 *                         total_planned_min: { type: number }
 *                         total_actual_min: { type: number }
 *                     operations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           position: { type: integer }
 *                           op_sequence: { type: integer }
 *                           operation_name: { type: string }
 *                           status:
 *                             type: string
 *                             enum: [Pending, In Progress, Completed, Skipped]
 *                           is_current:
 *                             type: boolean
 *                             description: "True for the single In Progress operation"
 *                           is_next:
 *                             type: boolean
 *                             description: "True for the next Pending operation in queue"
 *                           planned: { type: object }
 *                           actual: { type: object }
 *                           output: { type: object }
 *                           efficiency: { type: object }
 *       404:
 *         description: Work Order not found
 */
router.get('/:id/operations/timeline', getOperationsTimeline);
 
/**
 * @swagger
 * /api/work-orders/{id}/operations/add:
 *   post:
 *     summary: Add one or more operations to a Work Order
 *     description: |
 *       Adds operations in bulk to a WO. All new ops are set to Pending status.
 *       The operations array is always kept sorted by op_sequence.
 *
 *       **NEW:** 
 *       - `operation_name` is AUTO-FETCHED from Process Master using `operation_id`
 *       - Only `operation_id` is required (not operation_name)
 *       - Optional `routing_id` can be passed at root level
 *
 *       **Sequential enforcement:**
 *       Operations execute strictly in op_sequence order — op 10 must complete
 *       before op 20 starts. You cannot start or complete ops out of order.
 *
 *       **Auto-activation:**
 *       If the WO is already in Released status with no active op,
 *       the lowest-sequence Pending op is immediately set to In Progress.
 *
 *       **Skill validation:**
 *       If operator_id and required_skill are both provided, the operator's
 *       skill_codes are checked. A mismatch is logged as a skill override
 *       (warning returned, not a hard block).
 *
 *       **Restrictions:**
 *       - Only allowed when WO status is Planned or Released
 *       - op_sequence must be unique per WO
 *     tags: [WorkOrders]
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
 *               routing_id:
 *                 type: string
 *                 description: Optional - Routing ID for reference
 *               operations:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - op_sequence
 *                     - operation_id
 *                     - work_centre
 *                   properties:
 *                     op_sequence:
 *                       type: integer
 *                       example: 10
 *                     operation_id:
 *                       type: string
 *                       description: "Process Master ID - auto-fetches operation_name"
 *                       example: "65f8e9b7a1b2c3d4e5f6a7b8"
 *                     work_centre:
 *                       type: string
 *                       example: "Press Shop"
 *                     machine_id:
 *                       type: string
 *                     employee_id:
 *                       type: string
 *                     required_skill:
 *                       type: string
 *                       example: "PRESS-OPS"
 *                     planned_setup_min:
 *                       type: number
 *                       example: 15
 *                     planned_run_min:
 *                       type: number
 *                       example: 1.5
 *                     planned_qty:
 *                       type: number
 *                     is_subcontract:
 *                       type: boolean
 *                       default: false
 *                     subcontract_vendor:
 *                       type: string
 *                     planned_start:
 *                       type: string
 *                       format: date
 *     responses:
 *       201:
 *         description: Operations added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "3 operation(s) added to WO WO-202504-0012"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wo_number: { type: string }
 *                     wo_status: { type: string }
 *                     operations_added: { type: integer }
 *                     total_operations: { type: integer }
 *                     auto_activated_op:
 *                       type: object
 *                       nullable: true
 *                       description: "Set if an op was auto-activated (WO was Released)"
 *                       properties:
 *                         op_sequence: { type: integer }
 *                         operation_name: { type: string }
 *                     skill_warnings:
 *                       type: array
 *                       description: "Present only if skill overrides were logged"
 *                     operations:
 *                       type: array
 *                       description: "Full updated operations list (sorted by sequence)"
 *       400:
 *         description: WO not in Planned/Released status, duplicate sequences, or missing fields
 *       404:
 *         description: Work Order not found
 */
router.post('/:id/operations/add', addOperations);
 
/**
 * @swagger
 * /api/work-orders/{id}/production-time:
 *   get:
 *     summary: Calculate total production time for a Work Order
 *     description: |
 *       Returns total setup time, run time, and production time for all operations.
 *       Uses Process Master's setup_time_min and cycle_time_min for calculations.
 *       
 *       **Formula:** total_time = Σ(setup_time_min + (cycle_time_min × planned_qty))
 *       
 *       **Use cases:**
 *       - Production planning: Know how much machine time needed
 *       - Capacity planning: Check if machine is overloaded
 *       - Cost estimation: Labour hours × hourly rate
 *     tags: [WorkOrders]
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
 *         description: Production time calculated successfully
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
 *                     wo_number:
 *                       type: string
 *                     total_production_hours:
 *                       type: number
 *                     total_production_days:
 *                       type: number
 *                     operation_breakdown:
 *                       type: array
 *                     machine_capacity:
 *                       type: object
 *       400:
 *         description: No operations defined
 *       404:
 *         description: Work Order not found
 */
router.get('/:id/production-time', protect, getProductionTime);

/**
 * @swagger
 * /api/work-orders/{id}/delivery-date:
 *   get:
 *     summary: Calculate estimated delivery date based on production time
 *     description: |
 *       Calculates when the Work Order can be delivered based on:
 *       - Total production time from operations
 *       - Shift hours per day (from Company settings)
 *       - Planned start date
 *       - Customer required date
 *       
 *       **Returns:** Whether you can meet customer deadline, and recommendations if not.
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: exclude_weekends
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Exclude Saturdays and Sundays from calculation
 *     responses:
 *       200:
 *         description: Delivery date calculated
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
 *                     estimated_delivery_date:
 *                       type: string
 *                       format: date
 *                     can_meet_customer_deadline:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     recommendations:
 *                       type: array
 *       404:
 *         description: Work Order not found
 */
router.get('/:id/delivery-date', protect, calculateDeliveryDate);


module.exports = router;