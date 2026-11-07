import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { safeCopy } from '../src/copy-safety';
import { creativeBrief, runPipeline } from '../src/pipeline';
import { campaignSchema } from '../src/contracts';
import { handle } from '../src/http';
import { type Model } from '../src/ai';

test('model marketing advice is kept; copy with unverified specifics becomes a placeholder', () => {
  const kept = safeCopy({ problem: 'Hook is slow', proposedChange: 'Open on the product in use', exampleCopy: 'Your commute, finally quiet.' });
  assert.equal(kept.exampleCopy, 'Your commute, finally quiet.');
  assert.equal(kept.proposedChange, 'Open on the product in use');
  for (const risky of ['40 hours of battery', 'Now only $99', 'The best earbuds ever', 'Clinically proven comfort']) {
    const copy = safeCopy({ problem: 'Value unclear', proposedChange: 'x', exampleCopy: risky });
    assert.match(copy.exampleCopy, /\[/);
  }
});

test('video creatives tell the model how to read the storyboard and that audio is absent', () => {
  const brief = creativeBrief({ kind: 'video', durationSeconds: 15, frameTimes: [0.3, 2, 7.5] });
  assert.equal(brief.format, 'video ad');
  assert.match(brief.howToRead!, /0\.3s, 2\.0s, 7\.5s/);
  assert.match(brief.howToRead!, /Audio/);
  assert.equal(creativeBrief().format, 'static image ad');
});

test('video reports carry the creative and a frames-only limitation; prompts focus on marketing', async () => {
  const campaign = campaignSchema.parse({ brand: 'B', product: 'P', category: 'C', targetAudience: 'A', objective: 'O', market: 'M', language: 'en' });
  const prompts: { instruction: string; data: any }[] = [];
  const model: Model = { textModel: 't', visionModel: 't', async generate<T>(schema: z.ZodType<T>, instruction: string, data: any) {
    prompts.push({ instruction, data });
    if (instruction.startsWith('Inspect')) return schema.parse({ visibleText: '', product: 'P', offer: '', cta: '', spokenMessage: '', observedElements: [], benefits: [], claims: [], visualHierarchy: 'P', interpretations: [], ambiguities: [] });
    if (instruction.startsWith('Simulate')) return schema.parse({ firstImpression: 'x', strengths: [], objections: [], missingInformation: [], claimsRequiringVerification: [], recommendations: [], testingQuestions: [] });
    return schema.parse({ executiveSummary: 'ok', strengths: [], recommendations: [], limitations: [] });
  } };
  const creative = { kind: 'video' as const, durationSeconds: 12, frameTimes: [0, 6, 11] };
  const report = await runPipeline({ campaign, image: Buffer.from('x'), reviews: [], creative }, model, async () => {});
  assert.deepEqual(report.creative, creative);
  assert.ok(report.limitations.some(l => /sampled frames/.test(l)));
  assert.match(prompts[0].instruction, /storyboard/);
  const persona = prompts.find(p => p.instruction.startsWith('Simulate'))!;
  assert.match(persona.instruction, /never whether the product itself is good/);
  assert.equal(persona.data.format.format, 'video ad');
});

test('anonymous video uploads are rejected before any database access', async () => {
  const form = new FormData(); form.set('file', new Blob(['x']), 'storyboard.jpg');
  const id = '00000000-0000-4000-8000-000000000000';
  const response = await handle(new Request(`http://localhost/api/analyses/${id}/video?duration=10`, { method: 'POST', body: form }), ['analyses', id, 'video']);
  assert.equal(response.status, 401);
});

import { transcribe, transcriptForPrompt } from '../src/transcription';
const wav = (bytes = 1000) => { const b = Buffer.alloc(44 + bytes); b.write('RIFF', 0, 'ascii'); b.write('WAVE', 8, 'ascii'); return b; };

test('Whisper segments are kept with timestamps; silence hallucinations are dropped; key stays private', async () => {
  const old = process.env.GROQ_API_KEY; process.env.GROQ_API_KEY = 'secret-key';
  try {
    let sent: FormData | undefined;
    const fetcher = (async (_url: string, init: RequestInit) => { sent = init.body as FormData; return Response.json({ text: 'x', language: 'english', segments: [
      { start: 0, end: 2.44, text: ' Meet the new AuraWave. ', no_speech_prob: 0.01 },
      { start: 2.44, end: 5, text: ' Thank you for watching.', no_speech_prob: 0.9 },
      { start: 5, end: 7.1, text: 'Shop now.', no_speech_prob: 0.05 },
    ] }); }) as typeof fetch;
    const t = await transcribe(wav(), 'GROQ_API_KEY', fetcher);
    assert.equal(t.text, 'Meet the new AuraWave. Shop now.');
    assert.deepEqual(t.segments.map(s => s.start), [0, 5]);
    assert.equal(sent!.get('response_format'), 'verbose_json');
    assert.ok(!JSON.stringify(t).includes('secret-key'));
    assert.equal(transcriptForPrompt(t), '[0.0-2.4s] Meet the new AuraWave.\n[5.0-7.1s] Shop now.');
    const silent = await transcribe(wav(), 'GROQ_API_KEY', (async () => Response.json({ text: 'Thanks!', segments: [{ start: 0, end: 3, text: 'Thanks!', no_speech_prob: 0.95 }] })) as typeof fetch);
    assert.equal(silent.text, '');
    await assert.rejects(transcribe(Buffer.from('not audio'), 'GROQ_API_KEY', fetcher), /WAV/);
  } finally { if (old === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = old; }
});

test('video prompts receive the spoken transcript, or are told there is no speech', () => {
  const transcript = { text: 'Shop now.', segments: [{ start: 5, end: 7, text: 'Shop now.' }], model: 'whisper' };
  const withSpeech = creativeBrief({ kind: 'video', durationSeconds: 10, frameTimes: [0, 5], audio: 'transcribed', transcript });
  assert.match(withSpeech.spokenTranscript!, /\[5\.0-7\.0s\] Shop now\./);
  assert.match(withSpeech.howToRead!, /speech and visuals/);
  const music = creativeBrief({ kind: 'video', durationSeconds: 10, frameTimes: [0, 5], audio: 'no_speech' });
  assert.equal(music.spokenTranscript, undefined);
  assert.match(music.howToRead!, /no detectable speech/);
});

import { polishTranscript } from '../src/transcription';
import { withLanguage } from '../src/pipeline';

test('transcript proofreading fixes grammar and brand spelling but rejects rewrites, keeping timestamps', async () => {
  const raw = { text: 'x', model: 'w', language: 'English', segments: [
    { start: 0, end: 2, text: 'tired of noisy commutes meet aura wave pro' },
    { start: 2, end: 4, text: 'tap shop now' },
  ] };
  let seen = '';
  const fixer = { async generate<T>(schema: z.ZodType<T>, instruction: string): Promise<T> {
    seen = instruction;
    return schema.parse({ segments: [{ text: 'Tired of noisy commutes? Meet AuraWave Pro.' }, { text: 'Buy the best earbuds in the world today with a huge discount, only this week!' }] });
  } };
  const out = await polishTranscript(raw, { brand: 'AuraWave', product: 'AuraWave Pro' }, fixer);
  assert.equal(out.segments[0].text, 'Tired of noisy commutes? Meet AuraWave Pro.');
  assert.equal(out.segments[1].text, 'tap shop now', 'a rewrite that adds content is rejected');
  assert.deepEqual(out.segments.map(s => [s.start, s.end]), [[0, 2], [2, 4]]);
  assert.equal(out.rawText, 'x');
  assert.equal(out.checked, undefined, 'not fully verified because one segment kept its raw text');
  // Live case: Whisper returned one long segment and the fix silently dropped a repeated brand mention.
  const live = { text: 'y', model: 'w', segments: [{ start: 0, end: 15, text: 'Tired of noisy commutes meet or a Wave Pro press play and the city disappears all day comfort and a case that last all week or a Wave Pro tap shop now.' }] };
  let calls = 0;
  const dropper = { async generate<T>(schema: z.ZodType<T>): Promise<T> { calls++;
    return schema.parse({ segments: [{ text: calls === 1 ? 'Tired of noisy commutes? Meet AuraWave Pro. Press play and the city disappears. All day comfort and a case that lasts all week. Tap shop now.'
      : 'Tired of noisy commutes? Meet AuraWave Pro. Press play and the city disappears. All-day comfort and a case that lasts all week. AuraWave Pro. Tap shop now.' }] }); } };
  const fixed = await polishTranscript(live, { brand: 'AuraWave', product: 'AuraWave Pro' }, dropper);
  assert.equal(calls, 2, 'the dropped brand mention triggers one retry');
  assert.equal(fixed.text.split('AuraWave').length - 1, 2);
  assert.equal(fixed.checked, true);
  assert.match(seen, /never translate/);
  const broken = { async generate(): Promise<never> { throw new Error('quota'); } };
  const kept = await polishTranscript(raw, { brand: 'A', product: 'B' }, broken);
  assert.equal(kept.segments[0].text, raw.segments[0].text);
  assert.equal(kept.checked, undefined);
});

test('every pipeline request asks for the selected output language', async () => {
  const instructions: string[] = [];
  const base: Model = { textModel: 't', visionModel: 'v', async generate<T>(schema: z.ZodType<T>, instruction: string) { instructions.push(instruction); return schema.parse({}); } };
  await withLanguage('Romanian')(base).generate(z.object({}), 'Simulate this audience member.', {});
  assert.ok(instructions[0].startsWith('Simulate this audience member.'));
  assert.match(instructions[0], /OUTPUT LANGUAGE: [\s\S]*in Romanian\./);
  assert.match(instructions[0], /enum values/);
});
