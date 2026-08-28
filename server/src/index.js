const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const { initDatabase, query, get } = require('./db/db');

// Route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const custodyRoutes = require('./routes/custody');
const verifyRoutes = require('./routes/verify');
const alertRoutes = require('./routes/alerts');
const bountyRoutes = require('./routes/bounties');
const aiCopilotRoutes = require('./routes/aiCopilot');
const demoRoutes = require('./routes/demo');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database
initDatabase();

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'TrustChain Ledger Server', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// Mount Route Modules
// ----------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products', custodyRoutes);
app.use('/api/products', verifyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/bounties', bountyRoutes);
app.use('/api/ai', aiCopilotRoutes);
app.use('/api', demoRoutes);

const fs = require('fs');

// Serve built React client if available; otherwise serve API root status
const clientBuildPath = path.join(__dirname, '../../client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(clientBuildPath));
  // All non-API routes serve the React app (client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  // If running standalone API on Render (with React hosted on Vercel)
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      system: 'TrustChain Ledger API Server',
      message: 'TrustChain API is live. Frontend is hosted separately on Vercel.',
      endpoints: {
        health: '/api/health',
        products: '/api/products',
        verify: '/api/products/verify',
        alerts: '/api/alerts'
      }
    });
  });
}

// Start Server
app.listen(config.PORT, async () => {
  // Seed demo actors on startup
  try {
    const demoActors = [
      { id: 'MANUFACTURER_ALPHA', name: 'AstraBiotech Pharma', role: 'MANUFACTURER' },
      { id: 'DISTRIBUTOR_BETA', name: 'Global ColdChain Logistics', role: 'DISTRIBUTOR' },
      { id: 'PHARMACY_GAMMA', name: 'Apex Central Pharmacy', role: 'PHARMACY' },
      { id: 'REGULATOR_FDA', name: 'National Drug Safety Authority', role: 'REGULATOR' },
      { id: 'CONSUMER_APP', name: 'Consumer Scan PWA', role: 'CONSUMER' }
    ];
    for (const actor of demoActors) {
      const existing = await get(`SELECT id FROM actors WHERE id = ?`, [actor.id]);
      if (!existing) {
        await query(`INSERT INTO actors (id, name, role, password_hash, bounty_score) VALUES (?, ?, ?, ?, ?)`, [actor.id, actor.name, actor.role, 'demo', 0]);
      }
    }
  } catch (e) {
    console.warn('Seed on start note:', e.message);
  }

  console.log(`🚀 TrustChain Ledger Server listening on http://localhost:${config.PORT}`);
});
