import { type Review, type Assessment, type PersonaResult } from './contracts';
import { AppError } from './errors';

export function assertReferences(ids: string[], allowed: Iterable<string>) {
  const valid = new Set(allowed);
  if (ids.some(id => !valid.has(id))) throw new AppError('INVALID_EVIDENCE', 'Model referenced evidence or findings outside its supplied context.', 502);
}

// Lightweight lexical RAG: BM25 ranking, boosts for filter-validated sources,
// and diversity re-ranking so one site or video does not crowd out the rest.
const STOPWORDS = new Set('the and for are but not you your with this that from have has was were will they them their what when which who how why all any can its our out about into than then there these those also just more most some such only over very been being does did doing would could should other each much many like get got one two'.split(' '));
const stem = (word: string) => word.length > 4 ? word.replace(/(ing|edly|ed|ly|es|s)$/u, '') : word;
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []).filter(w => !STOPWORDS.has(w)).map(stem);
}
type Scored = { review: Review; index: number; score: number; tokens: Set<string>; group: string };
export type RetrieveOptions = { limit?: number; boostIds?: Iterable<string> };

function idfTable(docs: string[][]) {
  const df = new Map<string, number>();
  for (const doc of docs) for (const term of new Set(doc)) df.set(term, (df.get(term) ?? 0) + 1);
  return (term: string) => Math.log(1 + (docs.length - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
}
function sourceGroup(review: Review) {
  try {
    const url = new URL(review.sourceUrl ?? '');
    return url.hostname.endsWith('youtube.com') ? 'yt:' + (url.searchParams.get('v') ?? '') : url.hostname;
  } catch { return review.source; }
}

export function retrieve(reviews: Review[], query: string, limitOrOptions: number | RetrieveOptions = 12): Review[] {
  const { limit = 12, boostIds = [] } = typeof limitOrOptions === 'number' ? { limit: limitOrOptions } : limitOrOptions;
  const boosted = new Set(boostIds);
  const terms = [...new Set(tokenize(query))];
  const docs = reviews.map(r => tokenize(r.text));
  const idf = idfTable(docs);
  const avgLength = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, docs.length) || 1;
  const scored: Scored[] = reviews.map((review, index) => {
    const doc = docs[index];
    const tf = new Map<string, number>();
    for (const term of doc) tf.set(term, (tf.get(term) ?? 0) + 1);
    const bm25 = terms.reduce((sum, term) => {
      const f = tf.get(term) ?? 0;
      return f ? sum + idf(term) * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * doc.length / avgLength)) : sum;
    }, 0);
    const relevance = review.relevance === 'exact_product' ? 2 : review.relevance === 'similar_product' ? 1 : 0;
    return { review, index, tokens: new Set(doc), group: sourceGroup(review),
      score: bm25 + relevance + (boosted.has(review.id) ? 1.5 : 0) + (doc.length < 4 ? -1 : 0) };
  });
  // Maximal-marginal-relevance style selection: penalize repeated sources and near-duplicate wording.
  const selected: Scored[] = [];
  const pool = [...scored].sort((a, b) => b.score - a.score || a.index - b.index);
  while (selected.length < limit && pool.length) {
    let best = 0, bestValue = -Infinity;
    pool.forEach((candidate, i) => {
      const sameGroup = selected.filter(s => s.group === candidate.group).length;
      const overlap = Math.max(0, ...selected.map(s => {
        const shared = [...candidate.tokens].filter(t => s.tokens.has(t)).length;
        return shared / Math.max(1, Math.min(candidate.tokens.size, s.tokens.size));
      }));
      const value = candidate.score - sameGroup * 0.75 - overlap * 1.5;
      if (value > bestValue) { bestValue = value; best = i; }
    });
    selected.push(...pool.splice(best, 1));
  }
  return selected.map(item => item.review);
}

export function compactEvidence(reviews: Review[], query: string, options: Omit<RetrieveOptions, 'limit'> = {}): Review[] {
  const terms = [...new Set(tokenize(query))];
  const idf = idfTable(reviews.map(r => tokenize(r.text)));
  return retrieve(reviews, query, { ...options, limit: 6 }).map(review => {
    let bestStart = 0, bestScore = -1;
    for (let start = 0; start < review.text.length; start += 150) {
      const window = new Set(tokenize(review.text.slice(start, start + 900)));
      const score = terms.reduce((sum, term) => sum + (window.has(term) ? idf(term) : 0), 0);
      if (score > bestScore) { bestScore = score; bestStart = start; }
    }
    // Snap to a sentence or word boundary so excerpts read cleanly; still one contiguous original excerpt.
    if (bestStart > 0) {
      const head = review.text.slice(Math.max(0, bestStart - 150), bestStart);
      const sentence = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
      bestStart = sentence >= 0 ? bestStart - head.length + sentence + 2 : bestStart;
      while (bestStart > 0 && /\S/.test(review.text[bestStart - 1])) bestStart--;
    }
    return { ...review, text: review.text.slice(bestStart, bestStart + 900).trim() };
  });
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
