const { body, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware to check express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return ApiResponse.error(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidationRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('preferredLanguage')
    .optional()
    .trim()
    .isIn(['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'pa', 'ur', 'ml', 'or'])
    .withMessage('Invalid language selection'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

/**
 * Validation rules for user login
 */
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for Scheme creation / update
 */
const schemeValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Scheme name is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 400 })
    .withMessage('Short description must not exceed 400 characters'),
  body('detailedExplanation')
    .trim()
    .notEmpty()
    .withMessage('Detailed explanation is required'),
  body('officialPortalUrl')
    .trim()
    .notEmpty()
    .withMessage('Official portal URL is required')
    .isURL()
    .withMessage('Please provide a valid official URL'),
  body('benefits')
    .isArray({ min: 1 })
    .withMessage('At least one benefit is required'),
  body('requiredDocuments')
    .isArray({ min: 1 })
    .withMessage('At least one required document must be listed')
];

/**
 * Validation rules for Category
 */
const categoryValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Category description is required')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  schemeValidationRules,
  categoryValidationRules
};
