"""
LLM Prompt Templates for HindsightOps
Defines both stateless baseline prompts and Hindsight memory-augmented prompts.
"""

STATELESS_PROMPT_TEMPLATE = """You are a standard DevOps assistant without access to any historical incident memory or infrastructure knowledge.
Analyze this incident based ONLY on the isolated symptoms and error message provided below.

INCIDENT DETAILS:
Service: {service}
Severity: {severity}
Error Message: {error_message}
Logs:
{logs}

Provide your analysis in strictly valid JSON format matching this schema:
{{
  "summary": "Short 1-2 sentence description of the error",
  "observed_facts": ["List of 2-3 observable symptoms directly from the text"],
  "root_cause_hypotheses": [
    {{
      "title": "General potential cause",
      "confidence": "Medium",
      "confidence_score": 0.50,
      "explanation": "Theoretical explanation based on error string",
      "supporting_evidence": ["String matching in error"]
    }}
  ],
  "recommended_actions": [
    "General debugging suggestion (e.g. check connectivity, restart service)",
    "Inspect host metrics"
  ],
  "why_this_recommendation": "Generic textbook recommendation for this type of error."
}}
"""

MEMORY_AUGMENTED_PROMPT_TEMPLATE = """You are HindsightOps, an advanced AI Incident Response Agent with access to institutional memory powered by Hindsight.
You possess persistent memory of previous production incidents, root causes, past postmortems, and team-specific runbooks.

CURRENT INCIDENT:
Incident ID: {incident_id}
Service: {service}
Severity: {severity}
Title: {title}
Error Message: {error_message}
Impact: {impact}
Deployment Info: {deployment_info}
Logs:
{logs}
Stack Trace:
{stack_trace}

============================================================
RECALLED HISTORICAL INCIDENTS FROM HINDSIGHT MEMORY:
============================================================
{historical_memory_context}

============================================================
AVAILABLE TEAM RUNBOOKS:
============================================================
{runbooks_context}

INSTRUCTIONS:
1. Ground your diagnosis in the RECALLED HISTORICAL INCIDENTS.
2. State clearly which previous incidents (e.g. INC-0812, INC-0921, etc.) this resembles, and what resolution worked.
3. Recommend specific, actionable investigation and mitigation steps referencing the matched runbook.
4. Distinguish clearly between OBSERVED FACTS, AI HYPOTHESES, and HISTORICAL EVIDENCE.
5. In "why_this_recommendation", explain how institutional memory from Hindsight guided this conclusion over generic advice.

Respond in strictly valid JSON format matching this schema:
{{
  "summary": "Concise summary citing historical patterns",
  "observed_facts": ["Observable facts from logs and current telemetry"],
  "root_cause_hypotheses": [
    {{
      "title": "Specific root cause hypothesis based on history",
      "confidence": "High",
      "confidence_score": 0.88,
      "explanation": "Detailed explanation linking current symptoms to past incidents",
      "supporting_evidence": ["Evidence 1", "Evidence 2"]
    }}
  ],
  "historical_evidence": [
    {{
      "incident_id": "INC-XXXX",
      "similarity": "High",
      "similarity_score": 0.92,
      "root_cause": "Historical cause",
      "resolution": "Historical resolution that worked",
      "resolution_time_minutes": 12,
      "service": "{service}",
      "was_successful": true,
      "key_takeaway": "Key lesson learned"
    }}
  ],
  "recommended_actions": [
    "Step 1: Check DB active connections via pg_stat_activity",
    "Step 2: Inspect pool utilization against max threshold",
    "Step 3: Follow Runbook DB-04 step 1 to increase pool size to 100",
    "Step 4: Perform rolling restart of afflicted microservice workers"
  ],
  "why_this_recommendation": "Detailed explanation of why historical evidence makes this the highest-probability fix."
}}
"""

POSTMORTEM_PROMPT_TEMPLATE = """You are generating an engineering postmortem for a resolved production incident.

INCIDENT METADATA:
Incident ID: {incident_id}
Title: {title}
Service: {service}
Severity: {severity}
Error: {error_message}
Actual Root Cause: {actual_root_cause}
Actual Resolution Applied: {actual_resolution}
Recovery Time: {resolution_time_minutes} minutes
Runbook Used: {runbook_used}
Additional Notes: {additional_notes}

Generate a thorough postmortem in valid JSON format:
{{
  "summary": "Executive summary of the outage and resolution",
  "root_cause": "In-depth technical root cause analysis",
  "contributing_factors": ["Factor 1", "Factor 2"],
  "timeline": [
    "T+0m: Incident detected via PagerDuty",
    "T+2m: Hindsight recalled historical incidents",
    "T+5m: Applied recommended runbook fix",
    "T+{resolution_time_minutes}m: Full service recovery verified"
  ],
  "what_went_well": ["Hindsight accurately recalled prior incident within seconds", "Team resolved in target MTTR"],
  "what_went_wrong": ["Alert threshold allowed pool to saturate before throttling"],
  "preventive_actions": ["Add proactive alert at 75% pool saturation", "Update Helm values default pool size"],
  "lessons_learned": ["Institutional memory shortened MTTR by over 70%"]
}}
"""
