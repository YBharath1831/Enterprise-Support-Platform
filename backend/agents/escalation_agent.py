"""Escalation Agent - formats the packet a human agent sees in the approval queue."""
from models import TicketState


async def run(state: TicketState, reason: str) -> TicketState:
    state.escalation_reason = reason
    state.status = "escalated"
    state.log_step("escalation", f"Escalated to human queue: {reason}")
    return state
