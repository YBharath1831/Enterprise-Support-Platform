"""
RAG lookup against support-kb-index (built in Phase 3).
Returns citations plus a confidence score derived from the top hit's
search score, which the Policy/RAG agent uses to decide whether the
pipeline is even allowed to attempt auto-resolution.
"""
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from openai import AzureOpenAI

from config import settings

_search_client = SearchClient(
    endpoint=settings.SEARCH_ENDPOINT,
    index_name=settings.SEARCH_INDEX,
    credential=AzureKeyCredential(settings.SEARCH_ADMIN_KEY),
)

_aoai_client = AzureOpenAI(
    azure_endpoint=settings.AOAI_ENDPOINT,
    api_key=settings.AOAI_API_KEY,
    api_version=settings.AOAI_API_VERSION,
)


def _embed(text: str) -> list[float]:
    resp = _aoai_client.embeddings.create(input=text, model=settings.EMBED_DEPLOYMENT)
    return resp.data[0].embedding


def search_kb(query: str, top_k: int = 3) -> dict:
    vector = _embed(query)
    # Pure vector search (no search_text) - gives a real 0-1-ish cosine-based
    # similarity score. Mixing in search_text turns this into hybrid search,
    # which uses reciprocal-rank-fusion scores that are always tiny (~0.01-0.03)
    # regardless of match quality - that miscalibration was forcing every
    # ticket into human review. Pure vector scoring lets the confidence
    # threshold actually mean something.
    results = _search_client.search(
        search_text=None,
        vector_queries=[
            {
                "kind": "vector",
                "vector": vector,
                "k_nearest_neighbors": top_k,
                "fields": "contentVector",
            }
        ],
        select=["id", "title", "category", "request_type", "symptoms", "resolution_steps", "policy_notes", "confidence_tag"],
        top=top_k,
    )

    hits = []
    top_score = 0.0
    for r in results:
        score = r["@search.score"]
        top_score = max(top_score, score)
        hits.append(
            {
                "id": r["id"],
                "title": r["title"],
                "category": r["category"],
                "request_type": r.get("request_type"),
                "resolution_steps": r["resolution_steps"],
                "policy_notes": r["policy_notes"],
                "confidence_tag": r["confidence_tag"],
                "score": score,
            }
        )

    confidence = min(top_score, 1.0) if hits else 0.0

    return {"hits": hits, "confidence": round(confidence, 2)}
