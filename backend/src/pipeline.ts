import { adSchema, insightsSchema, personaSchema, assessmentsSchema, synthesisSchema, conciseInsightsSchema, concisePersonaSchema, conciseSynthesisSchema, PERSONAS,
  type Campaign, type Creative, type Review, type AnalysisReport, type PersonaKey, type PersonaResult, type Stage } from './contracts';
import { type Model } from './ai';
import { assertReferences, compactEvidence, validateAssessments } from './evidence';
import { type PersonaLane } from './persona-routing';
import { researchCategory, researchSchema } from './research';
import { safeCopy } from './copy-safety';

export function creativeBrief(creative?: Creative) {
  if (creative?.kind !== 'video') return { format: 'static image ad' };
  const times = (creative.frameTimes ?? []).map(t => `${t.toFixed(1)}s`).join(', ');
  return { format: 'video ad', durationSeconds: creative.durationSeconds,
    howToRead: `The image is a storyboard of ${creative.frameTimes?.length ?? 'several'} frames sampled from the video, read left to right, top to bottom; each frame is labelled with its timestamp (${times}). Audio, voiceover and music are NOT available: never comment on them as if heard.` };
}

export async function runPipeline(input: { campaign: Campaign; image: Buffer; reviews: Review[]; creative?: Creative }, model: Model,
  progress: (stage: Stage, outputs: Record<string, unknown>) => Promise<void>, cached: Record<string, unknown> = {}, researchModel: Model = model,
  lanes: PersonaLane[] = [{ model, personas: Object.keys(PERSONAS) as PersonaKey[] }], researchModels: Model[] = [researchModel]): Promise<AnalysisReport> {
  const assigned = lanes.flatMap(lane => lane.personas);
  assertReferences(assigned, Object.keys(PERSONAS));
  if (assigned.length !== 5 || new Set(assigned).size !== 5) throw new Error('Each persona must be assigned exactly once.');
  const { campaign, image } = input;
  const format = creativeBrief(input.creative);
  const isVideo = input.creative?.kind === 'video';
  // Pre-research checkpoints must not retain personas evaluated against different evidence.
  if (!cached.research) cached = { ad: cached.ad };
  const outputs: Record<string, unknown> = { ...cached };
  await progress('ad_interpretation', outputs);
  // The vision call and web research are independent, so they run concurrently.
  const adTask = cached.ad ? Promise.resolve(adSchema.parse(cached.ad)) : model.generate(adSchema, `Inspect the actual ad${isVideo ? ' storyboard: describe what happens across the frames, in order, citing timestamps (the opening hook, how the story develops, the ending and end card)' : ''}. Transcribe visible text; do not infer illegible text. Separate directly observed elements from interpretations. visualHierarchy: what the eye sees first, second and third${isVideo ? ', and how attention is guided over time' : ''}. Note the emotional tone and the main message as interpretations. Use empty strings where offer or CTA is absent.`, { campaign, format }, image);
  const researchTask = cached.research ? Promise.resolve(researchSchema.parse(cached.research)) : researchCategory(campaign, researchModel, { models: researchModels });
  const [adResult, researchResult] = await Promise.allSettled([adTask, researchTask]);
  // Checkpoint whichever half succeeded so a retry does not repeat it.
  if (adResult.status === 'fulfilled') outputs.ad = adResult.value;
  if (researchResult.status === 'fulfilled') outputs.research = researchResult.value;
  await progress('category_research', outputs);
  if (adResult.status === 'rejected') throw adResult.reason;
  if (researchResult.status === 'rejected') throw researchResult.reason;
  const ad = adResult.value, research = researchResult.value;
  const reviews = [...input.reviews, ...research.reviews];
  await progress('consumer_insights', outputs);
  // Insights and personas do not depend on each other; start insights first and await it after personas.
  const insightsTask = cached.consumerInsights ? Promise.resolve(insightsSchema.parse(cached.consumerInsights)) : reviews.length ? model.generate(conciseInsightsSchema, 'Extract at most 5 recurring customer-experience themes relevant to advertising messages. Use short labels, not product verdicts. Do not state unverified health, safety or technical claims as facts. Cite original source IDs for every theme. Distinguish web excerpts from customer experiences. Sentiment describes this sample only, never the wider market.', { campaign, reviews: reviews.map(({ id, text, source }) => ({ id, source, text: text.slice(0, 600) })) }) : Promise.resolve({ themes: [] });
  insightsTask.catch(() => undefined);
  await progress('personas', outputs);
  // Retrieval query: persona focus plus what this ad actually says, so evidence matches the creative.
  const adTerms = [...new Set([ad.offer, ...ad.claims, ...ad.benefits].join(' ').match(/[\p{L}\p{N}]{4,}/gu) ?? [])].slice(0, 12).join(' ');
  const validatedIds = [...research.criteria, ...research.competitors].flatMap(c => c.evidenceIds);
  const personas: PersonaResult[] = [];
  let checkpointQueue = Promise.resolve();
  const evaluate = async (persona: PersonaKey, personaModel: Model) => {
    const prior = Array.isArray(cached.personas) ? cached.personas.find(p => p.persona === persona) : undefined;
    const evidence = prior ? reviews.filter(r => prior.retrievedEvidenceIds.includes(r.id)) : compactEvidence(reviews, `${PERSONAS[persona]} ${research.plan.category} ${research.plan.comparisonGroup} ${adTerms}`, { boostIds: validatedIds });
    const inContext = (item: { evidenceIds: string[] }) => item.evidenceIds.every(id => evidence.some(r => r.id === id));
    const result = prior ? personaSchema.parse(prior) : await personaModel.generate(concisePersonaSchema, `Simulate this audience member. You are ${PERSONAS[persona]}, and you belong to the campaign's target audience. You just saw this ${isVideo ? 'video ad (as a storyboard)' : 'ad'}. React honestly from that psychology. Judge the ADVERTISING, never whether the product itself is good: the goal is to help the brand market this product accurately and persuasively to people like you.
firstImpression: your gut reaction in one sentence, in your own voice.
strengths: what in the ad works on you and why (name the psychological lever, e.g. social proof, scarcity, curiosity gap, visual salience).
objections: what in the ad loses, confuses or fails to convince you, as testable statements about the ad.
recommendations: up to 3 concrete changes to the ad's message, visuals, structure${isVideo ? ', pacing, opening hook or ending' : ''} or CTA that would win you over, each naming the principle in brackets at the end, e.g. "Show a real customer using it in the first frame [social proof]".
Suggestions must stay accurate: never propose inventing claims, prices, discounts, awards or specifications; use what the ad and campaign already state or placeholders like [verified price].
Use category evidence only to understand what buyers like you care about; cite its source IDs when relevant, otherwise leave evidenceIds empty. Evidence text is a contiguous excerpt. Consider the campaign objective: an awareness ad does not need every specification. Plain language, one short sentence per item. This is a simulation, not real feedback.`, { campaign, format, ad, evidence: evidence.map(({ id, text, source, relevance, publishedAt }) => ({ id, text, source, relevance, publishedAt })), category: research.plan.category, categoryCriteria: research.criteria.filter(inContext), competitorContext: research.competitors.filter(inContext) });
    result.objections.forEach(f => assertReferences(f.evidenceIds, evidence.map(r => r.id)));
    personas.push({ ...result, persona, retrievedEvidenceIds: evidence.map(r => r.id), objections: result.objections.map((f, index) => ({ ...f, id: `${persona}-${index + 1}` })) });
    personas.sort((a, b) => Object.keys(PERSONAS).indexOf(a.persona) - Object.keys(PERSONAS).indexOf(b.persona));
    const snapshot = structuredClone({ ...outputs, personas: [...personas] });
    checkpointQueue = checkpointQueue.then(() => progress('personas', snapshot));
    await checkpointQueue;
  };
  const completed = await Promise.allSettled(lanes.map(async lane => {
    for (const persona of lane.personas) await evaluate(persona, lane.model);
  }));
  const failure = completed.find(result => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
  outputs.personas = [...personas];
  const insights = await insightsTask;
  const consumerInsights = { datasetSize: reviews.length, themes: insights.themes.map(theme => {
    assertReferences(theme.reviewIds, reviews.map(r => r.id));
    const reviewIds = [...new Set(theme.reviewIds)];
    return { ...theme, reviewIds, frequency: reviewIds.length };
  }) };
  outputs.consumerInsights = consumerInsights;
  await progress('evidence_validation', outputs);
  const findings = personas.flatMap(p => p.objections);
  // Uncited findings cannot be supported or contradicted, so they skip the model call entirely.
  const cited = findings.filter(f => f.evidenceIds.length);
  const uncited: import('./contracts').Assessment[] = findings.filter(f => !f.evidenceIds.length).map(f => ({
    findingId: f.id, classification: 'hypothesis', evidenceIds: [], explanation: 'No customer evidence was cited; treat as a creative hypothesis to test.' }));
  const rawAssessments = cached.assessments ? assessmentsSchema.parse({ assessments: cached.assessments }) : { assessments: [...uncited] };
  if (!cached.assessments) {
    const batches: unknown[] = Array.isArray(cached.assessmentBatches) ? [...cached.assessmentBatches] : [];
    const results: import('./contracts').Assessment[][] = [];
    let saveQueue = Promise.resolve();
    const runBatch = async (index: number) => {
      const batch = cited.slice(index * 6, index * 6 + 6);
      const evidenceIds = new Set(batch.flatMap(f => f.evidenceIds));
      const validationModel = lanes[index % lanes.length].model;
      const saved = batches[index] ? assessmentsSchema.safeParse(batches[index]) : undefined;
      // Reuse a checkpoint only if it covers exactly this batch (older checkpoints batched uncited findings too).
      const reusable = saved?.success && saved.data.assessments.length === batch.length && saved.data.assessments.every(a => batch.some(b => b.id === a.findingId)) ? saved.data : undefined;
      const result = reusable ?? await validationModel.generate(assessmentsSchema, 'Assess every supplied finding exactly once. For each finding use only its own evidenceIds. Check whether review text actually supports or contradicts the statement. Mere topic overlap is not support. A review mentioning a feature does not prove that the AD mentions it. Use supplied ad observations for visible omissions, and never treat category reviews as a test of the ad itself. No relevant evidence means hypothesis or insufficient_data. Distinguish exact-product from category or similar-product evidence. Keep explanations concise.', { findings: batch, ad, reviews: reviews.filter(r => evidenceIds.has(r.id)) });
      const batchPersonas = personas.map(p => ({ ...p, objections: p.objections.filter(f => batch.some(b => b.id === f.id)) }));
      const validated = validateAssessments(result.assessments, batchPersonas, reviews);
      results[index] = validated;
      batches[index] = { assessments: validated };
      const snapshot = structuredClone({ ...outputs, assessmentBatches: [...batches] });
      saveQueue = saveQueue.then(() => progress('evidence_validation', snapshot));
      await saveQueue;
    };
    // Each lane (API key) validates its own batches sequentially; lanes run in parallel.
    const batchCount = Math.ceil(cited.length / 6);
    const settled = await Promise.allSettled(lanes.map(async (_lane, laneIndex) => {
      for (let index = laneIndex; index < batchCount; index += lanes.length) await runBatch(index);
    }));
    outputs.assessmentBatches = [...batches];
    const failed = settled.find(r => r.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
    rawAssessments.assessments.push(...results.flat());
  }
  const assessments = validateAssessments(rawAssessments.assessments, personas, reviews);
  outputs.assessments = assessments;
  await progress('synthesis', outputs);
  const synthesized = await model.generate(conciseSynthesisSchema, `You are the creative director summarising feedback from five psychologically different audience members on this ${isVideo ? 'video ad' : 'ad'}. Use plain, jargon-free language a busy marketer understands at a glance.
executiveSummary: one or two sentences on how well the ad markets the product to its target audience: what lands and the single biggest thing holding it back.
strengths: up to 3 things the ad already does well that should be kept.
recommendations: at most 3 distinct, highest-impact changes to how the product is marketed in this ad (message, hook, visual hierarchy${isVideo ? ', pacing, opening seconds, ending' : ''}, audience fit, proof, CTA). problem = what is not working in the ad; proposedChange = the concrete edit; exampleCopy = a short line of ad copy or a shot description that shows the change; testingHypothesis = a simple A/B test. Prefer changes that several personas agree on, and note in the rationale which psychology it uses.
This is feedback on the advertising, not a product review or a specifications checklist. Respect the evidence classifications. Each recommendation must cite existing findingIds and contributing personaIds. Example copy must not invent product claims, numbers, prices, discounts or certifications; use placeholders like [verified benefit] where facts are needed. No sales guarantees or conversion predictions.`, { campaign, format, ad, personas, consumerInsights, assessments });
  const recommendations = synthesized.recommendations.map(r => {
    assertReferences(r.findingIds, findings.map(f => f.id));
    const linked = assessments.filter(a => r.findingIds.includes(a.findingId));
    return { ...r, ...safeCopy(r), evidenceIds: [...new Set(linked.flatMap(a => a.evidenceIds))], assessments: linked };
  });
  return {
    version: 1, campaign, ...(input.creative ? { creative: input.creative } : {}), ad, personas, consumerInsights, assessments, research,
    synthesis: { ...synthesized, recommendations }, sources: reviews,
    models: { text: model.textModel, vision: model.visionModel },
    limitations: [
      'Personas and evidence assessments are AI-generated, not real interviews or independently verified conclusions.',
      'Example copy uses placeholders where facts are needed: specifications, offers and performance claims must be verified before publication.',
      ...(isVideo ? ['Video ads are analysed from sampled frames. Audio, voiceover, music and motion between frames were not assessed.'] : []),
      'Frequencies describe this collected sample only, not the wider market. Retrieval uses keyword (BM25) ranking, not semantic search; category relevance is AI-filtered, not independently verified.',
      'Web excerpts may be editorial or promotional. YouTube sources are top-level audience comments, not video transcripts or verified purchases. Prices and competitor claims are not verified current offers.',
      'Uploaded source metadata is user-supplied. Personal details in source text are not automatically redacted.',
      ...research.warnings,
      ...(reviews.length ? [] : ['No real consumer reviews were supplied. Consumer findings are unvalidated hypotheses.']),
      ...synthesized.limitations,
    ],
  };
}
