'use strict';
const express = require('express');
const router = express.Router();

// Import controllers
const pickListController = require('../../controllers/Assembly/pickListController');
const torqueController = require('../../controllers/Assembly/torqueController');
const testController = require('../../controllers/Assembly/testController');
const subAssemblyController = require('../../controllers/Assembly/subAssemblyController');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { validateTorqueTool } = require('../../middleware/Assembly/validateTorqueTool');

// All routes require authentication
router.use(protect);

// ======================================================
// SWAGGER TAGS
// ======================================================

/**
 * @swagger
 * tags:
 *   name: Assembly
 *   description: Assembly module - Component Pick Lists, Torque Records, Functional Tests, Sub-Assemblies
 */

// ======================================================
// SWAGGER COMPONENTS SCHEMAS
// ======================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     ComponentPickList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         picklist_id:
 *           type: string
 *           example: "CPL-202604-0001"
 *         picklist_date:
 *           type: string
 *           format: date-time
 *         wo_id:
 *           type: string
 *         wo_number:
 *           type: string
 *           example: "WO-202604-0007"
 *         assembly_qty:
 *           type: number
 *           example: 200
 *         status:
 *           type: string
 *           enum: [Generated, Partially Picked, Fully Picked, Issued, Closed]
 *           example: "Generated"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               component_part_no:
 *                 type: string
 *               component_description:
 *                 type: string
 *               required_qty:
 *                 type: number
 *               picked_qty:
 *                 type: number
 *               shortage_qty:
 *                 type: number
 *               pick_status:
 *                 type: string
 *                 enum: [Pending, Picked, Short, Substituted]
 *               batch_no:
 *                 type: string
 *               bin_id:
 *                 type: string
 *               unit_cost:
 *                 type: number
 *               total_cost:
 *                 type: number
 *         total_cost:
 *           type: number
 *         picked_by:
 *           type: object
 *         issued_to:
 *           type: object
 *         picked_at:
 *           type: string
 *           format: date-time
 *         issued_at:
 *           type: string
 *           format: date-time
 *
 *     TorqueRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         torque_record_id:
 *           type: string
 *           example: "TQR-202604-0001"
 *         wo_id:
 *           type: string
 *         wo_number:
 *           type: string
 *         assembly_serial_no:
 *           type: string
 *         assembly_seq_no:
 *           type: integer
 *         op_sequence:
 *           type: integer
 *         operation_name:
 *           type: string
 *         joint_reference:
 *           type: string
 *           example: "J1 - Phase A Terminal"
 *         bolt_part_no:
 *           type: string
 *         bolt_size:
 *           type: string
 *           example: "M6 × 12mm"
 *         specified_torque_nm:
 *           type: number
 *           example: 9.0
 *         torque_min_nm:
 *           type: number
 *         torque_max_nm:
 *           type: number
 *         actual_torque_nm:
 *           type: number
 *           example: 9.2
 *         within_spec:
 *           type: boolean
 *         torque_tool_id:
 *           type: string
 *         torque_tool_name:
 *           type: string
 *         applied_by:
 *           type: object
 *         applied_by_name:
 *           type: string
 *         applied_at:
 *           type: string
 *           format: date-time
 *         pass_fail:
 *           type: string
 *           enum: [Pass, Fail]
 *         failure_action:
 *           type: string
 *         verified_by:
 *           type: object
 *         verified_at:
 *           type: string
 *           format: date-time
 *
 *     FunctionalTestRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         test_record_id:
 *           type: string
 *           example: "FTR-202604-0001"
 *         wo_id:
 *           type: string
 *         wo_number:
 *           type: string
 *         test_date:
 *           type: string
 *           format: date-time
 *         test_type:
 *           type: string
 *           enum: [Continuity Test, HiPot Test, Pressure Test, Leak Test, Dimensional Verification, Functional Operation Test, Insulation Resistance, Visual Inspection, Other]
 *         test_standard:
 *           type: string
 *           example: "IEC 61439"
 *         test_equipment_id:
 *           type: string
 *         test_equipment_name:
 *           type: string
 *         test_parameter:
 *           type: string
 *           example: "Resistance between Phase A and Phase B"
 *         specified_value:
 *           type: string
 *           example: "≤ 0.5 mΩ"
 *         tested_by:
 *           type: object
 *         witness_id:
 *           type: object
 *         results:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               serial_no:
 *                 type: string
 *               actual_value:
 *                 type: string
 *               pass_fail:
 *                 type: string
 *               remarks:
 *                 type: string
 *         overall_result:
 *           type: string
 *           enum: [Passed, Failed, Partially Passed]
 *         passed_count:
 *           type: integer
 *         failed_count:
 *           type: integer
 *         test_report_path:
 *           type: string
 *
 *     SubAssemblyDependency:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         register_id:
 *           type: string
 *           example: "SAR-202604-0001"
 *         parent_wo_id:
 *           type: object
 *         parent_wo_number:
 *           type: string
 *         child_wo_id:
 *           type: object
 *         child_wo_number:
 *           type: string
 *         child_part_no:
 *           type: string
 *         required_qty:
 *           type: number
 *         available_qty:
 *           type: number
 *         shortage_qty:
 *           type: number
 *         dependency_met:
 *           type: boolean
 *
 *     ShortageReport:
 *       type: object
 *       properties:
 *         report_date:
 *           type: string
 *           format: date-time
 *         total_shortages:
 *           type: integer
 *         critical_shortages:
 *           type: integer
 *         shortages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               picklist_id:
 *                 type: string
 *               wo_number:
 *                 type: string
 *               wo_priority:
 *                 type: string
 *               component_part_no:
 *                 type: string
 *               component_description:
 *                 type: string
 *               required_qty:
 *                 type: number
 *               picked_qty:
 *                 type: number
 *               shortage_qty:
 *                 type: number
 */

// ======================================================
// COMPONENT PICK LIST APIs
// ======================================================

/**
 * @swagger
 * /api/assembly/picklists:
 *   get:
 *     summary: List all component pick lists
 *     description: Returns paginated list of component pick lists with optional filters
 *     tags: [Assembly]
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
 *           enum: [Generated, Partially Picked, Fully Picked, Issued, Closed]
 *       - in: query
 *         name: wo_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pick lists retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/picklists', pickListController.listPickLists);

/**
 * @swagger
 * /api/assembly/picklists/wo/{wo_id}:
 *   get:
 *     summary: Get pick list by Work Order ID
 *     description: Returns the component pick list for a specific work order
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pick list retrieved successfully
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/picklists/wo/:wo_id', pickListController.getPickListByWorkOrder);

/**
 * @swagger
 * /api/assembly/picklists/{id}:
 *   get:
 *     summary: Get pick list by ID
 *     description: Returns component pick list by its database ID
 *     tags: [Assembly]
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
 *         description: Pick list retrieved successfully
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/picklists/:id', pickListController.getPickListById);

/**
 * @swagger
 * /api/assembly/picklists:
 *   post:
 *     summary: Create a new pick list manually
 *     description: Manually generate a component pick list for a work order
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wo_id
 *             properties:
 *               wo_id:
 *                 type: string
 *                 description: Work Order ID
 *     responses:
 *       201:
 *         description: Pick list created successfully
 *       400:
 *         description: Pick list already exists or validation error
 *       404:
 *         description: Work Order not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/picklists', pickListController.createPickList);

/**
 * @swagger
 * /api/assembly/picklists/{id}/status:
 *   get:
 *     summary: Get pick list status for assembly dashboard
 *     description: Returns detailed pick list status including summary statistics
 *     tags: [Assembly]
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
 *         description: Pick list status retrieved
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/picklists/:id/status', pickListController.getPickListStatus);

/**
 * @swagger
 * /api/assembly/picklists/{id}/pick:
 *   put:
 *     summary: Update pick list with picked quantities
 *     description: Store team updates actual quantities picked from bins
 *     tags: [Assembly]
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
 *               - picks
 *               - picked_by
 *             properties:
 *               picks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - picked_qty
 *                   properties:
 *                     item_id:
 *                       type: string
 *                     picked_qty:
 *                       type: number
 *                     batch_no:
 *                       type: string
 *                     bin_id:
 *                       type: string
 *                     is_substitute:
 *                       type: boolean
 *                     substitute_reason:
 *                       type: string
 *                     remarks:
 *                       type: string
 *               picked_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pick list updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/picklists/:id/pick', pickListController.updatePickList);

/**
 * @swagger
 * /api/assembly/picklists/{id}/issue:
 *   post:
 *     summary: Issue components to assembly floor
 *     description: Transfers all picked components to the assembly floor
 *     tags: [Assembly]
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
 *               - issued_to
 *             properties:
 *               issued_to:
 *                 type: string
 *               allow_partial:
 *                 type: boolean
 *                 default: false
 *                 description: Allow partial issue when shortages exist
 *     responses:
 *       200:
 *         description: Components issued successfully
 *       400:
 *         description: Pick list not ready for issue
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/picklists/:id/issue', pickListController.issuePickList);

/**
 * @swagger
 * /api/assembly/picklists/{id}/cancel:
 *   post:
 *     summary: Cancel pick list
 *     description: Cancels a pick list (only if not issued yet)
 *     tags: [Assembly]
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pick list cancelled successfully
 *       400:
 *         description: Cannot cancel issued pick list
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/picklists/:id/cancel', pickListController.cancelPickList);

/**
 * @swagger
 * /api/assembly/picklists/{id}/pdf:
 *   get:
 *     summary: Generate pick list PDF
 *     description: Returns pick list data formatted for PDF generation
 *     tags: [Assembly]
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
 *         description: Pick list PDF data retrieved
 *       404:
 *         description: Pick list not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/picklists/:id/pdf', pickListController.generatePickListPDF);

/**
 * @swagger
 * /api/assembly/shortage-report:
 *   get:
 *     summary: Get component shortage report
 *     description: Returns all components with shortages across active pick lists
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: component_type
 *         schema:
 *           type: string
 *           enum: [Raw Material, Sub-Assembly, Bought-Out, Consumable]
 *     responses:
 *       200:
 *         description: Shortage report generated
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/shortage-report', pickListController.getShortageReport);

// ======================================================
// TORQUE RECORD APIs
// ======================================================

/**
 * @swagger
 * /api/assembly/torque-records:
 *   post:
 *     summary: Record torque value for fastener joint
 *     description: Records actual torque applied to a critical fastener joint
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wo_id
 *               - op_sequence
 *               - joint_reference
 *               - specified_torque_nm
 *               - actual_torque_nm
 *               - torque_tool_id
 *               - applied_by
 *             properties:
 *               wo_id:
 *                 type: string
 *               wo_number:
 *                 type: string
 *               assembly_serial_no:
 *                 type: string
 *               assembly_seq_no:
 *                 type: integer
 *               op_sequence:
 *                 type: integer
 *               joint_reference:
 *                 type: string
 *               bolt_part_no:
 *                 type: string
 *               bolt_size:
 *                 type: string
 *               specified_torque_nm:
 *                 type: number
 *               torque_min_nm:
 *                 type: number
 *               torque_max_nm:
 *                 type: number
 *               actual_torque_nm:
 *                 type: number
 *               torque_tool_id:
 *                 type: string
 *               applied_by:
 *                 type: string
 *               failure_action:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Torque recorded successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Work Order not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/torque-records', validateTorqueTool, torqueController.recordTorque);

/**
 * @swagger
 * /api/assembly/torque-records/wo/{wo_id}:
 *   get:
 *     summary: Get all torque records for a work order
 *     description: Returns complete torque log with summary statistics
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: assembly_serial_no
 *         schema:
 *           type: string
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: pass_fail
 *         schema:
 *           type: string
 *           enum: [Pass, Fail]
 *     responses:
 *       200:
 *         description: Torque records retrieved
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/torque-records/wo/:wo_id', torqueController.getTorqueRecordsByWorkOrder);

/**
 * @swagger
 * /api/assembly/torque-records/wo/:wo_id/summary:
 *   get:
 *     summary: Get torque summary by joint
 *     description: Returns aggregated torque statistics grouped by joint reference
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Torque summary retrieved
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/torque-records/wo/:wo_id/summary', torqueController.getTorqueSummaryByJoint);

// ======================================================
// FUNCTIONAL TEST APIs
// ======================================================

/**
 * @swagger
 * /api/assembly/functional-tests:
 *   post:
 *     summary: Create functional test record
 *     description: Records results of functional testing after assembly
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wo_id
 *               - test_type
 *               - test_parameter
 *               - specified_value
 *               - tested_by
 *               - results
 *             properties:
 *               wo_id:
 *                 type: string
 *               wo_number:
 *                 type: string
 *               test_date:
 *                 type: string
 *                 format: date-time
 *               test_type:
 *                 type: string
 *                 enum: [Continuity Test, HiPot Test, Pressure Test, Leak Test, Dimensional Verification, Functional Operation Test, Insulation Resistance, Visual Inspection, Other]
 *               test_standard:
 *                 type: string
 *               test_equipment_id:
 *                 type: string
 *               test_equipment_name:
 *                 type: string
 *               test_parameter:
 *                 type: string
 *               specified_value:
 *                 type: string
 *               tested_by:
 *                 type: string
 *               witness_id:
 *                 type: string
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - serial_no
 *                     - actual_value
 *                   properties:
 *                     serial_no:
 *                       type: string
 *                     actual_value:
 *                       type: string
 *                     pass_fail:
 *                       type: string
 *                       enum: [Pass, Fail]
 *                     remarks:
 *                       type: string
 *               test_report_path:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test record created successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Work Order not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/functional-tests', testController.createFunctionalTest);

/**
 * @swagger
 * /api/assembly/functional-tests/wo/{wo_id}:
 *   get:
 *     summary: Get all functional tests for a work order
 *     description: Returns all test records with summary statistics
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: test_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: overall_result
 *         schema:
 *           type: string
 *           enum: [Passed, Failed, Partially Passed]
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Test records retrieved
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/functional-tests/wo/:wo_id', testController.getFunctionalTestsByWorkOrder);

/**
 * @swagger
 * /api/assembly/functional-tests/wo/{wo_id}/summary:
 *   get:
 *     summary: Get test summary by test type
 *     description: Returns aggregated test statistics grouped by test type
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test summary retrieved
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/functional-tests/wo/:wo_id/summary', testController.getTestSummaryByType);

// ======================================================
// SUB-ASSEMBLY APIs
// ======================================================

/**
 * @swagger
 * /api/assembly/sub-assemblies/wo/{wo_id}:
 *   get:
 *     summary: Get sub-assembly dependencies for a work order
 *     description: Returns all child sub-assemblies required for this parent assembly
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sub-assembly dependencies retrieved
 *       404:
 *         description: Work Order not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/sub-assemblies/wo/:wo_id', subAssemblyController.getSubAssemblyDependencies);

/**
 * @swagger
 * /api/assembly/sub-assemblies/register:
 *   get:
 *     summary: Get sub-assembly dependency register
 *     description: Returns all parent-child sub-assembly dependencies
 *     tags: [Assembly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parent_wo_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: child_wo_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: dependency_met
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Sub-assembly register retrieved
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/sub-assemblies/register', subAssemblyController.getSubAssemblyRegister);

module.exports = router;