import React, { useState } from 'react';
import { Layers, MapPin, Clock, Shield, Key, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function ChainTimeline({ chain = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (!chain || chain.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-slate-800 text-slate-500">
        No ledger blocks found for this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Immutable Ledger Journey Timeline ({chain.length} Blocks)</span>
        </h3>
        <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>SHA-256 Linked</span>
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-500 before:to-slate-700">
        {chain.map((block, idx) => {
          const isExpanded = expandedIndex === idx;
          const isGenesis = block.block_index === 0;

          return (
            <div key={block.id || idx} className="relative group">
              
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isGenesis
                    ? 'bg-emerald-500 border-emerald-300 text-slate-950 glow-emerald'
                    : 'bg-slate-900 border-cyan-500 text-cyan-400'
                }`}
              >
                <span className="text-[10px] font-bold font-mono">{block.block_index}</span>
              </div>

              {/* Block Card */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all duration-200">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : idx)}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isGenesis
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {block.event_type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Actor: {block.actor_id}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white mt-1 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{block.location_name || `Lat: ${block.latitude}, Lng: ${block.longitude}`}</span>
                    </h4>

                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(block.timestamp).toLocaleString()}</span>
                      </span>
                      {block.temp_celsius != null && (
                        <span className="text-cyan-300">Temp: {block.temp_celsius}°C</span>
                      )}
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Cryptographic Block Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 font-mono text-xs text-slate-300">
                    
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Block Data Hash (SHA-256)</span>
                        <button
                          onClick={() => handleCopy(block.data_hash)}
                          className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
                        >
                          {copiedHash === block.data_hash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedHash === block.data_hash ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-emerald-400 break-all select-all font-mono">
                        {block.data_hash}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Previous Block Hash</div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 break-all font-mono">
                        {block.previous_block_hash}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Packaging DNA pHash:</span>
                        <span className="text-slate-200">{block.fingerprint_hash}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Geolocation Coordinates:</span>
                        <span className="text-slate-200">{block.latitude}, {block.longitude}</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
