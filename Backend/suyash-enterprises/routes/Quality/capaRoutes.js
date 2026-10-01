'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  createCAPA,
  getAllCAPAs,
  getCAPAById,
  updateCAPA,
  updateAction,
  recordEffectiveness,
  closeCAPA,
} = require('../../controllers/Quality/capaController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// ======================================================
// MULTER CONFIGURATION FOR EVIDENCE UPLOAD
// ======================================================

const uploadDir = path.join(__dirname, '../../uploads/capa-evidence');
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
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

/**
 * @swagger
 * tags:
 *   name: CAPA
 *   description: Corrective and Preventive Action — Phase 10 BE-024
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CAPAAction:
 *       type: object
 *       properties:
 *         action_description:
 *           type: string
 *         action_type:
 *           type: string
 *           enum: [Immediate, Short-Term, Long-Term]
 *         responsible_person_id:
 *           type: string
 *         target_date:
 *           type: string
 *           format: date
 *         completion_date:
 *           type: string
 *           format: date
 *         completion_evidence_path:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Open, In Progress, Completed, Overdue]
 *         verification_notes:
 *           type: string
 *
 *     CAPAResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         capa_id:
 *           type: string
 *           example: "CAPA-202503-0002"
 *         capa_date:
 *           type: string
 *           format: date-time
 *         capa_type:
 *           type: string
 *           enum: [Corrective, Preventive, Improvement]
 *         source:
 *           type: string
 *           enum: [NCR, Customer Complaint, Internal Audit, Management Review, Process Study, Supplier Audit, Warranty Return]
 *         problem_statement:
 *           type: string
 *         root_cause:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Open, In Progress, Completed, Effectiveness Under Review, Closed, Overdue]
 *         corrective_actions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CAPAAction'
 *         preventive_actions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CAPAAction'
 *         effectiveness_verified:
 *           type: boolean
 *         completion_percentage:
 *           type: integer
 *         days_overdue:
 *           type: integer
 */

/**
 * @swagger
 * /api/capas:
 *   post:
 *     summary: Create a new CAPA record
 *     description: |
 *       Creates a Corrective and Preventive Action record.
 *       
 *       **CAPA Types:**
 *       - Corrective: Fix existing problem
 *       - Preventive: Prevent potential problem
 *       - Improvement: Process optimisation beyond current requirement
 *       
 *       **Sources:**
 *       - NCR: From quality failure
 *       - Customer Complaint: From customer feedback
 *       - Internal Audit: From audit findings
 *       - Management Review: From leadership review
 *       - Process Study: From process capability analysis
 *       - Supplier Audit: From vendor assessment
 *       - Warranty Return: From returned products
 *       
 *       **Business Rule:** When CAPA is created from an NCR, the NCR is automatically
 *       updated with capa_id and status changes to 'CAPA Initiated'.
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - capa_type
 *               - source
 *               - problem_statement
 *               - defect_description
 *               - root_cause
 *               - target_close_date
 *             properties:
 *               capa_type:
 *                 type: string
 *                 enum: [Corrective, Preventive, Improvement]
 *                 example: "Corrective"
 *               source:
 *                 type: string
 *                 enum: [NCR, Customer Complaint, Internal Audit, Management Review, Process Study, Supplier Audit, Warranty Return]
 *                 example: "NCR"
 *               ncr_id:
 *                 type: string
 *                 description: Required if source = NCR
 *               problem_statement:
 *                 type: string
 *                 example: "Copper strip thickness variation causing rejection at incoming inspection"
 *               defect_description:
 *                 type: string
 *                 example: "Thickness varies from 2.8mm to 3.2mm vs spec 3.0±0.1mm"
 *               quantity_affected:
 *                 type: number
 *                 example: 5000
 *               customer_impact:
 *                 type: boolean
 *                 default: false
 *               root_cause:
 *                 type: string
 *                 example: "No preventive maintenance program for rolling mill hydraulic pump"
 *               assigned_to:
 *                 type: string
 *                 description: User ID of responsible person
 *               target_close_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-25"
 *               corrective_actions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     action_description:
 *                       type: string
 *                     action_type:
 *                       type: string
 *                       enum: [Immediate, Short-Term, Long-Term]
 *                     responsible_person_id:
 *                       type: string
 *                     target_date:
 *                       type: string
 *                       format: date
 *               preventive_actions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     action_description:
 *                       type: string
 *                     action_type:
 *                       type: string
 *                       enum: [Immediate, Short-Term, Long-Term]
 *                     responsible_person_id:
 *                       type: string
 *                     target_date:
 *                       type: string
 *                       format: date
 *     responses:
 *       201:
 *         description: CAPA created successfully
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
 *                     _id:
 *                       type: string
 *                     capa_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     completion_percentage:
 *                         type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/',  createCAPA);

/**
 * @swagger
 * /api/capas:
 *   get:
 *     summary: List all CAPA records
 *     description: Returns paginated list of CAPAs with filtering options
 *     tags: [CAPA]
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
 *           enum: [Open, In Progress, Completed, Effectiveness Under Review, Closed, Overdue]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [NCR, Customer Complaint, Internal Audit, Management Review, Process Study, Supplier Audit, Warranty Return]
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CAPAs retrieved successfully
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
 *                     $ref: '#/components/schemas/CAPAResponse'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllCAPAs);

/**
 * @swagger
 * /api/capas/{id}:
 *   get:
 *     summary: Get full CAPA details by ID
 *     description: Returns complete CAPA with all actions and effectiveness data
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CAPA MongoDB _id
 *     responses:
 *       200:
 *         description: CAPA retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CAPAResponse'
 *       404:
 *         description: CAPA not found
 */
router.get('/:id',  getCAPAById);

/**
 * @swagger
 * /api/capas/{id}:
 *   put:
 *     summary: Update CAPA general fields
 *     description: Updates CAPA header fields (not actions)
 *     tags: [CAPA]
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
 *               problem_statement:
 *                 type: string
 *               defect_description:
 *                 type: string
 *               root_cause:
 *                 type: string
 *               quantity_affected:
 *                 type: number
 *               customer_impact:
 *                 type: boolean
 *               assigned_to:
 *                 type: string
 *               target_close_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: CAPA updated successfully
 */
router.put('/:id', updateCAPA);

/**
 * @swagger
 * /api/capas/{id}/actions/{action_id}:
 *   put:
 *     summary: Update CAPA action with evidence upload
 *     description: |
 *       Marks an action as completed and allows uploading evidence file.
 *       
 *       **Upload Types:**
 *       - Images: JPEG, PNG, GIF, WEBP
 *       - Documents: PDF
 *       
 *       **Note:** Use multipart/form-data to upload evidence file along with status
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CAPA MongoDB _id
 *       - in: path
 *         name: action_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Action subdocument _id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Open, In Progress, Completed, Overdue]
 *                 description: Action status
 *               verification_notes:
 *                 type: string
 *                 description: Notes about action completion
 *               evidence:
 *                 type: string
 *                 format: binary
 *                 description: Evidence file (image or PDF, max 10MB)
 *     responses:
 *       200:
 *         description: Action updated successfully
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
 *                     action_id:
 *                       type: string
 *                     action_status:
 *                       type: string
 *                     completion_evidence_path:
 *                       type: string
 *                     capa_status:
 *                       type: string
 *                     completion_percentage:
 *                       type: integer
 *       404:
 *         description: CAPA or Action not found
 */
router.put('/:id/actions/:action_id',
  upload.single('evidence'),
  updateAction
);

/**
 * @swagger
 * /api/capas/{id}/effectiveness:
 *   put:
 *     summary: Record CAPA effectiveness review
 *     description: |
 *       Verifies if the corrective/preventive actions actually worked.
 *       
 *       **When to review:** Typically 30-90 days after implementation.
 *       
 *       **Effectiveness Criteria Examples:**
 *       - "Zero recurrence of this defect code in next 3 production runs"
 *       - "Cpk > 1.33 maintained for 30 days"
 *       - "No customer complaints for 6 months"
 *       
 *       **If NOT effective:** System will flag for new CAPA creation
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CAPA MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - effectiveness_verified
 *             properties:
 *               effectiveness_verified:
 *                 type: boolean
 *                 description: Did the actions work?
 *               effectiveness_criteria:
 *                 type: string
 *                 description: How effectiveness was measured
 *               effectiveness_evidence:
 *                 type: string
 *                 description: Evidence that CAPA worked
 *               effectiveness_notes:
 *                 type: string
 *                 description: Additional notes from review
 *     responses:
 *       200:
 *         description: Effectiveness recorded successfully
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
 *                     effectiveness_verified:
 *                       type: boolean
 *       404:
 *         description: CAPA not found
 */
router.put('/:id/effectiveness',  recordEffectiveness);

/**
 * @swagger
 * /api/capas/{id}/close:
 *   put:
 *     summary: Close CAPA
 *     description: |
 *       Closes the CAPA after effectiveness is verified.
 *       
 *       **Prerequisites:**
 *       - effectiveness_verified must be true
 *       - All corrective and preventive actions must be completed
 *       
 *       After CAPA is closed, the linked NCR can be closed.
 *     tags: [CAPA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CAPA MongoDB _id
 *     responses:
 *       200:
 *         description: CAPA closed successfully
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
 *                     capa_id:
 *                       type: string
 *                     closed_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Cannot close - effectiveness not verified
 *       404:
 *         description: CAPA not found
 */
router.put('/:id/close',  closeCAPA);

module.exports = router;