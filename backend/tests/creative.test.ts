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
    if (instruction.startsWith('Inspect')) return schema.parse({ visibleText: '', product: 'P', offer: '', cta: '', observedElements: [], benefits: [], claims: [], visualHierarchy: 'P', interpretations: [], ambiguities: [] });
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

test('video uploads require frame timestamps before any database access', async () => {
  const form = new FormData(); form.set('file', new Blob(['x']), 'storyboard.jpg');
  const id = '00000000-0000-4000-8000-000000000000';
  const response = await handle(new Request(`http://localhost/api/analyses/${id}/video?duration=10`, { method: 'POST', body: form }), ['analyses', id, 'video']);
  assert.equal(response.status, 400);
});
