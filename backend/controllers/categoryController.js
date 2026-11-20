const Category = require('../models/Category');
const Scheme = require('../models/Scheme');
const ApiResponse = require('../utils/apiResponse');
const memoryStore = require('../utils/memoryStore');
const { isOfflineMode } = require('../config/db');

/**
 * @desc    Get all active categories with scheme count
 * @route   GET /api/categories
 * @access  Public (Guest accessible)
 */
const getCategories = async (req, res, next) => {
  try {
    if (isOfflineMode()) {
      const activeCats = memoryStore.categories.filter((c) => c.isActive !== false);
      const enriched = activeCats.map((cat) => {
        const count = memoryStore.schemes.filter(
          (s) => s.category?.toString() === cat._id.toString() && s.status === 'Active'
        ).length;
        return {
          ...cat,
          schemesCount: count
        };
      });
      return ApiResponse.success(res, 200, 'Categories retrieved successfully', enriched);
    }

    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const categoryCounts = await Scheme.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    categoryCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      schemesCount: countMap[cat._id.toString()] || 0
    }));

    return ApiResponse.success(res, 200, 'Categories retrieved successfully', enrichedCategories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public (Guest accessible)
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isOfflineMode()) {
      const cat = memoryStore.categories.find(
        (c) => c._id.toString() === id || c.slug === id.toLowerCase()
      );
      if (!cat) {
        return ApiResponse.error(res, 404, 'Category not found');
      }
      const schemesCount = memoryStore.schemes.filter(
        (s) => s.category?.toString() === cat._id.toString() && s.status === 'Active'
      ).length;
      return ApiResponse.success(res, 200, 'Category details retrieved successfully', {
        ...cat,
        schemesCount
      });
    }

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id).lean();
    } else {
      category = await Category.findOne({ slug: id.toLowerCase() }).lean();
    }

    if (!category) {
      return ApiResponse.error(res, 404, 'Category not found');
    }

    const schemesCount = await Scheme.countDocuments({
      category: category._id,
      status: 'Active'
    });

    return ApiResponse.success(res, 200, 'Category details retrieved successfully', {
      ...category,
      schemesCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, targetAudience, displayOrder } = req.body;

    if (isOfflineMode()) {
      const existing = memoryStore.categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return ApiResponse.error(res, 400, `Category '${name}' already exists.`);
      }
      const newCat = {
        _id: `cat_${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
        description,
        icon: icon || 'folder',
        targetAudience: targetAudience || ['Rural Families', 'Elderly Citizens', 'Farmers'],
        displayOrder: displayOrder || 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.categories.push(newCat);
      return ApiResponse.created(res, 'Category created successfully', newCat);
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return ApiResponse.error(res, 400, `Category '${name}' already exists.`);
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || 'folder',
      targetAudience: targetAudience || ['Rural Families', 'Elderly Citizens', 'Farmers'],
      displayOrder: displayOrder || 0
    });

    return ApiResponse.created(res, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
const updateCategory = async (req, res, next) => {
  try {
    if (isOfflineMode()) {
      const cat = memoryStore.categories.find((c) => c._id.toString() === req.params.id);
      if (!cat) {
        return ApiResponse.error(res, 404, 'Category not found');
      }
      Object.assign(cat, req.body, { updatedAt: new Date() });
      return ApiResponse.success(res, 200, 'Category updated successfully', cat);
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return ApiResponse.error(res, 404, 'Category not found');
    }

    if (req.body.name) {
      await Scheme.updateMany(
        { category: category._id },
        { $set: { categoryName: category.name } }
      );
    }

    return ApiResponse.success(res, 200, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
const deleteCategory = async (req, res, next) => {
  try {
    if (isOfflineMode()) {
      const idx = memoryStore.categories.findIndex((c) => c._id.toString() === req.params.id);
      if (idx === -1) {
        return ApiResponse.error(res, 404, 'Category not found');
      }
      memoryStore.categories.splice(idx, 1);
      return ApiResponse.success(res, 200, 'Category deleted successfully');
    }

    const schemeCount = await Scheme.countDocuments({ category: req.params.id });
    if (schemeCount > 0) {
      return ApiResponse.error(
        res,
        400,
        `Cannot delete category. There are ${schemeCount} active scheme(s) linked to it.`
      );
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return ApiResponse.error(res, 404, 'Category not found');
    }

    return ApiResponse.success(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
