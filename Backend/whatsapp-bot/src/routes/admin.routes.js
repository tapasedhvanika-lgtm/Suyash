const express = require('express');
const router = express.Router();

const authController = require('../controllers/admin.auth.controller');
const profileController = require('../controllers/admin.profile.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
} = require('../validators/admin.validator');

// ---- Public auth routes ----
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);

// ---- Protected routes (require valid access token) ----
router.post('/logout', authenticate, authController.logout);
router.post(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);

router.get('/profile', authenticate, profileController.getProfile);
router.put(
  '/profile',
  authenticate,
  upload.single('profileImage'),
  updateProfileValidator,
  validate,
  profileController.updateProfile
);

module.exports = router;
