const express = require('express');
const router = express.Router();

const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  bulkDeleteDepartments // 👈 Import the new function
} = require('../../controllers/HR/departmentController');

const { protect } = require('../../middleware/authMiddleware');

// Public routes
router.get('/', protect, getDepartments);
router.get('/:id', protect, getDepartment);
router.post('/', protect, createDepartment);
router.put('/:id', protect, updateDepartment);

// 👇 BULK DELETE MUST COME BEFORE /:id (otherwise Express treats "bulk" as an ID)
router.delete('/bulk', protect, bulkDeleteDepartments);

// Single delete
router.delete('/:id', protect, deleteDepartment);

module.exports = router;