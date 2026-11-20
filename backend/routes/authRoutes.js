const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  guestSession
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const {
  validate,
  registerValidationRules,
  loginValidationRules
} = require('../middleware/validateMiddleware');

// Public authentication routes with brute-force rate limiting
router.post('/register', authLimiter, registerValidationRules, validate, register);
router.post('/login', authLimiter, loginValidationRules, validate, login);
router.post('/logout', logout);
router.post('/guest', guestSession);

// Protected user routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
