# FDE Masterclass — Enterprise Support & Ticket Resolution Agent
## Master Project Brief

> **Audience:** Futurense / FDE Masterclass participants  
> **Duration:** 8 hours (hands-on, one running example end-to-end)  
> **Last updated:** 2026-08-06

---

## 1. Goal

Teach the **full FDE lifecycle** in one continuous, hands-on session:

```
Client Issue → Problem Framing → Architecture → POC → MVP → Live Deployment → Monitoring
```

Every concept is taught on **one real problem**, not toy demos — so learners leave with a deployable pattern they can re-apply immediately.

---

## 2. The Running Example

**Enterprise Support & Ticket Resolution Agent**

Why this problem:
- Relatable across every industry (every company has a support desk)
- Naturally requires RAG + multi-agent + tool-calling + human-in-the-loop in a single build
- Rich enough to teach every loop-engineering concept without artificial complexity

### The 12 Knowledge-Base Issues (pre-seeded mock data)
Camera bug · Browser issue · Password reset · App crash · Connectivity · Install failure · Email sync · Billing dispute · 2FA lockout · File upload error · Mic/audio issue · VPN failure

---

## 3. Agent Architecture

```
Intake Agent
    ↓
Triage / Orchestrator Agent
    ↓
┌──────────────────────────┐
│  Policy / RAG Agent      │  ← Azure AI Search / Vertex AI Search
│  Resolver Agent          │  ← drafts resolution
│  Critic / Evaluator Agent│  ← confidence score + guardrail check
└──────────────────────────┘
    ↓                    ↓
High confidence       Low confidence
Auto-resolve          Human-in-Loop Approval
                      (Teams Adaptive Card / Slack workflow)
    ↓                    ↓
Action Agent (real backend call — ticket created, refund triggered, etc.)
    ↓
Escalation Agent (if action fails or no human response within SLA)
    ↓
Monitoring Layer (throughout — traces, evals, latency, confidence scores)
```

### Loop Engineering Concepts to Teach
| Concept | Where it appears |
|---|---|
| Shared ticket state object | Passed between every agent in the chain |
| Max turns / retries | Orchestrator — cap loops, prevent runaway spend |
| Exit conditions | Critic signs off → exit; N retries exceeded → escalate |
| Guardrails | No refund action without Critic sign-off |
| Fallback-to-human | RAG confidence < threshold → route to approval queue |
| Confidently wrong detection | Critic catches Resolver hallucinations |

---

## 4. Tech Stack

### Primary (Azure) — what learners build live

| Layer | Azure Service | Why |
|---|---|---|
| LLM / Agents | Azure AI Foundry (Azure OpenAI) | gpt-4o-mini for intake/triage; gpt-4o for Resolver/Critic |
| Orchestration | Semantic Kernel | Microsoft-native, excellent .NET + Python support |
| RAG | Azure AI Search | Integrated with Foundry, vector + hybrid search |
| Actions | Azure Logic Apps + Functions | Serverless, no infra to manage in class |
| Human-in-Loop | Teams Adaptive Cards | Pre-built approval workflow, zero extra tooling |
| Deployment | Azure Container Apps + API Management | Scale-to-zero, cost-safe for learners |
| Eval / Guardrails | Foundry Evaluation SDK + AI Content Safety | Integrated observability |
| Monitoring | Azure Monitor + Application Insights | Traces, latency, cost per ticket |

### Equivalent on GCP / AWS (architecture slides only — not built live)

| Layer | GCP | AWS |
|---|---|---|
| LLM / Agents | Vertex AI (Gemini) | Amazon Bedrock |
| Orchestration | LangGraph / CrewAI | AutoGen / LangGraph |
| RAG | Vertex AI Search | Amazon Kendra + Bedrock KB |
| Actions | Cloud Run Functions | Lambda |
| Human-in-Loop | Slack workflows | Slack / SNS approval |
| Deployment | Cloud Run / GKE | ECS / EKS |
| Eval | Ragas / DeepEval | Ragas / DeepEval |
| Monitoring | Cloud Monitoring / LangSmith | CloudWatch / LangSmith |

> **Multi-cloud teaching strategy:** Build and deploy live on Azure only. Show GCP/AWS as an architecture-mapping slide. Optional wow-moment: live-swap one `callLLM()` config from Azure OpenAI to Gemini to prove portability without building two full stacks.

---

## 5. Frontend (Already Built)

The UI was generated in **Google AI Studio** and exported as a React/Vite app. It lives in this repo and is cloud-agnostic (no cloud SDK calls in the UI — all AI calls go behind one config-driven `BASE_URL`).

**Three views:**

| View | File | Purpose |
|---|---|---|
| Customer Portal | `src/components/portal/CustomerPortal.tsx` | Multi-channel intake (Chat, Email, Call, Slack) + KB with 12 sample issues |
| Live Chat Interface | `src/components/chat/LiveChatInterface.tsx` | Auth step → chat with visible reasoning steps → resolution |
| Admin / Ticket Dashboard | `src/components/admin/AdminDashboard.tsx` | Ticket table, human-approval queue, live activity feed, analytics |

**Hosting plan:** Azure Static Web Apps (or Container Apps). Secure with Entra ID.

**Key rule:** All AI/LLM calls go through one config-driven `BASE_URL`. Never hardcode a provider endpoint in the frontend.

---

## 6. Dashboard Plan

| Data | Source |
|---|---|
| Ticket state | Azure Cosmos DB |
| Agent traces / latency | Azure Application Insights |
| Confidence scores | Custom telemetry, written by each agent |
| Human approval queue | Populated by Critic when confidence < threshold |
| Analytics charts | Aggregated from App Insights + Cosmos |

The UI already mocks all of this. Wiring to real backend is Phase 8 of the build sequence.

---

## 7. Live Demo Flow (In-Class)

1. Learner authenticates on screen (Entra ID mock or real)
2. Types an issue into the chat portal
3. **Visible reasoning steps on screen:** KB search fires → policy retrieved → draft generated → confidence scored
4. Backend action fires live: ticket created in mock CRM, or routed to human approval queue
5. Resolution delivered in chat
6. Admin dashboard updates live (ticket appears, trace recorded)

---

## 8. Fine-Tuning Decision

**Core build: no fine-tuning.** RAG + prompting + agents is the correct real-world answer. Fine-tuning for RAG-grounded agents introduces stale policy risks and defeats the purpose of the RAG layer.

**Optional 20-min bonus module:** Fine-tune the *triage classifier only* (label → category) on a small labelled dataset. Compare accuracy vs. a prompted small model (gpt-4o-mini). Teaching goal: "when does fine-tuning actually win?"

> Rule: **Never fine-tune Resolver or Critic agents.** They must stay RAG-grounded to avoid stale policy answers.

---

## 9. Azure Free Tier — Learner Setup

- Learners self-signup with personal card ($200 / 30-day free account)
- **Critical:** Azure OpenAI access requires **manual approval** — submit 3–5 days before class
- Free-tier default quota: ~1,000 TPM — use gpt-4o-mini for intake/triage, gpt-4o for Resolver/Critic
- Have a backup subscription (trainer's) for live demo fallback
- Remind learners: Container Apps scale-to-zero; tear down after class to avoid surprise charges

---

## 10. Deliverables Checklist

| Deliverable | Status |
|---|---|
| FDE_Masterclass_Overview.docx (Futurense one-pager) | ✅ In repo |
| Frontend UI (React/Vite, 3 views, mock data) | ✅ In repo |
| MASTER_PLAN.md (this document) | ✅ |
| BUILD_SEQUENCE.md (phased build guide) | ✅ |
| Backend agents (all 6 agents) | 🔲 Phase 3–6 |
| RAG data prep + Azure AI Search index | 🔲 Phase 2 |
| Azure deployment config | 🔲 Phase 7 |
| Dashboard wired to real backend | 🔲 Phase 8 |
| Eval + monitoring setup | 🔲 Phase 8 |
| Slide deck for 8-hour session | 🔲 To build |

---

## 11. Next Steps (When You're Ready to Build)

Start with **BUILD_SEQUENCE.md** — it breaks the implementation into 8 phases with concrete tasks and files per phase.

Immediate prep actions before any coding:
1. Submit Azure OpenAI access request (do this TODAY — 3–5 day approval lag)
2. Create Azure resource group (`rg-fde-masterclass`)
3. Provision: Azure AI Foundry workspace, Azure AI Search instance (free tier), Cosmos DB (serverless), App Insights
4. Add `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_SEARCH_ENDPOINT`, `AZURE_SEARCH_KEY` to `.env.local` (see `.env.example`)
