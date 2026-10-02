// routes/employeeBehaviorRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');

const {
  submitBehaviorFeedback,
  getEmployeeBehaviorHistory,
  getBehaviorSummary,
  getBehaviorById,
  updateBehavior,
  resolveBehavior,
  deleteBehavior,
  getPendingCases,
  getAllBehavior,
  deleteAttachment,
  bulkDeleteBehaviors // 👈 Import the new function
} = require('../../controllers/HR/employeeBehaviorController');

const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// ==========================================
// SPECIFIC ROUTES (must come before /:id)
// ==========================================

// Submit feedback with multiple file attachments
router.route('/')
  .post(
    authorize('HR', 'Admin', 'SuperAdmin'),
    upload.array('attachments', 5), // Allow up to 5 files
    submitBehaviorFeedback
  );

// Get all behavior records with filters
router.route('/all')
  .get(authorize('HR', 'Admin', 'SuperAdmin'), getAllBehavior);

// Get summary dashboard
router.route('/summary')
  .get(authorize('HR', 'Admin', 'SuperAdmin'), getBehaviorSummary);

// Get pending cases
router.route('/pending-cases')
  .get(authorize('HR', 'Admin', 'SuperAdmin'), getPendingCases);

// 👇 BULK DELETE MUST COME BEFORE /:id (otherwise Express treats "bulk" as an ID)
router.route('/bulk')
  .delete(authorize('HR', 'Admin', 'SuperAdmin'), bulkDeleteBehaviors);

// Get behavior history for specific employee
router.route('/employee/:employeeId')
  .get(authorize('HR', 'Admin', 'SuperAdmin', 'Supervisor'), getEmployeeBehaviorHistory);

// ==========================================
// PARAMETERIZED ROUTES (/:id) - MUST COME LAST
// ==========================================

// Resolve behavior case (specific before generic)
router.route('/:id/resolve')
  .post(authorize('HR', 'Admin', 'SuperAdmin'), resolveBehavior);

// Delete single attachment
router.route('/:id/attachments/:attachmentId')
  .delete(authorize('HR', 'Admin', 'SuperAdmin'), deleteAttachment);

// Single behavior record operations
router.route('/:id')
  .get(authorize('HR', 'Admin', 'SuperAdmin'), getBehaviorById)
  .put(
    authorize('HR', 'Admin', 'SuperAdmin'),
    upload.array('newAttachments', 5),
    updateBehavior
  )
  .delete(authorize('Admin', 'SuperAdmin'), deleteBehavior);

module.exports = router;