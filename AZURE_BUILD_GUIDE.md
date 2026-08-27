# Azure Build Guide — Enterprise Support Agent
## From UI-only → Full Working System

> You have: React/Vite UI + Azure Pay-as-you-go + Resource Group `fde`  
> Goal: A live FastAPI backend with 6 agents, RAG, and Cosmos DB state — wired to your UI

---

## THE FULL FLOW (Read This First)

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER (your React/Vite UI)                                       │
│  CustomerPortal → LiveChat → AdminDashboard                         │
│  All AI calls go to:  VITE_API_BASE_URL/api/...                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP (REST)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FASTAPI BACKEND  (Python, runs locally first → Azure later)        │
│                                                                      │
│  POST /api/chat          → Orchestrator Agent                        │
│  GET  /api/tickets       → Cosmos DB query                          │
│  POST /api/tickets/{id}/decision → Human approval handler           │
│  GET  /api/health        → liveness check                           │
└──────┬──────────────┬───────────────┬──────────────────────────────┘
       │              │               │
       ▼              ▼               ▼
┌──────────┐  ┌──────────────┐  ┌──────────────────┐
│ Azure    │  │ Azure AI     │  │ Azure Cosmos DB   │
│ OpenAI   │  │ Search       │  │ (ticket state)    │
│ (GPT-4o) │  │ (RAG / KB)   │  │                  │
└──────────┘  └──────────────┘  └──────────────────┘
       │
       ▼
┌──────────────────────┐
│ Application Insights │
│ (traces + monitoring)│
└──────────────────────┘
```

---

## STEP 1 — Provision Azure Services (Azure Portal)

All of these go inside your existing resource group **`fde`**.

### 1A — Azure OpenAI Service
1. Portal → `Create a resource` → search **Azure OpenAI**
2. Region: **East US** or **Sweden Central** (best model availability)
3. Pricing tier: **Standard S0**
4. After creation → go to resource → **Model deployments** → **Deploy model**
   - Deploy `gpt-4o-mini` → name it `gpt-4o-mini` (for Intake + Triage)
   - Deploy `gpt-4o` → name it `gpt-4o` (for Resolver + Critic)
   - Deploy `text-embedding-ada-002` → name it `text-embedding` (for RAG)
5. Go to **Keys and Endpoint** → copy **Endpoint** and **Key 1**

### 1B — Azure AI Search
1. Portal → `Create a resource` → search **Azure AI Search**
2. Pricing tier: **Free** (sufficient for this build)
3. After creation → go to resource → **Keys** → copy **Primary admin key**
4. Copy the **URL** (looks like `https://yourname.search.windows.net`)

### 1C — Azure Cosmos DB
1. Portal → `Create a resource` → **Azure Cosmos DB** → choose **NoSQL (Core)**
2. Capacity mode: **Serverless** (pay only for what you use — no monthly minimum)
3. After creation → **Data Explorer** → **New Container**
   - Database: `supportdb`
   - Container: `tickets`
   - Partition key: `/ticket_id`
4. Go to **Keys** → copy **PRIMARY CONNECTION STRING**

### 1D — Application Insights
1. Portal → `Create a resource` → search **Application Insights**
2. Resource mode: **Workspace-based**
3. After creation → **Overview** → copy **Connection String**

---

## STEP 2 — Set Up Your `.env.local`

In your `enterprise-support-desk` folder, create `.env.local`:

```env
# Frontend — tell Vite where the backend lives
VITE_API_BASE_URL=http://localhost:8000

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT_MINI=gpt-4o-mini
AZURE_OPENAI_DEPLOYMENT_FULL=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://YOUR-RESOURCE.search.windows.net
AZURE_SEARCH_KEY=your-key-here
AZURE_SEARCH_INDEX=support-kb-index

# Azure Cosmos DB
AZURE_COSMOS_CONNECTION=AccountEndpoint=https://...;AccountKey=...;
AZURE_COSMOS_DATABASE=supportdb
AZURE_COSMOS_CONTAINER=tickets

# Application Insights
APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
```

---

## STEP 3 — Create the Backend Folder Structure

Inside `enterprise-support-desk`, create a new `backend/` folder with this layout:

```
backend/
├── main.py                  ← FastAPI app, all routes
├── config.py                ← loads .env, single source of truth for all settings
├── requirements.txt         ← Python dependencies
├── agents/
│   ├── __init__.py
│   ├── intake_agent.py      ← extracts structured fields from raw message
│   ├── triage_agent.py      ← classifies issue + orchestrates the loop
│   ├── rag_agent.py         ← searches Azure AI Search, returns KB chunks
│   ├── resolver_agent.py    ← drafts the resolution using RAG context
│   ├── critic_agent.py      ← scores confidence, checks groundedness
│   ├── action_agent.py      ← writes to Cosmos DB, fires real actions
│   └── escalation_agent.py  ← handles failed/low-confidence loops
├── models/
│   └── ticket.py            ← TicketState dataclass (shared across agents)
├── services/
│   ├── openai_client.py     ← single Azure OpenAI wrapper
│   ├── search_client.py     ← Azure AI Search wrapper
│   └── cosmos_client.py     ← Cosmos DB wrapper
└── scripts/
    └── prepare_kb.py        ← one-time script: loads KB articles into AI Search
```

---

## STEP 4 — Install Python Dependencies

In your terminal, from the `backend/` folder:

```bash
pip install fastapi uvicorn python-dotenv openai azure-search-documents azure-cosmos opencensus-ext-azure
```

Or create `requirements.txt`:
```
fastapi==0.111.0
uvicorn==0.30.0
python-dotenv==1.0.1
openai==1.35.0
azure-search-documents==11.6.0b4
azure-cosmos==4.7.0
opencensus-ext-azure==1.1.13
pydantic==2.7.0
```

---

## STEP 5 — Write the Core Files (Do These in Order)

### 5A — `models/ticket.py` (the shared state object)
```python
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

class RetrievedChunk(BaseModel):
    content: str
    source: str
    score: float

class TicketState(BaseModel):
    ticket_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "anonymous"
    channel: str = "chat"           # chat | email | call | slack
    raw_message: str = ""
    issue_type: str = ""            # set by IntakeAgent
    severity: str = "medium"        # set by TriageAgent: low | medium | high | critical
    retrieved_chunks: List[RetrievedChunk] = []   # set by RAGAgent
    draft_resolution: str = ""      # set by ResolverAgent
    confidence_score: float = 0.0   # set by CriticAgent
    is_grounded: bool = False        # set by CriticAgent
    action_type: str = ""           # resolve | refund | create_ticket | human_review | escalate
    turns: int = 0
    status: str = "open"            # open | pending_human | resolved | escalated
    reasoning_steps: List[str] = [] # shown in UI reasoning panel
```

### 5B — `config.py`
```python
import os
from dotenv import load_dotenv
load_dotenv("../.env.local")

AZURE_OPENAI_ENDPOINT   = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY        = os.getenv("AZURE_OPENAI_KEY")
DEPLOY_MINI             = os.getenv("AZURE_OPENAI_DEPLOYMENT_MINI", "gpt-4o-mini")
DEPLOY_FULL             = os.getenv("AZURE_OPENAI_DEPLOYMENT_FULL", "gpt-4o")
EMBED_DEPLOYMENT        = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding")

SEARCH_ENDPOINT         = os.getenv("AZURE_SEARCH_ENDPOINT")
SEARCH_KEY              = os.getenv("AZURE_SEARCH_KEY")
SEARCH_INDEX            = os.getenv("AZURE_SEARCH_INDEX", "support-kb-index")

COSMOS_CONNECTION       = os.getenv("AZURE_COSMOS_CONNECTION")
COSMOS_DATABASE         = os.getenv("AZURE_COSMOS_DATABASE", "supportdb")
COSMOS_CONTAINER        = os.getenv("AZURE_COSMOS_CONTAINER", "tickets")

# Guardrail thresholds — change here, not in agent code
MIN_CONFIDENCE_AUTO_RESOLVE       = 0.75
MIN_CONFIDENCE_REFUND_AUTO_APPROVE = 0.85
MAX_TURNS                         = 3
```

### 5C — `services/openai_client.py`
```python
from openai import AzureOpenAI
from config import AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY

client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
    api_version="2024-02-01"
)

def chat(messages: list, deployment: str, temperature=0.2) -> str:
    response = client.chat.completions.create(
        model=deployment,
        messages=messages,
        temperature=temperature
    )
    return response.choices[0].message.content

def embed(text: str, deployment: str) -> list[float]:
    response = client.embeddings.create(input=text, model=deployment)
    return response.data[0].embedding
```

### 5D — `services/search_client.py`
```python
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential
from config import SEARCH_ENDPOINT, SEARCH_KEY, SEARCH_INDEX
from services.openai_client import embed
from config import EMBED_DEPLOYMENT

search_client = SearchClient(
    endpoint=SEARCH_ENDPOINT,
    index_name=SEARCH_INDEX,
    credential=AzureKeyCredential(SEARCH_KEY)
)

def search_kb(query: str, top: int = 3) -> list[dict]:
    query_vector = embed(query, EMBED_DEPLOYMENT)
    vector_query = VectorizedQuery(
        vector=query_vector,
        k_nearest_neighbors=top,
        fields="content_vector"
    )
    results = search_client.search(
        search_text=query,           # keyword search
        vector_queries=[vector_query], # vector search
        select=["id", "content", "source"],
        top=top
    )
    return [{"content": r["content"], "source": r["source"], "score": r["@search.score"]}
            for r in results]
```

### 5E — `main.py` (the FastAPI app)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.ticket import TicketState
from agents.triage_agent import run_triage

app = FastAPI(title="Enterprise Support Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"
    channel: str = "chat"

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/chat")
def chat(req: ChatRequest):
    ticket = TicketState(
        raw_message=req.message,
        user_id=req.user_id,
        channel=req.channel
    )
    result = run_triage(ticket)
    return {
        "ticket_id": result.ticket_id,
        "resolution": result.draft_resolution,
        "confidence": result.confidence_score,
        "action_type": result.action_type,
        "status": result.status,
        "reasoning_steps": result.reasoning_steps,
        "sources": [c.source for c in result.retrieved_chunks]
    }
```

---

## STEP 6 — Run It Locally First

```bash
# Terminal 1 — backend
cd enterprise-support-desk/backend
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd enterprise-support-desk
npm run dev
```

Test the backend directly:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I cannot reset my password", "user_id": "user123"}'
```

You should see a JSON response with `resolution`, `confidence`, `reasoning_steps` — those wire directly into the UI's reasoning panel.

---

## STEP 7 — Wire the Frontend to Your Backend

In your React components, every current Gemini API call needs to switch to your FastAPI. The pattern is:

```typescript
// BEFORE (Gemini direct call in AI Studio)
const result = await geminiClient.generateContent(prompt)

// AFTER (your FastAPI backend)
const BASE_URL = import.meta.env.VITE_API_BASE_URL
const res = await fetch(`${BASE_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage, user_id: userId, channel: 'chat' })
})
const data = await res.json()
// data.resolution → show as response
// data.reasoning_steps → show in reasoning panel
// data.sources → show as citations
```

---

## STEP 8 — Build Each Agent (Do One at a Time, Test After Each)

### Order to build:
1. **IntakeAgent** — simplest, just extracts JSON from text  
2. **RAGAgent** — test search is returning real KB articles  
3. **ResolverAgent** — drafts answer using RAG context  
4. **CriticAgent** — scores the draft  
5. **TriageAgent** — orchestrates 1→2→3→4 in a loop  
6. **ActionAgent** — writes resolved tickets to Cosmos DB  
7. **EscalationAgent** — handles the fallback path  

Start each session with: "Show me IntakeAgent output for: *[test message]*" to verify before wiring to the next agent.

---

## STEP 9 — Upload KB to Azure AI Search (One-Time)

Before RAGAgent can work, the index must exist. Run `scripts/prepare_kb.py` to:
1. Load your 12 KB articles (from `mockData.ts` → convert to JSON)
2. Generate embeddings for each article
3. Upload to Azure AI Search with schema: `{id, content, source, content_vector}`

This is a one-time script — run it once, then your RAGAgent can search.

---

## WHAT TO DO RIGHT NOW (Your Next 3 Actions)

1. **Create the 4 Azure services** in resource group `fde` (Step 1 above) — takes ~20 min
2. **Fill in `.env.local`** with the keys you get (Step 2)
3. **Create `backend/` folder**, add `requirements.txt`, run `pip install` (Steps 3–4)

Once those 3 are done, come back and we'll write the first agent together.
