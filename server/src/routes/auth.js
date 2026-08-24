const express = require('express');
const router = express.Router();
const { query, get } = require('../db/db');
const { generateToken, authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Authenticates an actor and returns a JWT token.
 */
router.post('/login', async (req, res) => {
  try {
    const { actor_id, password } = req.body;

    if (!actor_id || !password) {
      return res.status(400).json({ error: 'Missing actor_id and/or password.' });
    }

    const actor = await get(`SELECT * FROM actors WHERE id = ?`, [actor_id]);
    if (!actor) {
      return res.status(401).json({ error: 'Invalid credentials. Actor not found.' });
    }

    // Demo environment: accept any non-empty password for seeded actors
    // In production this would compare bcrypt hashes
    if (actor.password_hash === 'demo' || actor.password_hash === 'demo_password_hash') {
      // Demo actors — accept password "password123" or any password in dev mode
      if (password !== 'password123' && process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
    } else {
      // In a real app: compare bcrypt hash
      // For now, direct comparison for non-demo actors
      if (actor.password_hash !== password) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
    }

    const token = generateToken(actor);

    res.json({
      success: true,
      token,
      actor: {
        id: actor.id,
        name: actor.name,
        role: actor.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated actor's profile.
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const actor = await get(`SELECT * FROM actors WHERE id = ?`, [req.user.actor_id]);
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found.' });
    }

    res.json({
      id: actor.id,
      name: actor.name,
      role: actor.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
