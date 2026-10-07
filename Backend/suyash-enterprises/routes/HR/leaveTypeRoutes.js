const express = require('express');
const router = express.Router();
const {
  getLeaveTypes,
  getLeaveType,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  bulkDeleteLeaveTypes // ✅ Added
} = require('../../controllers/HR/leaveTypeController');
const { protect } = require('../../middleware/authMiddleware');
router.use(protect);

// ✅ NEW: Bulk delete route — MUST come BEFORE /:id routes
router.delete('/bulk', protect, bulkDeleteLeaveTypes);

// Public routes
router.get('/', protect, getLeaveTypes);
router.get('/:id', protect, getLeaveType);
router.post('/', protect, createLeaveType);
router.put('/:id', protect, updateLeaveType);
router.delete('/:id', protect, deleteLeaveType); // Hard delete

module.exports = router;