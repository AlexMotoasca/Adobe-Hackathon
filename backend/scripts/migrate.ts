import { readFile } from 'node:fs/promises';
import { db } from '../src/db';

const pool = db();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(48931001)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())');
  const name = '001_initial.sql';
  const existing = await client.query('SELECT name FROM schema_migrations WHERE name=$1', [name]);
  if (!existing.rowCount) {
    await client.query(await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
    await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
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
