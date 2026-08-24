const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, query, get } = require('./db/db');
const { createGenesisBlock, appendBlock, getChain, verifyChainIntegrity } = require('./ledger/chainEngine');
const { runMasterVerification, triggerRegulatoryTripwire } = require('./verificationPipeline');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database
initDatabase();

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'TrustChain Ledger Server', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// Seed Default Demo Accounts
// ----------------------------------------------------
app.post('/api/db/seed', async (req, res) => {
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

// ----------------------------------------------------
// Product Registration (Manufacturer Genesis Block)
// ----------------------------------------------------
app.post('/api/products/register', async (req, res) => {
  try {
    const {
      id,
      batch_id,
      name,
      manufacturer_id = 'MANUFACTURER_ALPHA',
      initial_phash = 'a8f9c13b21e45678',
      min_temp = 2.0,
      max_temp = 8.0,
      latitude = 28.6139,
      longitude = 77.2090,
      location_name = 'PharmaCorp Central Manufacturing Facility, New Delhi'
    } = req.body;

    if (!id || !name || !batch_id) {
      return res.status(400).json({ error: 'Missing required fields: id, batch_id, name' });
    }

    // Insert Product record
    const existing = await get(`SELECT id FROM products WHERE id = ?`, [id]);
    if (existing) {
      return res.status(400).json({ error: `Product with ID ${id} already exists.` });
    }

    await query(
      `INSERT INTO products (id, batch_id, name, manufacturer_id, initial_phash, min_temp, max_temp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'GENUINE')`,
      [id, batch_id, name, manufacturer_id, initial_phash, min_temp, max_temp]
    );

    // Create Genesis Block
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

// ----------------------------------------------------
// Custody Handoff / Transfer
// ----------------------------------------------------
app.post('/api/products/transfer', async (req, res) => {
  try {
    const {
      product_id,
      event_type = 'CUSTODY_TRANSFER',
      actor_id = 'DISTRIBUTOR_BETA',
      latitude,
      longitude,
      location_name = 'Logistics Hub',
      temp_celsius = 4.5,
      humidity_pct = 50.0,
      fingerprint_hash,
      counter_signatures = []
    } = req.body;

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

// ----------------------------------------------------
// Verification Endpoint (4-Layer Scan Check)
// ----------------------------------------------------
app.post('/api/products/verify', async (req, res) => {
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

// ----------------------------------------------------
// Retrieve Full Block Chain History
// ----------------------------------------------------
app.get('/api/products/:id/chain', async (req, res) => {
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

// ----------------------------------------------------
// Regulator Alerts Endpoint
// ----------------------------------------------------
app.get('/api/alerts', async (req, res) => {
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

// ----------------------------------------------------
// Live Pitch Scenario: Simulate Counterfeit Scan
// ----------------------------------------------------
app.post('/api/demo/simulate-counterfeit', async (req, res) => {
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

// Start Server
app.listen(PORT, async () => {
  // Seed demo actors on startup
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
        await query(`INSERT INTO actors (id, name, role, password_hash) VALUES (?, ?, ?, ?)`, [actor.id, actor.name, actor.role, 'demo']);
      }
    }
  } catch (e) {
    console.warn('Seed on start note:', e.message);
  }

  console.log(`🚀 TrustChain Ledger Server listening on http://localhost:${PORT}`);
});
