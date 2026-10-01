const Admin = require('../models/Admin');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const { issueTokenPair, rotateRefreshToken, generateResetToken, hashToken } = require('./token.service');
const RESET_PASSWORD_TOKEN_EXPIRES_MIN = process.env.RESET_PASSWORD_TOKEN_EXPIRES_MIN;
const BASE_URL = process.env.BASE_URL;

/** Admin login: verify credentials, issue tokens, stamp lastLogin. */
const login = async ({ email, password }) => {
  const admin = await Admin.findOne({ email }).select('+password +refreshToken');
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (admin.status !== 'Active') {
    throw new ApiError(403, 'Admin account is inactive');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = await issueTokenPair(admin);
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  return { admin: admin.toSafeObject(), ...tokens };
};

/** Admin logout: clear the stored refresh token so it can no longer be rotated. */
const logout = async (adminId) => {
  await Admin.findByIdAndUpdate(adminId, { refreshToken: null });
};

/** Exchanges a valid refresh token for a new token pair. */
const refreshToken = async (incomingToken) => rotateRefreshToken(incomingToken);

/**
 * Starts the forgot-password flow: generates a reset token, stores its hash
 * + expiry on the admin, and emails the raw token as a reset link.
 * Always resolves without revealing whether the email exists (anti-enumeration).
 */
const forgotPassword = async (email) => {
  const admin = await Admin.findOne({ email });
  if (!admin) return; // silent no-op on purpose

  const { rawToken, hashedToken } = generateResetToken();
  admin.resetPasswordToken = hashedToken;
  admin.resetPasswordExpires = new Date(Date.now() + RESET_PASSWORD_TOKEN_EXPIRES_MIN * 60 * 1000);
  await admin.save({ validateBeforeSave: false });

  const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: admin.email,
      subject: 'Reset your admin password',
      html: `<p>Hello ${admin.name},</p>
             <p>Click the link below to reset your password. This link expires in ${RESET_PASSWORD_TOKEN_EXPIRES_MIN} minutes.</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>If you did not request this, you can safely ignore this email.</p>`,
      text: `Reset your password: ${resetUrl} (expires in ${RESET_PASSWORD_TOKEN_EXPIRES_MIN} minutes)`,
    });
  } catch (err) {
    // Don't fail the request just because SMTP isn't configured in dev;
    // surface the token in server logs instead so local testing still works.
    console.warn('[admin.service] Failed to send reset email, raw token (dev only):', rawToken);
  }
};

/** Completes the forgot-password flow: verifies token + expiry, sets new password. */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = hashToken(rawToken);

  const admin = await Admin.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!admin) {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }

  admin.password = newPassword;
  admin.resetPasswordToken = null;
  admin.resetPasswordExpires = null;
  admin.refreshToken = null; // force re-login everywhere after a reset
  await admin.save();
};

/** Change password while logged in: requires current password confirmation. */
const changePassword = async (adminId, currentPassword, newPassword) => {
  const admin = await Admin.findById(adminId).select('+password');
  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  admin.password = newPassword;
  admin.refreshToken = null; // force re-login everywhere after a password change
  await admin.save();
};

const getProfile = async (adminId) => {
  const admin = await Admin.findById(adminId);
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin.toSafeObject();
};

/** Updates editable profile fields. Email uniqueness is enforced by the schema index. */
const updateProfile = async (adminId, updates) => {
  const allowedFields = ['name', 'email', 'phone', 'profileImage'];
  const payload = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) payload[field] = updates[field];
  });

  if (payload.email) {
    const existing = await Admin.findOne({ email: payload.email, _id: { $ne: adminId } });
    if (existing) {
      throw new ApiError(409, 'Email is already in use by another account');
    }
  }

  const admin = await Admin.findByIdAndUpdate(adminId, payload, {
    new: true,
    runValidators: true,
  });
  if (!admin) throw new ApiError(404, 'Admin not found');

  return admin.toSafeObject();
};

module.exports = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
};
