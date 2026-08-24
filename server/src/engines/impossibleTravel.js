/**
  Calculates the Great Circle distance (in kilometers) between two geographic coordinates
  using the Haversine formula.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Evaluates whether two consecutive product scans violate physical travel velocity limits.
 * @param {Object} prevScan { latitude, longitude, timestamp }
 * @param {Object} currScan { latitude, longitude, timestamp }
 * @param {number} maxAllowedSpeedKmH Maximum plausible speed in km/h (default 900 km/h)
 */
function evaluateImpossibleTravel(prevScan, currScan, maxAllowedSpeedKmH = 900.0) {
  if (!prevScan || !currScan) {
    return {
      passed: true,
      reason: 'First scan or missing reference scan data'
    };
  }

  const distanceKm = haversineDistance(
    prevScan.latitude,
    prevScan.longitude,
    currScan.latitude,
    currScan.longitude
  );

  const prevTime = new Date(prevScan.timestamp).getTime();
  const currTime = new Date(currScan.timestamp).getTime();

  if (isNaN(prevTime) || isNaN(currTime)) {
    return {
      passed: true,
      reason: 'Invalid timestamp format'
    };
  }

  const timeDeltaHours = (currTime - prevTime) / (1000 * 60 * 60);

  // If scans are virtually instantaneous (less than 1 minute apart) but geographically separated
  if (timeDeltaHours <= (1 / 60) && distanceKm > 10.0) {
    return {
      passed: false,
      distanceKm: Number(distanceKm.toFixed(2)),
      timeDeltaMinutes: Number((timeDeltaHours * 60).toFixed(2)),
      calculatedSpeedKmH: Infinity,
      reason: `IMPOSSIBLE TRAVEL ANOMALY: Product scanned ${distanceKm.toFixed(1)} km apart within ${Math.round(timeDeltaHours * 60)} minutes! High likelihood of cloned QR code.`
    };
  }

  if (timeDeltaHours <= 0) {
    // Zero or negative time gap
    if (distanceKm > 1.0) {
      return {
        passed: false,
        distanceKm: Number(distanceKm.toFixed(2)),
        timeDeltaMinutes: 0,
        calculatedSpeedKmH: Infinity,
        reason: `IMPOSSIBLE TRAVEL ANOMALY: Simultaneous scans detected in different locations (${distanceKm.toFixed(1)} km apart). Cloned QR code confirmed.`
      };
    }
    return { passed: true, distanceKm: Number(distanceKm.toFixed(2)), timeDeltaMinutes: 0, calculatedSpeedKmH: 0 };
  }

  const calculatedSpeedKmH = distanceKm / timeDeltaHours;
  const passed = calculatedSpeedKmH <= maxAllowedSpeedKmH;

  return {
    passed,
    distanceKm: Number(distanceKm.toFixed(2)),
    timeDeltaHours: Number(timeDeltaHours.toFixed(4)),
    calculatedSpeedKmH: Number(calculatedSpeedKmH.toFixed(2)),
    maxAllowedSpeedKmH,
    reason: passed
      ? `Scan geo-velocity within normal transit parameters (${calculatedSpeedKmH.toFixed(1)} km/h)`
      : `IMPOSSIBLE TRAVEL ANOMALY: Transit velocity (${calculatedSpeedKmH.toFixed(1)} km/h over ${distanceKm.toFixed(1)} km) exceeds physical max velocity threshold (${maxAllowedSpeedKmH} km/h).`
  };
}

module.exports = {
  haversineDistance,
  evaluateImpossibleTravel
};
