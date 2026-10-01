// routes/BOM/machineRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMachine,
  getMachines,
  getMachineById,
  updateMachine,
  updateMachineStatus,
  getCapacityReport
} = require('../../controllers/BOM/machineController');
const { protect } = require('../../middleware/authMiddleware');

// All routes require authentication (but role checks inside controllers)
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Machine Master
 *   description: Machine and Work Centre Management - Phase 04
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Machine:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         machine_id:
 *           type: string
 *           example: "MCH-000015"
 *           description: "Auto-generated unique machine identifier"
 *         machine_name:
 *           type: string
 *           example: "Minster 80T Progressive Press"
 *           description: "Full descriptive name of the machine"
 *         machine_code:
 *           type: string
 *           example: "PR-80T-01"
 *           description: "Short unique code for shop floor displays"
 *         machine_type:
 *           type: string
 *           enum: [Press, CNC, Lathe, Milling, Drilling, Grinding, Welding, Bending, Laser Cutting, Plating, Assembly, Inspection, Other]
 *           example: "Press"
 *           description: "Category of machine"
 *         capacity_value:
 *           type: number
 *           example: 80
 *           description: "Numerical capacity value"
 *         capacity_unit:
 *           type: string
 *           enum: [Ton, kW, mm, SPM, RPM, Liters, None]
 *           default: "None"
 *           example: "Ton"
 *           description: "Unit of capacity measurement"
 *         work_centre:
 *           type: string
 *           example: "Press Shop"
 *           description: "Department or bay where machine is located"
 *         shifts_per_day:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *           default: 2
 *           example: 2
 *           description: "Number of production shifts per day"
 *         hours_per_shift:
 *           type: integer
 *           minimum: 0
 *           maximum: 12
 *           default: 8
 *           example: 8
 *           description: "Productive hours per shift"
 *         available_hours_per_day:
 *           type: integer
 *           example: 16
 *           description: "Auto-computed: shifts_per_day × hours_per_shift"
 *         oee_target_percent:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 75
 *           example: 75
 *           description: "Overall Equipment Effectiveness target"
 *         status:
 *           type: string
 *           enum: [Active, Idle, Under Maintenance, Breakdown, Decommissioned]
 *           default: "Active"
 *           example: "Active"
 *           description: "Current operational status"
 *         make:
 *           type: string
 *           example: "Minster"
 *           description: "Manufacturer name"
 *         model:
 *           type: string
 *           example: "E2-80T"
 *           description: "Machine model number"
 *         serial_number:
 *           type: string
 *           example: "MIN-80T-2023-001"
 *           description: "Manufacturer's serial number"
 *         installation_date:
 *           type: string
 *           format: date
 *           example: "2023-01-15"
 *           description: "Date machine was installed"
 *         last_maintenance_date:
 *           type: string
 *           format: date
 *           example: "2026-01-10"
 *           description: "Date of last maintenance"
 *         next_maintenance_date:
 *           type: string
 *           format: date
 *           example: "2026-02-10"
 *           description: "Scheduled next maintenance date"
 *         location:
 *           type: string
 *           example: "Press Shop, Bay A, Row 2"
 *           description: "Physical location in factory"
 *         operating_cost_per_hour:
 *           type: number
 *           default: 0
 *           example: 500
 *           description: "Internal cost per hour to operate (₹)"
 *         maintenance_cost_per_hour:
 *           type: number
 *           default: 0
 *           example: 50
 *           description: "Average maintenance cost per hour (₹)"
 *         is_active:
 *           type: boolean
 *           default: true
 *           example: true
 *           description: "Soft delete flag"
 *         created_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     MachineCreateRequest:
 *       type: object
 *       required:
 *         - machine_name
 *         - machine_code
 *         - machine_type
 *         - work_centre
 *       properties:
 *         machine_name:
 *           type: string
 *           example: "Minster 80T Progressive Press"
 *           description: "Full descriptive name"
 *         machine_code:
 *           type: string
 *           example: "PR-80T-01"
 *           description: "Unique short code (uppercase, no spaces)"
 *         machine_type:
 *           type: string
 *           enum: [Press, CNC, Lathe, Milling, Drilling, Grinding, Welding, Bending, Laser Cutting, Plating, Assembly, Inspection, Other]
 *           example: "Press"
 *         capacity_value:
 *           type: number
 *           example: 80
 *           description: "Numerical capacity (e.g., 80 tons)"
 *         capacity_unit:
 *           type: string
 *           enum: [Ton, kW, mm, SPM, RPM, Liters, None]
 *           default: "None"
 *           example: "Ton"
 *         work_centre:
 *           type: string
 *           example: "Press Shop"
 *           description: "Department name"
 *         shifts_per_day:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *           default: 2
 *           example: 2
 *         hours_per_shift:
 *           type: integer
 *           minimum: 0
 *           maximum: 12
 *           default: 8
 *           example: 8
 *         oee_target_percent:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 75
 *           example: 75
 *         make:
 *           type: string
 *           example: "Minster"
 *         model:
 *           type: string
 *           example: "E2-80T"
 *         serial_number:
 *           type: string
 *           example: "MIN-80T-2023-001"
 *         installation_date:
 *           type: string
 *           format: date
 *           example: "2023-01-15"
 *         location:
 *           type: string
 *           example: "Press Shop, Bay A, Row 2"
 *         operating_cost_per_hour:
 *           type: number
 *           example: 500
 *           description: "Internal operating cost per hour (₹)"
 *         maintenance_cost_per_hour:
 *           type: number
 *           example: 50
 *           description: "Maintenance cost per hour (₹)"
 *
 *     MachineUpdateRequest:
 *       type: object
 *       properties:
 *         machine_name:
 *           type: string
 *         machine_code:
 *           type: string
 *         machine_type:
 *           type: string
 *           enum: [Press, CNC, Lathe, Milling, Drilling, Grinding, Welding, Bending, Laser Cutting, Plating, Assembly, Inspection, Other]
 *         capacity_value:
 *           type: number
 *         capacity_unit:
 *           type: string
 *           enum: [Ton, kW, mm, SPM, RPM, Liters, None]
 *         work_centre:
 *           type: string
 *         shifts_per_day:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *         hours_per_shift:
 *           type: integer
 *           minimum: 0
 *           maximum: 12
 *         oee_target_percent:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         status:
 *           type: string
 *           enum: [Active, Idle, Under Maintenance, Breakdown, Decommissioned]
 *         make:
 *           type: string
 *         model:
 *           type: string
 *         serial_number:
 *           type: string
 *         installation_date:
 *           type: string
 *           format: date
 *         location:
 *           type: string
 *         operating_cost_per_hour:
 *           type: number
 *         maintenance_cost_per_hour:
 *           type: number
 *         is_active:
 *           type: boolean
 *
 *     StatusUpdateRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Active, Idle, Under Maintenance, Breakdown, Decommissioned]
 *           example: "Breakdown"
 *
 *     CapacityReportItem:
 *       type: object
 *       properties:
 *         machine_id:
 *           type: string
 *         machine_name:
 *           type: string
 *         machine_code:
 *           type: string
 *         work_centre:
 *           type: string
 *         available_hours_per_day:
 *           type: integer
 *         shifts_per_day:
 *           type: integer
 *         hours_per_shift:
 *           type: integer
 *         operating_cost_per_hour:
 *           type: number
 *         status:
 *           type: string
 *         scheduled_hours_today:
 *           type: integer
 *         utilization_percent:
 *           type: number
 *         oee_today:
 *           type: number
 *
 *   responses:
 *     MachineNotFound:
 *       description: Machine not found
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
 *                 example: "Machine not found"
 *
 *     DuplicateMachineCode:
 *       description: Machine code already exists
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
 *                 example: "Machine code PR-80T-01 already exists"
 *
 *     ValidationError:
 *       description: Validation error
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
 *                 example: "Missing required fields: machine_name, machine_code, machine_type, work_centre"
 *
 *     InsufficientPermissions:
 *       description: Insufficient permissions
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
 *                 example: "Insufficient permissions. Admin or Manager role required."
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/machines:
 *   get:
 *     summary: Get all machines with pagination and filtering
 *     tags: [Machine Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: machine_type
 *         schema:
 *           type: string
 *           enum: [Press, CNC, Lathe, Milling, Drilling, Grinding, Welding, Bending, Laser Cutting, Plating, Assembly, Inspection, Other]
 *         description: Filter by machine type
 *       - in: query
 *         name: work_centre
 *         schema:
 *           type: string
 *         description: Filter by work centre
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Idle, Under Maintenance, Breakdown, Decommissioned]
 *         description: Filter by status
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "machine_code"
 *         description: Sort field
 *     responses:
 *       200:
 *         description: Machines retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Machine'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             machine_id: "MCH-000015"
 *             machine_name: "Minster 80T Progressive Press"
 *             machine_code: "PR-80T-01"
 *             machine_type: "Press"
 *             capacity_value: 80
 *             capacity_unit: "Ton"
 *             work_centre: "Press Shop"
 *             shifts_per_day: 2
 *             hours_per_shift: 8
 *             available_hours_per_day: 16
 *             status: "Active"
 *             operating_cost_per_hour: 500
 *             created_at: "2026-01-22T10:30:00.000Z"
 *         pagination:
 *           page: 1
 *           limit: 20
 *           total: 15
 *           pages: 1
 */
router.get('/', getMachines);

/**
 * @swagger
 * /api/machines/capacity-report:
 *   get:
 *     summary: Get machine capacity report
 *     tags: [Machine Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for capacity analysis
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for capacity analysis
 *     responses:
 *       200:
 *         description: Capacity report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CapacityReportItem'
 *                 note:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           - machine_id: "MCH-000015"
 *             machine_name: "Minster 80T Progressive Press"
 *             machine_code: "PR-80T-01"
 *             work_centre: "Press Shop"
 *             available_hours_per_day: 16
 *             shifts_per_day: 2
 *             hours_per_shift: 8
 *             operating_cost_per_hour: 500
 *             status: "Active"
 *             scheduled_hours_today: 0
 *             utilization_percent: 0
 *             oee_today: 0
 *         note: "Load data will be available after production scheduling is implemented"
 */
router.get('/capacity-report', getCapacityReport);

/**
 * @swagger
 * /api/machines/{id}:
 *   get:
 *     summary: Get machine by ID
 *     tags: [Machine Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ObjectId
 *     responses:
 *       200:
 *         description: Machine retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Machine'
 *       404:
 *         $ref: '#/components/responses/MachineNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           machine_id: "MCH-000015"
 *           machine_name: "Minster 80T Progressive Press"
 *           machine_code: "PR-80T-01"
 *           machine_type: "Press"
 *           capacity_value: 80
 *           capacity_unit: "Ton"
 *           work_centre: "Press Shop"
 *           shifts_per_day: 2
 *           hours_per_shift: 8
 *           available_hours_per_day: 16
 *           oee_target_percent: 75
 *           status: "Active"
 *           make: "Minster"
 *           model: "E2-80T"
 *           serial_number: "MIN-80T-2023-001"
 *           installation_date: "2023-01-15"
 *           location: "Press Shop, Bay A, Row 2"
 *           operating_cost_per_hour: 500
 *           is_active: true
 *           created_at: "2026-01-22T10:30:00.000Z"
 */
router.get('/:id', getMachineById);

/**
 * @swagger
 * /api/machines:
 *   post:
 *     summary: Create a new machine (Admin/Manager only)
 *     tags: [Machine Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MachineCreateRequest'
 *           examples:
 *             Press Machine:
 *               summary: 80 Ton Progressive Press
 *               value:
 *                 machine_name: "Minster 80T Progressive Press"
 *                 machine_code: "PR-80T-01"
 *                 machine_type: "Press"
 *                 capacity_value: 80
 *                 capacity_unit: "Ton"
 *                 work_centre: "Press Shop"
 *                 shifts_per_day: 2
 *                 hours_per_shift: 8
 *                 oee_target_percent: 75
 *                 make: "Minster"
 *                 model: "E2-80T"
 *                 serial_number: "MIN-80T-2023-001"
 *                 installation_date: "2023-01-15"
 *                 location: "Press Shop, Bay A, Row 2"
 *                 operating_cost_per_hour: 500
 *             CNC Machine:
 *               summary: HAAS VF-2 CNC Mill
 *               value:
 *                 machine_name: "HAAS VF-2 CNC Vertical Machining Center"
 *                 machine_code: "CNC-01"
 *                 machine_type: "CNC"
 *                 capacity_value: 640
 *                 capacity_unit: "mm"
 *                 work_centre: "CNC Bay"
 *                 shifts_per_day: 2
 *                 hours_per_shift: 8
 *                 make: "HAAS"
 *                 model: "VF-2"
 *                 serial_number: "HAAS-VF2-2024-088"
 *                 operating_cost_per_hour: 850
 *     responses:
 *       201:
 *         description: Machine created successfully
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
 *                   example: "Machine created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Machine'
 *       400:
 *         oneOf:
 *           - $ref: '#/components/responses/DuplicateMachineCode'
 *           - $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Not authenticated
 *       403:
 *         $ref: '#/components/responses/InsufficientPermissions'
 *       500:
 *         description: Server error
 *     example:
 *       request:
 *         machine_name: "Minster 80T Progressive Press"
 *         machine_code: "PR-80T-01"
 *         machine_type: "Press"
 *         work_centre: "Press Shop"
 *         shifts_per_day: 2
 *         hours_per_shift: 8
 *       response:
 *         success: true
 *         message: "Machine created successfully"
 *         data:
 *           _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           machine_id: "MCH-000015"
 *           machine_name: "Minster 80T Progressive Press"
 *           machine_code: "PR-80T-01"
 *           machine_type: "Press"
 *           work_centre: "Press Shop"
 *           shifts_per_day: 2
 *           hours_per_shift: 8
 *           available_hours_per_day: 16
 *           status: "Active"
 */
router.post('/', createMachine);

/**
 * @swagger
 * /api/machines/{id}:
 *   put:
 *     summary: Update an existing machine (Manager only)
 *     tags: [Machine Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MachineUpdateRequest'
 *           examples:
 *             Update Status:
 *               value:
 *                 status: "Under Maintenance"
 *                 last_maintenance_date: "2026-01-22"
 *             Update Operating Cost:
 *               value:
 *                 operating_cost_per_hour: 550
 *             Deactivate:
 *               value:
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Machine updated successfully
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
 *                   example: "Machine updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Machine'
 *       400:
 *         $ref: '#/components/responses/DuplicateMachineCode'
 *       404:
 *         $ref: '#/components/responses/MachineNotFound'
 *       401:
 *         description: Not authenticated
 *       403:
 *         $ref: '#/components/responses/InsufficientPermissions'
 *       500:
 *         description: Server error
 *     example:
 *       response:
 *         success: true
 *         message: "Machine updated successfully"
 *         data:
 *           _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           machine_name: "Minster 80T Progressive Press"
 *           status: "Under Maintenance"
 *           last_maintenance_date: "2026-01-22"
 */
router.put('/:id', updateMachine);

/**
 * @swagger
 * /api/machines/{id}/status:
 *   put:
 *     summary: Update machine status (Manager only) - with breakdown conflict handling
 *     tags: [Machine Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdateRequest'
 *           examples:
 *             Set Breakdown:
 *               value:
 *                 status: "Breakdown"
 *             Set Active:
 *               value:
 *                 status: "Active"
 *             Set Maintenance:
 *               value:
 *                 status: "Under Maintenance"
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *                   $ref: '#/components/schemas/Machine'
 *       400:
 *         description: Invalid status or missing status field
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
 *                   example: "Invalid status. Valid values: Active, Idle, Under Maintenance, Breakdown, Decommissioned"
 *       404:
 *         $ref: '#/components/responses/MachineNotFound'
 *       401:
 *         description: Not authenticated
 *       403:
 *         $ref: '#/components/responses/InsufficientPermissions'
 *       500:
 *         description: Server error
 *     example:
 *       request:
 *         status: "Breakdown"
 *       response:
 *         success: true
 *         message: "Machine status changed to Breakdown. 3 schedule slot(s) flagged."
 *         data:
 *           _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           machine_code: "PR-80T-01"
 *           status: "Breakdown"
 *           last_maintenance_date: "2026-01-22"
 */
router.put('/:id/status', updateMachineStatus);

module.exports = router;