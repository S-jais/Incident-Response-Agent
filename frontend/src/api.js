const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchIncidents(params = {}) {
  const query = new URLSearchParams();
  if (params.service) query.append('service', params.service);
  if (params.severity) query.append('severity', params.severity);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncident(incidentId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}`);
  return res.json();
}

export async function createIncident(data) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create incident');
  }
  return res.json();
}

export async function analyzeIncident(incidentId, stateless = false) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/analyze?stateless=${stateless}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run incident analysis');
  return res.json();
}

export async function resolveIncident(incidentId, payload) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to resolve incident');
  return res.json();
}

export async function generatePostmortem(incidentId, payload = null) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/postmortem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : null
  });
  if (!res.ok) throw new Error('Failed to generate postmortem');
  return res.json();
}

export async function savePostmortemLearning(incidentId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/learn`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to retain learning in Hindsight');
  return res.json();
}

export async function fetchSimilarIncidents(incidentId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/similar`);
  if (!res.ok) throw new Error('Failed to fetch similar incidents');
  return res.json();
}

export async function fetchMemoryStats() {
  const res = await fetch(`${API_BASE}/memory/stats`);
  if (!res.ok) throw new Error('Failed to fetch memory stats');
  return res.json();
}

export async function fetchRecentMemories() {
  const res = await fetch(`${API_BASE}/memory/recent`);
  if (!res.ok) throw new Error('Failed to fetch recent memories');
  return res.json();
}

export async function searchMemories(query, service = null) {
  const res = await fetch(`${API_BASE}/memory/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, service, top_k: 5 })
  });
  if (!res.ok) throw new Error('Failed to search memory');
  return res.json();
}

export async function fetchMemoryGraph() {
  const res = await fetch(`${API_BASE}/memory/graph`);
  if (!res.ok) throw new Error('Failed to fetch memory graph');
  return res.json();
}

export async function fetchRunbooks() {
  const res = await fetch(`${API_BASE}/runbooks`);
  if (!res.ok) throw new Error('Failed to fetch runbooks');
  return res.json();
}

export async function fetchRunbook(runbookId) {
  const res = await fetch(`${API_BASE}/runbooks/${runbookId}`);
  if (!res.ok) throw new Error(`Failed to fetch runbook ${runbookId}`);
  return res.json();
}

export async function fetchDemoScenario() {
  const res = await fetch(`${API_BASE}/demo/scenario`);
  if (!res.ok) throw new Error('Failed to fetch demo scenario');
  return res.json();
}

export async function fetchDemoComparison() {
  const res = await fetch(`${API_BASE}/demo/compare`);
  if (!res.ok) throw new Error('Failed to fetch demo comparison');
  return res.json();
}

export async function resetDemo() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo state');
  return res.json();
}

export async function triggerFollowupIncident() {
  const res = await fetch(`${API_BASE}/demo/trigger-followup`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger followup incident');
  return res.json();
}
