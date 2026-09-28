import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  BrainCircuit, 
  Sparkles, 
  Search, 
  ArrowRight,
  TrendingDown,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { fetchDashboard, fetchIncidents } from '../api';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import KnowledgeGraph from '../components/KnowledgeGraph';

export default function Dashboard({ onNavigate, onSelectIncident }) {
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboard(),
      fetchIncidents({ limit: 6 })
    ]).then(([dStats, incs]) => {
      setStats(dStats);
      setRecentIncidents(incs);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono mb-3">
            <BrainCircuit className="w-3.5 h-3.5 text-brand-400" />
            <span>HackWithHyderabad 3.0 • AI Agents That Learn Using Hindsight</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Turn every production incident into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-hindsight-cyan">institutional memory</span>.
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            When production fails, engineers shouldn't have to re-solve identical problems from scratch. 
            HindsightOps recalls previous root causes, verified runbooks, and postmortems from persistent Hindsight memory.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('demo')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-hindsight-cyan hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-brand-500/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 60s Judge Demo</span>
            </button>

            <button
              onClick={() => {
                onNavigate('incident-detail');
                onSelectIncident('INC-1042');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <span>Investigate Target INC-1042</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('compare')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition"
            >
              <span>Stateless vs Hindsight Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Outages"
          value={stats?.active_incidents ?? '1'}
          subtitle="Awaiting triage or resolution"
          icon={AlertOctagon}
          color="rose"
        />
        <StatCard
          title="Hindsight Memories"
          value={stats?.memories_retained ?? '28'}
          subtitle="Persistent institutional facts"
          icon={BrainCircuit}
          color="cyan"
        />
        <StatCard
          title="Average MTTR"
          value={`${stats?.avg_resolution_time_minutes ?? 11.8}m`}
          subtitle="72% faster with memory recall"
          icon={Clock}
          color="emerald"
          trend="↓ 72% MTTR"
        />
        <StatCard
          title="Historical Recalls"
          value={stats?.memories_recalled_total ?? '14'}
          subtitle="Institutional queries executed"
          icon={Zap}
          color="brand"
        />
      </div>

      {/* Visual Memory Loop Component */}
      <KnowledgeGraph onSelectIncident={onSelectIncident} />

      {/* Live Incident Queue & Quick Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent / Active Incidents */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-white">Live Incident Stream</h2>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  onSelectIncident(inc.id);
                  onNavigate('incident-detail');
                }}
                className="p-4 hover:bg-slate-850/50 transition cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-brand-400 group-hover:text-brand-300 transition">
                      {inc.id}
                    </span>
                    <SeverityBadge severity={inc.severity} />
                    <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {inc.service}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                      inc.status === 'RESOLVED' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {inc.title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {inc.error_message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {inc.retained_in_hindsight && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <BrainCircuit className="w-3 h-3" />
                      In Memory
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Scenario Callout Card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Target Hackathon Demo</span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              Payment API Connection Starvation
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Inspect how Hindsight recalls <span className="font-mono text-brand-300">INC-0812</span>, recommends <span className="font-mono text-cyan-300">Runbook DB-04</span>, stores the postmortem, and immediately recognizes repeated patterns.
            </p>

            <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="text-white">Payment API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity:</span>
                <span className="text-red-400 font-bold">CRITICAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hindsight Matches:</span>
                <span className="text-cyan-400 font-bold">3 Incidents</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('demo')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-500/20"
            >
              <span>Open Interactive Demo Stepper</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Memory Loop Status</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Active & Learning
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
