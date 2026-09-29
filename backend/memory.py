"""Single shared Hindsight client. Everything the app knows lives in the
Hindsight memory bank named by brand.yaml's bank_id — there is no other
database.
"""
import os
from functools import lru_cache

from hindsight_client import Hindsight


@lru_cache
def get_client() -> Hindsight:
    return Hindsight(
        base_url=os.environ["HINDSIGHT_BASE_URL"],
        api_key=os.environ.get("HINDSIGHT_API_KEY"),
    )
