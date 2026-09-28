import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    service = Column(String(100), nullable=False, index=True)
    environment = Column(String(50), default="production")
    severity = Column(String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="INVESTIGATING", index=True)  # INVESTIGATING, IDENTIFIED, MITIGATING, RESOLVED
    error_message = Column(Text, nullable=False)
    logs = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    impact = Column(String(255), nullable=True)
    deployment_info = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_time_minutes = Column(Integer, nullable=True)
    root_cause = Column(Text, nullable=True)
    actual_resolution = Column(Text, nullable=True)
    runbook_id = Column(String(50), nullable=True)
    was_recommendation_helpful = Column(String(20), nullable=True) # YES, PARTIALLY, NO
    retained_in_hindsight = Column(Boolean, default=False)
    hindsight_memory_id = Column(String(100), nullable=True)
    analysis_json = Column(Text, nullable=True)

    postmortem = relationship("Postmortem", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    recalls = relationship("MemoryRecallLog", back_populates="incident", cascade="all, delete-orphan")


class Postmortem(Base):
    __tablename__ = "postmortems"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), unique=True, nullable=False)
    summary = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=False)
    contributing_factors = Column(Text, nullable=True) # JSON list
    timeline_json = Column(Text, nullable=True) # JSON list
    what_went_well = Column(Text, nullable=True) # JSON list
    what_went_wrong = Column(Text, nullable=True) # JSON list
    preventive_actions = Column(Text, nullable=True) # JSON list
    lessons_learned = Column(Text, nullable=True) # JSON list
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    retained_to_hindsight = Column(Boolean, default=False)

    incident = relationship("Incident", back_populates="postmortem")


class MemoryRecallLog(Base):
    __tablename__ = "memory_recall_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), nullable=False)
    query = Column(Text, nullable=False)
    recalled_incidents_json = Column(Text, nullable=True) # JSON list of IDs and summaries
    recalled_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_hindsight_live = Column(Boolean, default=False)

    incident = relationship("Incident", back_populates="recalls")
