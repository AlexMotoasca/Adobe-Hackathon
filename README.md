# MindMarket — Consumer Intelligence & Ad Testing Platform

> **Ventriloc Design System:** Editorial data observatory on warm paper — a single orange ember punctuating monochrome precision.

MindMarket is an ad pre-flight evaluation and consumer intelligence platform built for the **Adobe Hackathon 2026**. It evaluates advertisements before ad spend deployment by simulating 5 parallel autonomous consumer psychographic personas and cross-referencing their objections against ground-truth customer review datasets.

---

## 1. Routing Architecture & Implemented Pages

| Page Route | Purpose & Key Features |
| :--- | :--- |
| **`/login`** | **Authentication & Hackathon Evaluator Bypass:** Clean sign-in with email validation, password show/hide, and a dedicated **"Quick Demo Access (Judge / Evaluator)"** button that sets session and instantly redirects to `/dashboard`. |
| **`/dashboard`** | **Campaign Observatory & KPI Hub:** Displays high-level metrics (Total Ads Tested, Average Readiness Score, Estimated Ad Spend Protected, Reviews Analyzed), search & risk filtering, responsive campaigns table with **single-row Risk Status badges**, and an empty state. |
| **`/analysis/new`** | **Campaign Ingestion & Evidence Grounding:** Features a **1-click "Load Demo Benchmark: AuraWave Pro"** button, a two-column layout for campaign copy vs multimodal ingestion, dual drag-and-drop dropzones (Creative Visual & Customer Reviews CSV), and a dynamic Live Reddit/Forum API grounding switch. |
| **`/analysis/[id]`** | **Interactive Deep Workspace & Comprehensive Report:** Sequential 5-stage AI pipeline stepper, viability score gauge (`58/100`), 92% grounding tag, and a 3-tab inspection workspace with smooth animated bubble switching (Executive Diagnosis with SVG Radar Chart & Prioritized Action Cards; 5 Synthetic Personas; Real Evidence Explorer with traceable customer review citations). |
| **`/settings`** | **Brand Workspace & Profile Customization:** Dedicated landing page allowing users to update their **Username** (which updates the live badge in the top right), Email, Role, Brand Name, Tagline, Category, Website, and Brand Logo/Creative Mark. Synchronized with the backend REST API. |

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
- **Single-Row Risk Badges:**
  - The "Risk Status" column in the campaign table is calibrated with `white-space: nowrap !important;` and fixed proportional min-width so badges ("High Conversion Risk", "Moderate Friction", "Ready to Scale") are strictly rendered on **one single row**.
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

## 3. REST API Architecture (`server.js`)

The server implements a clean, robust REST API:
- `GET /api/health` — System status and timestamp
- `GET /api/user` — Returns current user profile and brand details
- `POST /api/user` (or `PUT`) — Updates user profile (username, brand name, logo, role, email)
- `GET /api/campaigns` — Returns campaigns list
- `GET /api/campaigns/:id` — Returns single campaign report details
- `POST /api/campaigns` — Creates a new campaign
- `POST /api/simulate` — Synthesizes pipeline progress and persona evaluations

---

## 4. Quick Start & Execution

### Option A: Using the Local Server
```bash
# On Windows:
start.cmd
# or
node server.js
```
The server will start at **`http://localhost:3000`**.

### Option B: Standalone File Protocol (Zero Server Required)
You can directly open `index.html` in Google Chrome or Microsoft Edge:
```text
Double-click index.html in file explorer
```
Both `file:///` and `http://` protocols are supported out of the box with zero CORS issues.
