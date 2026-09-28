import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BrainCircuit, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Settings as SettingsIcon, 
  PlusCircle, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  GitCompare
} from 'lucide-react';
import { fetchHealth, resetDemo } from '../api';

export default function Navbar({ activeTab, setActiveTab, onDemoReset }) {
  const [health, setHealth] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'OFFLINE', is_demo_mode: true }));
  }, []);

  const handleReset = async () => {
    if (confirm('Reset demo state? This will reseed historical incidents and prepare INC-1042 for investigation.')) {
      setResetting(true);
      try {
        await resetDemo();
        if (onDemoReset) onDemoReset();
      } catch (err) {
        alert('Reset error: ' + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: Layers },
    { id: 'new-incident', label: 'New Incident', icon: PlusCircle },
    { id: 'demo', label: 'Memory Learning Demo', icon: Sparkles, badge: 'Judges' },
    { id: 'compare', label: 'Before vs After', icon: GitCompare },
    { id: 'memory', label: 'Hindsight Memory', icon: BrainCircuit },
    { id: 'runbooks', label: 'Runbooks', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-hindsight-cyan flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  Hindsight<span className="text-brand-400">Ops</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  HackWithHyd 3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                An AI incident responder that remembers what happened before
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold tracking-wider uppercase animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Actions */}
          <div className="flex items-center gap-3">
            {/* Live Hindsight Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border bg-slate-950/80 border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  health?.hindsight?.includes('Connected (Live)') ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  health?.hindsight?.includes('Connected (Live)') ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}></span>
              </span>
              <span className="text-slate-300 text-[11px]">
                {health?.hindsight?.includes('Connected (Live)') ? (
                  <span className="text-emerald-400">Hindsight Cloud (Live)</span>
                ) : (
                  <span className="text-cyan-400">Hindsight Demo Mode</span>
                )}
              </span>
            </div>

            {/* Quick Reset Demo State */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset database and seed historical incidents for demo"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{resetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded text-xs ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
