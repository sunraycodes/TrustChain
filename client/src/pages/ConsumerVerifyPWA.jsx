import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  RefreshCw,
  Zap,
  Dna,
  CheckCircle,
  MapPin,
  Sparkles,
  Camera
} from 'lucide-react';
import VerificationMesh from '../components/VerificationMesh';
import ChainTimeline from '../components/ChainTimeline';
import QRScanner from '../components/QRScanner';
import PackagingDnaAnalyzer from '../components/PackagingDnaAnalyzer';

export default function ConsumerVerifyPWA({ selectedProductId = 'MED-789204-X' }) {
  const [productId, setProductId] = useState(selectedProductId);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [chain, setChain] = useState([]);
  const [simulateMode, setSimulateMode] = useState(false);
  const [scanTab, setScanTab] = useState('qr'); // 'qr' | 'dna'
  const [activeScannedPhash, setActiveScannedPhash] = useState(null);

  useEffect(() => {
    fetchVerification(false, activeScannedPhash);
    fetchChain();
  }, [productId]);

  const fetchVerification = async (isCounterfeitSimulation = false, customPhash = null) => {
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
        const phashToSend = customPhash !== undefined ? customPhash : activeScannedPhash;
        const res = await fetch('/api/products/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            actor_id: 'CONSUMER_PWA_USER',
            latitude: 28.6139,
            longitude: 77.2090,
            scanned_phash: phashToSend || undefined
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
    const urlMatch = scannedData.match(/verify\/([A-Z0-9-]+)/i);
    if (urlMatch) {
      extractedId = urlMatch[1];
    }
    setProductId(extractedId);
  };

  const handleSelectDnaPhash = (phash) => {
    setActiveScannedPhash(phash);
    fetchVerification(false, phash);
  };

  const isGenuine = verificationResult?.genuine;
  const isSpoiled = verificationResult?.status === 'SPOILED';
  const baselineGenesisPhash =
    verificationResult?.layers?.packagingDna?.baselinePhash ||
    chain[0]?.fingerprint_hash ||
    'a8f9c13b21e45678';

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
              onClick={() => fetchVerification(false, activeScannedPhash)}
              disabled={loading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Scanner Interface (QR Code & Packaging DNA) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setScanTab('qr')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                scanTab === 'qr'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>1. Scan QR Code</span>
            </button>

            <button
              onClick={() => setScanTab('dna')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                scanTab === 'dna'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dna className="w-4 h-4" />
              <span>2. Scan Packaging DNA (pHash)</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Unclonable Dual Physical-Digital Verification
          </span>
        </div>

        {scanTab === 'qr' ? (
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              <QrCode className="w-4 h-4" />
              <span>Camera QR Scanner</span>
            </div>
            <QRScanner onScan={handleQRScan} disabled={loading} />
          </div>
        ) : (
          <PackagingDnaAnalyzer
            baselinePhash={baselineGenesisPhash}
            currentScannedPhash={activeScannedPhash}
            onSelectScannedPhash={handleSelectDnaPhash}
          />
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
            onClick={() => fetchVerification(false, activeScannedPhash)}
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
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Silent Regulatory Trip-Wire Triggered:</strong> Background alert dispatched to National Regulatory Authorities with exact GPS location ({verificationResult.latest_block?.latitude || 28.61}, {verificationResult.latest_block?.longitude || 77.20}) and batch audit history.
              </span>
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

    </div>
  );
}
