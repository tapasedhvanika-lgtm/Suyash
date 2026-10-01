// routes/CRM/processRoutes.js
'use strict';
const express = require('express');
const router = express.Router();
const {
  getProcesses,
  getProcess,
  createProcess,
  updateProcess,
  deleteProcess,
  getProcessesDropdown,
  getProcessesByCategory
} = require('../../controllers/CRM/processController');
const { protect } = require('../../middleware/authMiddleware');

// All routes are protected
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Processes
 *   description: Process master - defines manufacturing operations (NO PRICES - only rate_type)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MachineReference:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         machine_id:
 *           type: string
 *           example: "MCH-001"
 *         machine_name:
 *           type: string
 *           example: "HAAS VF-2 CNC Mill"
 *         machine_code:
 *           type: string
 *           example: "CNC-01"
 *
 *     Process:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         process_id:
 *           type: string
 *           example: "PROC-CNC-001"
 *         process_name:
 *           type: string
 *           example: "CNC Drilling"
 *         description:
 *           type: string
 *           example: "Precision drilling on CNC machine"
 *         category:
 *           type: string
 *           enum: [Core, Finishing, Packing, Other]
 *           example: "Core"
 *         rate_type:
 *           type: string
 *           enum: [Per Kg, Per Nos, Per Hour, Fixed]
 *           example: "Per Hour"
 *           description: "HOW to calculate cost (NOT the price). Actual price entered in quotation."
 *         work_centre:
 *           $ref: '#/components/schemas/MachineReference'
 *         setup_time_min:
 *           type: number
 *           example: 15
 *         cycle_time_min:
 *           type: number
 *           example: 2.5
 *         is_subcontract:
 *           type: boolean
 *           example: false
 *         default_vendor:
 *           type: string
 *           nullable: true
 *         is_active:
 *           type: boolean
 *           example: true
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
 *     ProcessCreate:
 *       type: object
 *       required:
 *         - process_name
 *         - category
 *         - rate_type
 *       properties:
 *         process_id:
 *           type: string
 *           example: "PROC-CNC-001"
 *           description: "Optional - auto-generated if not provided"
 *         process_name:
 *           type: string
 *           required: true
 *           example: "CNC Drilling"
 *         description:
 *           type: string
 *           example: "Precision drilling on CNC machine"
 *         category:
 *           type: string
 *           required: true
 *           enum: [Core, Finishing, Packing, Other]
 *           example: "Core"
 *         rate_type:
 *           type: string
 *           required: true
 *           enum: [Per Kg, Per Nos, Per Hour, Fixed]
 *           example: "Per Hour"
 *           description: "HOW to calculate cost (NOT the price)"
 *         work_centre:
 *           type: string
 *           description: "Machine ID (ObjectId) from Machine Master"
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         setup_time_min:
 *           type: number
 *           default: 0
 *           example: 15
 *         cycle_time_min:
 *           type: number
 *           default: 0
 *           example: 2.5
 *         is_subcontract:
 *           type: boolean
 *           default: false
 *         default_vendor:
 *           type: string
 *           nullable: true
 *
 *     ProcessUpdate:
 *       type: object
 *       properties:
 *         process_name:
 *           type: string
 *           example: "CNC Drilling - Updated"
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [Core, Finishing, Packing, Other]
 *         rate_type:
 *           type: string
 *           enum: [Per Kg, Per Nos, Per Hour, Fixed]
 *         work_centre:
 *           type: string
 *           description: "Machine ID (ObjectId)"
 *         setup_time_min:
 *           type: number
 *         cycle_time_min:
 *           type: number
 *         is_subcontract:
 *           type: boolean
 *         is_active:
 *           type: boolean
 *
 *     ProcessDropdown:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         process_id:
 *           type: string
 *         process_name:
 *           type: string
 *         category:
 *           type: string
 *         rate_type:
 *           type: string
 *         work_centre:
 *           $ref: '#/components/schemas/MachineReference'
 *
 *     ProcessesByCategory:
 *       type: object
 *       properties:
 *         Core:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessDropdown'
 *         Finishing:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessDropdown'
 *         Packing:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessDropdown'
 *         Other:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessDropdown'
 *
 *   responses:
 *     ProcessNotFound:
 *       description: Process not found
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
 *                 example: "Process not found"
 *
 *     DuplicateProcess:
 *       description: Process with this ID or name already exists
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
 *                 example: "process_name already exists"
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
 *                 example: "process_name is required, category is required"
 *
 *     ProcessInUse:
 *       description: Cannot delete process because it's used in routings
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
 *                 example: "Cannot deactivate. Process is used in 3 active routing(s)."
 *
 *   parameters:
 *     categoryParam:
 *       in: query
 *       name: category
 *       schema:
 *         type: string
 *         enum: [Core, Finishing, Packing, Other]
 *       description: Filter by process category
 *     rateTypeParam:
 *       in: query
 *       name: rate_type
 *       schema:
 *         type: string
 *         enum: [Per Kg, Per Nos, Per Hour, Fixed]
 *       description: Filter by rate type
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/processes:
 *   get:
 *     summary: Get all processes with pagination and filtering
 *     tags: [Processes]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - $ref: '#/components/parameters/categoryParam'
 *       - $ref: '#/components/parameters/rateTypeParam'
 *     responses:
 *       200:
 *         description: Processes retrieved successfully
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
 *                     $ref: '#/components/schemas/Process'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             process_id: "PROC-CNC-001"
 *             process_name: "CNC Drilling"
 *             category: "Core"
 *             rate_type: "Per Hour"
 *             work_centre:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               machine_id: "MCH-001"
 *               machine_name: "HAAS VF-2 CNC Mill"
 *             setup_time_min: 15
 *             cycle_time_min: 2.5
 *             is_active: true
 *             created_at: "2026-01-22T10:30:00.000Z"
 *         pagination:
 *           currentPage: 1
 *           totalPages: 5
 *           totalItems: 50
 *           itemsPerPage: 10
 */
router.get('/', protect, getProcesses);

/**
 * @swagger
 * /api/processes/dropdown:
 *   get:
 *     summary: Get processes for dropdown (lightweight)
 *     tags: [Processes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/categoryParam'
 *     responses:
 *       200:
 *         description: Processes retrieved successfully
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
 *                     $ref: '#/components/schemas/ProcessDropdown'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             process_id: "PROC-CNC-001"
 *             process_name: "CNC Drilling"
 *             category: "Core"
 *             rate_type: "Per Hour"
 *             work_centre:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               machine_id: "MCH-001"
 *               machine_name: "HAAS VF-2 CNC Mill"
 */
router.get('/dropdown', protect, getProcessesDropdown);

/**
 * @swagger
 * /api/processes/by-category:
 *   get:
 *     summary: Get processes grouped by category
 *     tags: [Processes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Processes grouped by category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProcessesByCategory'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           Core:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               process_id: "PROC-CNC-001"
 *               process_name: "CNC Drilling"
 *               rate_type: "Per Hour"
 *           Finishing:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7c0"
 *               process_id: "PROC-PLATE-001"
 *               process_name: "Nickel Plating"
 *               rate_type: "Per Kg"
 *           Packing:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7c1"
 *               process_id: "PROC-PACK-001"
 *               process_name: "Box Packing"
 *               rate_type: "Per Nos"
 *           Other: []
 */
router.get('/by-category', protect, getProcessesByCategory);

/**
 * @swagger
 * /api/processes/{id}:
 *   get:
 *     summary: Get single process by ID
 *     tags: [Processes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Process ID
 *     responses:
 *       200:
 *         description: Process retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       404:
 *         $ref: '#/components/responses/ProcessNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       value:
 *         success: true
 *         data:
 *           _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           process_id: "PROC-CNC-001"
 *           process_name: "CNC Drilling"
 *           category: "Core"
 *           rate_type: "Per Hour"
 *           work_centre:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *             machine_id: "MCH-001"
 *             machine_name: "HAAS VF-2 CNC Mill"
 *             status: "Active"
 *           setup_time_min: 15
 *           cycle_time_min: 2.5
 *           is_active: true
 */
router.get('/:id', protect, getProcess);

/**
 * @swagger
 * /api/processes:
 *   post:
 *     summary: Create a new process
 *     tags: [Processes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessCreate'
 *           examples:
 *             CNC Drilling:
 *               summary: CNC Drilling Operation
 *               value:
 *                 process_id: "PROC-CNC-001"
 *                 process_name: "CNC Drilling"
 *                 description: "Precision drilling on CNC machine"
 *                 category: "Core"
 *                 rate_type: "Per Hour"
 *                 work_centre: "64f8e9b7a1b2c3d4e5f6a7b9"
 *                 setup_time_min: 15
 *                 cycle_time_min: 2.5
 *                 is_subcontract: false
 *             Nickel Plating:
 *               summary: Subcontract Plating
 *               value:
 *                 process_id: "PROC-PLATE-001"
 *                 process_name: "Nickel Plating"
 *                 description: "Electrolytic nickel plating 8-12 micron"
 *                 category: "Finishing"
 *                 rate_type: "Per Kg"
 *                 is_subcontract: true
 *                 default_vendor: "64f8e9b7a1b2c3d4e5f6a7c0"
 *     responses:
 *       201:
 *         description: Process created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *                 message:
 *                   type: string
 *                   example: "Process created successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateProcess'
 *               - $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       request:
 *         process_name: "CNC Drilling"
 *         category: "Core"
 *         rate_type: "Per Hour"
 *         work_centre: "64f8e9b7a1b2c3d4e5f6a7b9"
 *         setup_time_min: 15
 *         cycle_time_min: 2.5
 *       response:
 *         success: true
 *         data:
 *           _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           process_id: "PROC-CNC-001"
 *           process_name: "CNC Drilling"
 *           category: "Core"
 *           rate_type: "Per Hour"
 *           work_centre:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *             machine_id: "MCH-001"
 *             machine_name: "HAAS VF-2 CNC Mill"
 *           setup_time_min: 15
 *           cycle_time_min: 2.5
 *         message: "Process created successfully"
 */
router.post('/', protect, createProcess);

/**
 * @swagger
 * /api/processes/{id}:
 *   put:
 *     summary: Update an existing process
 *     tags: [Processes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Process ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessUpdate'
 *           examples:
 *             Update Category:
 *               value:
 *                 category: "Finishing"
 *                 setup_time_min: 20
 *             Deactivate:
 *               value:
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Process updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *                 message:
 *                   type: string
 *                   example: "Process updated successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateProcess'
 *               - $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/ProcessNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateProcess);

/**
 * @swagger
 * /api/processes/{id}:
 *   delete:
 *     summary: Deactivate a process (SOFT DELETE)
 *     tags: [Processes]
 *     description: |
 *       Soft deletes a process by setting is_active = false.
 *       Cannot deactivate if the process is used in any active routing.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Process ID
 *     responses:
 *       200:
 *         description: Process deactivated successfully
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
 *                   example: "Process deactivated successfully"
 *       400:
 *         $ref: '#/components/responses/ProcessInUse'
 *       404:
 *         $ref: '#/components/responses/ProcessNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     example:
 *       response:
 *         success: true
 *         message: "Process deactivated successfully"
 */
router.delete('/:id', protect, deleteProcess);

module.exports = router;