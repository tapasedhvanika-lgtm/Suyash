// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee,
  bulkDeleteEmployees, // 👈 Import the new function
  getEmployeeStats,
  getEmployeeYearlySummary
} = require('../../controllers/HR/employeeController');

// Middleware imports
const { protect } = require('../../middleware/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

// GET all employees (with filters)
router.get('/', getEmployees);

// Dashboard stats (must come before /:id)
router.get('/dashboard/stats', getEmployeeStats);

// Yearly summary (must come before /:id)
router.get('/summary/:employeeId/year/:year', getEmployeeYearlySummary);

// 👇 BULK DELETE MUST COME BEFORE /:id (otherwise Express treats "bulk" as an ID)
router.delete('/bulk', bulkDeleteEmployees);

// Standard CRUD
router.post('/', createEmployee);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);

// Hard delete (specific route before generic /:id delete)
router.delete('/:id/hard', hardDeleteEmployee);

// Soft delete (single)
router.delete('/:id', deleteEmployee);

module.exports = router;