const express = require('express');
const router = express.Router();
const { get } = require('../db/db');
const { appendBlock } = require('../ledger/chainEngine');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * POST /api/products/transfer
 * Records a custody handoff / transfer block on the hash-chain.
 * Protected: DISTRIBUTOR or PHARMACY role required.
 */
router.post('/transfer', authenticateToken, requireRole('DISTRIBUTOR', 'PHARMACY'), async (req, res) => {
  try {
    const {
      product_id,
      event_type = 'CUSTODY_TRANSFER',
      latitude,
      longitude,
      location_name = 'Logistics Hub',
      temp_celsius = 4.5,
      humidity_pct = 50.0,
      fingerprint_hash,
      counter_signatures = []
    } = req.body;

    const actor_id = req.user.actor_id;

    const product = await get(`SELECT * FROM products WHERE id = ?`, [product_id]);
    if (!product) {
      return res.status(404).json({ error: `Product ID ${product_id} not found.` });
    }

    const block = await appendBlock({
      product_id,
      event_type,
      actor_id,
      latitude,
      longitude,
      location_name,
      temp_celsius,
      humidity_pct,
      fingerprint_hash: fingerprint_hash || product.initial_phash,
      counter_signatures
    });

    res.json({
      success: true,
      message: 'Custody transfer recorded on hash-chain',
      block
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
