const crypto = require('crypto');

/**
 * Calculates the Hamming distance between two binary string representations or hex hashes.
 */
function hammingDistance(hex1, hex2) {
  if (!hex1 || !hex2) return Infinity;

  // Convert hex to binary strings
  let bin1 = '';
  let bin2 = '';

  for (let i = 0; i < Math.max(hex1.length, hex2.length); i++) {
    const char1 = hex1[i] || '0';
    const char2 = hex2[i] || '0';
    bin1 += parseInt(char1, 16).toString(2).padStart(4, '0');
    bin2 += parseInt(char2, 16).toString(2).padStart(4, '0');
  }

  let distance = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) {
      distance++;
    }
  }

  return { distance, totalBits: bin1.length };
}

/**
 * Computes a simulated perceptual hash (pHash) from a raw buffer or base64 micro-texture image string.
 */
function computePerceptualHash(imageDataBufferOrString) {
  if (typeof imageDataBufferOrString === 'string' && imageDataBufferOrString.startsWith('phash_')) {
    return imageDataBufferOrString;
  }
  const hash = crypto.createHash('sha256').update(imageDataBufferOrString).digest('hex');
  return hash.substring(0, 16); // 64-bit perceptual hash string
}

/**
 * Evaluates whether a scanned packaging micro-texture matches the baseline genesis packaging DNA.
 * @param {string} baselinePhash Genesis block packaging DNA hash
 * @param {string} currentPhash Scanned package packaging DNA hash
 * @param {number} thresholdPercent Minimum percentage similarity required (default 85%)
 */
function evaluatePackagingDna(baselinePhash, currentPhash, thresholdPercent = 85.0) {
  if (!baselinePhash || !currentPhash) {
    return {
      passed: false,
      similarityScore: 0.0,
      reason: 'Missing baseline or scan micro-texture hash'
    };
  }

  const { distance, totalBits } = hammingDistance(baselinePhash, currentPhash);
  const similarityScore = Math.max(0, Number(((1 - distance / totalBits) * 100).toFixed(2)));
  const passed = similarityScore >= thresholdPercent;

  return {
    passed,
    similarityScore,
    hammingDistance: distance,
    totalBits,
    reason: passed
      ? `Packaging DNA micro-texture match verified (${similarityScore}% match)`
      : `Packaging DNA mismatch! ${similarityScore}% match is below required ${thresholdPercent}% threshold. Likely cloned QR on fake packaging.`
  };
}

module.exports = {
  hammingDistance,
  computePerceptualHash,
  evaluatePackagingDna
};
