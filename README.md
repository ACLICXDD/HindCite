# CiteWatch

A Generative Engine Optimization (GEO) agent: tracks whether an AI answer
engine (ChatGPT/Perplexity-style) mentions your brand, whether what it says
is accurate, and whether AI crawlers and AI-referred traffic are actually
showing up in your server logs -- with [Hindsight](https://hindsight.vectorize.io/)
as the only memory/state layer. No database.

## How it works

- **`brand.yaml`** -- the brand being tracked: buyer-intent queries,
  competitors, ground-truth price/features (used to catch hallucinations).
- **`backend/probes.py`** -- the active evidence source. Asks two Groq
  models (standing in for AI answer engines) the brand's queries, retains
  the raw answers.
- **`backend/logs.py`** -- the passive evidence source. Parses real nginx/
  Apache access logs for AI crawler visits (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, ...) and AI-referral sessions
  (chatgpt.com, perplexity.ai, ...), folds in a Search Console export,
  retains one digest per day.
- **`backend/memory.py`** -- the single Hindsight client. Everything the
  app knows lives in one memory bank (`brand.yaml`'s `bank_id`).
- **`backend/app.py`** -- 5 FastAPI routes. No business logic beyond
  calling Hindsight -- the correlation between optimization actions and
  citation-share growth is done by Hindsight's own Observation
  consolidation and the self-refreshing `citation-health` Mental Model
  (see `scripts/setup_bank.py`), not by custom code here.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GROQ_API_KEY, HINDSIGHT_BASE_URL, HINDSIGHT_API_KEY
```

Get a Hindsight Cloud instance at https://ui.hindsight.vectorize.io
(promo code `MEMHACK99` for $50 in credits, added after registering in
billing). Get a Groq key at https://groq.com/.

Then, from the repo root:

```bash
python -m scripts.setup_bank       # one-time: bank config, directives, mental model
python -m scripts.seed_demo_data   # generates + retains 25 days of demo history
uvicorn backend.app:app --reload
```

## Endpoints

| Route | What it does |
|---|---|
| `POST /api/probe` | Run a live probe now (real Groq calls) |
| `POST /api/ingest-logs` | Digest today's `data/access.log` + Search Console rows |
| `GET /api/health` | Dashboard metric cards + trend (reads the Mental Model) |
| `GET /api/timeline` | Memory timeline feed (observations, experiences, facts) |
| `POST /api/chat` | Ask the agent a question; answer includes cited evidence |

## Using real data instead of the seed script

Drop a real access log at `data/access.log` and a Search Console
Performance export (reshaped to columns `date,query,impressions,clicks,
position`) at `data/search_console.csv`, then call `POST /api/ingest-logs`.
The seed script exists only to make the demo narrative (absent -> wrong
price -> comparison page ships -> citation share climbs) available
immediately -- it runs through the exact same ingestion functions.

## Tests

```bash
pip install -r requirements-dev.txt
pytest -q
```

26 tests, no live Hindsight/Groq credentials required -- `backend.probes`'s
Groq calls and `backend.app`'s Hindsight client are mocked, so these check
routing, request/response shape, error handling, and (in
`test_seed_demo_data.py`) that the generated demo data actually produces
the narrative arc the demo script claims, not just that it runs.

What's **not** covered without real credentials: an actual `retain()` ->
consolidation -> Mental Model refresh round-trip against a live Hindsight
bank. Run through the demo script below once against Hindsight Cloud
before presenting, to confirm that part end-to-end.

## Demo script

Run this once, in full, before presenting -- it both rehearses the demo
and is your end-to-end check against a live Hindsight bank (the one thing
the automated tests can't cover).

1. **Setup** (once): `python -m scripts.setup_bank` then
   `python -m scripts.seed_demo_data`. Confirm no errors -- this is your
   proof that `retain`, consolidation, and the mental-model refresh all
   actually work against your Hindsight instance.
2. **Start the API**: `uvicorn backend.app:app --reload`.
3. **Show the baseline is bad**: `POST /api/probe` -- point out the brand
   absent or misrepresented in a live answer, right now, not from the seed.
4. **Show the memory, not a chart you built**: `GET /api/timeline` -- 25
   days of retained history including an Observation stating citation
   share climbed after the comparison page shipped. Say explicitly: *this
   correlation was written by Hindsight's own consolidation, not by our
   code.*
5. **Show it reasoning over its own memory**: `POST /api/chat` with
   `{"message": "did the comparison page work?"}` -- the answer should
   cite specific dated facts (`based_on.memories` in the raw response).
6. **Close on `GET /api/health`**: the self-refreshing Mental Model's
   structured output -- the same object a real dashboard would render as
   metric cards, generated with no custom correlation code on our side.
