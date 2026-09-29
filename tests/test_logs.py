from backend.logs import aggregate_day, classify, load_search_console_csv, parse_log_line, render_digest

GPTBOT_LINE = (
    '10.0.0.1 - - [15/Sep/2026:10:00:00 +0000] "GET /pricing HTTP/1.1" 200 1024 '
    '"-" "Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)"'
)
PERPLEXITY_REFERRAL_LINE = (
    '10.0.0.2 - - [15/Sep/2026:10:05:00 +0000] "GET /vs-competitor HTTP/1.1" 200 1024 '
    '"https://perplexity.ai/" "Mozilla/5.0 (Macintosh)"'
)
HUMAN_DIRECT_LINE = (
    '10.0.0.3 - - [15/Sep/2026:10:06:00 +0000] "GET / HTTP/1.1" 200 1024 '
    '"-" "Mozilla/5.0 (Macintosh)"'
)


def test_parse_log_line_valid():
    entry = parse_log_line(GPTBOT_LINE)
    assert entry["ip"] == "10.0.0.1"
    assert entry["path"] == "/pricing"
    assert "GPTBot" in entry["ua"]


def test_parse_log_line_garbage_returns_none():
    assert parse_log_line("this is not a log line") is None


def test_classify_ai_crawler():
    entry = parse_log_line(GPTBOT_LINE)
    kind, key = classify(entry)
    assert (kind, key) == ("crawler", "GPTBot")


def test_classify_ai_referral():
    entry = parse_log_line(PERPLEXITY_REFERRAL_LINE)
    kind, key = classify(entry)
    assert (kind, key) == ("referral", "perplexity.ai")


def test_classify_ordinary_human_traffic_is_neither():
    entry = parse_log_line(HUMAN_DIRECT_LINE)
    assert classify(entry) == (None, None)


def test_aggregate_day_counts_and_ignores_garbage():
    crawls, referrals = aggregate_day(
        [GPTBOT_LINE, GPTBOT_LINE, PERPLEXITY_REFERRAL_LINE, HUMAN_DIRECT_LINE, "garbage"]
    )
    assert crawls["GPTBot"]["/pricing"] == 2
    assert referrals["perplexity.ai"] == 1


def test_render_digest_includes_crawls_referrals_and_search_console():
    crawls, referrals = aggregate_day([GPTBOT_LINE, PERPLEXITY_REFERRAL_LINE])
    digest = render_digest(
        "2026-09-15", crawls, referrals,
        [{"query": "best crm", "impressions": 300, "clicks": 12, "position": 8.2}],
    )
    assert "GPTBot crawled: /pricing (1x)" in digest
    assert "1 referral session(s) arrived from perplexity.ai" in digest
    assert "best crm" in digest and "8.2" in digest


def test_render_digest_no_crawler_activity_says_so():
    digest = render_digest("2026-09-15", {}, {}, [])
    assert "No AI crawler activity detected." in digest


def test_load_search_console_csv_filters_by_date(tmp_path):
    csv_path = tmp_path / "search_console.csv"
    csv_path.write_text(
        "date,query,impressions,clicks,position\n"
        "2026-09-14,best crm,280,10,8.6\n"
        "2026-09-15,best crm,300,12,8.2\n"
    )
    rows = load_search_console_csv(str(csv_path), "2026-09-15")
    assert len(rows) == 1
    assert rows[0]["impressions"] == "300"
