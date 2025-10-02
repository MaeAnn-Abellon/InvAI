import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

// Resolve migrations directory relative to this file to avoid duplicate 'backend/backend' path.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '..', 'sql');

export async function runMigrations() {
  if (process.env.MIGRATIONS_DISABLE === 'true') {
    console.log('[migrations] Skipped (MIGRATIONS_DISABLE=true)');
    return;
  }

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`[migrations] Directory not found: ${MIGRATIONS_DIR} (skipping)`);
    return;
  }

  await ensureMigrationsTable();
  const files = await fs.promises.readdir(MIGRATIONS_DIR);
  const sqlFiles = files
    .filter(f => /^(\d{3})_.*\.sql$/i.test(f))
    .sort();

  for (const file of sqlFiles) {
    const already = await isApplied(file);
    if (already) {
      continue;
    }
    const fullPath = path.join(MIGRATIONS_DIR, file);
    const sql = await fs.promises.readFile(fullPath, 'utf8');
    console.log(`[migrations] Applying ${file} ...`);
    try {
      // node-postgres allows multi-statement queries when not using parameters.
      await pool.query(sql);
      await markApplied(file);
      console.log(`[migrations] Applied ${file}`);
    } catch (err) {
      console.error(`[migrations] Failed ${file}:`, err.message);
      throw err; // abort startup
    }
  }
  console.log('[migrations] All migrations up to date');
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function isApplied(filename) {
  const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename=$1 LIMIT 1', [filename]);
  return rows.length > 0;
}

async function markApplied(filename) {
  await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
}
