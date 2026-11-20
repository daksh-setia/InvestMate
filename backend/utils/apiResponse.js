/**
 * Standardized API Response Utilities
 * Ensures consistent JSON responses across all endpoints.
 */

class ApiResponse {
  /**
   * Success Response
   * @param {Object} res Express response object
   * @param {Number} statusCode HTTP status code (default 200)
   * @param {String} message Human-readable message
   * @param {Any} data Payload
   * @param {Object} meta Optional metadata (pagination, counts, filters)
   */
  static success(res, statusCode = 200, message = 'Success', data = null, meta = undefined) {
    const responsePayload = {
      success: true,
      statusCode,
      message,
      data
    };

    if (meta !== undefined) {
      responsePayload.meta = meta;
    }

    return res.status(statusCode).json(responsePayload);
  }

  /**
   * Created Response (201)
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return this.success(res, 201, message, data);
  }

  /**
   * Error Response
   * @param {Object} res Express response object
   * @param {Number} statusCode HTTP status code (default 400)
   * @param {String} message Error message
   * @param {Array|Object} errors Detailed errors
   */
  static error(res, statusCode = 400, message = 'An error occurred', errors = null) {
    const responsePayload = {
      success: false,
      statusCode,
      message,
      errors: errors || undefined
    };

    return res.status(statusCode).json(responsePayload);
  }
}

module.exports = ApiResponse;
