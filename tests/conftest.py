"""Fake credentials so importing backend.app (which constructs the Hindsight
client and calls load_brand() at module level) doesn't need real ones.
Hindsight(base_url=...) doesn't hit the network at construction time, so
this is enough to import the app -- individual tests mock the client's
methods before exercising a route.
"""
import os

os.environ.setdefault("HINDSIGHT_BASE_URL", "http://localhost:8888")
os.environ.setdefault("HINDSIGHT_API_KEY", "test-key")
os.environ.setdefault("GROQ_API_KEY", "test-key")
