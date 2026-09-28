# HindsightOps REST API Reference

The HindsightOps backend is built with FastAPI. All endpoints are fully documented via OpenAPI / Swagger at:  
👉 **`http://localhost:8000/docs`**

---

## 📡 Health & System Endpoints

### `GET /api/health`
Returns runtime status for the backend, LLM provider, Hindsight memory bank, and database. Never exposes secret keys.

**Response:**
```json
{
  "status": "OK",
  "backend": "OK",
  "llm": "Connected (Live)",
  "llm_model": "openai/gpt-oss-120b",
  "hindsight": "Connected (Live)",
  "hindsight_base_url": "https://api.hindsight.vectorize.io",
  "hindsight_bank_id": "hindsightops-incidents",
  "database": "Connected (SQLite)",
  "is_demo_mode": false
}
```

---

## 📊 Dashboard Endpoints

### `GET /api/dashboard`
Returns high-level MTTR metrics, active incident counts, and Hindsight recall telemetry.

**Response:**
```json
{
  "total_incidents": 29,
  "active_incidents": 1,
  "resolved_incidents": 28,
  "critical_incidents": 9,
  "avg_resolution_time_minutes": 11.8,
  "memories_retained": 28,
  "memories_recalled_total": 14,
  "similar_matches_count": 42,
  "hindsight_status": "Connected",
  "llm_status": "Connected"
}
```

---

## 🚨 Incident Management Endpoints

### `GET /api/incidents`
Lists incidents with optional filters.

**Query Parameters:**
- `service` (string): Filter by service (e.g. `Payment API`)
- `severity` (string): `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `status` (string): `INVESTIGATING`, `IDENTIFIED`, `RESOLVED`
- `search` (string): Substring search across title, logs, error, and root cause.

### `POST /api/incidents`
Declares a new production incident.

**Request Body:**
```json
{
  "title": "Payment API Database Connection Pool Exhaustion",
  "service": "Payment API",
  "severity": "CRITICAL",
  "environment": "production",
  "error_message": "maximum database connections reached; QueuePool limit of size 50 overflow 10 reached",
  "logs": "[2026-09-28 14:22:04] ERROR sqlalchemy.exc.TimeoutError: QueuePool limit 50 reached",
  "description": "Flash sale traffic caused connection saturation",
  "impact": "2,300 failed checkout requests"
}
```

### `GET /api/incidents/{incident_id}`
Returns full incident telemetry, analysis JSON, and postmortem data.

### `POST /api/incidents/{incident_id}/analyze`
Triggers the AI Incident Response Agent.

**Query Parameters:**
- `stateless` (boolean, default: `false`): If `true`, runs the baseline prompt without Hindsight memory. If `false`, executes Hindsight memory recall.

**Response Schema:**
```json
{
  "incident_id": "INC-1042",
  "summary": "High-confidence match with historical incidents INC-0812 and INC-0977.",
  "observed_facts": ["Error: maximum database connections reached"],
  "root_cause_hypotheses": [
    {
      "title": "Database Connection Pool Exhaustion",
      "confidence": "High",
      "confidence_score": 0.91,
      "explanation": "Symptoms match INC-0812 where queue pool hit ceiling under high checkout load.",
      "supporting_evidence": ["QueuePool limit 50 reached", "3 previous incidents in Hindsight"]
    }
  ],
  "historical_evidence": [
    {
      "incident_id": "INC-0812",
      "similarity": "High",
      "similarity_score": 0.94,
      "root_cause": "Database connection pool exhaustion under surge",
      "resolution": "Increased pool size from 50 to 100 via Runbook DB-04",
      "resolution_time_minutes": 12,
      "service": "Payment API",
      "was_successful": true,
      "key_takeaway": "Connection pool ceiling must scale with pod replicas"
    }
  ],
  "recommended_actions": [
    "1. Inspect active connections via pg_stat_activity",
    "2. Follow Runbook DB-04: Scale DB_POOL_SIZE to 100 in Helm config",
    "3. Perform rolling restart of Payment API pods"
  ],
  "runbooks": [
    {
      "runbook_id": "DB-04",
      "title": "Database Connection Pool Issues & Exhaustion",
      "match_reason": "Matches symptoms for Payment API",
      "estimated_time": "10-15 minutes",
      "primary_steps": ["Increase DB_POOL_SIZE to 100", "Bounce pods"]
    }
  ],
  "agent_activity": [
    { "timestamp": "14:23:01", "step": "Incident parsed", "status": "completed" },
    { "timestamp": "14:23:02", "step": "Searching Hindsight memory bank", "status": "completed" },
    { "timestamp": "14:23:02", "step": "3 relevant historical memories recalled", "status": "completed" }
  ],
  "memory_source": "Hindsight Cloud",
  "is_hindsight_live": true,
  "is_stateless_baseline": false
}
```

### `POST /api/incidents/{incident_id}/resolve`
Marks the incident as `RESOLVED` and automatically retains the confirmed outcome in Hindsight.

**Request Body:**
```json
{
  "actual_root_cause": "Database connection pool exhaustion",
  "actual_resolution": "Increased pool size to 100 via DB-04 and restarted pods",
  "resolution_time_minutes": 12,
  "was_recommendation_helpful": "YES",
  "runbook_used": "DB-04"
}
```

### `POST /api/incidents/{incident_id}/postmortem`
Generates or updates a blameless postmortem.

### `POST /api/incidents/{incident_id}/learn`
Explicitly retains postmortem institutional lessons to Hindsight long-term memory.

---

## 🧠 Memory Endpoints

### `GET /api/memory/stats`
Returns memory bank stats and synthesized institutional patterns.

### `POST /api/memory/search`
Executes semantic memory search against the Hindsight memory bank.

**Request Body:**
```json
{
  "query": "Payment API connection pool exhaustion",
  "service": "Payment API",
  "top_k": 5
}
```

### `GET /api/memory/graph`
Returns node-link graph data for the visual Knowledge Timeline.

---

## 📖 Runbook Endpoints

### `GET /api/runbooks`
Lists all available production runbooks (DB-04, REDIS-02, API-07, K8S-03, DEP-05, SEC-01).

### `GET /api/runbooks/{runbook_id}`
Returns full runbook details with mitigation protocols and CLI snippets.
