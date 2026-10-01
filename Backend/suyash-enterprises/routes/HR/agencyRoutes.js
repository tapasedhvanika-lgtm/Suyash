const express = require('express');
const router = express.Router();

// Import all controller functions
const { 
  createAgency, 
  getAgencies, 
  updateAgency, 
  deleteAgency, 
  bulkDeleteAgencies 
} = require('../../controllers/HR/agencyController');

router.post('/', createAgency);
router.get('/', getAgencies);
router.delete('/bulk', bulkDeleteAgencies);
router.put('/:id', updateAgency);
router.delete('/:id', deleteAgency);

module.exports = router;