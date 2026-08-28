import React, { useState } from 'react';
import {
  Link2,
  Dna,
  Zap,
  Users,
  Thermometer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function VerificationMesh({ layers, status }) {
  const [showDnaForensics, setShowDnaForensics] = useState(false);
  const [hoveredBit, setHoveredBit] = useState(null);

  if (!layers) return null;

  const dnaLayer = layers.packagingDna;
  const bitMatrix = dnaLayer?.bitMatrix || [];
  const bitDiffs = dnaLayer?.hammingDistance ?? 0;

  const cards = [
    {
      id: 'hashChain',
      name: 'Layer 1: Hash-Chain Ledger',
      subtitle: 'Cryptographic append-only immutability',
      icon: Link2,
      passed: layers.hashChain?.valid,
      details: layers.hashChain?.valid
        ? `Unbroken chain (${layers.hashChain.blockCount || 'Multi'} blocks validated)`
        : layers.hashChain?.reason || 'Chain integrity break detected!'
    },
    {
      id: 'packagingDna',
      name: 'Layer 2: Packaging DNA',
      subtitle: 'Perceptual micro-texture pHash match',
      icon: Dna,
      passed: layers.packagingDna?.passed,
      details: layers.packagingDna?.passed
        ? `Micro-texture verified (${layers.packagingDna.similarityScore}% match, ${bitDiffs}/64 bit delta)`
        : layers.packagingDna?.reason || 'Micro-texture mismatch! Cloned label suspected.',
      hasForensics: true
    },
    {
      id: 'impossibleTravel',
      name: 'Layer 3: Impossible-Travel Engine',
      subtitle: 'Geo-velocity physics anomaly check',
      icon: Zap,
      passed: layers.impossibleTravel?.passed,
      details: layers.impossibleTravel?.passed
        ? `Transit velocity normal (${layers.impossibleTravel.calculatedSpeedKmH || 0} km/h)`
        : layers.impossibleTravel?.reason || 'Impossible velocity detected across duplicate scans!'
    },
    {
      id: 'swarmConsensus',
      name: 'Layer 4: Swarm Consensus',
      subtitle: 'Multi-signature k-of-n validation',
      icon: Users,
      passed: layers.swarmConsensus?.passed,
      details: layers.swarmConsensus?.passed
        ? `Signatures verified (${layers.swarmConsensus.validSignatures || 0} counter-signatures)`
        : layers.swarmConsensus?.reason || 'Insufficient counter-signatures for handoff.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          4-Layer Physical-Digital Trust Mesh
        </h3>
        <span className="text-xs text-slate-500 font-mono">ALL 4 CHECKS REQUIRED FOR GENUINE CERTIFICATION</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isOk = card.passed;

          return (
            <div
              key={card.id}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isOk
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-rose-950/40 border-rose-500/40 hover:border-rose-500/70 glow-rose'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOk
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{card.name}</h4>
                      <p className="text-xs text-slate-400">{card.subtitle}</p>
                    </div>
                  </div>

                  <div>
                    {isOk ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <p className={`text-xs font-medium ${isOk ? 'text-slate-300' : 'text-rose-300'}`}>
                    {card.details}
                  </p>
                </div>
              </div>

              {/* Layer 2 Forensic Accordion Button */}
              {card.hasForensics && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => setShowDnaForensics(!showDnaForensics)}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-bold text-cyan-400 flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showDnaForensics ? 'Hide Forensic Matrix' : 'Inspect 8×8 DNA Forensic Grid'}</span>
                    </span>
                    {showDnaForensics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded Packaging DNA 8x8 Forensic Matrix Drawer */}
      {showDnaForensics && dnaLayer && (
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 bg-slate-950/90 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <Dna className="w-4 h-4" />
                <span>Layer 2 Perceptual Hash Micro-Texture Forensic Audit</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Master Genesis pHash: <span className="text-emerald-400 font-bold">{dnaLayer.baselinePhash || 'a8f9c13b21e45678'}</span> | Scanned: <span className={dnaLayer.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{dnaLayer.scannedPhash || 'N/A'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${dnaLayer.passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                Risk: {dnaLayer.riskLevel || (dnaLayer.passed ? 'AUTHENTIC' : 'CRITICAL_CLONE')}
              </span>
            </div>
          </div>

          {dnaLayer.forensicAnalysis && (
            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              🔬 <strong>Forensic Breakdown:</strong> {dnaLayer.forensicAnalysis}
            </p>
          )}

          {/* 8x8 Bit Matrix Grid */}
          {bitMatrix.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-1.5 max-w-xs mx-auto p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                {bitMatrix.map((bit) => {
                  const isMatch = bit.match;
                  const isHovered = hoveredBit?.index === bit.index;

                  return (
                    <div
                      key={bit.index}
                      onMouseEnter={() => setHoveredBit(bit)}
                      onMouseLeave={() => setHoveredBit(null)}
                      className={`aspect-square rounded-md flex items-center justify-center font-mono text-[9px] font-bold cursor-pointer transition-all ${
                        isMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:scale-110'
                          : 'bg-rose-500/40 text-rose-200 border border-rose-500/60 animate-pulse hover:scale-110'
                      } ${isHovered ? 'ring-2 ring-cyan-400 scale-125 z-10' : ''}`}
                    >
                      {bit.scannedBit}
                    </div>
                  );
                })}
              </div>

              <div className="text-center font-mono text-[11px] text-slate-400">
                {hoveredBit ? (
                  <span>
                    Bit #{hoveredBit.index} (Row {hoveredBit.row}, Col {hoveredBit.col}): Master ={' '}
                    <strong className="text-emerald-400">{hoveredBit.baselineBit}</strong> | Scan ={' '}
                    <strong className={hoveredBit.match ? 'text-emerald-400' : 'text-rose-400'}>{hoveredBit.scannedBit}</strong>{' '}
                    ({hoveredBit.match ? 'MATCH' : 'FLIPPED'})
                  </span>
                ) : (
                  <span>Hover over any bit cell to view master vs scan parity</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cold Chain Sensor Status Banner */}
      {layers.coldChain && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            !layers.coldChain.spoiled
              ? 'bg-slate-900/60 border-slate-800'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                !layers.coldChain.spoiled ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cold-Chain Telemetry</div>
              <div className="text-xs font-medium text-slate-200">{layers.coldChain.reason}</div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Range: {layers.coldChain.safeTempRange}</div>
            {layers.coldChain.tempCelsius != null && (
              <div className="font-bold text-slate-200">{layers.coldChain.tempCelsius}°C</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

