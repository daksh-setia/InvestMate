const mongoose = require('mongoose');
const memoryStore = require('../utils/memoryStore');

let isUsingMemoryStore = false;

/**
 * Connect to MongoDB with automatic offline memory fallback
 */
const connectDB = async () => {
  // In test mode without explicit remote URI, immediately use memory store for speed and isolation
  if (process.env.NODE_ENV === 'test' && !process.env.FORCE_REAL_DB) {
    await memoryStore.initialize();
    isUsingMemoryStore = true;
    return null;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/investmate';

  const options = {
    serverSelectionTimeoutMS: 2000,
    socketTimeoutMS: 45000,
    family: 4
  };

  try {
    const conn = await mongoose.connect(mongoURI, options);
    isUsingMemoryStore = false;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Real MongoDB connection failed (${error.message}).`);
    console.log(`[Database Fallback] Activating High-Performance In-Memory Data Store with verified government schemes.`);
    await memoryStore.initialize();
    isUsingMemoryStore = true;
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB connection reconnected.');
  isUsingMemoryStore = false;
});

const isOfflineMode = () => isUsingMemoryStore || mongoose.connection.readyState !== 1;

module.exports = connectDB;
module.exports.isOfflineMode = isOfflineMode;
