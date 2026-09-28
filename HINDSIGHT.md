# Hindsight Integration & Memory Architecture

This document details how **Hindsight** (by Vectorize.io) is integrated into **HindsightOps**, explaining how its biomimetic memory structure enables the AI agent to retain, recall, and synthesize incident knowledge over time.

---

## 🔍 What is Hindsight?

Hindsight is an open-source, production-grade agent memory system designed to give AI agents persistent, long-term memory that survives session boundaries.

- **Official Docs:** [https://hindsight.vectorize.io/](https://hindsight.vectorize.io/)
- **GitHub:** [https://github.com/vectorize-io/hindsight](https://github.com/vectorize-io/hindsight)
- **Hindsight Cloud:** [https://ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io)

Unlike generic vector databases that dump raw unstructured chunks, Hindsight organizes memory biomimetically into **World facts**, **Experiences**, and synthesized **Mental Models**.

---

## 🏗️ Hindsight in HindsightOps

In HindsightOps, Hindsight serves as the **persistent operational memory bank** of the engineering organization:

```
[Production Outage]
       │
       ▼
[Format Memory Unit] ────────► client.retain(bank_id, content, metadata, tags)
                                            │
                                            ▼
                              [Hindsight Memory Bank]
                              ("hindsightops-incidents")
                                            │
       ┌────────────────────────────────────┘
       ▼
[New Incident Query] ────────► client.recall(bank_id, query, tags)
                                            │
                                            ▼
                              [Recalled Historical Incidents]
                              (INC-0812, INC-0921, INC-0977)
                                            │
                                            ▼
                              [Agent Hypotheses & Runbooks]
```

---

## 💻 Python SDK Implementation

HindsightOps integrates directly with the official `hindsight-client` Python SDK:

```python
from hindsight_client import Hindsight

# 1. Initialize client
client = Hindsight(
    base_url=settings.HINDSIGHT_BASE_URL, # "https://api.hindsight.vectorize.io"
    api_key=settings.HINDSIGHT_API_KEY,   # Configured via .env
    timeout=30.0
)

# 2. Retain an incident resolution
client.retain(
    bank_id="hindsightops-incidents",
    content="""[INCIDENT MEMORY UNIT]
Incident ID: INC-1042
Service: Payment API
Error: maximum database connections reached
Root Cause: Connection pool exhaustion under surge
Resolution: Increased pool size from 50 to 100 via Runbook DB-04
Recovery Time: 12 minutes
Key Lessons: Connection pool ceiling must dynamically scale with pod replica count""",
    metadata={
        "incident_id": "INC-1042",
        "service": "Payment API",
        "severity": "CRITICAL",
        "runbook": "DB-04"
    },
    tags=["incident", "service:payment-api", "runbook:db-04", "postgres"]
)

# 3. Recall relevant incidents during a new outage
recall_response = client.recall(
    bank_id="hindsightops-incidents",
    query="Payment API database connection timeout QueuePool limit 50 reached",
    tags=["service:payment-api"]
)
```

---

## 🏷️ Memory Unit Design

Each incident is structured into an information-dense knowledge unit before retention:

```json
{
  "incident_id": "INC-1042",
  "service": "Payment API",
  "environment": "production",
  "severity": "CRITICAL",
  "error": "maximum database connections reached",
  "root_cause": "Connection pool exhaustion",
  "resolution": [
    "Increase database connection pool from 50 to 100",
    "Restart Payment API worker pods",
    "Monitor active connections via pg_stat_activity"
  ],
  "resolution_time_minutes": 12,
  "runbook": "DB-04",
  "lessons_learned": [
    "Monitor connection pool utilization",
    "Alert before maximum connection threshold"
  ]
}
```

---

## 🛡️ Transparent Fallback Architecture

To ensure flawless local testing and demo capability even without active cloud credentials:
- If `HINDSIGHT_API_KEY` is present, HindsightOps communicates directly with **Hindsight Cloud**.
- If `HINDSIGHT_API_KEY` is not yet configured, HindsightOps activates a local semantic memory store.
- **Critical Design Principle:** The system **never deceives**. The UI explicitly displays `Hindsight Cloud (Live)` vs `Hindsight Demo Mode` on the telemetry banner so hackathon judges can verify live connectivity at a glance!
