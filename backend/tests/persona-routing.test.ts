import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { compactEvidence } from '../src/evidence';
import { personaLanes } from '../src/persona-routing';
import { GroqModel, type Model } from '../src/ai';

test('compact evidence is bounded and always an original contiguous excerpt', () => {
  const reviews = Array.from({ length: 20 }, (_, i) => ({ id: `r${i}`, text: 'Introduction. '.repeat(100) + 'Battery durability and quality matter. '.repeat(80), source: 'test', relevance: 'category' as const }));
  const selected = compactEvidence(reviews, 'battery durability');
  assert.equal(selected.length, 6);
  assert.ok(selected.every(r => r.text.length <= 900 && reviews.find(s => s.id === r.id)!.text.includes(r.text)));
  assert.ok(selected.every(r => r.text.includes('Battery')));
  assert.ok(reviews[0].text.length > 900);
});

test('team routes are fixed, missing keys fail, and credentials stay out of serialized models', async () => {
  const names = ['GROQ_PERSONA_ROUTING', 'GROQ_API_KEY', 'GROQ_TEAM_2_API_KEY', 'GROQ_TEAM_3_API_KEY'];
  const previous = names.map(name => process.env[name]);
  const fetcher = globalThis.fetch;
  try {
    process.env.GROQ_PERSONA_ROUTING = 'team';
    process.env.GROQ_API_KEY = 'test-one';
    delete process.env.GROQ_TEAM_2_API_KEY;
    assert.throws(() => personaLanes(new GroqModel()), /three configured/);
    process.env.GROQ_TEAM_2_API_KEY = 'test-two';
    process.env.GROQ_TEAM_3_API_KEY = 'test-three';
    const lanes = personaLanes(new GroqModel());
    assert.deepEqual(lanes.map(l => l.personas), [['skeptic'], ['impulsive', 'bargain'], ['quality', 'rational']]);
    const headers: string[] = [];
    globalThis.fetch = async (_url, init) => {
      headers.push(new Headers(init?.headers).get('Authorization')!);
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"ok":true}' } }] });
    };
    for (const lane of lanes) await lane.model.generate(z.object({ ok: z.boolean() }), 'Test', {});
    assert.deepEqual(headers, ['Bearer test-one', 'Bearer test-two', 'Bearer test-three']);
    assert.ok(!JSON.stringify(lanes).includes('test-two'));
  } finally {
    globalThis.fetch = fetcher;
    names.forEach((name, i) => { if (previous[i] === undefined) delete process.env[name]; else process.env[name] = previous[i]; });
  }
});

test('a rate-limited model falls back to the next model on the same key, never another key', async () => {
  const fetcher = globalThis.fetch;
  const old = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'key-one';
  const calls: { model: string; auth: string }[] = [];
  try {
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(init!.body as string);
      calls.push({ model: body.model, auth: new Headers(init!.headers).get('Authorization')! });
      if (body.model === 'big') return new Response('{}', { status: 429, headers: { 'retry-after': '1000' } });
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"ok":true}' } }] });
    };
    const model = new GroqModel();
    model.textModel = 'big'; model.fallbackModels = ['small', 'tiny'];
    assert.deepEqual(await model.generate(z.object({ ok: z.boolean() }), 'Test', {}), { ok: true });
    assert.deepEqual(calls.map(c => c.model), ['big', 'small']);
    assert.ok(calls.every(c => c.auth === 'Bearer key-one'));
  } finally {
    globalThis.fetch = fetcher;
    if (old === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = old;
  }
});
