const rateLimit = require('express-rate-limit');

// Tighter limiter for auth endpoints (login, forgot-password) to slow brute force / spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many attempts, please try again after 15 minutes',
  },
});

// General limiter for the WhatsApp webhook and public-ish endpoints
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
