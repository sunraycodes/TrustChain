const express = require('express');
const { query, get } = require('../db/db');

const router = express.Router();

// Get the current user's bounty score
router.get('/me', async (req, res) => {
  // In a real app, this would use the actor_id from the verified JWT token.
  // For the hackathon demo, we'll pass actor_id as a query param.
  const { actor_id } = req.query;

  if (!actor_id) {
    return res.status(400).json({ error: 'actor_id query param is required' });
  }

  try {
    const actor = await get(`SELECT id, name, role, bounty_score FROM actors WHERE id = ?`, [actor_id]);
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    res.json({ score: actor.bounty_score || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get the community leaderboard (top 10 earners)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaders = await query(
      `SELECT id, name, role, bounty_score FROM actors WHERE bounty_score > 0 ORDER BY bounty_score DESC LIMIT 10`
    );
    res.json({ leaderboard: leaders });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
