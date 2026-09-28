"""
Standalone Memory Seeding Script for HindsightOps
Seeds the 40+ synthetic enterprise incidents into Hindsight memory bank and SQLite database.

Usage:
  python seed_memory.py
"""

import sys
import os
from pathlib import Path

# Ensure app package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import settings
from app.database import init_db, SessionLocal
from app.models import Incident, Postmortem, MemoryRecallLog
from app.demo.synthetic_incidents import get_all_synthetic_incidents
from app.demo.scenarios import PRIMARY_DEMO_INCIDENT
from app.hindsight.client import hindsight_service

def run_seed():
    print("=" * 60)
    print("HINDSIGHTOPS MEMORY SEED SCRIPT")
    print("=" * 60)
    print(f"Hindsight Live Status: {hindsight_service.is_live}")
    print(f"Hindsight Bank ID:     {settings.HINDSIGHT_BANK_ID}")
    print(f"Hindsight Base URL:    {settings.HINDSIGHT_BASE_URL}")
    print("-" * 60)

    # Initialize DB schema
    init_db()
    db = SessionLocal()

    try:
        incidents_data = get_all_synthetic_incidents()
        print(f"Loaded {len(incidents_data)} synthetic historical incidents.")

        success_count = 0
        hindsight_retained = 0

        for inc_data in incidents_data:
            inc_id = inc_data["id"]
            existing = db.query(Incident).filter(Incident.id == inc_id).first()

            if not existing:
                inc = Incident(
                    id=inc_id,
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
                    retained_in_hindsight=True
                )
                db.add(inc)
                success_count += 1
            else:
                inc = existing

            # Retain to Hindsight
            try:
                res = hindsight_service.retain_incident(inc_data)
                if res.get("success"):
                    hindsight_retained += 1
            except Exception as e:
                print(f"  [WARN] Failed to retain {inc_id} in Hindsight: {e}")

        # Ensure demo incident INC-1042 exists in investigating state
        demo_existing = db.query(Incident).filter(Incident.id == PRIMARY_DEMO_INCIDENT["id"]).first()
        if not demo_existing:
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
                deployment_info=PRIMARY_DEMO_INCIDENT["deployment_info"]
            )
            db.add(demo_inc)
            print(f"Created primary demo incident: {PRIMARY_DEMO_INCIDENT['id']} (Status: INVESTIGATING)")

        db.commit()
        print("-" * 60)
        print(f"Seed Summary:")
        print(f"  Database records created: {success_count}")
        print(f"  Hindsight memories retained: {hindsight_retained}")
        print(f"  Target memory source: {'Hindsight Cloud (Live)' if hindsight_service.is_live else 'Demo Fallback Store'}")
        print("=" * 60)
        print("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
