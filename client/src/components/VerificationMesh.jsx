import React from 'react';
import { Link2, Dna, Zap, Users, Thermometer, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function VerificationMesh({ layers, status }) {
  if (!layers) return null;

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
        ? `Micro-texture verified (${layers.packagingDna.similarityScore}% match)`
        : layers.packagingDna?.reason || 'Micro-texture mismatch! Cloned label suspected.'
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
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isOk
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-rose-950/40 border-rose-500/40 hover:border-rose-500/70 glow-rose'
              }`}
            >
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
          );
        })}
      </div>

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
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${!layers.coldChain.spoiled ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
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
