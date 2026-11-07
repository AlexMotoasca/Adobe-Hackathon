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
export const PERSONAS = {
  skeptic: 'Credibility, unsupported promises, proof, purchase risk and transparency',
  impulsive: 'Visual impact, emotion, hook, simplicity and CTA clarity',
  bargain: 'Price, value, discounts, extra costs and promotion conditions',
  quality: 'How the ad communicates quality, differentiation and credible proof of its advertised benefit',
  rational: 'Clarity of the advertised benefit, audience relevance and the next action',
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
  firstImpression: brief, strengths: briefList,
  objections: z.array(findingSchema.extend({ statement: brief })).max(3),
  missingInformation: briefList, claimsRequiringVerification: briefList,
  recommendations: briefList, testingQuestions: briefList,
});
export const conciseSynthesisSchema = synthesisSchema.extend({
  executiveSummary: brief, strengths: briefList,
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
