const express = require('express');
const router = express.Router();
const { createMaterialIssueSlip, listMaterialIssueSlips, getMaterialIssueSlip } = require('../../controllers/Inventory/materialIssueSlipController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', createMaterialIssueSlip);
router.get('/', listMaterialIssueSlips);
router.get('/:id', getMaterialIssueSlip);

module.exports = router;