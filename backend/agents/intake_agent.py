"""Intake Agent - turns raw customer text into a structured issue. Cheap model (mini).
Also classifies Incident vs Service Request and assigns the ticket number right
here, at the first hop - that's what makes the SRV/INC number appear as soon
as the customer submits their message, not after the whole pipeline runs."""
from kernel_setup import run_agent
from cosmos_store import next_ticket_number
from models import TicketState

SYSTEM_PROMPT = """You are the Intake Agent for an IT support desk at a technology company.
Read the customer's raw message and extract structured fields. This is pure IT
support - every ticket is about a device, application, account, or system, never
about billing, invoices, or payments.

Also classify whether this is an INCIDENT or a SERVICE REQUEST:
- incident: something is broken, degraded, or not working as expected (an
  outage, a crash, a login failure, a device malfunction).
- service_request: a planned ask for something new - provisioning access,
  installing/licensing software, or requesting elevated permissions. Nothing
  is broken; the customer is asking IT to do or grant something.

Respond with ONLY a JSON object, no prose, in this exact shape:
{"category_guess": "<one of: camera, browser, password_reset, app_crash, connectivity, install_failure, email_sync, 2fa, file_upload, mic_audio, vpn, software_install_request, vpn_access_request, privileged_access_request, other>",
 "request_type": "<incident|service_request>",
 "urgency": "<low|medium|high>",
 "summary": "<one sentence summary of the issue>",
 "sensitive": <true|false - true if this involves 2FA/security, account access, or privileged/admin access>}
"""


async def run(state: TicketState) -> TicketState:
    result = await run_agent(
        "mini", SYSTEM_PROMPT, state.issue_text, temperature=0.1, max_tokens=150,
        state=state, agent_label="intake",
    )
    state.category = result.get("category_guess", "other")
    state.request_type = result.get("request_type") if result.get("request_type") in ("incident", "service_request") else "incident"
    state.ticket_number = next_ticket_number(state.request_type)
    state.status = "triaged"
    state.log_step(
        "intake",
        f"Assigned {state.ticket_number} ({state.request_type}), category={state.category}, urgency={result.get('urgency')}",
        {"urgency": result.get("urgency"), "sensitive": result.get("sensitive"), "summary": result.get("summary")},
    )
    return state
