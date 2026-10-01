const { body } = require('express-validator');

// Strong password: min 8 chars, 1 upper, 1 lower, 1 number, 1 special char
const strongPasswordRule = body('password')
  .isString()
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/\d/)
  .withMessage('Password must contain at least one number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain at least one special character');

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidator = [
  body('refreshToken').optional().isString(),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  strongPasswordRule,
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isString()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('New password must contain at least one special character'),
];

const updateProfileValidator = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[0-9]{7,15}$/)
    .withMessage('Phone number must be 7-15 digits'),
];

module.exports = {
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
};
