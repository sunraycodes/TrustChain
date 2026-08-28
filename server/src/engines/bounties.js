const { query, get } = require('../db/db');

/**
 * Calculates and awards micro-bounties to actors who detect anomalies.
 * @param {string} actor_id - The ID of the actor who performed the scan
 * @param {string} scanStatus - The overall status from the verification pipeline
 * @param {Array<string>} failedRules - List of failed rule codes
 */
async function awardAnomalyBounty(actor_id, scanStatus, failedRules = []) {
  if (scanStatus === 'GENUINE' || !actor_id) {
    return { awarded: false, points: 0 };
  }

  // Get actor role to determine multiplier/base points
  const actor = await get(`SELECT role FROM actors WHERE id = ?`, [actor_id]);
  const role = actor ? actor.role : 'CONSUMER';

  let points = 0;
  let reason = '';

  if (scanStatus === 'COUNTERFEIT') {
    // High bounty for catching counterfeits
    if (role === 'PHARMACY' || role === 'DISTRIBUTOR') {
      points = 100;
      reason = 'Critical Counterfeit Detection (Professional)';
    } else {
      points = 50;
      reason = 'Counterfeit Detection (Consumer)';
    }
  } else if (scanStatus === 'SPOILED') {
    points = 20;
    reason = 'Cold-Chain Excursion Reported';
  } else if (scanStatus === 'SUSPICIOUS') {
    points = 30;
    reason = 'Swarm Consensus Failure Reported';
  }

  // Add bonus for multiple concurrent failures
  if (failedRules.length > 1) {
    points += 10 * (failedRules.length - 1);
  }

  if (points > 0) {
    // Update actor's bounty score
    await query(
      `UPDATE actors SET bounty_score = COALESCE(bounty_score, 0) + ? WHERE id = ?`,
      [points, actor_id]
    );

    // Record the bounty event in a new table (optional, but good for history)
    await query(
      `INSERT INTO bounty_ledger (actor_id, points, reason, timestamp) VALUES (?, ?, ?, ?)`,
      [actor_id, points, reason, new Date().toISOString()]
    );
  }

  return {
    awarded: points > 0,
    points,
    reason,
    actor_id
  };
}

module.exports = {
  awardAnomalyBounty
};
