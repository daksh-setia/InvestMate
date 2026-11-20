const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, preferredLanguage, role } = req.body;
    const result = await AuthService.registerUser({
      fullName,
      email,
      password,
      preferredLanguage,
      role
    });

    return ApiResponse.created(res, 'User registration successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);

    return ApiResponse.success(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getUserProfile(req.user._id);
    return ApiResponse.success(res, 200, 'User profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await AuthService.updateUserProfile(req.user._id, req.body);
    return ApiResponse.success(res, 200, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / invalidate client session
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logout = async (req, res) => {
  return ApiResponse.success(
    res,
    200,
    'Logged out successfully. Please remove token from local storage.'
  );
};

/**
 * @desc    Create optional guest session token
 * @route   POST /api/auth/guest
 * @access  Public
 */
const guestSession = async (req, res) => {
  return ApiResponse.success(res, 200, 'Guest access enabled. You can browse all schemes freely without an account.', {
    isGuest: true,
    preferredLanguage: req.body.preferredLanguage || 'en'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  guestSession
};
