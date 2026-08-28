import React, { useState } from 'react';
import { Building2, PackageCheck, Pill, Thermometer, ShieldCheck, ArrowDownToLine, AlertTriangle } from 'lucide-react';
import { transferCustody, BASE_URL } from '../services/api';

export default function PharmacyDashboard({ token }) {
  const [activeSection, setActiveSection] = useState('receive');

  // --- Receive Shipment State ---
  const [receiveForm, setReceiveForm] = useState({
    product_id: 'MED-789204-X',
    location_name: 'Apex Central Pharmacy, New Delhi',
    latitude: '28.6328',
    longitude: '77.2197',
    temp_celsius: '5.2',
    humidity_pct: '48.0',
    counter_signatures: '["sig_pharmacy_gamma_key", "sig_peer_pharmacy_44"]'
  });
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveResult, setReceiveResult] = useState(null);
  const [receiveMsg, setReceiveMsg] = useState('');

  // --- Dispense State ---
  const [dispenseForm, setDispenseForm] = useState({
    product_id: 'MED-789204-X',
    location_name: 'Apex Central Pharmacy — Dispensary Counter',
    latitude: '28.6328',
    longitude: '77.2197'
  });
  const [dispenseLoading, setDispenseLoading] = useState(false);
  const [dispenseResult, setDispenseResult] = useState(null);
  const [dispenseMsg, setDispenseMsg] = useState('');

  const handleReceive = async (e) => {
    e.preventDefault();
    setReceiveLoading(true);
    setReceiveMsg('');
    try {
      let parsedSigs = [];
      try { parsedSigs = JSON.parse(receiveForm.counter_signatures); } catch { parsedSigs = [receiveForm.counter_signatures]; }

      const res = await fetch(`${BASE_URL}/products/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...receiveForm,
          event_type: 'RETAIL_RECEIPT',
          actor_id: 'PHARMACY_GAMMA',
          latitude: parseFloat(receiveForm.latitude),
          longitude: parseFloat(receiveForm.longitude),
          temp_celsius: parseFloat(receiveForm.temp_celsius),
          humidity_pct: parseFloat(receiveForm.humidity_pct),
          counter_signatures: parsedSigs
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReceiveResult(data.block);
        setReceiveMsg('✅ Incoming shipment received and logged on hash-chain!');
      } else {
        setReceiveMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setReceiveMsg(`❌ Error: ${err.message}`);
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    setDispenseLoading(true);
    setDispenseMsg('');
    try {
      const res = await fetch(`${BASE_URL}/products/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          product_id: dispenseForm.product_id,
          event_type: 'DISPENSED',
          actor_id: 'PHARMACY_GAMMA',
          latitude: parseFloat(dispenseForm.latitude),
          longitude: parseFloat(dispenseForm.longitude),
          location_name: dispenseForm.location_name,
          temp_celsius: null,
          humidity_pct: null,
          counter_signatures: []
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDispenseResult(data.block);
        setDispenseMsg('✅ Product dispensed to patient. Final-mile block recorded!');
      } else {
        setDispenseMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setDispenseMsg(`❌ Error: ${err.message}`);
    } finally {
      setDispenseLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Pharmacy Receipt & Dispensing Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Receive Shipments & Dispense to Patients</h1>
          <p className="text-sm text-slate-400 mt-1">
            Verify incoming cold-chain integrity, log receipt blocks, and record final-mile dispensing events
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveSection('receive')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'receive'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Receive Shipment</span>
        </button>
        <button
          onClick={() => setActiveSection('dispense')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'dispense'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Dispense to Patient</span>
        </button>
      </div>

      {/* Receive Shipment Section */}
      {activeSection === 'receive' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleReceive} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>Incoming Shipment Receipt</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Product ID</label>
              <input
                type="text"
                value={receiveForm.product_id}
                onChange={(e) => setReceiveForm({ ...receiveForm, product_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Pharmacy Location</label>
              <input
                type="text"
                value={receiveForm.location_name}
                onChange={(e) => setReceiveForm({ ...receiveForm, location_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Arrival Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={receiveForm.temp_celsius}
                  onChange={(e) => setReceiveForm({ ...receiveForm, temp_celsius: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={receiveForm.humidity_pct}
                  onChange={(e) => setReceiveForm({ ...receiveForm, humidity_pct: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Counter-Signatures (JSON)</label>
              <input
                type="text"
                value={receiveForm.counter_signatures}
                onChange={(e) => setReceiveForm({ ...receiveForm, counter_signatures: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={receiveLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{receiveLoading ? 'Recording Receipt...' : 'Confirm Shipment Receipt'}</span>
            </button>

            {receiveMsg && <div className="p-3 rounded-xl bg-slate-900 text-xs font-medium text-slate-200">{receiveMsg}</div>}
          </form>

          {/* Receipt Result Preview */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
                Receipt Block Confirmation
              </h3>

              {receiveResult ? (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                    <div className="text-[10px] text-slate-500">BLOCK INDEX</div>
                    <div className="text-lg font-bold text-amber-400">#{receiveResult.block_index}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">DATA HASH (SHA-256):</span>
                      <span className="text-emerald-400 break-all text-[11px]">{receiveResult.data_hash}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">EVENT TYPE:</span>
                      <span className="text-amber-300 text-[11px]">{receiveResult.event_type}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center text-slate-500 space-y-3 py-12">
                  <PackageCheck className="w-16 h-16 mx-auto opacity-30 text-amber-400" />
                  <p className="text-xs">Confirm an incoming shipment to log a RETAIL_RECEIPT block on the chain.</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/80">
              <AlertTriangle className="w-3.5 h-3.5 inline-block mr-1 text-amber-400" />
              <strong>Cold-Chain Check:</strong> Verify the arrival temperature is within the product's safe range (2°C – 8°C) before accepting delivery.
            </div>
          </div>
        </div>
      )}

      {/* Dispense to Patient Section */}
      {activeSection === 'dispense' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleDispense} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              <span>Dispense to Patient</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Product ID</label>
              <input
                type="text"
                value={dispenseForm.product_id}
                onChange={(e) => setDispenseForm({ ...dispenseForm, product_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Dispensary Location</label>
              <input
                type="text"
                value={dispenseForm.location_name}
                onChange={(e) => setDispenseForm({ ...dispenseForm, location_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={dispenseLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 glow-emerald"
            >
              <Pill className="w-4 h-4" />
              <span>{dispenseLoading ? 'Recording Dispensation...' : 'Record Final Dispensation'}</span>
            </button>

            {dispenseMsg && <div className="p-3 rounded-xl bg-slate-900 text-xs font-medium text-slate-200">{dispenseMsg}</div>}
          </form>

          {/* Dispense Result */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
                Dispensation Block Confirmation
              </h3>

              {dispenseResult ? (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <div className="text-[10px] text-slate-500">FINAL-MILE BLOCK INDEX</div>
                    <div className="text-lg font-bold text-emerald-400">#{dispenseResult.block_index}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">DATA HASH (SHA-256):</span>
                      <span className="text-emerald-400 break-all text-[11px]">{dispenseResult.data_hash}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">EVENT TYPE:</span>
                      <span className="text-emerald-300 text-[11px]">{dispenseResult.event_type}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                    <ShieldCheck className="w-4 h-4 inline-block mr-1 text-emerald-400" />
                    <strong>Complete:</strong> The product's lifecycle on TrustChain is now fully recorded from factory floor to patient hands.
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center text-slate-500 space-y-3 py-12">
                  <Pill className="w-16 h-16 mx-auto opacity-30 text-emerald-400" />
                  <p className="text-xs">Dispense a verified product to record the final-mile DISPENSED block.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
