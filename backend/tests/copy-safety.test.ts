import test from 'node:test';
import assert from 'node:assert/strict';
import { copyTemplate } from '../src/copy-safety';

test('category-only evidence cannot produce invented publishable specs or offers', () => {
  for (const problem of ['Model unspecified', 'ANC claim unsupported', 'Pricing omitted', 'Missing CTA', 'Missing battery specs']) {
    const copy = copyTemplate(problem);
    assert.ok(!/\d|\$|AirPods|independently tested/i.test(JSON.stringify(copy)));
    assert.match(copy.exampleCopy, /\[/);
  }
});

import { maskFigures } from '../src/copy-safety';
test('persona suggestions mask invented figures but keep timestamps and principles', () => {
  assert.equal(maskFigures('Adăugați specificații cheie (ex: 30h autonomie, ANC) [transparency]'), 'Adăugați specificații cheie (ex: [verified figure] autonomie, ANC) [transparency]');
  assert.equal(maskFigures('Mention a 30-day guarantee and €99 price'), 'Mention a [verified figure]-day guarantee and [verified figure] price');
  assert.equal(maskFigures('Show the product at 1.5 s and again at 10s'), 'Show the product at 1.5 s and again at 10s');
  assert.equal(maskFigures('Use AuraWave Pro2 naming, 4K visuals'), 'Use AuraWave Pro2 naming, 4K visuals');
});
