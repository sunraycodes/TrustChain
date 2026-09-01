const express = require('express');
const router = express.Router();
const { query, get } = require('../db/db');
const { createGenesisBlock, getChain, verifyChainIntegrity } = require('../ledger/chainEngine');
const { computePerceptualHash, hexTo64BitBinary, evaluatePackagingDna } = require('../engines/packagingDna');
const { authenticateToken, requireRole } = require('../middleware/auth');


router.post('/register', authenticateToken, requireRole('MANUFACTURER'), async (req, res) => {
  try {
    const {
      id,
      batch_id,
      name,
      initial_phash = 'a8f9c13b21e45678',
      min_temp = 2.0,
      max_temp = 8.0,
      latitude = 28.6139,
      longitude = 77.2090,
      location_name = 'PharmaCorp Central Manufacturing Facility, New Delhi'
    } = req.body;

    const manufacturer_id = req.user.actor_id;

    if (!id || !name || !batch_id) {
      return res.status(400).json({ error: 'Missing required fields: id, batch_id, name' });
    }

    const existing = await get(`SELECT id FROM products WHERE id = ?`, [id]);
    if (existing) {
      return res.status(400).json({ error: `Product with ID ${id} already exists.` });
    }

    await query(
      `INSERT INTO products (id, batch_id, name, manufacturer_id, initial_phash, min_temp, max_temp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'GENUINE')`,
      [id, batch_id, name, manufacturer_id, initial_phash, min_temp, max_temp]
    );

    const genesisBlock = await createGenesisBlock({
      product_id: id,
      actor_id: manufacturer_id,
      latitude,
      longitude,
      location_name,
      temp_celsius: 4.0,
      humidity_pct: 48.0,
      fingerprint_hash: initial_phash
    });

    res.status(201).json({
      success: true,
      message: 'Product registered and Genesis Block appended to TrustChain',
      product: { id, batch_id, name, manufacturer_id, initial_phash },
      genesis_block: genesisBlock
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/chain', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await get(`SELECT * FROM products WHERE id = ?`, [productId]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const chain = await getChain(productId);
    const integrity = await verifyChainIntegrity(productId);

    res.json({
      product,
      integrity,
      block_count: chain.length,
      chain
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/compute-phash', async (req, res) => {
  try {
    const { image_data, baseline_phash } = req.body;
    if (!image_data) {
      return res.status(400).json({ error: 'Missing image_data payload.' });
    }

    const phash = computePerceptualHash(image_data);
    const bits = hexTo64BitBinary(phash);

    let evaluation = null;
    if (baseline_phash) {
      evaluation = evaluatePackagingDna(baseline_phash, phash);
    }

    res.json({
      success: true,
      phash,
      bits,
      evaluation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


