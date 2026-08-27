"""
The shared ticket state object every agent reads and writes.
This is the core "loop engineering" artifact of the whole build: instead of
agents passing messages to each other directly, they all read/mutate this
one document, which is persisted to Cosmos DB after every step. That's what
makes the pipeline resumable (human-in-the-loop can pause and resume days
later) and observable (the dashboard just reads this document).
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Optional
import uuid


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


VALID_STATUSES = [
    "intake",
    "triaged",
    "rag_lookup",
    "resolving",
    "critic_review",
    "pending_human_approval",
    "auto_resolved",
    "action_taken",
    "escalated",
    "closed",
]


@dataclass
class TicketState:
    ticketId: str = field(default_factory=lambda: f"tkt-{uuid.uuid4().hex[:10]}")
    channel: str = "chat"
    customer_id: str = "unknown"
    issue_text: str = ""
    category: Optional[str] = None
    # "incident" (something is broken) vs "service_request" (a planned ask/
    # provisioning). Classified by the Intake Agent as soon as the customer's
    # message comes in - this drives the SRV/INC ticket number below.
    request_type: Optional[str] = None
    ticket_number: Optional[str] = None  # human-facing id, e.g. "INC1042" / "SRV1007"
    status: str = "intake"
    turn_count: int = 0
    max_turns: int = 6
    rag_citations: list = field(default_factory=list)
    rag_confidence: Optional[float] = None
    draft_resolution: Optional[str] = None
    resolver_confidence: Optional[float] = None
    critic_verdict: Optional[dict] = None
    requires_human: bool = False
    human_decision: Optional[str] = None  # "approved" | "rejected" | None
    guardrail_flags: list = field(default_factory=list)
    action_result: Optional[dict] = None
    escalation_reason: Optional[str] = None
    agent_trace: list = field(default_factory=list)
    # Cost/usage tracing: one entry per real LLM call (agent, service_id,
    # prompt/completion tokens, estimated $), appended by kernel_setup.py.
    # total_cost_usd is kept as its own field (not just summed from the list
    # on demand) so it's cheap to read and shows up automatically in the API
    # response and the Cosmos doc, right alongside rag_confidence and
    # resolver_confidence - cost and confidence living in the same document.
    token_usage: list = field(default_factory=list)
    total_cost_usd: float = 0.0
    created_at: str = field(default_factory=now_iso)
    updated_at: str = field(default_factory=now_iso)

    def to_cosmos_doc(self) -> dict:
        d = asdict(self)
        d["id"] = self.ticketId  # Cosmos requires an 'id' field
        return d

    @staticmethod
    def from_cosmos_doc(doc: dict) -> "TicketState":
        doc = {k: v for k, v in doc.items() if k in TicketState.__dataclass_fields__}
        return TicketState(**doc)

    def log_step(self, agent: str, summary: str, extra: Optional[dict] = None):
        entry = {"agent": agent, "summary": summary, "timestamp": now_iso()}
        if extra:
            entry.update(extra)
        self.agent_trace.append(entry)
        self.updated_at = now_iso()

    def add_guardrail_flag(self, flag: str):
        if flag not in self.guardrail_flags:
            self.guardrail_flags.append(flag)
