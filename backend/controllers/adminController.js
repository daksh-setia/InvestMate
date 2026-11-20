const Scheme = require('../models/Scheme');
const Category = require('../models/Category');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const memoryStore = require('../utils/memoryStore');
const { isOfflineMode } = require('../config/db');

/**
 * @desc    Get Admin Dashboard metrics and statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    if (isOfflineMode()) {
      const totalSchemes = memoryStore.schemes.length;
      const activeSchemes = memoryStore.schemes.filter((s) => s.status === 'Active').length;
      const discontinuedSchemes = memoryStore.schemes.filter((s) => s.status === 'Discontinued').length;
      const totalCategories = memoryStore.categories.length;
      const totalUsers = memoryStore.users.filter((u) => u.role === 'user').length;

      const recentVerifications = [...memoryStore.schemes]
        .sort((a, b) => new Date(b.lastVerifiedDate) - new Date(a.lastVerifiedDate))
        .slice(0, 5)
        .map((s) => ({
          _id: s._id,
          name: s.name,
          status: s.status,
          lastVerifiedDate: s.lastVerifiedDate,
          finePrint: {
            isVerified: s.finePrint?.isVerified,
            verificationSource: s.finePrint?.verificationSource
          }
        }));

      const mostViewedSchemes = [...memoryStore.schemes]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((s) => ({
          _id: s._id,
          name: s.name,
          categoryName: s.categoryName,
          views: s.views || 0,
          status: s.status
        }));

      const catCounts = {};
      memoryStore.schemes.forEach((s) => {
        catCounts[s.categoryName] = (catCounts[s.categoryName] || 0) + 1;
      });
      const categoryDistribution = Object.keys(catCounts).map((catName) => ({
        _id: catName,
        count: catCounts[catName]
      }));

      const stats = {
        overview: {
          totalSchemes,
          activeSchemes,
          discontinuedSchemes,
          totalCategories,
          totalUsers
        },
        recentVerifications,
        mostViewedSchemes,
        categoryDistribution
      };

      return ApiResponse.success(res, 200, 'Admin dashboard statistics retrieved successfully', stats);
    }

    // Standard MongoDB path
    const [
      totalSchemes,
      activeSchemes,
      discontinuedSchemes,
      totalCategories,
      totalUsers,
      recentVerifications,
      mostViewedSchemes,
      categoryDistribution
    ] = await Promise.all([
      Scheme.countDocuments(),
      Scheme.countDocuments({ status: 'Active' }),
      Scheme.countDocuments({ status: 'Discontinued' }),
      Category.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Scheme.find()
        .sort({ lastVerifiedDate: -1 })
        .limit(5)
        .select('name status lastVerifiedDate finePrint.isVerified finePrint.verificationSource')
        .lean(),
      Scheme.find({ status: 'Active' })
        .sort({ views: -1 })
        .limit(5)
        .select('name categoryName views status')
        .lean(),
      Scheme.aggregate([
        { $group: { _id: '$categoryName', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      overview: {
        totalSchemes,
        activeSchemes,
        discontinuedSchemes,
        totalCategories,
        totalUsers
      },
      recentVerifications,
      mostViewedSchemes,
      categoryDistribution
    };

    return ApiResponse.success(res, 200, 'Admin dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
