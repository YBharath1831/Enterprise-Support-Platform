"""
Policy/RAG Agent - grounds the ticket in the knowledge base.
This is a hard gate: if confidence is below threshold, the pipeline is not
allowed to proceed to auto-resolution and must fall back to human review,
regardless of what the Resolver/Critic later say.
"""
from config import settings
from models import TicketState
from search_client import search_kb


async def run(state: TicketState) -> TicketState:
    result = search_kb(state.issue_text, top_k=3)
    state.rag_citations = result["hits"]
    state.rag_confidence = result["confidence"]
    state.status = "resolving"

    if result["confidence"] < settings.RAG_CONFIDENCE_THRESHOLD:
        state.add_guardrail_flag("low_rag_confidence")

    state.log_step(
        "policy_rag",
        f"Retrieved {len(result['hits'])} KB docs, confidence={result['confidence']}",
        {"top_hit": result["hits"][0]["title"] if result["hits"] else None},
    )
    return state
