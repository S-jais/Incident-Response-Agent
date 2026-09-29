# HindsightOps Demo Guide

This guide walks through the primary demo scenario created for **HindsightOps: AI Agents That Learn Using Hindsight**.

---

## 🎯 Demo Scenario Overview

- **Company:** NovaCloud (E-Commerce Infrastructure)
- **Service:** `Payment API`
- **Incident ID:** `INC-1042`
- **Error:** `maximum database connections reached; QueuePool limit of size 50 overflow 10 reached`
- **Core Mission:** Demonstrate that HindsightOps remembers previous outages, avoids dangerous generic AI suggestions, and gets smarter as new resolutions are saved.

---

## ⏱️ The 60-Second Hackathon Judge Demo Flow

Navigate to the **"Memory Learning Demo"** tab in the navigation bar (or visit `/demo`).

### Step 1: Incident Ingress (0:00 - 0:15)
- **What to show:** `INC-1042` appears in the incident queue.
- **Narrative:** *"Payment authorization requests are failing across all checkout lanes during a flash sale. Database connections hit maximum ceiling."*

### Step 2 & 3: Stateless AI Baseline (0:15 - 0:30)
- **What to show:** Run the incident in Stateless Mode.
- **AI Output:** *"Check database connectivity and restart the database service."*
- **Judge Callout:** *"Stateless AI provides textbook advice. Restarting a database cluster during a surge causes cascading outages and master failover chaos!"*

### Step 4 & 5: Enabling Hindsight Memory (0:30 - 0:45)
- **What to show:** Click **"Activate Hindsight Memory"**.
- **What Hindsight Recalls:**
  1. `INC-0812` (94% Match): Connection pool exhaustion resolved by increasing pool size from 50 to 100.
  2. `INC-0921` (82% Match): Connection leak in webhook handler.
  3. `INC-0977` (79% Match): Stale TCP socket timeout.
- **AI Recommendation:**
  *"Do NOT restart the database. Apply Runbook DB-04: Scale `DB_POOL_SIZE` from 50 to 100 and perform a rolling restart of payment pods. Target MTTR: 12 minutes."*

### Step 6 & 7: Resolution & Learning (0:45 - 1:00)
- **What to show:** Apply the fix and click **"Mark Resolved & Retain in Hindsight"**.
- **Judge Callout:** *"The resolution and postmortem are now permanently retained into the Hindsight memory bank as institutional knowledge."*

### Step 8 & 9: Follow-Up Outage `INC-1099` (1:00 - 1:15)
- **What to show:** A new promotion triggers elevated connection latency (`INC-1099`).
- **What Hindsight Recalls:**
  The agent now cites **BOTH** historical incident `INC-0812` **AND** the newly saved resolution from `INC-1042`!

### Step 10: The Hindsight Payoff (1:15 - 1:30)
- **Conclusion:**
  *"HindsightOps doesn't just answer incidents. It remembers them."*

---

## 🕹️ Interactive Features to Showcase

1. **Before vs After Split View:** Compare generic guesswork against memory-grounded recommendations side-by-side.
2. **Hindsight Memory Explorer:** Use the interactive query tester to search any technology (e.g. `Redis maxmemory eviction` or `Kafka consumer lag`).
3. **One-Click Runbook Viewer:** Click `DB-04` or `REDIS-02` to inspect diagnostic commands with 1-click clipboard copying.
4. **Postmortem Generator:** Show the structured blameless postmortem generator with direct Hindsight retention.
