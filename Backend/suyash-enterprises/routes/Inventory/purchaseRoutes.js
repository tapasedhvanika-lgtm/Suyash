// const express = require('express');
// const router = express.Router();
// const purchaseController = require('../../controllers/Inventory/purchaseController');

// // API Endpoints
// router.post('/', purchaseController.createPurchase);      // POST: Create
// router.get('/', purchaseController.getAllPurchases);      // GET: Fetch all

// module.exports = router;

const express = require('express');
const router = express.Router();
const purchaseController = require('../../controllers/Inventory/purchaseController');

// API Endpoints
router.post('/', purchaseController.createPurchase);      // POST: Create
router.get('/', purchaseController.getAllPurchases);      // GET: Fetch all

// ✅ NAYE ROUTES (Edit aur Delete ke liye)
router.put('/:id', purchaseController.updatePurchase);    // PUT: Update by ID
router.delete('/:id', purchaseController.deletePurchase); // DELETE: Delete by ID

module.exports = router;