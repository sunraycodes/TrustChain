const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generates a JWT token for an authenticated actor.
 * @param {Object} actor - { id, name, role }
 * @returns {string} Signed JWT token
 */
function generateToken(actor) {
  return jwt.sign(
    { actor_id: actor.id, name: actor.name, role: actor.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

/**
 * Express middleware: verifies JWT from Authorization header.
 * Attaches decoded user to req.user on success.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Express middleware factory: restricts access to specific roles.
 * Usage: requireRole('MANUFACTURER', 'REGULATOR')
 * @param  {...string} allowedRoles - Roles permitted to access the route
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
}

module.exports = {
  generateToken,
  authenticateToken,
  requireRole
};
