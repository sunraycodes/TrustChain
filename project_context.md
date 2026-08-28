# TrustChain - Project Context

## Hackathon Details
- **Event**: OMNIKON 2026
- **Problem ID**: OMNI_CYBERTECH_5
- **Status**: Midway Submission (Day 8 of 15-day sprint) - 53% Complete

## The Problem
Counterfeit medical products are a huge issue (1 in 10 in low/middle-income countries). Verification typically only checks a label (like a QR code), which can be copied, and never the journey. Detection usually happens too late. This is a physical-world trust problem.
**Core Question:** How do we make it physically and mathematically impossible for a counterfeit unit to pass as genuine — and alert authorities before it reaches a patient?

## Progress Made (Days 1-8)
**Completed (Trust Layer Features - 3 of 6 live):**
- **Days 1-2**: Data model & block schema finalized; repo, database, and base API structure live.
- **Days 3-4**: Core hash-chain engine built (block creation, linking, chain verification). Tests prove a single-field edit breaks the chain.
- **Days 5-6**: Backend APIs shipped for batch registration, custody events, chain retrieval, and JWT role-based auth.
- **Days 7-8**: Physical fingerprint capture + pHash comparison pipeline implemented and integrated into the genesis block (Packaging DNA Fingerprinting).

## Technical Architecture (Five Layers)
1. **Physical Capture**: Micro-fingerprint camera, tamper seal, cold-chain tag.
2. **Ledger**: SHA-256 hash-chain, block store, consensus service.
3. **Intelligence**: Impossible-travel engine, cold-chain validator, trust score.
4. **Interface**: React dashboards, consumer PWA.
5. **Response**: Silent trip-wire alerts, geofenced notification.

**Block Structure**: `product_id` · `event_type` · `actor_id` · `geolocation` · `timestamp` · `temp/humidity` · `fingerprint hash` · `previous_block_hash` · `data_hash` = SHA256(all fields)

## Challenges Faced & Mitigations
- **Perceptual-hash tuning**: Tuned pHash thresholds to tolerate lighting/angle variance by capturing a fixed micro-region and normalizing images.
- **Simulating cold-chain sensor input**: Mocking temperature/humidity readings with a seeded generator until real hardware integration.
- **Fast hash-chain verification**: Implemented periodic checkpoint hashes so verification only re-walks since the last checkpoint, keeping it fast for long-lived batches.
- **Geo-velocity threshold false-flags**: Legitimate fast travel (air freight) or GPS drift can cause false flags. Tuning thresholds for the anomaly-engine in upcoming sprint days.

## Future Roadmap (Days 9-15 & Beyond)
- **Day 9**: Impossible-travel anomaly engine (geo-velocity checks). (IN PROGRESS)
- **Day 10**: Swarm counter-signature consensus for high-value transfers. (PLANNED)
- **Days 11-12**: Manufacturer, distributor, and pharmacy dashboards.
- **Day 13**: Consumer scan-and-verify PWA with live chain timeline.
- **Day 14**: Silent regulatory trip-wire + community micro-bounty mesh. (PLANNED - Cold-Chain-Fused Hash also planned after anomaly engine)
- **Day 15**: End-to-end testing, "Simulate Counterfeit" demo trigger, pitch rehearsal.

**Beyond the Hackathon**: Pilot with a real pharmacy network, real IoT cold-chain sensors, and a regulator integration for the trip-wire alert channel.

## Demo Flow
The app features instant verification for consumers & pharmacists evaluating 4 independent layers under 500ms.
Includes a "Simulate Counterfeit" trigger for live pitches that simulates a cloned QR scan with a packaging DNA mismatch + impossible travel speed. This triggers a "Silent Regulatory Trip-Wire" background alert.
