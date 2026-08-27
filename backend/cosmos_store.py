"""
Thin persistence layer over Cosmos DB. Two containers:
  tickets   - one doc per ticket, the live shared state (models.TicketState)
  auditLog  - append-only, one doc per agent step, for the monitoring/eval phase
"""
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from config import settings
from models import TicketState, now_iso
import uuid

_client = CosmosClient(settings.COSMOS_ENDPOINT, settings.COSMOS_KEY)
_db = _client.create_database_if_not_exists(settings.COSMOS_DB)
_tickets = _db.create_container_if_not_exists(
    id=settings.COSMOS_TICKETS_CONTAINER,
    partition_key=PartitionKey(path="/ticketId"),
)
_audit = _db.create_container_if_not_exists(
    id=settings.COSMOS_AUDIT_CONTAINER,
    partition_key=PartitionKey(path="/ticketId"),
)


def save_ticket(state: TicketState) -> None:
    _tickets.upsert_item(state.to_cosmos_doc())


def get_ticket(ticket_id: str) -> TicketState | None:
    try:
        doc = _tickets.read_item(item=ticket_id, partition_key=ticket_id)
        return TicketState.from_cosmos_doc(doc)
    except exceptions.CosmosResourceNotFoundError:
        return None


def list_tickets(limit: int = 50) -> list[dict]:
    query = "SELECT * FROM c ORDER BY c.updated_at DESC OFFSET 0 LIMIT @limit"
    items = _tickets.query_items(
        query=query,
        parameters=[{"name": "@limit", "value": limit}],
        enable_cross_partition_query=True,
    )
    return list(items)


def get_tickets_by_customer(customer_id: str, limit: int = 5) -> list[dict]:
    """Used by the Resolver Agent's get_customer_history tool - lets it check,
    on its own, whether this looks like a repeat issue before drafting a
    resolution. Only a thin summary of each past ticket, not the full doc."""
    query = (
        "SELECT c.ticketId, c.ticket_number, c.status, c.request_type, c.issue_text, c.created_at "
        "FROM c WHERE c.customer_id = @customer_id "
        "ORDER BY c.created_at DESC OFFSET 0 LIMIT @limit"
    )
    items = _tickets.query_items(
        query=query,
        parameters=[
            {"name": "@customer_id", "value": customer_id},
            {"name": "@limit", "value": limit},
        ],
        enable_cross_partition_query=True,
    )
    return list(items)


# Statuses that mean the pipeline actually landed on a final answer -
# either the Critic approved it outright or a human approved it and the
# Action Agent executed. Both read as "resolved" for dashboard purposes.
_RESOLVED_STATUSES = {"auto_resolved", "closed"}
_ESCALATED_STATUSES = {"escalated"}


def get_stats() -> dict:
    """Aggregates real usage across every ticket ever created (all channels,
    all customers) for the Admin Dashboard's Analytics tab. Pulled fresh on
    every call rather than cached - demo-scale ticket volume makes a full
    cross-partition scan cheap, and it keeps the dashboard honest (no stale
    counts). Only customer_id + status are selected to keep the payload small."""
    query = "SELECT c.customer_id, c.status, c.channel, c.request_type FROM c"
    items = list(_tickets.query_items(query=query, enable_cross_partition_query=True))

    unique_users = {i.get("customer_id") for i in items if i.get("customer_id")}
    resolved = sum(1 for i in items if i.get("status") in _RESOLVED_STATUSES)
    escalated = sum(1 for i in items if i.get("status") in _ESCALATED_STATUSES)
    not_resolved = len(items) - resolved - escalated

    by_channel: dict[str, int] = {}
    for i in items:
        ch = i.get("channel") or "unknown"
        by_channel[ch] = by_channel.get(ch, 0) + 1

    return {
        "total_tickets": len(items),
        "unique_users": len(unique_users),
        "resolved": resolved,
        "escalated": escalated,
        "not_resolved": not_resolved,
        "resolution_rate_pct": round((resolved / len(items)) * 100) if items else 0,
        "by_channel": by_channel,
    }


_TICKET_PREFIX = {"incident": "INC", "service_request": "SRV"}
_TICKET_NUMBER_BASE = 1000


def next_ticket_number(request_type: str) -> str:
    """Assigns the next sequential SRV/INC number for a given request type.
    Implemented as a count-and-increment query against the tickets container
    rather than a real atomic counter (e.g. a dedicated counter document with
    optimistic-concurrency retry, or Cosmos's built-in sequence patterns) -
    fine for a single-demo teaching scale, but under real concurrent load two
    requests could read the same count and collide. Worth calling out live:
    this is exactly the kind of race condition a production counter needs to
    guard against with an atomic increment, not a read-then-write."""
    prefix = _TICKET_PREFIX.get(request_type, "SRV")
    query = "SELECT VALUE COUNT(1) FROM c WHERE STARTSWITH(c.ticket_number, @prefix)"
    items = list(
        _tickets.query_items(
            query=query,
            parameters=[{"name": "@prefix", "value": prefix}],
            enable_cross_partition_query=True,
        )
    )
    count = items[0] if items else 0
    return f"{prefix}{_TICKET_NUMBER_BASE + count + 1}"


def append_audit(ticket_id: str, agent: str, input_summary: str, output_summary: str, extra: dict | None = None) -> None:
    doc = {
        "id": f"{ticket_id}-{uuid.uuid4().hex[:8]}",
        "ticketId": ticket_id,
        "agent": agent,
        "input_summary": input_summary,
        "output_summary": output_summary,
        "timestamp": now_iso(),
    }
    if extra:
        doc.update(extra)
    _audit.create_item(doc)
