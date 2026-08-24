-- TrustChain Database Schema (PostgreSQL / SQLite compatible)

CREATE TABLE IF NOT EXISTS actors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR', 'CONSUMER')),
  public_key TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  manufacturer_id VARCHAR(64) NOT NULL REFERENCES actors(id),
  initial_phash VARCHAR(255) NOT NULL,
  min_temp REAL DEFAULT 2.0,
  max_temp REAL DEFAULT 8.0,
  status VARCHAR(50) DEFAULT 'GENUINE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_index INTEGER NOT NULL,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id),
  event_type VARCHAR(50) NOT NULL,
  actor_id VARCHAR(64) NOT NULL REFERENCES actors(id),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  location_name VARCHAR(255),
  timestamp VARCHAR(64) NOT NULL,
  temp_celsius REAL,
  humidity_pct REAL,
  fingerprint_hash VARCHAR(255) NOT NULL,
  counter_signatures TEXT, -- JSON string array
  previous_block_hash VARCHAR(255) NOT NULL,
  data_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id VARCHAR(64) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  rule_failed VARCHAR(100) NOT NULL,
  latitude REAL,
  longitude REAL,
  actor_id VARCHAR(64),
  details TEXT,
  created_at VARCHAR(64) NOT NULL,
  resolved INTEGER DEFAULT 0
);
