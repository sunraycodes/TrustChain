import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldCheck, Globe, MapPin, RefreshCw, Bot, Send, Sparkles, Cpu } from 'lucide-react';
import AlertHeatmap from '../components/AlertHeatmap';

const SUGGESTED_QUERIES = [
  'How many counterfeits were detected?',
  'Where are the hotspot locations?',
  'Which product is most targeted?',
  'Show bounty leaders',
  'What is the chain integrity status?',
  'How many unresolved incidents are there?',
];

export default function RegulatorDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // AI Co-Pilot state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: '🤖 **TrustChain AI Regulatory Co-Pilot** online. I have direct access to the live ledger, alert feed, and counterfeit incident database. Ask me anything about the current threat landscape.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const sendChatMessage = async (messageText) => {
    const text = messageText || chatInput;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Unable to process query.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Connection to AI engine failed. Please check the server.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderMarkdown = (text) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>National Drug Safety &amp; Regulatory Enforcement Portal</span>
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

      {/* Global Threat Heatmap */}
      <AlertHeatmap alerts={alerts} />

      {/* 2-column: Incidents + AI Co-Pilot */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Incidents Table */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Live Incident Stream ({alerts.length})</span>
            <span className="text-xs font-mono text-slate-500">AUTO-DISPATCHED VIA WEBHOOK &amp; SMS</span>
          </h3>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
              <p className="text-xs">No silent regulatory alerts logged yet. Run a verification check or hit "Simulate Counterfeit" in the Scan PWA tab.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
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
                    <span className="text-xs font-mono text-slate-400">{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-semibold text-rose-300">FAILED RULE: {alert.rule_failed}</div>
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

        {/* AI Regulator Co-Pilot */}
        <div className="glass-card rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900 flex flex-col overflow-hidden" style={{ minHeight: '480px' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-indigo-500/20 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Regulatory Co-Pilot</span>
              </div>
              <div className="text-[10px] text-slate-400">Connected to live ledger &amp; alert feed</div>
            </div>
            <div className="ml-auto flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '320px' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-1 mb-1 text-[10px] text-indigo-400">
                      <Cpu className="w-3 h-3" />
                      <span>TrustChain AI</span>
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  <div className={`mt-1 text-[9px] ${msg.role === 'user' ? 'text-indigo-300' : 'text-slate-500'}`}>{msg.timestamp}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Queries */}
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => sendChatMessage(q)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-2 bg-slate-900/80 border border-indigo-500/30 rounded-2xl px-3 py-2 focus-within:border-indigo-500">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask about incidents, locations, trends..."
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => sendChatMessage()}
                disabled={chatLoading || !chatInput.trim()}
                className="w-7 h-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-all"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
