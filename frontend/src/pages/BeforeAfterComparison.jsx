import React, { useState, useEffect } from 'react';
import { GitCompare, AlertTriangle, BrainCircuit, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchDemoComparison } from '../api';

export default function BeforeAfterComparison({ onNavigate, onSelectIncident }) {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    fetchDemoComparison().then(setComparison).catch(console.error);
  }, []);

  const criteria = [
    {
      feature: 'Historical Incident Awareness',
      stateless: 'Zero awareness of past outages in this infrastructure',
      hindsight: 'Recalls INC-0812, INC-0921, and INC-0977 in Payment API',
      status: 'win'
    },
    {
      feature: 'Recommended Investigation',
      stateless: 'Suggests restarting primary database (Dangerous production antipattern)',
      hindsight: 'Recommends checking active connections & scaling pool ceiling per Runbook DB-04',
      status: 'win'
    },
    {
      feature: 'Runbook Grounding',
      stateless: 'Generic theoretical advice without company runbooks',
      hindsight: 'Exact match with Runbook DB-04 (Database Connection Pool Issues)',
      status: 'win'
    },
    {
      feature: 'Expected MTTR Recovery',
      stateless: '35–45 minutes of manual engineering triage and trial-and-error',
      hindsight: '10–12 minutes based on proven historical resolution history',
      status: 'win'
    },
    {
      feature: 'Future Institutional Learning',
      stateless: 'Stateless: forgotten immediately after conversation session ends',
      hindsight: 'Persistent: resolution & postmortem retained in Hindsight for future incidents',
      status: 'win'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-brand-400" />
          <span>Stateless AI vs Hindsight-Powered Incident Response</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct side-by-side comparison demonstrating why persistent institutional memory transforms SRE workflows.
        </p>
      </div>

      {/* Side by Side Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Stateless AI */}
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Stateless AI (Without Memory)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                Isolated Prompt
              </span>
            </div>

            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 leading-relaxed">
              <span className="text-slate-500">Analysis:</span>
              <p className="mt-1 text-slate-200">
                "The error indicates a database connection timeout. Check database connectivity, verify host firewall settings, and restart the database service or application server."
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-400 text-[11px] uppercase">Observed Limitations:</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Cannot cite historical incidents or previous MTTR</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Suggests restarting database master during a traffic surge</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>No knowledge of internal runbooks or team postmortems</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Next week, the team will start from scratch again</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-500">
            Triage time: ~35–45 minutes manual diagnosis
          </div>
        </div>

        {/* Right Card: Hindsight Memory AI */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>HindsightOps (With Persistent Memory)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Institutional Memory
              </span>
            </div>

            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-emerald-500/20 font-mono text-xs text-slate-300 leading-relaxed shadow-inner">
              <span className="text-cyan-400 font-bold">Hindsight Memory Recall:</span>
              <p className="mt-1 text-slate-200">
                "This incident matches INC-0812 and INC-0977 in Payment API. Historically, 3 similar connection pool saturations occurred under surge traffic. The proven fix is increasing pool size from 50 to 100 in Helm values and bouncing pods (Runbook DB-04). Average recovery time: 11-12 minutes."
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-400 text-[11px] uppercase">Proven Advantages:</h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pinpoints exact root cause using verifiable prior incidents</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Directly recommends Runbook DB-04 without risky restarts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Captures postmortem outcome into Hindsight upon resolution</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Next week, the agent will recall both old and newly learned fixes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-emerald-400 font-bold">
            Triage time: ~10–12 minutes target recovery (Runbook verified)
          </div>
        </div>
      </div>

      {/* Structured Criteria Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-850/40">
          <h3 className="text-sm font-bold text-white">Capability Comparison Matrix</h3>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {criteria.map((c, i) => (
            <div key={i} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="font-semibold text-slate-200">
                {c.feature}
              </div>
              <div className="text-slate-400">
                <span className="text-[10px] font-mono uppercase text-red-400 block mb-0.5">Stateless AI:</span>
                {c.stateless}
              </div>
              <div className="text-slate-200 font-medium">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-0.5">HindsightOps:</span>
                {c.hindsight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
