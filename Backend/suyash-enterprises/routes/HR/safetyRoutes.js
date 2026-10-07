// routes/safetyRoutes.js
const express = require('express');
const router = express.Router();
const safetyController = require('../../controllers/HR/safetyController');
const upload = require('../../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: PPE Management
 *   description: Personal Protective Equipment management
 */

/**
 * @swagger
 * tags:
 *   name: Safety Training
 *   description: Employee safety training and certifications
 */

/**
 * @swagger
 * tags:
 *   name: Accident/Incident
 *   description: Workplace accident and incident reporting
 */

/**
 * @swagger
 * tags:
 *   name: Medical Records
 *   description: Employee medical checkups and health records
 */

/**
 * @swagger
 * tags:
 *   name: Dashboard & Reports
 *   description: Safety dashboard and reporting
 */

// PPE Routes

router.post('/ppe', safetyController.createPPE);
router.get('/ppe', safetyController.getAllPPE);
router.put('/ppe/:id', safetyController.updatePPE);
router.delete('/ppe/:id', safetyController.deletePPE);

// PPE Issuance Routes
router.post('/ppe/issue', safetyController.issuePPE);
router.get('/ppe/issuance', safetyController.getAllIssuances);
router.get('/ppe/expiring-soon', safetyController.getExpiringPPE);
router.get('/ppe/:id', safetyController.getPPEById);
router.get('/employee/:employeeId/ppe', safetyController.getEmployeePPE);
router.put('/ppe/issuance/:id/return', safetyController.returnPPE);

// Training Routes
router.post('/training', safetyController.createTraining);
router.put('/training/:id', safetyController.updateTraining);
router.delete('/training/:id', safetyController.deleteTraining);

// Add this new route for the general Edit modal
router.put('/accidents/:id/investigate', safetyController.updateInvestigation);
router.put('/accidents/:id', safetyController.updateAccident); // 👈 Keep it with the accident routes
router.get('/training', safetyController.getAllTraining);

router.post('/training/assign', safetyController.assignTraining);
router.get('/employee/:employeeId/training', safetyController.getEmployeeTraining);
router.get('/training/expiring-soon', safetyController.getExpiringTraining);

// ============================================================
// Accident/Incident Routes
// ============================================================

// ✅ NEW: Bulk delete accidents — MUST come BEFORE /accidents/:id
router.delete('/accidents/bulk', safetyController.bulkDeleteAccidents);

router.post('/accidents', safetyController.createAccident);
router.delete('/accidents/:id', safetyController.deleteAccident);
router.get('/accidents', safetyController.getAllAccidents);
router.get('/employee/:employeeId/accidents', safetyController.getEmployeeAccidents);
router.put('/accidents/:id/investigate', safetyController.updateInvestigation);
router.get('/accidents/stats', safetyController.getAccidentStats);

// ============================================================
// Medical Records Routes
// ============================================================
router.post('/medical-records', upload.single('reportFile'), safetyController.createMedicalRecord);
router.put('/medical-records/:id', upload.single('reportFile'), safetyController.updateMedicalRecord);
router.delete('/medical-records/:id', safetyController.deleteMedicalRecord);
router.get('/medical-records', safetyController.getAllMedicalRecords);
router.get('/employee/:employeeId/medical-records', safetyController.getEmployeeMedicalRecords);
router.get('/medical-records/upcoming-checkups', safetyController.getUpcomingCheckups);

// ============================================================
// Dashboard & Reports Routes
// ============================================================
router.get('/dashboard/stats', safetyController.getDashboardStats);

module.exports = router;