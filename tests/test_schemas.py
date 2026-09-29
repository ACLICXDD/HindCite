from backend.schemas import CitationHealthReport


def test_json_schema_has_expected_top_level_fields():
    schema = CitationHealthReport.model_json_schema()
    for field in (
        "citation_share_pct", "trend_direction", "engines",
        "top_crawled_pages", "top_hallucinations", "recommended_actions",
    ):
        assert field in schema["properties"]


def test_a_realistic_report_validates():
    report = CitationHealthReport(
        citation_share_pct=47.0,
        trend_direction="up",
        trend_delta_30d_pct=35.0,
        engines=[{"engine": "gpt-oss-120b", "mentioned_pct": 52.0}],
        top_crawled_pages=[{"page": "/pricing", "bot": "GPTBot", "visits": 14}],
        ai_referral_sessions_7d=9,
        top_hallucinations=[{"claim": "$99/mo", "correct_value": "$49/mo", "status": "resolved"}],
        recommended_actions=[{
            "action": "Publish pricing FAQ",
            "rationale": "qwen3-32b still misstates price",
            "evidence_quote": "the price was stated as $99/mo",
        }],
    )
    assert report.citation_share_pct == 47.0
