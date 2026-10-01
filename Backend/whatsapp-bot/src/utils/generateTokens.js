const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

/**
 * Generate a short-lived JWT access token for an admin.
 * @param {{ _id: string, email: string }} admin
 */
const generateAccessToken = (admin) =>
  jwt.sign({ sub: admin._id.toString(), email: admin.email, type: 'access' }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });

/**
 * Generate a long-lived JWT refresh token for an admin.
 * @param {{ _id: string }} admin
 */
const generateRefreshToken = (admin) =>
  jwt.sign({ sub: admin._id.toString(), type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

const verifyAccessToken = (token) => jwt.verify(token, JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
