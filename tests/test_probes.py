from unittest.mock import MagicMock, patch

from backend.probes import PERSONAS, _slug, run_probe_cycle

BRAND = {
    "bank_id": "brand-test",
    "queries": ["best crm for a 10-person startup"],
    "ground_truth": {"price": "$49/mo", "features": ["pipeline automation"]},
}


def test_slug_is_filesystem_and_id_safe():
    assert _slug("Loopwise vs PipelinePro: Pricing?!") == "loopwise-vs-pipelinepro-pricing"


def _fake_groq_completion(text):
    completion = MagicMock()
    completion.choices[0].message.content = text
    return completion


def test_run_probe_cycle_retains_one_item_per_query_engine_pair():
    fake_hindsight = MagicMock()

    with patch("backend.probes.Groq") as MockGroq:
        MockGroq.return_value.chat.completions.create.return_value = _fake_groq_completion(
            "Loopwise CRM is a solid pick at $49/mo."
        )
        result = run_probe_cycle(fake_hindsight, BRAND)

    assert result["probes_run"] == len(BRAND["queries"]) * len(PERSONAS)
    assert len(result["raw_answers"]) == result["probes_run"]

    fake_hindsight.retain_batch.assert_called_once()
    call = fake_hindsight.retain_batch.call_args
    assert call.kwargs["bank_id"] == "brand-test"

    items = call.kwargs["items"]
    assert len(items) == result["probes_run"]
    engines_seen = {item["metadata"]["engine"] for item in items}
    assert engines_seen == set(PERSONAS)

    for item in items:
        assert item["metadata"]["expected_price"] == "$49/mo"
        assert "kind:live-probe" in item["tags"]
        assert any(t.startswith("engine:") for t in item["tags"])
