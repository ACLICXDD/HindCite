"""Route tests. The Hindsight client on backend.app is swapped for a
MagicMock before each test, so these verify routing, request/response
shape and error handling without needing a live Hindsight instance.
"""
import os
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from backend import app as app_module

client_app = TestClient(app_module.app)


@pytest.fixture(autouse=True)
def fake_hindsight_client(monkeypatch):
    fake = MagicMock()
    monkeypatch.setattr(app_module, "client", fake)
    return fake


def test_health_reads_the_mental_model(fake_hindsight_client):
    fake_model = MagicMock()
    fake_model.content = "Citation share is 47%, up from 12%."
    fake_model.last_refreshed_at = "2026-09-29T00:00:00Z"
    fake_model.reflect_response.structured_output = {"citation_share_pct": 47.0}
    fake_hindsight_client.get_mental_model.return_value = fake_model

    resp = client_app.get("/api/health")

    assert resp.status_code == 200
    body = resp.json()
    assert body["content"] == "Citation share is 47%, up from 12%."
    assert body["structured"]["citation_share_pct"] == 47.0
    fake_hindsight_client.get_mental_model.assert_called_once_with(
        bank_id=app_module.brand["bank_id"], mental_model_id="citation-health"
    )


def test_health_handles_missing_reflect_response(fake_hindsight_client):
    fake_model = MagicMock()
    fake_model.content = ""
    fake_model.reflect_response = None
    fake_hindsight_client.get_mental_model.return_value = fake_model

    resp = client_app.get("/api/health")

    assert resp.status_code == 200
    assert resp.json()["structured"] is None


def test_timeline_shapes_recall_results(fake_hindsight_client):
    fake_fact = MagicMock()
    fake_fact.id = "fact-1"
    fake_fact.text = "citation share rose 12%->47%"
    fake_fact.type = "observation"
    fake_fact.context = "daily digest"
    fake_fact.tags = ["kind:crawl-digest"]
    fake_fact.occurred_start = "2026-09-15T00:00:00Z"
    fake_fact.mentioned_at = "2026-09-15T23:59:00Z"

    fake_result = MagicMock()
    fake_result.results = [fake_fact]
    fake_hindsight_client.recall.return_value = fake_result

    resp = client_app.get("/api/timeline")

    assert resp.status_code == 200
    results = resp.json()["results"]
    assert results == [{
        "id": "fact-1",
        "text": "citation share rose 12%->47%",
        "type": "observation",
        "context": "daily digest",
        "tags": ["kind:crawl-digest"],
        "occurred_start": "2026-09-15T00:00:00Z",
        "mentioned_at": "2026-09-15T23:59:00Z",
    }]


def test_chat_returns_text_and_cited_sources(fake_hindsight_client):
    fake_source = MagicMock()
    fake_source.text = "GPTBot crawled /pricing 14x"
    fake_source.type = "world"
    fake_source.occurred_start = "2026-09-20T00:00:00Z"

    fake_response = MagicMock()
    fake_response.text = "Yes, the comparison page worked."
    fake_response.based_on.memories = [fake_source]
    fake_hindsight_client.reflect.return_value = fake_response

    resp = client_app.post("/api/chat", json={"message": "did the comparison page work?"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["text"] == "Yes, the comparison page worked."
    assert body["sources"] == [{
        "text": "GPTBot crawled /pricing 14x", "type": "world", "occurred_start": "2026-09-20T00:00:00Z",
    }]
    fake_hindsight_client.reflect.assert_called_once_with(
        bank_id=app_module.brand["bank_id"], query="did the comparison page work?", include_facts=True
    )


def test_chat_handles_no_based_on(fake_hindsight_client):
    fake_response = MagicMock()
    fake_response.text = "I don't have enough history yet."
    fake_response.based_on = None
    fake_hindsight_client.reflect.return_value = fake_response

    resp = client_app.post("/api/chat", json={"message": "anything new?"})

    assert resp.status_code == 200
    assert resp.json()["sources"] == []


def test_chat_rejects_missing_message_field():
    resp = client_app.post("/api/chat", json={})
    assert resp.status_code == 422


def test_ingest_logs_without_a_log_file_returns_a_clear_error(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)  # data/access.log won't exist here
    resp = client_app.post("/api/ingest-logs")
    assert resp.status_code == 200
    assert "error" in resp.json()


def test_ingest_logs_digests_and_retains(tmp_path, monkeypatch, fake_hindsight_client):
    monkeypatch.chdir(tmp_path)
    os.makedirs("data")
    with open("data/access.log", "w") as f:
        f.write(
            '10.0.0.1 - - [15/Sep/2026:10:00:00 +0000] "GET /pricing HTTP/1.1" 200 1024 '
            '"-" "Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)"\n'
        )

    resp = client_app.post("/api/ingest-logs")

    assert resp.status_code == 200
    assert "GPTBot crawled" in resp.json()["digest"]
    fake_hindsight_client.retain.assert_called_once()
