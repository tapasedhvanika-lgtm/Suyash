const express = require('express');
const router = express.Router();

const {
  getDesignations,
  getDesignation,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  bulkDeleteDesignations // 👈 Import the new function
} = require('../../controllers/HR/designationController');

const { protect } = require('../../middleware/authMiddleware');

// Public routes
router.get('/', protect, getDesignations);
router.get('/:id', protect, getDesignation);
router.post('/', protect, createDesignation);
router.put('/:id', protect, updateDesignation);

// 👇 BULK DELETE MUST COME BEFORE /:id (otherwise Express treats "bulk" as an ID)
router.delete('/bulk', protect, bulkDeleteDesignations);

// Single delete
router.delete('/:id', protect, deleteDesignation);

module.exports = router;