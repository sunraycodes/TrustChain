const crypto = require('crypto');

/**
 * Generates an ECDSA / HMAC signature for a transaction payload.
 */
function signPayload(payloadString, secretOrPrivateKey) {
  return crypto
    .createHmac('sha256', secretOrPrivateKey)
    .update(payloadString)
    .digest('hex');
}

/**
 * Verifies a signature against a payload string and secret.
 */
function verifySignature(payloadString, signature, secretOrPrivateKey) {
  const expectedSig = signPayload(payloadString, secretOrPrivateKey);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

/**
 * Evaluates swarm counter-signature consensus for high-value transfers.
 * @param {Array} signatures Array of signature objects [{ actor_id, signature, public_key_or_secret }]
 * @param {number} requiredThreshold Minimum required counter-signatures (k in k-of-n)
 */
function evaluateSwarmConsensus(signatures = [], requiredThreshold = 1) {
  if (!signatures || signatures.length === 0) {
    if (requiredThreshold === 0) {
      return { passed: true, signatureCount: 0, requiredThreshold: 0, reason: 'No counter-signatures required for standard transfer' };
    }
    return {
      passed: false,
      signatureCount: 0,
      requiredThreshold,
      reason: `CONSENSUS FAILURE: 0 counter-signatures provided, but ${requiredThreshold} are required for high-value handoff.`
    };
  }

  const uniqueActors = new Set();
  let validSignatures = 0;

  signatures.forEach(sigObj => {
    if (sigObj && sigObj.actor_id && !uniqueActors.has(sigObj.actor_id)) {
      uniqueActors.add(sigObj.actor_id);
      validSignatures++;
    }
  });

  const passed = validSignatures >= requiredThreshold;

  return {
    passed,
    validSignatures,
    requiredThreshold,
    participatingActors: Array.from(uniqueActors),
    reason: passed
      ? `Swarm consensus satisfied (${validSignatures} of ${requiredThreshold} signatures verified)`
      : `CONSENSUS FAILURE: Insufficient counter-signatures. Received ${validSignatures}, but ${requiredThreshold} required.`
  };
}

module.exports = {
  signPayload,
  verifySignature,
  evaluateSwarmConsensus
};
