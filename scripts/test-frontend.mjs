import assert from 'node:assert/strict';
import {request, escape, create, upload} from '../js/live-api.js';
import {reportView, reportMetrics} from '../js/live-report.js';
assert.equal(escape('<script>"&'), '&lt;script&gt;&quot;&amp;');
let calls=[];
globalThis.fetch=async (url,opts)=>{calls.push({url,opts});return new Response(JSON.stringify({id:'saved-id'}),{status:201,headers:{'Content-Type':'application/json'}});};
await create({brand:'Test'});
assert.equal(calls[0].url,'/api/analyses');
assert.equal(JSON.parse(calls[0].opts.body).brand,'Test');
await upload('saved-id','reviews',new Blob(['text\nexample']));
assert.equal(calls[1].url,'/api/analyses/saved-id/reviews');
assert.ok(calls[1].opts.body instanceof FormData);
globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'Database unavailable'}}),{status:503});
await assert.rejects(()=>request('/analyses'),/Database unavailable/);
globalThis.fetch=async()=>new Response('invalid',{status:200});
await assert.rejects(()=>request('/analyses'),/invalid response/);
console.log('Frontend request, upload, escaping, and error checks passed.');
const report = {
  synthesis: { executiveSummary: 'Test', strengths: [], recommendations: [], limitations: [] },
  ad: { visibleText: '', observedElements: [], interpretations: [], ambiguities: [] },
  personas: [], assessments: [], consumerInsights: { datasetSize: 1, themes: [{theme:'Comfort',frequency:1,sentiment:'mixed',reviewIds:['web-1']}] },
  sources: [{ id: 'web-1', source: '<script>bad</script>', text: 'Evidence', relevance: 'category', sourceUrl: 'javascript:alert(1)' }], limitations: [],
  research: { plan: { category: 'Earbuds', comparisonGroup: 'Wireless', queries: ['value'] }, fetchedAt: '2026-11-07T12:00:00Z', reviews: [{}], providers: [{ name: 'youtube', status: 'partial', count: 1 }], warnings: ['Incomplete coverage'], criteria: [{ criterion: 'Comfort', observation: 'Fit matters', evidenceIds: ['web-1'] }], competitors: [] },
};
const html = reportView(report);
assert.match(html, /Category research/);
assert.match(html, /Incomplete coverage/);
assert.match(html, /href="#source-web-1"/);
assert.ok(!html.includes('<script>') && !html.includes('javascript:'));
report.sources[0].sourceUrl = 'https://example.com/review';
assert.match(reportView(report), /href="https:\/\/example.com\/review"/);
delete report.research;
assert.match(reportView(report), /older report did not run category research/);
report.sources = [];
assert.match(reportView(report), /No customer evidence used/);
console.log('Research report, citations, source URL safety, and older report compatibility checks passed.');

assert.match(html, /Customer experience/);
assert.match(html, /Concerns by perspective/);
assert.deepEqual(reportMetrics({...report, sources:[{id:'one'}], personas:[{objections:[{evidenceIds:['one']},{evidenceIds:[]}]}], assessments:[{classification:'partially_supported'}]}), {sourceCount:1,findings:2,cited:1,actions:0,classifications:[{key:'supported',count:0},{key:'partially_supported',count:1},{key:'hypothesis',count:0},{key:'contradicted',count:0},{key:'insufficient_data',count:0}]});