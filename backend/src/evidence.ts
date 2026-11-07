import { type Review, type Assessment, type PersonaResult } from './contracts';
import { AppError } from './errors';

export function assertReferences(ids: string[], allowed: Iterable<string>) {
  const valid = new Set(allowed);
  if (ids.some(id => !valid.has(id))) throw new AppError('INVALID_EVIDENCE', 'Model referenced evidence or findings outside its supplied context.', 502);
}

export function retrieve(reviews: Review[], query: string, limit = 12): Review[] {
  const words = new Set(query.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
  return reviews.map((review, index) => ({ review, index, score:
    [...words].filter(word => review.text.toLowerCase().includes(word)).length +
    (review.relevance === 'exact_product' ? 2 : 0),
  })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, limit).map(item => item.review);
}

export function validateAssessments(assessments: Assessment[], personas: PersonaResult[], reviews: Review[]): Assessment[] {
  const findings = personas.flatMap(p => p.objections);
  const byId = new Map(reviews.map(r => [r.id, r]));
  const expected = findings.map(f => f.id);
  assertReferences(assessments.map(a => a.findingId), expected);
  if (assessments.length !== expected.length || new Set(assessments.map(a => a.findingId)).size !== expected.length) {
    throw new AppError('INVALID_EVIDENCE', 'Evidence assessment must cover every finding exactly once.', 502);
  }
  return assessments.map(assessment => {
    const finding = findings.find(f => f.id === assessment.findingId)!;
    assertReferences(assessment.evidenceIds, finding.evidenceIds);
    const evidence = [...new Set(assessment.evidenceIds)];
    if (!evidence.length && ['supported', 'partially_supported', 'contradicted'].includes(assessment.classification)) {
      return { ...assessment, evidenceIds: [], classification: 'insufficient_data', explanation: 'No cited reviews support this assessment.' };
    }
    if (assessment.classification === 'supported' && evidence.some(id => byId.get(id)?.relevance !== 'exact_product')) {
      return { ...assessment, evidenceIds: evidence, classification: 'partially_supported', explanation: `Evidence is not exclusively about the exact product. ${assessment.explanation}` };
    }
    return { ...assessment, evidenceIds: evidence };
  });
}
