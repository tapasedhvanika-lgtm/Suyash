const express = require('express');
const router = express.Router();
const {
  createAssemblyLine,
  getAssemblyLines,
  getAssemblyLineById,
  getAssemblyLinesDropdown,
  updateAssemblyLine,
  deleteAssemblyLine
} = require('../../controllers/Assembly/assemblyLineController');
const { protect, authorize } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Assembly Lines
 *   description: Assembly Line Master Management - Phase 09
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssemblyLine:
 *       type: object
 *       required:
 *         - line_name
 *         - work_centre
 *       properties:
 *         _id:
 *           type: string
 *           example: "6601a2b3c4d5e6f7a8b9c0d1"
 *         line_code:
 *           type: string
 *           example: "AL-0005"
 *           description: Auto-generated unique code
 *         line_name:
 *           type: string
 *           example: "Busbar Assembly Line 1"
 *         line_type:
 *           type: string
 *           enum: [Busbar, Panel, Gasket, EV, Transformer, General]
 *           example: "Busbar"
 *           default: "General"
 *         work_centre:
 *           type: string
 *           example: "Assembly Bay 1"
 *         description:
 *           type: string
 *           example: "Main busbar assembly line for 100-500A panels"
 *         is_active:
 *           type: boolean
 *           default: true
 *         created_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         updated_by:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     AssemblyLineCreateRequest:
 *       type: object
 *       required:
 *         - line_name
 *         - work_centre
 *       properties:
 *         line_name:
 *           type: string
 *           example: "Busbar Assembly Line 1"
 *         line_type:
 *           type: string
 *           enum: [Busbar, Panel, Gasket, EV, Transformer, General]
 *           example: "Busbar"
 *           default: "General"
 *         work_centre:
 *           type: string
 *           example: "Assembly Bay 1"
 *         description:
 *           type: string
 *           example: "Main busbar assembly line for 100-500A panels"
 *
 *     AssemblyLineUpdateRequest:
 *       type: object
 *       properties:
 *         line_name:
 *           type: string
 *         line_type:
 *           type: string
 *         work_centre:
 *           type: string
 *         description:
 *           type: string
 *         is_active:
 *           type: boolean
 *
 *   responses:
 *     AssemblyLineNotFound:
 *       description: Assembly line not found
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
 *                 example: "Assembly line not found"
 *
 *     AssemblyLineInUse:
 *       description: Cannot delete - used in active work orders
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
 *                 example: "Cannot delete assembly line - used in active Work Order WO-202604-0015"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// All routes are protected
router.use(protect);

/**
 * @swagger
 * /api/assembly-lines/dropdown:
 *   get:
 *     summary: Get assembly lines for dropdown (active only)
 *     tags: [Assembly Lines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: line_type
 *         schema:
 *           type: string
 *           enum: [Busbar, Panel, Gasket, EV, Transformer, General]
 *         description: Filter by line type
 *     responses:
 *       200:
 *         description: Assembly lines retrieved successfully for dropdown
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       line_code:
 *                         type: string
 *                       line_name:
 *                         type: string
 *                       line_type:
 *                         type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/dropdown', getAssemblyLinesDropdown);

/**
 * @swagger
 * /api/assembly-lines:
 *   get:
 *     summary: Get all assembly lines with pagination and filtering
 *     tags: [Assembly Lines]
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
 *         name: line_type
 *         schema:
 *           type: string
 *           enum: [Busbar, Panel, Gasket, EV, Transformer, General]
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: work_centre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assembly lines retrieved successfully
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
 *                     $ref: '#/components/schemas/AssemblyLine'
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
 */
router.get('/', getAssemblyLines);

/**
 * @swagger
 * /api/assembly-lines/{id}:
 *   get:
 *     summary: Get single assembly line by ID
 *     tags: [Assembly Lines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assembly line ID or line_code
 *     responses:
 *       200:
 *         description: Assembly line retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AssemblyLine'
 *       404:
 *         $ref: '#/components/responses/AssemblyLineNotFound'
 */
router.get('/:id', getAssemblyLineById);

/**
 * @swagger
 * /api/assembly-lines:
 *   post:
 *     summary: Create a new assembly line
 *     tags: [Assembly Lines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssemblyLineCreateRequest'
 *           example:
 *             line_name: "Busbar Assembly Line 1"
 *             line_type: "Busbar"
 *             work_centre: "Assembly Bay 1"
 *             description: "Main busbar assembly line for 100-500A panels"
 *     responses:
 *       201:
 *         description: Assembly line created successfully
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
 *                   $ref: '#/components/schemas/AssemblyLine'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/', createAssemblyLine);

/**
 * @swagger
 * /api/assembly-lines/{id}:
 *   put:
 *     summary: Update assembly line
 *     tags: [Assembly Lines]
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
 *             $ref: '#/components/schemas/AssemblyLineUpdateRequest'
 *           example:
 *             line_name: "Busbar Assembly Line 1 - Upgraded"
 *             line_type: "Busbar"
 *             work_centre: "Assembly Bay 1"
 *             description: "Upgraded line with new torque tools"
 *             is_active: true
 *     responses:
 *       200:
 *         description: Assembly line updated successfully
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
 *                   $ref: '#/components/schemas/AssemblyLine'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         $ref: '#/components/responses/AssemblyLineNotFound'
 */
router.put('/:id', updateAssemblyLine);

/**
 * @swagger
 * /api/assembly-lines/{id}:
 *   delete:
 *     summary: Delete/Deactivate assembly line (soft delete)
 *     tags: [Assembly Lines]
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
 *         description: Assembly line deactivated successfully
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
 *                     line_code:
 *                       type: string
 *                     line_name:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         $ref: '#/components/responses/AssemblyLineInUse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         $ref: '#/components/responses/AssemblyLineNotFound'
 */
router.delete('/:id',  deleteAssemblyLine);

module.exports = router;