import React, { useState } from 'react';
import { X, FileText, BrainCircuit, CheckCircle2, Save, Sparkles, AlertCircle } from 'lucide-react';
import { savePostmortemLearning } from '../api';

export default function PostmortemModal({ incident, postmortem, isOpen, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editablePm, setEditablePm] = useState(null);

  React.useEffect(() => {
    if (postmortem) {
      setEditablePm({
        summary: postmortem.summary || '',
        root_cause: postmortem.root_cause || '',
        what_went_well: (postmortem.what_went_well || []).join('\n'),
        what_went_wrong: (postmortem.what_went_wrong || []).join('\n'),
        preventive_actions: (postmortem.preventive_actions || []).join('\n'),
        lessons_learned: (postmortem.lessons_learned || []).join('\n'),
        timeline: (postmortem.timeline || []).join('\n')
      });
    }
  }, [postmortem]);

  if (!isOpen || !incident) return null;

  const handleSaveToHindsight = async () => {
    setSaving(true);
    try {
      await savePostmortemLearning(incident.id);
      setSuccessMsg('Learning successfully retained into Hindsight memory bank!');
      if (onSaved) onSaved();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } catch (err) {
      alert('Error saving to Hindsight: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {incident.id}
                </span>
                <h2 className="text-base font-bold text-white">Postmortem & Institutional Memory</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and retain root cause learnings into Hindsight for future incident response.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Executive Summary */}
          <div>
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Executive Incident Summary
            </label>
            <textarea
              rows={3}
              value={editablePm?.summary || ''}
              onChange={(e) => setEditablePm({ ...editablePm, summary: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-sans focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Root Cause Analysis */}
          <div>
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Confirmed Technical Root Cause
            </label>
            <input
              type="text"
              value={editablePm?.root_cause || ''}
              onChange={(e) => setEditablePm({ ...editablePm, root_cause: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-sans focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What Went Well */}
            <div>
              <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1">
                What Went Well (1 per line)
              </label>
              <textarea
                rows={3}
                value={editablePm?.what_went_well || ''}
                onChange={(e) => setEditablePm({ ...editablePm, what_went_well: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* What Went Wrong */}
            <div>
              <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1">
                What Went Wrong (1 per line)
              </label>
              <textarea
                rows={3}
                value={editablePm?.what_went_wrong || ''}
                onChange={(e) => setEditablePm({ ...editablePm, what_went_wrong: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Preventive Actions */}
          <div>
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Preventive Actions Enacted (1 per line)
            </label>
            <textarea
              rows={2}
              value={editablePm?.preventive_actions || ''}
              onChange={(e) => setEditablePm({ ...editablePm, preventive_actions: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Institutional Lessons Learned (1 per line)
            </label>
            <textarea
              rows={2}
              value={editablePm?.lessons_learned || ''}
              onChange={(e) => setEditablePm({ ...editablePm, lessons_learned: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer with Hindsight Retention CTA */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-brand-400" />
            <span>Retaining saves knowledge to Hindsight memory bank for future incidents</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToHindsight}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-hindsight-cyan hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs transition shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{saving ? 'Retaining in Hindsight...' : 'Save Learning to Hindsight'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
