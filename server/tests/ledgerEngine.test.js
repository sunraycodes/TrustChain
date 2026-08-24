const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Set SQLite to in-memory database for testing
process.env.SQLITE_DB_PATH = ':memory:';

const { initDatabase, query } = require('../src/db/db');
const {
  createGenesisBlock,
  appendBlock,
  verifyChainIntegrity,
  getChain
} = require('../src/ledger/chainEngine');

test('TrustChain Ledger Engine Integrity Suite', async (t) => {
  // Initialize Database
  await initDatabase();

  // Create test actors & product
  await query(
    `INSERT INTO actors (id, name, role, password_hash) VALUES (?, ?, ?, ?)`,
    ['MANUFACTURER_1', 'PharmaCorp Inc', 'MANUFACTURER', 'hashed_pass']
  );
  await query(
    `INSERT INTO actors (id, name, role, password_hash) VALUES (?, ?, ?, ?)`,
    ['DISTRIBUTOR_1', 'Global Logistics', 'DISTRIBUTOR', 'hashed_pass']
  );
  await query(
    `INSERT INTO actors (id, name, role, password_hash) VALUES (?, ?, ?, ?)`,
    ['PHARMACY_1', 'City Health Pharmacy', 'PHARMACY', 'hashed_pass']
  );

  const productId = 'MED-99201-X';
  await query(
    `INSERT INTO products (id, batch_id, name, manufacturer_id, initial_phash) VALUES (?, ?, ?, ?, ?)`,
    [productId, 'BATCH-2026-08', 'LifeSave Anti-Vira 500mg', 'MANUFACTURER_1', 'e3b0c44298fc1c14']
  );

  await t.test('1. Genesis block creation and chain validation', async () => {
    const genesis = await createGenesisBlock({
      product_id: productId,
      actor_id: 'MANUFACTURER_1',
      latitude: 28.6139,
      longitude: 77.2090,
      location_name: 'Factory New Delhi',
      fingerprint_hash: 'e3b0c44298fc1c14'
    });

    assert.equal(genesis.block_index, 0);
    assert.equal(genesis.event_type, 'GENESIS');

    const result = await verifyChainIntegrity(productId);
    assert.equal(result.valid, true);
    assert.equal(result.blockCount, 1);
  });

  await t.test('2. Appending custody blocks and verifying unbroken chain', async () => {
    await appendBlock({
      product_id: productId,
      event_type: 'CUSTODY_TRANSFER',
      actor_id: 'DISTRIBUTOR_1',
      latitude: 19.0760,
      longitude: 72.8777,
      location_name: 'Mumbai Central Hub',
      temp_celsius: 4.5,
      humidity_pct: 55.0,
      fingerprint_hash: 'e3b0c44298fc1c14'
    });

    await appendBlock({
      product_id: productId,
      event_type: 'RETAIL_RECEIPT',
      actor_id: 'PHARMACY_1',
      latitude: 12.9716,
      longitude: 77.5946,
      location_name: 'Bengaluru Pharmacy',
      temp_celsius: 5.0,
      humidity_pct: 52.0,
      fingerprint_hash: 'e3b0c44298fc1c14'
    });

    const chain = await getChain(productId);
    assert.equal(chain.length, 3);
    assert.equal(chain[1].block_index, 1);
    assert.equal(chain[2].block_index, 2);

    const verification = await verifyChainIntegrity(productId);
    assert.equal(verification.valid, true);
    assert.equal(verification.blockCount, 3);
  });

  await t.test('3. Single-field tamper detection test', async () => {
    // Tamper with Block #1 (change location slightly in database without recalculating hash)
    await query(
      `UPDATE blocks SET location_name = 'Tampered Warehouse Location' WHERE product_id = ? AND block_index = 1`,
      [productId]
    );

    const result = await verifyChainIntegrity(productId);
    assert.equal(result.valid, false);
    assert.equal(result.tampered_block_index, 1);
    assert.match(result.reason, /Hash mismatch at block #1/);
  });
});
