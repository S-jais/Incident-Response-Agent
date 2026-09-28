import React, { useState, useEffect } from 'react';
import { Search, Filter, Layers, ArrowRight, BrainCircuit, RefreshCw, Plus } from 'lucide-react';
import { fetchIncidents } from '../api';
import SeverityBadge from '../components/SeverityBadge';

export default function IncidentsList({ onSelectIncident, onNavigate }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadIncidents = () => {
    setLoading(true);
    fetchIncidents({
      search: search || undefined,
      service: serviceFilter || undefined,
      severity: severityFilter || undefined,
      status: statusFilter || undefined
    })
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(loadIncidents, 200);
    return () => clearTimeout(timer);
  }, [search, serviceFilter, severityFilter, statusFilter]);

  const services = [
    'Payment API', 'Auth Gateway', 'Order Engine', 'User Cache', 
    'Inventory DB', 'Notification Service', 'API Gateway', 'Checkout Frontend'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            <span>Incident Management & Historical Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse active production investigations and historical incidents retained in Hindsight memory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-incident')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Incident</span>
          </button>
          <button
            onClick={loadIncidents}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, error message, service, or root cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Service Filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Services</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="IDENTIFIED">Identified</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850/80 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Title & Error Summary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Runbook</th>
                <th className="py-3.5 px-4">Memory</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-mono">
                    Loading incidents from database...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-mono">
                    No incidents matching current criteria.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr 
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc.id);
                      onNavigate('incident-detail');
                    }}
                    className="hover:bg-slate-850/50 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400 group-hover:text-brand-300">
                      {inc.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {inc.service}
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="font-semibold text-slate-200 truncate">{inc.title}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">{inc.error_message}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium ${
                        inc.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {inc.runbook_id || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {inc.retained_in_hindsight ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <BrainCircuit className="w-3 h-3" />
                          Retained
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1">
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
