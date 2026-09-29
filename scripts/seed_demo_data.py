"""Stages 25 backdated days of demo history so the dashboard isn't empty
on stage. Only the RAW INPUTS here are synthetic (a generated access.log
and search_console.csv, plus a hand-authored probe narrative) -- they are
pushed through the exact same aggregate_day/render_digest/retain_digest
functions the live /api/ingest-logs route uses. Swap in a real access.log
and a real Search Console export and nothing else changes.

Run once, after setup_bank.py: python -m scripts.seed_demo_data
"""
import csv
import os
import random
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

load_dotenv()

from backend.config import load_brand
from backend.logs import aggregate_day, render_digest, retain_digest
from backend.memory import get_client

DAYS = 25
START = datetime.now(timezone.utc).date() - timedelta(days=DAYS)

AI_BOT_UAS = {
    "GPTBot": "Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.1; +https://openai.com/gptbot)",
    "ClaudeBot": "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claude-bot)",
    "PerplexityBot": "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)",
    "Google-Extended": "Mozilla/5.0 (compatible; Google-Extended)",
}
AI_REFERRER_DOMAINS = ["https://chatgpt.com/", "https://perplexity.ai/"]
PAGES = ["/", "/pricing", "/vs-competitor", "/faq", "/blog/comparison"]

# Hand-authored narrative: absent/wrong-price early, comparison page ships
# day 15, citation improves after. This is the arc the demo walks through.
PROBE_NARRATIVE = {
    0: "Loopwise CRM was not mentioned. The answer recommended PipelinePro and SalesHive instead.",
    2: "Loopwise CRM was mentioned but the price was stated as $99/mo, which is incorrect.",
    15: "Loopwise CRM was mentioned with the correct price of $49/mo, citing the new /vs-competitor page.",
    22: "Loopwise CRM was recommended as a top pick with accurate pricing and features.",
}


def make_log_line(day: int, ip: str, path: str, ua: str, referer: str = "-") -> str:
    ts = (START + timedelta(days=day)).strftime("%d/%b/%Y:%H:%M:%S +0000")
    return f'{ip} - - [{ts}] "GET {path} HTTP/1.1" 200 1024 "{referer}" "{ua}"'


def generate_access_log(out_dir: str = "data") -> dict[int, list[str]]:
    """Crawl activity ramps up after day 15 (the day the comparison page ships)."""
    per_day: dict[int, list[str]] = {}
    for day in range(DAYS):
        lines = []
        intensity = 1 if day < 15 else 4 + (day - 15)
        for ua in AI_BOT_UAS.values():
            for _ in range(intensity):
                lines.append(make_log_line(day, "10.0.0.1", random.choice(PAGES), ua))
        if day >= 16:
            for _ in range(day - 15):
                lines.append(make_log_line(
                    day, "10.0.0.2", "/vs-competitor", "Mozilla/5.0 (Macintosh)",
                    referer=random.choice(AI_REFERRER_DOMAINS),
                ))
        per_day[day] = lines

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "access.log"), "w") as f:
        for day in range(DAYS):
            f.write("\n".join(per_day[day]) + "\n")
    return per_day


def generate_search_console_csv(out_dir: str = "data") -> list[dict]:
    os.makedirs(out_dir, exist_ok=True)
    rows = []
    for day in range(DAYS):
        date = (START + timedelta(days=day)).isoformat()
        position = max(2.0, 8.5 - (day - 14) * 0.3) if day >= 14 else 8.5
        clicks = 12 + max(0, day - 14) * 2
        rows.append({
            "date": date, "query": "best crm for startups",
            "impressions": 300 + day * 8, "clicks": clicks, "position": round(position, 1),
        })
    with open(os.path.join(out_dir, "search_console.csv"), "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "query", "impressions", "clicks", "position"])
        writer.writeheader()
        writer.writerows(rows)
    return rows


def seed_logs_and_search_console(client, bank_id: str, per_day_lines: dict, all_rows: list[dict]) -> None:
    for day in range(DAYS):
        date = (START + timedelta(days=day)).isoformat()
        crawls, referrals = aggregate_day(per_day_lines[day])
        day_rows = [r for r in all_rows if r["date"] == date]
        digest = render_digest(date, crawls, referrals, day_rows)
        retain_digest(client, bank_id, date, digest, crawls, referrals)


def seed_optimization_action(client, bank_id: str) -> None:
    ship_date = (START + timedelta(days=15)).isoformat()
    client.retain(
        bank_id=bank_id,
        content="Published a new /vs-competitor comparison page with accurate pricing and FAQ schema markup.",
        context="optimization action",
        tags=["kind:optimization-action"],
        document_id="action-vs-competitor-page",
        timestamp=f"{ship_date}T09:00:00Z",
    )


def seed_probe_history(client, bank_id: str, brand: dict) -> None:
    items = []
    for day, note in PROBE_NARRATIVE.items():
        date = (START + timedelta(days=day)).isoformat()
        items.append({
            "content": note,
            "context": "AI answer-engine citation probe (historical)",
            "metadata": {
                "query": brand["queries"][0],
                "engine": "openai/gpt-oss-120b",
                "expected_price": brand["ground_truth"]["price"],
            },
            "tags": ["engine:gpt-oss-120b", "kind:live-probe"],
            "document_id": f"probe-history-{day}",
            "timestamp": f"{date}T12:00:00Z",
        })
    client.retain_batch(bank_id=bank_id, items=items)


def main():
    brand = load_brand()
    client = get_client()
    bank_id = brand["bank_id"]

    print("Generating synthetic access.log and search_console.csv ...")
    per_day_lines = generate_access_log()
    sc_rows = generate_search_console_csv()

    print("Retaining 25 days of crawl/referral/search-console digests ...")
    seed_logs_and_search_console(client, bank_id, per_day_lines, sc_rows)

    print("Retaining the optimization action ...")
    seed_optimization_action(client, bank_id)

    print("Retaining historical probe narrative ...")
    seed_probe_history(client, bank_id, brand)

    print("Refreshing the citation-health mental model ...")
    client.refresh_mental_model(bank_id=bank_id, mental_model_id="citation-health")

    print("Done. Start the API with: uvicorn backend.app:app --reload")


if __name__ == "__main__":
    main()
