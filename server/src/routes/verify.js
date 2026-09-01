const express = require('express');
const router = express.Router();
const { runMasterVerification } = require('../verificationPipeline');

router.post('/verify', async (req, res) => {
  try {
    const {
      product_id,
      actor_id = 'CONSUMER_APP',
      latitude = 28.6139,
      longitude = 77.2090,
      scanned_phash,
      temp_celsius,
      humidity_pct,
      counter_signatures = []
    } = req.body;

    const result = await runMasterVerification({
      product_id,
      actor_id,
      latitude,
      longitude,
      scanned_phash,
      temp_celsius,
      humidity_pct,
      counter_signatures
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
