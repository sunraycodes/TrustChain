import React, { useState } from 'react';
import {
  Factory,
  QrCode,
  Dna,
  Thermometer,
  Plus,
  CheckCircle,
  Copy,
  Download,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';
import { hexToBinary } from '../components/PackagingDnaAnalyzer';
import { BASE_URL } from '../services/api';

export default function ManufacturerDashboard({ token }) {
  const [formData, setFormData] = useState({
    id: `MED-${Math.floor(100000 + Math.random() * 900000)}-X`,
    batch_id: `BATCH-2026-${Math.floor(10 + Math.random() * 90)}`,
    name: 'LifeSave Anti-Vira 500mg',
    manufacturer_id: 'MANUFACTURER_ALPHA',
    initial_phash: 'a8f9c13b21e45678',
    min_temp: '2.0',
    max_temp: '8.0',
    location_name: 'PharmaCorp Manufacturing Facility, New Delhi'
  });

  const [createdProduct, setCreatedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Substrate presets
  const SUBSTRATES = [
    { id: 'sub_1', name: 'Micro-Fiber Security Paper', phash: 'a8f9c13b21e45678' },
    { id: 'sub_2', name: 'Holographic Guilloche Substrate', phash: 'd4e2f89012ab34cd' },
    { id: 'sub_3', name: 'Fluorescent Embedded Fibers', phash: '7c8b9a01ef234567' }
  ];

  const generateRandomDna = () => {
    let randHex = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 16; i++) {
      randHex += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, initial_phash: randHex }));
  };

  const binaryBits = hexToBinary(formData.initial_phash);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch(`${BASE_URL}/products/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token || localStorage.getItem('trustchain_token') ? { Authorization: `Bearer ${token || localStorage.getItem('trustchain_token')}` } : {})
        },
        body: JSON.stringify({
          ...formData,
          min_temp: parseFloat(formData.min_temp),
          max_temp: parseFloat(formData.max_temp),
          latitude: 28.6139,
          longitude: 77.2090
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedProduct(data);
        setMsg('✅ Genesis Block appended to TrustChain ledger successfully!');
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
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Factory className="w-4 h-4" />
            <span>Manufacturer Genesis Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Batch & Product Genesis Registration</h1>
          <p className="text-sm text-slate-400 mt-1">
            Bind packaging micro-textures and cold-chain baselines directly into SHA-256 genesis blocks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Genesis Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Product ID (Serialized)</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Batch Number</label>
            <input
              type="text"
              value={formData.batch_id}
              onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400">Packaging DNA Micro-Texture</label>
              <button
                type="button"
                onClick={generateRandomDna}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate Unique Seed</span>
              </button>
            </div>

            {/* Substrate Presets */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {SUBSTRATES.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, initial_phash: sub.phash })}
                  className={`p-1.5 rounded-lg border text-[10px] text-left transition-all truncate ${
                    formData.initial_phash === sub.phash
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={formData.initial_phash}
              onChange={(e) => setFormData({ ...formData, initial_phash: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none mb-2"
              placeholder="16-character hex hash (64-bit)"
              required
            />

            {/* Live 8x8 Master Matrix Preview */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Genesis DNA 8×8 Bit Blueprint</span>
                <span className="text-emerald-400 font-bold">64 Bits</span>
              </div>
              <div className="grid grid-cols-8 gap-1 max-w-[160px]">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[3px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[8px] font-mono flex items-center justify-center font-bold"
                  >
                    {binaryBits[i] || '0'}
                  </div>
                ))}
              </div>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Min Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.min_temp}
                onChange={(e) => setFormData({ ...formData, min_temp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Max Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.max_temp}
                onChange={(e) => setFormData({ ...formData, max_temp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 glow-emerald"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Creating Genesis Block...' : 'Append Genesis Block to Ledger'}</span>
          </button>

          {msg && <div className="p-3 rounded-xl bg-slate-900 text-xs font-medium text-slate-200">{msg}</div>}
        </form>

        {/* QR Code & Genesis Output Preview */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
              Generated QR & Genesis Ledger Certificate
            </h3>

            {createdProduct ? (
              <div className="mt-4 space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Product Serial Number</div>
                    <div className="text-sm font-bold text-emerald-400">{createdProduct.product.id}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{createdProduct.product.name}</div>
                  </div>
                  <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-950" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-slate-400">
                    <span className="text-slate-500 block text-[10px]">GENESIS BLOCK DATA HASH:</span>
                    <span className="text-emerald-400 break-all text-[11px]">{createdProduct.genesis_block.data_hash}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500 block text-[10px]">PACKAGING DNA PHASH:</span>
                    <span className="text-cyan-300 text-[11px]">{createdProduct.genesis_block.fingerprint_hash}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-slate-500 space-y-3 py-12">
                <QrCode className="w-16 h-16 mx-auto opacity-30 text-emerald-400" />
                <p className="text-xs">Fill out parameters and append Genesis Block to generate printable physical QR certificate.</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400">
            💡 <strong>Security Note:</strong> The perceptual micro-texture hash (`pHash`) binds the packaging paper/ink texture to the QR code. Even if copied, cloned labels on different packaging fail micro-texture match!
          </div>
        </div>

      </div>
    </div>
  );
}
