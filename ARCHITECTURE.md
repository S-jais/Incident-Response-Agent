# HindsightOps System Architecture

This document describes the architectural design of **HindsightOps**, explaining how persistent long-term memory via Hindsight powers an intelligent production incident response agent.

---

## 🏛️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (SRE / DevOps)"]
        UI["React 19 + Vite Frontend\n(Dark Control Plane)"]
    end

    subgraph Server ["Backend Application Layer (FastAPI)"]
        API["FastAPI REST Endpoints\n(/api/incidents, /api/health, /api/memory)"]
        IA["Incident Investigation Agent\n(Multi-Incident Reasoner)"]
        LA["Learning & Postmortem Agent\n(Institutional Feedback Loop)"]
        RC["Runbook Catalog Engine\n(DB-04, REDIS-02, API-07...)"]
        DB[(SQLite / PostgreSQL\nMetadata Store)]
    end

    subgraph Memory ["External Intelligence & Memory"]
        HC[("Hindsight Cloud / API\n(Bank: hindsightops-incidents)")]
        LLM["Groq LLM Engine\n(openai/gpt-oss-120b)"]
    end

    UI -->|HTTP / JSON| API
    API --> IA
    API --> LA
    API --> DB
    IA --> RC
    IA -->|Recall Query| HC
    IA -->|Structured Prompts| LLM
    LA -->|Retain Learnings| HC
    LA --> DB
```

---

## 🔄 The Incident Learning Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor SRE as SRE Engineer
    participant FE as React UI
    participant BE as FastAPI Backend
    participant AG as Incident Agent
    participant HS as Hindsight Memory Bank
    participant LLM as Groq LLM

    SRE->>FE: Ingests Incident (INC-1042: Payment API timeout)
    FE->>BE: POST /api/incidents/INC-1042/analyze
    BE->>AG: Dispatch incident payload
    AG->>HS: recall(query="Payment API database connection pool...")
    HS-->>AG: Returns INC-0812, INC-0921, INC-0977 memories
    AG->>LLM: Multi-incident reasoning with historical context
    LLM-->>AG: Structured Root Cause Hypotheses + DB-04 Runbook
    AG-->>BE: AnalysisResponse (Hypotheses, Evidence, Runbook)
    BE-->>FE: Live Investigation Studio populated
    SRE->>FE: Applies Runbook DB-04 (Bump pool 50->100)
    SRE->>FE: Clicks "Mark Resolved & Retain"
    FE->>BE: POST /api/incidents/INC-1042/resolve
    BE->>HS: retain(bank_id, content="INC-1042 resolution...")
    HS-->>BE: Retained in memory bank
    Note over HS: Future incidents immediately recall this outcome!
```

---

## 🧩 Architectural Components

### 1. Frontend (`/frontend`)
- **Technology:** React 19, Vite, Tailwind CSS, Lucide Icons.
- **Aesthetic:** Dark-first, serious SRE cockpit designed for high telemetry density.
- **Key Modules:**
  - `IncidentDetail`: Real-time investigation studio with split telemetry/AI pane.
  - `MemoryExplorer`: Inspection tool for stored memory units and live query tester.
  - `MemoryLearningDemo`: 10-step interactive presentation flow for hackathon judges.
  - `BeforeAfterComparison`: Head-to-head evaluation matrix.

### 2. Backend (`/backend/app`)
- **Framework:** FastAPI with Python 3.11 asynchronous handlers.
- **Data Models:** SQLAlchemy ORM models (`Incident`, `Postmortem`, `MemoryRecallLog`).
- **Configuration:** `pydantic-settings` reading `.env` with strict zero-secret exposure.

### 3. Agent Architecture (`/backend/app/agents`)
- **`IncidentAgent`:**
  - Parses raw incident symptoms and error strings.
  - Formulates multi-vector queries for Hindsight memory recall.
  - Matches symptoms against curated runbooks (`find_matching_runbooks`).
  - Calls Groq with structured JSON schemas (`MEMORY_AUGMENTED_PROMPT_TEMPLATE`).
  - Assembles observable facts, hypotheses, and verifiable evidence.
- **`LearningAgent`:**
  - Ingests actual engineering resolution, recovery time, and feedback score.
  - Generates blameless postmortems (`PostmortemCreate`).
  - Formats postmortem into long-term knowledge units (`format_postmortem_for_hindsight`).
  - Retains memories directly into the Hindsight memory bank.

### 4. Memory Integration (`/backend/app/hindsight`)
- Uses the official `hindsight-client` Python SDK.
- Configurable base URL: `https://api.hindsight.vectorize.io` (Hindsight Cloud) or `http://localhost:8888` (self-hosted).
- Namespace isolation via `bank_id` (`hindsightops-incidents`).
- Transparent offline demo fallback if credentials are absent, guaranteeing zero crashes.
