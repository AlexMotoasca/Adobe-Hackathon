import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { researchCategory } from '../src/research';
import { type Model } from '../src/ai';
import { type Campaign } from '../src/contracts';
import { runPipeline } from '../src/pipeline';

const campaign: Campaign = { brand: 'Apple', product: 'AirPods', category: 'Audio', market: 'Romania', language: 'en', objective: 'Awareness', targetAudience: 'Commuters' };
const plan = { category: 'wireless earbuds', comparisonGroup: 'Wireless earbuds for commuting', queries: ['wireless earbuds value complaints'] };
function model(invalid = false): Model {
  return { textModel: 'test', visionModel: 'test', async generate<T>(schema: z.ZodType<T>, _instruction: string, data: any) {
    if (!data.sources) return schema.parse(plan);
    const ids = invalid ? ['invented'] : data.sources.map((r: any) => r.id);
    return schema.parse({ relevantIds: ids, criteria: [{ criterion: 'Value', observation: 'Buyers compare comfort and price.', evidenceIds: ids }], competitors: [] });
  } };
}
function fakeFetch(calls: { url: string; body?: any }[], disabled = false): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input); calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (url.includes('tavily')) return Response.json({ results: [
      { url: 'https://example.com/review', title: 'Earbuds review', content: 'Comfort matters more than expensive branding.' },
      { url: 'https://example.com/duplicate', title: 'Duplicate', content: 'Comfort matters more than expensive branding.' },
      { url: 'javascript:alert(1)', content: 'bad' },
    ] });
    if (url.includes('/search?')) return Response.json({ items: [{ id: { videoId: 'abc' }, snippet: { title: 'Earbud comparison' } }] });
    if (disabled) return new Response('PRIVATE QUOTA DETAILS', { status: 403 });
    return Response.json({ items: [{ snippet: { topLevelComment: { id: 'comment1', snippet: { textDisplay: 'The cheaper buds have a comfortable fit.', publishedAt: '2026-10-01T12:00:00Z' } } } }] });
  }) as typeof fetch;
}
test('category queries collect and deduplicate web excerpts and linked YouTube comments', async () => {
  const calls: { url: string; body?: any }[] = [];
  const result = await researchCategory(campaign, model(), { tavilyKey: 'test', youtubeKey: 'test', fetcher: fakeFetch(calls) });
  assert.equal(result.reviews.length, 2);
  assert.equal(result.providers.every(p => p.status === 'ok'), true);
  assert.equal(calls[0].body.query, plan.queries[0]);
  assert.equal(calls[0].body.include_answer, false);
  assert.ok(calls[1].url.includes('wireless+earbuds'));
  assert.equal(result.reviews[1].publishedAt, '2026-10-01');
  assert.match(result.reviews[1].sourceUrl!, /lc=comment1/);
  assert.ok(result.reviews.every(r => r.relevance === 'category' && r.verifiedPurchase === undefined));
});
test('disabled comments preserve web evidence and expose coverage warnings without response bodies', async () => {
  const result = await researchCategory(campaign, model(), { tavilyKey: 'test', youtubeKey: 'test', fetcher: fakeFetch([], true) });
  assert.equal(result.reviews.length, 1);
  assert.equal(result.providers[1].status, 'unavailable');
  assert.match(result.warnings.join(' '), /incomplete/);
  assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
test('missing keys make no model or network calls and explicitly report missing evidence', async () => {
  const unavailable: Model = { textModel: 'test', visionModel: 'test', async generate() { throw new Error('Unexpected model call'); } };
  const result = await researchCategory(campaign, unavailable, { tavilyKey: '', youtubeKey: '', fetcher: async () => { throw new Error('Unexpected network call'); } });
  assert.equal(result.reviews.length, 0);
  assert.ok(result.providers.every(p => p.status === 'not_configured'));
});
test('invented citations cannot enter persona evidence', async () => {
  const result = await researchCategory(campaign, model(true), { tavilyKey: 'test', youtubeKey: '', fetcher: fakeFetch([]) });
  assert.equal(result.reviews.length, 0);
  assert.equal(result.criteria.length, 0);
  assert.match(result.warnings.join(' '), /filtering failed/);
});
test('provider outages return no fabricated evidence', async () => {
  const result = await researchCategory(campaign, model(), { tavilyKey: 'test', youtubeKey: 'test', fetcher: async () => new Response('secret', { status: 429 }) });
  assert.ok(result.providers.every(p => p.status === 'unavailable'));
  assert.equal(result.reviews.length, 0);
});

test('research batches have fixed assignments and do not switch keys on failure', async () => {
  const calls = [0, 0, 0];
  const models: Model[] = calls.map((_, i) => ({ textModel: `test-${i}`, visionModel: 'test', async generate<T>(schema: z.ZodType<T>, _instruction: string, data: any) {
    calls[i]++;
    if (i === 1) throw new Error('quota');
    return schema.parse({ relevantIds: data.sources.map((r: any) => r.id), criteria: [], competitors: [] });
  } }));
  const result = await researchCategory(campaign, model(), { tavilyKey: 'test', youtubeKey: '', models,
    fetcher: async () => Response.json({ results: Array.from({ length: 24 }, (_, i) => ({ url: `https://example.com/${i}`, content: `Buyer experience ${i}` })) }),
  });
  assert.deepEqual(calls, [2, 1, 1]);
  assert.equal(result.reviews.length, 18);
  assert.match(result.warnings.join(' '), /batch 2 \(assignment 2\)/);
});
test('a failed filtering batch preserves evidence from successful batches', async () => {
  let batches = 0;
  const partialModel: Model = { textModel: 'test', visionModel: 'test', async generate<T>(schema: z.ZodType<T>, _instruction: string, data: any) {
    if (!data.sources) return schema.parse(plan);
    if (++batches === 2) throw new Error('rate limit');
    return schema.parse({ relevantIds: data.sources.map((r: any) => r.id), criteria: [], competitors: [] });
  } };
  const result = await researchCategory(campaign, partialModel, { tavilyKey: 'test', youtubeKey: '', fetcher: async () => Response.json({ results: Array.from({ length: 8 }, (_, i) => ({ url: `https://example.com/${i}`, content: `Buyer experience ${i}` })) }) });
  assert.equal(batches, 2);
  assert.equal(result.reviews.length, 6);
  assert.match(result.warnings.join(' '), /batch 2/);
});
test('saved category evidence feeds all personas without refetching on resume', async () => {
  const research = await researchCategory(campaign, model(), { tavilyKey: 'test', youtubeKey: 'test', fetcher: fakeFetch([]) });
  const personaData: any[] = [];
  const pipelineModel: Model = { textModel: 'test', visionModel: 'test', async generate<T>(schema: z.ZodType<T>, instruction: string, data: any) {
    if (instruction.startsWith('Extract')) return schema.parse({ themes: [] });
    if (instruction.startsWith('Simulate')) {
      personaData.push(data);
      return schema.parse({ firstImpression: 'Test', strengths: [], objections: [], missingInformation: [], claimsRequiringVerification: [], recommendations: [], testingQuestions: [] });
    }
    return schema.parse({ executiveSummary: 'Test', strengths: [], recommendations: [], limitations: [] });
  } };
  const report = await runPipeline({ campaign, image: Buffer.from('test'), reviews: [] }, pipelineModel, async () => {}, {
    research, ad: { visibleText: '', product: 'AirPods', offer: '', cta: '', observedElements: [], benefits: [], claims: [], visualHierarchy: 'Product', interpretations: [], ambiguities: [] },
  });
  assert.equal(personaData.length, 5);
  assert.ok(personaData.every(d => d.evidence.length === 2 && d.categoryCriteria.length === 1));
  assert.equal(report.sources.length, 2);
  assert.equal(report.research?.plan.category, 'wireless earbuds');
});
