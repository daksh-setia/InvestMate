const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const memoryStore = require('../utils/memoryStore');
const { isOfflineMode } = require('../config/db');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(userData) {
    const { fullName, email, password, preferredLanguage, role } = userData;
    const lowerEmail = email.toLowerCase().trim();

    if (isOfflineMode()) {
      const existing = memoryStore.users.find((u) => u.email === lowerEmail);
      if (existing) {
        const error = new Error('An account with this email already exists.');
        error.statusCode = 400;
        throw error;
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        fullName,
        email: lowerEmail,
        password: hashedPassword,
        preferredLanguage: preferredLanguage || 'en',
        role: role === 'admin' ? 'admin' : 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        async matchPassword(entered) {
          return bcrypt.compare(entered, this.password);
        }
      };
      memoryStore.users.push(newUser);

      const token = generateToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      });

      return {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          preferredLanguage: newUser.preferredLanguage,
          role: newUser.role
        },
        token
      };
    }

    // Standard MongoDB path
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 400;
      throw error;
    }

    const userRole = role === 'admin' ? 'admin' : 'user';
    const user = await User.create({
      fullName,
      email: lowerEmail,
      password,
      preferredLanguage: preferredLanguage || 'en',
      role: userRole
    });

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        role: user.role
      },
      token
    };
  }

  /**
   * Authenticate user with email and password
   */
  static async loginUser(email, password) {
    const lowerEmail = email.toLowerCase().trim();

    if (isOfflineMode()) {
      const user = memoryStore.users.find((u) => u.email === lowerEmail);
      if (!user) {
        const error = new Error('Invalid email or password credentials.');
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Invalid email or password credentials.');
        error.statusCode = 401;
        throw error;
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role
      });

      return {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          role: user.role
        },
        token
      };
    }

    // Standard MongoDB path
    const user = await User.findOne({ email: lowerEmail }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        role: user.role
      },
      token
    };
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId) {
    if (isOfflineMode()) {
      const user = memoryStore.users.find((u) => u._id.toString() === userId.toString());
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData) {
    const allowedFields = ['fullName', 'preferredLanguage'];

    if (isOfflineMode()) {
      const user = memoryStore.users.find((u) => u._id.toString() === userId.toString());
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });
      user.updatedAt = new Date();
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }

    const filteredUpdate = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}

module.exports = AuthService;
