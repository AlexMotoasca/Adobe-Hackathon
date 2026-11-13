# MindMarket

**MindMarket** is an evidence-backed, multi-agent creative analysis platform designed to evaluate advertising visuals against real-world market sentiment and distinct consumer personas. Built on a decoupled Node.js/PostgreSQL architecture with an asynchronous background worker, the system automates category research, filters noisy web data via LLM reasoning, and synthesizes actionable marketing recommendations without hallucinating metrics or customer feedback.

---

## Key Capabilities

* **Automated, Grounded Market Research:** Eliminates manual CSV uploads by dynamically querying **Tavily Search** (web excerpts) and **YouTube Data API v3** (video metadata and top-level audience comments) based on inferred product category, market, and language.
* **Strict Anti-Hallucination & Evidence Pipeline:** Source texts are deduplicated, bounded, and filtered in batches before reaching persona agents. Personas evaluate creatives using strictly contiguous, verbatim source excerpts with traceable source IDs—never synthetic reviews or invented readiness scores.
* **Multi-Persona Evaluation Engine:** Evaluates creatives across five distinct buyer archetypes (*Skeptic*, *Impulsive*, *Bargain*, *Quality*, and *Rational*), validating every objection and insight against retrieved evidence.
* **Checkpointed & Resumable Execution:** Intermediate research and persona outputs are persisted directly in PostgreSQL. Interrupted or rate-limited analyses can be resumed seamlessly without re-fetching external APIs, while explicit reruns allow fresh data collection.
* **Configurable Multi-Key Concurrency Routing:** Supports both sequential single-key execution and concurrent multi-key team routing (`GROQ_PERSONA_ROUTING=team`), isolating rate-limit retries per assigned key and serializing state checkpoints safely.
* **Transparent Reporting & Auditability:** Generates comprehensive reports detailing evidence coverage, source provenance (URLs, timestamps, publication dates), supported competitor mentions, buying criteria, and explicit coverage warnings whenever external data is limited.

---

## Architecture & Tech Stack

* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (`js/live-app.js`, `js/live-api.js`, `js/live-report.js`) served via a lightweight Node.js static server & reverse proxy (`server.js`) with zero build-step overhead.
* **Backend & Worker:** Node.js REST API (see [backend/API.md](backend/API.md)) paired with a dedicated background analysis worker polling and updating job stages every 2.5 seconds.
* **Database:** PostgreSQL for campaign persistence, paginated dashboards, job state machines, and JSONB checkpoint storage.
* **AI & Data Providers:** 
  * **Groq API** (Query planning, relevance filtering, vision/creative interpretation, persona simulation, and final synthesis).
  * **Tavily Search API** (Targeted web market research, excluding unverified forum noise).
  * **YouTube Data API v3** (Organic consumer sentiment extraction).

---

## Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* Running PostgreSQL instance
* API Keys: `GROQ_API_KEY` (required), plus `TAVILY_API_KEY` and `YOUTUBE_API_KEY` (recommended for live market research)

### Installation & Database Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
