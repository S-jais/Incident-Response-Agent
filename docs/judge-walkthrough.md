# Hackathon Judge Walkthrough Guide
### HackWithHyderabad 3.0: "AI Agents That Learn Using Hindsight"

Welcome, Judges! This guide provides a rapid reference for evaluating **HindsightOps** against the hackathon's core judging criteria.

---

## 🏆 Scoring Criteria Alignment

### 1. Innovation (30%)
- **What to look for:**
  - Goes beyond generic chatbots: It is an enterprise operational control plane for DevOps/SREs.
  - Replaces static wiki runbooks and stateless LLM wrappers with an active memory-guided investigation agent.
  - Implements a continuous learning loop where every resolved incident turns into future organizational intelligence.

### 2. Hindsight Memory (25%)
- **What to look for:**
  - **Memory Bank:** Uses Hindsight persistent memory bank `hindsightops-incidents`.
  - **SDK Integration:** Built with the official `hindsight-client` Python SDK.
  - **Retention & Recall:** Demonstrates actual semantic recall of historical incidents (`INC-0812`, `INC-0921`, `INC-0977`) and retention of new postmortems.
  - **Visible Memory Explorer:** Visit the **"Hindsight Memory"** tab to inspect retained facts, experiences, and test live queries.

### 3. Technical Implementation (20%)
- **What to look for:**
  - Full-stack architecture: React 19 + Vite frontend, Python 3.11 + FastAPI backend.
  - Clean modular agents (`IncidentAgent`, `LearningAgent`).
  - Automated test suite: Run `python -m pytest backend/test_suite.py -v` (100% passing).
  - Standalone seeding script: `backend/seed_memory.py`.
  - Production security: Zero hardcoded secrets, `.gitignore` protects credentials.

### 4. User Experience (15%)
- **What to look for:**
  - Dark-first, serious DevOps control plane with crisp typography and subtle micro-animations.
  - Split-pane Investigation Studio separating raw logs from AI reasoning.
  - Interactive **Memory Learning Demo** (`/demo`) with a 10-step guided walkthrough.
  - Visual Knowledge Graph illustrating the continuous feedback loop.

### 5. Real-World Impact (10%)
- **What to look for:**
  - Solves a multi-million-dollar industry pain point: Engineering teams repeatedly diagnosing identical production outages.
  - Reduces MTTR from 45 minutes of trial-and-error to 10–12 minutes of verified mitigation.

---

## 🗺️ Recommended 3-Minute Walkthrough Flow

1. **Dashboard:** Observe the executive MTTR metrics and the interactive *Hindsight Institutional Memory Loop* graph.
2. **Launch the Demo:** Click the **"Memory Learning Demo"** tab in the navigation bar to experience the 10-step guided walkthrough.
3. **Inspect Target INC-1042:**
   - Click into `INC-1042` (Payment API).
   - Click **"Investigate with Hindsight"** to see live retrieval of historical incidents `INC-0812` and Runbook `DB-04`.
   - Click **"Resolve Incident"** to capture the resolution and click **"Save Learning to Hindsight"**.
4. **Trigger Follow-Up Incident:**
   - In Demo mode (Step 8), trigger `INC-1099` to verify that the agent now recalls BOTH older history and the newly saved `INC-1042` resolution.
5. **Memory Explorer:** Go to the **"Hindsight Memory"** tab to test queries against the memory bank.
6. **Before vs After:** Go to **"Before vs After"** to view the structured comparison matrix.
