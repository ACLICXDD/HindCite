"""Loads the single-brand config from brand.yaml. No database — the brand
being tracked, its buyer-intent queries, and its ground-truth facts (real
price/features) all live in one file so hallucinations can be checked
against something concrete.
"""
from pathlib import Path

import yaml

BRAND_FILE = Path(__file__).resolve().parent.parent / "brand.yaml"


def load_brand() -> dict:
    with open(BRAND_FILE) as f:
        data = yaml.safe_load(f)
    return data["brand"]
