"""
Critic/Evaluator Agent - the sign-off gate. Flagship model.
GUARDRAIL: nothing security- or access-sensitive (2FA resets, privileged/admin
access grants) may be auto-resolved without the Critic explicitly approving it.
"""
from config import settings
from kernel_setup import run_agent
from models import TicketState

SYSTEM_PROMPT = """You are the Critic/Evaluator Agent. Review the Resolver's draft resolution
against the original issue and the knowledge base policy notes. Check for: factual grounding
(is every claim supported by the citations?), policy compliance (does it violate any guardrail
noted in policy_notes?), and whether the proposed action is appropriate.
Respond with ONLY JSON:
{"approved": <true|false>,
 "reason": "<short justification>",
 "requires_human": <true|false - true if this needs a human to sign off regardless of your approval>}
"""


async def run(state: TicketState) -> TicketState:
    citations_policy = "\n".join(f"- {c['title']}: {c['policy_notes']}" for c in state.rag_citations)
    prompt = (
        f"Issue: {state.issue_text}\n"
        f"Draft resolution: {state.draft_resolution}\n"
        f"Resolver confidence: {state.resolver_confidence}\n"
        f"Proposed action: {state.action_result}\n"
        f"Policy notes from KB:\n{citations_policy}"
    )
    result = await run_agent(
        "flagship", SYSTEM_PROMPT, prompt, temperature=0.1, max_tokens=250,
        state=state, agent_label="critic",
    )

    state.critic_verdict = result
    requires_human = bool(result.get("requires_human", False))

    # Hard guardrails the orchestrator enforces regardless of what the critic says
    proposed_action = (state.action_result or {}).get("proposed_action", "none")
    if proposed_action == "reset_2fa":
        state.add_guardrail_flag("2fa_reset_requires_human")
        requires_human = True
    if proposed_action == "provision_access" and not result.get("approved"):
        state.add_guardrail_flag("access_grant_without_critic_approval_blocked")
        requires_human = True
    if state.guardrail_flags and "low_rag_confidence" in state.guardrail_flags:
        requires_human = True
    # Hard floor on the Resolver's own confidence score - independent of the
    # Critic's judgment call. Below this, always take a human's input before
    # anything is delivered to the customer.
    if (state.resolver_confidence or 0.0) < settings.AUTO_RESOLVE_CONFIDENCE_THRESHOLD:
        state.add_guardrail_flag(
            f"resolver_confidence_below_{int(settings.AUTO_RESOLVE_CONFIDENCE_THRESHOLD * 100)}pct"
        )
        requires_human = True
    # Use the curated KB confidence_tag (deterministic, set by us in Phase 3) as the
    # source of truth for which categories need a human - not Triage's own LLM
    # judgment call (that flag is soft/inconsistent, e.g. it may call password
    # reset "security" even though kb-003 is explicitly tagged auto_resolve).
    # Any top citation not explicitly marked auto_resolve defaults to human review.
    top_tag = state.rag_citations[0]["confidence_tag"] if state.rag_citations else None
    if top_tag and top_tag != "auto_resolve":
        state.add_guardrail_flag(f"kb_confidence_tag:{top_tag}")
        requires_human = True

    state.requires_human = requires_human
    state.status = "pending_human_approval" if requires_human else "auto_resolved"
    state.log_step(
        "critic",
        f"approved={result.get('approved')}, requires_human={requires_human}",
        {"reason": result.get("reason"), "guardrail_flags": state.guardrail_flags},
    )
    return state
