import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ConsumerVerifyPWA from './pages/ConsumerVerifyPWA';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import RegulatorDashboard from './pages/RegulatorDashboard';
import { login as apiLogin, logout as apiLogout, getCurrentUser, getToken } from './services/api';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('consumer');
  const [selectedProductId, setSelectedProductId] = useState('MED-789204-X');

  // Auth state
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [token, setToken] = useState(getToken());
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ actor_id: '', password: 'password123' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Roles that require auth
  const protectedTabs = ['manufacturer', 'distributor', 'pharmacy', 'regulator'];

  const handleTabChange = (tab) => {
    // If navigating to a protected tab without auth, show login modal
    if (protectedTabs.includes(tab) && !currentUser) {
      setShowLogin(true);
      // Pre-select actor based on tab
      const actorMap = {
        manufacturer: 'MANUFACTURER_ALPHA',
        distributor: 'DISTRIBUTOR_BETA',
        pharmacy: 'PHARMACY_GAMMA',
        regulator: 'REGULATOR_FDA'
      };
      setLoginForm(prev => ({ ...prev, actor_id: actorMap[tab] || '' }));
      setActiveTab(tab);
      return;
    }
    setActiveTab(tab);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await apiLogin(loginForm.actor_id, loginForm.password);
      setCurrentUser(data.actor);
      setToken(data.token);
      setShowLogin(false);
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setToken(null);
    setActiveTab('consumer');
  };

  const demoActors = [
    { id: 'MANUFACTURER_ALPHA', name: 'AstraBiotech Pharma', role: 'MANUFACTURER' },
    { id: 'DISTRIBUTOR_BETA', name: 'Global ColdChain Logistics', role: 'DISTRIBUTOR' },
    { id: 'PHARMACY_GAMMA', name: 'Apex Central Pharmacy', role: 'PHARMACY' },
    { id: 'REGULATOR_FDA', name: 'National Drug Safety Authority', role: 'REGULATOR' }
  ];

  const needsAuth = protectedTabs.includes(activeTab) && !currentUser;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
        {needsAuth ? (
          /* Inline login prompt for protected tabs */
          <div className="max-w-md mx-auto mt-16">
            <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Authentication Required</h2>
                <p className="text-xs text-slate-400">
                  Sign in with your TrustChain actor credentials to access this portal.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Actor ID</label>
                  <select
                    value={loginForm.actor_id}
                    onChange={(e) => setLoginForm({ ...loginForm, actor_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select an actor...</option>
                    {demoActors.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                    placeholder="password123"
                  />
                  <p className="text-[10px] text-slate-600 mt-1">Demo password: password123</p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading || !loginForm.actor_id}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLoading ? 'Signing in...' : 'Sign In'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'consumer' && <ConsumerVerifyPWA selectedProductId={selectedProductId} />}
            {activeTab === 'manufacturer' && <ManufacturerDashboard token={token} />}
            {activeTab === 'distributor' && <DistributorDashboard token={token} />}
            {activeTab === 'pharmacy' && <PharmacyDashboard token={token} />}
            {activeTab === 'regulator' && <RegulatorDashboard token={token} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        TrustChain SHA-256 Ledger Mesh • OmniCyberTech OMNIKON 2026
      </footer>
    </div>
  );
}
