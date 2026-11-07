import { readFile, readdir } from 'node:fs/promises';
import { db } from '../src/db';

const pool = db();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(48931001)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())');
  // Apply every migration file once, in name order.
  const names = (await readdir(new URL('../migrations/', import.meta.url))).filter(n => n.endsWith('.sql')).sort();
  for (const name of names) {
    const existing = await client.query('SELECT name FROM schema_migrations WHERE name=$1', [name]);
    if (existing.rowCount) continue;
    await client.query(await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
    await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
    console.log(`Applied ${name}`);
  }
  await client.query('COMMIT');
  console.log('Database migrations applied.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
