const express = require('express');
const router = express.Router();
const inwardReceiptController = require('../../controllers/Dispatch/inwardReceiptController');
const uploadGRN = require('../../middleware/uploadGRN');

// Dummy authentication for testing
const authenticate = (req, res, next) => {
  const mongoose = require('mongoose');
  req.user = { 
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User'
  };
  next();
};

router.use(authenticate);

/**
 * GET /api/inward-receipts/pending/:dc_id
 * Get pending receipt quantities for a DC
 */
router.get('/pending/:dc_id', inwardReceiptController.getPendingReceipts);

/**
 * GET /api/inward-receipts/receipt-status/:dc_id
 * Get receipt status summary for a DC (NEW ENDPOINT)
 */
router.get('/receipt-status/:dc_id', inwardReceiptController.getReceiptStatus);

/**
 * POST /api/inward-receipts
 * Create a new inward receipt with document files
 * Uses uploadGRN.array('documents') for multiple file uploads
 */
router.post('/', uploadGRN.array('documents'), inwardReceiptController.createInwardReceipt);

/**
 * GET /api/inward-receipts
 * List all inward receipts with filters
 */
router.get('/', inwardReceiptController.listInwardReceipts);

/**
 * GET /api/inward-receipts/:id
 * Get single inward receipt
 */
router.get('/:id', inwardReceiptController.getInwardReceipt);

/**
 * POST /api/inward-receipts/:id/documents
 * Upload document for inward receipt
 * Uses uploadGRN.single('document') for single file upload
 */
router.post('/:id/documents', uploadGRN.single('document'), inwardReceiptController.uploadDocument);

/**
 * GET /api/inward-receipts/summary/:dc_id
 * Get receipt summary for a DC
 */
router.get('/summary/:dc_id', inwardReceiptController.getReceiptSummary);

console.log('✅ Inward receipt routes defined');

module.exports = router;
