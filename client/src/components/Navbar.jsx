import React, { useState, useEffect } from 'react';
import { ShieldCheck, Factory, Truck, Building2, AlertTriangle, QrCode } from 'lucide-react';
import { BASE_URL } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout, serverStatus = 'checking' }) {
  const tabs = [
    { id: 'consumer', label: 'Scan & Verify PWA', icon: QrCode, highlight: true },
    { id: 'manufacturer', label: 'Manufacturer Portal', icon: Factory },
    { id: 'distributor', label: 'Distributor & Logistics', icon: Truck },
    { id: 'pharmacy', label: 'Pharmacy Portal', icon: Building2 },
    { id: 'regulator', label: 'Regulator Dashboard', icon: AlertTriangle }
  ];

  const [bountyScore, setBountyScore] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`${BASE_URL}/bounties/me?actor_id=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.score !== undefined) setBountyScore(data.score);
        })
        .catch(err => console.error('Failed to fetch bounty score:', err));
    }
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white font-sans">TrustChain</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SHA-256 Mesh
                </span>
                {serverStatus === 'online' && (
                  <span className="hidden sm:inline-flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Node Online</span>
                  </span>
                )}
                {serverStatus === 'waking' && (
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Waking Ledger Node (~30s)...</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Physically-Fused, Self-Alerting Verification Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Navigation Tabs */}
            <nav className="flex space-x-1 sm:space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? tab.highlight
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 glow-emerald'
                          : 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Auth Status */}
            {currentUser && (
              <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-800">
                <div className="text-right flex items-center space-x-3">
                  <div className="hidden xl:block text-right pr-3 border-r border-slate-700">
                    <div className="text-[10px] font-bold text-amber-500 uppercase flex items-center justify-end space-x-1">
                      <span>Trust Score</span>
                    </div>
                    <div className="text-sm font-bold text-amber-400">{bountyScore} <span className="text-[10px] text-amber-500/70">PTS</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{currentUser.role}</div>
                    <div className="text-xs text-slate-300 font-mono">{currentUser.id}</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
