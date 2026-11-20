const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const memoryStore = require('../utils/memoryStore');
const { isOfflineMode } = require('../config/db');

/**
 * Protect routes - Verifies JWT from Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(
      res,
      401,
      'Access denied. No authentication token provided. Please log in.'
    );
  }

  try {
    const decoded = verifyToken(token);

    let user;
    if (isOfflineMode()) {
      user = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return ApiResponse.error(
        res,
        401,
        'User account associated with this token no longer exists.'
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error]: ${error.message}`);
    return ApiResponse.error(
      res,
      401,
      'Invalid or expired session token. Please log in again.'
    );
  }
};

/**
 * Admin role authorization
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return ApiResponse.error(
    res,
    403,
    'Forbidden: Admin privileges required to access this resource.'
  );
};

/**
 * Optional authentication - sets req.user if token is present, but allows guests
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      let user;
      if (isOfflineMode()) {
        user = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
      } else {
        user = await User.findById(decoded.id).select('-password');
      }
      if (user) {
        req.user = user;
      }
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  optionalAuth
};
