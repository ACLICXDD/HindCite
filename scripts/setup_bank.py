"""One-time setup: create the memory bank, configure its mission/
disposition/entity-labels, add directives, and create the self-refreshing
citation-health Mental Model.

Run once: python -m scripts.setup_bank
"""
from dotenv import load_dotenv

load_dotenv()

from backend.config import load_brand
from backend.memory import get_client
from backend.schemas import CitationHealthReport


def main():
    brand = load_brand()
    client = get_client()
    bank_id = brand["bank_id"]

    client.create_bank(bank_id=bank_id)

    client.update_bank_config(
        bank_id,
        retain_mission=(
            "Extract facts about AI answer-engine citation behavior, AI crawler activity, "
            "and search ranking changes for this brand: whether it was mentioned, what was "
            "claimed about price/features, sentiment, competitors named instead, which AI "
            "crawlers visited which pages, and any ranking/impression/click changes. Compare "
            "claims against the ground-truth values given in metadata to catch factual mismatches."
        ),
        observations_mission=(
            "Consolidate recurring patterns: citation-share trend per engine, AI-crawler visit "
            "trends per page, sentiment shifts, recurring hallucinations, ranking trends, and any "
            "correlation between retained optimization actions and later improvements. Ignore "
            "isolated one-off events with no supporting pattern."
        ),
        reflect_mission=(
            "You are a Generative Engine Optimization (GEO) analyst. Ground every answer in "
            "retained probe history, crawler/referral logs, search console data, and past "
            "optimization actions, citing evidence with dates and quotes."
        ),
        disposition_skepticism=4,   # don't overreact to one noisy probe
        disposition_literalism=4,   # facts, not vibes
        entity_labels=[
            {
                "key": "citation", "type": "value", "tag": True,
                "values": [{"value": "mentioned"}, {"value": "absent"}],
                "description": "Was the brand mentioned in this AI answer",
            },
            {
                "key": "sentiment", "type": "value", "tag": True,
                "values": [{"value": "positive"}, {"value": "neutral"}, {"value": "negative"}],
            },
            {
                "key": "accuracy", "type": "value", "tag": True,
                "values": [{"value": "accurate"}, {"value": "hallucinated"}, {"value": "unverifiable"}],
                "description": "Do the claims match the ground-truth metadata provided",
            },
            {"key": "competitor_mentioned", "type": "multi-text", "tag": True},
        ],
    )

    client.create_directive(
        bank_id=bank_id, name="Cite evidence",
        content="Always quote the exact text used as evidence for a citation, crawl, ranking or hallucination claim.",
    )
    client.create_directive(
        bank_id=bank_id, name="No unsupported numbers",
        content="Never state a citation share, crawl count, or ranking number without at least one underlying fact.",
    )

    client.create_mental_model(
        bank_id=bank_id,
        id="citation-health",
        name="Citation Health Report",
        source_query=(
            "What is our current AI-citation share, AI-crawler activity, search ranking trend, "
            "sentiment, and any unresolved hallucinations across tracked queries, engines and "
            "pages? What should we fix next, and what evidence supports each recommendation?"
        ),
        trigger={
            "refresh_after_consolidation": True,
            "min_refresh_interval_seconds": 30,
            "response_schema": CitationHealthReport.model_json_schema(),
        },
    )

    print(f"Bank '{bank_id}' configured: mission, disposition, entity labels, directives, and the citation-health mental model.")


if __name__ == "__main__":
    main()
