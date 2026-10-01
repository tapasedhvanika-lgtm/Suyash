// const express = require("express");
// const router = express.Router();
// const trainingController = require("../controllers/trainingController");

// /**
//  * @swagger
//  * tags:
//  *   name: Trainings
//  *   description: Training Record & Certification Tracking
//  */


// /**
//  * @swagger
//  * /api/trainings/create:
//  *   post:
//  *     summary: Create training record
//  *     tags: [Trainings]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               employeeId:
//  *                 type: string
//  *               trainingName:
//  *                 type: string
//  *               provider:
//  *                 type: string
//  *               startDate:
//  *                 type: string
//  *               endDate:
//  *                 type: string
//  *               status:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Training created successfully
//  */
// router.post("/create", trainingController.createTraining);


// /**
//  * @swagger
//  * /api/trainings/all:
//  *   get:
//  *     summary: Get all training records
//  *     tags: [Trainings]
//  *     responses:
//  *       200:
//  *         description: List of all training records
//  */
// router.get("/all", trainingController.getTrainings);


// /**
//  * @swagger
//  * /api/trainings/employee/{employeeId}:
//  *   get:
//  *     summary: Get trainings by employee ID
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: employeeId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Employee training list
//  */
// router.get("/employee/:employeeId", trainingController.getEmployeeTraining);


// /**
//  * @swagger
//  * /api/trainings/update/{id}:
//  *   put:
//  *     summary: Update training record
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *     responses:
//  *       200:
//  *         description: Training updated successfully
//  */
// router.put("/update/:id", trainingController.updateTraining);


// /**
//  * @swagger
//  * /api/trainings/delete/{id}:
//  *   delete:
//  *     summary: Delete training record
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Training deleted successfully
//  */
// router.delete("/delete/:id", trainingController.deleteTraining);


// module.exports = router;const express = require("express");

// const express = require("express");
// const router = express.Router();

// const trainingController = require("../controllers/trainingController");
// const trainingRecordController = require("../controllers/trainingRecordController");

// /**
//  * @swagger
//  * tags:
//  *   name: Trainings
//  *   description: Training Record & Certification Tracking
//  */


// /**
//  * @swagger
//  * /api/trainings/create:
//  *   post:
//  *     summary: Create training record
//  *     tags: [Trainings]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - trainingName
//  *               - provider
//  *               - startDate
//  *             properties:
//  *               employeeId:
//  *                 type: string
//  *                 example: "665f12c3ab1a456789012345"
//  *               trainingName:
//  *                 type: string
//  *                 example: "Forklift Safety Training"
//  *               provider:
//  *                 type: string
//  *                 example: "Internal Safety Department"
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *                 example: "2026-03-20"
//  *               endDate:
//  *                 type: string
//  *                 format: date
//  *                 example: "2026-03-21"
//  *               status:
//  *                 type: string
//  *                 example: "Scheduled"
//  *     responses:
//  *       201:
//  *         description: Training created successfully
//  */
// router.post("/create", trainingController.createTraining);



// /**
//  * @swagger
//  * /api/trainings/all:
//  *   get:
//  *     summary: Get all training records
//  *     tags: [Trainings]
//  *     responses:
//  *       200:
//  *         description: List of all training records
//  */
// router.get("/all", trainingController.getTrainings);



// /**
//  * @swagger
//  * /api/trainings/employee/{employeeId}:
//  *   get:
//  *     summary: Get trainings by employee ID
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: employeeId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: "665f12c3ab1a456789012345"
//  *     responses:
//  *       200:
//  *         description: Employee training list
//  */
// router.get("/employee/:employeeId", trainingController.getEmployeeTraining);



// /**
//  * @swagger
//  * /api/trainings/update/{id}:
//  *   put:
//  *     summary: Update training record
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: "665f12c3ab1a456789012345"
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               trainingName:
//  *                 type: string
//  *               provider:
//  *                 type: string
//  *               status:
//  *                 type: string
//  *                 example: "Completed"
//  *     responses:
//  *       200:
//  *         description: Training updated successfully
//  */
// router.put("/update/:id", trainingController.updateTraining);



// /**
//  * @swagger
//  * /api/trainings/delete/{id}:
//  *   delete:
//  *     summary: Delete training record
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: "665f12c3ab1a456789012345"
//  *     responses:
//  *       200:
//  *         description: Training deleted successfully
//  */
// router.delete("/delete/:id", trainingController.deleteTraining);



// /* =========================================================
//    TRAINING ASSIGNMENT & CERTIFICATION ROUTES
//    ========================================================= */


// /**
//  * @swagger
//  * /api/trainings/assign:
//  *   post:
//  *     summary: Assign training to employees
//  *     tags: [Trainings]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - trainingId
//  *               - employeeIds
//  *             properties:
//  *               trainingId:
//  *                 type: string
//  *                 example: "69b3e7afce1a371238f103df"
//  *               employeeIds:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 example:
//  *                   - "665f12c3ab1a456789012345"
//  *                   - "665f12c3ab1a456789012346"
//  *     responses:
//  *       200:
//  *         description: Training assigned successfully
//  */
// router.post("/assign", trainingRecordController.assignTraining);



// /**
//  * @swagger
//  * /api/trainings/complete:
//  *   post:
//  *     summary: Mark training as completed and generate certificate
//  *     tags: [Trainings]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - recordId
//  *             properties:
//  *               recordId:
//  *                 type: string
//  *                 example: "665f12c3ab1a456789012345"
//  *               score:
//  *                 type: number
//  *                 example: 90
//  */
// router.post("/complete", trainingRecordController.completeTraining);



// /**
//  * @swagger
//  * /api/trainings/history/{employeeId}:
//  *   get:
//  *     summary: Get employee training history
//  *     tags: [Trainings]
//  *     parameters:
//  *       - in: path
//  *         name: employeeId
//  *         required: true
//  *         schema:
//  *           type: string
//  */
// router.get("/history/:employeeId", trainingRecordController.getEmployeeTrainings);



// /**
//  * @swagger
//  * /api/trainings/certificates-expiring:
//  *   get:
//  *     summary: Get certificates expiring within 30 days
//  *     tags: [Trainings]
//  */
// router.get("/certificates-expiring", trainingRecordController.getExpiringCertificates);

// /**
//  * @swagger
//  * /api/trainings/all-records:
//  *   get:
//  *     summary: Get all employee training records (Admin View)
//  *     tags: [Trainings]
//  *     responses:
//  *       200:
//  *         description: List of all employee training records
//  */
// router.get("/all-records", trainingRecordController.getAllRecords);


// module.exports = router;const express = require("express");

// const express = require("express");
// const router = express.Router();
// const trainingController = require("../controllers/trainingController");
// const trainingRecordController = require("../controllers/trainingRecordController");

// /**
//  * @swagger
//  * tags:
//  *   name: Trainings
//  *   description: Training Management APIs
//  */

// /*
// =========================================================
// TRAINING (HR SIDE)
// =========================================================
// */

// /**
//  * @swagger
//  * /api/trainings/create:
//  *   post:
//  *     summary: Create new training
//  *     tags: [Trainings]
//  */
// router.post("/create", trainingController.createTraining);

// /**
//  * @swagger
//  * /api/trainings/all:
//  *   get:
//  *     summary: Get all trainings (HR)
//  *     tags: [Trainings]
//  */
// router.get("/all", trainingController.getTrainings);

// /**
//  * @swagger
//  * /api/trainings/employee/{employeeId}:
//  *   get:
//  *     summary: Get trainings by employee
//  *     tags: [Trainings]
//  */
// router.get("/employee/:employeeId", trainingController.getEmployeeTraining);

// /**
//  * @swagger
//  * /api/trainings/update/{id}:
//  *   put:
//  *     summary: Update training
//  *     tags: [Trainings]
//  */
// router.put("/update/:id", trainingController.updateTraining);

// /**
//  * @swagger
//  * /api/trainings/delete/{id}:
//  *   delete:
//  *     summary: Delete training
//  *     tags: [Trainings]
//  */
// router.delete("/delete/:id", trainingController.deleteTraining);


// /*
// =========================================================
// TRAINING ASSIGNMENT (EMPLOYEE SIDE)
// =========================================================
// */

// /**
//  * @swagger
//  * /api/trainings/assign:
//  *   post:
//  *     summary: Assign training to employees
//  *     tags: [Trainings]
//  */
// router.post("/assign", trainingRecordController.assignTraining);

// /**
//  * @swagger
//  * /api/trainings/complete:
//  *   post:
//  *     summary: Complete training and generate certificate
//  *     tags: [Trainings]
//  */
// router.post("/complete", trainingRecordController.completeTraining);

// /**
//  * @swagger
//  * /api/trainings/assigned:
//  *   get:
//  *     summary: Get all assigned trainings (FOR TABLE)
//  *     tags: [Trainings]
//  */
// router.get("/assigned", trainingRecordController.getAssignedTrainings);

// /**
//  * @swagger
//  * /api/trainings/history/{employeeId}:
//  *   get:
//  *     summary: Get employee training history
//  *     tags: [Trainings]
//  */
// router.get("/history/:employeeId", trainingRecordController.getEmployeeTrainings);

// /**
//  * @swagger
//  * /api/trainings/certificates-expiring:
//  *   get:
//  *     summary: Get expiring certificates
//  *     tags: [Trainings]
//  */
// router.get("/certificates-expiring", trainingRecordController.getExpiringCertificates);

// /**
//  * @swagger
//  * /api/trainings/all-records:
//  *   get:
//  *     summary: Get all assigned training records (Admin)
//  *     tags: [Trainings]
//  */
// router.get("/all-records", trainingRecordController.getAllRecords);

// module.exports = router;

const express = require("express");
const router = express.Router();

const trainingController = require("../../controllers/HR/trainingController");
const trainingRecordController = require("../../controllers/HR/trainingRecordController");

/*
=========================================================
TRAINING (HR SIDE)
=========================================================
*/

// Create Training
router.post("/create", trainingController.createTraining);

// Get All Trainings
router.get("/all", trainingController.getTrainings);

// Get Trainings by Employee
router.get("/employee/:employeeId", trainingController.getEmployeeTraining);

// Update Training
router.put("/update/:id", trainingController.updateTraining);

// Delete Training
router.delete("/delete/:id", trainingController.deleteTraining);


/*
=========================================================
TRAINING ASSIGNMENT (EMPLOYEE SIDE)
=========================================================
*/

// Assign Training
router.post("/assign", trainingRecordController.assignTraining);

// Complete Training
router.post("/complete", trainingRecordController.completeTraining);

// 🔥 IMPORTANT (for your table)
router.get("/assigned", trainingRecordController.getAssignedTrainings);

// Employee History
router.get("/history/:employeeId", trainingRecordController.getEmployeeTrainings);

// Expiring Certificates
router.get("/certificates-expiring", trainingRecordController.getExpiringCertificates);

// Admin Records
router.get("/all-records", trainingRecordController.getAllRecords);

module.exports = router;