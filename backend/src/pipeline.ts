import { adSchema, insightsSchema, personaSchema, assessmentsSchema, synthesisSchema, PERSONAS,
  type Campaign, type Review, type AnalysisReport, type PersonaKey, type PersonaResult, type Stage } from './contracts';
import { type Model } from './ai';
import { assertReferences, retrieve, validateAssessments } from './evidence';
import { researchCategory, researchSchema } from './research';
import { copyTemplate } from './copy-safety';

export async function runPipeline(input: { campaign: Campaign; image: Buffer; reviews: Review[] }, model: Model,
  progress: (stage: Stage, outputs: Record<string, unknown>) => Promise<void>, cached: Record<string, unknown> = {}, researchModel: Model = model): Promise<AnalysisReport> {
  const { campaign, image } = input;
  // Pre-research checkpoints must not retain personas evaluated against different evidence.
  if (!cached.research) cached = { ad: cached.ad };
  const outputs: Record<string, unknown> = { ...cached };
  await progress('ad_interpretation', outputs);
  const ad = cached.ad ? adSchema.parse(cached.ad) : await model.generate(adSchema, 'Inspect the actual ad image. Transcribe visible text; do not infer illegible text. Separate directly observed elements from interpretations. Use empty strings where offer or CTA is absent.', { campaign }, image);
  outputs.ad = ad;
  await progress('category_research', outputs);
  const research = cached.research ? researchSchema.parse(cached.research) : await researchCategory(campaign, researchModel);
  outputs.research = research;
  const reviews = [...input.reviews, ...research.reviews];
  await progress('consumer_insights', outputs);
  const insights = cached.consumerInsights ? insightsSchema.parse(cached.consumerInsights) : reviews.length ? await model.generate(insightsSchema, 'Extract recurring buying criteria and consumer themes from the supplied evidence. Cite original source IDs for every theme. Distinguish web excerpts from customer experiences. Sentiment describes this sample only, never the wider market.', { campaign, reviews }) : { themes: [] };
  const consumerInsights = { datasetSize: reviews.length, themes: insights.themes.map(theme => {
    assertReferences(theme.reviewIds, reviews.map(r => r.id));
    const reviewIds = [...new Set(theme.reviewIds)];
    return { ...theme, reviewIds, frequency: reviewIds.length };
  }) };
  outputs.consumerInsights = consumerInsights;
  await progress('personas', outputs);
  // Independent calls; sequential execution avoids exhausting hackathon/free-tier quotas.
  const personas: PersonaResult[] = [];
  for (const persona of Object.keys(PERSONAS) as PersonaKey[]) {
    const evidence = retrieve(reviews, `${PERSONAS[persona]} ${campaign.product} ${research.plan.category} ${ad.claims.join(' ')}`, 16);
    const prior = Array.isArray(cached.personas) ? cached.personas.find(p => p.persona === persona) : undefined;
    const inContext = (item: { evidenceIds: string[] }) => item.evidenceIds.every(id => evidence.some(r => r.id === id));
    const result = prior ? personaSchema.parse(prior) : await model.generate(personaSchema, `Simulate the ${persona} perspective, focusing on ${PERSONAS[persona]}. Assess independently using category expectations and available competitor evidence. Separate product suitability, competitive value, and ad communication. Missing ad details do not prove poor product performance. Never invent current prices, competitor features or product specifications. Every objection is a testable finding. Cite source IDs only from evidence when relevant; otherwise use an empty evidenceIds array. Do not treat simulation as real feedback.`, { campaign, ad, evidence, category: research.plan, categoryCriteria: research.criteria.filter(inContext), competitorContext: research.competitors.filter(inContext) });
    result.objections.forEach(f => assertReferences(f.evidenceIds, evidence.map(r => r.id)));
    personas.push({ ...result, persona, retrievedEvidenceIds: evidence.map(r => r.id), objections: result.objections.map((f, index) => ({ ...f, id: `${persona}-${index + 1}` })) });
    outputs.personas = [...personas];
    await progress('personas', outputs);
  }
  await progress('evidence_validation', outputs);
  const findings = personas.flatMap(p => p.objections);
  const rawAssessments = cached.assessments ? assessmentsSchema.parse({ assessments: cached.assessments }) : { assessments: [] as import('./contracts').Assessment[] };
  if (!cached.assessments) {
    const batches: unknown[] = Array.isArray(cached.assessmentBatches) ? [...cached.assessmentBatches] : [];
    for (let offset = 0; offset < findings.length; offset += 6) {
      const batch = findings.slice(offset, offset + 6);
      const evidenceIds = new Set(batch.flatMap(f => f.evidenceIds));
      const index = Math.floor(offset / 6);
      const result = batches[index] ? assessmentsSchema.parse(batches[index]) : await model.generate(assessmentsSchema, 'Assess every supplied finding exactly once. For each finding use only its own evidenceIds. Check whether review text actually supports or contradicts the statement. Mere topic overlap is not support. No relevant evidence means hypothesis or insufficient_data. Distinguish exact-product from category or similar-product evidence. Keep explanations concise.', { findings: batch, reviews: reviews.filter(r => evidenceIds.has(r.id)) });
      const batchPersonas = personas.map(p => ({ ...p, objections: p.objections.filter(f => batch.some(b => b.id === f.id)) }));
      const validated = validateAssessments(result.assessments, batchPersonas, reviews);
      rawAssessments.assessments.push(...validated);
      batches[index] = { assessments: validated };
      outputs.assessmentBatches = [...batches];
      await progress('evidence_validation', outputs);
    }
  }
  const assessments = validateAssessments(rawAssessments.assessments, personas, reviews);
  outputs.assessments = assessments;
  await progress('synthesis', outputs);
  const synthesized = await model.generate(synthesisSchema, 'Synthesize a concise ad pre-test report. Prioritize actionable changes and real-world tests, respecting the evidence classifications. Each recommendation must cite existing findingIds and contributing personaIds. Suggested copy must not invent product claims, discounts or certifications. No sales guarantees or conversion predictions.', { campaign, ad, personas, consumerInsights, assessments });
  const recommendations = synthesized.recommendations.map(r => {
    assertReferences(r.findingIds, findings.map(f => f.id));
    const linked = assessments.filter(a => r.findingIds.includes(a.findingId));
    return { ...r, ...copyTemplate(r.problem), evidenceIds: [...new Set(linked.flatMap(a => a.evidenceIds))], assessments: linked };
  });
  return {
    version: 1, campaign, ad, personas, consumerInsights, assessments, research,
    synthesis: { ...synthesized, recommendations }, sources: reviews,
    models: { text: model.textModel, vision: model.visionModel },
    limitations: [
      'Personas and evidence assessments are AI-generated, not real interviews or independently verified conclusions.',
      'Example copy uses placeholders: exact-product specifications, offers and performance claims must be verified before publication.',
      'Frequencies describe this collected sample only, not the wider market. Retrieval uses lexical overlap; category relevance is AI-filtered, not independently verified.',
      'Web excerpts may be editorial or promotional. YouTube sources are top-level audience comments, not video transcripts or verified purchases. Prices and competitor claims are not verified current offers.',
      'Uploaded source metadata is user-supplied. Personal details in source text are not automatically redacted.',
      ...research.warnings,
      ...(reviews.length ? [] : ['No real consumer reviews were supplied. Consumer findings are unvalidated hypotheses.']),
      ...synthesized.limitations,
    ],
  };
}
