import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, ShieldAlert, ArrowRight, Terminal } from 'lucide-react';
import { fetchRunbooks } from '../api';
import RunbookModal from '../components/RunbookModal';

export default function RunbooksList() {
  const [runbooks, setRunbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunbook, setSelectedRunbook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchRunbooks()
      .then(data => {
        setRunbooks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleOpen = (rb) => {
    setSelectedRunbook(rb);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-400" />
          <span>Production Runbook Catalog</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Standardized mitigation protocols autonomously matched and cited by HindsightOps during incident investigations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runbooks.map((rb) => (
          <div
            key={rb.id}
            onClick={() => handleOpen(rb)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-brand-500/50 hover:bg-slate-850/40 transition cursor-pointer flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {rb.id}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {rb.estimated_recovery_time}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition">
                {rb.title}
              </h3>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                {rb.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-500">
                {(rb.service_types || []).slice(0, 2).join(', ')}
              </span>
              <span className="text-brand-400 group-hover:translate-x-1 transition font-medium flex items-center gap-1">
                <span>View Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <RunbookModal
        runbook={selectedRunbook}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
