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
