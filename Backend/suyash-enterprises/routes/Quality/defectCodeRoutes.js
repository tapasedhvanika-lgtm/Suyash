'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  createDefectCode,
  getAllDefectCodes,
  getDefectCodeById,
  updateDefectCode,
  deleteDefectCode,
  toggleDefectCodeStatus,
  bulkDeleteDefectCodes,
} = require('../../controllers/Quality/defectCodeController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// ======================================================
// MULTER CONFIGURATION FOR IMAGE UPLOAD
// ======================================================

const uploadDir = path.join(__dirname, '../../uploads/defect-codes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `defect-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

/**
 * @swagger
 * tags:
 *   name: DefectCode
 *   description: Defect Code Master — Phase 10 BE-024
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DefectCode:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         defect_code:
 *           type: string
 *           example: "DC-002"
 *         defect_name:
 *           type: string
 *           example: "Dimensional OOT"
 *         defect_category:
 *           type: string
 *           enum: [Dimensional, Visual/Surface, Material, Functional, Process, Quantity, Documentation]
 *         defect_description:
 *           type: string
 *         applicable_processes:
 *           type: array
 *           items:
 *             type: string
 *         severity_default:
 *           type: string
 *           enum: [Critical, Major, Minor]
 *         photo_reference:
 *           type: string
 *           description: Path to uploaded image
 *         is_active:
 *           type: boolean
 *
 *     DefectCodeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/DefectCode'
 */

/**
 * @swagger
 * /api/defect-codes:
 *   post:
 *     summary: Create a new defect code (with optional image upload)
 *     description: |
 *       Creates a standardized defect code for consistent classification.
 *       
 *       **Standard Defect Codes Examples:**
 *       | Code | Name | Category | Default Severity |
 *       |------|------|----------|------------------|
 *       | DC-001 | Burr | Dimensional | Minor |
 *       | DC-002 | Dimensional OOT | Dimensional | Major |
 *       | DC-003 | Surface Scratch | Visual/Surface | Minor |
 *       | DC-004 | Pit/Dent | Visual/Surface | Major |
 *       | DC-005 | Wrong Material | Material | Critical |
 *       | DC-006 | Plating Thin | Surface | Major |
 *       | DC-007 | Plating Thick | Surface | Major |
 *       | DC-008 | Porosity | Material | Critical |
 *       | DC-009 | Crack | Material | Critical |
 *       | DC-010 | Short Supply | Quantity | Minor |
 *       
 *       **Note:** Use multipart/form-data to upload image along with other fields
 *     tags: [DefectCode]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - defect_code
 *               - defect_name
 *               - defect_category
 *               - defect_description
 *             properties:
 *               defect_code:
 *                 type: string
 *                 example: "DC-011"
 *                 description: Unique code (auto-formatted to uppercase)
 *               defect_name:
 *                 type: string
 *                 example: "Weld Porosity"
 *               defect_category:
 *                 type: string
 *                 enum: [Dimensional, Visual/Surface, Material, Functional, Process, Quantity, Documentation]
 *                 example: "Material"
 *               defect_description:
 *                 type: string
 *                 example: "Porosity visible in weld joint, bubbles or voids present"
 *               applicable_processes:
 *                 type: string
 *                 description: JSON string array e.g., '["Welding","Assembly"]'
 *                 example: '["Welding","Assembly"]'
 *               severity_default:
 *                 type: string
 *                 enum: [Critical, Major, Minor]
 *                 default: "Major"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Reference image file (JPEG, PNG, GIF, WEBP, max 5MB)
 *     responses:
 *       201:
 *         description: Defect code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DefectCodeResponse'
 *       400:
 *         description: Duplicate defect code or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/defect-codes', 
  upload.single('image'),
  createDefectCode
);

/**
 * @swagger
 * /api/defect-codes:
 *   get:
 *     summary: List all defect codes
 *     description: Returns all defect codes with filtering by category and active status
 *     tags: [DefectCode]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Dimensional, Visual/Surface, Material, Functional, Process, Quantity, Documentation]
 *         description: Filter by defect category
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by defect code or name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Defect codes retrieved successfully
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
 *                     $ref: '#/components/schemas/DefectCode'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/defect-codes', getAllDefectCodes);

/**
 * @swagger
 * /api/defect-codes/{id}:
 *   get:
 *     summary: Get defect code by ID
 *     description: Returns a single defect code by its MongoDB ID
 *     tags: [DefectCode]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Defect Code MongoDB _id
 *     responses:
 *       200:
 *         description: Defect code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DefectCodeResponse'
 *       404:
 *         description: Defect code not found
 *       401:
 *         description: Unauthorized
 */
router.get('/defect-codes/:id', getDefectCodeById);

/**
 * @swagger
 * /api/defect-codes/{id}:
 *   put:
 *     summary: Update defect code (with optional image upload)
 *     description: |
 *       Updates an existing defect code. 
 *       - To update text fields, send them as form-data fields
 *       - To update/change the image, send a new file in the 'image' field (old image will be deleted automatically)
 *       - To keep existing image, omit the 'image' field
 *       
 *       **Note:** Use multipart/form-data for all updates (text + image together)
 *     tags: [DefectCode]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Defect Code MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               defect_name:
 *                 type: string
 *                 description: Updated defect name
 *                 example: "Severe Weld Porosity"
 *               defect_category:
 *                 type: string
 *                 enum: [Dimensional, Visual/Surface, Material, Functional, Process, Quantity, Documentation]
 *                 description: Updated category
 *               defect_description:
 *                 type: string
 *                 description: Updated description
 *               applicable_processes:
 *                 type: string
 *                 description: JSON string array e.g., '["Welding","Assembly"]'
 *                 example: '["Welding","Assembly"]'
 *               severity_default:
 *                 type: string
 *                 enum: [Critical, Major, Minor]
 *                 description: Updated severity
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file (replaces existing image). Send file here.
 *               is_active:
 *                 type: boolean
 *                 description: Set to false to deactivate
 *     responses:
 *       200:
 *         description: Defect code updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DefectCodeResponse'
 *       404:
 *         description: Defect code not found
 *       401:
 *         description: Unauthorized
 */
router.put('/defect-codes/:id', 
  upload.single('image'),
  updateDefectCode
);

/**
 * @swagger
 * /api/defect-codes/{id}:
 *   delete:
 *     summary: Deactivate defect code (soft delete)
 *     description: Soft deletes a defect code by setting is_active = false
 *     tags: [DefectCode]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Defect Code MongoDB _id
 *     responses:
 *       200:
 *         description: Defect code deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Defect code not found
 *       401:
 *         description: Unauthorized
 */
router.post('/defect-codes/bulk-delete', bulkDeleteDefectCodes);
router.put('/defect-codes/:id/toggle-status', toggleDefectCodeStatus);
router.delete('/defect-codes/:id', deleteDefectCode);

module.exports = router;