"""
Resolver response cache - the main cost-optimization lever in the pipeline.

Every ticket that reaches the Resolver Agent normally costs one flagship-
model call (and, since the agentic-tools change, sometimes several more on
top of that). Support tickets cluster heavily around a small set of real
issues - camera, password reset, VPN, connectivity - so most tickets are not
actually new problems, just new wording for one already seen.

This cache is keyed on the *top RAG citation id*, not the raw issue text.
That's the important design choice: "my camera won't turn on" and "camera
is not working" are different strings but both retrieve the same KB
document via vector search, so keying on the citation id gets semantic-level
cache hits without adding any fuzzy-matching or embedding logic here - it
reuses a signal the pipeline already computes for free.

Deliberately in-memory, not Cosmos-backed: this is a cost-saving optimization,
so it shouldn't itself add Cosmos read/write cost. The trade-off is the cache
resets on redeploy/restart and isn't shared across replicas if the Container
App ever scales beyond one instance - both fine for this system's actual
scale, and easy to swap for a Cosmos-backed version later if that changes.

Guardrail note: a cache hit only ever skips the Resolver's drafting call.
The Critic Agent still reviews every single ticket, cached or not - caching
the draft is not the same as caching the decision to auto-resolve.
"""
import time
from collections import OrderedDict
from typing import Optional

from config import settings

# citation_id -> {"resolution_text": str, "confidence": float,
#                  "proposed_action": str, "cached_at": float}
# OrderedDict so we can evict the oldest entry once RESOLVER_CACHE_MAX_ENTRIES
# is hit, without pulling in a separate LRU dependency.
_cache: "OrderedDict[str, dict]" = OrderedDict()


def _is_expired(entry: dict) -> bool:
    return (time.time() - entry["cached_at"]) > settings.RESOLVER_CACHE_TTL_SECONDS


def get(citation_id: Optional[str], rag_confidence: Optional[float]) -> Optional[dict]:
    """Returns a cached Resolver result if this citation has been resolved
    before, the RAG match was strong enough (for both the cached answer and
    the current ticket) to trust reusing it, and the entry hasn't expired.
    Returns None on any miss - callers should treat that as "run the LLM"."""
    if not settings.RESOLVER_CACHE_ENABLED or not citation_id:
        return None
    if (rag_confidence or 0.0) < settings.RESOLVER_CACHE_MIN_RAG_CONFIDENCE:
        return None

    entry = _cache.get(citation_id)
    if entry is None:
        return None
    if _is_expired(entry):
        del _cache[citation_id]
        return None

    _cache.move_to_end(citation_id)  # mark as recently used
    return entry


def set(citation_id: Optional[str], resolution_text: str, confidence: float, proposed_action: str) -> None:
    """Stores a Resolver result for reuse. Only ever called with high-
    confidence results (see resolver_agent.py) - a shaky first answer for an
    edge case should never get replayed on every future match."""
    if not settings.RESOLVER_CACHE_ENABLED or not citation_id:
        return

    _cache[citation_id] = {
        "resolution_text": resolution_text,
        "confidence": confidence,
        "proposed_action": proposed_action,
        "cached_at": time.time(),
    }
    _cache.move_to_end(citation_id)

    while len(_cache) > settings.RESOLVER_CACHE_MAX_ENTRIES:
        _cache.popitem(last=False)  # evict oldest


def stats() -> dict:
    """Exposed for the Admin Dashboard / a quick sanity check - not required
    for the cache to function."""
    return {"enabled": settings.RESOLVER_CACHE_ENABLED, "entries": len(_cache)}
