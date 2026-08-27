"""
Tools the Resolver Agent can call on its own, via Semantic Kernel's automatic
function calling.

This is deliberately the one genuinely agentic piece of the pipeline.
Everywhere else in this system, a fixed Python state machine (orchestrator.py's
STEP_MAP) decides what runs next - that's what makes the guardrails
enforceable. Here, inside one bounded step, the model itself decides whether
it needs another KB search (with a refined query) or the customer's ticket
history before it can draft a confident resolution - and can call these
tools zero, one, or several times, up to RESOLVER_MAX_TOOL_CALLS, before
handing back its final JSON answer.

Both tools are thin wrappers around Azure calls that already exist elsewhere
in the codebase (search_client.search_kb, cosmos_store.get_tickets_by_customer)
- nothing new is being called, only exposed to the model as something it can
decide to invoke.
"""
import json
from typing import Annotated

from semantic_kernel.functions import kernel_function

from cosmos_store import get_tickets_by_customer
from search_client import search_kb as _search_kb


class ResolverTools:
    """Registered on the shared kernel as the 'resolver_tools' plugin
    (see kernel_setup.py). Kept scoped to only these two read-only lookups -
    the Resolver can look things up on its own, but still can't write
    anything or take any action itself. Writing/acting stays with the
    deterministic Critic -> Action Agent path."""

    @kernel_function(
        name="search_kb",
        description=(
            "Search the support knowledge base for citations relevant to a query. "
            "You already have an initial set of citations from the RAG lookup step - "
            "call this again with a more specific or differently-worded query only if "
            "those citations don't clearly cover the customer's actual issue."
        ),
    )
    def search_kb(
        self,
        query: Annotated[str, "The search query - rephrase or narrow it from the original issue text if needed"],
    ) -> Annotated[str, "JSON: {hits: [...], confidence: 0-1}"]:
        return json.dumps(_search_kb(query, top_k=3))

    @kernel_function(
        name="get_customer_history",
        description=(
            "Look up this customer's past support tickets. Use this if the issue looks "
            "like it might be a repeat problem, or if knowing what was already tried "
            "for them before would change the resolution you draft."
        ),
    )
    def get_customer_history(
        self,
        customer_id: Annotated[str, "The customer_id for this ticket"],
    ) -> Annotated[str, "JSON list of the customer's past tickets (may be empty)"]:
        return json.dumps(get_tickets_by_customer(customer_id, limit=5))
