import {escape as e} from './live-api.js';
const list = values => '<ul>' + (values || []).map(v => '<li>' + e(v) + '</li>').join('') + '</ul>';
export function reportView(r) {
  const refs = ids => (ids || []).map(id => '<a href="#source-' + e(id) + '">Review ' + e(id) + '</a>').join(' · ');
  const section = (title, body) => '<section class="panel"><h2>' + e(title) + '</h2>' + body + '</section>';
  return section('Executive diagnosis', '<p>' + e(r.synthesis.executiveSummary) + '</p>' + list(r.synthesis.strengths)) +
    section('Recommendations', r.synthesis.recommendations.map(v => '<article><h3>' + e(v.priority) + ' priority · ' + e(v.problem) + '</h3><p>' + e(v.rationale) + '</p><p><b>Proposed change:</b> ' + e(v.proposedChange) + '</p><blockquote>' + e(v.exampleCopy) + '</blockquote><p><b>Test:</b> ' + e(v.testingHypothesis) + '</p>' + refs(v.evidenceIds) + '</article>').join('')) +
    section('Creative observations', '<p>' + e(r.ad.visibleText) + '</p>' + list(r.ad.observedElements) + '<h3>Interpretations</h3>' + list(r.ad.interpretations) + '<h3>Ambiguities</h3>' + list(r.ad.ambiguities)) +
    section('Synthetic personas', '<p>AI-generated perspectives.</p>' + r.personas.map(p => '<details><summary>' + e(p.persona) + '</summary><p>' + e(p.firstImpression) + '</p><h3>Strengths</h3>' + list(p.strengths) + '<h3>Objections</h3>' + p.objections.map(o => '<p>' + e(o.statement) + '</p>' + refs(o.evidenceIds)).join('') + '<h3>Missing information</h3>' + list(p.missingInformation) + '<h3>Recommendations</h3>' + list(p.recommendations) + '</details>').join('')) +
    section('Evidence assessments', r.assessments.map(a => '<article><h3>' + e(a.classification.replaceAll('_',' ')) + '</h3><p>' + e(a.findingId) + ': ' + e(a.explanation) + '</p>' + refs(a.evidenceIds) + '</article>').join('')) +
    section('Consumer themes', '<p>' + e(r.consumerInsights.datasetSize) + ' supplied reviews</p>' + r.consumerInsights.themes.map(t => '<article><h3>' + e(t.theme) + '</h3><p>' + e(t.sentiment) + ' · ' + e(t.frequency) + ' cited reviews</p>' + refs(t.reviewIds) + '</article>').join('')) +
    section('Source reviews', r.sources.length ? r.sources.map(s => '<article id="source-' + e(s.id) + '"><h3>' + e(s.source) + '</h3><blockquote>' + e(s.text) + '</blockquote><small>' + e(s.id) + ' · ' + e(s.relevance) + '</small></article>').join('') : '<p>No customer reviews were supplied. Findings are unvalidated hypotheses.</p>') +
    section('Limitations', list([...new Set([...r.limitations, ...r.synthesis.limitations])]));
}
