import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.models import Incident
from app.demo.synthetic_incidents import get_all_synthetic_incidents
from app.demo.scenarios import PRIMARY_DEMO_INCIDENT
from app.hindsight.client import hindsight_service
from app.api import (
    routes_health,
    routes_dashboard,
    routes_incidents,
    routes_memory,
    routes_demo,
    routes_runbooks
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("hindsightops")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed initial dataset if empty
    logger.info("Initializing HindsightOps database...")
    init_db()

    db = SessionLocal()
    try:
        count = db.query(Incident).count()
        if count == 0:
            logger.info("Database is empty. Auto-seeding initial synthetic historical incidents...")
            synthetic_list = get_all_synthetic_incidents()
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
                    retained_in_hindsight=True
                )
                db.add(inc)
                hindsight_service.retain_incident(inc_data)

            # Also add the initial investigating incident INC-1042
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
            db.commit()
            logger.info(f"Auto-seeded {len(synthetic_list)} historical incidents + demo INC-1042.")
    except Exception as e:
        logger.error(f"Error during auto-seed: {e}")
        db.rollback()
    finally:
        db.close()

    yield
    logger.info("Shutting down HindsightOps backend...")

app = FastAPI(
    title="HindsightOps AI Incident Response Agent API",
    description="An AI incident responder that remembers what happened before. Built for HackWithHyderabad 3.0.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local hackathon demo convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(routes_health.router, prefix="/api", tags=["Health"])
app.include_router(routes_dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(routes_incidents.router, prefix="/api", tags=["Incidents"])
app.include_router(routes_memory.router, prefix="/api", tags=["Memory"])
app.include_router(routes_demo.router, prefix="/api", tags=["Demo"])
app.include_router(routes_runbooks.router, prefix="/api", tags=["Runbooks"])

@app.get("/")
def root():
    return {
        "name": "HindsightOps API",
        "tagline": "An AI incident responder that remembers what happened before.",
        "docs": "/docs",
        "health": "/api/health"
    }
