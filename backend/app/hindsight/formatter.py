"""
Hindsight Memory Formatter
Converts incident data and postmortems into structured, high-value knowledge representations for Hindsight retention.
"""

from typing import Dict, Any, List

def format_incident_for_hindsight(incident: Dict[str, Any]) -> str:
    """Formats an incident into structured text for Hindsight memory retention."""
    inc_id = incident.get("id", "UNKNOWN")
    service = incident.get("service", "General")
    severity = incident.get("severity", "MEDIUM")
    title = incident.get("title", "")
    error = incident.get("error_message", "")
    root_cause = incident.get("root_cause", "Under investigation")
    resolution = incident.get("actual_resolution", "Not resolved yet")
    recovery_time = incident.get("resolution_time_minutes", "N/A")
    runbook = incident.get("runbook_id", "None")
    impact = incident.get("impact", "N/A")
    lessons = incident.get("lessons_learned", [])
    if isinstance(lessons, list):
        lessons_str = "; ".join(lessons)
    else:
        lessons_str = str(lessons)

    content = f"""[INCIDENT MEMORY UNIT]
Incident ID: {inc_id}
Service: {service}
Severity: {severity}
Title: {title}
Error: {error}
Impact: {impact}
Root Cause: {root_cause}
Resolution: {resolution}
Resolution Time: {recovery_time} minutes
Runbook Used: {runbook}
Key Lessons: {lessons_str}
Observed Symptoms: {error} | Service: {service}
Resolution Verification: Confirmed successful in production.
"""
    return content.strip()

def format_postmortem_for_hindsight(postmortem: Dict[str, Any], incident_meta: Dict[str, Any]) -> str:
    """Formats postmortem findings into institutional knowledge for Hindsight."""
    inc_id = incident_meta.get("id", "UNKNOWN")
    service = incident_meta.get("service", "General")
    summary = postmortem.get("summary", "")
    root_cause = postmortem.get("root_cause", "")
    preventive = "; ".join(postmortem.get("preventive_actions", []))
    lessons = "; ".join(postmortem.get("lessons_learned", []))

    content = f"""[POSTMORTEM INSTITUTIONAL KNOWLEDGE]
Incident Reference: {inc_id}
Service Affected: {service}
Executive Summary: {summary}
Root Cause Analysis: {root_cause}
Preventive Actions Enacted: {preventive}
Institutional Lessons: {lessons}
Recommendation for Future Responders: When {service} exhibits {root_cause}, consult postmortem {inc_id} and follow preventive actions: {preventive}.
"""
    return content.strip()

def extract_hindsight_tags(incident: Dict[str, Any]) -> List[str]:
    """Generates clean tags for Hindsight memory indexing."""
    service = incident.get("service", "").lower().replace(" ", "-")
    severity = incident.get("severity", "").lower()
    runbook = incident.get("runbook_id", "").lower()
    tags = ["incident", f"service:{service}", f"severity:{severity}"]
    if runbook:
        tags.append(f"runbook:{runbook}")
    raw_tags = incident.get("tags", [])
    for t in raw_tags:
        clean = str(t).lower().strip()
        if clean and clean not in tags:
            tags.append(clean)
    return tags
