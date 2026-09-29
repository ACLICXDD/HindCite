# CiteWatch Frontend — Generative Engine Optimization (GEO) & AI SEO Suite

Modern Generative Engine Optimization (GEO) and AI SEO intelligence platform for tracking brand citations across AI answer engines (ChatGPT, Perplexity, Claude), catching hallucinations, monitoring AI web crawlers (GPTBot, ClaudeBot, etc.), auditing Search Console overlap, and validating optimization impact.

Built for **Loopwise CRM** using **React, Vite, TypeScript, Tailwind CSS, Recharts, and TanStack Query**.

---

## Quick Start

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The frontend runs locally at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Target FastAPI backend URL |
| `VITE_USE_MOCK` | `true` | When `true`, serves realistic 25-day Loopwise narrative data without needing live keys or a running backend |

> **Interactive Toggle**: You can switch between Mock Simulation and Live Backend anytime inside the app at **Settings -> Simulation & Demo Mode**.

---

## Aligning Types with the Real Backend Schema

All data types are centralized in **[`src/types.ts`](./src/types.ts)** and all network calls are centralized in **[`src/api.ts`](./src/api.ts)**.

The frontend types correspond directly to the FastAPI backend models defined in `backend/schemas.py`, `backend/logs.py`, and `backend/app.py`:

| Frontend TypeScript Interface (`src/types.ts`) | Backend Python Schema (`backend/schemas.py` / `logs.py`) | Source / Endpoint |
|---|---|---|
| `CitationHealthReport` | `CitationHealthReport` | `GET /api/health` (`structured`) |
| `EngineShare` | `EngineShare` | `GET /api/health` |
| `CrawledPage` | `CrawledPage` | `GET /api/health` & `logs.py` |
| `Hallucination` | `Hallucination` | `GET /api/health` |
| `RecommendedAction` | `RecommendedAction` | `GET /api/health` |
| `TimelineFact` | Hindsight `recall()` result | `GET /api/timeline` |
| `ProbeAnswer` | Raw Groq answers | `POST /api/probe` |
| `ChatResponse` / `MemorySource` | Hindsight `reflect()` response | `POST /api/chat` |
| `DailyCrawlerPoint` | Aggregated crawler visits | `logs.py` `aggregate_day()` / `POST /api/ingest-logs` |
| `DailyReferralPoint` | AI referrers + Search Console CSV | `data/search_console.csv` & `logs.py` |
| `OptimizationActionRecord` | Hindsight `kind:optimization-action` | `GET /api/timeline` & local storage |

### Schema Adjustment Note
- If you add new models to Groq in `backend/probes.py` (e.g. `llama-3.3-70b`), update the `enginesList` in `src/api.ts` and `EngineShare.engine` in `src/types.ts`.
- If you add new AI bots to `AI_BOTS` in `backend/logs.py` (e.g., `OAI-SearchBot`, `Amazonbot`), they will appear in `DailyCrawlerPoint` and the AI Crawlers stacked area chart.
- The `AiSeoScoreBreakdown` is computed dynamically from citation share, crawl coverage, accuracy, and referral momentum.

---

## Complete Features & Navigation

### 1. Citation Intelligence
- **Overview (`/`)**:
  - **AI SEO Score KPI (84/100, Grade A)**: Weighted index combining citation share, crawl health, accuracy, and referral momentum with popover breakdown.
  - **KPI Row**: Citation Share (47.0%, +35%), Best Answer Engine (`gpt-oss-120b`), Active Hallucinations count, and AI Crawler visits (7d).
  - **Answer Engine Share**: Recharts bar chart showing per-model mention rate.
  - **Red / Green Diff Cards**: Visual diff comparing AI claims (`- AI Claim: "$99/mo"`) against official ground truth (`+ Actual: "$49/mo flat"`).
  - **Crawler Access Table**: Bot-by-bot breakdown of hit pages (`GPTBot`, `ClaudeBot`, etc.).
  - **Next Best Actions**: Unified priority queue merging Hindsight recommendations with crawler blind-spot remedies and completion checkboxes.

- **Timeline Arc (`/timeline`)**:
  - 25-day citation share area chart with a vertical **ReferenceLine on Day 15** (*"Shipped /vs-competitor"*) highlighting the cause-and-effect turning point.
  - Activity feed grouped by day with type filters (`Observation`, `Experience`, `Crawler Digest`, `Optimization Action`) and text search.

- **Live Probes (`/probes`)**:
  - Interactive table of buyer queries tested against Groq answer engines (`gpt-oss-120b`, `qwen3-32b`).
  - Expandable accordions with brand mentions highlighted in emerald and competitors in neutral chips.
  - Live probe cycle execution trigger with duration counter and toast alerts.

- **Ask CiteWatch Chat (`/chat`)**:
  - Conversational GEO analyst interface with suggested prompt pills.
  - Collapsible **"Grounded Evidence" section** displaying exact memory quotes, timestamps, and classifications recalled from Hindsight bank `brand-loopwise`.

### 2. AI SEO Suite
- **AI Crawlers (`/crawlers`)**:
  - Stacked area chart of daily crawler visits broken down by bot (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Others`).
  - Table of most-crawled URLs with bot breakdown, visit counts, and last seen timestamps.
  - **Crawler Blind Spots Card**: Highlights commercial pages bots have NOT crawled (e.g. `/faq`, `/features/email-sequencing`), explaining the SEO risk and suggesting concrete fixes with estimated citation gains.

- **AI Referrals & Search (`/referrals-search`)**:
  - Bar chart of visits referred from generative engines over time split by source (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`).
  - Small multiples for Search Console performance: Impressions, Clicks, and Average Rank trends.
  - Side-by-side comparative trend: **AI Referrals vs. Classic Google Organic Clicks**.
  - Top Search Console queries table indicating which queries overlap with AI engine citations.

- **Query Visibility Matrix (`/visibility-matrix`)**:
  - Matrix grid with buyer-intent queries as rows and answer engines as columns.
  - Interactive cells with status badges (`Cited`, `Competitor Pick`, `Not Cited`) and click-to-inspect popovers showing the engine's answer snippet.
  - Competitor filtering (`PipelinePro`, `SalesHive`) and a **Share of Voice vs. Competitors** benchmark chart.

- **Optimization Impact (`/optimization-impact`)**:
  - Chronological log of optimization milestones (e.g. shipping `/vs-competitor`, injecting pricing FAQ schema).
  - **7-Day Before vs. 7-Day After cards** displaying percentage changes in Citation Share (`+226%`), Crawler Visits (`+336%`), AI Referrals (`+1300%`), and Search Rank.
  - **Interactive "Log Optimization Action" modal** that allows testing and persisting new milestones in local storage with automatic delta calculations.

- **Accuracy & Truth (`/accuracy`)**:
  - Audit table comparing official `brand.yaml` ground-truth specs ($49/mo price, email sequencing, pipeline automation, FAQ schema) against LLM claims.
  - `Match` / `Mismatch` badges and actionable "Fix This" guidance linked to affected target URLs.

### 3. System & Settings
- **Settings (`/settings`)**:
  - Backend API URL configuration with a **"Test Ping"** latency benchmark button.
  - 1-click **Simulation & Demo Mode** toggle.
  - Dark / Light / System appearance mode.
  - Live inspection of `brand.yaml` configuration.

---

## Scripts

- `npm run dev`: Starts local development server on port 3000
- `npm run build`: Type-checks and builds production bundle
- `npm run preview`: Previews production build locally
