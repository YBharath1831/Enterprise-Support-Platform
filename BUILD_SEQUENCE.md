# Build Sequence — Enterprise Support & Ticket Resolution Agent
## Phased Implementation Guide

> Follow MASTER_PLAN.md for architecture decisions. This doc is the hands-on build order.

---

## Phase 0 — Environment Setup (30 min)

**Goal:** Every learner has a working Azure workspace before writing a line of agent code.

Tasks:
- [ ] Create Azure free account (personal card, $200 credit)
- [ ] Submit Azure OpenAI access request (**do this 3–5 days early!**)
- [ ] Create resource group: `rg-fde-masterclass`
- [ ] Provision Azure AI Foundry workspace
- [ ] Provision Azure AI Search (free tier, 1 index)
- [ ] Provision Azure Cosmos DB (serverless, `tickets` container)
- [ ] Provision Application Insights workspace
- [ ] Clone this repo, run `npm install`, set `.env.local`
- [ ] `npm run dev` — confirm UI loads on localhost

Key `.env.local` variables:
```
VITE_API_BASE_URL=http://localhost:8000
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_KEY=<key>
AZURE_SEARCH_ENDPOINT=https://<your-resource>.search.windows.net
AZURE_SEARCH_KEY=<key>
AZURE_COSMOS_CONNECTION=<connection-string>
APPINSIGHTS_CONNECTION_STRING=<connection-string>
```

---

## Phase 1 — Data Preparation (45 min)

**Goal:** A knowledge base the RAG agent can actually search.

Tasks:
- [ ] Write `scripts/prepare_kb.py` — load the 12 sample KB issues from `mockData.ts` into real JSON
- [ ] Add 20–30 realistic policy documents (refund policy, SLA doc, escalation matrix, etc.)
- [ ] Generate embeddings via Azure OpenAI `text-embedding-ada-002`
- [ ] Upload to Azure AI Search index (`support-kb-index`)
- [ ] Verify with a test query: "user can't reset password" → returns correct KB article

Deliverable: `data/kb_articles.json` + populated Azure AI Search index

---

## Phase 2 — Single-Agent POC (1 hour)

**Goal:** Prove the concept with the simplest possible thing — one agent, one LLM call, one answer.

Tasks:
- [ ] Create `backend/main.py` (FastAPI) with a single `/chat` endpoint
- [ ] Wire frontend `VITE_API_BASE_URL` to `http://localhost:8000`
- [ ] Implement naive resolver: receive message → call Azure OpenAI → return response
- [ ] Add a `/health` endpoint
- [ ] Run a live demo: type "I can't log in" → get a response

Teaching moment: This is what most "AI projects" ship. Now watch what breaks at scale.

---

## Phase 3 — RAG Layer (1 hour)

**Goal:** Ground every answer in real policy documents. No more hallucinations.

Tasks:
- [ ] Implement `agents/rag_agent.py`:
  - Embed the incoming query
  - Search `support-kb-index` (hybrid search: keyword + vector)
  - Return top-3 chunks with confidence scores
- [ ] Update `/chat` endpoint to call RAG agent first, inject context into Resolver prompt
- [ ] Add `retrieved_sources` to the API response (show it in the UI reasoning panel)
- [ ] Test: "what is the refund policy?" → must cite the actual policy doc

Teaching moment: Compare answer quality with/without RAG. Show source attribution.

---

## Phase 4 — Multi-Agent Split (1.5 hours)

**Goal:** Break the monolith into the full 6-agent architecture. Each agent has one job.

### 4a — Intake Agent
- [ ] `agents/intake_agent.py`: extract structured fields from free-text (issue type, severity, user ID, channel)
- [ ] Output: `TicketState` object (shared across all agents)

### 4b — Triage / Orchestrator Agent
- [ ] `agents/triage_agent.py`: classify issue → route to correct knowledge domain
- [ ] Implements the loop: calls RAG → Resolver → Critic in sequence
- [ ] Enforces max_turns (default: 3 retries before escalation)

### 4c — Resolver Agent
- [ ] `agents/resolver_agent.py`: given RAG context + ticket state → draft resolution
- [ ] Prompt engineering: persona (Tier-1 Support), tone (professional), output schema (JSON)

### 4d — Critic / Evaluator Agent
- [ ] `agents/critic_agent.py`: score the Resolver's draft
  - `confidence_score` (0.0–1.0)
  - `grounded` (bool) — is every claim in the draft backed by a retrieved source?
  - `safe` (bool) — passed Azure AI Content Safety check?
- [ ] Guardrail: if action_type == "refund" and confidence < 0.85 → force human review

### 4e — Escalation Agent
- [ ] `agents/escalation_agent.py`: fires when max_turns exceeded or SLA breached
- [ ] Creates an escalation ticket, notifies Tier-2 queue

### Shared State
```python
class TicketState:
    ticket_id: str
    user_id: str
    raw_message: str
    issue_type: str          # set by Intake
    severity: str            # set by Triage
    retrieved_chunks: list   # set by RAG
    draft_resolution: str    # set by Resolver
    confidence_score: float  # set by Critic
    action_type: str         # "resolve" | "refund" | "escalate" | "human_review"
    turns: int               # incremented each loop iteration
    status: str              # "open" | "pending_human" | "resolved" | "escalated"
```

---

## Phase 5 — Action Agent + Human-in-Loop (1 hour)

**Goal:** The agent actually *does* something. Real backend call, real approval flow.

### 5a — Action Agent
- [ ] `agents/action_agent.py`:
  - `resolve`: write resolution to Cosmos DB, return to user
  - `refund`: call mock CRM API (or Azure Logic App webhook)
  - `create_ticket`: POST to mock ticketing system
- [ ] Log every action to App Insights as a custom event

### 5b — Human-in-Loop
- [ ] When `action_type == "human_review"`: write ticket to Cosmos DB with `status: "pending_human"`
- [ ] Dashboard `Human Approval Queue` tab polls Cosmos for `pending_human` tickets
- [ ] Approve/reject buttons in Admin Dashboard → PATCH `/api/tickets/{id}/decision`
- [ ] On approval: Action Agent fires; on rejection: Escalation Agent fires

Optional (bonus wow-moment):
- [ ] Send Teams Adaptive Card to approval channel via Logic App webhook
- [ ] Card has Approve / Reject buttons that POST back to your API

---

## Phase 6 — Evaluation & Guardrails (45 min)

**Goal:** Prove the system is reliable, not just impressive in demos.

Tasks:
- [ ] Build `evals/test_cases.json` — 20 golden test cases (input → expected action + confidence range)
- [ ] Run Foundry Evaluation SDK against the test cases
- [ ] Measure: answer relevance, groundedness, safety pass rate, latency p50/p95
- [ ] Set guardrail thresholds in config (not hardcoded):
  - `MIN_CONFIDENCE_AUTO_RESOLVE = 0.75`
  - `MIN_CONFIDENCE_REFUND_AUTO_APPROVE = 0.85`
- [ ] Add Azure AI Content Safety check in Critic agent (block PII + harmful outputs)

Teaching moment: Show one test case where Critic catches a hallucinated resolution.

---

## Phase 7 — Deployment (45 min)

**Goal:** The whole thing runs in the cloud, not just on localhost.

Tasks:
- [ ] Containerize backend: `Dockerfile` for FastAPI app
- [ ] `docker build` + push to Azure Container Registry
- [ ] Deploy to Azure Container Apps (scale-to-zero, consumption plan)
- [ ] Deploy frontend to Azure Static Web Apps (or same Container App)
- [ ] Configure Azure API Management in front of Container App (rate limiting, auth)
- [ ] Set all secrets in Container App environment variables (not in code)
- [ ] Update `VITE_API_BASE_URL` to the deployed Container App URL
- [ ] Smoke test: full flow from deployed frontend → deployed backend → Cosmos DB

Optional: Add Entra ID authentication to the frontend (5-min add-on with Static Web Apps built-in auth).

---

## Phase 8 — Dashboard Wiring & Monitoring (45 min)

**Goal:** The UI reflects reality. Every ticket, trace, and decision is visible.

Tasks:
- [ ] Wire Admin Dashboard to real Cosmos DB via GET `/api/tickets`
- [ ] Wire Human Approval Queue to `pending_human` filter
- [ ] Wire Live Activity Feed to App Insights query (last 20 events)
- [ ] Wire Analytics charts to aggregated Cosmos + App Insights data
- [ ] Add `reasoning_steps` to every API response (RAG chunks used, confidence score, agent path taken)
- [ ] Show reasoning steps in the LiveChatInterface reasoning panel (already in the UI — just wire it)
- [ ] Set up Azure Monitor alert: escalation rate > 20% in 1 hour → email notification

---

## Optional Bonus Module — Fine-Tuning the Triage Classifier (20 min)

**Only do this after Phase 8 is live.**

Goal: Demonstrate *when* fine-tuning wins vs. prompting.

- [ ] Export 200 labelled triage examples (issue text → category) from Cosmos DB
- [ ] Fine-tune `gpt-4o-mini` on the triage task via Azure AI Foundry
- [ ] Compare accuracy: fine-tuned model vs. prompted base model
- [ ] Swap triage agent to use fine-tuned model, measure latency + cost delta

**Rule:** Only the triage classifier is fine-tuned. Resolver and Critic stay RAG-grounded.

---

## Multi-Cloud Portability Wow-Moment (10 min)

In `backend/config.py`, show:
```python
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "azure")  # "azure" | "gemini" | "bedrock"
```

Live-swap `LLM_PROVIDER=gemini` → same agents, same prompts, now calling Vertex AI (Gemini).  
No agent code changes. Only the LLM adapter changes.

Teaching moment: This is why you never hardcode the provider.

---

## Phase Summary Table

| Phase | Topic | Duration | Key Output |
|---|---|---|---|
| 0 | Environment Setup | 30 min | Working Azure workspace |
| 1 | Data Prep | 45 min | Azure AI Search index populated |
| 2 | Single-Agent POC | 1 hr | FastAPI `/chat` endpoint live |
| 3 | RAG Layer | 1 hr | Grounded answers with source attribution |
| 4 | Multi-Agent Split | 1.5 hr | All 6 agents wired, shared TicketState |
| 5 | Action + HITL | 1 hr | Real backend actions + approval queue |
| 6 | Eval + Guardrails | 45 min | Test suite, safety checks, thresholds |
| 7 | Deployment | 45 min | Live on Azure Container Apps |
| 8 | Dashboard + Monitoring | 45 min | Full observability, live UI data |
| Bonus | Fine-tuning | 20 min | Triage classifier comparison |

**Total: ~8 hours** (with 10–15 min breaks built in between phases)
