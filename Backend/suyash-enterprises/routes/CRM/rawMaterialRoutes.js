const express = require('express');
const router = express.Router();
const {
  getRawMaterials,
  getCurrentRates,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  bulkDeleteRawMaterials,
  getRawMaterialsDropdown,
  bulkCreateRawMaterials,
  getRateByMaterialId
} = require('../../controllers/CRM/rawMaterialController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     RawMaterial:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         MaterialID:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             MaterialCode:
 *               type: string
 *             MaterialName:
 *               type: string
 *             Density:
 *               type: number
 *             Unit:
 *               type: string
 *             Grade:
 *               type: string
 *         MaterialName:
 *           type: string
 *           example: "Copper"
 *         Grade:
 *           type: string
 *           example: "C11000"
 *         Description:
 *           type: string
 *           example: "Rate for Copper - C11000"
 *         RatePerKG:
 *           type: number
 *           example: 855
 *         profile_conversion_rate:
 *           type: number
 *           example: 25
 *         total_rm_rate:
 *           type: number
 *           example: 880
 *         ScrapPercentage:
 *           type: number
 *           example: 5
 *         scrap_rate_per_kg:
 *           type: number
 *           example: 42.75
 *         TransportLossPercentage:
 *           type: number
 *           example: 2
 *         transport_rate_per_kg:
 *           type: number
 *           example: 17.10
 *         EffectiveRate:
 *           type: number
 *           example: 914.85
 *         density:
 *           type: number
 *           example: 8.96
 *         unit:
 *           type: string
 *           enum: [Kg, Gram, Ton, Meter]
 *           example: "Kg"
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2025-04-22"
 *         DateExpiry:
 *           type: string
 *           format: date
 *           nullable: true
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
 *     RawMaterialCreate:
 *       type: object
 *       required:
 *         - MaterialID
 *         - RatePerKG
 *         - DateEffective
 *       properties:
 *         MaterialID:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *           description: "MongoDB _id from Material Master"
 *         RatePerKG:
 *           type: number
 *           example: 855
 *           description: "Current market rate per KG"
 *         profile_conversion_rate:
 *           type: number
 *           example: 25
 *           default: 0
 *           description: "Profile conversion cost per KG"
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
 *           description: "Date from which this rate is valid"
 *         Description:
 *           type: string
 *           example: "Q2 2025 rate for Copper"
 *
 *     RawMaterialUpdate:
 *       type: object
 *       properties:
 *         RatePerKG:
 *           type: number
 *         profile_conversion_rate:
 *           type: number
 *         ScrapPercentage:
 *           type: number
 *         TransportLossPercentage:
 *           type: number
 *         DateEffective:
 *           type: string
 *           format: date
 *         DateExpiry:
 *           type: string
 *           format: date
 *         Description:
 *           type: string
 *         IsActive:
 *           type: boolean
 *
 *     RawMaterialDropdown:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         MaterialID:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             MaterialCode:
 *               type: string
 *             MaterialName:
 *               type: string
 *         MaterialName:
 *           type: string
 *         Grade:
 *           type: string
 *         RatePerKG:
 *           type: number
 *         EffectiveRate:
 *           type: number
 *
 *     BulkRawMaterialItem:
 *       type: object
 *       required:
 *         - MaterialCode
 *         - RatePerKG
 *         - DateEffective
 *       properties:
 *         MaterialCode:
 *           type: string
 *           example: "CU-001"
 *           description: "MaterialCode from Material Master"
 *         Grade:
 *           type: string
 *           example: "C11000"
 *           description: "Alternative to MaterialCode"
 *         RatePerKG:
 *           type: number
 *           example: 855
 *         ScrapPercentage:
 *           type: number
 *           example: 5
 *         TransportLossPercentage:
 *           type: number
 *           example: 2
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2025-04-22"
 *
 *   responses:
 *     RawMaterialNotFound:
 *       description: Raw material rate not found
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
 *                 example: "Raw material not found"
 *
 *     DuplicateRawMaterial:
 *       description: Rate already exists for this material and date
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
 *                 example: "Rate already exists for Copper - C11000 on 2025-04-22"
 *
 *     MaterialNotFoundInMaster:
 *       description: MaterialID not found in Material Master
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
 *                 example: "Material not found in Material Master"
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
 *   name: Raw Materials
 *   description: Raw Material Rates - Time-based pricing, scrap, transport costs
 */

/**
 * @swagger
 * /api/raw-materials:
 *   get:
 *     summary: Get all raw material rate records with pagination
 *     tags: [Raw Materials]
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
 *         name: materialName
 *         schema:
 *           type: string
 *         description: Filter by material name
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: Filter by grade
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Raw materials retrieved successfully
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
 *                     $ref: '#/components/schemas/RawMaterial'
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
router.get('/', getRawMaterials);

/**
 * @swagger
 * /api/raw-materials/current-rates:
 *   get:
 *     summary: Get latest active rate for every material
 *     description: Returns only the most recent rate record per material based on DateEffective
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current rates retrieved successfully
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
 *                     $ref: '#/components/schemas/RawMaterial'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/current-rates', getCurrentRates);

/**
 * @swagger
 * /api/raw-materials/dropdown:
 *   get:
 *     summary: Get active raw materials for dropdown selection
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Raw materials dropdown list
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
 *                     $ref: '#/components/schemas/RawMaterialDropdown'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/dropdown', getRawMaterialsDropdown);

/**
 * @swagger
 * /api/raw-materials/rate-by-material/{materialId}:
 *   get:
 *     summary: Get latest rate for a specific material (for Quotation costing)
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Material Master ID
 *       - in: query
 *         name: asOnDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Get rate as on specific date (default: today)"
 *     responses:
 *       200:
 *         description: Rate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *       404:
 *         description: No active rate found
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
 *                   example: "No active rate found for this material"
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/rate-by-material/:materialId', getRateByMaterialId);

/**
 * @swagger
 * /api/raw-materials/bulk:
 *   post:
 *     summary: Bulk create or update raw material rates
 *     description: Upsert by MaterialCode/Grade + DateEffective. Auto-fetches material details from Material Master.
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/BulkRawMaterialItem'
 *           example:
 *             - MaterialCode: "CU-001"
 *               RatePerKG: 855
 *               ScrapPercentage: 5
 *               TransportLossPercentage: 2
 *               DateEffective: "2025-04-22"
 *             - MaterialCode: "AL-001"
 *               RatePerKG: 210
 *               ScrapPercentage: 3
 *               TransportLossPercentage: 1
 *               DateEffective: "2025-04-22"
 *             - Grade: "SS304"
 *               RatePerKG: 180
 *               ScrapPercentage: 5
 *               DateEffective: "2025-04-22"
 *     responses:
 *       200:
 *         description: Bulk operation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                       example: 2
 *                     updated:
 *                       type: integer
 *                       example: 1
 *                     failed:
 *                       type: integer
 *                       example: 0
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/bulk', bulkCreateRawMaterials);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   get:
 *     summary: Get single raw material rate by ID
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material record ID
 *     responses:
 *       200:
 *         description: Raw material retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *       404:
 *         $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/:id', getRawMaterial);

/**
 * @swagger
 * /api/raw-materials:
 *   post:
 *     summary: Create a new raw material rate record (auto-fills from Material Master)
 *     description: |
 *       **Auto-filled from Material Master (do NOT send):**
 *       - MaterialName, Grade, density, unit
 *       
 *       **Auto-calculated:**
 *       - total_rm_rate = RatePerKG + profile_conversion_rate
 *       - scrap_rate_per_kg = (RatePerKG × ScrapPercentage / 100)
 *       - transport_rate_per_kg = (RatePerKG × TransportLossPercentage / 100)
 *       - EffectiveRate = RatePerKG × (1 + (Scrap% + Transport%)/100)
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterialCreate'
 *           examples:
 *             copper_rate:
 *               summary: Copper C11000 rate
 *               value:
 *                 MaterialID: "64f8e9b7a1b2c3d4e5f6a7b8"
 *                 RatePerKG: 855
 *                 profile_conversion_rate: 25
 *                 ScrapPercentage: 5
 *                 TransportLossPercentage: 2
 *                 DateEffective: "2025-04-22"
 *                 Description: "Q2 2025 rate"
 *             aluminium_rate:
 *               summary: Aluminium AA6063 rate
 *               value:
 *                 MaterialID: "64f8e9b7a1b2c3d4e5f6a7c0"
 *                 RatePerKG: 210
 *                 ScrapPercentage: 3
 *                 TransportLossPercentage: 1
 *                 DateEffective: "2025-04-22"
 *     responses:
 *       201:
 *         description: Raw material rate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *                 message:
 *                   type: string
 *                   example: "Raw material rate created successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateRawMaterial'
 *               - $ref: '#/components/responses/MaterialNotFoundInMaster'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', createRawMaterial);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   put:
 *     summary: Update raw material rate record
 *     description: Cannot update MaterialID, MaterialName, Grade, density, unit (they come from Material Master)
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterialUpdate'
 *           example:
 *             RatePerKG: 860
 *             ScrapPercentage: 6
 *     responses:
 *       200:
 *         description: Raw material rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *                 message:
 *                   type: string
 *                   example: "Raw material rate updated successfully"
 *       404:
 *         $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', updateRawMaterial);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   delete:
 *     summary: Soft delete raw material rate (sets IsActive=false)
 *     tags: [Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw material record ID
 *     responses:
 *       200:
 *         description: Raw material rate deactivated successfully
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
 *                   example: "Raw material rate deactivated successfully"
 *       404:
 *         $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteRawMaterial);
router.post('/bulk-delete', bulkDeleteRawMaterials);

module.exports = router;