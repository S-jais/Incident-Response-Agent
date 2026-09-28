"""
Preconfigured Hackathon Demo Scenarios for HindsightOps
Demonstrating the power of persistent Hindsight memory over stateless AI.
"""

from typing import Dict, Any

PRIMARY_DEMO_INCIDENT: Dict[str, Any] = {
    "id": "INC-1042",
    "title": "Payment API Database Connection Pool Exhaustion on Flash Sale Ingress",
    "service": "Payment API",
    "environment": "production",
    "severity": "CRITICAL",
    "status": "INVESTIGATING",
    "error_message": "maximum database connections reached; QueuePool limit of size 50 overflow 10 reached",
    "logs": """[2026-09-28 14:22:04.118] ERROR [payment-worker-8d2a] sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached, connection timed out, timeout 30.00
[2026-09-28 14:22:05.412] CRITICAL [payment-service] Handshake aborted on cluster pg-master-01.internal: pool acquisition timed out after 30000ms
[2026-09-28 14:22:06.002] ERROR [checkout-gateway] HTTP 500 Internal Server Error returned to checkout client (Session: usr_9942a)
[2026-09-28 14:22:07.890] ALERT [PagerDuty] High Error Rate on Payment API: 42.8% of checkout requests failing""",
    "stack_trace": """TimeoutError: QueuePool limit of size 50 overflow 10 reached, connection timed out, timeout 30.00
  File "sqlalchemy/pool/impl.py", line 388, in _do_get
    return self._pool.get(wait, self._timeout)
  File "app/services/payment.py", line 114, in process_charge
    with db.session_scope() as session:
  File "app/api/endpoints/checkout.py", line 82, in handle_charge
    result = await payment_service.charge(payload)""",
    "description": "During the midnight flash sale, customers reported failed transactions with 'Payment Service Temporarily Unavailable'. Database active connection metrics hit ceiling of 60.",
    "impact": "Over 2,300 checkout attempts failed in 4 minutes across EU & US regions.",
    "deployment_info": "Canary deployment v2.9.8 rolled out 40 minutes prior",
    "historical_matches_target": ["INC-0812", "INC-0921", "INC-0977"],
    "expected_runbook": "DB-04"
}

FOLLOWUP_LEARNING_INCIDENT: Dict[str, Any] = {
    "id": "INC-1099",
    "title": "Payment API Elevated Latency and Secondary Connection Pool Saturation",
    "service": "Payment API",
    "environment": "production",
    "severity": "HIGH",
    "status": "INVESTIGATING",
    "error_message": "QueuePool connection acquisition latency spiked to 28500ms (limit 100)",
    "logs": """[2026-09-29 09:15:22.041] WARN [payment-worker-91b] QueuePool utilization at 92% (92/100 active connections)
[2026-09-29 09:15:23.119] ERROR [payment-worker-91b] Database connection acquisition slow, latency 28.5s
[2026-09-29 09:15:24.004] WARN [checkout-gateway] P99 latency exceeded 4000ms on /v1/payments/charge""",
    "stack_trace": """SlowConnectionWarning: Database connection acquisition took 28500ms
  File "app/services/payment.py", line 114, in process_charge
  File "sqlalchemy/pool/impl.py", line 388, in _do_get""",
    "description": "Payment API is nearing connection pool exhaustion again during a regional promotion. Demonstrates that Hindsight now recalls both INC-0812 and the newly saved INC-1042 resolution.",
    "impact": "Elevated checkout latency, risk of imminent failure without proactive mitigation.",
    "deployment_info": "Production v2.9.9",
    "historical_matches_target": ["INC-1042", "INC-0812", "INC-0977"],
    "expected_runbook": "DB-04"
}

STATELESS_BASELINE_COMPARISON: Dict[str, Any] = {
    "without_memory": {
        "title": "Stateless Generic AI (Without Hindsight)",
        "approach": "Zero institutional context; generic LLM prompt answering based solely on the isolated error string.",
        "analysis": "The error indicates a database connection timeout. Check database connectivity, verify host firewall settings, and restart the database service or application server.",
        "drawbacks": [
            "No awareness of previous incidents in this infrastructure",
            "Suggests restarting database master (dangerous production antipattern!)",
            "Does not know company uses Runbook DB-04",
            "Does not know Payment API previously resolved this exact issue by bumping pool size from 50 to 100",
            "Cannot cite recovery time or historical confidence"
        ],
        "time_to_diagnose_est": "35-45 minutes (manual engineering triage)"
    },
    "with_hindsight": {
        "title": "HindsightOps AI (With Hindsight Memory)",
        "approach": "Persistent memory retrieval recalling historical incidents, root causes, past postmortems, and team runbooks.",
        "analysis": "This incident closely resembles INC-0812 and INC-0977 in Payment API. Historically, 3 similar connection pool saturations occurred under surge traffic. The proven fix is increasing pool size from 50 to 100 in Helm values and bouncing pods (Runbook DB-04). Average recovery time: 11-12 minutes.",
        "benefits": [
            "Directly identifies connection pool exhaustion vs connection leak based on INC-0812 and INC-0921",
            "Cites Runbook DB-04 used by the team",
            "Recommends targeted investigation without disruptive database restarts",
            "Stores final resolution so future incidents (e.g. INC-1099) get even faster resolutions",
            "Provides verifiable institutional evidence"
        ],
        "time_to_diagnose_est": "2-3 minutes (direct historical runbook application)"
    }
}
