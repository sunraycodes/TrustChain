import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ConsumerVerifyPWA from './pages/ConsumerVerifyPWA';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import RegulatorDashboard from './pages/RegulatorDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('consumer');
  const [selectedProductId, setSelectedProductId] = useState('MED-789204-X');

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'consumer' && <ConsumerVerifyPWA selectedProductId={selectedProductId} />}
        {activeTab === 'manufacturer' && <ManufacturerDashboard />}
        {activeTab === 'distributor' && <DistributorDashboard />}
        {activeTab === 'regulator' && <RegulatorDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        TrustChain SHA-256 Ledger Mesh • OmniCyberTech OMNIKON 2026
      </footer>
    </div>
  );
}
