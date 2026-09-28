import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Incident, MemoryRecallLog
from app.hindsight.client import hindsight_service
from app.schemas import MemorySearchRequest, MemorySearchResult

router = APIRouter()

@router.get("/memory/stats")
def get_memory_stats(db: Session = Depends(get_db)):
    base_stats = hindsight_service.get_stats()
    total_retained_db = db.query(Incident).filter(Incident.retained_in_hindsight == True).count()
    recalls_total = db.query(MemoryRecallLog).count()

    return {
        **base_stats,
        "incidents_retained_count": total_retained_db,
        "total_recalls_executed": recalls_total,
        "learning_loop_status": "Active (Hindsight Institutional Memory)",
        "memory_insights": [
            "DB-04 resolved 4 previous connection pool incidents in Payment API",
            "Payment API frequently suffers from connection pool exhaustion under flash sale traffic",
            "Redis cluster failures correlate with missing TTL on guest session tokens",
            "Runbook K8S-03 successfully resolved 3 CrashLoopBackOff incidents via memory bumping"
        ]
    }

@router.get("/memory/recent")
def get_recent_memories(limit: int = 10, db: Session = Depends(get_db)):
    incidents = db.query(Incident).filter(
        Incident.retained_in_hindsight == True
    ).order_by(Incident.created_at.desc()).limit(limit).all()

    return [
        {
            "incident_id": inc.id,
            "service": inc.service,
            "title": inc.title,
            "root_cause": inc.root_cause,
            "resolution": inc.actual_resolution,
            "recovery_time": inc.resolution_time_minutes,
            "runbook": inc.runbook_id,
            "retained_at": inc.resolved_at or inc.created_at
        }
        for inc in incidents
    ]

@router.post("/memory/search", response_model=List[MemorySearchResult])
def search_memory(payload: MemorySearchRequest):
    memories = hindsight_service.recall_memories(
        query=payload.query,
        service=payload.service,
        top_k=payload.top_k
    )

    results = []
    for m in memories:
        results.append(MemorySearchResult(
            memory_id=m.get("memory_id", "mem_x"),
            title=f"Memory unit: {m.get('metadata', {}).get('incident_id', 'Knowledge')}",
            service=m.get("metadata", {}).get("service", "General"),
            content=m.get("content", ""),
            root_cause=m.get("metadata", {}).get("root_cause"),
            resolution=m.get("metadata", {}).get("resolution"),
            score=m.get("score", 0.8),
            tags=m.get("tags", []),
            timestamp=m.get("timestamp")
        ))
    return results

@router.get("/memory/graph")
def get_memory_graph(db: Session = Depends(get_db)):
    """Generates node-link data for the visual Memory Knowledge Graph."""
    incidents = db.query(Incident).limit(8).all()
    
    nodes = []
    links = []
    
    # Root node: Hindsight Memory Bank
    nodes.append({
        "id": "bank",
        "label": "Hindsight Memory Bank",
        "type": "bank",
        "group": "core"
    })
    
    for inc in incidents:
        inc_node_id = f"inc_{inc.id}"
        nodes.append({
            "id": inc_node_id,
            "label": f"{inc.id} ({inc.service})",
            "type": "incident",
            "severity": inc.severity,
            "group": "incident"
        })
        links.append({"source": "bank", "target": inc_node_id, "label": "retains"})
        
        if inc.root_cause:
            cause_node_id = f"cause_{inc.id}"
            nodes.append({
                "id": cause_node_id,
                "label": inc.root_cause[:30] + ("..." if len(inc.root_cause) > 30 else ""),
                "type": "cause",
                "group": "cause"
            })
            links.append({"source": inc_node_id, "target": cause_node_id, "label": "diagnosed_as"})
            
            if inc.runbook_id:
                rb_node_id = f"rb_{inc.runbook_id}"
                if not any(n["id"] == rb_node_id for n in nodes):
                    nodes.append({
                        "id": rb_node_id,
                        "label": f"Runbook {inc.runbook_id}",
                        "type": "runbook",
                        "group": "runbook"
                    })
                links.append({"source": cause_node_id, "target": rb_node_id, "label": "mitigated_by"})

    return {"nodes": nodes, "links": links}
