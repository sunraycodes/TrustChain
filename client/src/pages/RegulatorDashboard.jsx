import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, MapPin, RefreshCw, Eye, CheckCircle2, Clock } from 'lucide-react';

export default function RegulatorDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Alerts query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>National Drug Safety & Regulatory Enforcement Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Silent Regulatory Trip-Wire Incident Feed</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-world silent alerts dispatched when counterfeit scans or impossible-travel anomalies occur
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 glow-rose">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Total Silent Trip-Wire Alerts</div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">{alerts.length}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Intercept opportunities logged before sale</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Critical Severity Incidents</div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {alerts.filter(a => a.severity === 'CRITICAL').length}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">Cloned QR or Packaging DNA mismatch</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Enforcement Interception Rate</div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">100%</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Counterfeiter unalerted at point of sale</div>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Live Incident Stream ({alerts.length})</span>
          <span className="text-xs font-mono text-slate-500">AUTO-DISPATCHED VIA WEBHOOK & SMS</span>
        </h3>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
            <p className="text-xs">No silent regulatory alerts logged yet. Run a verification check or hit "Simulate Counterfeit" in the Scan PWA tab.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold font-mono text-white">Product: {alert.product_id}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </span>
                </div>

                <div className="text-xs font-semibold text-rose-300">
                  FAILED RULE: {alert.rule_failed}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Geolocation: {alert.latitude}, {alert.longitude}</span>
                  </div>

                  <span className="text-slate-500">Scanner Actor: {alert.actor_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
