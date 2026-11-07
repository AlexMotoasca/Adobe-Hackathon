import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { z } from 'zod';
import { ingestImage, ingestReviews } from '../src/ingestion';
import { assertReferences, validateAssessments } from '../src/evidence';
import { campaignSchema, type PersonaResult } from '../src/contracts';
import { runPipeline } from '../src/pipeline';
import { GroqModel, type Model } from '../src/ai';
import { readBounded, handle } from '../src/http';

const campaign = campaignSchema.parse({ brand: 'Test', product: 'Bottle', category: 'Home', targetAudience: 'Commuters', objective: 'Awareness', market: 'RO', language: 'en' });
const persona = { persona: 'skeptic', firstImpression: 'Interesting', strengths: [], objections: [{ id: 'skeptic-1', statement: 'Durability unclear', evidenceIds: ['r1'] }], missingInformation: [], claimsRequiringVerification: [], recommendations: [], testingQuestions: [], retrievedEvidenceIds: ['r1'] } satisfies PersonaResult;

test('CSV handles BOM, quotes, duplicates and strips personal metadata', () => {
  const result = ingestReviews(Buffer.from('\uFEFFtext,source,rating,verifiedPurchase,email\n"Good, durable",store,5,true,private@example.com\n"good, durable",store,5,true,\n'), 'reviews.csv');
  assert.deepEqual(result.stats, { received: 2, accepted: 1, duplicates: 1 });
  assert.equal(result.reviews[0].text, 'Good, durable');
  assert.equal(result.reviews[0].verifiedPurchase, true);
  assert.equal('email' in result.reviews[0], false);
  assert.equal(result.reviews[0].relevance, 'unknown');
});
test('review provenance survives JSON ingestion without invented verified purchase', () => {
  const { reviews } = ingestReviews(Buffer.from(JSON.stringify([{ text: 'Useful', source: 'Customer survey', sourceUrl: 'https://example.com/reviews/1', publishedAt: '2026-11-01', relevance: 'exact_product' }])), 'reviews.json');
  assert.equal(reviews[0].sourceUrl, 'https://example.com/reviews/1');
  assert.equal(reviews[0].verifiedPurchase, undefined);
});
test('rejects malformed, oversized, empty and invalid reviews', () => {
  for (const [content, name] of [['text,text\na,b', 'a.csv'], ['text\n"unterminated', 'a.csv'], ['[]', 'a.json'], ['[{"text":"Fine","rating":8}]', 'a.json'], ['[{"text":"Fine","verifiedPurchase":"yes"}]', 'a.json'], ['[{"text":"Fine","sourceUrl":"javascript:alert(1)"}]', 'a.json']]) {
    assert.throws(() => ingestReviews(Buffer.from(content), name));
  }
  assert.throws(() => ingestReviews(Buffer.alloc(1024 * 1024 + 1), 'a.csv'));
  assert.throws(() => ingestReviews(Buffer.from(JSON.stringify(Array.from({ length: 101 }, () => ({ text: 'x' })))), 'a.json'));
});
test('image ingestion actually decodes and normalizes images', async () => {
  const original = await sharp({ create: { width: 12, height: 8, channels: 3, background: '#ffffff' } }).png().toBuffer();
  const result = await ingestImage(original);
  assert.equal((await sharp(result.data).metadata()).format, 'jpeg');
  await assert.rejects(ingestImage(Buffer.from('<svg></svg>')));
  await assert.rejects(ingestImage(original.subarray(0, 24)));
});
test('evidence validation rejects fabricated and missing findings', () => {
  assert.throws(() => assertReferences(['invented'], ['real']));
  assert.throws(() => validateAssessments([], [persona], []));
  assert.throws(() => validateAssessments([{ findingId: 'skeptic-1', classification: 'supported', evidenceIds: ['invented'], explanation: 'x' }], [persona], []));
});
test('evidence cannot be fully supported without exact-product sources', () => {
  const assessment = { findingId: 'skeptic-1', classification: 'supported' as const, evidenceIds: ['r1'], explanation: 'Review mentions this.' };
  const review = { id: 'r1', text: 'Poor durability', source: 'upload', relevance: 'category' as const };
  assert.equal(validateAssessments([assessment], [persona], [review])[0].classification, 'partially_supported');
  assert.equal(validateAssessments([{ ...assessment, evidenceIds: [] }], [persona], [review])[0].classification, 'insufficient_data');
  assert.equal(validateAssessments([{ ...assessment, classification: 'contradicted' }], [persona], [review])[0].classification, 'contradicted');
});

export function fakeModel(withReviews = false): Model {
  let call = 0;
  return {
    textModel: 'test-double', visionModel: 'test-double',
    async generate<T>(schema: z.ZodType<T>): Promise<T> {
      call++;
      if (call === 1) return schema.parse({ visibleText: 'Bottle', product: 'Bottle', offer: '', cta: '', observedElements: ['Bottle'], benefits: [], claims: [], visualHierarchy: 'Bottle is central', interpretations: [], ambiguities: [] });
      if (withReviews && call === 2) return schema.parse({ themes: [{ theme: 'Durability', sentiment: 'negative', reviewIds: ['r1'] }] });
      const personaStart = withReviews ? 3 : 2;
      if (call < personaStart + 5) return schema.parse({ ...persona, objections: [{ statement: 'Durability unclear', evidenceIds: withReviews ? ['r1'] : [] }] });
      if (call === personaStart + 5) return schema.parse({ assessments: ['skeptic', 'impulsive', 'bargain', 'quality', 'rational'].map(p => ({ findingId: `${p}-1`, classification: withReviews ? 'contradicted' : 'hypothesis', evidenceIds: withReviews ? ['r1'] : [], explanation: 'Test-only assessment' })) });
      return schema.parse({ executiveSummary: 'Test-only report', strengths: [], recommendations: [{ problem: 'Clarity', priority: 'high', personaIds: ['skeptic'], findingIds: ['skeptic-1'], rationale: 'Test clarity', proposedChange: 'Clarify claim', exampleCopy: 'See product details', testingHypothesis: 'Ask readers what they understand' }], limitations: [] });
    },
  };
}
test('no-review pipeline runs all five personas and explicitly flags missing evidence', async () => {
  const stages: string[] = [];
  const report = await runPipeline({ campaign, image: Buffer.from('test'), reviews: [] }, fakeModel(), async stage => { stages.push(stage); });
  assert.equal(report.personas.length, 5);
  assert.equal(report.consumerInsights.datasetSize, 0);
  assert.ok(report.limitations.some(l => l.includes('No real consumer reviews')));
  assert.ok(report.assessments.every(a => a.classification === 'hypothesis'));
  assert.equal(stages.at(-1), 'synthesis');
});
test('review-backed pipeline preserves contradictory evidence through synthesis', async () => {
  const report = await runPipeline({ campaign, image: Buffer.from('test'), reviews: [{ id: 'r1', text: 'Not durable', source: 'test fixture', relevance: 'exact_product' }] }, fakeModel(true), async () => {});
  assert.equal(report.consumerInsights.themes[0].frequency, 1);
  assert.deepEqual(report.synthesis.recommendations[0].evidenceIds, ['r1']);
  assert.equal(report.synthesis.recommendations[0].assessments[0].classification, 'contradicted');
});
test('provider errors stop the pipeline before completion', async () => {
  const model: Model = { textModel: 'test', visionModel: 'test', async generate() { throw new Error('provider failure'); } };
  await assert.rejects(runPipeline({ campaign, image: Buffer.from('test'), reviews: [] }, model, async () => {}), /provider failure/);
});
test('retry reuses validated checkpoints and only calls synthesis again', async () => {
  let checkpoint: Record<string, unknown> = {};
  const input = { campaign, image: Buffer.from('test'), reviews: [] };
  await runPipeline(input, fakeModel(), async (_stage, outputs) => { checkpoint = structuredClone(outputs); });
  let calls = 0;
  const model: Model = { textModel: 'test', visionModel: 'test', async generate<T>(schema: z.ZodType<T>) {
    calls++;
    return schema.parse({ executiveSummary: 'Resumed synthesis', strengths: [], recommendations: [], limitations: [] });
  } };
  const report = await runPipeline(input, model, async () => {}, checkpoint);
  assert.equal(calls, 1);
  assert.equal(report.personas.length, 5);
  assert.equal(report.synthesis.executiveSummary, 'Resumed synthesis');
});
test('stream limits apply without Content-Length', async () => {
  const request = new Request('http://localhost/api', { method: 'POST', body: '12345' });
  await assert.rejects(readBounded(request, 4), /limit/);
});
test('API rejects malformed requests and forbidden origins before database access', async () => {
  const invalid = await handle(new Request('http://localhost/api/analyses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), ['analyses']);
  assert.equal(invalid.status, 400);
  const forbidden = await handle(new Request('http://localhost/api/analyses', { headers: { Origin: 'https://untrusted.example' } }), ['analyses']);
  assert.equal(forbidden.status, 403);
  const preflight = await handle(new Request('http://localhost/api/analyses', { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000' } }), ['analyses']);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000');
});
test('Groq adapter validates JSON and never exposes provider error bodies', async () => {
  const originalFetch = globalThis.fetch;
  const oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';
  try {
    globalThis.fetch = async () => Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"value":"ok"}' } }] });
    assert.deepEqual(await new GroqModel().generate(z.object({ value: z.string() }), 'test', {}), { value: 'ok' });
    globalThis.fetch = async () => Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"wrong":true}' } }] });
    await assert.rejects(new GroqModel().generate(z.object({ value: z.string() }), 'test', {}), /invalid structured/);
    globalThis.fetch = async () => new Response('SECRET_PROVIDER_BODY', { status: 401 });
    await assert.rejects(new GroqModel().generate(z.object({}), 'test', {}), error => error instanceof Error && error.message.includes('401') && !error.message.includes('SECRET'));
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey;
  }
});
test('Groq retries malformed, truncated and schema-invalid responses without accepting partial data', async () => {
  const originalFetch = globalThis.fetch;
  const oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';
  try {
    for (const failure of [
      { finish_reason: 'length', message: { content: '{"value":' } },
      { finish_reason: 'stop', message: { content: 'not JSON' } },
      { finish_reason: 'stop', message: { content: '{"value":12}' } },
    ]) {
      const requests: any[] = [];
      globalThis.fetch = async (_url, init) => {
        requests.push(JSON.parse(init!.body as string));
        return Response.json({ choices: [requests.length === 1 ? failure : { finish_reason: 'stop', message: { content: '{"value":"valid"}' } }] });
      };
      const model = new GroqModel(); model.textModel = 'openai/gpt-oss-120b';
      assert.deepEqual(await model.generate(z.object({ value: z.string() }), 'test', {}), { value: 'valid' });
      assert.equal(requests.length, 2);
      assert.equal(requests[0].reasoning_effort, 'low');
      assert.match(requests[1].messages[1].content, /previous attempt failed validation/);
      if (failure.finish_reason === 'length') assert.equal(requests[1].max_completion_tokens, 9000);
    }
    let attempts = 0;
    globalThis.fetch = async () => { attempts++; return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{}' } }] }); };
    await assert.rejects(new GroqModel().generate(z.object({ value: z.string() }), 'test', {}), /schema_mismatch/);
    assert.equal(attempts, 3);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey;
  }
});
