"""Structured shape the citation-health Mental Model is asked to fill in.
Hindsight regenerates this automatically whenever new facts consolidate --
see scripts/setup_bank.py.
"""
from pydantic import BaseModel


class EngineShare(BaseModel):
    engine: str
    mentioned_pct: float


class CrawledPage(BaseModel):
    page: str
    bot: str
    visits: int


class Hallucination(BaseModel):
    claim: str
    correct_value: str
    status: str


class RecommendedAction(BaseModel):
    action: str
    rationale: str
    evidence_quote: str


class CitationHealthReport(BaseModel):
    citation_share_pct: float
    trend_direction: str
    trend_delta_30d_pct: float
    engines: list[EngineShare]
    top_crawled_pages: list[CrawledPage]
    ai_referral_sessions_7d: int
    top_hallucinations: list[Hallucination]
    recommended_actions: list[RecommendedAction]


class ChatRequest(BaseModel):
    message: str
