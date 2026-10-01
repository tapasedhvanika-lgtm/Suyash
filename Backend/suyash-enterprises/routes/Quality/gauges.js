// routes/Quality/gaugeRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerGauge,
  getAllGauges,
  getGaugeById,
  getCalibrationDue,
  recordCalibration,
  updateGauge,
  getCalibrationHistory,
    deleteGauge,
} = require('../../controllers/Quality/gaugeController');

const { protect, authorize } = require('../../middleware/authMiddleware');
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Gauge Master
 *   description: Gauge/Instrument management for calibration tracking
 */

// ======================================================
// REGISTER NEW GAUGE
// ======================================================

/**
 * @swagger
 * /api/gauges:
 *   post:
 *     summary: Register a new gauge/instrument
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gauge_name
 *               - gauge_type
 *               - gauge_code
 *               - calibration_frequency_days
 *             properties:
 *               gauge_name: { type: string }
 *               gauge_type:
 *                 type: string
 *                 enum: ['Vernier Caliper', 'Outside Micrometer', 'Inside Micrometer', 'Depth Gauge', 'Dial Gauge', 'CMM', 'Go-NoGo Gauge', 'Thread Gauge', 'Pressure Gauge', 'Torque Wrench', 'Shore Durometer', 'Rockwell Hardness Tester', 'XRF Gauge', 'Megger', 'Micro-Ohmmeter', 'HiPot Tester', 'Surface Roughness Tester', 'Optical Comparator', 'Other']
 *               gauge_code: { type: string }
 *               make: { type: string }
 *               model: { type: string }
 *               serial_no: { type: string }
 *               range: { type: string }
 *               least_count: { type: string }
 *               accuracy: { type: string }
 *               department: { type: string }
 *               location: { type: string }
 *               custodian_id: { type: string }
 *               calibration_frequency_days: { type: number }
 *               last_calibration_date: { type: string, format: date }
 *               calibration_agency: { type: string }
 *               nabl_accredited: { type: boolean }
 *               msa_required: { type: boolean }
 *               gage_r_and_r_percent: { type: number }
 *               bias: { type: number }
 *               linearity: { type: number }
 *     responses:
 *       201:
 *         description: Gauge registered successfully
 *       400:
 *         description: gauge_code already exists
 *       500:
 *         description: Server error
 */
router.post('/', registerGauge);

// ======================================================
// GET ALL GAUGES (with filters, search & pagination)
// ======================================================

/**
 * @swagger
 * /api/gauges:
 *   get:
 *     summary: Get all gauges with optional filtering and pagination
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by gauge_name, gauge_code, serial_no, make, model
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Pending Calibration', 'Calibrated', 'Overdue', 'Out of Service', 'Under Repair', 'Condemned']
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *       - in: query
 *         name: gauge_type
 *         schema: { type: string }
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: ['gauge_name', 'gauge_code', 'status', 'next_calibration_date', 'createdAt', 'gauge_id']
 *           default: 'gauge_id'
 *       - in: query
 *         name: sort_order
 *         schema: { type: string, enum: ['asc', 'desc'], default: 'asc' }
 *     responses:
 *       200:
 *         description: Gauges retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', getAllGauges);

// ======================================================
// GET CALIBRATION DUE REPORT — must come before /:id
// ======================================================

/**
 * @swagger
 * /api/gauges/calibration-due:
 *   get:
 *     summary: Get gauges due for calibration
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *         description: Number of days to look ahead
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Calibration due report retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/calibration-due', getCalibrationDue);

// ======================================================
// GET GAUGE BY ID
// ======================================================

/**
 * @swagger
 * /api/gauges/{id}:
 *   get:
 *     summary: Get gauge by ID
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gauge retrieved successfully
 *       404:
 *         description: Gauge not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getGaugeById);

// ======================================================
// RECORD CALIBRATION EVENT
// ======================================================

/**
 * @swagger
 * /api/gauges/{id}/calibrate:
 *   put:
 *     summary: Record a calibration event for a gauge
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calibration_date
 *               - certificate_no
 *               - certificate_path
 *             properties:
 *               calibration_date: { type: string, format: date }
 *               calibration_type:
 *                 type: string
 *                 enum: ['Internal', 'External NABL', 'Manufacturer Service']
 *               calibrating_agency: { type: string }
 *               certificate_no: { type: string }
 *               certificate_path: { type: string }
 *               found_condition:
 *                 type: string
 *                 enum: ['In Tolerance', 'Out of Tolerance', 'Damaged']
 *               adjustment_made: { type: boolean }
 *               adjustment_details: { type: string }
 *               calibrated_by: { type: string }
 *               traceability: { type: string }
 *     responses:
 *       200:
 *         description: Calibration recorded successfully
 *       400:
 *         description: Missing required fields or gauge is condemned
 *       404:
 *         description: Gauge not found
 *       500:
 *         description: Server error
 */
router.put('/:id/calibrate', recordCalibration);

// ======================================================
// UPDATE GAUGE
// ======================================================

/**
 * @swagger
 * /api/gauges/{id}:
 *   put:
 *     summary: Update gauge information
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location: { type: string }
 *               department: { type: string }
 *               custodian_id: { type: string }
 *               status:
 *                 type: string
 *                 enum: ['Pending Calibration', 'Overdue', 'Out of Service', 'Under Repair', 'Condemned']
 *               msa_result:
 *                 type: string
 *                 enum: ['Accepted', 'Conditional', 'Rejected']
 *               msa_grr_pct: { type: number }
 *               msa_last_done: { type: string, format: date }
 *               gage_r_and_r_percent: { type: number }
 *               bias: { type: number }
 *               linearity: { type: number }
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Gauge updated successfully
 *       400:
 *         description: Cannot manually set status to Calibrated
 *       404:
 *         description: Gauge not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateGauge);

// ======================================================
// GET CALIBRATION HISTORY
// ======================================================

/**
 * @swagger
 * /api/gauges/{id}/calibration-history:
 *   get:
 *     summary: Get full calibration history for a gauge
 *     tags: [Gauge Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Calibration history retrieved successfully
 *       404:
 *         description: Gauge not found
 *       500:
 *         description: Server error
 */
router.get('/:id/calibration-history', getCalibrationHistory);
// ======================================================
// DELETE GAUGE (SOFT DELETE)
// ======================================================

router.delete('/:id', deleteGauge);


module.exports = router;