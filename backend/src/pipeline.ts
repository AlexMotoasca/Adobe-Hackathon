import { adSchema, insightsSchema, personaSchema, assessmentsSchema, synthesisSchema, PERSONAS,
  type Campaign, type Review, type AnalysisReport, type PersonaKey, type PersonaResult, type Stage } from './contracts';
import { type Model } from './ai';
import { assertReferences, retrieve, validateAssessments } from './evidence';

export async function runPipeline(input: { campaign: Campaign; image: Buffer; reviews: Review[] }, model: Model,
  progress: (stage: Stage, outputs: Record<string, unknown>) => Promise<void>, cached: Record<string, unknown> = {}): Promise<AnalysisReport> {
  const { campaign, image, reviews } = input;
  const outputs: Record<string, unknown> = { ...cached };
  await progress('ad_interpretation', outputs);
  const ad = cached.ad ? adSchema.parse(cached.ad) : await model.generate(adSchema, 'Inspect the actual ad image. Transcribe visible text; do not infer illegible text. Separate directly observed elements from interpretations. Use empty strings where offer or CTA is absent.', { campaign }, image);
  outputs.ad = ad;
  await progress('consumer_insights', outputs);
  const insights = cached.consumerInsights ? insightsSchema.parse(cached.consumerInsights) : reviews.length ? await model.generate(insightsSchema, 'Extract recurring consumer themes from the uploaded reviews. Cite the relevant original review IDs for every theme. Sentiment describes the theme in this dataset only.', { campaign, reviews }) : { themes: [] };
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
    const evidence = retrieve(reviews, `${PERSONAS[persona]} ${campaign.product} ${ad.claims.join(' ')}`);
    const prior = Array.isArray(cached.personas) ? cached.personas.find(p => p.persona === persona) : undefined;
    const result = prior ? personaSchema.parse(prior) : await model.generate(personaSchema, `Simulate the ${persona} perspective, focusing on ${PERSONAS[persona]}. Assess independently. Every objection is a testable finding. Cite review IDs only when relevant; otherwise use an empty evidenceIds array. Do not treat simulation as real feedback.`, { campaign, ad, evidence });
    result.objections.forEach(f => assertReferences(f.evidenceIds, evidence.map(r => r.id)));
    personas.push({ ...result, persona, retrievedEvidenceIds: evidence.map(r => r.id), objections: result.objections.map((f, index) => ({ ...f, id: `${persona}-${index + 1}` })) });
    outputs.personas = [...personas];
    await progress('personas', outputs);
  }
  await progress('evidence_validation', outputs);
  const findings = personas.flatMap(p => p.objections);
  const rawAssessments = cached.assessments ? assessmentsSchema.parse({ assessments: cached.assessments }) : findings.length ? await model.generate(assessmentsSchema, 'Assess every supplied finding exactly once. For each finding use only its own evidenceIds. Check whether review text actually supports or contradicts the statement. Mere topic overlap is not support. No relevant evidence means hypothesis or insufficient_data. Distinguish exact-product from category or similar-product evidence.', { findings, reviews }) : { assessments: [] };
  const assessments = validateAssessments(rawAssessments.assessments, personas, reviews);
  outputs.assessments = assessments;
  await progress('synthesis', outputs);
  const synthesized = await model.generate(synthesisSchema, 'Synthesize a concise ad pre-test report. Prioritize actionable changes and real-world tests, respecting the evidence classifications. Each recommendation must cite existing findingIds and contributing personaIds. Suggested copy must not invent product claims, discounts or certifications. No sales guarantees or conversion predictions.', { campaign, ad, personas, consumerInsights, assessments });
  const recommendations = synthesized.recommendations.map(r => {
    assertReferences(r.findingIds, findings.map(f => f.id));
    const linked = assessments.filter(a => r.findingIds.includes(a.findingId));
    return { ...r, evidenceIds: [...new Set(linked.flatMap(a => a.evidenceIds))], assessments: linked };
  });
  return {
    version: 1, campaign, ad, personas, consumerInsights, assessments,
    synthesis: { ...synthesized, recommendations }, sources: reviews,
    models: { text: model.textModel, vision: model.visionModel },
    limitations: [
      'Personas and evidence assessments are AI-generated, not real interviews or independently verified conclusions.',
      'Dataset frequencies describe uploaded reviews only, not the wider market. Retrieval uses lexical overlap and supplied relevance labels.',
      'Source metadata and product relevance are uploader-supplied and have not been independently verified. Personal details in free-text reviews are not automatically redacted.',
      ...(reviews.length ? [] : ['No real consumer reviews were supplied. Consumer findings are unvalidated hypotheses.']),
      ...synthesized.limitations,
    ],
  };
}
