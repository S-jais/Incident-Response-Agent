"""
Learning Agent
Closes the operational feedback loop:
Captures engineer outcome -> Generates Postmortem -> Retains new institutional memory into Hindsight.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from app.hindsight.client import hindsight_service
from app.llm.client import llm_service
from app.llm.prompts import POSTMORTEM_PROMPT_TEMPLATE
from app.schemas import PostmortemCreate, PostmortemResponse

logger = logging.getLogger("hindsightops.learning")

class LearningAgent:
    def __init__(self):
        pass

    def generate_postmortem(self, incident: Dict[str, Any], resolution_details: Dict[str, Any]) -> Dict[str, Any]:
        """Generates a structured postmortem from incident facts and actual resolution."""
        prompt = POSTMORTEM_PROMPT_TEMPLATE.format(
            incident_id=incident.get("id", "INC-XXXX"),
            title=incident.get("title", ""),
            service=incident.get("service", ""),
            severity=incident.get("severity", ""),
            error_message=incident.get("error_message", ""),
            actual_root_cause=resolution_details.get("actual_root_cause", incident.get("root_cause", "")),
            actual_resolution=resolution_details.get("actual_resolution", incident.get("actual_resolution", "")),
            resolution_time_minutes=resolution_details.get("resolution_time_minutes", 12),
            runbook_used=resolution_details.get("runbook_used", "DB-04"),
            additional_notes=resolution_details.get("additional_notes", "None")
        )

        llm_out = llm_service.generate(
            prompt=prompt,
            system_prompt="You are an expert SRE Postmortem Generator. Produce blameless, highly actionable postmortems."
        )

        if llm_out.get("_is_live") and "summary" in llm_out:
            return llm_out

        # Structured default postmortem
        r_time = resolution_details.get("resolution_time_minutes", 12)
        cause = resolution_details.get("actual_root_cause", "Database connection pool exhaustion")
        res = resolution_details.get("actual_resolution", "Increased pool size to 100 and bounced worker pods")

        return {
            "summary": f"During peak ingress traffic, {incident.get('service')} suffered operational degradation due to {cause}. Restored in {r_time} minutes via {res}.",
            "root_cause": cause,
            "contributing_factors": [
                "Surge in transaction volume exceeding connection pool default capacity",
                "Connection timeout setting allowed worker threads to accumulate backlog"
            ],
            "timeline": [
                "T+0m: PagerDuty triggered on error rate threshold breach (> 5%)",
                "T+2m: Hindsight recalled historical incidents INC-0812 and INC-0977",
                "T+4m: Engineer applied Runbook DB-04 (scaled pool size from 50 to 100)",
                f"T+{r_time}m: Rolling restart completed, active connections normalized, checkout recovered"
            ],
            "what_went_well": [
                "Hindsight memory immediately identified the connection pool issue, avoiding database restarts",
                "Runbook DB-04 provided exact mitigation commands within 4 minutes"
            ],
            "what_went_wrong": [
                "Initial Prometheus pool alert fired late after QueuePool was already 100% full",
                "Connection overflow ceiling was too low for seasonal surges"
            ],
            "preventive_actions": [
                "Set pool warning alert threshold at 75% utilization in Prometheus",
                "Standardize baseline pool size to 100 across all high-throughput services",
                "Retain postmortem in Hindsight institutional memory for future responders"
            ],
            "lessons_learned": [
                "Persistent memory of previous resolutions cuts diagnosis MTTR by over 70%",
                "Documenting successful pool parameters prevents recurring trial-and-error during outages"
            ]
        }

    def learn_and_retain(self, incident: Dict[str, Any], postmortem: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Retains incident knowledge and postmortem into Hindsight."""
        results = {
            "incident_memory": None,
            "postmortem_memory": None,
            "success": True
        }

        # Retain incident resolution
        inc_mem = hindsight_service.retain_incident(incident)
        results["incident_memory"] = inc_mem

        # Retain postmortem if provided
        if postmortem:
            pm_mem = hindsight_service.retain_postmortem(postmortem, incident)
            results["postmortem_memory"] = pm_mem

        return results

learning_agent = LearningAgent()
