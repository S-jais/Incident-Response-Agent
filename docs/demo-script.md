# HindsightOps: 60–90 Second Demo Script
### HackWithHyderabad 3.0 Presentation

---

## ⏱️ Video / Live Presentation Timeline

### 0:00 - 0:10 | The Problem
> *"Production incidents repeat, but engineering teams lose the knowledge from previous outages. When production breaks at 2 AM, engineers are forced to re-solve problems from scratch or rely on generic AI that suggests dangerous guesses like 'restart the master database'."*

### 0:10 - 0:25 | Incident Ingress
*(Show browser with HindsightOps Dashboard, click onto INC-1042 in Payment API)*
> *"Let's investigate a new critical incident: INC-1042 in Payment API. Over 2,300 checkout attempts are failing during our flash sale. The log shows: 'maximum database connections reached; QueuePool limit of 50 reached'."*

### 0:25 - 0:40 | Hindsight Memory Recall
*(Click 'Investigate with Hindsight', show the live activity log searching Hindsight)*
> *"Instead of guessing, HindsightOps queries our Hindsight persistent memory bank. Within 800 milliseconds, it recalls three relevant historical incidents: INC-0812, INC-0921, and INC-0977."*

### 0:40 - 0:55 | Verifiable Historical Evidence & Runbook DB-04
*(Hover over the similar incidents card and matched Runbook DB-04)*
> *"Look at the historical evidence: In INC-0812, our team resolved this exact symptom under surge load by increasing the pool size from 50 to 100 in Helm values and bouncing pods. Recovery took 12 minutes. The agent directly matches Runbook DB-04."*

### 0:55 - 1:10 | Resolution & Retaining Learning
*(Click 'Mark Resolved', show the postmortem generator and click 'Save Learning to Hindsight')*
> *"Our SRE executes the verified mitigation. Service recovers in 12 minutes. We mark the incident resolved and click 'Save Learning to Hindsight'. The postmortem is permanently retained into Hindsight long-term institutional memory."*

### 1:10 - 1:25 | The Learning Payoff: Follow-up Incident INC-1099
*(Trigger the follow-up incident INC-1099 or click Step 8 in Demo mode)*
> *"Now watch what happens when a subsequent incident occurs: INC-1099. The agent now recalls BOTH the original historical outages AND the newly resolved INC-1042 resolution. The agent gets measurably smarter over time."*

### 1:25 - 1:30 | Closing
*(Show Knowledge Graph / Dashboard)*
> *"HindsightOps doesn't just answer incidents. It remembers them. Thank you."*
