/**
 * Evaluates cold-chain sensor readings against baseline safety thresholds.
 * @param {number|null} tempCelsius Current sensor reading in Celsius
 * @param {number|null} humidityPct Current sensor reading humidity %
 * @param {Object} baselineLimits { min_temp, max_temp, max_humidity }
 */
function evaluateColdChain(tempCelsius, humidityPct, baselineLimits = {}) {
  const minTemp = baselineLimits.min_temp ?? 2.0;
  const maxTemp = baselineLimits.max_temp ?? 8.0;
  const maxHumidity = baselineLimits.max_humidity ?? 75.0;

  if (tempCelsius == null) {
    return {
      passed: true,
      spoiled: false,
      reason: 'No temperature sensor data recorded for this block'
    };
  }

  const tempExcursion = tempCelsius < minTemp || tempCelsius > maxTemp;
  const humidityExcursion = humidityPct != null && humidityPct > maxHumidity;

  const spoiled = tempExcursion || humidityExcursion;

  let reason = 'Cold-chain telemetry within safe regulatory parameters.';
  if (tempExcursion) {
    reason = `COLD-CHAIN EXCURSION ALERT: Recorded temperature (${tempCelsius}°C) is outside safe range (${minTemp}°C to ${maxTemp}°C). Product flagged as AUTHENTIC BUT SPOILED.`;
  } else if (humidityExcursion) {
    reason = `HUMIDITY EXCURSION ALERT: Recorded humidity (${humidityPct}%) exceeds safe maximum (${maxHumidity}%).`;
  }

  return {
    passed: !spoiled,
    spoiled,
    tempCelsius,
    humidityPct,
    safeTempRange: `${minTemp}°C - ${maxTemp}°C`,
    reason
  };
}

module.exports = {
  evaluateColdChain
};
