"""
SYNTHETIC DEMO INCIDENT DATASET FOR HINDSIGHTOPS
Note: All incidents, hostnames, and timestamps below are synthetic demo data created for HindsightOps.
"""

from typing import List, Dict, Any

SYNTHETIC_INCIDENTS: List[Dict[str, Any]] = [
    # Demo Anchor Incidents for Payment API
    {
        "id": "INC-0812",
        "title": "Payment API Connection Pool Saturation under Black Friday Surge",
        "service": "Payment API",
        "environment": "production",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "error_message": "maximum database connections reached; QueuePool limit 50 overflow 10 reached",
        "logs": "[2026-06-14 18:22:04] ERROR payment_worker.py:114 - sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached, connection timed out, timeout 30.00 (Background on this error at: https://sqlalche.me/e/20/3o7r)\n[2026-06-14 18:22:05] CRITICAL payment_gw:88 - Handshake aborted on cluster pg-master-01.internal",
        "stack_trace": "TimeoutError: QueuePool limit of size 50 overflow 10 reached\n  at sqlalchemy.pool.impl.QueuePool._do_get(queue.py:388)\n  at app.services.payment.process_charge(payment_worker.py:114)",
        "description": "Payment authorization requests failed across all EU and US checkout lanes during high load.",
        "impact": "1,420 checkout attempts blocked over 12 minutes",
        "deployment_info": "Release v2.8.4 rolled out 2 hours prior",
        "root_cause": "Database connection pool exhaustion due to default pool_size=50 under surge traffic",
        "actual_resolution": "Increased pool size from 50 to 100 with overflow=30 in Helm config and performed rolling restart of 8 payment pods",
        "resolution_time_minutes": 12,
        "runbook_id": "DB-04",
        "lessons_learned": [
            "Connection pool ceiling must dynamically scale with pod replica count",
            "Set Prometheus alert when DB connection pool utilization exceeds 75% for > 2m"
        ],
        "tags": ["payment", "database", "connection-pool", "sqlalchemy", "postgres"]
    },
    {
        "id": "INC-0921",
        "title": "Payment API Connection Leak in Stripe Webhook Handler",
        "service": "Payment API",
        "environment": "production",
        "severity": "HIGH",
        "status": "RESOLVED",
        "error_message": "FATAL: remaining connection slots are reserved for non-replication superuser connections",
        "logs": "[2026-07-29 04:12:18] ERROR webhook_handler.py:59 - DB session not released: async context manager unhandled exception\n[2026-07-29 04:12:21] ERROR postgres_client:34 - FATAL: 53300: remaining connection slots are reserved",
        "stack_trace": "OperationalError: (psycopg2.OperationalError) FATAL: remaining connection slots are reserved\n  at webhook_handler.py:59 in handle_webhook_event()",
        "description": "Gradual exhaustion of Postgres connections over 6 hours caused by missing session.close() in asynchronous webhook retry path.",
        "impact": "Elevated P99 latency on payment status callbacks",
        "deployment_info": "Hotfix v2.9.1 deployed 12 hours prior",
        "root_cause": "Connection leak in Payment API async webhook handler failing to release connections on 4xx retry",
        "actual_resolution": "Bounced Payment API pods to reclaim leaked slots, then deployed patch v2.9.2 wrapping webhook DB transactions in try...finally session.close()",
        "resolution_time_minutes": 18,
        "runbook_id": "DB-04",
        "lessons_learned": [
            "All async DB sessions must use strict context managers",
            "Added idle-in-transaction connection reaper in PgBouncer"
        ],
        "tags": ["payment", "connection-leak", "postgres", "webhook"]
    },
    {
        "id": "INC-0977",
        "title": "Payment Gateway Timeout During DB Failover",
        "service": "Payment API",
        "environment": "production",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "error_message": "Database connection timeout after 30000ms while acquiring slot from pool",
        "logs": "[2026-08-11 11:04:10] WARN pg_client:12 - Failed to acquire client from primary within 30000ms\n[2026-08-11 11:04:14] ERROR checkout_api:204 - 504 Gateway Timeout propagated to client",
        "stack_trace": "TimeoutError: Database connection timeout\n  at app.database.get_db() line 44",
        "description": "Aurora Postgres cluster replica failover left stale socket connections hung in payment pool.",
        "impact": "Payment gateway rejected 310 transactions",
        "deployment_info": "AWS RDS maintenance window",
        "root_cause": "Connection pool retained stale TCP connections to demoted primary without keepalive timeout",
        "actual_resolution": "Configured tcp_keepalives_idle=60 and pool_recycle=300, restarted Payment API instances per Runbook DB-04",
        "resolution_time_minutes": 10,
        "runbook_id": "DB-04",
        "lessons_learned": [
            "Set pool_recycle=300 in SQLAlchemy to refresh stale connections proactively",
            "Enable TCP keepalives on all RDS connection strings"
        ],
        "tags": ["payment", "database", "timeout", "failover", "rds"]
    },
    {
        "id": "INC-0843",
        "title": "User Cache Redis Eviction Storm Caused Auth Latency Spike",
        "service": "User Cache",
        "environment": "production",
        "severity": "HIGH",
        "status": "RESOLVED",
        "error_message": "OOM command not allowed when used memory > 'maxmemory'",
        "logs": "[2026-06-28 14:15:32] ERROR redis_cluster:99 - RedisCommandException: OOM command not allowed when used memory > 'maxmemory'\n[2026-06-28 14:15:33] WARN auth_svc:50 - Cache miss fallback to PostgreSQL master overloaded auth db",
        "stack_trace": "RedisCommandException: OOM command not allowed\n  at redis.client.execute_command(client.py:901)",
        "description": "User session token cache hit maxmemory limit of 8GB due to un-expiring guest tokens.",
        "impact": "Login requests slowed by 450ms across Web & Mobile apps",
        "deployment_info": "Marketing guest checkout campaign launched",
        "root_cause": "Redis maxmemory policy set to noeviction instead of allkeys-lru, combined with missing TTL on guest sessions",
        "actual_resolution": "Flushed volatile guest keys using non-blocking unlink, changed Redis maxmemory-policy to volatile-lru, and added 24h TTL to guest tokens (Runbook REDIS-02)",
        "resolution_time_minutes": 9,
        "runbook_id": "REDIS-02",
        "lessons_learned": [
            "Never use noeviction for ephemeral session cache tiers",
            "Enforce mandatory TTL in Redis serialization schema"
        ],
        "tags": ["redis", "cache", "eviction", "oom", "sessions"]
    },
    {
        "id": "INC-0888",
        "title": "Auth Gateway Credential Stuffing Rate Limit Exhaustion",
        "service": "Auth Gateway",
        "environment": "production",
        "severity": "HIGH",
        "status": "RESOLVED",
        "error_message": "HTTP 429 Too Many Requests; Auth worker thread pool saturated",
        "logs": "[2026-07-15 08:02:11] WARN rate_limiter:40 - IP bucket 185.220.101.0/24 exceeded 500 req/s\n[2026-07-15 08:02:15] ERROR auth_core:120 - Worker thread pool exhausted (50/50 threads busy)",
        "stack_trace": "ThreadLimitExceeded: Thread pool saturated\n  at app.security.auth_service:120",
        "description": "Coordinated botnet credential stuffing attack against /api/v1/auth/login saturated token verification workers.",
        "impact": "Legitimate users experienced intermittent 503 Service Unavailable on login",
        "deployment_info": "None (external attack)",
        "root_cause": "Rate limiting was keyed solely on endpoint instead of client IP subnet, allowing distributed flood to saturate workers",
        "actual_resolution": "Enabled Cloudflare WAF bot mitigation rule and enforced subnet-based token bucket rate limiting (Runbook SEC-01)",
        "resolution_time_minutes": 14,
        "runbook_id": "SEC-01",
        "lessons_learned": [
            "Enable aggressive honeypot paths for automated bot detection",
            "Rate limit on IP subnet prefix rather than individual IP"
        ],
        "tags": ["auth", "security", "rate-limiting", "waf"]
    },
    {
        "id": "INC-0914",
        "title": "API Gateway 504 Gateway Timeout Cascade on Upstream Payment Congestion",
        "service": "API Gateway",
        "environment": "production",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "error_message": "HTTP 504 Gateway Time-out; circuit breaker open for upstream cluster 'payment-service'",
        "logs": "[2026-07-22 19:30:00] ERROR envoy.access:1 - [2026-07-22T19:30:00.120Z] 'POST /v1/payments/charge HTTP/1.1' 504 UT 0 0 15002 - '-' 'CheckoutApp/3.1' 'payment-service' '10.0.4.15:8000'\n[2026-07-22 19:30:02] WARN envoy.router:2 - upstream request timeout after 15000ms",
        "stack_trace": "EnvoyGatewayTimeoutException: upstream request timeout after 15000ms\n  at envoy.filters.http.router",
        "description": "All payment requests from checkout microfrontends timed out at API Gateway ingress.",
        "impact": "Total checkout outage for 8 minutes",
        "deployment_info": "No gateway changes",
        "root_cause": "Downstream payment-service was queueing requests due to DB connection saturation, causing Envoy thread pool exhaustion",
        "actual_resolution": "Triaged via Runbook API-07: Activated circuit breaker fallback returning degraded friendly retry status, scaled payment-service pods to 12 replicas",
        "resolution_time_minutes": 8,
        "runbook_id": "API-07",
        "lessons_learned": [
            "Circuit breaker trip thresholds must be tightened so gateway sheds load before thread starvation",
            "Inject synthetic timeout mock tests in staging chaos drills"
        ],
        "tags": ["api-gateway", "envoy", "timeout", "circuit-breaker", "payment"]
    },
    {
        "id": "INC-0955",
        "title": "Order Engine Pod CrashLoopBackOff via Memory Leak in Serialization",
        "service": "Order Engine",
        "environment": "production",
        "severity": "HIGH",
        "status": "RESOLVED",
        "error_message": "CrashLoopBackOff; OOMKilled (Exit code 137)",
        "logs": "[2026-08-03 16:40:12] INFO k8s_events: - Pod order-engine-7b58c9779f-q8n2z terminated: OOMKilled (exit code 137)\n[2026-08-03 16:40:15] WARN kubelet: - Container order-worker exceeded memory limit 1024Mi",
        "stack_trace": "Fatal error: JavaScript out of memory / v8::internal::FatalProcessOutOfMemory\n  at JSON.stringify(orders_buffer)",
        "description": "Order processing worker pods were killed continuously by Kubernetes kubelet after accumulating unbuffered order batch telemetry in memory.",
        "impact": "Order fulfillment delayed by 15 minutes",
        "deployment_info": "Release v4.1.0 rolled out 45 minutes prior",
        "root_cause": "A newly introduced in-memory metrics aggregator kept unbounded arrays of order payloads without clearing on flush",
        "actual_resolution": "Triaged via Runbook K8S-03: rolled back deployment to v4.0.9 (`kubectl rollout undo deployment/order-engine`), bumped memory limit to 2Gi as safety margin",
        "resolution_time_minutes": 11,
        "runbook_id": "K8S-03",
        "lessons_learned": [
            "Add heap profiler integration in CI canary testing",
            "Set strict upper bound on in-memory buffers"
        ],
        "tags": ["order-engine", "kubernetes", "oom", "crashloop", "memory-leak"]
    },
    {
        "id": "INC-0782",
        "title": "Unindexed Foreign Key Migration Locked Orders Table",
        "service": "Order Engine",
        "environment": "production",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "error_message": "canceling statement due to statement timeout; lock queue contention on table 'orders'",
        "logs": "[2026-05-30 02:00:15] ERROR alembic.runtime: - ALTER TABLE orders ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);\n[2026-05-30 02:00:45] ERROR postgres: - Process 18491 waiting for AccessExclusiveLock on relation 16422 'orders'",
        "stack_trace": "QueryCanceledError: canceling statement due to statement timeout after 60000ms\n  at postgres.executor",
        "description": "Migration added foreign key constraint without `NOT VALID`, requiring a full table AccessExclusiveLock that blocked all incoming order writes.",
        "impact": "100% of order placements failed during 4-minute migration attempt",
        "deployment_info": "DB Migration migration_20260530_fk.py",
        "root_cause": "Blocking table lock on orders during synchronous constraint validation without NOT VALID",
        "actual_resolution": "Terminated migration transaction, executed Runbook DEP-05 rollback, recreated constraint with `NOT VALID` followed by `VALIDATE CONSTRAINT` asynchronously",
        "resolution_time_minutes": 4,
        "runbook_id": "DEP-05",
        "lessons_learned": [
            "Never run synchronous ADD CONSTRAINT without NOT VALID in Postgres production",
            "Add linter in CI to catch blocking DDL migrations"
        ],
        "tags": ["order-engine", "migration", "postgres", "table-lock", "alembic"]
    },
    {
        "id": "INC-0744",
        "title": "Notification Service Kafka Consumer Lag Spike and Rebalance Storm",
        "service": "Notification Service",
        "environment": "production",
        "severity": "MEDIUM",
        "status": "RESOLVED",
        "error_message": "CommitFailedException: Commit cannot be completed since the group has already rebalanced",
        "logs": "[2026-05-18 10:14:02] WARN kafka_consumer:82 - max.poll.interval.ms exceeded while dispatching SMS batches\n[2026-05-18 10:14:05] ERROR kafka_coordinator:33 - Org.apache.kafka.clients.consumer.CommitFailedException",
        "stack_trace": "CommitFailedException: max.poll.interval.ms exceeded\n  at kafka.clients.consumer.internals.ConsumerCoordinator.poll",
        "description": "Third-party SMS provider latency caused message processing time to exceed Kafka max.poll.interval.ms, triggering continuous partition rebalances.",
        "impact": "SMS verification codes delayed up to 6 minutes",
        "deployment_info": "None (third-party gateway slowdown)",
        "root_cause": "Notification batch processing time exceeded max.poll.interval.ms due to synchronous Twilio API calls",
        "actual_resolution": "Increased `max.poll.interval.ms` from 300000 to 600000, reduced `max.poll.records` from 500 to 50, and offloaded SMS dispatches to an internal worker thread pool",
        "resolution_time_minutes": 16,
        "runbook_id": "API-07",
        "lessons_learned": [
            "Never invoke external third-party HTTP endpoints inside synchronous Kafka poll loops",
            "Use async circuit breaker for third-party SMS providers"
        ],
        "tags": ["kafka", "notifications", "rebalance", "sms", "consumer-lag"]
    },
    {
        "id": "INC-0690",
        "title": "Inventory DB Disk Inode Exhaustion from Unrotated Audit Logs",
        "service": "Inventory DB",
        "environment": "production",
        "severity": "HIGH",
        "status": "RESOLVED",
        "error_message": "No space left on device (Errno 28: Out of Inodes)",
        "logs": "[2026-04-10 03:22:01] ERROR pg_audit: - failed to open audit log segment /var/log/postgres/audit_20260410.log: No space left on device\n[2026-04-10 03:22:02] CRITICAL systemd[1]: postgresql.service: Failed with result 'exit-code'",
        "stack_trace": "OSError: [Errno 28] No space left on device\n  at open('/var/log/postgres/audit_chunk_99214.log')",
        "description": "Postgres service crashed on disk write because filesystem ran out of inodes despite 40GB free disk space.",
        "impact": "Inventory reservation API returned 500 errors",
        "deployment_info": "Automated pg_audit logging update",
        "root_cause": "A malfunctioning cron script generated 10 million micro-audit files per hour without logrotate",
        "actual_resolution": "Purged stale audit chunks older than 48 hours using `find /var/log/postgres -name 'audit_*.log' -delete`, updated logrotate configuration to compress daily logs",
        "resolution_time_minutes": 13,
        "runbook_id": "DB-04",
        "lessons_learned": [
            "Monitor both disk byte capacity (df -h) and inode usage (df -i)",
            "Enforce systemd journal and logrotate ceilings on all database nodes"
        ],
        "tags": ["inventory", "disk", "inodes", "postgres", "logging"]
    },
    {
        "id": "INC-0631",
        "title": "Checkout Frontend Assets Broken by Cloudflare Edge Cache Purge",
        "service": "Checkout Frontend",
        "environment": "production",
        "severity": "MEDIUM",
        "status": "RESOLVED",
        "error_message": "404 Not Found on static chunk /assets/checkout-9a8f2c.js",
        "logs": "[2026-03-12 12:00:10] WARN cdn_access: 404 /assets/checkout-9a8f2c.js referer: https://shop.novacloud.io/checkout\n[2026-03-12 12:00:15] ERROR sentry_fe: ChunkLoadError: Loading chunk 849 failed",
        "stack_trace": "ChunkLoadError: Loading chunk 849 failed (missing: /assets/checkout-9a8f2c.js)\n  at webpack/runtime/loadChunk",
        "description": "Users already on the checkout page experienced broken buttons when dynamic lazy chunks failed to load after deployment.",
        "impact": "120 users encountered broken checkout steps",
        "deployment_info": "Frontend release v5.2.0 deployed to S3/CloudFront",
        "root_cause": "S3 sync script used `--delete` flag which erased previous release chunks while clients were still running cached index.html",
        "actual_resolution": "Removed `--delete` flag from S3 sync pipeline to retain assets for n-3 releases; restored previous release bundle from S3 versioning",
        "resolution_time_minutes": 7,
        "runbook_id": "DEP-05",
        "lessons_learned": [
            "Never delete old hashed asset chunks during deployment",
            "Retain at least 7 days of historical static chunks on CDN origin"
        ],
        "tags": ["frontend", "cdn", "cloudflare", "assets", "404"]
    },
    {
        "id": "INC-0588",
        "title": "Data Pipeline Worker Deadlock on Distributed Redlock",
        "service": "Data Pipeline",
        "environment": "production",
        "severity": "HIGH",
        "status": "RESOLVED",
        "error_message": "RedlockError: Unable to acquire lock on resource 'etl_batch_lock_partition_7'",
        "logs": "[2026-02-19 21:10:04] ERROR etl_runner:44 - RedlockError: failed to acquire majority of nodes (2/3 unreachable)\n[2026-02-19 21:10:07] WARN airflow_task: - Task instance failed, retrying in 300s",
        "stack_trace": "RedlockError: Unable to acquire lock on resource\n  at redlock.lock(etl_runner.py:44)",
        "description": "Hourly financial reconciliation DAG stalled due to Redis Redlock timeout.",
        "impact": "Daily reporting data delayed 40 minutes",
        "deployment_info": "Redis cluster node maintenance",
        "root_cause": "One of 3 Redis lock nodes was hung in disk fsync, preventing quorum calculation within the 200ms lock lease",
        "actual_resolution": "Increased Redlock acquisition timeout from 200ms to 800ms and released deadlocked keys manually using redis-cli",
        "resolution_time_minutes": 15,
        "runbook_id": "REDIS-02",
        "lessons_learned": [
            "Use PostgreSQL advisory locks or DynamoDB for mission-critical ETL leader election instead of Redlock over fragile networks",
            "Add alert for DAG tasks stuck in running state > 10m"
        ],
        "tags": ["data-pipeline", "redis", "redlock", "deadlock", "etl"]
    }
]

# Function to get synthetic incident list expanded to 40 items with variations
def get_all_synthetic_incidents() -> List[Dict[str, Any]]:
    base = list(SYNTHETIC_INCIDENTS)
    # Generate variations with authentic realistic parameters
    services = ["Payment API", "Auth Gateway", "Order Engine", "User Cache", "Inventory DB", "Notification Service", "API Gateway", "Checkout Frontend"]
    
    variations = [
        ("INC-0710", "Payment API", "HIGH", "Database connection pool exhausted under coupon flash sale", "DB-04", 11, "QueuePool limit 50 reached", "Connection pool exhaustion", "Increased pool size to 100 via Helm config and restarted payment pods"),
        ("INC-0725", "User Cache", "MEDIUM", "Redis key expiration storm during cache warm up", "REDIS-02", 8, "Redis memory spike 95%", "Lack of random jitter on bulk cache expiry", "Added +/-15% jitter to TTLs to stagger evictions"),
        ("INC-0750", "Auth Gateway", "HIGH", "JWKS endpoint 502 Bad Gateway during IdP cert rollover", "SEC-01", 14, "Failed to fetch public keys from IdP", "Cached public key expired before background fetch completed", "Warmed up local JWKS cache and extended fallback TTL to 48 hours"),
        ("INC-0799", "Order Engine", "CRITICAL", "Postgres deadlocks on concurrent inventory reservation updates", "DB-04", 17, "deadlock detected Process 9812 waits for ShareLock", "Non-deterministic order of row-level locks in checkout transaction", "Sorted item IDs prior to acquiring row locks with SELECT FOR UPDATE"),
        ("INC-0830", "API Gateway", "HIGH", "Nginx worker connections exhausted on HTTP/2 stream flood", "API-07", 9, "768 worker_connections are not enough", "Client library bug opened 1000 parallel streams without reuse", "Increased worker_connections to 4096 and enabled stream limit"),
        ("INC-0865", "Notification Service", "MEDIUM", "APNS certificate expired causing iOS push delivery drops", "API-07", 19, "SSL certificate verify failed: certificate has expired", "Annual Apple push certificate expired without automated renewal", "Updated APNS cert in Kubernetes secrets store and restarted dispatcher"),
        ("INC-0899", "Inventory DB", "HIGH", "Read replica replication lag breached 15 minutes during bulk sync", "DB-04", 22, "Replication lag exceeds 900s threshold", "Large unindexed table analyze job starved WAL receiver", "Temporarily redirected read traffic to secondary replica and tuned wal_receiver_buffer_size"),
        ("INC-0935", "Payment API", "CRITICAL", "Database connection timeout under surge traffic", "DB-04", 12, "QueuePool size 50 exhausted; remaining connection slots reserved", "Connection pool exhaustion under surge", "Applied DB-04 runbook: scaled pool size from 50 to 100 and restarted pods"),
        ("INC-0960", "Order Engine", "HIGH", "Kubernetes pod CrashLoopBackOff after OOMKill during CSV export", "K8S-03", 10, "Container order-worker terminated with exit code 137", "Unstreamed CSV export loaded 200,000 orders into RAM", "Applied streaming generator in CSV endpoint and bumped memory limit to 2Gi"),
        ("INC-0985", "Checkout Frontend", "MEDIUM", "DNS resolution failure for API gateway ingress from client web", "API-07", 15, "net::ERR_NAME_NOT_RESOLVED", "Route53 latency routing record misconfiguration", "Rolled back DNS change to weighted alias record"),
        ("INC-1002", "User Cache", "HIGH", "Redis replica disconnected during high sync network saturation", "REDIS-02", 13, "MASTER <-> REPLICA sync: Error condition on socket", "Network bandwidth throttling on t3.medium cache instance", "Upgraded Redis nodes to r6g.large network-optimized instances"),
        ("INC-1015", "Payment API", "CRITICAL", "Stripe API 500 errors during cross-border card settlement", "API-07", 21, "StripeConnectionError: connection reset by peer", "Upstream Stripe European datacenter routing glitch", "Toggled secondary payment processor fallback routing in payment gateway"),
        ("INC-1028", "Auth Gateway", "HIGH", "Bcrypt CPU saturation on high concurrency password resets", "SEC-01", 16, "CPU utilization 99.4% on auth-service-pod", "Bcrypt cost factor set to 14 instead of recommended 12", "Lowered cost factor to 12 and horizontally scaled auth replicas from 4 to 8"),
        ("INC-1033", "Data Pipeline", "MEDIUM", "Snowflake warehouse credit limit reached during batch ingestion", "API-07", 25, "Warehouse compute credit quota exhausted", "Uncapped query auto-retry loop in staging ETL job", "Terminated rogue staging ETL query and adjusted warehouse auto-suspend to 5m"),
        ("INC-1038", "Inventory DB", "HIGH", "Postgres autovacuum freeze storm caused query degradation", "DB-04", 18, "transaction ID wraparound imminent; autovacuum running", "High transaction volume without tuned autovacuum workers", "Increased autovacuum_max_workers to 6 and increased maintenance_work_mem")
    ]

    for inc_id, s_name, sev, title, rb, r_time, err, cause, res in variations:
        base.append({
            "id": inc_id,
            "title": title,
            "service": s_name,
            "environment": "production",
            "severity": sev,
            "status": "RESOLVED",
            "error_message": err,
            "logs": f"[2026-08-20 10:00:00] ERROR {s_name.lower().replace(' ', '_')}: - {err}\n[2026-08-20 10:00:02] ALERT - SLA threshold breached",
            "stack_trace": f"Error: {err}\n  at app.{s_name.lower().replace(' ', '_')}.handler()",
            "description": f"Operational degradation in {s_name}: {title}",
            "impact": f"Service disruption lasting approximately {r_time} minutes",
            "deployment_info": "Production standard release",
            "root_cause": cause,
            "actual_resolution": res,
            "resolution_time_minutes": r_time,
            "runbook_id": rb,
            "lessons_learned": [
                f"Documented in runbook {rb}",
                f"Automated health checks added for {s_name}"
            ],
            "tags": [s_name.lower().replace(" ", "-"), rb.lower(), "production"]
        })

    return base
