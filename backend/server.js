require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
const initPromise = connectDB();
app.initPromise = initPromise;

// -----------------------------------------------------------------------------
// Security & Performance Middlewares
// -----------------------------------------------------------------------------

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Enable gzip/deflate compression for low-bandwidth networks (2G/3G optimization)
app.use(compression());

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request body parsers (restricted to 1MB to prevent payload flood)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Development request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    success: true,
    platform: 'INVESTMATE Financial Awareness Backend',
    version: '1.0.0',
    status: 'healthy',
    uptime: process.uptime(),
    database: statusMap[dbStatus] || 'in-memory-fallback',
    timestamp: new Date().toISOString()
  });
});

// Mount application routers
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend static files if hosted together
const frontendDistDir = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistDir));

// Fallback route for frontend root / SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistDir, 'index.html'), (err) => {
    if (err) {
      res.json({
        platform: 'INVESTMATE Backend API',
        documentation: '/api/health',
        message: 'Welcome to INVESTMATE - Financial Awareness Platform API'
      });
    }
  });
});

// Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server Lifecycle Management
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🌾 INVESTMATE Backend Server Running on Port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Schemes API: http://localhost:${PORT}/api/schemes`);
    console.log('====================================================');
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception]: ${err.message}`);
});

const shutdown = () => {
  console.log('[Server] Gracefully shutting down...');
  if (server) {
    server.close(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('[Database] MongoDB connection closed.');
      }
      process.exit(0);
    });
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
