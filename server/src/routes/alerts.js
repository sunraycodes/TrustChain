const express = require('express');
const router = express.Router();
const { query } = require('../db/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/alerts
 * Returns all silent regulatory trip-wire alerts.
 * Protected: REGULATOR role required.
 */
router.get('/', authenticateToken, requireRole('REGULATOR'), async (req, res) => {
  try {
    const alerts = await query(`SELECT * FROM alerts ORDER BY id DESC`);
    const parsedAlerts = alerts.map(a => ({
      ...a,
      details: typeof a.details === 'string' ? JSON.parse(a.details || '{}') : a.details
    }));
    res.json({ count: parsedAlerts.length, alerts: parsedAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
