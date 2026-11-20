const express = require('express');
const router = express.Router();
const {
  getChecklistBySchemeId,
  updateChecklist
} = require('../controllers/documentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route to view checklist
router.get('/:schemeId', getChecklistBySchemeId);

// Admin-only route to update checklist
router.put('/:schemeId', protect, adminOnly, updateChecklist);

module.exports = router;
