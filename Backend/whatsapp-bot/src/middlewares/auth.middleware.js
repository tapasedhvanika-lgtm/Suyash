const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/generateTokens');
const Admin = require('../models/Admin');

/**
 * Verifies the access token and attaches the authenticated admin to req.admin.
 * Expects: Authorization: Bearer <token>
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Access token is missing');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token');
  }

  if (decoded.type !== 'access') {
    throw new ApiError(401, 'Invalid token type');
  }

  const admin = await Admin.findById(decoded.sub);
  if (!admin) {
    throw new ApiError(401, 'Admin belonging to this token no longer exists');
  }
  if (admin.status !== 'Active') {
    throw new ApiError(403, 'Admin account is inactive');
  }

  req.admin = admin;
  next();
});

module.exports = { authenticate };
