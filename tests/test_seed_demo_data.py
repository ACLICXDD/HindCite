from backend.logs import aggregate_day
from scripts.seed_demo_data import DAYS, PROBE_NARRATIVE, generate_access_log, generate_search_console_csv


def test_generators_write_the_expected_files(tmp_path):
    per_day = generate_access_log(out_dir=str(tmp_path))
    rows = generate_search_console_csv(out_dir=str(tmp_path))

    assert (tmp_path / "access.log").exists()
    assert (tmp_path / "search_console.csv").exists()
    assert len(per_day) == DAYS
    assert len(rows) == DAYS


def test_crawl_and_referral_activity_ramps_up_after_the_shipped_page(tmp_path):
    """The demo's whole story is 'AI visits climbed after we shipped the
    comparison page on day 15' -- so the generated data actually has to
    show that, not just claim it in a comment."""
    per_day = generate_access_log(out_dir=str(tmp_path))

    crawls_before, referrals_before = aggregate_day(per_day[5])
    crawls_after, referrals_after = aggregate_day(per_day[20])

    total_before = sum(sum(pages.values()) for pages in crawls_before.values())
    total_after = sum(sum(pages.values()) for pages in crawls_after.values())

    assert total_after > total_before
    assert sum(referrals_after.values()) > sum(referrals_before.values())


def test_search_console_position_improves_after_day_14(tmp_path):
    rows = generate_search_console_csv(out_dir=str(tmp_path))
    early_position = rows[5]["position"]
    late_position = rows[20]["position"]
    assert late_position < early_position  # lower position number = better ranking


def test_probe_narrative_spans_absence_to_accurate_citation():
    assert PROBE_NARRATIVE[0].startswith("Loopwise CRM was not mentioned")
    assert "$99/mo" in PROBE_NARRATIVE[2]
    assert "$49/mo" in PROBE_NARRATIVE[15]
    assert max(PROBE_NARRATIVE) < DAYS
