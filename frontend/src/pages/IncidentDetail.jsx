import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  BrainCircuit, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  Cpu, 
  History,
  Send,
  Zap,
  HelpCircle,
  Check
} from 'lucide-react';
import { 
  fetchIncident, 
  analyzeIncident, 
  resolveIncident, 
  generatePostmortem,
  fetchRunbook
} from '../api';
import SeverityBadge from '../components/SeverityBadge';
import ActivityLog from '../components/ActivityLog';
import SimilarIncidentsCard from '../components/SimilarIncidentsCard';
import RunbookModal from '../components/RunbookModal';
import PostmortemModal from '../components/PostmortemModal';

export default function IncidentDetail({ incidentId, onBack, onSelectIncident }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('agent'); // 'agent' | 'resolution'
  const [statelessMode, setStatelessMode] = useState(false);

  // Modals
  const [runbookModalOpen, setRunbookModalOpen] = useState(false);
  const [currentRunbook, setCurrentRunbook] = useState(null);
  const [postmortemModalOpen, setPostmortemModalOpen] = useState(false);
  const [currentPostmortem, setCurrentPostmortem] = useState(null);

  // Resolution Form State
  const [actualCause, setActualCause] = useState('Database connection pool exhaustion');
  const [actualResolution, setActualResolution] = useState('Increased pool size from 50 to 100 via Runbook DB-04 and restarted payment worker pods');
  const [resolutionTime, setResolutionTime] = useState(12);
  const [wasHelpful, setWasHelpful] = useState('YES');
  const [resolving, setResolving] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchIncident(incidentId)
      .then(data => {
        setIncident(data);
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [incidentId]);

  const handleRunAnalysis = async (stateless = false) => {
    setAnalyzing(true);
    setStatelessMode(stateless);
    try {
      const res = await analyzeIncident(incidentId, stateless);
      setAnalysis(res);
      // Reload incident to refresh status
      loadData();
    } catch (err) {
      alert('Analysis error: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOpenRunbook = async (rbId) => {
    try {
      const rb = await fetchRunbook(rbId || 'DB-04');
      setCurrentRunbook(rb);
      setRunbookModalOpen(true);
    } catch (err) {
      alert('Could not load runbook: ' + err.message);
    }
  };

  const handleOpenPostmortem = async () => {
    try {
      const pm = await generatePostmortem(incidentId);
      setCurrentPostmortem(pm);
      setPostmortemModalOpen(true);
    } catch (err) {
      alert('Could not generate postmortem: ' + err.message);
    }
  };

  const handleResolveIncident = async () => {
    setResolving(true);
    try {
      await resolveIncident(incidentId, {
        actual_root_cause: actualCause,
        actual_resolution: actualResolution,
        resolution_time_minutes: parseInt(resolutionTime) || 12,
        was_recommendation_helpful: wasHelpful,
        runbook_used: incident?.runbook_id || 'DB-04'
      });
      loadData();
      alert('Incident marked RESOLVED and retained into Hindsight memory!');
    } catch (err) {
      alert('Resolution error: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="py-20 text-center font-mono text-xs text-slate-500">
        Loading incident telemetry for {incidentId}...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400 text-sm">Incident {incidentId} not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-white">
          Back to incidents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition shrink-0 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-extrabold text-brand-400">
                  #{incident.id}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
                  {incident.service}
                </span>
                <SeverityBadge severity={incident.severity} />
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  incident.status === 'RESOLVED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {incident.status}
                </span>
                {incident.retained_in_hindsight && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <BrainCircuit className="w-3 h-3" />
                    Hindsight Institutional Memory
                  </span>
                )}
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {incident.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                <span>Env: <strong className="text-slate-300">{incident.environment}</strong></span>
                <span>•</span>
                <span>Impact: <strong className="text-slate-300">{incident.impact || 'Service Disruption'}</strong></span>
                {incident.deployment_info && (
                  <>
                    <span>•</span>
                    <span>Deploy: <strong className="text-slate-300">{incident.deployment_info}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {incident.status === 'RESOLVED' ? (
              <button
                onClick={handleOpenPostmortem}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Postmortem & Learning</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('resolution')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve Incident</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Incident Telemetry & Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Error Message Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Reported Error Message</span>
            </h3>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs font-mono text-rose-300 leading-relaxed break-words">
              {incident.error_message}
            </div>
            {incident.description && (
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans">
                {incident.description}
              </p>
            )}
          </div>

          {/* Log Stream Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono text-slate-300 font-semibold">Incident Logs</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">tail -n 50 stdout</span>
            </div>
            <pre className="p-4 text-[11px] font-mono leading-relaxed text-slate-300 bg-slate-950 overflow-x-auto whitespace-pre-wrap max-h-80 selection:bg-brand-500">
              {incident.logs}
            </pre>
          </div>

          {/* Stack Trace (if present) */}
          {incident.stack_trace && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase font-semibold mb-2">
                Stack Trace
              </h4>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
                {incident.stack_trace}
              </pre>
            </div>
          )}

          {/* Investigation Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Incident Timeline</span>
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 text-[10px]">T+00m</span>
                <div>Incident detected via telemetry alert</div>
              </div>
              {analysis && (
                <div className="flex items-start gap-2 text-brand-300">
                  <span className="text-slate-500 text-[10px]">T+01m</span>
                  <div>Hindsight searched; {analysis.historical_evidence.length} historical incidents matched</div>
                </div>
              )}
              {incident.status === 'RESOLVED' && (
                <>
                  <div className="flex items-start gap-2 text-emerald-300">
                    <span className="text-slate-500 text-[10px]">T+{incident.resolution_time_minutes || 12}m</span>
                    <div>Engineer applied recommended fix ({incident.runbook_id || 'DB-04'})</div>
                  </div>
                  <div className="flex items-start gap-2 text-cyan-300">
                    <span className="text-slate-500 text-[10px]">T+{incident.resolution_time_minutes || 12}m</span>
                    <div>Resolution and institutional learning stored in Hindsight</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Investigation Agent & Hindsight Memory (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Analysis Trigger Control Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-bold text-white">AI Incident Response Agent</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grounds diagnosis in historical incident memory and verified runbooks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Stateless Baseline Button */}
                <button
                  onClick={() => handleRunAnalysis(true)}
                  disabled={analyzing}
                  title="Run without Hindsight memory (Stateless baseline)"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono border border-slate-700 transition"
                >
                  Stateless Mode
                </button>

                {/* Hindsight Memory-Powered Analysis Button */}
                <button
                  onClick={() => handleRunAnalysis(false)}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-hindsight-cyan hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-brand-500/25"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>{analyzing ? 'Investigating with Hindsight...' : 'Investigate with Hindsight'}</span>
                </button>
              </div>
            </div>

            {/* Live Mode Indicator */}
            {analysis && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Memory Source:</span>
                <span className={analysis.is_stateless_baseline ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                  {analysis.memory_source}
                </span>
              </div>
            )}
          </div>

          {/* AI Analysis Results View */}
          {analysis ? (
            <div className="space-y-6">
              {/* Root Cause Hypothesis Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Root Cause Hypothesis
                    </h3>
                  </div>

                  {analysis.root_cause_hypotheses[0] && (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                        {analysis.root_cause_hypotheses[0].confidence} ({Math.round(analysis.root_cause_hypotheses[0].confidence_score * 100)}%)
                      </span>
                    </div>
                  )}
                </div>

                {analysis.root_cause_hypotheses.map((hyp, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-3 last:mb-0">
                    <h4 className="text-sm font-bold text-white mb-1">{hyp.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{hyp.explanation}</p>
                    {hyp.supporting_evidence?.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-850 flex flex-wrap gap-1.5">
                        {hyp.supporting_evidence.map((ev, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-300 border border-slate-750">
                            ✓ {ev}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Recalled Historical Evidence from Hindsight */}
              {!analysis.is_stateless_baseline && (
                <SimilarIncidentsCard 
                  incidents={analysis.historical_evidence} 
                  onSelectIncident={onSelectIncident}
                />
              )}

              {/* Recommended Action Steps */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Recommended Investigation & Mitigation Actions</span>
                  </h3>
                  {analysis.runbooks?.length > 0 && (
                    <button
                      onClick={() => handleOpenRunbook(analysis.runbooks[0].runbook_id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-mono border border-brand-500/30 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open {analysis.runbooks[0].runbook_id}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {analysis.recommended_actions.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                      <span className="font-mono text-xs font-bold text-brand-400 shrink-0 mt-0.5">
                        {idx + 1}.
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {act.replace(/^\d+\.\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Why This Recommendation? */}
                <div className="mt-4 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <div className="text-xs font-semibold text-brand-300 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
                    <span>Why This Recommendation?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis.why_this_recommendation}
                  </p>
                </div>
              </div>

              {/* Agent Observability Activity */}
              <ActivityLog activities={analysis.agent_activity} />
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Investigation Ready</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Click "Investigate with Hindsight" above to search persistent memory and retrieve historical solutions for this incident.
                </p>
              </div>
            </div>
          )}

          {/* Incident Resolution Feedback Loop Form */}
          {activeTab === 'resolution' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Resolution & Feedback Loop</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Stores Learning in Hindsight</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Did the AI Agent's recommendation resolve the incident?
                </label>
                <div className="flex gap-3">
                  {['YES', 'PARTIALLY', 'NO'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setWasHelpful(opt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition border ${
                        wasHelpful === opt
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Confirmed Root Cause
                </label>
                <input
                  type="text"
                  value={actualCause}
                  onChange={(e) => setActualCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Actual Resolution Applied
                </label>
                <textarea
                  rows={2}
                  value={actualResolution}
                  onChange={(e) => setActualResolution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Recovery Time (Minutes)
                </label>
                <input
                  type="number"
                  value={resolutionTime}
                  onChange={(e) => setResolutionTime(e.target.value)}
                  className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setActiveTab('agent')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveIncident}
                  disabled={resolving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25"
                >
                  <Check className="w-4 h-4" />
                  <span>{resolving ? 'Retaining in Hindsight...' : 'Mark Resolved & Retain in Hindsight'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Runbook Modal */}
      <RunbookModal
        runbook={currentRunbook}
        isOpen={runbookModalOpen}
        onClose={() => setRunbookModalOpen(false)}
      />

      {/* Postmortem Modal */}
      <PostmortemModal
        incident={incident}
        postmortem={currentPostmortem}
        isOpen={postmortemModalOpen}
        onClose={() => setPostmortemModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
