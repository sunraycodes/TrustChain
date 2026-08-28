import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, ShieldAlert, AlertOctagon, RefreshCw, Zap, Dna, CheckCircle, MapPin, Sparkles, Wifi, Radio } from 'lucide-react';
import VerificationMesh from '../components/VerificationMesh';
import ChainTimeline from '../components/ChainTimeline';
import QRScanner from '../components/QRScanner';
import BountyLeaderboard from '../components/BountyLeaderboard';

export default function ConsumerVerifyPWA({ selectedProductId = 'MED-789204-X' }) {
  const [productId, setProductId] = useState(selectedProductId);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [chain, setChain] = useState([]);
  const [simulateMode, setSimulateMode] = useState(false);
  const [scanMode, setScanMode] = useState('qr'); // 'qr' | 'nfc'
  const [nfcState, setNfcState] = useState('idle'); // 'idle' | 'scanning' | 'read'

  useEffect(() => {
    fetchVerification();
    fetchChain();
  }, [productId]);

  const fetchVerification = async (isCounterfeitSimulation = false) => {
    setLoading(true);
    try {
      if (isCounterfeitSimulation) {
        const res = await fetch('/api/demo/simulate-counterfeit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        setVerificationResult(data.result);
        setSimulateMode(true);
      } else {
        const res = await fetch('/api/products/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            actor_id: 'CONSUMER_PWA_USER',
            latitude: 28.6139,
            longitude: 77.2090
          })
        });
        const data = await res.json();
        setVerificationResult(data);
        setSimulateMode(false);
      }
    } catch (err) {
      console.error('Verification query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChain = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/chain`);
      if (res.ok) {
        const data = await res.json();
        setChain(data.chain || []);
      }
    } catch (err) {
      console.error('Chain fetch error:', err);
    }
  };

  const handleQRScan = (scannedData) => {
    // QR code may contain a product ID directly or a URL with the ID
    let extractedId = scannedData;
    // Try to extract product ID from URL format: https://trustchain.app/verify/MED-789204-X
    const urlMatch = scannedData.match(/verify\/([A-Z0-9-]+)/i);
    if (urlMatch) {
      extractedId = urlMatch[1];
    }
    setProductId(extractedId);
  };

  const isGenuine = verificationResult?.genuine;
  const isSpoiled = verificationResult?.status === 'SPOILED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Consumer & Pharmacist Instant Verification PWA</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Scan & Verify Product Authenticity</h1>
            <p className="text-sm text-slate-400 mt-1">
              Evaluating 4 independent physical & cryptographic trust layers in under 500ms
            </p>
          </div>

          {/* Product Selector Input */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono w-full sm:w-40 focus:outline-none focus:border-emerald-500"
              placeholder="Enter Product ID"
            />
            <button
              onClick={() => fetchVerification(false)}
              disabled={loading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scan Mode Toggle */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Radio className="w-4 h-4" />
            <span>Scan Method</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setScanMode('qr')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scanMode === 'qr' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Camera QR</span>
            </button>
            <button
              onClick={() => { setScanMode('nfc'); setNfcState('idle'); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scanMode === 'nfc' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>NFC Tap</span>
            </button>
          </div>
        </div>

        {scanMode === 'qr' ? (
          <QRScanner onScan={handleQRScan} disabled={loading} />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            {/* NFC Radar Animation */}
            <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
              {/* Ripple rings */}
              {nfcState === 'scanning' && [1, 2, 3].map(i => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-cyan-400/40"
                  style={{
                    width: 60 + i * 40,
                    height: 60 + i * 40,
                    animation: `ping 1.5s ease-out ${i * 0.3}s infinite`,
                    opacity: 0
                  }}
                />
              ))}
              {/* Core NFC icon */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                nfcState === 'read' ? 'bg-emerald-500 shadow-emerald-500/30 scale-110' :
                nfcState === 'scanning' ? 'bg-cyan-600 shadow-cyan-500/30 animate-pulse' :
                'bg-slate-800 border border-slate-700'
              }`}>
                <Wifi className={`w-10 h-10 ${
                  nfcState === 'read' ? 'text-white' :
                  nfcState === 'scanning' ? 'text-white' :
                  'text-slate-500'
                }`} />
              </div>
            </div>

            <div className="text-center space-y-1">
              {nfcState === 'idle' && (
                <>
                  <div className="text-sm font-bold text-slate-300">Ready to Tap</div>
                  <div className="text-xs text-slate-500">Hold device near the product&apos;s NFC tamper seal</div>
                </>
              )}
              {nfcState === 'scanning' && (
                <>
                  <div className="text-sm font-bold text-cyan-400 animate-pulse">Reading NFC Tag...</div>
                  <div className="text-xs text-slate-400">Authenticating tamper seal & physical fingerprint</div>
                </>
              )}
              {nfcState === 'read' && (
                <>
                  <div className="text-sm font-bold text-emerald-400">✅ NFC Tag Read Successfully</div>
                  <div className="text-xs text-slate-400 font-mono">{productId}</div>
                </>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setNfcState('scanning');
                  setTimeout(() => {
                    setNfcState('read');
                    fetchVerification(false);
                  }, 2000);
                }}
                disabled={nfcState === 'scanning' || loading}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all"
              >
                <Wifi className="w-4 h-4" />
                <span>{nfcState === 'scanning' ? 'Reading...' : 'Simulate NFC Tap'}</span>
              </button>
              {nfcState !== 'idle' && (
                <button
                  onClick={() => setNfcState('idle')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pitch Demonstration Trigger */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">Live Pitch Scenario Trigger</div>
            <p className="text-xs text-slate-300">Simulate a cloned QR scan with packaging DNA mismatch + impossible travel speed</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchVerification(false)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              !simulateMode
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Genuine Scan
          </button>
          <button
            onClick={() => fetchVerification(true)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              simulateMode
                ? 'bg-rose-500 border-rose-600 text-white shadow-lg glow-rose'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
            }`}
          >
            🚨 Simulate Counterfeit
          </button>
        </div>
      </div>

      {/* Verification Status Hero Card */}
      {verificationResult && (
        <div
          className={`glass-card rounded-3xl p-6 border transition-all duration-500 ${
            isGenuine && !isSpoiled
              ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900 glow-emerald'
              : isSpoiled
              ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-slate-900'
              : 'border-rose-500/50 bg-gradient-to-b from-rose-950/40 to-slate-900 glow-rose'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl ${
                  isGenuine && !isSpoiled
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : isSpoiled
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse'
                }`}
              >
                {isGenuine && !isSpoiled ? (
                  <ShieldCheck className="w-10 h-10" />
                ) : isSpoiled ? (
                  <AlertOctagon className="w-10 h-10" />
                ) : (
                  <ShieldAlert className="w-10 h-10" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      isGenuine && !isSpoiled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isSpoiled
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    STATUS: {verificationResult.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {productId}</span>
                </div>

                <h2 className="text-xl font-bold text-white mt-1">
                  {verificationResult.product_name || 'Pharmaceutical Batch Product'}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl font-medium">
                  {verificationResult.summary}
                </p>
              </div>
            </div>

            <div className="text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Ledger Block Index</div>
                <div className="text-lg font-mono font-bold text-emerald-400">#{verificationResult.latest_block?.block_index || 0}</div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] uppercase font-bold text-slate-500">Scan Timestamp</div>
                <div className="text-xs font-mono text-slate-300">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {!isGenuine && (
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Silent Regulatory Trip-Wire Triggered:</strong> Background alert dispatched to National Regulatory Authorities with exact GPS location ({verificationResult.latest_block?.latitude || 28.61}, {verificationResult.latest_block?.longitude || 77.20}) and batch audit history.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2 glow-amber animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Community Trust Mesh Alert:</strong> You have been awarded a Trust Score Bounty (+50 pts) for protecting the community and reporting this suspicious scan.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4-Layer Physical-Digital Trust Mesh */}
      {verificationResult && (
        <VerificationMesh layers={verificationResult.layers} status={verificationResult.status} />
      )}

      {/* Immutable Ledger Timeline */}
      <ChainTimeline chain={chain} />

      {/* Community Bounty Leaderboard */}
      <div className="pt-6">
        <BountyLeaderboard />
      </div>

    </div>
  );
}
