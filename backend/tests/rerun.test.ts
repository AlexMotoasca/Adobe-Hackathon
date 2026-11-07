import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { db } from '../src/db';
import { handle } from '../src/http';

test('rerun copies inputs into a fresh queued analysis and preserves the original', { skip: !process.env.RUN_RERUN_DB_TEST }, async () => {
  const pool = db();
  const client = await pool.connect();
  const originalQuery = pool.query;
  const oldKey = process.env.GROQ_API_KEY;
  try {
    // Route all repository calls through this uncommitted transaction. The worker
    // cannot see these fixtures, and rollback removes every test write.
    pool.query = client.query.bind(client) as typeof pool.query;
    process.env.GROQ_API_KEY = 'test-only';
    await client.query('BEGIN');
    const id = randomUUID();
    await client.query(`INSERT INTO analyses(id,campaign,image,image_type,status,stage,outputs,report)
      VALUES($1,$2::jsonb,$3,'image/jpeg','completed','completed','{"ad":{"test":true}}','{"test":true}')`,
    [id, JSON.stringify({ product: 'Rerun fixture' }), Buffer.from('saved-image')]);
    const post = (id: string) => handle(new Request(`http://localhost/api/analyses/${id}/rerun`, { method: 'POST' }), ['analyses', id, 'rerun']);
    const response = await post(id);
    assert.equal(response.status, 202);
    const copy = await response.json();
    assert.notEqual(copy.id, id);
    const { rows: [fresh] } = await client.query('SELECT * FROM analyses WHERE id=$1', [copy.id]);
    assert.equal(fresh.status, 'queued');
    assert.equal(fresh.image.toString(), 'saved-image');
    assert.deepEqual(fresh.outputs, {});
    assert.equal(fresh.report, null);
    const { rows: [old] } = await client.query('SELECT * FROM analyses WHERE id=$1', [id]);
    assert.equal(old.status, 'completed');
    assert.deepEqual(old.report, { test: true });
    assert.equal((await post(copy.id)).status, 409);
    assert.equal((await post(randomUUID())).status, 404);
  } finally {
    await client.query('ROLLBACK');
    pool.query = originalQuery;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey;
    client.release();
    await pool.end();
  }
});
