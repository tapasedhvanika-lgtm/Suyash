// routes/Inventory/rmPurchaseRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createRMPurchase, 
  listRMPurchases, 
  getRMPurchase, 
  updateRMPurchase, 
  deleteRMPurchase 
} = require('../../controllers/Inventory/rmPurchaseController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', createRMPurchase);
router.get('/', listRMPurchases);
router.get('/:id', getRMPurchase);
router.put('/:id', updateRMPurchase);
router.delete('/:id', deleteRMPurchase);

module.exports = router;