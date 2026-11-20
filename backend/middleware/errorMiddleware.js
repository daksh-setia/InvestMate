const ApiResponse = require('../utils/apiResponse');

/**
 * Handle 404 Not Found for non-existing routes
 */
const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(
    res,
    404,
    `Endpoint not found: [${req.method}] ${req.originalUrl}`
  );
};

/**
 * Centralized Application Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log error for server diagnostics
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Handler]: ${err.name} - ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found with identifier: ${err.value}`;
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate entry: '${value}' for ${field} already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for one or more fields';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token signature';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // JSON parse error (e.g. invalid request body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  return ApiResponse.error(
    res,
    statusCode,
    message,
    errors || (process.env.NODE_ENV === 'development' ? err.stack : undefined)
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
