"""Triage/Orchestrator Agent - decides the routing path. Cheap model (mini)."""
from kernel_setup import run_agent
from models import TicketState

SYSTEM_PROMPT = """You are the Triage Agent for an IT support desk. Given the issue category
and summary, decide whether this needs a policy/RAG lookup before it can be resolved (almost
everything does, except pure how-to questions), and flag if it's a guardrail category.
Respond with ONLY JSON:
{"needs_rag": <true|false>,
 "guardrail_category": <true|false - true for 2FA/security incidents or privileged/admin access requests>,
 "routing_note": "<short note on why>"}
"""


async def run(state: TicketState) -> TicketState:
    prompt = f"Category: {state.category}\nIssue: {state.issue_text}"
    result = await run_agent(
        "mini", SYSTEM_PROMPT, prompt, temperature=0.1, max_tokens=150,
        state=state, agent_label="triage",
    )

    if result.get("guardrail_category"):
        state.add_guardrail_flag(f"guardrail_category:{state.category}")

    state.status = "rag_lookup"
    state.log_step("triage", result.get("routing_note", "Routed to RAG lookup"), result)
    return state
