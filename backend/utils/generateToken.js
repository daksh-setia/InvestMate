const jwt = require('jsonwebtoken');

/**
 * Generate JSON Web Token
 * @param {Object} payload User payload (id, role, email)
 * @returns {String} Signed JWT token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'investmate_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn
  });
};

/**
 * Verify JSON Web Token
 * @param {String} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'investmate_super_secret_jwt_key_2026';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
