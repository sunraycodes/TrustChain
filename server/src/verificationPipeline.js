const { verifyChainIntegrity, getChain, appendBlock } = require('./ledger/chainEngine');
const { evaluatePackagingDna } = require('./engines/packagingDna');
const { evaluateImpossibleTravel } = require('./engines/impossibleTravel');
const { evaluateColdChain } = require('./engines/coldChain');
const { evaluateSwarmConsensus } = require('./engines/swarmConsensus');
const { get, query } = require('./db/db');

/**
 * Triggers the Silent Regulatory Trip-Wire background alert when a fraud or anomaly is detected.
 */
async function triggerRegulatoryTripwire({
  product_id,
  severity = 'CRITICAL',
  rule_failed,
  latitude,
  longitude,
  actor_id,
  details
}) {
  const timestamp = new Date().toISOString();
  await query(
    `INSERT INTO alerts (product_id, severity, rule_failed, latitude, longitude, actor_id, details, created_at, resolved)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      product_id,
      severity,
      rule_failed,
      latitude,
      longitude,
      actor_id || 'UNKNOWN_SCANNER',
      typeof details === 'object' ? JSON.stringify(details) : details,
      timestamp
    ]
  );

  console.log(`🚨 [SILENT TRIP-WIRE ALERT FIRED] Product: ${product_id} | Rule: ${rule_failed} | Severity: ${severity}`);
}

/**
 * Master 4-Layer Verification Pipeline executed on every scan.
 */
async function runMasterVerification({
  product_id,
  actor_id = 'CONSUMER_APP',
  latitude,
  longitude,
  scanned_phash,
  temp_celsius = null,
  humidity_pct = null,
  counter_signatures = [],
  record_scan_block = true
}) {
  // Fetch Product metadata
  const product = await get(`SELECT * FROM products WHERE id = ?`, [product_id]);
  if (!product) {
    await triggerRegulatoryTripwire({
      product_id,
      severity: 'CRITICAL',
      rule_failed: 'UNREGISTERED_PRODUCT_SCAN',
      latitude,
      longitude,
      actor_id,
      details: 'Scan attempt for product ID not present in genesis database'
    });

    return {
      status: 'COUNTERFEIT',
      genuine: false,
      summary: 'UNKNOWN / UNREGISTERED PRODUCT: Product ID not registered on ledger.',
      layers: {
        hashChain: { passed: false, reason: 'Product genesis record missing' },
        packagingDna: { passed: false, reason: 'N/A' },
        impossibleTravel: { passed: false, reason: 'N/A' },
        swarmConsensus: { passed: false, reason: 'N/A' }
      }
    };
  }

  // Fetch full chain
  const chain = await getChain(product_id);
  const lastBlock = chain[chain.length - 1];

  // --- LAYER 1: Cryptographic Hash Chain Integrity ---
  const chainCheck = await verifyChainIntegrity(product_id);

  // --- LAYER 2: Packaging DNA Micro-Fingerprint Match ---
  const dnaCheck = evaluatePackagingDna(
    product.initial_phash,
    scanned_phash || lastBlock.fingerprint_hash
  );

  // --- LAYER 3: Impossible-Travel Geo-Velocity Anomaly Check ---
  const travelCheck = evaluateImpossibleTravel(
    lastBlock,
    { latitude, longitude, timestamp: new Date().toISOString() }
  );

  // --- LAYER 4: Swarm Counter-Signature Consensus Check ---
  const consensusCheck = evaluateSwarmConsensus(
    counter_signatures,
    chain.length > 3 ? 1 : 0 // require consensus for high-value downstream handoffs
  );

  // Cold Chain Telemetry Check
  const coldChainCheck = evaluateColdChain(temp_celsius, humidity_pct, {
    min_temp: product.min_temp,
    max_temp: product.max_temp
  });

  // Calculate Overall Status
  let overallStatus = 'GENUINE';
  let genuine = true;
  const failedRules = [];

  if (!chainCheck.valid) {
    overallStatus = 'COUNTERFEIT';
    genuine = false;
    failedRules.push('HASH_CHAIN_BROKEN');
  }

  if (!dnaCheck.passed) {
    overallStatus = 'COUNTERFEIT';
    genuine = false;
    failedRules.push('PACKAGING_DNA_MISMATCH');
  }

  if (!travelCheck.passed) {
    overallStatus = 'COUNTERFEIT';
    genuine = false;
    failedRules.push('IMPOSSIBLE_TRAVEL_ANOMALY');
  }

  if (!consensusCheck.passed) {
    if (overallStatus !== 'COUNTERFEIT') overallStatus = 'SUSPICIOUS';
    genuine = false;
    failedRules.push('SWARM_CONSENSUS_FAILED');
  }

  if (coldChainCheck.spoiled && genuine) {
    overallStatus = 'SPOILED';
    failedRules.push('COLD_CHAIN_EXCURSION');
  }

  // Fire Silent Regulatory Trip-Wire if failed
  if (!genuine) {
    await triggerRegulatoryTripwire({
      product_id,
      severity: 'CRITICAL',
      rule_failed: failedRules.join(' | '),
      latitude,
      longitude,
      actor_id,
      details: {
        chainCheck,
        dnaCheck,
        travelCheck,
        consensusCheck,
        coldChainCheck
      }
    });

    // Update Product Status in database
    await query(`UPDATE products SET status = ? WHERE id = ?`, [overallStatus, product_id]);
  }

  // Record scan block to ledger if genuine or spoiled
  let newBlock = null;
  if (record_scan_block && chainCheck.valid) {
    newBlock = await appendBlock({
      product_id,
      event_type: 'VERIFICATION_SCAN',
      actor_id,
      latitude,
      longitude,
      location_name: `Verification Scan (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      timestamp: new Date().toISOString(),
      temp_celsius,
      humidity_pct,
      fingerprint_hash: scanned_phash || lastBlock.fingerprint_hash,
      counter_signatures
    });
  }

  return {
    status: overallStatus,
    genuine,
    product_name: product.name,
    batch_id: product.batch_id,
    summary: genuine
      ? (coldChainCheck.spoiled
          ? 'AUTHENTIC BUT SPOILED: Product is genuine but experienced a cold-chain temperature excursion.'
          : 'VERIFIED AUTHENTIC: All 4 physical-digital trust layers passed.')
      : `RED FLAG: Verification failed due to ${failedRules.join(', ')}. Silent regulatory alert dispatched.`,
    failed_rules: failedRules,
    layers: {
      hashChain: chainCheck,
      packagingDna: dnaCheck,
      impossibleTravel: travelCheck,
      swarmConsensus: consensusCheck,
      coldChain: coldChainCheck
    },
    latest_block: newBlock || lastBlock,
    chain_length: chain.length + (newBlock ? 1 : 0)
  };
}

module.exports = {
  triggerRegulatoryTripwire,
  runMasterVerification
};
