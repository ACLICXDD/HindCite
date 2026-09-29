"""The 'passive' evidence source: parse real server access logs for AI
crawler visits and AI-referral sessions, fold in a Search Console export,
and retain one digest per day. This is real, verifiable data instead of
a simulated probe -- see README for where the files come from.
"""
import csv
import re
from collections import defaultdict

# Well-known AI crawler user-agent substrings -> who owns them.
# Verify against the current list before a live demo; bots get added/renamed.
AI_BOTS = {
    "GPTBot": "openai",
    "OAI-SearchBot": "openai",
    "ClaudeBot": "anthropic",
    "PerplexityBot": "perplexity",
    "Google-Extended": "google",
    "Bytespider": "bytedance",
    "Amazonbot": "amazon",
    "Applebot-Extended": "apple",
    "CCBot": "commoncrawl",
}

# Referrer domains for humans who clicked through from an AI answer.
AI_REFERRERS = ["chatgpt.com", "perplexity.ai", "copilot.microsoft.com", "gemini.google.com", "you.com"]

# Standard nginx/Apache combined log format.
LOG_LINE_RE = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<path>\S+) \S+" '
    r'(?P<status>\d+) (?P<size>\S+) "(?P<referer>[^"]*)" "(?P<ua>[^"]*)"'
)


def parse_log_line(line: str) -> dict | None:
    m = LOG_LINE_RE.match(line)
    return m.groupdict() if m else None


def classify(entry: dict) -> tuple[str | None, str | None]:
    """Returns ('crawler', bot_name), ('referral', domain), or (None, None)."""
    ua, referer = entry["ua"], entry["referer"]
    for bot in AI_BOTS:
        if bot in ua:
            return "crawler", bot
    for domain in AI_REFERRERS:
        if domain in referer:
            return "referral", domain
    return None, None


def aggregate_day(log_lines: list[str]) -> tuple[dict, dict]:
    """Returns (crawls, referrals): crawls is bot -> path -> count,
    referrals is domain -> session count."""
    crawls: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    referrals: dict[str, int] = defaultdict(int)

    for line in log_lines:
        entry = parse_log_line(line)
        if not entry:
            continue
        kind, key = classify(entry)
        if kind == "crawler":
            crawls[key][entry["path"]] += 1
        elif kind == "referral":
            referrals[key] += 1

    return crawls, referrals


def render_digest(date: str, crawls: dict, referrals: dict, search_console_rows: list[dict]) -> str:
    lines = [f"Daily crawl + search + referral digest for {date}:"]

    if crawls:
        for bot, pages in crawls.items():
            top = sorted(pages.items(), key=lambda kv: -kv[1])[:3]
            pages_str = ", ".join(f"{p} ({c}x)" for p, c in top)
            lines.append(f"- {bot} crawled: {pages_str}")
    else:
        lines.append("- No AI crawler activity detected.")

    for domain, count in referrals.items():
        lines.append(f"- {count} referral session(s) arrived from {domain}")

    for row in search_console_rows:
        lines.append(
            f"- Search Console: '{row['query']}' impressions {row['impressions']}, "
            f"clicks {row['clicks']}, avg position {row['position']}"
        )

    return "\n".join(lines)


def load_search_console_csv(path: str, date: str) -> list[dict]:
    """Expects a CSV exported from Search Console's Performance report,
    reshaped to columns: date,query,impressions,clicks,position."""
    rows = []
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            if row.get("date") == date:
                rows.append(row)
    return rows


def retain_digest(client, bank_id: str, date: str, digest_text: str, crawls: dict, referrals: dict) -> None:
    total_crawls = sum(sum(pages.values()) for pages in crawls.values())
    total_referrals = sum(referrals.values())

    client.retain(
        bank_id=bank_id,
        content=digest_text,
        context="daily AI-crawler, referral and search-console digest",
        metadata={
            "date": date,
            "total_ai_crawls": str(total_crawls),
            "total_ai_referrals": str(total_referrals),
        },
        tags=["kind:crawl-digest"],
        # same document_id if you ingest today twice -> upserts instead of duplicating
        document_id=f"digest-{date}",
        timestamp=f"{date}T23:59:00Z",
    )
