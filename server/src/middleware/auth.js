const jwt = require('jsonwebtoken');
const config = require('../config');

function generateToken(actor) {
  return jwt.sign(
    { actor_id: actor.id, name: actor.name, role: actor.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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
