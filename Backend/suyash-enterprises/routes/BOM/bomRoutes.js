const express = require('express');
const router = express.Router();
const {
  createBOM,
  getBOMs,
  getBOMById,
  updateBOM,
  deleteBOM,
  setDefaultBOM,
  explodeBOM,
  whereUsed,
  validateBOM,
  copyBOM,
  approveBOM,
  getBOMByItemId,
  getDefaultBOMByItemId
} = require('../../controllers/BOM/bomController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: BOM
 *   description: Bill of Materials management - Phase 04
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BomComponent:
 *       type: object
 *       required:
 *         - component_item_id
 *         - quantity_per
 *         - unit
 *       properties:
 *         component_item_id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7c5"
 *           description: "MongoDB _id or item_id string (e.g. ITM-000045) of the component"
 *         quantity_per:
 *           type: number
 *           example: 1.05
 *           description: "Quantity required per parent unit"
 *         unit:
 *           type: string
 *           enum: [Nos, Kg, Meter, Set, Piece, Sheet, Roll]
 *           example: "Kg"
 *         level:
 *           type: integer
 *           example: 1
 *           default: 1
 *           description: "BOM explosion level"
 *         scrap_percent:
 *           type: number
 *           example: 5
 *           default: 0
 *         is_phantom:
 *           type: boolean
 *           default: false
 *         is_subcontract:
 *           type: boolean
 *           default: false
 *         subcontract_vendor:
 *           type: string
 *           description: "Vendor ObjectId — required if is_subcontract is true"
 *         reference_designator:
 *           type: string
 *         remarks:
 *           type: string
 *
 *     BomCreateRequest:
 *       type: object
 *       required:
 *         - parent_item_id
 *         - bom_version
 *         - bom_type
 *         - batch_size
 *       properties:
 *         parent_item_id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           description: "MongoDB _id or item_id string (e.g. ITM-000001)"
 *         bom_version:
 *           type: string
 *           example: "v2.0"
 *         bom_type:
 *           type: string
 *           enum: [Manufacturing, Subcontract, Phantom, Variant]
 *           example: "Manufacturing"
 *         bom_category:
 *           type: string
 *           enum: [Standard, Assembly]
 *           default: "Standard"
 *           description: |
 *             Standard — NO components (simple items, services, purchased items, component-less BOMs)
 *             Assembly — requires at least one component (manufactured products that need assembly)
 *         batch_size:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *         yield_percent:
 *           type: number
 *           example: 100
 *           default: 100
 *         setup_time_min:
 *           type: number
 *           example: 30
 *           default: 0
 *         cycle_time_min:
 *           type: number
 *           example: 5.5
 *           default: 0
 *         effective_from:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         effective_to:
 *           type: string
 *           format: date
 *         components:
 *           type: array
 *           description: "Required for Assembly BOMs. Must be empty array for Standard BOMs."
 *           items:
 *             $ref: '#/components/schemas/BomComponent'
 *         status:
 *           type: string
 *           enum: [Pending, Active, Approved, Cancelled, Archived]
 *           default: "Pending"
 *
 *     Bom:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         bom_id:
 *           type: string
 *           example: "BOM-202503-0081"
 *         bom_category:
 *           type: string
 *           enum: [Standard, Assembly]
 *           example: "Assembly"
 *           description: "Assembly BOMs have components. Standard BOMs have empty components array."
 *         parent_item_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             part_no:
 *               type: string
 *             part_description:
 *               type: string
 *         parent_part_no:
 *           type: string
 *         bom_version:
 *           type: string
 *         is_default:
 *           type: boolean
 *         effective_from:
 *           type: string
 *           format: date
 *         effective_to:
 *           type: string
 *           format: date
 *         bom_type:
 *           type: string
 *           enum: [Manufacturing, Subcontract, Phantom, Variant]
 *         batch_size:
 *           type: integer
 *         yield_percent:
 *           type: number
 *         setup_time_min:
 *           type: number
 *         cycle_time_min:
 *           type: number
 *         components:
 *           type: array
 *           description: "Has components for Assembly BOMs. Empty array for Standard BOMs."
 *           items:
 *             $ref: '#/components/schemas/BomComponent'
 *         approved_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         approved_at:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [Pending, Active, Approved, Cancelled, Archived]
 *         is_active:
 *           type: boolean
 *         current_revision:
 *           type: integer
 *         revision_count:
 *           type: integer
 *         created_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_by:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     BomExplosionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             bom_id:
 *               type: string
 *             bom_category:
 *               type: string
 *               enum: [Standard, Assembly]
 *             parent_item:
 *               type: object
 *               properties:
 *                 part_no:
 *                   type: string
 *                 description:
 *                   type: string
 *             requested_quantity:
 *               type: number
 *             total_components:
 *               type: integer
 *             total_quantity_by_unit:
 *               type: object
 *             explosion:
 *               type: array
 *               description: "Has components for Assembly BOMs. Empty array for Standard BOMs."
 *               items:
 *                 type: object
 *                 properties:
 *                   level:
 *                     type: integer
 *                   part_no:
 *                     type: string
 *                   description:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   unit:
 *                     type: string
 *                   scrap_percent:
 *                     type: number
 *                   is_phantom:
 *                     type: boolean
 *                   is_subcontract:
 *                     type: boolean
 *             summary:
 *               type: object
 *               properties:
 *                 total_unique_components:
 *                   type: integer
 *                 total_quantity_by_unit:
 *                   type: object
 *                 note:
 *                   type: string
 *                   description: "Present only for Standard BOMs (no components to explode)"
 *
 *   responses:
 *     BomNotFound:
 *       description: BOM not found
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
 *                 example: "BOM not found"
 *
 *     DuplicateVersionError:
 *       description: BOM version already exists
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
 *                 example: "BOM version v2.0 already exists for this item"
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
 * /api/boms:
 *   get:
 *     summary: Get all BOMs with pagination and filtering
 *     tags: [BOM]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: "Search by parent part number"
 *       - in: query
 *         name: parent_item
 *         schema:
 *           type: string
 *           description: "Filter by parent item ObjectId"
 *       - in: query
 *         name: bom_type
 *         schema:
 *           type: string
 *           enum: [Manufacturing, Subcontract, Phantom, Variant]
 *       - in: query
 *         name: bom_category
 *         schema:
 *           type: string
 *           enum: [Standard, Assembly]
 *           description: "Filter by BOM category"
 *       - in: query
 *         name: is_default
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Active, Approved, Cancelled, Archived]
 *       - in: query
 *         name: bom_version
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -created_at
 *     responses:
 *       200:
 *         description: BOMs retrieved successfully
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
 *                     $ref: '#/components/schemas/Bom'
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
router.get('/', getBOMs);

/**
 * @swagger
 * /api/boms/where-used/{componentId}:
 *   get:
 *     summary: Find all BOMs where an item is used as a component
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: componentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Where-used analysis retrieved successfully
 *       404:
 *         description: Component item not found
 */
router.get('/where-used/:componentId', whereUsed);

/**
 * @swagger
 * /api/boms/{id}:
 *   get:
 *     summary: Get single BOM by ID
 *     tags: [BOM]
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
 *         description: BOM retrieved successfully
 *       404:
 *         $ref: '#/components/responses/BomNotFound'
 */
router.get('/:id', getBOMById);

/**
 * @swagger
 * /api/boms/{id}/explosion:
 *   get:
 *     summary: Multi-level BOM explosion with quantity calculation
 *     description: |
 *       For Assembly BOMs: Returns full component explosion
 *       For Standard BOMs: Returns empty array (no components to explode)
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: effective_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: BOM exploded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BomExplosionResponse'
 *       400:
 *         description: Circular reference detected
 *       404:
 *         $ref: '#/components/responses/BomNotFound'
 */
router.get('/:id/explosion', explodeBOM);

/**
 * @swagger
 * /api/boms/{id}/validate:
 *   get:
 *     summary: Validate BOM structure
 *     description: |
 *       Validates the BOM based on its category:
 *       - Assembly BOMs: Validates components, quantities, circular references
 *       - Standard BOMs: Only validates parent item (no component checks)
 *     tags: [BOM]
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
 *         description: BOM validation completed
 */
router.get('/:id/validate', validateBOM);

/**
 * @swagger
 * /api/boms:
 *   post:
 *     summary: Create a new BOM
 *     description: |
 *       - Assembly BOM: Must have at least one component
 *       - Standard BOM: Cannot have any components (component-less)
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BomCreateRequest'
 *     responses:
 *       201:
 *         description: BOM created successfully
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
 *                   $ref: '#/components/schemas/Bom'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Parent item not found
 */
router.post('/', authorize('admin', 'manager', 'production'), createBOM);

/**
 * @swagger
 * /api/boms/{id}/set-default:
 *   post:
 *     summary: Set BOM as the default version for its parent item
 *     tags: [BOM]
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
 *         description: BOM set as default successfully
 *       400:
 *         description: BOM not approved or not active
 *       404:
 *         $ref: '#/components/responses/BomNotFound'
 */
router.post('/:id/set-default', authorize('manager'), setDefaultBOM);

/**
 * @swagger
 * /api/boms/{id}/copy:
 *   post:
 *     summary: Copy BOM to create a new version
 *     tags: [BOM]
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
 *               - new_version
 *             properties:
 *               new_version:
 *                 type: string
 *               change_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: BOM copied successfully
 *       400:
 *         $ref: '#/components/responses/DuplicateVersionError'
 *       404:
 *         $ref: '#/components/responses/BomNotFound'
 */
router.post('/:id/copy', authorize('manager', 'production'), copyBOM);

/**
 * @swagger
 * /api/boms/{id}/approve:
 *   post:
 *     summary: Approve BOM for production use
 *     tags: [BOM]
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
 *         description: BOM approved successfully
 *       400:
 *         description: BOM not in Pending status
 *       404:
 *         $ref: '#/components/responses/BomNotFound'
 */
router.post('/:id/approve', authorize('manager', 'qa'), approveBOM);

/**
 * @swagger
 * /api/boms/{id}:
 *   put:
 *     summary: Update BOM (creates new revision if components change)
 *     description: |
 *       Update rules:
 *       - Standard BOMs CANNOT receive components — passing components array returns 400
 *       - Assembly BOMs MUST have at least one component if components array is provided
 *     tags: [BOM]
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
 *               bom_version:
 *                 type: string
 *               bom_type:
 *                 type: string
 *                 enum: [Manufacturing, Subcontract, Phantom, Variant]
 *               batch_size:
 *                 type: integer
 *                 minimum: 1
 *               yield_percent:
 *                 type: number
 *               setup_time_min:
 *                 type: number
 *               cycle_time_min:
 *                 type: number
 *               components:
 *                 type: array
 *                 description: "Assembly BOMs only. Blocked for Standard BOMs."
 *                 items:
 *                   $ref: '#/components/schemas/BomComponent'
 *               effective_from:
 *                 type: string
 *                 format: date
 *               effective_to:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Pending, Active, Approved, Cancelled, Archived]
 *     responses:
 *       200:
 *         description: BOM updated successfully
 *       400:
 *         description: |
 *           Validation error, duplicate version,
 *           or components sent for a Standard BOM
 *       404:
 *         $ref: '#/components/responses/BomNotFound'
 */
router.put('/:id', authorize('manager', 'production'), updateBOM);
router.delete('/:id', authorize('manager', 'production'), deleteBOM);
/**
 * @swagger
 * /api/boms/by-item/{itemId}:
 *   get:
 *     summary: Get all BOM versions for a specific item
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Item _id or item_id string (e.g. ITM-000001)"
 *     responses:
 *       200:
 *         description: BOMs retrieved successfully
 *       404:
 *         description: Item not found
 */
router.get('/by-item/:itemId', getBOMByItemId);

/**
 * @swagger
 * /api/boms/by-item/{itemId}/default:
 *   get:
 *     summary: Get the default BOM for a specific item
 *     tags: [BOM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Item _id or item_id string (e.g. ITM-000001)"
 *     responses:
 *       200:
 *         description: Default BOM retrieved successfully
 *       404:
 *         description: Item or default BOM not found
 */
router.get('/by-item/:itemId/default', getDefaultBOMByItemId);

module.exports = router;