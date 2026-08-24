import React, { useState } from 'react';
import { Truck, ArrowRight, ShieldCheck, Thermometer, MapPin, Key } from 'lucide-react';

export default function DistributorDashboard() {
  const [formData, setFormData] = useState({
    product_id: 'MED-789204-X',
    event_type: 'CUSTODY_TRANSFER',
    actor_id: 'DISTRIBUTOR_BETA',
    latitude: '28.7041',
    longitude: '77.1025',
    location_name: 'Delhi Cold Chain Hub, India',
    temp_celsius: '4.5',
    humidity_pct: '52.0',
    counter_signatures: '["sig_distributor_beta_key", "sig_peer_node_88"]'
  });

  const [loading, setLoading] = useState(false);
  const [resultBlock, setResultBlock] = useState(null);
  const [msg, setMsg] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      let parsedSigs = [];
      try {
        parsedSigs = JSON.parse(formData.counter_signatures);
      } catch (e) {
        parsedSigs = [formData.counter_signatures];
      }

      const res = await fetch('/api/products/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          temp_celsius: parseFloat(formData.temp_celsius),
          humidity_pct: parseFloat(formData.humidity_pct),
          counter_signatures: parsedSigs
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResultBlock(data.block);
        setMsg('✅ Custody transfer block appended to hash-chain successfully!');
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setMsg(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Distributor & Pharmacy Handoff Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Record Custody Transfer & Swarm Consensus</h1>
          <p className="text-sm text-slate-400 mt-1">
            Append multi-signed physical custody blocks with cold-chain sensor readings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form */}
        <form onSubmit={handleTransfer} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Transfer Block Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Product ID</label>
            <input
              type="text"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Event Type</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              >
                <option value="CUSTODY_TRANSFER">CUSTODY_TRANSFER</option>
                <option value="QUALITY_CHECK">QUALITY_CHECK</option>
                <option value="RETAIL_RECEIPT">RETAIL_RECEIPT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Actor ID</label>
              <input
                type="text"
                value={formData.actor_id}
                onChange={(e) => setFormData({ ...formData, actor_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Location Description</label>
            <input
              type="text"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.temp_celsius}
                onChange={(e) => setFormData({ ...formData, temp_celsius: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.humidity_pct}
                onChange={(e) => setFormData({ ...formData, humidity_pct: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Swarm Counter-Signatures (JSON array)</label>
            <input
              type="text"
              value={formData.counter_signatures}
              onChange={(e) => setFormData({ ...formData, counter_signatures: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 glow-blue"
          >
            <Truck className="w-4 h-4" />
            <span>{loading ? 'Appending Transfer Block...' : 'Append Custody Transfer Block'}</span>
          </button>

          {msg && <div className="p-3 rounded-xl bg-slate-900 text-xs font-medium text-slate-200">{msg}</div>}
        </form>

        {/* Output Preview */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
              Appended Custody Block Preview
            </h3>

            {resultBlock ? (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30">
                  <div className="text-[10px] text-slate-500">BLOCK INDEX</div>
                  <div className="text-lg font-bold text-cyan-400">#{resultBlock.block_index}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">NEW BLOCK DATA HASH (SHA-256):</span>
                    <span className="text-emerald-400 break-all text-[11px]">{resultBlock.data_hash}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">PREVIOUS BLOCK HASH:</span>
                    <span className="text-slate-400 break-all text-[11px]">{resultBlock.previous_block_hash}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-slate-500 space-y-3 py-12">
                <Truck className="w-16 h-16 mx-auto opacity-30 text-cyan-400" />
                <p className="text-xs">Fill out handoff details to record a new custody block on the immutable hash chain.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
