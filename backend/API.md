# MindMarket frontend integration

Base URL: `http://localhost:3001/api`. API-only Next.js application; frontend stays in its own workstream. The frontend dev origin defaults to `http://localhost:3000`. Set the backend `CORS_ORIGINS` to a comma-separated list for other origins. There is no authentication: run this MVP locally or behind a private access boundary.

## Flow

1. `POST /analyses` with JSON campaign context → **201**, analysis summary.
2. `POST /analyses/{id}/image` with multipart field `file` → **200**, analysis summary.
3. Optionally `POST /analyses/{id}/reviews` with multipart field `file` → **200**, `{ reviews, stats }`.
4. `POST /analyses/{id}/start` → **202**, analysis summary. Run the worker separately. Duplicate starts while queued/running are idempotent.
5. Poll `GET /analyses/{id}` every 2–3 seconds. Stop on `completed` or `failed`.
6. On completion, `GET /analyses/{id}/report` → **200**, `AnalysisReport`.

Other routes:

| Method | Route | Result |
| --- | --- | --- |
| GET | `/health` | `{ status: "ok", database: "connected", providerConfigured: boolean }`; 503 if PostgreSQL/schema unavailable. Does not prove worker liveness or Groq connectivity. |
| GET | `/analyses?limit=20&offset=0` | `{ items: AnalysisSummary[], limit, offset }`; max limit 100 |
| GET | `/analyses/{id}/image` | Sanitized JPEG image |
| GET | `/analyses/{id}/reviews` | `{ reviews: ConsumerReview[], stats: ReviewStats }` |
| OPTIONS | Any API path | CORS preflight |

## Create request

```json
{
  "brand": "Your brand",
  "product": "Reusable bottle",
  "category": "Drinkware",
  "targetAudience": "Office commuters",
  "objective": "Explain the main benefit",
  "market": "Romania",
  "language": "English",
  "productDescription": "Optional factual product description",
  "productUrl": "https://example.com/product"
}
```

The first seven fields are required, nonempty strings. `productDescription` and `productUrl` are optional. The product URL is context only; the backend does not scrape it. Request and output types live in `src/contracts.ts` (Zod schemas plus TypeScript types). Do not import server modules or credentials into frontend code.

## Analysis summary

```json
{
  "id": "UUID",
  "campaign": {},
  "status": "running",
  "stage": "personas",
  "hasImage": true,
  "imageUrl": "/api/analyses/UUID/image",
  "reviewStats": { "received": 20, "accepted": 18, "duplicates": 2 },
  "completedPersonas": 2,
  "error": null,
  "createdAt": "2026-11-07T10:00:00.000Z",
  "updatedAt": "2026-11-07T10:00:30.000Z"
}
```

`campaign` contains the supplied campaign object (omitted above for brevity). Prefix `imageUrl` with the backend origin when frontend and backend run on different ports.

Statuses: `draft → queued → running → completed | failed`. Stages: `draft`, `queued`, `ad_interpretation`, `consumer_insights`, `personas`, `evidence_validation`, `synthesis`, `completed`. A failed job retains the failed stage and includes an error. Progress is real stage state, not a completion percentage.

Only `draft` and `failed` analyses accept upload replacement. Replacing either file resets partial outputs. A failed job can be restarted with `POST .../start`. Completed analyses are immutable in the MVP; create a new one to compare or change inputs. Worker crash recovery claims the job after a two-minute expired lease. Validated checkpoints are reused on retry and recovery; interrupted stages may repeat a provider call and charge.

## Uploads and reviews

- Images: PNG, JPEG or WebP, at most **4 MiB / 20 megapixels**, single frame. Bytes are decoded, rotated, resized within 1600×1600, and re-encoded to JPEG without metadata. The stored normalized image is sent to Groq; small text may lose detail.
- Reviews: UTF-8 CSV or a JSON array, at most **1 MiB and 100 rows**. Text limit 4000 characters; duplicate text is removed after case/whitespace normalization. Invalid rows reject the whole upload. Uploading a new dataset replaces the old dataset.
- `text` is the only required review column/property. Optional: `source`, `sourceUrl`, `publishedAt` (YYYY-MM-DD), `product`, `category`, `rating` (1–5), `verifiedPurchase` (`true`/`false`), `relevance`.
- Relevance: `exact_product`, `similar_product`, `category`, `unknown` (default). This is uploader-supplied metadata, not an automatically verified match.
- Missing source becomes `user_upload`. No URL, date, rating or verified-purchase status is invented. Unknown columns such as customer name/email are dropped. Personal information inside free-text reviews is **not** automatically redacted: remove unnecessary personal data before upload.
- Original review text and allowed provenance fields are retained; IDs are server-generated UUIDs. CSV quoting supports commas and newlines.

CSV structure (illustrative fixture, **not real consumer evidence**):

```csv
text,source,sourceUrl,publishedAt,product,rating,verifiedPurchase,relevance
"Synthetic example review",demo_fixture,,2026-11-07,Bottle,4,false,exact_product
```

## Report rendering

`AnalysisReport` contains `version`, `campaign`, `ad`, `personas`, `consumerInsights`, `assessments`, `synthesis`, `sources`, `limitations`, `models`.

- `ad`: `visibleText`, `product`, `offer`, `cta`, `observedElements`, `benefits`, `claims`, `visualHierarchy`, `interpretations`, `ambiguities`. Show observations separately from interpretations.
- Five `personas`: `skeptic`, `impulsive`, `bargain`, `quality`, `rational`. Each has `firstImpression`, `strengths`, `objections`, `missingInformation`, `claimsRequiringVerification`, `recommendations`, `testingQuestions`, `retrievedEvidenceIds`. Objections have `id`, `statement`, `evidenceIds`.
- `consumerInsights`: `datasetSize`, `themes`. Each theme has `theme`, `sentiment`, `reviewIds`, `frequency`. Frequency is the count of distinct cited reviews, calculated by code, not a population estimate.
- `assessments`: one per objection, with `findingId`, `classification`, `evidenceIds`, `explanation`.
- `synthesis`: `executiveSummary`, `strengths`, `recommendations`, `limitations`. Each recommendation has `problem`, `priority`, `personaIds`, `findingIds`, `rationale`, `proposedChange`, `exampleCopy`, `testingHypothesis`, server-derived `evidenceIds` and linked `assessments`.
- `sources`: full uploaded review records. Resolve every evidence ID against these; never render model-created quotes as original sources.

Evidence classification display labels:

| API value | UI label |
| --- | --- |
| `supported` | Supported by supplied evidence |
| `partially_supported` | Partially supported |
| `hypothesis` | Unverified hypothesis |
| `contradicted` | Contradicted by supplied evidence |
| `insufficient_data` | Insufficient data |

These are AI assessments with deterministic ID/coverage checks, not human verification. Always show report limitations. No-review runs are permitted and explicitly unvalidated. Do not present persona reactions as customer interviews or prediction scores.

## Errors

```json
{ "error": { "code": "REPORT_NOT_READY", "message": "The report is not complete. Poll the analysis status." } }
```

400 invalid JSON/fields/upload; 403 forbidden browser origin; 404 missing resource; 409 state conflict/report not ready; 413 size limit; 503 missing provider configuration or unavailable database health check; 500 unexpected server error. Validation errors also contain `fields: [{ path, message }]`.

Asynchronous provider errors appear in the analysis `error` with status `failed`, not in the already-returned start response. Codes include `PROVIDER_ERROR`, `PROVIDER_UNAVAILABLE`, `INVALID_MODEL_OUTPUT`, `INVALID_EVIDENCE`, `PIPELINE_FAILED`.

The model adapter makes at most three attempts per call, including retries for invalid JSON, truncated output and schema mismatches. Truncated output receives a larger token budget; GPT-OSS calls use low reasoning effort. Validation remains mandatory on every attempt. Exhausted output retries include a diagnostic category (`token_limit`, `malformed_json`, `schema_mismatch`, or `incomplete_response`) without exposing the provider response. Restarting a failed analysis reuses its completed checkpoints.

## Minimal browser client

```ts
const base = 'http://localhost:3001/api';
const response = await fetch(`${base}/analyses`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(campaign),
});
const analysis = await response.json();
if (!response.ok) throw new Error(analysis.error.message);
const form = new FormData();
form.set('file', imageFile);
const upload = await fetch(`${base}/analyses/${analysis.id}/image`, {
  method: 'POST', body: form, // let the browser set the multipart boundary
});
if (!upload.ok) throw new Error((await upload.json()).error.message);
const start = await fetch(`${base}/analyses/${analysis.id}/start`, { method: 'POST' });
if (!start.ok) throw new Error((await start.json()).error.message);
// Poll GET /analyses/:id; only request the report after status === 'completed'.
```
# Category research extension

`POST /api/analyses/:id/rerun` creates and queues a new analysis from a completed or failed analysis's campaign, creative and existing optional evidence. It returns the new analysis summary with HTTP 202. The original report is preserved; research and all evaluation checkpoints start fresh. Active analyses or missing creatives return HTTP 409. The frontend provides this action on dashboard rows and saved-analysis pages.

The worker now emits `category_research` between `ad_interpretation` and `consumer_insights`. Starting an analysis automatically collects evidence from configured Tavily and YouTube providers; review uploads are optional.

Completed reports optionally include `research` (older reports remain compatible): `plan` (category, comparisonGroup, queries), `fetchedAt`, `model`, `providers` (name, status, count before deduplication/filtering), `warnings`, `reviews` (retained evidence), `criteria`, and `competitors`. Criteria and competitor observations cite source IDs. Live evidence is also included in the report's existing `sources` array. Provider states are `ok`, `partial`, `unavailable`, or `not_configured`; `ok` means requests succeeded, not that relevant evidence was found.

Research is saved in analysis checkpoints and reused on retries. Upload replacement resets checkpoints as before. No additional endpoint or migration is required. Credentials are server environment variables: `TAVILY_API_KEY`, `YOUTUBE_API_KEY`, optional `GROQ_RESEARCH_MODEL`.
