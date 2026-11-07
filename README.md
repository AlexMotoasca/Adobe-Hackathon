# MindMarket — Consumer Intelligence & Ad Testing Platform

> **Ventriloc Design System:** Editorial data observatory on warm paper — a single orange ember punctuating monochrome precision.

MindMarket is an ad pre-flight evaluation and consumer intelligence platform built for the **Adobe Hackathon 2026**. It evaluates advertisements before ad spend deployment by simulating 5 parallel autonomous consumer psychographic personas and cross-referencing their objections against ground-truth customer review datasets.

---

## 1. Routing Architecture & Implemented Pages

| Page Route | Purpose & Key Features |
| :--- | :--- |
| **`/login`** | **Authentication & Hackathon Evaluator Bypass:** Clean sign-in with email validation, password show/hide, "Continue with Google" option, and a dedicated **"Quick Demo Access (Judge / Evaluator)"** button that sets session and instantly redirects to `/dashboard`. |
| **`/dashboard`** | **Campaign Observatory & KPI Hub:** Displays high-level metrics (Total Ads Tested, Average Readiness Score, Estimated Ad Spend Protected, Reviews Analyzed), search & risk filtering, objective dropdown filter, responsive campaigns table with **single-row Risk Status badges** (zero horizontal scroll), and empty state. |
| **`/analysis/new`** | **Campaign Ingestion & Evidence Grounding:** Features a **1-click "Load Demo Benchmark: AuraWave Pro"** button, a two-column layout for campaign copy vs multimodal ingestion, dual drag-and-drop dropzones (Creative Visual & Customer Reviews CSV/JSON), dynamic row parsing, compute estimate badge, and a Live Reddit/Forum API grounding switch. |
| **`/analysis/[id]`** | **Interactive Deep Workspace & Comprehensive Report:** Sequential 5-stage AI pipeline stepper (`ad_interpretation`, `consumer_insights`, `personas`, `evidence_validation`, `synthesis`), viability score gauge (`58/100`), 92% grounding tag, and a 3-tab inspection workspace with smooth animated bubble switching (Executive Diagnosis with SVG Radar Chart & Prioritized Action Cards; 5 Synthetic Personas; Real Evidence Explorer with traceable customer review citations and sentiment/validation status filters). |
| **`/settings`** | **Brand Workspace & Profile Customization:** Dedicated landing page allowing users to update their **Username** (which updates the live badge in the top right), Email, Role, Brand Name, Tagline, Category, Website, and Brand Logo/Creative Mark (with custom file upload and live preview card). |

---

## 2. Ventriloc Design System Specifications

The application strictly implements the **Ventriloc** design language:
- **Theme:** Light
- **Typography:**
  - **PolySans** (whisper-weight headings at weight 400 with `-0.02em` tracking — never bolded)
  - **Inter** (workhorse sans for UI chrome, captions, and body paragraphs)
  - **JetBrains Mono** (monospaced labels, badges, compute estimates)
- **Three-Radius System:**
  - Buttons: `0px` (sharp-cornered deliberate contrast)
  - Featured Cards: `6px 0px 0px 0px` (signature asymmetric top-left curve)
  - Data Dashboard Cards: `20px` (rounded data widgets)
  - Navigation Pills: `200px` (fully rounded capsule with **smooth animated bubble transitions**)
- **Single-Row Risk Badges & Centered Table:**
  - The "Risk Status" column in the campaign table is calibrated with `white-space: nowrap !important;` and fixed proportional min-width so badges ("High Conversion Risk", "Moderate Friction", "Ready to Scale") are strictly rendered on **one single row** with zero truncation dots (`..`) and zero horizontal scroll.
- **Palette (95% Achromatic):**
  - **Graphite (`#202020`):** Primary typography, dark CTAs, icon strokes
  - **Canvas White (`#ffffff`):** Page canvas and data cards
  - **Ash (`#efefef`):** Warm-gray card surfaces and navigation capsules
  - **Fog (`#f5f5f5`):** Secondary container backgrounds
  - **Ivory (`#ebe6dd`):** Featured paper-stock wash
  - **Steel (`#4d4d4d`):** Secondary body text
  - **Slate (`#828282`):** Muted helper metadata
  - **Mist (`#e8e8e8`):** Subtle hairline borders
  - **Ember Orange (`#ff682c`):** High-priority accent for highlights, link underlines, and data accents
  - **Brass (`#816729`):** Secondary warm accent for radar strokes and evaluator badges

---

## 3. Backend REST API Architecture (`backend/API.md`)

The application connects to the Next.js backend on **`http://localhost:3001/api`** (or through the local gateway on port 3000):

| Method | Endpoint | Description & Payload |
| :--- | :--- | :--- |
| **GET** | `/health` | Health check (`{ status: "ok", database: "connected", providerConfigured: boolean }`) |
| **GET** | `/analyses?limit=20&offset=0` | Lists analysis summaries (`{ items: AnalysisSummary[], limit, offset }`) |
| **POST** | `/analyses` | Creates new analysis (`{ brand, product, category, targetAudience, objective, market, language, productDescription?, productUrl? }`) → **201** |
| **POST** | `/analyses/{id}/image` | Multipart image upload (field: `file`, PNG/JPEG/WebP up to 4 MiB) → **200** |
| **POST** | `/analyses/{id}/reviews` | Multipart reviews dataset upload (field: `file`, CSV/JSON up to 1 MiB / 100 rows) → **200** |
| **POST** | `/analyses/{id}/start` | Queues and starts autonomous persona evaluation pipeline → **202** |
| **GET** | `/analyses/{id}` | Polls analysis execution status (`draft` → `queued` → `ad_interpretation` → `consumer_insights` → `personas` → `evidence_validation` → `synthesis` → `completed`) |
| **GET** | `/analyses/{id}/report` | Fetches full synthesized report (`AnalysisReport` with ad vision, 5 personas, assessments, action recommendations, sources) |
| **GET** | `/analyses/{id}/image` | Serves normalized creative visual |
| **GET** | `/analyses/{id}/reviews` | Serves customer reviews and stats |
| **GET / POST** | `/user` | Synchronizes user profile and brand workspace settings |

---

## 4. Quick Start & Execution

### Option A: Full Stack (Next.js Backend on 3001 + Frontend on 3000)
```bash
# Terminal 1 - Start Next.js backend (requires PostgreSQL & GROQ_API_KEY):
cd backend
npm run dev

# Terminal 2 - Start Frontend Server:
node server.js
```
Visit **`http://localhost:3000`**. The gateway communicates seamlessly with `http://localhost:3001/api`.

### Option B: Standalone Frontend Server (Zero PostgreSQL Required)
```bash
# On Windows:
start.cmd
# or
node server.js
```
The server on port 3000 serves all pages and provides full fallback endpoints for `backend/API.md`.

### Option C: Standalone File Protocol (Zero Server Required)
You can directly open `index.html` in Google Chrome or Microsoft Edge:
```text
Double-click index.html in file explorer
```
Both `file:///` and `http://` protocols are supported out of the box with zero CORS issues.
