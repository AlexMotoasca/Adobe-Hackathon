# MindMarket — Consumer Intelligence & Ad Testing

MindMarket is a planned web application that helps brands evaluate advertisements before spending money on distribution. It combines five simulated consumer perspectives with evidence from real customer feedback, then turns the findings into specific, testable improvements.

**Current status: planning only.** As of November 7, 2026, this repository has no application implementation. The product specification supplied for the project describes intended behavior, not working features. This README is the starting point for contributors and AI coding assistants.

## 1. Project goal

Help brands, agencies, and online stores answer:

- Is the advertisement clear, credible, and relevant?
- Which consumer objections does it leave unanswered?
- Which findings are supported by real feedback, and which are AI hypotheses?
- What should change in the message, and how should that change be tested?

The product focuses on **ad pre-testing and consumer intelligence**. It is not an ad generator, video generator, campaign manager, or validated conversion predictor.

The initial target is a credible, end-to-end MVP for a 12-hour Adobe hackathon.

## 2. What is implemented

| Area | Current state |
| --- | --- |
| Project documentation | This README describes the goal, scope, boundaries, and proposed implementation. |
| Frontend | Not implemented. No pages, components, styling, or application entry point. |
| Backend | Not implemented. No HTTP endpoints, orchestration, or persistence. |
| AI and consumer data | Not implemented. No model calls, review processing, retrieval, or agents. |
| Shared contracts | Not implemented. No schemas or request/response types. |
| Tooling | No dependency manifest, application scripts, test suite, or deployment configuration. |

There are currently **no install, development, build, or test commands** for this application. Add verified setup instructions when the corresponding code exists.

### Current repository map

```text
Adobe-Hackathon/
└── README.md       # Project overview and implementation status
```

Local Git and assistant metadata may also exist. They are not application code.

## 3. Workstream boundaries

Keep frontend and backend work separate so contributors working across projects can develop independently. A third logical workstream covers AI and consumer data; it remains part of the backend unless the team explicitly decides otherwise.

| Workstream | Owns | Depends on |
| --- | --- | --- |
| Frontend | Pages, forms, uploads UI, progress display, charts, evidence inspection, report presentation | Agreed API contracts and backend responses |
| Backend | HTTP interface, upload validation/storage, persistence, job state, orchestration, error handling | Shared schemas and AI/data module outputs |
| AI / consumer data | Ad interpretation, review processing, retrieval, persona analysis, evidence validation, synthesis | Validated campaign inputs, media, and real reviews |

**Repository boundaries are not configured yet.** This checkout contains neither a frontend nor a backend project, and no companion repository names or URLs have been supplied. The sections below define responsibilities, not existing directories or deployed services.

For the MVP, prefer one modular application over microservices. If implementation lives in separate repositories, record their links, owners, setup commands, and contract locations here before integration.

## 4. Frontend — planned scope

### Responsibility

Collect campaign inputs and present analysis results in a clear, premium dark-mode interface. Make simulated reactions, actual consumer evidence, and unsupported hypotheses visibly distinct.

### Proposed stack from the brief

Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, and Lucide icons. Motion animations are optional. These are recommendations; no packages or versions have been installed or selected in this repository.

### Planned screens

| Screen | Expected behavior |
| --- | --- |
| Dashboard | List analyses, uploaded ads, processing status, issue counts, and report links. |
| New Analysis | Collect brand, product, category, target audience, objective, market, language, optional product URL, ad image, and optional review file. |
| Analysis Progress | Show actual backend stages, failures, and completion status. |
| Consumer Focus Group | Display five persona evaluations, objections, strengths, recommendations, and associated evidence. |
| Real Consumer Intelligence | Show review counts, sentiment, recurring themes, original excerpts, provenance, relevance, and dataset limitations. |
| Final Report | Present the ad, executive summary, strengths, prioritized issues, evidence, suggested copy, test hypotheses, and limitations. |

### Frontend integration rules

- Render backend results instead of generating analysis outcomes in UI components.
- Derive progress from real operation state; do not use timers to imply successful analysis.
- Provide loading, empty, invalid-file, failure, and insufficient-evidence states.
- Allow users to trace findings back to original review excerpts and source metadata.
- Keep provider credentials and model calls on the backend.
- Clearly label any demo fixtures; never present sample feedback as real consumer evidence.

Interactive persona chat, ad-version comparison, and report export are secondary features, not implemented MVP capabilities.

## 5. Backend — planned scope

### Responsibility

Accept campaign context and files, validate inputs, run the analysis pipeline, preserve source provenance, persist results, and expose structured data for the frontend.

### Proposed stack from the brief

Next.js Route Handlers, TypeScript, Zod validation, and SQLite or PostgreSQL. Prisma is optional. Groq is the proposed AI provider; actual model availability and image support must be verified before implementation. No provider, database, or credentials are configured here.

### Planned backend modules

| Module | Responsibility |
| --- | --- |
| Analysis management | Create analyses, associate campaign context and media, track state, retrieve results. |
| Media ingestion | Validate and store ad images; video processing is optional later. |
| Ad interpretation | Extract visible text, product, offer, CTA, benefits, claims, visual hierarchy, and possible ambiguity. Separate observation from interpretation. |
| Review ingestion | Parse CSV and optionally JSON, normalize fields, remove obvious duplicates, minimize unnecessary personal information, and preserve provenance. |
| Consumer insights | Extract sentiment, benefits, complaints, expectations, objections, and recurring themes with dataset counts. |
| Evidence retrieval | Retrieve relevant review excerpts for each persona using text, semantic, or hybrid search. |
| Persona execution | Run five independent evaluations against the same factual ad/product context and relevant evidence. |
| Evidence validation | Assess whether each finding is supported, partially supported, hypothetical, contradicted, or lacks data. |
| Central synthesis | Combine findings and generate prioritized, evidence-linked improvements and a final report. |

### API boundary

No endpoints exist yet. Agree on concrete routes and schemas before frontend integration. The initial interface needs operations to:

1. Create an analysis with campaign context.
2. Upload an ad image and a review dataset.
3. Start the analysis pipeline.
4. Retrieve actual stage status and errors.
5. Retrieve the completed report, persona outputs, insights, and supporting sources.

Pipeline stages should be independently testable modules; they do not each need a public HTTP endpoint. Keep AI logic separate from HTTP handlers.

Chat and comparison operations can be added after the core flow works. Authentication, billing, external review imports, and campaign-platform integrations are outside the initial implementation priority.

### Errors and incomplete results

Handle invalid uploads, malformed review data, provider failures, timeouts, invalid model output, and insufficient evidence explicitly. If a required stage fails, do not mark the analysis complete or describe its recommendations as validated.

## 6. AI and consumer data — planned pipeline

```text
Ad image + campaign context + optional real reviews
    → Structured ad interpretation
    → Review cleaning and consumer insight extraction
    → Evidence retrieval for each persona
    → Five independent persona evaluations
    → Evidence validation
    → Central synthesis and improvement recommendations
    → Structured report with traceable sources
```

Use one independent round per persona, ideally in parallel, followed by validation and synthesis. Avoid unlimited agent conversations. Validate all programmatically consumed AI outputs with structured schemas and reuse intermediate results.

### Five consumer perspectives

| Persona | Focus |
| --- | --- |
| The Skeptic | Credibility, unsupported promises, missing proof, purchase risk, and transparency. |
| The Impulsive Buyer | Initial visual impact, emotion, hook, simplicity, and CTA clarity. |
| The Bargain Hunter | Price, value, discounts, additional costs, and promotion conditions. |
| The Quality-Oriented Buyer | Materials, durability, performance, differentiation, and evidence of quality. |
| The Rational Buyer | Practical need, product usefulness, clear specifications, alternatives, and purchase risks. |

Each persona should return a simulated first impression, attractive elements, objections, missing information, claims requiring verification, associated evidence IDs, recommendations, and questions for real-world testing.

These personas are exploratory tools, not validated representations of a population or interviews with real people.

### Evidence classification

Every important finding should receive one of these labels:

- **Supported by real evidence:** relevant sources support the observation.
- **Partially supported:** some evidence exists, but its coverage or relevance is limited.
- **Hypothesis:** plausible interpretation that remains unverified.
- **Contradicted:** available evidence conflicts with the observation.
- **Insufficient data:** the available information cannot support an assessment.

Without relevant reviews, allow synthetic analysis but explicitly state that its consumer findings are not validated by real feedback.

## 7. Shared data contracts — proposed, not implemented

All cross-workstream data should be JSON-serializable and validated. The table describes conceptual entities, not existing TypeScript types or database tables.

| Entity | Intended contents |
| --- | --- |
| Brand | Name, category, description, audience, market, language, product context. |
| Advertisement | Media reference/type, brand/product association, campaign objective, structured ad interpretation. |
| ConsumerReview | Original text, source, source URL, publication date, product/category, rating, purchase verification if available, relevance. |
| ConsumerInsight | Theme, sentiment, frequency within the analyzed dataset, supporting review IDs, relevance. |
| PersonaAnalysis | Persona, first impression, strengths, objections, missing information, evidence references, recommendations. |
| EvidenceAssessment | Finding reference, support classification, source references, explanation. |
| Recommendation | Problem, priority, contributing personas, evidence, rationale, proposed change, example copy, testing hypothesis. |
| AnalysisReport | Advertisement, persona outputs, consumer insights, assessments, recommendations, limitations. |

Before implementation, agree on identifiers, required versus optional fields, status values, error responses, upload limits, and schema ownership. Preserve evidence IDs from original review through final recommendation.

## 8. Evidence and product rules

- Never invent reviews, citations, source URLs, or verified purchase information.
- Use supplied data with appropriate usage rights or authorized external sources.
- Preserve original feedback and provenance while minimizing personal information.
- Distinguish evidence about the exact product, similar products, and the broader category. Competitor feedback does not prove a defect in the analyzed product.
- Report theme frequency within the analyzed dataset; do not imply it represents all buyers.
- Separate directly observed ad content, AI interpretations, and testable hypotheses.
- Do not derive purchase probabilities, conversion forecasts, or guaranteed sales improvements from persona opinions.
- Use heuristic scores only with an explicit, repeatable rubric and label them accordingly.
- Communicate dataset size, relevance, missing evidence, and representativeness limits.

## 9. MVP delivery order and acceptance

All items below are pending.

- [ ] Agree on shared request/response schemas and project ownership.
- [ ] Build campaign entry and ad-image upload.
- [ ] Implement real multimodal ad interpretation.
- [ ] Import a real review CSV and preserve its sources.
- [ ] Extract consumer themes and retrieve evidence for personas.
- [ ] Run all five personas independently.
- [ ] Validate findings against retrieved evidence.
- [ ] Generate prioritized, source-linked recommendations.
- [ ] Display focus group results, consumer insights, and the final report.
- [ ] Let users inspect the evidence behind findings.
- [ ] Demonstrate the full flow without manual backend intervention.
- [ ] Verify one complete case with a real ad and real reviews, plus insufficient or contradictory evidence cases.

Build one working path from upload to report before expanding the product.

### Later, if time permits

Video upload with frame extraction and audio transcription; persona chat; ad-version comparison using consistent evidence and scoring; PDF export; authorized Shopify integration; full project history; advanced charts; partial reanalysis after copy changes.

## 10. Guidance for contributors and AI assistants

1. Read the implementation-status section first. Do not assume a feature exists because this document describes it.
2. Inspect the actual repository before making changes; update this README as code lands.
3. Keep frontend presentation, backend coordination, and AI/data logic separate.
4. Agree on shared contracts before independently implementing dependent features.
5. Prefer a small, working end-to-end flow over broad scaffolding or distributed infrastructure.
6. Keep secrets out of source control and browser code. Document required environment variable names when configuration is implemented, without including values.
7. Add actual file paths, commands, endpoint descriptions, and validation results as they become available. Do not invent them in advance.
8. Follow repository instructions, including using Context7 for current library/API documentation when implementing library-dependent behavior.
9. Mark partially implemented or demo-only features clearly; a UI mockup does not mean its backend works.
10. Keep this document aligned with the code so another contributor or AI assistant can resume work without guessing.

### Handoff checklist

When delivering a feature, record its status, owning workstream, entry files, input/output contract, setup requirements, verification performed, and remaining limitations. When companion repositories are established, add their exact links and integration responsibilities here.
