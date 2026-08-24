const fs = require('fs');
const path = require('path');

const storageFile = process.env.DB_STORAGE_FILE || path.join(__dirname, '../../trustchain_data.json');

// In-memory data structures
const tables = {
  actors: [],
  products: [],
  blocks: [],
  alerts: []
};

let autoIncrementIds = {
  blocks: 1,
  alerts: 1
};

const saveToDisk = () => {
  if (process.env.SQLITE_DB_PATH === ':memory:' || process.env.NODE_ENV === 'test') {
    return;
  }
  try {
    fs.writeFileSync(storageFile, JSON.stringify({ tables, autoIncrementIds }, null, 2));
  } catch (err) {
    console.error('Failed to persist TrustChain database to disk:', err.message);
  }
};

const loadFromDisk = () => {
  if (process.env.SQLITE_DB_PATH === ':memory:' || process.env.NODE_ENV === 'test') {
    return;
  }
  if (fs.existsSync(storageFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
      if (data.tables) Object.assign(tables, data.tables);
      if (data.autoIncrementIds) Object.assign(autoIncrementIds, data.autoIncrementIds);
    } catch (err) {
      console.warn('Could not read existing storage file, starting fresh:', err.message);
    }
  }
};

// Initialize disk storage if exists
loadFromDisk();

const initDatabase = async () => {
  // Pure JS DB is ready immediately
  console.log('✅ TrustChain Storage Engine initialized successfully');
};

const query = async (sql, params = []) => {
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // Handle CREATE TABLE
  if (upper.startsWith('CREATE TABLE')) {
    return { changes: 0 };
  }

  // Handle INSERT
  if (upper.startsWith('INSERT INTO')) {
    const tableMatch = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (tableMatch) {
      const tableName = tableMatch[1].toLowerCase();
      const fields = tableMatch[2].split(',').map(f => f.trim().toLowerCase());
      
      const row = {};
      fields.forEach((field, idx) => {
        row[field] = params[idx] !== undefined ? params[idx] : null;
      });

      if (!tables[tableName]) {
        tables[tableName] = [];
      }

      if (tableName === 'blocks' || tableName === 'alerts') {
        if (!row.id) {
          row.id = autoIncrementIds[tableName]++;
        }
      }

      tables[tableName].push(row);
      saveToDisk();
      return { lastID: row.id || 0, changes: 1 };
    }
  }

  // Handle UPDATE
  if (upper.startsWith('UPDATE')) {
    const updateMatch = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+)\s+WHERE\s+(.+)/i);
    if (updateMatch) {
      const tableName = updateMatch[1].toLowerCase();
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];

      const setPlaceholdersCount = (setClause.match(/\?/g) || []).length;
      const setParamValues = params.slice(0, setPlaceholdersCount);
      const whereParamValues = params.slice(setPlaceholdersCount);

      const setAssignments = setClause.split(',').map(s => s.trim());
      const whereConditions = whereClause.split(/\s+AND\s+/i).map(c => c.trim());

      let changes = 0;
      if (tables[tableName]) {
        tables[tableName].forEach(row => {
          let whereParamIdx = 0;
          let match = true;

          whereConditions.forEach(cond => {
            const parts = cond.split('=').map(x => x.trim());
            const field = parts[0].toLowerCase();
            const valExpr = parts[1];

            let expectedVal;
            if (valExpr === '?') {
              expectedVal = whereParamValues[whereParamIdx++];
            } else if ((valExpr.startsWith("'") && valExpr.endsWith("'")) || (valExpr.startsWith('"') && valExpr.endsWith('"'))) {
              expectedVal = valExpr.slice(1, -1);
            } else {
              expectedVal = valExpr;
            }

            if (row[field] != expectedVal) {
              match = false;
            }
          });

          if (match) {
            let setParamIdx = 0;
            setAssignments.forEach(assign => {
              const parts = assign.split('=').map(x => x.trim());
              const field = parts[0].toLowerCase();
              const valExpr = parts[1];

              let newVal;
              if (valExpr === '?') {
                newVal = setParamValues[setParamIdx++];
              } else if ((valExpr.startsWith("'") && valExpr.endsWith("'")) || (valExpr.startsWith('"') && valExpr.endsWith('"'))) {
                newVal = valExpr.slice(1, -1);
              } else {
                newVal = valExpr;
              }

              row[field] = newVal;
            });
            changes++;
          }
        });
      }

      saveToDisk();
      return { changes };
    }
  }

  // Handle SELECT
  if (upper.startsWith('SELECT')) {
    const tableMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (!tableMatch) return [];

    const tableName = tableMatch[1].toLowerCase();
    let rows = tables[tableName] ? [...tables[tableName]] : [];

    // Parse WHERE clause if present
    const whereMatch = trimmed.match(/WHERE\s+(.*?)(ORDER\s+BY|LIMIT|$)/i);
    if (whereMatch) {
      const whereStr = whereMatch[1].trim();
      const whereConditions = whereStr.split(/\s+AND\s+/i);
      
      rows = rows.filter(row => {
        return whereConditions.every((cond, idx) => {
          const fieldMatch = cond.match(/([a-zA-Z0-9_]+)\s*=\s*\?/);
          if (fieldMatch) {
            const field = fieldMatch[1].toLowerCase();
            return row[field] == params[idx];
          }
          return true;
        });
      });
    }

    // Parse ORDER BY clause if present
    const orderMatch = trimmed.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)\s*(ASC|DESC)?/i);
    if (orderMatch) {
      const field = orderMatch[1].toLowerCase();
      const dir = (orderMatch[2] || 'ASC').toUpperCase();

      rows.sort((a, b) => {
        if (a[field] < b[field]) return dir === 'ASC' ? -1 : 1;
        if (a[field] > b[field]) return dir === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    // Parse LIMIT clause if present
    const limitMatch = trimmed.match(/LIMIT\s+(\d+|\?)/i);
    if (limitMatch) {
      const limitVal = limitMatch[1] === '?' ? params[params.length - 1] : parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limitVal);
    }

    return rows;
  }

  return [];
};

const get = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || undefined;
};

module.exports = {
  db: { tables },
  query,
  get,
  initDatabase
};
