import pg from 'pg';

const globalDb = globalThis as unknown as { mindmarketPool?: pg.Pool };
export function db(): pg.Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  return globalDb.mindmarketPool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL, max: 8,
    connectionTimeoutMillis: 5000, statement_timeout: 15000,
  });
}
