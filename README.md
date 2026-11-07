# MindMarket — Consumer Intelligence & Ad Testing

MindMarket helps brands pre-test an ad using five simulated consumer perspectives and optional real customer reviews. It separates observed ad content, evidence-backed findings and unverified hypotheses. It does not predict conversion or generate video.

**Status (November 7, 2026): backend MVP implemented; frontend owned by the frontend team.** The backend lives entirely in `backend/` on the `Back-end` branch. The original brief is preserved in [docs/PRODUCT-SPEC.md](docs/PRODUCT-SPEC.md).

## Implemented backend

- API-only Next.js application with TypeScript and Zod contracts.
- PostgreSQL persistence for campaigns, sanitized image bytes, review provenance, stage checkpoints, job leases and reports. SQL migration included; no ORM or external queue service.
- PNG/JPEG/WebP decoding and normalization, bounded multipart uploads, CSV/JSON review parsing, duplicate removal and strict validation.
- Real Groq multimodal ad interpretation, consumer theme extraction, lexical evidence retrieval, five independent persona calls, evidence assessment and central synthesis.
- Deterministic evidence-ID and finding-coverage checks; source-linked recommendations, dataset counts, explicit limitations and no-review mode.
- Separate worker with atomic job claiming, heartbeat leases, crash recovery, safe retry and reuse of completed checkpoints. Persona calls are independent but sequential to reduce quota pressure.
- API error responses, status polling and configurable frontend CORS.

Frontend pages, authentication, billing, external review imports, video processing, chat, comparisons and report export are not implemented. No frontend files were created.

## Start the backend

Requirements: Node.js 20.9+ (verified with 24.11), npm, PostgreSQL (verified with 18), and a Groq API key. Dependencies are locked in `backend/package-lock.json`.

```powershell
cd backend
npm ci
Copy-Item .env.example .env.local
# Edit .env.local: DATABASE_URL, GROQ_API_KEY, and CORS_ORIGINS.
# Do not overwrite an existing configured .env.local.
```

Use your existing PostgreSQL instance, or start the included Docker database:

```powershell
docker compose up -d
npm run db:migrate
npm run dev
```

The Docker option requires Docker; it was not available in the implementation environment. When using an existing database, skip `docker compose up -d`. Migrations are tracked and safe to rerun.

In a second terminal:

```powershell
cd backend
npm run worker
```

API: `http://localhost:3001/api`. Database health: `GET /api/health`. There is no homepage; a 404 at `/` is expected. For production-mode local testing, use `npm run build` then `npm start`, plus the worker in another terminal.

The API queues jobs; **both the API and worker must be running**. Use a persistent Node host, not an ephemeral serverless function, for the worker. Authentication is outside the MVP; keep it local/private until access control is added.

### This checkout's local setup

A separate PostgreSQL 18 cluster was initialized under the ignored `backend/.local/pgdata`, listening only on `127.0.0.1:55432`, with development databases `mindmarket` and `mindmarket_test`. It uses local trust authentication for this isolated development instance. This is not the system PostgreSQL service and is not a production configuration.

The supplied Groq key is stored only in ignored `backend/.env.local`; it is never included in source files, fixtures or API responses. Rotate the key shared in chat and update that local file.

To restart this local database if needed (PowerShell, from `backend/`):

```powershell
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D .local/pgdata -l .local/postgres.log -o '-h 127.0.0.1 -p 55432 -c shared_buffers=32MB -c max_connections=30' -w start
```

Local background API/worker logs are in `.local/api.log`, `.local/api-error.log`, `.local/worker.log`, `.local/worker-error.log`; their launch PIDs are in `.local/processes.json`. Stop those processes before running another API instance on port 3001.

## Frontend handoff

Read [backend/API.md](backend/API.md) for routes, payload examples, uploads, statuses, errors and report rendering. Shared schemas/types are in [backend/src/contracts.ts](backend/src/contracts.ts).

The core integration flow is:

```text
POST /api/analyses
POST /api/analyses/:id/image
POST /api/analyses/:id/reviews  (optional)
POST /api/analyses/:id/start
GET  /api/analyses/:id         (poll actual status)
GET  /api/analyses/:id/report
```

Default frontend origin: `http://localhost:3000`. Keep Groq calls and credentials exclusively on the backend. Render the source reviews alongside findings; label personas as simulations. Show insufficient-evidence and failure states rather than fabricated results.

## Structure

```text
backend/
  app/api/[...path]/route.ts  Next.js HTTP entry point
  src/contracts.ts           Shared Zod schemas and TypeScript contracts
  src/http.ts                Routing, bounded bodies, CORS and error responses
  src/repository.ts          PostgreSQL reads, writes and atomic queue claiming
  src/ingestion.ts           Image and review validation
  src/ai.ts                  Groq adapter, timeouts, retries and output validation
  src/pipeline.ts            Ad → insights → personas → validation → synthesis
  src/evidence.ts            Retrieval and deterministic evidence checks
  src/jobs.ts                Job execution, checkpoints, leases and failure state
  src/worker.ts              Persistent queue worker
  migrations/               Versioned SQL
  scripts/                  Migration, provider check and live smoke test
  tests/                    Unit and PostgreSQL integration tests
  API.md                    Frontend integration contract
```

## Verification

```powershell
cd backend
npm run typecheck
npm test
npm run build
```

`npm test` runs unit/pipeline tests; the PostgreSQL integration case is skipped unless `TEST_DATABASE_URL` is supplied. Use a dedicated database whose name ends in `_test` (never production):

```powershell
$env:TEST_DATABASE_URL='postgresql://mindmarket@127.0.0.1:55432/mindmarket_test'
npm test
```

Live provider check (uses API quota):

```powershell
npx tsx --env-file=.env.local scripts/check-provider.ts
```

Full HTTP smoke test, with API and worker running (uses API quota and creates a clearly labeled synthetic test analysis, without consumer reviews):

```powershell
npx tsx scripts/smoke.ts
```

To resume a failed synthetic smoke analysis without repeating completed model stages, set `SMOKE_ANALYSIS_ID` to its ID before running the smoke script. Clear it to create a new test.

Verified during implementation: production build, TypeScript check, 14 automated tests including actual PostgreSQL lifecycle/concurrency/recovery, live Groq structured text/image requests, and the full HTTP → PostgreSQL → Groq vision → five personas → saved report smoke test. The live synthetic-ad run hit a rate limit at synthesis, then successfully resumed from checkpoints and completed. This verifies the no-review flow; real-ad/real-review acceptance remains pending.

## Evidence and MVP limits

- Never invent reviews, source URLs or purchase verification. Only uploaded provenance is retained; relevance metadata is uploader-supplied.
- Image input is capped at 4 MiB / 20 megapixels; datasets at 1 MiB / 100 rows. Uploaded images are normalized, which may reduce tiny text legibility.
- Evidence retrieval uses lexical overlap, not embeddings. Persona and support assessments remain AI judgments; structural checks do not independently prove factual correctness.
- Uploaded free-text reviews may still contain personal data; remove unnecessary personal details before upload. Unknown structured customer fields are discarded.
- Dataset theme frequency is a count of cited uploaded reviews, not a population estimate. Competitor/category evidence is not proof of a defect in the analyzed product.
- No reviews means consumer findings are explicitly unvalidated. Tests with synthetic fixtures are engineering checks, not real consumer validation.
- Groq availability and quotas vary by account. Current defaults were verified against this account: `openai/gpt-oss-120b` for text and `qwen/qwen3.8-27b` for vision. Both are environment-configurable. Rate-limit responses are retried with bounded waits; exhausted retries produce a failed job that can be resumed.
- Still needed before the hackathon demo: frontend integration and a full run using a real, authorized ad and real reviews. No real campaign assets were supplied in this task.
