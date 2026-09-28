import json
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Incident, Postmortem, MemoryRecallLog
from app.demo.scenarios import PRIMARY_DEMO_INCIDENT, FOLLOWUP_LEARNING_INCIDENT, STATELESS_BASELINE_COMPARISON
from app.demo.synthetic_incidents import get_all_synthetic_incidents
from app.hindsight.client import hindsight_service
from app.agents.incident_agent import incident_agent
from app.agents.learning_agent import learning_agent

from fastapi import APIRouter, Depends, BackgroundTasks

router = APIRouter()

@router.get("/demo/scenario")
def get_primary_demo_scenario():
    return {
        "primary_incident": PRIMARY_DEMO_INCIDENT,
        "followup_incident": FOLLOWUP_LEARNING_INCIDENT,
        "comparison": STATELESS_BASELINE_COMPARISON
    }

@router.get("/demo/compare")
def get_stateless_vs_hindsight_comparison():
    return STATELESS_BASELINE_COMPARISON

@router.post("/demo/reset")
def reset_demo_database(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Wipes and reseeds the synthetic database with historical incidents."""
    db.query(Postmortem).delete()
    db.query(MemoryRecallLog).delete()
    db.query(Incident).delete()
    db.commit()

    # Re-seed synthetic incidents
    synthetic_list = get_all_synthetic_incidents()
    count = 0
    for inc_data in synthetic_list:
        inc = Incident(
            id=inc_data["id"],
            title=inc_data["title"],
            service=inc_data["service"],
            environment=inc_data.get("environment", "production"),
            severity=inc_data.get("severity", "MEDIUM"),
            status=inc_data.get("status", "RESOLVED"),
            error_message=inc_data["error_message"],
            logs=inc_data["logs"],
            stack_trace=inc_data.get("stack_trace"),
            description=inc_data.get("description"),
            impact=inc_data.get("impact"),
            deployment_info=inc_data.get("deployment_info"),
            root_cause=inc_data.get("root_cause"),
            actual_resolution=inc_data.get("actual_resolution"),
            resolution_time_minutes=inc_data.get("resolution_time_minutes", 12),
            runbook_id=inc_data.get("runbook_id"),
            was_recommendation_helpful="YES",
            retained_in_hindsight=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=len(synthetic_list) - count)
        )
        db.add(inc)
        count += 1

    # Offload remote retain calls to background task for instantaneous UI response
    def _retain_memories_bg():
        for inc_data in synthetic_list:
            hindsight_service.retain_incident(inc_data)

    background_tasks.add_task(_retain_memories_bg)

    # Also insert the initial investigating INC-1042 for the demo
    demo_inc = Incident(
        id=PRIMARY_DEMO_INCIDENT["id"],
        title=PRIMARY_DEMO_INCIDENT["title"],
        service=PRIMARY_DEMO_INCIDENT["service"],
        environment="production",
        severity=PRIMARY_DEMO_INCIDENT["severity"],
        status="INVESTIGATING",
        error_message=PRIMARY_DEMO_INCIDENT["error_message"],
        logs=PRIMARY_DEMO_INCIDENT["logs"],
        stack_trace=PRIMARY_DEMO_INCIDENT["stack_trace"],
        description=PRIMARY_DEMO_INCIDENT["description"],
        impact=PRIMARY_DEMO_INCIDENT["impact"],
        deployment_info=PRIMARY_DEMO_INCIDENT["deployment_info"],
        created_at=datetime.datetime.utcnow()
    )
    db.add(demo_inc)
    db.commit()

    return {
        "success": True,
        "seeded_count": count,
        "message": "Demo state reset successfully. INC-1042 ready for investigation."
    }

@router.post("/demo/trigger-followup")
def trigger_followup_incident(db: Session = Depends(get_db)):
    """Triggers the second incident INC-1099 to demonstrate that the agent now recalls newly learned INC-1042."""
    existing = db.query(Incident).filter(Incident.id == FOLLOWUP_LEARNING_INCIDENT["id"]).first()
    if existing:
        db.delete(existing)
        db.commit()

    inc = Incident(
        id=FOLLOWUP_LEARNING_INCIDENT["id"],
        title=FOLLOWUP_LEARNING_INCIDENT["title"],
        service=FOLLOWUP_LEARNING_INCIDENT["service"],
        environment="production",
        severity=FOLLOWUP_LEARNING_INCIDENT["severity"],
        status="INVESTIGATING",
        error_message=FOLLOWUP_LEARNING_INCIDENT["error_message"],
        logs=FOLLOWUP_LEARNING_INCIDENT["logs"],
        stack_trace=FOLLOWUP_LEARNING_INCIDENT["stack_trace"],
        description=FOLLOWUP_LEARNING_INCIDENT["description"],
        impact=FOLLOWUP_LEARNING_INCIDENT["impact"],
        deployment_info=FOLLOWUP_LEARNING_INCIDENT["deployment_info"],
        created_at=datetime.datetime.utcnow()
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    return {
        "success": True,
        "incident": FOLLOWUP_LEARNING_INCIDENT,
        "message": "Follow-up incident INC-1099 triggered. Agent will recall both INC-0812 and newly resolved INC-1042!"
    }

@router.get("/alerts/presets")
def get_alert_presets():
    """Returns demo alert presets for instant incident creation."""
    return [
        {
            "id": "preset-payment-pool",
            "title": "Payment API Database Connection Pool Exhaustion (INC-1042)",
            "service": "Payment API",
            "severity": "CRITICAL",
            "environment": "production",
            "error_message": "maximum database connections reached; QueuePool limit of size 50 overflow 10 reached",
            "logs": PRIMARY_DEMO_INCIDENT["logs"],
            "stack_trace": PRIMARY_DEMO_INCIDENT["stack_trace"],
            "impact": PRIMARY_DEMO_INCIDENT["impact"],
            "deployment_info": PRIMARY_DEMO_INCIDENT["deployment_info"]
        },
        {
            "id": "preset-redis-oom",
            "title": "User Cache Redis Maxmemory Eviction Cascade",
            "service": "User Cache",
            "severity": "HIGH",
            "environment": "production",
            "error_message": "OOM command not allowed when used memory > 'maxmemory'",
            "logs": "[2026-09-28 16:15:32] ERROR redis_cluster:99 - RedisCommandException: OOM command not allowed when used memory > 'maxmemory'",
            "impact": "Session verification slowed by 450ms"
        }
    ]

@router.post("/demo/run-act/{act_id}")
def run_demo_act(act_id: int, db: Session = Depends(get_db)):
    """Runs a specific act in the demo presentation flow."""
    return {
        "act": act_id,
        "status": "success",
        "scenario": PRIMARY_DEMO_INCIDENT if act_id <= 2 else FOLLOWUP_LEARNING_INCIDENT
    }
