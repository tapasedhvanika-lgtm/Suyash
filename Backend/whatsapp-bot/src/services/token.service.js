const crypto = require('crypto');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateTokens');
const Admin = require('../models/Admin');
const ApiError = require('../utils/apiError');

/**
 * Issues a fresh access + refresh token pair for an admin and persists
 * the refresh token on the admin document (simple single-session strategy).
 */
const issueTokenPair = async (admin) => {
  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * Validates a refresh token against the DB-stored one and rotates it,
 * returning a brand new access + refresh token pair.
 */
const rotateRefreshToken = async (incomingToken) => {
  if (!incomingToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const admin = await Admin.findById(decoded.sub).select('+refreshToken');
  if (!admin || admin.refreshToken !== incomingToken) {
    throw new ApiError(401, 'Refresh token is not recognized (possibly revoked)');
  }

  return issueTokenPair(admin);
};

/** Generates a random raw token + its sha256 hash, used for password reset links. */
const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');

module.exports = {
  issueTokenPair,
  rotateRefreshToken,
  generateResetToken,
  hashToken,
};
