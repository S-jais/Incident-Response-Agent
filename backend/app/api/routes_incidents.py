import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models import Incident, Postmortem, MemoryRecallLog
from app.schemas import (
    IncidentCreate, IncidentResponse, AnalysisResponse,
    ResolveIncidentRequest, PostmortemCreate, PostmortemResponse,
    HistoricalEvidenceItem
)
from app.agents.incident_agent import incident_agent
from app.agents.learning_agent import learning_agent
from app.hindsight.client import hindsight_service

router = APIRouter()

def incident_to_dict(inc: Incident) -> dict:
    return {
        "id": inc.id,
        "title": inc.title,
        "service": inc.service,
        "environment": inc.environment,
        "severity": inc.severity,
        "status": inc.status,
        "error_message": inc.error_message,
        "logs": inc.logs,
        "stack_trace": inc.stack_trace,
        "description": inc.description,
        "impact": inc.impact,
        "deployment_info": inc.deployment_info,
        "created_at": inc.created_at,
        "resolved_at": inc.resolved_at,
        "resolution_time_minutes": inc.resolution_time_minutes,
        "root_cause": inc.root_cause,
        "actual_resolution": inc.actual_resolution,
        "runbook_id": inc.runbook_id,
        "was_recommendation_helpful": inc.was_recommendation_helpful,
        "retained_in_hindsight": inc.retained_in_hindsight,
        "hindsight_memory_id": inc.hindsight_memory_id
    }

@router.get("/incidents", response_model=List[IncidentResponse])
def list_incidents(
    service: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if service:
        query = query.filter(Incident.service == service)
    if severity:
        query = query.filter(Incident.severity == severity)
    if status:
        query = query.filter(Incident.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Incident.id.ilike(s),
                Incident.title.ilike(s),
                Incident.error_message.ilike(s),
                Incident.service.ilike(s),
                Incident.root_cause.ilike(s)
            )
        )
    incidents = query.order_by(desc(Incident.created_at)).limit(limit).all()

    results = []
    for inc in incidents:
        analysis_data = None
        if inc.analysis_json:
            try:
                analysis_data = json.loads(inc.analysis_json)
            except Exception:
                pass
        results.append(IncidentResponse(
            **incident_to_dict(inc),
            analysis=analysis_data
        ))
    return results

@router.post("/incidents", response_model=IncidentResponse)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    # Auto-generate ID if not provided
    if not payload.id:
        count = db.query(Incident).count() + 1
        inc_id = f"INC-{1000 + count}"
    else:
        inc_id = payload.id

    # Check existing
    existing = db.query(Incident).filter(Incident.id == inc_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Incident {inc_id} already exists")

    new_inc = Incident(
        id=inc_id,
        title=payload.title,
        service=payload.service,
        environment=payload.environment,
        severity=payload.severity,
        status="INVESTIGATING",
        error_message=payload.error_message,
        logs=payload.logs,
        stack_trace=payload.stack_trace,
        description=payload.description,
        impact=payload.impact,
        deployment_info=payload.deployment_info,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    return IncidentResponse(**incident_to_dict(new_inc))

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    analysis_data = None
    if inc.analysis_json:
        try:
            analysis_data = json.loads(inc.analysis_json)
        except Exception:
            pass
    return IncidentResponse(**incident_to_dict(inc), analysis=analysis_data)

@router.post("/incidents/{incident_id}/analyze", response_model=AnalysisResponse)
def analyze_incident(
    incident_id: str,
    stateless: bool = Query(False, description="Run stateless baseline without Hindsight memory"),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc_dict = incident_to_dict(inc)
    analysis = incident_agent.analyze_incident(inc_dict, is_stateless_baseline=stateless)

    # Save analysis in incident if not stateless
    if not stateless:
        inc.analysis_json = json.dumps(analysis.model_dump())
        inc.status = "IDENTIFIED"
        db.commit()

        # Log memory recall
        recall_log = MemoryRecallLog(
            incident_id=inc.id,
            query=f"{inc.service} {inc.error_message}",
            recalled_incidents_json=json.dumps([e.incident_id for e in analysis.historical_evidence]),
            recalled_at=datetime.datetime.utcnow(),
            is_hindsight_live=analysis.is_hindsight_live
        )
        db.add(recall_log)
        db.commit()

    return analysis

@router.post("/incidents/{incident_id}/resolve", response_model=IncidentResponse)
def resolve_incident(
    incident_id: str,
    payload: ResolveIncidentRequest,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc.status = "RESOLVED"
    inc.resolved_at = datetime.datetime.utcnow()
    inc.root_cause = payload.actual_root_cause
    inc.actual_resolution = payload.actual_resolution
    inc.resolution_time_minutes = payload.resolution_time_minutes
    inc.was_recommendation_helpful = payload.was_recommendation_helpful
    inc.runbook_id = payload.runbook_used or inc.runbook_id or "DB-04"

    # Auto retain in Hindsight memory on resolution
    retain_res = hindsight_service.retain_incident(incident_to_dict(inc))
    inc.retained_in_hindsight = True
    inc.hindsight_memory_id = retain_res.get("memory_id", "")

    db.commit()
    db.refresh(inc)
    return IncidentResponse(**incident_to_dict(inc))

@router.post("/incidents/{incident_id}/postmortem", response_model=PostmortemResponse)
def generate_or_save_postmortem(
    incident_id: str,
    payload: Optional[PostmortemCreate] = None,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    # If payload provided, save it
    if payload:
        pm = db.query(Postmortem).filter(Postmortem.incident_id == incident_id).first()
        if not pm:
            pm = Postmortem(incident_id=incident_id)
        pm.summary = payload.summary
        pm.root_cause = payload.root_cause
        pm.contributing_factors = json.dumps(payload.contributing_factors)
        pm.timeline_json = json.dumps(payload.timeline)
        pm.what_went_well = json.dumps(payload.what_went_well)
        pm.what_went_wrong = json.dumps(payload.what_went_wrong)
        pm.preventive_actions = json.dumps(payload.preventive_actions)
        pm.lessons_learned = json.dumps(payload.lessons_learned)
        db.add(pm)
        db.commit()
        db.refresh(pm)
    else:
        # Generate automatically using learning agent
        gen = learning_agent.generate_postmortem(
            incident_to_dict(inc),
            {
                "actual_root_cause": inc.root_cause or "Connection pool exhaustion",
                "actual_resolution": inc.actual_resolution or "Increased pool size to 100",
                "resolution_time_minutes": inc.resolution_time_minutes or 12,
                "runbook_used": inc.runbook_id or "DB-04"
            }
        )
        pm = db.query(Postmortem).filter(Postmortem.incident_id == incident_id).first()
        if not pm:
            pm = Postmortem(incident_id=incident_id)
        pm.summary = gen["summary"]
        pm.root_cause = gen["root_cause"]
        pm.contributing_factors = json.dumps(gen.get("contributing_factors", []))
        pm.timeline_json = json.dumps(gen.get("timeline", []))
        pm.what_went_well = json.dumps(gen.get("what_went_well", []))
        pm.what_went_wrong = json.dumps(gen.get("what_went_wrong", []))
        pm.preventive_actions = json.dumps(gen.get("preventive_actions", []))
        pm.lessons_learned = json.dumps(gen.get("lessons_learned", []))
        db.add(pm)
        db.commit()
        db.refresh(pm)

    return PostmortemResponse(
        id=pm.id,
        incident_id=pm.incident_id,
        summary=pm.summary,
        root_cause=pm.root_cause,
        contributing_factors=json.loads(pm.contributing_factors or "[]"),
        timeline=json.loads(pm.timeline_json or "[]"),
        what_went_well=json.loads(pm.what_went_well or "[]"),
        what_went_wrong=json.loads(pm.what_went_wrong or "[]"),
        preventive_actions=json.loads(pm.preventive_actions or "[]"),
        lessons_learned=json.loads(pm.lessons_learned or "[]"),
        created_at=pm.created_at,
        retained_to_hindsight=pm.retained_to_hindsight
    )

@router.post("/incidents/{incident_id}/learn")
def retain_postmortem_to_hindsight(incident_id: str, db: Session = Depends(get_db)):
    """Explicit endpoint to retain postmortem institutional learnings to Hindsight."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    pm = db.query(Postmortem).filter(Postmortem.incident_id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if not pm:
        gen = learning_agent.generate_postmortem(
            incident_to_dict(inc),
            {
                "actual_root_cause": inc.root_cause or "Database connection pool exhaustion",
                "actual_resolution": inc.actual_resolution or "Increased pool size to 100",
                "resolution_time_minutes": inc.resolution_time_minutes or 12,
                "runbook_used": inc.runbook_id or "DB-04"
            }
        )
        pm = Postmortem(
            incident_id=incident_id,
            summary=gen["summary"],
            root_cause=gen["root_cause"],
            contributing_factors=json.dumps(gen.get("contributing_factors", [])),
            timeline_json=json.dumps(gen.get("timeline", [])),
            what_went_well=json.dumps(gen.get("what_went_well", [])),
            what_went_wrong=json.dumps(gen.get("what_went_wrong", [])),
            preventive_actions=json.dumps(gen.get("preventive_actions", [])),
            lessons_learned=json.dumps(gen.get("lessons_learned", [])),
        )
        db.add(pm)
        db.commit()
        db.refresh(pm)

    pm_dict = {
        "summary": pm.summary,
        "root_cause": pm.root_cause,
        "preventive_actions": json.loads(pm.preventive_actions or "[]"),
        "lessons_learned": json.loads(pm.lessons_learned or "[]")
    }

    result = learning_agent.learn_and_retain(incident_to_dict(inc), pm_dict)
    pm.retained_to_hindsight = True
    inc.retained_in_hindsight = True
    db.commit()

    return {
        "success": True,
        "message": f"Learnings for {incident_id} successfully retained in Hindsight memory",
        "hindsight_result": result
    }

@router.get("/incidents/{incident_id}/similar")
def get_similar_incidents(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    query = f"{inc.service} {inc.error_message}"
    memories = hindsight_service.recall_memories(query, service=inc.service, top_k=5)

    matches = []
    for m in memories:
        # Check if matches an incident in DB
        inc_id = m.get("metadata", {}).get("incident_id")
        db_match = db.query(Incident).filter(Incident.id == inc_id).first() if inc_id else None
        matches.append({
            "memory_id": m.get("memory_id"),
            "incident_id": inc_id or m.get("memory_id"),
            "title": db_match.title if db_match else m.get("metadata", {}).get("title", "Historical Incident"),
            "service": db_match.service if db_match else inc.service,
            "root_cause": db_match.root_cause if db_match else "Historical Root Cause",
            "resolution": db_match.actual_resolution if db_match else "Historical Resolution",
            "resolution_time_minutes": db_match.resolution_time_minutes if db_match else 12,
            "similarity_score": m.get("score", 0.85),
            "was_successful": True,
            "source": m.get("source", "Hindsight Cloud")
        })

    return matches
