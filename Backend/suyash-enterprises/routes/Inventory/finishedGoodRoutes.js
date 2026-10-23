const express = require('express');
const router = express.Router();
const { 
  createFinishedGood, listFinishedGoods, getFinishedGood, updateFinishedGood, deleteFinishedGood 
} = require('../../controllers/Inventory/finishedGoodController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', createFinishedGood);
router.get('/', listFinishedGoods);
router.get('/:id', getFinishedGood);
router.put('/:id', updateFinishedGood);
router.delete('/:id', deleteFinishedGood);

module.exports = router;