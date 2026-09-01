const express = require('express');
const router = express.Router();
const { query, get } = require('../db/db');
const { generateToken, authenticateToken } = require('../middleware/auth');

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

    if (actor.password_hash === 'demo' || actor.password_hash === 'demo_password_hash') {
      if (password !== 'password123' && process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
    } else {
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
