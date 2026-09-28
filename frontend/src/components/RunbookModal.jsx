import React from 'react';
import { X, BookOpen, Clock, ShieldCheck, Terminal, Copy, Check } from 'lucide-react';

export default function RunbookModal({ runbook, isOpen, onClose }) {
  const [copiedIdx, setCopiedIdx] = React.useState(null);

  if (!isOpen || !runbook) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {runbook.id}
                </span>
                <h2 className="text-base font-bold text-white">{runbook.title}</h2>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Recovery: {runbook.estimated_recovery_time || '10-15 minutes'}
                </span>
                <span>•</span>
                <span>Services: {(runbook.service_types || []).join(', ')}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Overview</h4>
            <p className="leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-slate-300">
              {runbook.summary}
            </p>
          </div>

          {/* Historical Resolution Note */}
          {runbook.historical_resolution_note && (
            <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3.5 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-brand-300">Institutional Hindsight Note: </span>
                <span className="text-slate-300">{runbook.historical_resolution_note}</span>
              </div>
            </div>
          )}

          {/* Investigation Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Diagnostic Investigation Steps</h4>
            <div className="space-y-2">
              {(runbook.investigation_steps || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                  <span className="font-mono text-xs text-brand-400 font-bold shrink-0">{idx + 1}.</span>
                  <div className="text-xs font-mono text-slate-300 leading-relaxed break-all">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigation Protocol */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Remediation & Mitigation Protocol</h4>
            <div className="space-y-2.5">
              {(runbook.mitigation_steps || []).map((step, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-mono text-slate-200">{step}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(step, idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-white bg-slate-800 transition"
                      title="Copy command"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close Runbook
          </button>
        </div>
      </div>
    </div>
  );
}
