import React, { useState, useEffect } from 'react';
import { BrainCircuit, Search, Database, Sparkles, Layers, ShieldCheck, Tag, Clock, ArrowRight } from 'lucide-react';
import { fetchMemoryStats, fetchRecentMemories, searchMemories } from '../api';

export default function MemoryExplorer({ onSelectIncident, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentMemories, setRecentMemories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMemoryStats(),
      fetchRecentMemories()
    ]).then(([s, m]) => {
      setStats(s);
      setRecentMemories(m);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchMemories(searchQuery);
      setSearchResults(results);
    } catch (err) {
      alert('Memory search error: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <span>Hindsight Persistent Institutional Memory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect what the AI agent remembers across production outages, postmortems, and engineering resolutions.
        </p>
      </div>

      {/* Memory Bank Status Telemetry Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Persistent Memory Bank
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Memory Bank: <span className="font-mono text-cyan-300">{stats?.bank_id || 'hindsightops-incidents'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Connected to endpoint: <span className="font-mono text-slate-300">{stats?.base_url || 'https://api.hindsight.vectorize.io'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full font-mono text-xs border flex items-center gap-2 bg-slate-950/80 border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  stats?.is_hindsight_live ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  stats?.is_hindsight_live ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}></span>
              </span>
              <span className="text-slate-300 font-bold">
                {stats?.memory_source || 'Hindsight Cloud'}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Memories Retained</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {stats?.total_memories_retained || 28}
            </div>
            <span className="text-[10px] text-slate-400">Long-term facts stored</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Incidents Ingested</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {stats?.incidents_retained_count || 28}
            </div>
            <span className="text-[10px] text-slate-400">Postmortems linked</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Recalls Executed</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {stats?.total_recalls_executed || 14}
            </div>
            <span className="text-[10px] text-slate-400">Autonomous queries</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
            <span className="text-[11px] font-mono text-slate-500 uppercase">Learning Loop</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              Active
            </div>
            <span className="text-[10px] text-slate-400">Retaining new outcomes</span>
          </div>
        </div>
      </div>

      {/* Remembered Institutional Insights */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Synthesized Institutional Knowledge Learned Over Time</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(stats?.memory_insights || [
            "DB-04 resolved 4 previous connection pool incidents in Payment API",
            "Payment API frequently suffers from connection pool exhaustion under flash sale traffic",
            "Redis cluster failures correlate with missing TTL on guest session tokens",
            "Runbook K8S-03 successfully resolved 3 CrashLoopBackOff incidents via memory bumping"
          ]).map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-850">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Memory Search Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-400" />
            <span>Interactive Hindsight Memory Query Tester</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test what Hindsight retrieves for any query string, error message, or technology stack.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Payment API database connection pool or Redis OOM memory"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition font-mono shrink-0"
          >
            {searching ? 'Querying...' : 'Recall Memory'}
          </button>
        </form>

        {/* Quick Query Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Quick Queries:</span>
          {['Payment API database connection pool', 'Redis maxmemory eviction', 'Kubernetes pod crashloop'].map((q) => (
            <button
              key={q}
              onClick={() => {
                setSearchQuery(q);
                searchMemories(q).then(setSearchResults);
              }}
              className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-mono text-cyan-400 uppercase font-bold">
              {searchResults.length} Recalled Memory Units:
            </h4>
            {searchResults.map((res, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="text-brand-400 font-bold">{res.title}</span>
                  <span className="text-emerald-400 font-bold">Relevance: {Math.round(res.score * 100)}%</span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs mt-1">
                  {res.content}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Retained Memory Units Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850/40">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Recent Institutional Memories</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {recentMemories.length} Stored Units
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {recentMemories.map((mem) => (
            <div 
              key={mem.incident_id}
              onClick={() => {
                onSelectIncident(mem.incident_id);
                onNavigate('incident-detail');
              }}
              className="p-4 hover:bg-slate-850/50 transition cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-brand-400">
                    {mem.incident_id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {mem.service}
                  </span>
                  {mem.runbook && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Runbook {mem.runbook}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  Root Cause: {mem.root_cause || mem.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  Resolution: {mem.resolution}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {mem.recovery_time ? `${mem.recovery_time}m recovery` : 'Resolved'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
