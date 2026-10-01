const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Runs after express-validator check(...) chains.
 * Collects all validation errors into a single 422 ApiError.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  next(new ApiError(422, 'Validation failed', formatted));
};

module.exports = validate;
