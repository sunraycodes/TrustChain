const express = require('express');
const router = express.Router();
const { query, get } = require('../db/db');
const { runMasterVerification } = require('../verificationPipeline');

/**
 * POST /api/db/seed
 * Seeds demo actor accounts into the database.
 */
router.post('/db/seed', async (req, res) => {
  try {
    const demoActors = [
      { id: 'MANUFACTURER_ALPHA', name: 'AstraBiotech Pharma', role: 'MANUFACTURER' },
      { id: 'DISTRIBUTOR_BETA', name: 'Global ColdChain Logistics', role: 'DISTRIBUTOR' },
      { id: 'PHARMACY_GAMMA', name: 'Apex Central Pharmacy', role: 'PHARMACY' },
      { id: 'REGULATOR_FDA', name: 'National Drug Safety Authority', role: 'REGULATOR' },
      { id: 'CONSUMER_APP', name: 'Consumer Scan PWA', role: 'CONSUMER' }
    ];

    for (const actor of demoActors) {
      const existing = await get(`SELECT id FROM actors WHERE id = ?`, [actor.id]);
      if (!existing) {
        await query(
          `INSERT INTO actors (id, name, role, password_hash) VALUES (?, ?, ?, ?)`,
          [actor.id, actor.name, actor.role, 'demo_password_hash']
        );
      }
    }

    res.json({ success: true, message: 'Demo actors seeded successfully', actors: demoActors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/demo/simulate-counterfeit
 * Triggers a counterfeit scan simulation for live pitch demonstrations.
 */
router.post('/demo/simulate-counterfeit', async (req, res) => {
  try {
    const { product_id = 'MED-789204-X' } = req.body;

    // Run verification with cloned QR parameters (Mismatched packaging DNA + Impossible travel coordinates)
    const counterfeitScan = await runMasterVerification({
      product_id,
      actor_id: 'COUNTERFEITER_SCANNER',
      latitude: 51.5074, // London (5000+ km away instantly)
      longitude: -0.1278,
      scanned_phash: 'ffffffffffffffff', // Complete packaging DNA mismatch
      record_scan_block: false
    });

    res.json({
      demo_scenario: 'SIMULATED COUNTERFEIT SCAN',
      message: 'Cloned QR code scan simulated with mismatched packaging DNA & impossible travel geo-velocity!',
      result: counterfeitScan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
