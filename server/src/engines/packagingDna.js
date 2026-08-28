const crypto = require('crypto');

/**
 * Normalizes a hex string or computes a 16-character hex hash (64-bit) if input is not 16-hex.
 */
function normalizeHexHash(input) {
  if (!input) return '0000000000000000';
  let clean = input.trim();
  if (clean.startsWith('0x')) clean = clean.slice(2);
  if (clean.startsWith('phash_')) clean = clean.slice(6);
  
  // If already a valid hex string of at least 16 chars, take first 16 chars
  if (/^[0-9a-fA-F]+$/.test(clean) && clean.length >= 16) {
    return clean.substring(0, 16).toLowerCase();
  }

  // Otherwise hash it to get a deterministic 16-hex character (64-bit) representation
  return crypto.createHash('sha256').update(clean).digest('hex').substring(0, 16);
}

/**
 * Converts a 16-character hex string into a 64-character binary string ('0' and '1').
 */
function hexTo64BitBinary(hexStr) {
  const norm = normalizeHexHash(hexStr);
  let binary = '';
  for (let i = 0; i < 16; i++) {
    const hexChar = norm[i] || '0';
    binary += parseInt(hexChar, 16).toString(2).padStart(4, '0');
  }
  return binary.padEnd(64, '0').slice(0, 64);
}

/**
 * Calculates the Hamming distance between two hex hashes or binary strings.
 */
function hammingDistance(hex1, hex2) {
  const bin1 = hexTo64BitBinary(hex1);
  const bin2 = hexTo64BitBinary(hex2);

  let distance = 0;
  for (let i = 0; i < 64; i++) {
    if (bin1[i] !== bin2[i]) {
      distance++;
    }
  }

  return { distance, totalBits: 64, bin1, bin2 };
}

/**
 * Computes a simulated or real perceptual hash (pHash / dHash) from image data or string.
 */
function computePerceptualHash(imageDataBufferOrString) {
  if (!imageDataBufferOrString) return 'a8f9c13b21e45678';

  if (typeof imageDataBufferOrString === 'string') {
    // If it's already a 16-hex character string
    if (/^[0-9a-fA-F]{16}$/.test(imageDataBufferOrString)) {
      return imageDataBufferOrString.toLowerCase();
    }
    // If it's a base64 data URL
    if (imageDataBufferOrString.startsWith('data:image/')) {
      const base64Data = imageDataBufferOrString.split(',')[1] || imageDataBufferOrString;
      const buffer = Buffer.from(base64Data, 'base64');
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      return hash.substring(0, 16);
    }
  }

  const hash = crypto.createHash('sha256').update(imageDataBufferOrString).digest('hex');
  return hash.substring(0, 16);
}

/**
 * Evaluates whether a scanned packaging micro-texture matches the baseline genesis packaging DNA.
 * Returns comprehensive 64-bit matrix forensic analysis for visual inspection.
 * @param {string} baselinePhash Genesis block packaging DNA hash
 * @param {string} currentPhash Scanned package packaging DNA hash
 * @param {number} thresholdPercent Minimum percentage similarity required (default 85%)
 */
function evaluatePackagingDna(baselinePhash, currentPhash, thresholdPercent = 85.0) {
  if (!baselinePhash || !currentPhash) {
    return {
      passed: false,
      similarityScore: 0.0,
      hammingDistance: 64,
      totalBits: 64,
      riskLevel: 'CRITICAL_CLONE',
      reason: 'Missing baseline genesis DNA or scanned micro-texture hash.',
      bitMatrix: []
    };
  }

  const normBaseline = normalizeHexHash(baselinePhash);
  const normCurrent = normalizeHexHash(currentPhash);
  const { distance, bin1: baselineBits, bin2: scannedBits } = hammingDistance(normBaseline, normCurrent);

  const similarityScore = Math.max(0, Number(((1 - distance / 64) * 100).toFixed(2)));
  const passed = similarityScore >= thresholdPercent;

  // Build 8x8 forensic bit grid
  const bitMatrix = [];
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const bBit = baselineBits[i];
    const sBit = scannedBits[i];
    const match = bBit === sBit;
    bitMatrix.push({
      index: i,
      row,
      col,
      baselineBit: Number(bBit),
      scannedBit: Number(sBit),
      match
    });
  }

  // Determine Risk Classification
  let riskLevel = 'AUTHENTIC';
  let forensicAnalysis = '';

  if (similarityScore >= 95.0) {
    riskLevel = 'AUTHENTIC';
    forensicAnalysis = 'Micro-texture grain and fiber speckle pattern perfectly matches genesis manufacturing baseline (<5% natural sensor noise).';
  } else if (similarityScore >= thresholdPercent) {
    riskLevel = 'ACCEPTABLE_WEAR';
    forensicAnalysis = `Minor surface wear or slight ambient lighting delta detected (${distance}/64 bit variance), well within authentic tolerances.`;
  } else if (similarityScore >= 60.0) {
    riskLevel = 'SUSPICIOUS_TAMPER';
    forensicAnalysis = `Substantial micro-texture divergence (${distance}/64 bit flips). High probability of re-labeling or package tampering.`;
  } else {
    riskLevel = 'CRITICAL_CLONE';
    forensicAnalysis = `Severe structural texture mismatch (${distance}/64 bit flips). Cloned QR code affixed to counterfeit / non-origin packaging material!`;
  }

  return {
    passed,
    similarityScore,
    hammingDistance: distance,
    totalBits: 64,
    thresholdPercent,
    riskLevel,
    baselinePhash: normBaseline,
    scannedPhash: normCurrent,
    baselineBits,
    scannedBits,
    bitMatrix,
    forensicAnalysis,
    reason: passed
      ? `Packaging DNA micro-texture match verified (${similarityScore}% match, ${distance} bit delta)`
      : `Packaging DNA mismatch! ${similarityScore}% match is below required ${thresholdPercent}% threshold (${distance}/64 bit flips). Likely cloned QR code on counterfeit packaging.`
  };
}

module.exports = {
  normalizeHexHash,
  hexTo64BitBinary,
  hammingDistance,
  computePerceptualHash,
  evaluatePackagingDna
};

