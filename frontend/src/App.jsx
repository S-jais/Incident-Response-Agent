import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IncidentsList from './pages/IncidentsList';
import IncidentDetail from './pages/IncidentDetail';
import NewIncident from './pages/NewIncident';
import MemoryExplorer from './pages/MemoryExplorer';
import MemoryLearningDemo from './pages/MemoryLearningDemo';
import BeforeAfterComparison from './pages/BeforeAfterComparison';
import RunbooksList from './pages/RunbooksList';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-1042');

  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
    setActiveTab('incident-detail');
  };

  const handleIncidentCreated = (id) => {
    setSelectedIncidentId(id);
    setActiveTab('incident-detail');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onDemoReset={() => {
          setSelectedIncidentId('INC-1042');
          setActiveTab('dashboard');
        }} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigate={setActiveTab} 
            onSelectIncident={handleSelectIncident} 
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsList 
            onSelectIncident={handleSelectIncident} 
            onNavigate={setActiveTab} 
          />
        )}

        {activeTab === 'incident-detail' && (
          <IncidentDetail 
            incidentId={selectedIncidentId} 
            onBack={() => setActiveTab('incidents')} 
            onSelectIncident={handleSelectIncident} 
          />
        )}

        {activeTab === 'new-incident' && (
          <NewIncident 
            onIncidentCreated={handleIncidentCreated} 
          />
        )}

        {activeTab === 'demo' && (
          <MemoryLearningDemo 
            onSelectIncident={handleSelectIncident} 
            onNavigate={setActiveTab} 
          />
        )}

        {activeTab === 'compare' && (
          <BeforeAfterComparison 
            onNavigate={setActiveTab} 
            onSelectIncident={handleSelectIncident} 
          />
        )}

        {activeTab === 'memory' && (
          <MemoryExplorer 
            onSelectIncident={handleSelectIncident} 
            onNavigate={setActiveTab} 
          />
        )}

        {activeTab === 'runbooks' && (
          <RunbooksList />
        )}

        {activeTab === 'settings' && (
          <Settings />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HindsightOps • AI Incident Responder That Remembers</span>
          <span>Theme: "AI Agents That Learn Using Hindsight"</span>
          <span className="text-slate-400">Persistent Institutional Memory for SREs</span>
        </div>
      </footer>
    </div>
  );
}
