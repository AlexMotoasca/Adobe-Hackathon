import { z } from 'zod';

const text = z.string().trim().min(1).max(2000);
const texts = z.array(text).max(12);
const ids = z.array(z.string().min(1).max(100)).max(100);
export const campaignSchema = z.object({
  brand: text.max(200), product: text.max(500), category: text.max(200),
  targetAudience: text, objective: text, market: text.max(200), language: text.max(100),
  productDescription: z.string().max(4000).optional(),
  productUrl: z.string().url().max(2000).refine(v => /^https?:\/\//.test(v)).optional(),
});
// Set by the server on upload (never by campaign input): what kind of creative was analysed.
export const creativeSchema = z.object({
  kind: z.enum(['image', 'video']),
  durationSeconds: z.number().min(0.5).max(600).optional(),
  frameTimes: z.array(z.number().min(0).max(600)).max(12).optional(),
});
export type Creative = z.infer<typeof creativeSchema>;
export const relevanceSchema = z.enum(['exact_product', 'similar_product', 'category', 'unknown']);
export const reviewSchema = z.object({
  id: z.string(), text: text.max(4000), source: text.max(300),
  sourceUrl: z.string().url().refine(v => /^https?:\/\//.test(v)).optional(),
  publishedAt: z.string().date().optional(), product: text.max(500).optional(),
  category: text.max(200).optional(), rating: z.number().min(1).max(5).optional(),
  verifiedPurchase: z.boolean().optional(), relevance: relevanceSchema,
});
export const adSchema = z.object({
  visibleText: z.string().max(10000), product: text, offer: z.string().max(2000),
  cta: z.string().max(2000), observedElements: texts, benefits: texts,
  claims: texts, visualHierarchy: text, interpretations: texts, ambiguities: texts,
});
export const insightsSchema = z.object({ themes: z.array(z.object({
  theme: text, sentiment: z.enum(['positive', 'negative', 'mixed', 'neutral']),
  reviewIds: ids.min(1),
})).max(12) });
// Psychological profiles used as lenses on the ad. Keys are stable for saved reports and routing.
export const PERSONAS = {
  skeptic: 'a trust-driven buyer who needs credibility before acting: specific claims, social proof, authority, transparency and risk reversal; hype and vague superlatives push them away',
  impulsive: 'a fast, emotional (System 1) scroller who decides in the first 1-3 seconds: visual salience, emotion, novelty, faces or motion, one simple message and an obvious next step',
  bargain: 'a value-seeker who weighs what they get against what it costs: price anchoring, offer framing, loss aversion and urgency, and clear reasons the product is worth it',
  quality: 'an aspirational, identity-driven buyer: craftsmanship and premium cues, brand personality, aesthetics, differentiation and what owning it says about them',
  rational: 'a deliberate (System 2) planner: a clear benefit, who it is for, how it fits their life, comparison with alternatives and a concrete next action',
} as const;
export const personaKeySchema = z.enum(['skeptic', 'impulsive', 'bargain', 'quality', 'rational']);
export const findingSchema = z.object({ statement: text, evidenceIds: ids });
export const personaSchema = z.object({
  firstImpression: text, strengths: texts, objections: z.array(findingSchema).max(8),
  missingInformation: texts, claimsRequiringVerification: texts,
  recommendations: texts, testingQuestions: texts,
});
export const classificationSchema = z.enum(['supported', 'partially_supported', 'hypothesis', 'contradicted', 'insufficient_data']);
export const assessmentsSchema = z.object({ assessments: z.array(z.object({
  findingId: z.string(), classification: classificationSchema, evidenceIds: ids, explanation: text,
})).max(40) });
export const synthesisSchema = z.object({
  executiveSummary: text, strengths: texts,
  recommendations: z.array(z.object({
    problem: text, priority: z.enum(['high', 'medium', 'low']),
    personaIds: z.array(personaKeySchema).min(1).max(5), findingIds: ids.min(1),
    rationale: text, proposedChange: text, exampleCopy: text, testingHypothesis: text,
  })).max(10), limitations: texts,
});
// Generation-only limits: older saved reports remain readable via the original schemas.
const brief = z.string().trim().min(1).max(240);
const briefList = z.array(brief).max(2);
export const conciseInsightsSchema = insightsSchema.extend({ themes: z.array(insightsSchema.shape.themes.element.extend({ theme: z.string().trim().min(1).max(100) })).max(5) });
export const concisePersonaSchema = personaSchema.extend({
  firstImpression: brief, strengths: z.array(brief).max(3),
  objections: z.array(findingSchema.extend({ statement: brief })).max(3),
  missingInformation: briefList, claimsRequiringVerification: briefList,
  recommendations: z.array(brief).max(3), testingQuestions: briefList,
});
export const conciseSynthesisSchema = synthesisSchema.extend({
  executiveSummary: brief, strengths: z.array(brief).max(3),
  recommendations: z.array(synthesisSchema.shape.recommendations.element.extend({
    problem: brief, rationale: brief, proposedChange: brief, exampleCopy: brief, testingHypothesis: brief,
  })).max(3), limitations: briefList,
});
export type Campaign = z.infer<typeof campaignSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type PersonaKey = keyof typeof PERSONAS;
export type Stage = 'ad_interpretation' | 'category_research' | 'consumer_insights' | 'personas' | 'evidence_validation' | 'synthesis';
export type AnalysisStatus = 'draft' | 'queued' | 'running' | 'completed' | 'failed';
export type PersonaResult = Omit<z.infer<typeof personaSchema>, 'objections'> & { persona: PersonaKey; retrievedEvidenceIds: string[]; objections: (z.infer<typeof findingSchema> & { id: string })[] };
export type Assessment = z.infer<typeof assessmentsSchema>['assessments'][number];
export interface AnalysisReport {
  version: 1;
  campaign: Campaign;
  creative?: Creative;
  ad: z.infer<typeof adSchema>;
  personas: PersonaResult[];
  consumerInsights: { datasetSize: number; themes: (z.infer<typeof insightsSchema>['themes'][number] & { frequency: number })[] };
  assessments: Assessment[];
  synthesis: Omit<z.infer<typeof synthesisSchema>, 'recommendations'> & {
    recommendations: (z.infer<typeof synthesisSchema>['recommendations'][number] & { evidenceIds: string[]; assessments: Assessment[] })[];
  };
  sources: Review[];
  research?: import('./research').Research;
  limitations: string[];
  models: { text: string; vision: string };
}
