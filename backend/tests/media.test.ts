import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { saveVideoStream, videoResponse, copyVideo } from '../src/media';

const mp4 = (size = 5000) => { const b = Buffer.alloc(size, 7); b.write('ftypisom', 4, 'ascii'); return b; };
const stream = (buf: Buffer) => new Response(new Uint8Array(buf)).body!;

test('videos stream to disk, serve byte ranges for seeking, copy on rerun, and reject non-video', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mm-media-'));
  const old = process.env.MEDIA_DIR; process.env.MEDIA_DIR = dir;
  try {
    const id = 'a1b2c3d4-0000-4000-8000-000000000001';
    assert.equal(await saveVideoStream(id, stream(mp4()), 5000), 5000);
    const full = await videoResponse(id, 'video/mp4', null);
    assert.equal(full.status, 200);
    assert.equal(full.headers.get('Accept-Ranges'), 'bytes');
    assert.equal((await full.arrayBuffer()).byteLength, 5000);
    const part = await videoResponse(id, 'video/mp4', 'bytes=100-199');
    assert.equal(part.status, 206);
    assert.equal(part.headers.get('Content-Range'), 'bytes 100-199/5000');
    assert.equal((await part.arrayBuffer()).byteLength, 100);
    assert.equal((await videoResponse(id, 'video/mp4', 'bytes=9000-')).status, 416);
    assert.ok(await copyVideo(id, 'copy-id'));
    assert.equal((await videoResponse('copy-id', 'video/mp4', null)).status, 200);
    await assert.rejects(saveVideoStream('bad', stream(Buffer.from('<html>not a video at all</html>')), 0), /not an MP4/);
    await assert.rejects(videoResponse('bad', 'video/mp4', null), /No video/);
    await assert.rejects(saveVideoStream('big', stream(mp4()), 300 * 1024 * 1024), /200 MB/);
  } finally {
    if (old === undefined) delete process.env.MEDIA_DIR; else process.env.MEDIA_DIR = old;
    await rm(dir, { recursive: true, force: true });
  }
});
