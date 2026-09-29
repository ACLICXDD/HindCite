"""The 'active' evidence source: ask a couple of LLMs (standing in for
ChatGPT / Perplexity-style answer engines) the brand's buyer-intent
queries, right now, and retain whatever they say. This is what the
"Run probe" button in the demo triggers live.
"""
import os
import re
from datetime import datetime, timezone

from groq import Groq

# Recommended by the hackathon brief -- fast + generous free tier on Groq.
PERSONAS = ["openai/gpt-oss-120b", "qwen/qwen3-32b"]


def _slug(text: str, maxlen: int = 40) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:maxlen]


def run_probe_cycle(client, brand: dict) -> dict:
    groq = Groq(api_key=os.environ["GROQ_API_KEY"])
    today = datetime.now(timezone.utc).date().isoformat()

    items = []
    raw_answers = []

    for query in brand["queries"]:
        for model in PERSONAS:
            completion = groq.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": query}],
            )
            answer = completion.choices[0].message.content
            raw_answers.append({"query": query, "engine": model, "answer": answer})

            engine_slug = model.split("/")[-1]
            items.append({
                "content": answer,
                "context": "AI answer-engine citation probe",
                "metadata": {
                    "query": query,
                    "engine": model,
                    "expected_price": brand["ground_truth"]["price"],
                    "expected_features": ", ".join(brand["ground_truth"]["features"]),
                },
                # engine tag lets the dashboard filter recall() by engine later;
                # kind:live-probe separates this from crawl-digest / optimization-action facts
                "tags": [f"engine:{engine_slug}", "kind:live-probe"],
                # same document_id if you re-run today -> upserts instead of duplicating
                "document_id": f"probe-{engine_slug}-{_slug(query)}-{today}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

    client.retain_batch(bank_id=brand["bank_id"], items=items)
    return {"date": today, "probes_run": len(items), "raw_answers": raw_answers}
