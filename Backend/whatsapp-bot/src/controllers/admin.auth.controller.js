const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const adminService = require('../services/admin.service');
const COOKIE_SECURE = process.env.COOKIE_SECURE;

const refreshCookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/admin/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { admin, accessToken, refreshToken } = await adminService.login({ email, password });

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  res
    .status(200)
    .json(new ApiResponse(200, { admin, accessToken, refreshToken }, 'Login successful'));
});

// POST /api/admin/logout
const logout = asyncHandler(async (req, res) => {
  await adminService.logout(req.admin._id);
  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

// POST /api/admin/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.body.refreshToken || req.cookies?.refreshToken;
  const tokens = await adminService.refreshToken(incomingToken);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
  res.status(200).json(new ApiResponse(200, tokens, 'Token refreshed successfully'));
});

// POST /api/admin/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await adminService.forgotPassword(email);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'If that email exists, a password reset link has been sent'));
});

// POST /api/admin/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await adminService.resetPassword(token, password);
  res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully'));
});

// POST /api/admin/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await adminService.changePassword(req.admin._id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
};
