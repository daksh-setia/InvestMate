const SchemeService = require('../services/schemeService');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all government welfare schemes with pagination & filters
 * @route   GET /api/schemes
 * @access  Public (Guest accessible)
 */
const getSchemes = async (req, res, next) => {
  try {
    const { schemes, meta } = await SchemeService.getSchemes(req.query);
    return ApiResponse.success(res, 200, 'Schemes retrieved successfully', schemes, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single scheme by ID or slug
 * @route   GET /api/schemes/:id
 * @access  Public (Guest accessible)
 */
const getSchemeById = async (req, res, next) => {
  try {
    const scheme = await SchemeService.getSchemeById(req.params.id);
    return ApiResponse.success(res, 200, 'Scheme details retrieved successfully', scheme);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search and filter schemes by name, keyword, category, eligibility
 * @route   GET /api/schemes/search
 * @access  Public (Guest accessible)
 */
const searchSchemes = async (req, res, next) => {
  try {
    const { schemes, meta } = await SchemeService.searchSchemes(req.query);
    return ApiResponse.success(res, 200, 'Search results retrieved successfully', schemes, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get schemes by category ID or slug
 * @route   GET /api/schemes/category/:categoryId
 * @access  Public (Guest accessible)
 */
const getSchemesByCategory = async (req, res, next) => {
  try {
    const query = {
      ...req.query,
      category: req.params.categoryId
    };
    const { schemes, meta } = await SchemeService.getSchemes(query);
    return ApiResponse.success(res, 200, `Schemes in category retrieved successfully`, schemes, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new scheme
 * @route   POST /api/schemes
 * @access  Private (Admin only)
 */
const createScheme = async (req, res, next) => {
  try {
    const scheme = await SchemeService.createScheme(req.body);
    return ApiResponse.created(res, 'New government scheme created successfully', scheme);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update scheme
 * @route   PUT /api/schemes/:id
 * @access  Private (Admin only)
 */
const updateScheme = async (req, res, next) => {
  try {
    const updated = await SchemeService.updateScheme(req.params.id, req.body);
    return ApiResponse.success(res, 200, 'Scheme updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete scheme
 * @route   DELETE /api/schemes/:id
 * @access  Private (Admin only)
 */
const deleteScheme = async (req, res, next) => {
  try {
    await SchemeService.deleteScheme(req.params.id);
    return ApiResponse.success(res, 200, 'Scheme deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Fine-Print Transparency details for a scheme
 * @route   PUT /api/schemes/:id/fine-print
 * @access  Private (Admin only)
 */
const updateFinePrint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      lockInPeriod,
      exitPenalties,
      hiddenCharges,
      withdrawalConditions,
      expectedReturns,
      inflationAdjustedReturns,
      importantWarnings,
      isVerified,
      verificationSource
    } = req.body;

    const finePrintUpdate = {};
    if (lockInPeriod !== undefined) finePrintUpdate['finePrint.lockInPeriod'] = lockInPeriod;
    if (exitPenalties !== undefined) finePrintUpdate['finePrint.exitPenalties'] = exitPenalties;
    if (hiddenCharges !== undefined) finePrintUpdate['finePrint.hiddenCharges'] = hiddenCharges;
    if (withdrawalConditions !== undefined) finePrintUpdate['finePrint.withdrawalConditions'] = withdrawalConditions;
    if (expectedReturns !== undefined) finePrintUpdate['finePrint.expectedReturns'] = expectedReturns;
    if (inflationAdjustedReturns !== undefined) finePrintUpdate['finePrint.inflationAdjustedReturns'] = inflationAdjustedReturns;
    if (importantWarnings !== undefined) finePrintUpdate['finePrint.importantWarnings'] = importantWarnings;
    if (isVerified !== undefined) finePrintUpdate['finePrint.isVerified'] = isVerified;
    if (verificationSource !== undefined) finePrintUpdate['finePrint.verificationSource'] = verificationSource;

    finePrintUpdate.lastVerifiedDate = Date.now();

    const scheme = await SchemeService.updateScheme(id, finePrintUpdate);
    return ApiResponse.success(res, 200, 'Fine-print transparency details updated successfully', scheme);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update scheme verification status
 * @route   PATCH /api/schemes/:id/verify
 * @access  Private (Admin only)
 */
const verifyScheme = async (req, res, next) => {
  try {
    const { isVerified, verificationSource, status } = req.body;
    const scheme = await SchemeService.updateVerificationStatus(req.params.id, {
      isVerified,
      verificationSource,
      status
    });
    return ApiResponse.success(res, 200, 'Scheme verification status updated successfully', scheme);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  searchSchemes,
  getSchemesByCategory,
  createScheme,
  updateScheme,
  deleteScheme,
  updateFinePrint,
  verifyScheme
};
