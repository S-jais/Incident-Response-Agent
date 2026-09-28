"""
Comprehensive Backend Automated Test Suite for HindsightOps
Validates API endpoints, agent workflows, memory recall, and learning lifecycle.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_api_health():
    """Verify health endpoint reports status of backend, LLM, Hindsight, and DB without secrets."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["backend"] == "OK"
    assert "hindsight" in data
    assert "llm" in data
    assert "database" in data
    # Ensure no secrets leaked
    assert "GROQ_API_KEY" not in str(data)
    assert "HINDSIGHT_API_KEY" not in str(data)

def test_dashboard_metrics():
    """Verify dashboard metrics endpoint returns aggregations."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_incidents" in data
    assert "active_incidents" in data
    assert "memories_retained" in data
    assert "hindsight_status" in data

def test_incident_lifecycle_flow():
    """Tests the full incident lifecycle: Create -> Analyze -> Resolve -> Postmortem -> Retain."""
    # 1. Create a new test incident
    create_payload = {
        "id": "INC-TEST-99",
        "title": "Test Database Connection Saturation",
        "service": "Payment API",
        "severity": "CRITICAL",
        "error_message": "maximum database connections reached; QueuePool limit of size 50 overflow 10 reached",
        "logs": "sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 reached",
        "description": "Simulated unit test failure"
    }
    create_resp = client.post("/api/incidents", json=create_payload)
    assert create_resp.status_code == 200
    inc_data = create_resp.json()
    assert inc_data["id"] == "INC-TEST-99"
    assert inc_data["status"] == "INVESTIGATING"

    # 2. Analyze the incident (Memory-Augmented)
    analyze_resp = client.post("/api/incidents/INC-TEST-99/analyze")
    assert analyze_resp.status_code == 200
    analysis = analyze_resp.json()
    assert len(analysis["root_cause_hypotheses"]) > 0
    assert len(analysis["historical_evidence"]) > 0
    assert len(analysis["recommended_actions"]) > 0
    assert len(analysis["agent_activity"]) > 0

    # 3. Analyze the incident with Stateless baseline
    stateless_resp = client.post("/api/incidents/INC-TEST-99/analyze?stateless=true")
    assert stateless_resp.status_code == 200
    stateless = stateless_resp.json()
    assert stateless["is_stateless_baseline"] is True
    assert len(stateless["historical_evidence"]) == 0 # Zero historical evidence

    # 4. Resolve the incident
    resolve_payload = {
        "actual_root_cause": "Database connection pool exhaustion",
        "actual_resolution": "Increased pool size to 100 via DB-04 runbook and bounced worker pods",
        "resolution_time_minutes": 11,
        "was_recommendation_helpful": "YES",
        "runbook_used": "DB-04"
    }
    resolve_resp = client.post("/api/incidents/INC-TEST-99/resolve", json=resolve_payload)
    assert resolve_resp.status_code == 200
    resolved_data = resolve_resp.json()
    assert resolved_data["status"] == "RESOLVED"
    assert resolved_data["retained_in_hindsight"] is True

    # 5. Generate Postmortem
    pm_resp = client.post("/api/incidents/INC-TEST-99/postmortem")
    assert pm_resp.status_code == 200
    pm_data = pm_resp.json()
    assert "summary" in pm_data
    assert "lessons_learned" in pm_data

    # 6. Save Learning to Hindsight
    learn_resp = client.post("/api/incidents/INC-TEST-99/learn")
    assert learn_resp.status_code == 200
    learn_data = learn_resp.json()
    assert learn_data["success"] is True

def test_runbooks_endpoint():
    """Verify runbooks catalog endpoint returns standard runbooks."""
    response = client.get("/api/runbooks")
    assert response.status_code == 200
    rbs = response.json()
    assert len(rbs) >= 5
    rb_ids = [r["id"] for r in rbs]
    assert "DB-04" in rb_ids
    assert "REDIS-02" in rb_ids
    assert "API-07" in rb_ids

def test_demo_reset_and_followup():
    """Verify demo endpoints reset state and trigger follow-up incident."""
    reset_resp = client.post("/api/demo/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["success"] is True

    followup_resp = client.post("/api/demo/trigger-followup")
    assert followup_resp.status_code == 200
    followup_data = followup_resp.json()
    assert followup_data["success"] is True
    assert followup_data["incident"]["id"] == "INC-1099"
