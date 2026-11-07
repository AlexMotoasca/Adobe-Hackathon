import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { translateUi } from '../src/i18n';
import { type Model } from '../src/ai';

test('UI labels translate once per language, keep placeholders, and come from cache afterwards', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mm-i18n-'));
  const old = process.env.MEDIA_DIR; process.env.MEDIA_DIR = join(dir, 'media');
  let calls = 0;
  const model: Model = { textModel: 't', visionModel: 'v', async generate<T>(schema: z.ZodType<T>, instruction: string, data: any) {
    calls++;
    assert.match(instruction, /into Romanian/);
    return schema.parse({ translations: data.strings.map((s: string) => s === '{n} concerns' ? '{n} obiecții' : s === 'Frame {n}' ? 'Cadru' : 'RO ' + s) });
  } };
  try {
    const input = { language: 'Romanian', strings: ['What to improve', '{n} concerns', 'Frame {n}'] };
    const first = await translateUi(input, model);
    assert.equal(first.strings['What to improve'], 'RO What to improve');
    assert.equal(first.strings['{n} concerns'], '{n} obiecții');
    assert.equal(first.strings['Frame {n}'], 'Frame {n}', 'a translation that loses a placeholder falls back to English');
    const second = await translateUi(input, model);
    assert.equal(calls, 1);
    assert.equal(second.cached, true);
    const english = await translateUi({ language: 'English', strings: ['Hi'] }, model);
    assert.equal(english.strings.Hi, 'Hi');
    assert.equal(calls, 1);
  } finally {
    if (old === undefined) delete process.env.MEDIA_DIR; else process.env.MEDIA_DIR = old;
    await rm(dir, { recursive: true, force: true });
  }
});
