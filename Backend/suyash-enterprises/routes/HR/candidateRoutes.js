const express = require('express');
const router = express.Router();
const upload = require('../../middleware/uploadMiddleware');
const {
  addCandidate,
  uploadResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  addCandidateNote,
  shortlistCandidate,
  updateCandidate, 
  updateCandidateResume,
  deleteCandidate,
  bulkDeleteCandidates
} = require('../../controllers/HR/candidateController');
const { protect } = require('../../middleware/authMiddleware');
const { validate, candidateValidation, validateId } = require('../../middleware/validationMiddleware');

router.use(protect);

// ✅ Bulk delete MUST come before /:id routes
router.delete('/bulk', bulkDeleteCandidates);

router.route('/')
  .get(getCandidates)
  .post(validate(candidateValidation), addCandidate);

router.post('/upload-resume', upload.single('resume'), uploadResume);

router.route('/:id')
  .get(validate(validateId), getCandidateById)
  .put(updateCandidate)
  .delete(validate(validateId), deleteCandidate); // ✅ Moved single delete here

router.put('/:id/resume', 
  upload.single('resume'), 
  updateCandidateResume
); 

router.put('/:id/status', validate(validateId), updateCandidateStatus);
router.post('/:id/notes', validate(validateId), addCandidateNote);
router.post('/:id/shortlist', validate(validateId), shortlistCandidate);

module.exports = router;