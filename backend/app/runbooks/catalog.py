from typing import Dict, Any, List

RUNBOOKS: Dict[str, Dict[str, Any]] = {
    "DB-04": {
        "id": "DB-04",
        "title": "Database Connection Pool Issues & Exhaustion",
        "service_types": ["Database", "Payment API", "Order Engine", "Postgres", "MySQL"],
        "severity": "CRITICAL",
        "estimated_recovery_time": "10-15 minutes",
        "summary": "Protocol for diagnosing and resolving database connection starvation, pool exhaustion, and connection leaks in production microservices.",
        "symptoms": [
            "maximum database connections reached",
            "FATAL: remaining connection slots are reserved for non-replication superuser connections",
            "PoolTimeout: QueuePool limit of size 50 overflow 10 reached",
            "SQLAlchemy connection acquisition timeout after 30000ms"
        ],
        "investigation_steps": [
            "Inspect database active connection count: `SELECT count(*), state FROM pg_stat_activity GROUP BY state;`",
            "Check current pool utilization on microservice metrics (Prometheus metric: `db_client_connections_in_use`).",
            "Identify idle-in-transaction connections holding open locks: `SELECT pid, age(clock_timestamp(), query_start), query FROM pg_stat_activity WHERE state != 'idle' ORDER BY age DESC LIMIT 5;`",
            "Review recent deployment commits for missing `db.close()` or unclosed session contexts."
        ],
        "mitigation_steps": [
            "Step 1: Increase connection pool ceiling temporarily via environment variable: `DB_POOL_SIZE=100` and `DB_MAX_OVERFLOW=30`.",
            "Step 2: Terminate hung idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND age(clock_timestamp(), state_change) > interval '5 minutes';`",
            "Step 3: Perform rolling restart of the afflicted microservice instances to release leaked connections.",
            "Step 4: Verify connection queue drains and P99 latency returns to baseline (< 120ms)."
        ],
        "historical_resolution_note": "Successfully resolved INC-0812 and INC-0977 in Payment API within 12 minutes by increasing pool from 50 to 100 and bouncing workers."
    },
    "REDIS-02": {
        "id": "REDIS-02",
        "title": "Redis Connection Failure & Eviction Storm",
        "service_types": ["Redis", "User Cache", "Session Store", "Notification Service"],
        "severity": "HIGH",
        "estimated_recovery_time": "8-12 minutes",
        "summary": "Mitigation steps for Redis cluster unreachable, maxmemory-policy eviction cascades, or connection socket timeouts.",
        "symptoms": [
            "OOM command not allowed when used memory > 'maxmemory'",
            "Connection refused to Redis cluster master node:6379",
            "Read timed out after 3000ms on redis.get(session_key)"
        ],
        "investigation_steps": [
            "Execute Redis diagnostics: `redis-cli -h $REDIS_HOST info memory` and check `used_memory_human` vs `maxmemory_human`.",
            "Inspect slow queries: `redis-cli slowlog get 10`.",
            "Verify network reachability from application pod to Redis cluster nodes.",
            "Check hit/miss ratio drop and client connection counts: `info clients`."
        ],
        "mitigation_steps": [
            "Step 1: Flush expired volatile keys or trigger active defragmentation: `redis-cli memory purge`.",
            "Step 2: If memory exhausted by rogue cache keys, set short TTL or execute non-blocking eviction for the offending prefix: `redis-cli --scan --pattern 'temp:*' | xargs -L 100 redis-cli unlink`.",
            "Step 3: Enable degraded mode in application: bypass Redis cache and query replica read-only DB if cache is unavailable.",
            "Step 4: Scale Redis cache node tier or increase `maxmemory` allocation."
        ],
        "historical_resolution_note": "Resolved INC-0843 by unlinking un-evicted session prefix and scaling maxmemory ceiling."
    },
    "API-07": {
        "id": "API-07",
        "title": "API Gateway 504 Timeout & Circuit Breaking",
        "service_types": ["API Gateway", "Checkout Frontend", "Payment API", "Envoy", "Kong"],
        "severity": "CRITICAL",
        "estimated_recovery_time": "5-10 minutes",
        "summary": "Remediation for upstream backend saturation causing ingress gateway 504 Gateway Timeout and thread pool starvation.",
        "symptoms": [
            "upstream request timeout",
            "HTTP 504 Gateway Time-out",
            "circuit breaker open for upstream cluster 'payment-service'",
            "Nginx 110: Connection timed out"
        ],
        "investigation_steps": [
            "Query gateway access logs for upstream status: `upstream_status=504` and `upstream_response_time > 10.0`.",
            "Isolate which downstream cluster is failing: check error rate per service route.",
            "Inspect upstream service CPU, memory, and thread pool worker count."
        ],
        "mitigation_steps": [
            "Step 1: Activate circuit breaker fallback response to return cached or synthetic degraded response for non-critical paths.",
            "Step 2: Increase upstream timeout header dynamically from 15s to 30s while investigating downstream bottleneck.",
            "Step 3: Scale upstream service replica count by 2x: `kubectl scale deployment payment-api --replicas=10`.",
            "Step 4: Divert 50% of ingress traffic to canary or alternative availability zone if region-specific."
        ],
        "historical_resolution_note": "Applied in INC-0914 to isolate cascading timeouts from Payment API to Gateway."
    },
    "K8S-03": {
        "id": "K8S-03",
        "title": "Kubernetes Pod CrashLoopBackOff & OOMKilled",
        "service_types": ["Kubernetes", "Order Engine", "Inventory DB", "Data Pipeline"],
        "severity": "HIGH",
        "estimated_recovery_time": "10-15 minutes",
        "summary": "Diagnostic procedure for pods entering CrashLoopBackOff due to exit code 137 (OOM) or unhandled runtime panics.",
        "symptoms": [
            "CrashLoopBackOff",
            "OOMKilled (Exit code 137)",
            "Container failed liveness probe, killing pod",
            "Terminating due to uncaught exception / SIGSEGV"
        ],
        "investigation_steps": [
            "Describe pod to inspect last termination state: `kubectl describe pod -l app=order-engine -n prod`.",
            "Check previous container exit code and logs: `kubectl logs --previous -l app=order-engine`.",
            "Inspect node memory pressure: `kubectl top nodes` and `kubectl top pods`."
        ],
        "mitigation_steps": [
            "Step 1: If exit code 137, bump container memory request & limit in Helm values or patch manifest: `resources.limits.memory: 2Gi`.",
            "Step 2: If liveness probe failed due to slow startup, increase `initialDelaySeconds: 45` and `failureThreshold: 5`.",
            "Step 3: Rollback to previous deployment revision: `kubectl rollout undo deployment/order-engine`.",
            "Step 4: Verify pods transition to `Running (1/1)` and passing readiness checks."
        ],
        "historical_resolution_note": "Resolved INC-0955 where Order Engine experienced heap spikes during flash sale."
    },
    "DEP-05": {
        "id": "DEP-05",
        "title": "Canary & Blue/Green Deployment Rollback",
        "service_types": ["All Services", "Deployment", "CI/CD"],
        "severity": "CRITICAL",
        "estimated_recovery_time": "3-5 minutes",
        "summary": "Rapid rollback protocol when newly released image causes error rate breach or regression.",
        "symptoms": [
            "Error rate spiked immediately following release v2.4.1",
            "Unknown column or migration mismatch after deploy",
            "P99 latency doubled after traffic shifted to canary"
        ],
        "investigation_steps": [
            "Verify time correlation between CI/CD deployment tag and error spike on Datadog/Grafana.",
            "Check git log diff between current release sha and previous stable release tag.",
            "Check database backward compatibility (schema additions vs deletions)."
        ],
        "mitigation_steps": [
            "Step 1: Shift 100% traffic immediately back to stable revision.",
            "Step 2: In Kubernetes: `kubectl rollout undo deployment/<service-name> -n production`.",
            "Step 3: If database migration was destructive, evaluate forward-fix vs restore from point-in-time snapshot.",
            "Step 4: Freeze deployments and announce incident bridge status."
        ],
        "historical_resolution_note": "Executed successfully in INC-0782 restoring Payment API within 4 minutes."
    },
    "SEC-01": {
        "id": "SEC-01",
        "title": "Authentication Throttling & JWT Rate Limit Spike",
        "service_types": ["Auth Gateway", "User Cache", "Security"],
        "severity": "HIGH",
        "estimated_recovery_time": "10-20 minutes",
        "summary": "Protocol for dealing with authentication floods, credential stuffing, or expired token validation storms.",
        "symptoms": [
            "429 Too Many Requests on /auth/v1/token",
            "JWKS key rotation mismatch / invalid signature",
            "Auth service CPU 98% with crypto verify bottleneck"
        ],
        "investigation_steps": [
            "Check source IP distribution for credential stuffing patterns: `tail -n 1000 access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -n 10`.",
            "Inspect JWKS cache age and public key fetch errors.",
            "Verify token cache hit rate in Redis."
        ],
        "mitigation_steps": [
            "Step 1: Enable Cloudflare / WAF IP-based rate limiting on `/auth/v1/*`.",
            "Step 2: Warm up JWKS local in-memory cache to prevent repeated upstream fetches.",
            "Step 3: Scale auth worker pods horizontally.",
            "Step 4: Block offending CIDR blocks identified in traffic analysis."
        ],
        "historical_resolution_note": "Used in INC-0888 to mitigate distributed login storm."
    }
}

def get_runbook(runbook_id: str) -> Dict[str, Any] | None:
    return RUNBOOKS.get(runbook_id)

def list_all_runbooks() -> List[Dict[str, Any]]:
    return list(RUNBOOKS.values())

def find_matching_runbooks(service: str, error: str) -> List[Dict[str, Any]]:
    matches = []
    error_lower = error.lower()
    service_lower = service.lower()

    for rb_id, rb in RUNBOOKS.items():
        score = 0
        reason = ""
        # Check service match
        for s in rb["service_types"]:
            if s.lower() in service_lower or service_lower in s.lower():
                score += 3
                reason = f"Matches service type '{s}'"
                break
        # Check symptoms match
        for symptom in rb["symptoms"]:
            if any(term in error_lower for term in symptom.lower().split() if len(term) > 3):
                score += 4
                reason = f"Symptoms match: '{symptom[:40]}...'"
                break

        if score > 0:
            matches.append({
                "runbook": rb,
                "score": score,
                "reason": reason or f"Relevant to {service} failure modes"
            })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return [m["runbook"] for m in matches[:3]]
