import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Terminal, Cpu } from 'lucide-react';

export default function ActivityLog({ activities = [] }) {
  const [expanded, setExpanded] = useState(true);

  if (!activities || activities.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-850/60 hover:bg-slate-850 text-left transition border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Agent Reasoning & Hindsight Retrieval Activity
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-brand-300 border border-slate-700">
            {activities.length} steps completed
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span>{expanded ? 'Collapse' : 'Expand'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-3 font-mono text-xs bg-slate-950/70 divide-y divide-slate-850">
          {activities.map((step, idx) => (
            <div key={idx} className="pt-2.5 first:pt-0 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-slate-200 font-medium">{step.step}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{step.timestamp}</span>
                </div>
                {step.details && (
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-sans">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
