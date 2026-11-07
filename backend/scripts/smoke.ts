import assert from 'node:assert/strict';
import sharp from 'sharp';

// A clearly synthetic ad and no reviews: this checks plumbing, not real consumer validity.
const base = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
async function api(path: string, init?: RequestInit) {
  const response = await fetch(`${base}/api${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  return body;
}
await api('/health');
const analysis = process.env.SMOKE_ANALYSIS_ID ? { id: process.env.SMOKE_ANALYSIS_ID } : await api('/analyses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
  brand: 'SYNTHETIC SMOKE TEST', product: 'Reusable water bottle', category: 'Drinkware',
  targetAudience: 'Office commuters', objective: 'Explain the product clearly', market: 'Romania', language: 'English',
  productDescription: 'Synthetic engineering test. No real consumer evidence is supplied.',
}) });
const svg = '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="white"/><text x="40" y="70" font-size="38">SYNTHETIC TEST AD</text><rect x="330" y="160" width="120" height="260" rx="30" fill="blue"/><text x="40" y="490" font-size="30">Reusable water bottle</text><text x="40" y="550" font-size="28">Explore product details</text></svg>';
const image = await sharp(Buffer.from(svg)).png().toBuffer();
const form = new FormData(); form.set('file', new Blob([new Uint8Array(image)]), 'synthetic-ad.png');
if (!process.env.SMOKE_ANALYSIS_ID) await api(`/analyses/${analysis.id}/image`, { method: 'POST', body: form });
await api(`/analyses/${analysis.id}/start`, { method: 'POST' });
console.log(`Synthetic analysis ${analysis.id} queued.`);
const deadline = Date.now() + 12 * 60 * 1000;
let lastStage = '';
while (Date.now() < deadline) {
  const status = await api(`/analyses/${analysis.id}`);
  if (status.stage !== lastStage) { console.log(`Stage: ${status.stage}`); lastStage = status.stage; }
  if (status.status === 'failed') throw new Error(JSON.stringify(status.error));
  if (status.status === 'completed') {
    const report = await api(`/analyses/${analysis.id}/report`);
    assert.equal(report.personas.length, 5);
    assert.equal(report.sources.length, 0);
    assert.ok(report.limitations.some((l: string) => l.includes('No real consumer reviews')));
    console.log('Live HTTP → PostgreSQL → Groq vision → five personas → report passed.');
    process.exit(0);
  }
  await new Promise(resolve => setTimeout(resolve, 2000));
}
throw new Error('Smoke test timed out. Inspect the worker and analysis status.');
