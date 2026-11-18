// const express = require('express');
// const router = express.Router();
// const { createMaterialIssueSlip, listMaterialIssueSlips, getMaterialIssueSlip } = require('../../controllers/Inventory/materialIssueSlipController');
// const { protect } = require('../../middleware/authMiddleware');

// router.use(protect);

// router.post('/', createMaterialIssueSlip);
// router.get('/', listMaterialIssueSlips);
// router.get('/:id', getMaterialIssueSlip);

// module.exports = router;

const express = require('express');
const router = express.Router();


const { 
  createMaterialIssueSlip, 
  listMaterialIssueSlips, 
  getMaterialIssueSlip,
  deleteMaterialIssueSlip 
} = require('../../controllers/Inventory/materialIssueSlipController');

const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', createMaterialIssueSlip);
router.get('/', listMaterialIssueSlips);
router.get('/:id', getMaterialIssueSlip);


router.delete('/:id', deleteMaterialIssueSlip);

module.exports = router;