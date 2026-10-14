const express = require('express');
const router = express.Router();

const {
  createRouting,
  getRoutings,
  getRoutingById,
  getRoutingsByItem,
  updateRouting,
  activateRouting,
  approveRouting,
  rejectRouting,
  deleteRouting,
  bulkDeleteRoutings // ✅ Added this
} = require('../../controllers/BOM/routingController'); // ✅ Matches your folder path

const { protect, authorize } = require('../../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ✅ BULK DELETE (MUST BE FIRST!)
// This needs to be before /:id routes so Express doesn't treat "bulk-delete" as an ID.
router.post('/bulk-delete', protect, authorize('Admin', 'Manager'), bulkDeleteRoutings);

// Create a new routing
router.post('/', protect, authorize('Manager', 'Production'), createRouting);

// Get all routings
router.get('/', protect, getRoutings);

// Get routings by item ID
router.get('/by-item/:item_id', protect, getRoutingsByItem);

// Status change routes
router.post('/:id/activate', protect, authorize('Manager'), activateRouting);
router.post('/:id/approve', protect, authorize('Manager'), approveRouting);
router.post('/:id/reject', protect, authorize('Manager'), rejectRouting);

// Generic ID routes (these must be last)
router.get('/:id', protect, getRoutingById);
router.put('/:id', protect, authorize('Manager'), updateRouting);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteRouting);

module.exports = router;