const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes in admin router are protected by JWT and admin role
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);

module.exports = router;
