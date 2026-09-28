import React, { useState, useEffect } from 'react';
import { BrainCircuit, Database, ShieldAlert, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { fetchMemoryGraph } from '../api';

export default function KnowledgeGraph({ onSelectIncident }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemoryGraph()
      .then(data => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Preconfigured visual graph showing the learning progression
  const learningChain = [
    {
      step: '1. Historical Incident',
      id: 'INC-0812',
      service: 'Payment API',
      event: 'Connection Pool Saturation',
      desc: 'QueuePool limit 50 reached during flash sale',
      color: 'border-red-500/40 bg-red-500/10 text-red-300'
    },
    {
      step: '2. Root Cause & Fix',
      id: 'Runbook DB-04',
      service: 'Mitigation',
      event: 'Pool ceiling 50 -> 100',
      desc: 'Increased pool size & bounced workers (12 min recovery)',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
    },
    {
      step: '3. Institutional Memory',
      id: 'Hindsight Memory Bank',
      service: 'Vector Retention',
      event: 'Retained Lesson',
      desc: 'Documented connection pool ceiling behavior in Hindsight',
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
    },
    {
      step: '4. New Outage (Current)',
      id: 'INC-1042',
      service: 'Payment API',
      event: 'Recurring Symptoms',
      desc: 'Instant recall of INC-0812 & Runbook DB-04 (Zero guesswork)',
      color: 'border-brand-500/40 bg-brand-500/10 text-brand-300'
    },
    {
      step: '5. Future Resilience',
      id: 'INC-1099',
      service: 'Next Incident',
      event: 'Cumulative Knowledge',
      desc: 'Agent applies both INC-0812 and newly retained INC-1042 postmortem',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hindsight Institutional Memory Loop
            </h3>
            <p className="text-xs text-slate-400">
              Visualizing how historical resolutions turn into persistent operational intelligence
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-850 text-slate-300 border border-slate-700">
          Continuous Learning Graph
        </span>
      </div>

      {/* Visual Timeline Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {learningChain.map((node, idx) => (
          <div key={idx} className="relative group">
            <div className={`p-4 rounded-xl border ${node.color} h-full flex flex-col justify-between hover:scale-[1.02] transition shadow-lg`}>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  {node.step}
                </div>
                <div className="font-mono text-xs font-bold text-white mb-0.5">
                  {node.id}
                </div>
                <div className="text-[11px] font-semibold text-slate-200">
                  {node.event}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {node.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{node.service}</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
            </div>

            {/* Connecting Chevron on Desktop */}
            {idx < learningChain.length - 1 && (
              <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400">
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
