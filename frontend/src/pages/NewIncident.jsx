import React, { useState } from 'react';
import { PlusCircle, Sparkles, AlertTriangle, Terminal, ArrowRight, Zap } from 'lucide-react';
import { createIncident } from '../api';

export default function NewIncident({ onIncidentCreated }) {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    service: 'Payment API',
    severity: 'CRITICAL',
    environment: 'production',
    error_message: '',
    logs: '',
    stack_trace: '',
    description: '',
    impact: 'Checkout failures on web & mobile clients',
    deployment_info: 'Production release v2.9.8 deployed 45m prior'
  });

  // 4 Realistic Enterprise Presets for quick demo creation
  const presets = [
    {
      title: 'Payment API Connection Pool Exhaustion (Demo Scenario INC-1042)',
      badge: 'Hackathon Demo',
      color: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
      data: {
        title: 'Payment API Database Connection Pool Exhaustion on Flash Sale Ingress',
        service: 'Payment API',
        severity: 'CRITICAL',
        environment: 'production',
        error_message: 'maximum database connections reached; QueuePool limit of size 50 overflow 10 reached',
        logs: `[2026-09-28 14:22:04.118] ERROR [payment-worker-8d2a] sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached, connection timed out, timeout 30.00
[2026-09-28 14:22:05.412] CRITICAL [payment-service] Handshake aborted on cluster pg-master-01.internal: pool acquisition timed out after 30000ms
[2026-09-28 14:22:06.002] ERROR [checkout-gateway] HTTP 500 Internal Server Error returned to checkout client (Session: usr_9942a)
[2026-09-28 14:22:07.890] ALERT [PagerDuty] High Error Rate on Payment API: 42.8% of checkout requests failing`,
        stack_trace: `TimeoutError: QueuePool limit of size 50 overflow 10 reached, connection timed out, timeout 30.00
  File "sqlalchemy/pool/impl.py", line 388, in _do_get
    return self._pool.get(wait, self._timeout)
  File "app/services/payment.py", line 114, in process_charge
    with db.session_scope() as session:
  File "app/api/endpoints/checkout.py", line 82, in handle_charge
    result = await payment_service.charge(payload)`,
        description: 'During midnight flash sale, customers reported failed transactions with "Payment Service Temporarily Unavailable". DB active connections hit ceiling.',
        impact: 'Over 2,300 checkout attempts failed in 4 minutes across EU & US regions.',
        deployment_info: 'Canary deployment v2.9.8 rolled out 40 minutes prior'
      }
    },
    {
      title: 'Redis Session Cache OOM Eviction Storm',
      badge: 'Cache Failure',
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      data: {
        title: 'User Cache Redis Maxmemory Eviction Cascade',
        service: 'User Cache',
        severity: 'HIGH',
        environment: 'production',
        error_message: "OOM command not allowed when used memory > 'maxmemory'",
        logs: `[2026-09-28 16:15:32] ERROR redis_cluster:99 - RedisCommandException: OOM command not allowed when used memory > 'maxmemory'
[2026-09-28 16:15:33] WARN auth_svc:50 - Cache miss fallback to PostgreSQL master overloaded auth db
[2026-09-28 16:15:35] ALERT P99 session validation latency breached 800ms`,
        stack_trace: `RedisCommandException: OOM command not allowed
  at redis.client.execute_command(client.py:901)`,
        description: 'User session token cache hit maxmemory limit of 8GB due to un-expiring guest tokens.',
        impact: 'Login requests slowed by 450ms across Web & Mobile apps',
        deployment_info: 'Marketing guest checkout campaign launched'
      }
    },
    {
      title: 'Kubernetes Pod CrashLoopBackOff & OOMKilled',
      badge: 'Container / K8s',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      data: {
        title: 'Order Engine Pod CrashLoopBackOff via Memory Leak in Serialization',
        service: 'Order Engine',
        severity: 'HIGH',
        environment: 'production',
        error_message: 'CrashLoopBackOff; OOMKilled (Exit code 137)',
        logs: `[2026-09-28 18:40:12] INFO k8s_events: - Pod order-engine-7b58c9779f-q8n2z terminated: OOMKilled (exit code 137)
[2026-09-28 18:40:15] WARN kubelet: - Container order-worker exceeded memory limit 1024Mi
[2026-09-28 18:40:20] ERROR k8s_controller: - Back-off restarting failed container`,
        stack_trace: `Fatal error: JavaScript out of memory / v8::internal::FatalProcessOutOfMemory
  at JSON.stringify(orders_buffer)`,
        description: 'Order processing worker pods were killed continuously by Kubernetes kubelet after accumulating unbuffered order batch telemetry in memory.',
        impact: 'Order fulfillment delayed by 15 minutes',
        deployment_info: 'Release v4.1.0 rolled out 45 minutes prior'
      }
    },
    {
      title: 'API Gateway 504 Timeout Cascade',
      badge: 'Ingress Timeout',
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      data: {
        title: 'API Gateway 504 Gateway Timeout Cascade on Upstream Payment Congestion',
        service: 'API Gateway',
        severity: 'CRITICAL',
        environment: 'production',
        error_message: "HTTP 504 Gateway Time-out; circuit breaker open for upstream cluster 'payment-service'",
        logs: `[2026-09-28 19:30:00] ERROR envoy.access:1 - [2026-09-28T19:30:00.120Z] 'POST /v1/payments/charge HTTP/1.1' 504 UT 0 0 15002 - '-' 'CheckoutApp/3.1' 'payment-service' '10.0.4.15:8000'
[2026-09-28 19:30:02] WARN envoy.router:2 - upstream request timeout after 15000ms`,
        stack_trace: `EnvoyGatewayTimeoutException: upstream request timeout after 15000ms
  at envoy.filters.http.router`,
        description: 'All payment requests from checkout microfrontends timed out at API Gateway ingress.',
        impact: 'Total checkout outage for 8 minutes',
        deployment_info: 'No gateway changes'
      }
    }
  ];

  const handleApplyPreset = (preset) => {
    setFormData({ ...preset.data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.error_message || !formData.logs) {
      alert('Please fill Title, Error Message, and Logs.');
      return;
    }

    setSubmitting(true);
    try {
      const inc = await createIncident(formData);
      if (onIncidentCreated) {
        onIncidentCreated(inc.id);
      }
    } catch (err) {
      alert('Error creating incident: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-brand-400" />
          <span>Declare Production Incident</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Create an incident manually or select a realistic pre-configured enterprise failure scenario to test Hindsight memory recall.
        </p>
      </div>

      {/* Enterprise Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Quick Demo Presets (1-Click Fill)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className={`p-3.5 rounded-xl border text-left transition hover:scale-[1.01] ${p.color} shadow-sm group`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded-full bg-slate-900/60 font-bold">
                  {p.badge}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {p.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                {p.data.service} • {p.data.severity}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Incident Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Database Connection Pool Exhaustion on Payment API"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Affected Service *
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Payment API">Payment API</option>
              <option value="Auth Gateway">Auth Gateway</option>
              <option value="Order Engine">Order Engine</option>
              <option value="User Cache">User Cache</option>
              <option value="Inventory DB">Inventory DB</option>
              <option value="Notification Service">Notification Service</option>
              <option value="API Gateway">API Gateway</option>
              <option value="Checkout Frontend">Checkout Frontend</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Severity *
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            >
              <option value="production">production</option>
              <option value="staging">staging</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Deployment Info
            </label>
            <input
              type="text"
              value={formData.deployment_info}
              onChange={(e) => setFormData({ ...formData, deployment_info: e.target.value })}
              placeholder="e.g. Release v2.9.8 deployed 40m prior"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Error Message *
          </label>
          <input
            type="text"
            required
            value={formData.error_message}
            onChange={(e) => setFormData({ ...formData, error_message: e.target.value })}
            placeholder="e.g. maximum database connections reached; QueuePool limit of size 50 overflow 10 reached"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Logs / Raw Telemetry *
          </label>
          <textarea
            rows={5}
            required
            value={formData.logs}
            onChange={(e) => setFormData({ ...formData, logs: e.target.value })}
            placeholder="Paste raw log lines or stack trace..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            User / Customer Impact
          </label>
          <input
            type="text"
            value={formData.impact}
            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            placeholder="e.g. 2,300 checkout attempts failed in 4 minutes"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-hindsight-cyan hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-brand-500/25"
          >
            <Zap className="w-4 h-4" />
            <span>{submitting ? 'Declaring Incident...' : 'Declare & Start AI Investigation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
