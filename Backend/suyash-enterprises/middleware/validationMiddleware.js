const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

// Requisition validation rules
const requisitionValidation = [
  body('department').notEmpty().withMessage('Department is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('positionTitle').notEmpty().withMessage('Position title is required'),
  body('noOfPositions').isInt({ min: 1 }).withMessage('Number of positions must be at least 1'),
  body('employmentType').isIn(['Permanent', 'Contract', 'Temporary', 'Internship']).withMessage('Invalid employment type'),
  body('reasonForHire').notEmpty().withMessage('Reason for hire is required'),
  body('education').notEmpty().withMessage('Education requirement is required'),
  // ✅ FIXED: Changed from isInt to isString with custom validation for experience format
  body('experienceYears')
    .notEmpty().withMessage('Experience years is required')
    .isString().withMessage('Experience years must be a string')
    .custom((value) => {
      // Allow formats like: "0-1", "1-2", "2-3", "3-4", "4-5", "5+", "5-7", "7-10", "10+", "Fresher", "<1"
      const validPatterns = [
        /^\d+\s*-\s*\d+$/,      // "0-1", "1-2", "5-7", etc.
        /^\d+\+$/,               // "5+", "10+", etc.
        /^Fresher$/i,           // "Fresher" (case insensitive)
        /^<\d+$/,               // "<1", "<2", etc.
        /^\d+\s*-\s*\d+\s*years$/i, // "0-1 years", "2-3 years"
        /^\d+\+ years$/i        // "5+ years", "10+ years"
      ];
      
      const isValid = validPatterns.some(pattern => pattern.test(value.trim()));
      if (!isValid) {
        throw new Error('Experience years must be in format like "0-1", "2-3", "5+", "Fresher", or "<1"');
      }
      return true;
    }),
  body('skills').isArray().withMessage('Skills must be an array').notEmpty().withMessage('Skills are required'),
  body('budgetMin').isFloat({ min: 0 }).withMessage('Minimum budget must be a positive number'),
  body('budgetMax').isFloat({ min: 0 }).withMessage('Maximum budget must be a positive number')
    .custom((value, { req }) => {
      if (value < req.body.budgetMin) {
        throw new Error('Maximum budget must be greater than or equal to minimum budget');
      }
      return true;
    }),
  body('grade').notEmpty().withMessage('Grade is required'),
  body('justification').notEmpty().withMessage('Justification is required').isLength({ max: 2000 }).withMessage('Justification cannot exceed 2000 characters'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority level'),
  body('targetHireDate').optional().isISO8601().withMessage('Invalid date format')
];

// Job opening validation
const jobValidation = [
  body('requisitionId').notEmpty().withMessage('Requisition ID is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('publishTo').isArray().withMessage('Publish to must be an array')
];

// Candidate validation
const candidateValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('source').isIn(['naukri', 'linkedin', 'indeed', 'walkin', 'reference', 'careerPage', 'other']).withMessage('Invalid source')
];

// Interview validation
const interviewValidation = [
  body('applicationId').notEmpty().withMessage('Application ID is required'),
  body('round').isIn(['Telephonic', 'Technical', 'HR', 'Managerial', 'Final']).withMessage('Invalid interview round'),
  body('interviewers').isArray().withMessage('Interviewers must be an array'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required'),
  body('type').isIn(['in-person', 'video', 'telephonic']).withMessage('Invalid interview type')
];

// Interview feedback validation
const feedbackValidation = [
  body('ratings').optional().isObject(),
  body('ratings.technical').optional().isInt({ min: 1, max: 5 }),
  body('ratings.communication').optional().isInt({ min: 1, max: 5 }),
  body('ratings.problemSolving').optional().isInt({ min: 1, max: 5 }),
  body('ratings.culturalFit').optional().isInt({ min: 1, max: 5 }),
  body('ratings.overall').optional().isInt({ min: 1, max: 5 }),
  body('decision').optional().isIn(['select', 'reject', 'hold']).withMessage('Invalid decision')
];

// ID param validation
const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Optional: Create a validation for updating requisition (partial updates)
const requisitionUpdateValidation = [
  body('department').optional().notEmpty().withMessage('Department cannot be empty'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty'),
  body('positionTitle').optional().notEmpty().withMessage('Position title cannot be empty'),
  body('noOfPositions').optional().isInt({ min: 1 }).withMessage('Number of positions must be at least 1'),
  body('employmentType').optional().isIn(['Permanent', 'Contract', 'Temporary', 'Internship']).withMessage('Invalid employment type'),
  body('reasonForHire').optional().notEmpty().withMessage('Reason for hire cannot be empty'),
  body('education').optional().notEmpty().withMessage('Education requirement cannot be empty'),
  body('experienceYears')
    .optional()
    .isString().withMessage('Experience years must be a string')
    .custom((value) => {
      const validPatterns = [
        /^\d+\s*-\s*\d+$/,
        /^\d+\+$/,
        /^Fresher$/i,
        /^<\d+$/,
        /^\d+\s*-\s*\d+\s*years$/i,
        /^\d+\+ years$/i
      ];
      const isValid = validPatterns.some(pattern => pattern.test(value.trim()));
      if (!isValid) {
        throw new Error('Experience years must be in format like "0-1", "2-3", "5+", "Fresher", or "<1"');
      }
      return true;
    }),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('budgetMin').optional().isFloat({ min: 0 }).withMessage('Minimum budget must be a positive number'),
  body('budgetMax').optional().isFloat({ min: 0 }).withMessage('Maximum budget must be a positive number')
    .custom((value, { req }) => {
      if (value && req.body.budgetMin && value < req.body.budgetMin) {
        throw new Error('Maximum budget must be greater than or equal to minimum budget');
      }
      return true;
    }),
  body('grade').optional().notEmpty().withMessage('Grade cannot be empty'),
  body('justification').optional().notEmpty().withMessage('Justification cannot be empty').isLength({ max: 2000 }),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('targetHireDate').optional().isISO8601().withMessage('Invalid date format')
];

module.exports = {
  validate,
  requisitionValidation,
  requisitionUpdateValidation,
  jobValidation,
  candidateValidation,
  interviewValidation,
  feedbackValidation,
  validateId,
  validatePagination
};