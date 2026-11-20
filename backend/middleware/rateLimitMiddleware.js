const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

/**
 * Rate limiter for sensitive authentication endpoints (login, register)
 * 20 attempts per 15 minutes window per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      429,
      'Too many authentication attempts from this network. Please try again after 15 minutes.'
    );
  }
});

/**
 * General API rate limiter for standard routes
 * 300 requests per 15 minutes window per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      429,
      'High request volume detected. Please slow down your requests.'
    );
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};
