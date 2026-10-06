'use strict';
const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getCertificate,
  getCertificateByWO,
  downloadCertificate,
  markAsSent,
  deleteCertificate,
  getAllCertificates,
} = require('../../controllers/Quality/certificateController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: QualityCertificate
 *   description: Quality Certificate & Test Report — Phase 10 BE-024
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckpointValue:
 *       type: object
 *       properties:
 *         checkpoint_seq:
 *           type: integer
 *         characteristic:
 *           type: string
 *         specification:
 *           type: string
 *         nominal:
 *           type: number
 *         usl:
 *           type: number
 *         lsl:
 *           type: number
 *         unit:
 *           type: string
 *         measured_value:
 *           type: number
 *         actual_readings:
 *           type: array
 *           items:
 *             type: number
 *         result:
 *           type: string
 *           enum: [Pass, Fail]
 *
 *     QualityCertificateResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         cert_id:
 *           type: string
 *           example: "QCR-202503-0019"
 *         cert_type:
 *           type: string
 *           enum: [Certificate of Conformance, Test Report, Material Certificate, Dimensional Report, Plating Certificate, FAI Report, PPAP Report]
 *         issue_date:
 *           type: string
 *           format: date-time
 *         part_no:
 *           type: string
 *         part_name:
 *           type: string
 *         lot_no:
 *           type: string
 *         quantity:
 *           type: integer
 *         actual_values:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckpointValue'
 *         certificate_path:
 *           type: string
 */

/**
 * @swagger
 * /api/quality-certificates:
 *   post:
 *     summary: Generate Quality Certificate / Test Report
 *     description: |
 *       Generates a Certificate of Conformance (CoC) or Test Report for finished goods.
 *       
 *       **Certificate Types:**
 *       - Certificate of Conformance: General conformance statement
 *       - Test Report: Includes actual measured values
 *       - Material Certificate: Raw material test results
 *       - Dimensional Report: Full dimensional inspection results
 *       - Plating Certificate: Plating thickness and adhesion results
 *       - FAI Report: First Article Inspection report
 *       - PPAP Report: Production Part Approval Process package
 *       
 *       **Prerequisites:**
 *       - Final inspection must be Accepted
 *       - Work Order must be completed
 *       
 *       **Output:** Generates PDF certificate stored in /uploads/certificates/
 *     tags: [QualityCertificate]
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
 *               - final_inspection_id
 *             properties:
 *               cert_type:
 *                 type: string
 *                 enum: [Certificate of Conformance, Test Report, Material Certificate, Dimensional Report, Plating Certificate, FAI Report, PPAP Report]
 *                 default: "Certificate of Conformance"
 *               so_id:
 *                 type: string
 *                 description: Sales Order ID
 *               dc_id:
 *                 type: string
 *                 description: Delivery Challan ID
 *               wo_id:
 *                 type: string
 *                 required: true
 *                 description: Work Order ID
 *               final_inspection_id:
 *                 type: string
 *                 required: true
 *                 description: Final Inspection Record ID
 *               customer_po_number:
 *                 type: string
 *                 description: Customer PO reference
 *               lot_no:
 *                 type: string
 *                 description: Lot/Batch number (auto-generated if not provided)
 *               material_grade:
 *                 type: string
 *                 example: "C11000"
 *                 description: Raw material grade
 *               heat_no:
 *                 type: string
 *                 example: "HT-12345"
 *                 description: Heat number for traceability
 *               mill_cert_ref:
 *                 type: string
 *                 description: Vendor material test certificate reference
 *               batch_no:
 *                 type: string
 *                 description: Batch number
 *               declaration:
 *                 type: string
 *                 description: Custom declaration text
 *     responses:
 *       201:
 *         description: Certificate generated successfully
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
 *                     cert_id:
 *                       type: string
 *                     certificate_path:
 *                       type: string
 *                     download_url:
 *                       type: string
 *       400:
 *         description: Final inspection not accepted
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
 *                   example: "Cannot generate certificate: Final inspection not accepted"
 *       404:
 *         description: Work Order or Inspection not found
 *       401:
 *         description: Unauthorized
 */
router.post('/quality-certificates', authorize('admin', 'manager', 'qc'), generateCertificate);

/**
 * @swagger
 * /api/quality-certificates/{id}:
 *   get:
 *     summary: Get certificate details by ID
 *     description: Returns certificate metadata (not PDF)
 *     tags: [QualityCertificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate MongoDB _id
 *     responses:
 *       200:
 *         description: Certificate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/QualityCertificateResponse'
 *       404:
 *         description: Certificate not found
 */
router.get('/quality-certificates/:id', authorize('admin', 'manager', 'qc', 'sales'), getCertificate);

/**
 * @swagger
 * /api/quality-certificates/by-wo/{wo_id}:
 *   get:
 *     summary: Get certificates by Work Order
 *     description: Returns all certificates generated for a specific Work Order
 *     tags: [QualityCertificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wo_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID
 *     responses:
 *       200:
 *         description: Certificates retrieved successfully
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
 *                     $ref: '#/components/schemas/QualityCertificateResponse'
 */
router.get('/quality-certificates/by-wo/:wo_id', authorize('admin', 'manager', 'qc', 'sales'), getCertificateByWO);

/**
 * @swagger
 * /api/quality-certificates/{id}/download:
 *   get:
 *     summary: Download certificate PDF
 *     description: Downloads the generated PDF certificate file
 *     tags: [QualityCertificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate MongoDB _id
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Certificate or PDF file not found
 */
router.get('/quality-certificates/:id/download', authorize('admin', 'manager', 'qc', 'sales'), downloadCertificate);

/**
 * @swagger
 * /api/quality-certificates/{id}/mark-sent:
 *   put:
 *     summary: Mark certificate as sent to customer
 *     description: Updates the certificate status to indicate it has been emailed/shared with customer
 *     tags: [QualityCertificate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate MongoDB _id
 *     responses:
 *       200:
 *         description: Certificate marked as sent
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
 *                     cert_id:
 *                       type: string
 *                     sent_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Certificate not found
 */
router.put('/quality-certificates/:id/mark-sent', markAsSent);

// Add this line in your router file after the imports and before other routes
 
/**

* @swagger

* /api/quality-certificates:

*   get:

*     summary: Get all certificates with filters

*     description: Returns paginated list of quality certificates with filtering options

*     tags: [QualityCertificate]

*     security:

*       - bearerAuth: []

*     parameters:

*       - in: query

*         name: wo_id

*         schema:

*           type: string

*         description: Filter by Work Order ID

*       - in: query

*         name: so_id

*         schema:

*           type: string

*         description: Filter by Sales Order ID

*       - in: query

*         name: dc_id

*         schema:

*           type: string

*         description: Filter by Delivery Challan ID

*       - in: query

*         name: customer_id

*         schema:

*           type: string

*         description: Filter by Customer ID

*       - in: query

*         name: sent_to_customer

*         schema:

*           type: boolean

*         description: Filter by sent status

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

*     responses:

*       200:

*         description: List of certificates retrieved successfully

*/

router.get('/quality-certificates',  getAllCertificates);
 // ======================================================
// DELETE QUALITY CERTIFICATE
// ======================================================
router.delete(
  '/quality-certificates/:id',
  authorize('admin', 'manager', 'qc'),
  deleteCertificate
);


module.exports = router;