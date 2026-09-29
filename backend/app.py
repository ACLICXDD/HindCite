"""CiteWatch API. Five routes, no database -- Hindsight is the only store.
Run: uvicorn backend.app:app --reload
"""
import os
from datetime import date as date_cls

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import load_brand
from backend.logs import aggregate_day, load_search_console_csv, render_digest, retain_digest
from backend.memory import get_client
from backend.probes import run_probe_cycle
from backend.schemas import ChatRequest

app = FastAPI(title="CiteWatch")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

brand = load_brand()
client = get_client()


@app.post("/api/probe")
def probe():
    """Run a live probe cycle now (calls Groq, retains the results)."""
    return run_probe_cycle(client, brand)


@app.post("/api/ingest-logs")
def ingest_logs():
    """Digest today's access log + Search Console rows and retain them.
    Expects data/access.log and (optionally) data/search_console.csv."""
    today = date_cls.today().isoformat()

    log_path = "data/access.log"
    if not os.path.exists(log_path):
        return {"error": f"no log file at {log_path}"}
    with open(log_path) as f:
        lines = f.readlines()

    sc_path = "data/search_console.csv"
    sc_rows = load_search_console_csv(sc_path, today) if os.path.exists(sc_path) else []

    crawls, referrals = aggregate_day(lines)
    digest = render_digest(today, crawls, referrals, sc_rows)
    retain_digest(client, brand["bank_id"], today, digest, crawls, referrals)

    return {"date": today, "digest": digest}


@app.get("/api/health")
def health():
    """The dashboard's metric cards + trend -- reads the self-refreshing
    citation-health Mental Model. See scripts/setup_bank.py."""
    model = client.get_mental_model(bank_id=brand["bank_id"], mental_model_id="citation-health")
    return {
        "content": model.content,
        "structured": model.reflect_response.structured_output if model.reflect_response else None,
        "last_refreshed_at": model.last_refreshed_at,
    }


@app.get("/api/timeline")
def timeline():
    """The memory timeline feed: recent observations, experiences, and facts."""
    result = client.recall(
        bank_id=brand["bank_id"],
        query="citation history, crawler activity, ranking changes and optimization actions over time",
        types=["observation", "experience", "world"],
        budget="mid",
        max_tokens=3000,
    )
    return {
        "results": [
            {
                "id": r.id,
                "text": r.text,
                "type": r.type,
                "context": r.context,
                "tags": r.tags,
                "occurred_start": r.occurred_start,
                "mentioned_at": r.mentioned_at,
            }
            for r in result.results
        ]
    }


@app.post("/api/chat")
def chat(req: ChatRequest):
    """Ask the agent a question; answer comes with its cited evidence."""
    response = client.reflect(bank_id=brand["bank_id"], query=req.message, include_facts=True)
    sources = []
    if response.based_on:
        for m in response.based_on.memories:
            sources.append({"text": m.text, "type": m.type, "occurred_start": m.occurred_start})
    return {"text": response.text, "sources": sources}
