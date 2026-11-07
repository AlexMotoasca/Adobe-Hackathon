import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { compactEvidence, retrieve } from '../src/evidence';
import { campaignSchema, type Review } from '../src/contracts';
import { runPipeline } from '../src/pipeline';
import { type Model } from '../src/ai';

const review = (id: string, text: string, sourceUrl?: string): Review => ({ id, text, source: 'test', relevance: 'category', ...(sourceUrl ? { sourceUrl } : {}) });

test('BM25 ranks rare, specific terms above common filler', () => {
  const reviews = [
    review('filler', 'Great product, great price, great everything. Great great great.'),
    review('battery', 'Battery life dropped after six months of daily commuting.'),
    review('other', 'The case feels cheap but the price is fine.'),
  ];
  assert.equal(retrieve(reviews, 'battery life durability', 1)[0].id, 'battery');
});

test('retrieval diversifies across sources and avoids near-duplicates', () => {
  const same = 'https://one.example.com/page';
  const reviews = [
    review('a1', 'Price and value matter most for earbuds buyers.', same),
    review('a2', 'Price and value matter most for earbuds buyers today.', same),
    review('a3', 'Price and value matter for earbuds buyers overall.', same),
    review('b1', 'Value for money is why I switched to a cheaper brand.', 'https://two.example.com/x'),
  ];
  const ids = retrieve(reviews, 'price value earbuds', 2).map(r => r.id);
  assert.ok(ids.includes('b1'), `expected a second source, got ${ids}`);
});

test('boosted (filter-validated) sources win ties', () => {
  const reviews = [review('x', 'Comfort matters on long flights.'), review('y', 'Comfort matters on long trips.')];
  assert.equal(retrieve(reviews, 'comfort', { limit: 1, boostIds: ['y'] })[0].id, 'y');
});

test('excerpts start on a word boundary and stay contiguous', () => {
  const text = 'Intro sentence here. '.repeat(60) + 'The battery died quickly. ' + 'Padding text continues. '.repeat(60);
  const [excerpt] = compactEvidence([review('r', text)], 'battery');
  assert.ok(text.includes(excerpt.text));
  assert.ok(excerpt.text.includes('battery'));
  assert.ok(/^[A-Z]/.test(excerpt.text), excerpt.text.slice(0, 20));
});

test('uncited findings become hypotheses without a validation model call', async () => {
  const campaign = campaignSchema.parse({ brand: 'B', product: 'P', category: 'C', targetAudience: 'A', objective: 'O', market: 'M', language: 'en' });
  const instructions: string[] = [];
  const model: Model = { textModel: 't', visionModel: 't', async generate<T>(schema: z.ZodType<T>, instruction: string) {
    instructions.push(instruction.split(' ')[0]);
    if (instruction.startsWith('Inspect')) return schema.parse({ visibleText: '', product: 'P', offer: '', cta: '', observedElements: [], benefits: [], claims: [], visualHierarchy: 'P', interpretations: [], ambiguities: [] });
    if (instruction.startsWith('Simulate')) return schema.parse({ firstImpression: 'x', strengths: [], objections: [{ statement: 'Unclear CTA', evidenceIds: [] }], missingInformation: [], claimsRequiringVerification: [], recommendations: [], testingQuestions: [] });
    return schema.parse({ executiveSummary: 'ok', strengths: [], recommendations: [], limitations: [] });
  } };
  const report = await runPipeline({ campaign, image: Buffer.from('x'), reviews: [] }, model, async () => {});
  assert.ok(!instructions.includes('Assess'));
  assert.equal(report.assessments.length, 5);
  assert.ok(report.assessments.every(a => a.classification === 'hypothesis'));
});
