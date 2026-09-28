import React from 'react';
import { History, ArrowUpRight, CheckCircle2, Clock, Wrench } from 'lucide-react';

export default function SimilarIncidentsCard({ incidents = [], onSelectIncident }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-xs">
        No similar historical incidents recalled yet.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850/40">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Similar Historical Incidents</h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {incidents.length} Hindsight Matches
        </span>
      </div>

      <div className="divide-y divide-slate-800">
        {incidents.map((inc) => (
          <div 
            key={inc.incident_id || inc.id} 
            className="p-4 hover:bg-slate-850/50 transition cursor-pointer group"
            onClick={() => onSelectIncident && onSelectIncident(inc.incident_id || inc.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-400 group-hover:text-brand-300 transition">
                  {inc.incident_id || inc.id}
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {inc.service}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                  inc.similarity === 'High' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {inc.similarity || 'High'} Match ({Math.round((inc.similarity_score || 0.85) * 100)}%)
                </span>
              </div>

              {inc.resolution_time_minutes && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{inc.resolution_time_minutes} min recovery</span>
                </div>
              )}
            </div>

            {/* Root cause */}
            <div className="mt-2 text-xs">
              <span className="text-slate-400 font-medium">Root Cause: </span>
              <span className="text-slate-200">{inc.root_cause}</span>
            </div>

            {/* Proven Resolution */}
            <div className="mt-1 text-xs flex items-start gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-snug">
                <span className="text-emerald-400 font-medium">Proven Fix: </span>
                {inc.resolution}
              </div>
            </div>

            {inc.key_takeaway && (
              <p className="mt-2 text-[11px] text-slate-400 italic">
                "{inc.key_takeaway}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
