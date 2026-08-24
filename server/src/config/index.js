require('dotenv').config();

const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'trustchain_dev_secret_omnikon_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_STORAGE_FILE: process.env.DB_STORAGE_FILE || undefined, // Falls back to db.js default
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
