const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getSchemeById,
  searchSchemes,
  getSchemesByCategory,
  createScheme,
  updateScheme,
  deleteScheme,
  updateFinePrint,
  verifyScheme
} = require('../controllers/schemeController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const { validate, schemeValidationRules } = require('../middleware/validateMiddleware');

// Public endpoints (Guest accessible)
router.get('/', optionalAuth, getSchemes);
router.get('/search', optionalAuth, searchSchemes);
router.get('/category/:categoryId', optionalAuth, getSchemesByCategory);
router.get('/:id', optionalAuth, getSchemeById);

// Admin-only endpoints
router.post('/', protect, adminOnly, schemeValidationRules, validate, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);
router.put('/:id/fine-print', protect, adminOnly, updateFinePrint);
router.patch('/:id/verify', protect, adminOnly, verifyScheme);

module.exports = router;
