const crypto = require('crypto');
const { query, get } = require('../db/db');

const GENESIS_PREVIOUS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Deterministically computes the SHA-256 hash for a ledger block payload.
 */
function calculateBlockHash({
  block_index,
  product_id,
  event_type,
  actor_id,
  latitude,
  longitude,
  location_name = '',
  timestamp,
  temp_celsius,
  humidity_pct,
  fingerprint_hash,
  counter_signatures = [],
  previous_block_hash
}) {
  const parsedSigs = typeof counter_signatures === 'string'
    ? JSON.parse(counter_signatures || '[]')
    : counter_signatures;
  
  const sortedSigs = [...parsedSigs].sort().join(',');

  const payloadStr = [
    block_index,
    product_id,
    event_type,
    actor_id,
    Number(latitude).toFixed(6),
    Number(longitude).toFixed(6),
    location_name || '',
    timestamp,
    temp_celsius != null ? Number(temp_celsius).toFixed(2) : 'N/A',
    humidity_pct != null ? Number(humidity_pct).toFixed(2) : 'N/A',
    fingerprint_hash,
    sortedSigs,
    previous_block_hash
  ].join('|');

  return crypto.createHash('sha256').update(payloadStr).digest('hex');
}

/**
 * Creates the Genesis block for a newly registered product.
 */
async function createGenesisBlock({
  product_id,
  actor_id,
  latitude,
  longitude,
  location_name = 'Factory / Production Facility',
  timestamp = new Date().toISOString(),
  temp_celsius = 4.0,
  humidity_pct = 50.0,
  fingerprint_hash,
  counter_signatures = []
}) {
  const blockIndex = 0;
  const previousBlockHash = GENESIS_PREVIOUS_HASH;
  const sigsJson = JSON.stringify(counter_signatures);

  const dataHash = calculateBlockHash({
    block_index: blockIndex,
    product_id,
    event_type: 'GENESIS',
    actor_id,
    latitude,
    longitude,
    location_name,
    timestamp,
    temp_celsius,
    humidity_pct,
    fingerprint_hash,
    counter_signatures,
    previous_block_hash: previousBlockHash
  });

  const res = await query(
    `INSERT INTO blocks (
      block_index, product_id, event_type, actor_id, latitude, longitude, location_name,
      timestamp, temp_celsius, humidity_pct, fingerprint_hash, counter_signatures, previous_block_hash, data_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      blockIndex,
      product_id,
      'GENESIS',
      actor_id,
      latitude,
      longitude,
      location_name,
      timestamp,
      temp_celsius,
      humidity_pct,
      fingerprint_hash,
      sigsJson,
      previousBlockHash,
      dataHash
    ]
  );

  return {
    id: res.lastID,
    block_index: blockIndex,
    product_id,
    event_type: 'GENESIS',
    actor_id,
    latitude,
    longitude,
    location_name,
    timestamp,
    temp_celsius,
    humidity_pct,
    fingerprint_hash,
    counter_signatures,
    previous_block_hash: previousBlockHash,
    data_hash: dataHash
  };
}

/**
 * Appends a new custody block to an existing product's hash-chain.
 */
async function appendBlock({
  product_id,
  event_type,
  actor_id,
  latitude,
  longitude,
  location_name = '',
  timestamp = new Date().toISOString(),
  temp_celsius = null,
  humidity_pct = null,
  fingerprint_hash,
  counter_signatures = []
}) {
  // Fetch latest block for this product
  const latestBlock = await get(
    `SELECT * FROM blocks WHERE product_id = ? ORDER BY block_index DESC LIMIT 1`,
    [product_id]
  );

  if (!latestBlock) {
    throw new Error(`Cannot append block: Genesis block for product ${product_id} not found.`);
  }

  const nextIndex = latestBlock.block_index + 1;
  const prevHash = latestBlock.data_hash;
  const sigsJson = JSON.stringify(counter_signatures);

  const dataHash = calculateBlockHash({
    block_index: nextIndex,
    product_id,
    event_type,
    actor_id,
    latitude,
    longitude,
    location_name,
    timestamp,
    temp_celsius,
    humidity_pct,
    fingerprint_hash,
    counter_signatures,
    previous_block_hash: prevHash
  });

  const res = await query(
    `INSERT INTO blocks (
      block_index, product_id, event_type, actor_id, latitude, longitude, location_name,
      timestamp, temp_celsius, humidity_pct, fingerprint_hash, counter_signatures, previous_block_hash, data_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nextIndex,
      product_id,
      event_type,
      actor_id,
      latitude,
      longitude,
      location_name,
      timestamp,
      temp_celsius,
      humidity_pct,
      fingerprint_hash,
      sigsJson,
      prevHash,
      dataHash
    ]
  );

  return {
    id: res.lastID,
    block_index: nextIndex,
    product_id,
    event_type,
    actor_id,
    latitude,
    longitude,
    location_name,
    timestamp,
    temp_celsius,
    humidity_pct,
    fingerprint_hash,
    counter_signatures,
    previous_block_hash: prevHash,
    data_hash: dataHash
  };
}

/**
 * Retrieves full ledger history for a given product ID.
 */
async function getChain(product_id) {
  const blocks = await query(
    `SELECT * FROM blocks WHERE product_id = ? ORDER BY block_index ASC`,
    [product_id]
  );
  return blocks.map(b => ({
    ...b,
    counter_signatures: JSON.parse(b.counter_signatures || '[]')
  }));
}

/**
 * Validates the unbroken integrity of a product's hash-chain.
 */
async function verifyChainIntegrity(product_id) {
  const blocks = await query(
    `SELECT * FROM blocks WHERE product_id = ? ORDER BY block_index ASC`,
    [product_id]
  );

  if (!blocks || blocks.length === 0) {
    return { valid: false, reason: 'No ledger blocks found for product ID' };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const sigs = JSON.parse(block.counter_signatures || '[]');

    // 1. Recompute data_hash
    const expectedHash = calculateBlockHash({
      block_index: block.block_index,
      product_id: block.product_id,
      event_type: block.event_type,
      actor_id: block.actor_id,
      latitude: block.latitude,
      longitude: block.longitude,
      location_name: block.location_name,
      timestamp: block.timestamp,
      temp_celsius: block.temp_celsius,
      humidity_pct: block.humidity_pct,
      fingerprint_hash: block.fingerprint_hash,
      counter_signatures: sigs,
      previous_block_hash: block.previous_block_hash
    });

    if (block.data_hash !== expectedHash) {
      return {
        valid: false,
        tampered_block_index: block.block_index,
        reason: `Hash mismatch at block #${block.block_index}. Stored: ${block.data_hash}, Calculated: ${expectedHash}`
      };
    }

    // 2. Verify previous_block_hash link
    if (i === 0) {
      if (block.previous_block_hash !== GENESIS_PREVIOUS_HASH) {
        return {
          valid: false,
          tampered_block_index: 0,
          reason: `Genesis block previous hash is invalid: ${block.previous_block_hash}`
        };
      }
    } else {
      const previousBlock = blocks[i - 1];
      if (block.previous_block_hash !== previousBlock.data_hash) {
        return {
          valid: false,
          tampered_block_index: block.block_index,
          reason: `Chain broken at block #${block.block_index}. Previous hash (${block.previous_block_hash}) does not match Block #${previousBlock.block_index} data_hash (${previousBlock.data_hash})`
        };
      }
    }
  }

  return { valid: true, blockCount: blocks.length };
}

module.exports = {
  calculateBlockHash,
  createGenesisBlock,
  appendBlock,
  getChain,
  verifyChainIntegrity,
  GENESIS_PREVIOUS_HASH
};
