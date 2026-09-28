import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Server, BrainCircuit, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchHealth } from '../api';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = () => {
    setLoading(true);
    fetchHealth()
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-brand-400" />
            <span>System Settings & Architecture Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify Hindsight Cloud connectivity, Groq LLM configurations, and local environment security.
          </p>
        </div>

        <button
          onClick={loadHealth}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition border border-slate-700"
          title="Refresh Diagnostics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Diagnostics Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-400" />
          <span>Active Service Diagnostics (Zero Secrets Leaked)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Hindsight Status */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase">Hindsight Memory</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                health?.hindsight?.includes('Connected (Live)') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              }`}>
                {health?.hindsight || 'Loading...'}
              </span>
            </div>
            <div className="text-slate-300 text-[11px]">
              Bank ID: <span className="text-cyan-400">{health?.hindsight_bank_id}</span>
            </div>
            <div className="text-slate-400 text-[10px] truncate">
              Endpoint: {health?.hindsight_base_url}
            </div>
          </div>

          {/* LLM Status */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase">LLM Provider (Groq)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                health?.llm?.includes('Connected (Live)') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              }`}>
                {health?.llm || 'Loading...'}
              </span>
            </div>
            <div className="text-slate-300 text-[11px]">
              Model: <span className="text-brand-300">{health?.llm_model}</span>
            </div>
            <div className="text-slate-400 text-[10px]">
              Recommended: openai/gpt-oss-120b, qwen/qwen3-32b
            </div>
          </div>

          {/* Database */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase">Local Database</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {health?.database || 'Connected'}
              </span>
            </div>
            <div className="text-slate-300 text-[11px]">
              Engine: SQLite (PostgreSQL Ready via SQLAlchemy)
            </div>
          </div>

          {/* Environment Mode */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase">Operating Mode</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/30">
                {health?.is_demo_mode ? 'Demo Mode (Local Vector Fallback)' : 'Live Production Mode'}
              </span>
            </div>
            <div className="text-slate-300 text-[11px]">
              Failsafe: Offline synthetic store active when API keys empty
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>Configuring Live Hindsight Cloud & Groq Credentials</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            To switch from Demo Mode to Live Hindsight Cloud:
          </p>

          <ol className="list-decimal list-inside space-y-2 font-mono text-[11px] text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <li>Register at <a href="https://ui.hindsight.vectorize.io" target="_blank" rel="noreferrer" className="text-cyan-400 underline">ui.hindsight.vectorize.io</a>.</li>
            <li>Apply promo code <strong className="text-brand-300">MEMHACK99</strong> for $50 hackathon credits in billing.</li>
            <li>Generate an API key and copy it into your local <strong className="text-white">.env</strong> file under <code className="text-brand-400">HINDSIGHT_API_KEY</code>.</li>
            <li>Add your Groq API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-cyan-400 underline">console.groq.com</a> under <code className="text-brand-400">GROQ_API_KEY</code>.</li>
            <li>Restart the backend server. The health pill will immediately update to <strong className="text-emerald-400">Hindsight Cloud (Live)</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
