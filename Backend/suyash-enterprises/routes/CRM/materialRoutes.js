const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  bulkDeleteMaterials,
  getMaterialsDropdown
} = require('../../controllers/CRM/materialController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         material_id:
 *           type: string
 *           example: "MAT-001"
 *         MaterialCode:
 *           type: string
 *           example: "CU-001"
 *         MaterialName:
 *           type: string
 *           example: "Copper"
 *         Description:
 *           type: string
 *           example: "Electrolytic Copper Grade A"
 *         Density:
 *           type: number
 *           format: float
 *           example: 8.96
 *           minimum: 0.1
 *           maximum: 25
 *         Unit:
 *           type: string
 *           enum: [Kg, Gram, Ton]
 *           example: "Kg"
 *         Standard:
 *           type: string
 *           example: "ASTM B152"
 *         Grade:
 *           type: string
 *           example: "C11000"
 *         Color:
 *           type: string
 *           example: "Reddish"
 *         EffectiveRate:
 *           type: number
 *           format: float
 *           example: 850.50
 *         IsActive:
 *           type: boolean
 *           example: true
 *         CreatedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             Username:
 *               type: string
 *             Email:
 *               type: string
 *         CreatedAt:
 *           type: string
 *           format: date-time
 *         UpdatedAt:
 *           type: string
 *           format: date-time
 *
 *     MaterialCreate:
 *       type: object
 *       required:
 *         - MaterialCode
 *         - MaterialName
 *         - Density
 *         - Unit
 *         - Grade
 *         - EffectiveRate
 *       properties:
 *         material_id:
 *           type: string
 *           example: "MAT-001"
 *           description: "Auto-generated if not provided"
 *         MaterialCode:
 *           type: string
 *           example: "CU-001"
 *           description: "Must be unique"
 *         MaterialName:
 *           type: string
 *           example: "Copper"
 *         Description:
 *           type: string
 *           example: "Electrolytic Copper Grade A"
 *         Density:
 *           type: number
 *           example: 8.96
 *           minimum: 0.1
 *           maximum: 25
 *         Unit:
 *           type: string
 *           enum: [Kg, Gram, Ton]
 *           example: "Kg"
 *         Standard:
 *           type: string
 *           example: "ASTM B152"
 *         Grade:
 *           type: string
 *           example: "C11000"
 *           description: "Required for linking with Raw Material Master"
 *         Color:
 *           type: string
 *           example: "Reddish"
 *         EffectiveRate:
 *           type: number
 *           example: 850.50
 *           minimum: 0
 *         createRateEntry:
 *           type: boolean
 *           example: true
 *           description: "Set true to also create initial Raw Material rate entry"
 *         RatePerKG:
 *           type: number
 *           example: 855
 *           description: "Required if createRateEntry is true"
 *         ScrapPercentage:
 *           type: number
 *           example: 5
 *           default: 0
 *         TransportLossPercentage:
 *           type: number
 *           example: 2
 *           default: 0
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2025-04-22"
 *           description: "Required if createRateEntry is true"
 *
 *     MaterialUpdate:
 *       type: object
 *       properties:
 *         MaterialCode:
 *           type: string
 *           example: "CU-002"
 *         MaterialName:
 *           type: string
 *           example: "Copper - Pure"
 *         Description:
 *           type: string
 *         Density:
 *           type: number
 *         Unit:
 *           type: string
 *           enum: [Kg, Gram, Ton]
 *         Standard:
 *           type: string
 *         Grade:
 *           type: string
 *         Color:
 *           type: string
 *         EffectiveRate:
 *           type: number
 *         IsActive:
 *           type: boolean
 *
 *     MaterialDropdown:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         material_id:
 *           type: string
 *         MaterialCode:
 *           type: string
 *         MaterialName:
 *           type: string
 *         Density:
 *           type: number
 *         Unit:
 *           type: string
 *         Grade:
 *           type: string
 *         EffectiveRate:
 *           type: number
 *
 *   responses:
 *     MaterialNotFound:
 *       description: Material not found
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
 *                 example: "Material not found"
 *
 *     DuplicateMaterial:
 *       description: Material with this code already exists
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
 *                 example: "MaterialCode already exists"
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
 *                 example: "Density must be at least 0.1"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Materials
 *   description: Material Master - Permanent catalog of all materials
 */

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Get all materials with pagination and filtering
 *     tags: [Materials]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in MaterialCode, MaterialName, material_id, Description, Grade
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
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
 *                     $ref: '#/components/schemas/Material'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', getMaterials);

/**
 * @swagger
 * /api/materials/dropdown:
 *   get:
 *     summary: Get active materials for dropdown selection
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Materials dropdown list
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
 *                     $ref: '#/components/schemas/MaterialDropdown'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/dropdown', getMaterialsDropdown);

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Get single material by ID
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         $ref: '#/components/responses/MaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/:id', getMaterial);

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create a new material (optionally with initial raw material rate)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialCreate'
 *           examples:
 *             without_rate:
 *               summary: Create material only
 *               value:
 *                 MaterialCode: "AL-001"
 *                 MaterialName: "Aluminium"
 *                 Density: 2.70
 *                 Unit: "Kg"
 *                 Grade: "AA6063 T5"
 *                 EffectiveRate: 210
 *             with_rate:
 *               summary: Create material with initial rate entry
 *               value:
 *                 MaterialCode: "CU-001"
 *                 MaterialName: "Copper"
 *                 Density: 8.96
 *                 Unit: "Kg"
 *                 Grade: "C11000"
 *                 EffectiveRate: 850
 *                 createRateEntry: true
 *                 RatePerKG: 855
 *                 ScrapPercentage: 5
 *                 TransportLossPercentage: 2
 *                 DateEffective: "2025-04-22"
 *     responses:
 *       201:
 *         description: Material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *                 message:
 *                   type: string
 *                   example: "Material created with initial rate entry"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateMaterial'
 *               - $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', createMaterial);

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     summary: Update an existing material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialUpdate'
 *           example:
 *             EffectiveRate: 875
 *             Description: "Updated copper grade A+"
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *                 message:
 *                   type: string
 *                   example: "Material updated successfully"
 *       400:
 *         $ref: '#/components/responses/DuplicateMaterial'
 *       404:
 *         $ref: '#/components/responses/MaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', updateMaterial);

/**
 * @swagger
 * /api/materials/{id}:
 *   delete:
 *     summary: Soft delete material (also deactivates associated raw material rates)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deactivated successfully
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
 *                   example: "Material and associated rates deactivated successfully"
 *       400:
 *         description: Material in use
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
 *                   example: "Cannot delete material. It is used in 5 active item(s)."
 *       404:
 *         $ref: '#/components/responses/MaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/bulk-delete', bulkDeleteMaterials);
router.delete('/:id', deleteMaterial);

module.exports = router;