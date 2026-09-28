import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Database, 
  RotateCcw,
  Zap,
  ShieldCheck,
  Clock,
  BookOpen
} from 'lucide-react';
import { fetchDemoScenario, analyzeIncident, resolveIncident, triggerFollowupIncident, resetDemo } from '../api';

export default function MemoryLearningDemo({ onSelectIncident, onNavigate }) {
  const [step, setStep] = useState(1);
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statelessAnalysis, setStatelessAnalysis] = useState(null);
  const [memoryAnalysis, setMemoryAnalysis] = useState(null);
  const [followupIncident, setFollowupIncident] = useState(null);
  const [followupAnalysis, setFollowupAnalysis] = useState(null);

  useEffect(() => {
    fetchDemoScenario().then(setScenario).catch(console.error);
  }, []);

  const stepsMeta = [
    { num: 1, title: 'Incident Ingress', desc: 'Outage detected in Payment API' },
    { num: 2, title: 'Stateless AI Baseline', desc: 'Analyzing with Zero Memory' },
    { num: 3, title: 'Generic Advice Pitfall', desc: 'Risky generic recommendation' },
    { num: 4, title: 'Activate Hindsight Memory', desc: 'Querying persistent bank' },
    { num: 5, title: 'Multi-Incident Recall', desc: 'INC-0812, INC-0921 matched' },
    { num: 6, title: 'Institutional Fix Applied', desc: 'Runbook DB-04 (12m MTTR)' },
    { num: 7, title: 'Resolution & Learning', desc: 'Capture outcome in Hindsight' },
    { num: 8, title: 'Trigger Follow-up Incident', desc: 'INC-1099 during flash sale' },
    { num: 9, title: 'Cumulative Memory Recall', desc: 'Agent recalls both old & new learning' },
    { num: 10, title: 'The Hindsight Payoff', desc: 'Permanent institutional intelligence' },
  ];

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      // Run stateless analysis
      setLoading(true);
      try {
        const res = await analyzeIncident('INC-1042', true);
        setStatelessAnalysis(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
      // Run memory-augmented analysis
      setLoading(true);
      try {
        const res = await analyzeIncident('INC-1042', false);
        setMemoryAnalysis(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      setStep(7);
      // Resolve incident and store in Hindsight
      setLoading(true);
      try {
        await resolveIncident('INC-1042', {
          actual_root_cause: 'Database connection pool exhaustion',
          actual_resolution: 'Increased pool size from 50 to 100 via Runbook DB-04 and restarted payment worker pods',
          resolution_time_minutes: 12,
          was_recommendation_helpful: 'YES',
          runbook_used: 'DB-04'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (step === 7) {
      setStep(8);
      // Trigger followup incident INC-1099
      setLoading(true);
      try {
        const trig = await triggerFollowupIncident();
        setFollowupIncident(trig.incident);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (step === 8) {
      setStep(9);
      // Analyze INC-1099 with newly retained memory!
      setLoading(true);
      try {
        const res = await analyzeIncident('INC-1099', false);
        setFollowupAnalysis(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (step === 9) {
      setStep(10);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    await resetDemo();
    setStep(1);
    setStatelessAnalysis(null);
    setMemoryAnalysis(null);
    setFollowupIncident(null);
    setFollowupAnalysis(null);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 60-Second Judge Walkthrough</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Memory Learning Lifecycle Demo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Watch the AI agent evolve from a generic chatbot into an experienced SRE that gets smarter with every incident.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
          {stepsMeta.map((s) => {
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div 
                key={s.num} 
                onClick={() => setStep(s.num)}
                className="flex items-center gap-2 cursor-pointer shrink-0"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition ${
                  isDone 
                    ? 'bg-emerald-500 text-slate-950' 
                    : isCurrent 
                    ? 'bg-brand-500 text-white ring-2 ring-brand-400/50 ring-offset-2 ring-offset-slate-900' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                {s.num < stepsMeta.length && (
                  <div className={`w-4 sm:w-6 h-0.5 ${isDone ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 font-medium">
            Step {step} of 10: <strong className="text-brand-300">{stepsMeta[step - 1].title}</strong>
          </span>
          <span className="text-slate-500 text-[11px] font-mono">
            {stepsMeta[step - 1].desc}
          </span>
        </div>
      </div>

      {/* Step Content Presentation Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col justify-between">
        {/* Step 1: Incident Ingress */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Step 1: Production Incident Ingress</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              NovaCloud Payment API is failing under peak checkout load.
            </h2>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div><span className="text-slate-500">Target Incident:</span> <strong className="text-brand-400">INC-1042</strong></div>
              <div><span className="text-slate-500">Service:</span> Payment API (production)</div>
              <div><span className="text-slate-500">Reported Error:</span> <span className="text-rose-400">maximum database connections reached; QueuePool limit of size 50 overflow 10 reached</span></div>
              <div><span className="text-slate-500">Symptom:</span> 42% of customer checkout attempts are throwing HTTP 500</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              First, let's observe how a traditional <strong className="text-white">stateless AI chatbot</strong> responds with zero access to historical memory.
            </p>
          </div>
        )}

        {/* Step 2 & 3: Stateless AI Baseline & Pitfalls */}
        {(step === 2 || step === 3) && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>{step === 2 ? 'Step 2: Stateless AI Response' : 'Step 3: Why Generic AI Fails in Production'}</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {step === 2 ? 'Stateless AI Baseline (Zero Memory)' : 'The Danger of Textbook Guesswork'}
            </h2>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs font-mono text-amber-300">
              <div className="font-bold mb-1">Generic AI Output:</div>
              <p className="text-slate-200 font-sans leading-relaxed">
                "The error indicates a database connection timeout. Check database connectivity, verify host firewall settings, and restart the database service or application server."
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Production Drawbacks of Stateless AI:</h4>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li><strong className="text-rose-400">Dangerous suggestion:</strong> Restarting the primary database during a surge causes cluster failover and cascade outages!</li>
                <li><strong className="text-slate-300">Zero context:</strong> Doesn't know the engineering team uses Runbook DB-04.</li>
                <li><strong className="text-slate-300">Blind to history:</strong> Doesn't know Payment API solved this exact problem in INC-0812 by scaling pool size from 50 to 100.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4 & 5: Enabling Hindsight Memory & Recalling History */}
        {(step === 4 || step === 5) && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>{step === 4 ? 'Step 4: Querying Hindsight Memory Bank' : 'Step 5: Multi-Incident Recall & High-Confidence Diagnosis'}</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Hindsight Recalls 3 Similar Production Incidents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-500/30 text-xs font-mono space-y-1">
                <div className="text-brand-400 font-bold">INC-0812 (94% Match)</div>
                <div className="text-slate-400 text-[11px]">Connection pool exhaustion under surge</div>
                <div className="text-emerald-400 text-[11px] font-bold">Fix: Bumped pool 50 to 100</div>
                <div className="text-slate-500 text-[10px]">Recovery: 12 min</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-brand-400 font-bold">INC-0921 (82% Match)</div>
                <div className="text-slate-400 text-[11px]">Connection leak in webhook handler</div>
                <div className="text-emerald-400 text-[11px]">Fix: Restarted pods & patched session</div>
                <div className="text-slate-500 text-[10px]">Recovery: 18 min</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-brand-400 font-bold">INC-0977 (79% Match)</div>
                <div className="text-slate-400 text-[11px]">Stale TCP socket starvation on failover</div>
                <div className="text-emerald-400 text-[11px]">Fix: Configured pool_recycle=300</div>
                <div className="text-slate-500 text-[10px]">Recovery: 10 min</div>
              </div>
            </div>

            <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 text-xs">
              <span className="font-bold text-brand-300">HindsightOps Reasoning: </span>
              <span className="text-slate-200">
                "This incident resembles INC-0812 and INC-0977. Based on historical institutional evidence, the most likely cause is connection pool exhaustion under surge. Follow Runbook DB-04 step 1 to scale pool size from 50 to 100."
              </span>
            </div>
          </div>
        )}

        {/* Step 6 & 7: Resolution & Learning Loop */}
        {(step === 6 || step === 7) && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>{step === 6 ? 'Step 6: Verified Mitigation Applied' : 'Step 7: Retaining New Learning in Hindsight'}</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {step === 6 ? 'Mitigation Applied in 12 Minutes' : 'Closing the Institutional Feedback Loop'}
            </h2>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>INC-1042 RESOLVED & VERIFIED IN PRODUCTION</span>
              </div>
              <p className="leading-relaxed">
                Engineer increased <code className="text-white bg-slate-900 px-1 py-0.5 rounded">DB_POOL_SIZE=100</code> in Helm values and bounced worker pods per Runbook DB-04. Active connection queue drained, P99 latency returned to 110ms.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" />
                <span>Hindsight Memory Bank Retain Call:</span>
              </div>
              <pre className="text-slate-400 text-[11px] leading-relaxed">
                client.retain(bank_id="hindsightops-incidents", content="INC-1042: Payment API connection pool exhaustion confirmed and resolved by scaling pool to 100...")
              </pre>
            </div>
          </div>
        )}

        {/* Step 8 & 9: Follow-up Incident & Cumulative Memory Recall */}
        {(step === 8 || step === 9) && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{step === 8 ? 'Step 8: A New Outage Occurs (INC-1099)' : 'Step 9: Demonstrating Cumulative Memory Learning'}</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {step === 8 ? 'Triggering Follow-Up Incident INC-1099' : 'Agent Recalls Both Prior History AND Newly Saved INC-1042!'}
            </h2>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div><span className="text-slate-500">New Incident:</span> <strong className="text-brand-400">INC-1099</strong></div>
              <div><span className="text-slate-500">Service:</span> Payment API</div>
              <div><span className="text-slate-500">Symptoms:</span> Connection acquisition latency spiked to 28,500ms under high concurrency</div>
            </div>

            <div className="bg-gradient-to-r from-brand-900/40 to-cyan-900/40 border border-brand-500/40 rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Recalled Institutional Context in INC-1099:</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">
                "This incident matches <strong className="text-cyan-300">INC-1042</strong> (resolved earlier) and historical <strong className="text-brand-300">INC-0812</strong>. In INC-1042, the team verified that connection pool limits saturated during promotional spikes. Apply Runbook DB-04 immediately."
              </p>
            </div>
          </div>
        )}

        {/* Step 10: Final Payoff Summary */}
        {step === 10 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Step 10: Hackathon Final Demonstration Payoff</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              The Agent Got Smarter as It Remembered More Incidents.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 space-y-2">
                <span className="text-red-400 font-mono font-bold uppercase text-[11px]">WITHOUT HINDSIGHT</span>
                <p className="text-slate-400 leading-relaxed">
                  "Check database connectivity and restart the service."
                </p>
                <div className="text-slate-500 font-mono text-[10px]">
                  • High blast radius • Zero institutional memory • Repeated investigation overhead
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2 shadow-lg shadow-emerald-500/5">
                <span className="text-emerald-400 font-mono font-bold uppercase text-[11px]">WITH HINDSIGHT MEMORY</span>
                <p className="text-slate-200 leading-relaxed">
                  "Recalled INC-0812, INC-0977, and newly resolved INC-1042. SREs applied Runbook DB-04 to scale pool ceiling. MTTR reduced from 45m to 12m."
                </p>
                <div className="text-cyan-400 font-mono text-[10px] font-bold">
                  ✓ Persistent memory ✓ Zero guesswork ✓ Verified runbooks ✓ Postmortems retained
                </div>
              </div>
            </div>

            <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-xl text-center">
              <p className="text-xs text-brand-300 font-mono font-semibold">
                "HindsightOps doesn't just answer incidents. It remembers them."
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 text-xs font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-3">
            {step < 10 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-hindsight-cyan hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-brand-500/25"
              >
                <span>{loading ? 'Processing...' : `Next: ${stepsMeta[step].title}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onSelectIncident('INC-1042');
                  onNavigate('incident-detail');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20"
              >
                <span>Explore Full Investigation Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
