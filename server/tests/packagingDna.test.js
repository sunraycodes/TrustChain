const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeHexHash,
  hexTo64BitBinary,
  hammingDistance,
  computePerceptualHash,
  evaluatePackagingDna
} = require('../src/engines/packagingDna');

test('Packaging DNA & Perceptual Hash Engine Suite', async (t) => {
  const genesisDna = 'a8f9c13b21e45678';

  await t.test('1. Normalization and 64-bit binary expansion', () => {
    const bin = hexTo64BitBinary(genesisDna);
    assert.equal(bin.length, 64);
    assert.match(bin, /^[01]{64}$/);
    assert.equal(normalizeHexHash('0x' + genesisDna), genesisDna);
  });

  await t.test('2. Authentic identical DNA evaluates to 100% similarity and passes', () => {
    const evalResult = evaluatePackagingDna(genesisDna, genesisDna);
    assert.equal(evalResult.passed, true);
    assert.equal(evalResult.similarityScore, 100);
    assert.equal(evalResult.hammingDistance, 0);
    assert.equal(evalResult.riskLevel, 'AUTHENTIC');
    assert.equal(evalResult.bitMatrix.length, 64);
    assert.equal(evalResult.bitMatrix.every(b => b.match), true);
  });

  await t.test('3. Minor sensor noise (1-2 bit flips) maintains authentic status (>85%)', () => {
    // Flip 2 bits in hex string (e.g. change last byte)
    const slightlyNoisyDna = 'a8f9c13b21e45679'; // 1 bit diff
    const evalResult = evaluatePackagingDna(genesisDna, slightlyNoisyDna);
    assert.equal(evalResult.passed, true);
    assert.equal(evalResult.similarityScore >= 85, true);
    assert.equal(evalResult.hammingDistance, 1);
  });

  await t.test('4. Counterfeit / cloned packaging DNA triggers mismatch (<85%) and clone alert', () => {
    const counterfeitDna = 'ffffffffffffffff';
    const evalResult = evaluatePackagingDna(genesisDna, counterfeitDna);
    assert.equal(evalResult.passed, false);
    assert.equal(evalResult.similarityScore < 85, true);
    assert.equal(evalResult.riskLevel, 'CRITICAL_CLONE');
    assert.match(evalResult.reason, /Packaging DNA mismatch/);
    assert.match(evalResult.forensicAnalysis, /Severe structural texture mismatch/);
  });

  await t.test('5. Perceptual hash computation from base64 image strings', () => {
    const fakeImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const computed = computePerceptualHash(fakeImageBase64);
    assert.equal(computed.length, 16);
    assert.match(computed, /^[0-9a-f]{16}$/);
  });
});
