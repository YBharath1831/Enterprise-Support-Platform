"""
Action Agent - performs the real backend action.
For this masterclass build this simulates the action (writes a structured
result into ticket state) rather than calling a real ITSM/provisioning system -
in production this is where you'd call an Azure Logic App / Function per
the architecture doc. The important part for the demo is that it only ever
runs after Critic approval or explicit human approval - never before.

run_device_diagnostic simulates a different real system: Microsoft Graph's
deviceManagement API triggering an Intune proactive-remediation script pair
(detection + fix) on the customer's already-enrolled, already-trusted device.
See MASTER_PLAN.md for why this - and not a raw support link - is the
legitimate way to do remote device fixes. Swap the mock block below for a
real Graph call (POST /deviceManagement/managedDevices/{id}/... ) when
wiring to a real Intune tenant with enrolled test devices.

provision_access simulates the IT service-catalog / identity-provisioning
system granting software licenses, VPN access, or privileged access.
"""
import random

from models import TicketState

# Per-category canned findings so the simulated diagnostic feels grounded
# instead of generic - swap for real Intune script output in production.
_DIAGNOSTIC_FINDINGS = {
    "camera": {
        "finding": "Windows camera privacy setting was blocking app access.",
        "fix": "Re-enabled camera access for this app under Settings > Privacy > Camera.",
    },
    "mic_audio": {
        "finding": "Default microphone was muted at the OS level.",
        "fix": "Unmuted default input device and reset audio driver.",
    },
    "connectivity": {
        "finding": "Network adapter had a stale DHCP lease.",
        "fix": "Released and renewed IP configuration, flushed DNS cache.",
    },
    "vpn": {
        "finding": "VPN client service had stopped responding.",
        "fix": "Restarted the VPN client service and re-established tunnel.",
    },
    "install_failure": {
        "finding": "A prior failed install left a locked temp file.",
        "fix": "Cleared the locked installer cache and retried installation.",
    },
}

_PROVISIONING_ACTIONS = {
    "software_install_request": "Provisioned license seat and pushed install via device management.",
    "vpn_access_request": "Provisioned VPN profile scoped to the requester's approved network segments.",
    "privileged_access_request": "Granted time-boxed elevated access, scoped and set to auto-expire.",
}


def _simulate_intune_remediation(state: TicketState) -> dict:
    category = state.category if state.category in _DIAGNOSTIC_FINDINGS else "camera"
    canned = _DIAGNOSTIC_FINDINGS[category]
    return {
        "system": "intune-graph-remediation (simulated)",
        "graph_call": "POST /deviceManagement/managedDevices/{id}/triggerRemediation",
        "graph_correlation_id": f"grf-{random.randint(100000, 999999)}",
        "intune_script_pair_id": f"prm-{random.randint(1000, 9999)}",
        "diagnostic_finding": canned["finding"],
        "remediation_applied": canned["fix"],
        "remediation_status": "success",
    }


def _simulate_provisioning(state: TicketState) -> dict:
    category = state.category if state.category in _PROVISIONING_ACTIONS else "software_install_request"
    return {
        "system": "it-service-catalog (simulated)",
        "provisioning_action": _PROVISIONING_ACTIONS[category],
        "grant_status": "success",
    }


async def run(state: TicketState) -> TicketState:
    proposed = (state.action_result or {}).get("proposed_action", "none")

    if proposed == "run_device_diagnostic":
        result = {
            "proposed_action": proposed,
            "executed": True,
            "confirmation_id": f"act-{state.ticketId[-8:]}",
            **_simulate_intune_remediation(state),
        }
        state.action_result = result
        state.status = "action_taken"
        state.log_step(
            "action",
            f"Ran device diagnostic via Intune/Graph (simulated): {result['remediation_applied']}",
            result,
        )
        return state

    if proposed == "provision_access":
        result = {
            "proposed_action": proposed,
            "executed": True,
            "confirmation_id": f"act-{state.ticketId[-8:]}",
            **_simulate_provisioning(state),
        }
        state.action_result = result
        state.status = "action_taken"
        state.log_step(
            "action",
            f"Provisioned access via IT service catalog (simulated): {result['provisioning_action']}",
            result,
        )
        return state

    # Simulated backend call - swap this block for a real Logic App / Function call.
    result = {
        "proposed_action": proposed,
        "executed": True,
        "system": "it-service-desk (simulated)",
        "confirmation_id": f"act-{state.ticketId[-8:]}",
    }

    state.action_result = result
    state.status = "action_taken"
    state.log_step("action", f"Executed '{proposed}' via IT service desk", result)
    return state
