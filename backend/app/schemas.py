import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class IncidentCreate(BaseModel):
    id: Optional[str] = None
    title: str
    service: str
    environment: str = "production"
    severity: str = "CRITICAL"  # LOW, MEDIUM, HIGH, CRITICAL
    error_message: str
    logs: str
    stack_trace: Optional[str] = None
    description: Optional[str] = None
    impact: Optional[str] = None
    deployment_info: Optional[str] = None

class HistoricalEvidenceItem(BaseModel):
    incident_id: str
    similarity: str = "High"  # High, Medium, Low
    similarity_score: float = 0.85
    root_cause: str
    resolution: str
    resolution_time_minutes: Optional[int] = None
    service: str
    was_successful: bool = True
    key_takeaway: str

class RootCauseHypothesis(BaseModel):
    title: str
    confidence: str  # High, Medium, Low
    confidence_score: float = 0.85
    explanation: str
    supporting_evidence: List[str] = []

class ActivityStep(BaseModel):
    timestamp: str
    step: str
    status: str = "completed"  # pending, running, completed, skipped
    details: Optional[str] = None

class RunbookReference(BaseModel):
    runbook_id: str
    title: str
    match_reason: str
    estimated_time: str
    primary_steps: List[str]

class AnalysisResponse(BaseModel):
    incident_id: str
    summary: str
    observed_facts: List[str]
    root_cause_hypotheses: List[RootCauseHypothesis]
    historical_evidence: List[HistoricalEvidenceItem]
    recommended_actions: List[str]
    runbooks: List[RunbookReference]
    why_this_recommendation: str
    agent_activity: List[ActivityStep]
    memory_source: str = "Hindsight Cloud" # "Hindsight Cloud", "Hindsight OpenSource", "Demo Mode Fallback"
    is_hindsight_live: bool = False
    is_stateless_baseline: bool = False

class ResolveIncidentRequest(BaseModel):
    actual_root_cause: str
    actual_resolution: str
    resolution_time_minutes: int
    was_recommendation_helpful: str = "YES" # YES, PARTIALLY, NO
    runbook_used: Optional[str] = None
    additional_notes: Optional[str] = None
    lessons_learned: Optional[List[str]] = None

class PostmortemCreate(BaseModel):
    incident_id: str
    summary: str
    root_cause: str
    contributing_factors: List[str] = []
    timeline: List[str] = []
    what_went_well: List[str] = []
    what_went_wrong: List[str] = []
    preventive_actions: List[str] = []
    lessons_learned: List[str] = []

class PostmortemResponse(BaseModel):
    id: int
    incident_id: str
    summary: str
    root_cause: str
    contributing_factors: List[str]
    timeline: List[str]
    what_went_well: List[str]
    what_went_wrong: List[str]
    preventive_actions: List[str]
    lessons_learned: List[str]
    created_at: datetime.datetime
    retained_to_hindsight: bool

class IncidentResponse(BaseModel):
    id: str
    title: str
    service: str
    environment: str
    severity: str
    status: str
    error_message: str
    logs: str
    stack_trace: Optional[str]
    description: Optional[str]
    impact: Optional[str]
    deployment_info: Optional[str]
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime]
    resolution_time_minutes: Optional[int]
    root_cause: Optional[str]
    actual_resolution: Optional[str]
    runbook_id: Optional[str]
    was_recommendation_helpful: Optional[str]
    retained_in_hindsight: bool
    hindsight_memory_id: Optional[str]
    analysis: Optional[AnalysisResponse] = None

class DashboardStats(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    critical_incidents: int
    avg_resolution_time_minutes: float
    memories_retained: int
    memories_recalled_total: int
    similar_matches_count: int
    hindsight_status: str # "Connected", "Configured", "Demo Fallback"
    llm_status: str

class MemorySearchRequest(BaseModel):
    query: str
    service: Optional[str] = None
    top_k: int = 5

class MemorySearchResult(BaseModel):
    memory_id: str
    title: str
    service: str
    content: str
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    score: float
    tags: List[str] = []
    timestamp: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    backend: str
    llm: str
    llm_model: str
    hindsight: str
    hindsight_base_url: str
    hindsight_bank_id: str
    database: str
    is_demo_mode: bool
