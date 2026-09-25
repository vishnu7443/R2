# 🛡️ Vector 3.0 — The Responsible Autonomous SRE Control Plane
## Enterprise Architecture, Scientific Causality, Adversarial Safety & Technical Specification

---

## 📌 Executive Overview: The Vector 3.0 Mission

> **"Vector is a responsible autonomous SRE control plane that doesn't merely detect incidents or execute AI-generated fixes—it investigates causality, challenges its own decisions, simulates counterfactual outcomes, validates safety and policy constraints, executes bounded remediation, verifies real-world recovery, and learns from every intervention to prevent future failures."**

Traditional monitoring tools (Datadog, Prometheus) answer:
> *"What metric crossed a threshold?"* (e.g. CPU = 94%)

First-generation AIOps tools jump straight to unverified execution:
> *"Let an LLM generate a `kubectl` command and apply it to production."*

**Vector 3.0** replaces speculative AI with **scientific, explainable, and defensive infrastructure intelligence**:
* **Causal Reasoning**: Replaces shallow metric correlations with Directed Acyclic Graphs (DAGs) tracking the exact propagation of failure.
* **Counterfactual Analysis**: Mathematically models *"What would have happened if we had NOT acted?"* to quantify downtime and financial loss avoided.
* **Adversarial Safety**: Actively attempts to *disprove* the proposed action before execution (e.g. downstream DB connection pool exhaustion or node memory depletion).
* **Calibrated Digital Twin**: Continuously compares predicted vs. actual outcomes to recalibrate simulation physics over time.
* **Predictive Incident Prevention**: Detects subtle sub-alarm metric drift (e.g. heap leaks, thread starvation) and forecasts Time-To-Failure (TTF) 15–30 minutes before incident alarms fire.
* **Incident Knowledge Graph**: Organizes enterprise incidents into a queryable memory graph that matches current anomalies to proven historical precedents.

---

## 🏛️ The Vector 3.0 Product Philosophy

1. **Deterministic Boundaries Over Generative Hallucination**: AI proposes and challenges; deterministic safety contracts and policy gates authorize.
2. **Explicit Causality Over Guesswork**: Every diagnosis must answer *"Why do you believe this is the root cause?"* with chronological evidence and falsification criteria.
3. **Continuous Model Calibration**: A simulation model that doesn't learn from its own prediction errors is untrustworthy. Vector tracks prediction errors and recalibrates coefficients dynamically.
4. **Adversarial Pessimism**: The system assumes proposed remediations can cause secondary failures until proven otherwise by adversarial probes.

---

## 🔄 The 15-Stage Scientific Control Loop

```text
                  VECTOR 3.0 AUTONOMOUS SRE CONTROL PLANE
                                     │
                                     ▼
                                  OBSERVE
                       (Telemetry & Trace Streaming)
                                     │
                                     ▼
                                  PREDICT
                     (Sub-Alarm Drift & TTF Forecast)
                                     │
                                     ▼
                                  DETECT
                      (Threshold Hysteresis Breach)
                                     │
                                     ▼
                                 DIAGNOSE
                       (5-Signal RCA & Causal DAG)
                                     │
                                     ▼
                                HYPOTHESIZE
                      (Ranked Alternative Hypotheses)
                                     │
                                     ▼
                                EXPERIMENT
                   (Chaos Invalidation & Falsification)
                                     │
                                     ▼
                                   PLAN
                     (Cause-Aware Action Candidates)
                                     │
                                     ▼
                              COUNTERFACTUAL
                 (Simulate "With" vs "Without" Remediation)
                                     │
                                     ▼
                                 SIMULATE
                     (Digital Twin State Projections)
                                     │
                                     ▼
                            ADVERSARIAL SAFETY
                 (Actively Attempt to Disprove the Action)
                                     │
                                     ▼
                                POLICY GATE
                    (Policy-as-Code & Multi-Agent SRE)
                                     │
                                     ▼
                                  ASSURE
                      (8-Dimensional Decision Vector)
                                     │
                                     ▼
                                    ACT
                 (Bounded Deterministic K8s Execution)
                                     │
                                     ▼
                                  VERIFY
                   (Closed-Loop Recovery & SLO Check)
                                     │
                                     ▼
                            PREDICT vs. ACTUAL
                 (Prediction Error & Twin Recalibration)
                                     │
                                     ▼
                                   LEARN
                   (Incident Knowledge Graph Ingestion)
                                     │
                                     ▼
                           PREVENT NEXT INCIDENT
                     (Proactive Maintenance Scheduling)
```

---

## 🚀 The 18 Architectural Upgrades of Vector 3.0

### 1. 🧠 Causal Inference Graph (`causal_engine.py`)
Replaces flat correlation scores with Directed Acyclic Causal Inference Graphs:
```text
Traffic Surge
      ↓
Request Rate ↑
      ↓
Thread Pool Saturation (Root Cause Locus)
      ↓
Request Queue Backpressure
      ↓
p95 Latency ↑
      ↓
HTTP 504 Gateway Timeouts
```
* **Why do you believe this is the root cause?**: Vector outputs an explainable narrative detailing temporal precedence (e.g. thread acquisition latency spiked 120s before upstream HTTP 504 timeouts).
* **Falsification Signals**: Defines explicit criteria that would disprove the diagnosis.

### 2. 🔬 Counterfactual Incident Engine (`counterfactual_engine.py`)
Simulates two branching futures:
1. **Without Remediation ("Do Nothing")**: Projects runaway degradation (CPU $\to$ 100%, latency $\to$ 4,200ms, OOM kills, cascading downstream blast radius).
2. **With Remediation**: Projects stabilized post-action metrics.
* **Quantified Impact Avoided**: Calculates minutes of unplanned downtime avoided and enterprise financial loss prevented ($/min downtime model).

### 3. 🧪 Automatic Chaos Experimentation
Proposes structured mini-experiments to isolate ambiguous root causes before committing heavy changes:
* Hypothesis: *Thread pool saturation is causing latency.*
* Proposes: E1 (Test with traffic throttle), E2 (Inspect downstream DB connection latency), E3 (Drain worker thread queue).

### 4. 🧬 Digital Twin Calibration (`digital_twin_calibration.py`)
Tracks **Prediction vs. Reality** for every executed action:
$$\text{Error}_{\text{CPU}} = \frac{|\text{Predicted}_{\text{CPU}} - \text{Actual}_{\text{CPU}}|}{\text{Actual}_{\text{CPU}}} \times 100$$
* Dynamically updates simulation scaling coefficients (`cpu_scale_efficiency`, `latency_reduction_factor`) via exponential moving adjustment ($\eta = 0.15$).

### 5. 🛡️ Policy-as-Code Governance
Organizational policy engine enforcing declarative YAML guardrails:
* Max replica caps per tier, forbidden actions on database master nodes, mandatory two-person approval for high-risk changes, and downtime ceilings.

### 6. 👥 Multi-Agent SRE Council
Specialized modular agents with clear responsibilities:
* **Investigator Agent**: Gathers telemetry and isolates probable causes.
* **Planner Agent**: Generates candidate remediations.
* **Safety Agent**: Challenges and attempts to invalidate plans.
* **Cost Agent**: Computes financial and cloud infrastructure cost impact.
* **Reliability Agent**: Evaluates SLO/SLA error budgets.
* **Executor**: Non-reasoning deterministic execution worker.

### 7. 🔴 Adversarial Safety Agent (`adversarial_safety.py`)
Before execution, asks: *"Why will this remediation fail?"*
* **DB Connection Pool Saturation Probe**: Checks if adding replicas exceeds PostgreSQL connection pool limits.
* **Node Headroom Probe**: Verifies cluster nodes have sufficient memory and CPU capacity.
* **Flapping Oscillation Probe**: Enforces stabilization cooldowns between rapid actions.
* **Downstream Cascade Probe**: Prevents driving traffic into already degraded downstream dependencies.

### 8. 💰 FinOps-Aware Remediation
Treats financial cost as a first-class decision variable in Multi-Criteria Decision Analysis (MCDA). Presents trade-off surfaces comparing cost delta against latency reduction.

### 9. 🌍 Multi-Cluster / Multi-Region Blast Radius
Expands topology models from single namespace containers to Multi-Cluster and Multi-Region hierarchies:
$$\text{Service} \longrightarrow \text{Namespace} \longrightarrow \text{Cluster} \longrightarrow \text{Region} \longrightarrow \text{Global}$$

### 10. 🧑💻 Change Risk Prediction
Pre-deployment analysis evaluating code commits, schema migrations, and config changes against historical incident patterns to score deployment risk before rollout.

### 11. 🔄 Automated Recovery Strategy Selection
Selects optimal remediation paths from a Recovery Strategy Graph:
$$\text{Scale Replicas} \quad \text{vs.} \quad \text{Rollback Commit} \quad \text{vs.} \quad \text{Shift Traffic} \quad \text{vs.} \quad \text{Restart Workload}$$

### 12. 🧠 Incident Knowledge Graph (`knowledge_graph.py`)
Graph memory connecting:
$$\text{Incident} \longrightarrow \text{Root Cause} \longrightarrow \text{Service Topology} \longrightarrow \text{Trigger} \longrightarrow \text{Remediation} \longrightarrow \text{Effectiveness}$$
Performs multi-factor similarity queries to recommend proven remediations from organizational history.

### 13. 📊 SLO Error Budget Intelligence
Tracks real-time error budget burn rates. Automatically escalates actions requiring human approval if remaining budget is below critical thresholds.

### 14. 🔐 Supply-Chain Security Gate
Verifies image signatures, provenance, SBOMs, and enforces the strict prohibition of unpinned container tags (`:latest`).

### 15. 📜 Immutable Audit Ledger
Constructs an immutable end-to-end audit dossier recording telemetry evidence, root cause diagnosis, safety contracts, simulation projections, approvals, and post-action verification.

### 16. 🚨 Predictive Incident Prevention (`prevention_engine.py`)
Monitors subtle sub-alarm metric drift (e.g. heap climbing $+4.8\text{ MB/min}$, thread creep $+1.8\text{ threads/min}$). Calculates Time-to-Failure (TTF) and recommends non-disruptive early interventions during safe maintenance windows.

### 17. 🧮 8-Dimensional Decision Vector Profile (`causal_engine.py`)
Replaces the single opaque trust score with an explainable multi-dimensional decision vector:
$$\mathbf{D} = \big[ \text{RCA Conf}, \text{Sim Conf}, \text{Safety Comp}, \text{Policy Comp}, \text{Blast Radius}, \text{Cost Delta}, \text{Rollback Ready}, \text{History Sim} \big]$$

### 18. 🖥️ Unified "Mission Control" Incident Journey
Unifies Dashboard, RCA Cockpit, Digital Twin, Decision Center, Timeline, and Verification into a single cohesive end-to-end incident investigation experience.

---

## ⭐ Deep Dive: The 5 Prioritized Implementations

### 1. Counterfactual Incident Engine (`backend/services/counterfactual_engine.py`)
* **Core Function**: `simulate_counterfactual_trajectory(...)`
* **Formulation**:
  $$\text{Impact}_{\text{Downtime Avoided}} = \text{Downtime}_{\text{Unaddressed}} - \text{Downtime}_{\text{Remediated}}$$
  $$\text{Financial Loss Prevented} = \text{Downtime Avoided (mins)} \times \$250/\text{min}$$
* **Branching Outputs**:
  * `counterfactual_without_remediation`: Projects 100% CPU, 4,200ms latency, 18.5 minutes of downtime, and cascading downstream failure across dependent services.
  * `projected_with_remediation`: Projects 54.1% CPU, 310ms latency, zero downtime, and contained local blast radius.
  * `quantified_impact_avoided`: Quantified delta across CPU saturation, latency, 5xx errors, downtime, and financial loss ($4,625 USD).

### 2. Adversarial Safety Agent (`backend/services/adversarial_safety.py`)
* **Core Class**: `AdversarialSafetyAgent`
* **Evaluation Probes**:
  1. **PostgreSQL Connection Pool Saturation**:
     $$\text{Projected Conns} = \text{Conns}_{\text{active}} + (\Delta \text{Replicas} \times \text{Conns}_{\text{pod}})$$
     If $\text{Projected Conns} > \text{Pool Ceiling}$, issues `REJECTED` with specific mitigation (e.g. cap replicas or enable PgBouncer).
  2. **Node Memory Headroom Depletion**:
     Checks if $\Delta \text{Replicas} \times \text{Memory}_{\text{pod}} > \text{Headroom}_{\text{node}}$.
  3. **Flapping Oscillation Risk**:
     Enforces a 180-second stabilization cooldown between automated actions.
  4. **Downstream Cascade Risk**:
     Prohibits scaling upstream services when downstream dependencies are currently degraded ($>80\%$ CPU).
* **Verdicts**: `PASSED` (eligible for execution), `CHALLENGED_CONDITIONAL` (requires SRE override), or `REJECTED` (hard invariant violation).

### 3. Digital Twin Calibration (`backend/services/digital_twin_calibration.py`)
* **Core Class**: `DigitalTwinCalibrationService`
* **Continuous Tuning Formulation**:
  $$k_{\text{cpu}}^{(t+1)} = k_{\text{cpu}}^{(t)} \times \left(1 - \eta \left(\frac{\text{Actual}_{\text{cpu}}}{\text{Predicted}_{\text{cpu}}} - 1\right)\right)$$
  $$\text{Accuracy Score} = 100 - \frac{\text{Error}_{\text{cpu}} + \text{Error}_{\text{latency}}}{2}$$
* **Historical Memory**: Persists calibration events, audits parameter drift, and provides an executive twin accuracy score ($95.75\%$).

### 4. Predictive Incident Prevention Engine (`backend/services/prevention_engine.py`)
* **Core Class**: `PredictivePreventionEngine`
* **Time-To-Failure (TTF) Projection**:
  $$\text{Drift Rate } (m) = \frac{Y_t - Y_0}{\Delta t}$$
  $$\text{TTF} = \frac{\text{Ceiling} - Y_t}{m}$$
* **Preventive Recommendations**:
  * Detects memory leak drift ($+16.6\text{ MB/min}$) forecasting OOMKill in 16.5 minutes.
  * Issues `URGENT_PREVENTION` with a scheduled, non-disruptive rolling restart during a safe off-peak window, preventing customer-facing incidents.

### 5. Incident Knowledge Graph (`backend/services/knowledge_graph.py`)
* **Core Class**: `IncidentKnowledgeGraph`
* **Multi-Factor Similarity Metric**:
  $$S = 0.35 \times S_{\text{topology}} + 0.35 \times S_{\text{category}} + 0.30 \times S_{\text{metric\_vector}}$$
* **Evidence-Weighted Recommendation**:
  Aggregates precedent success rates and historical MTTR to transfer verified remediation strategies to active incidents.

---

## 🗂️ Complete Vector 3.0 Codebase & Architecture File Map

```text
vector_enhance/
├── backend/
│   ├── api/
│   │   ├── vector3_router.py        # Vector 3.0 Control Plane API (Counterfactual, Adversarial, Calibration, Prevention, Knowledge Graph, Causal)
│   │   ├── rca_router.py            # Root Cause Analysis cockpit & 5-signal scoring API
│   │   ├── verification_router.py   # Closed-loop post-remediation verification & effectiveness
│   │   ├── governance_router.py     # Kill switch, autonomy levels (L0-L5) & SRE scorecard API
│   │   ├── dashboard_router.py      # Mission Control metrics & active alerts
│   │   ├── decision_router.py       # 5D MCDA evaluations & manual approval dispatch
│   │   ├── execution_router.py      # Safe execution & 1-click rollback endpoints
│   │   ├── ingest_router.py         # High-cadence telemetry streaming (/api/ingest/batch)
│   │   ├── notification_router.py   # 2-way Telegram SRE approval bot
│   │   ├── policy_router.py         # Organizational policy limits & rules
│   │   ├── prediction_router.py     # OLS time-series drift forecasting
│   │   ├── project_router.py        # Workspace & client tenant management
│   │   ├── simulator_router.py      # Interactive chaos & fault injector
│   │   └── timeline_router.py       # Chronological incident journey & event stream
│   │
│   ├── services/
│   │   ├── counterfactual_engine.py    # [Vector 3.0] With vs Without Remediation & Impact Avoided
│   │   ├── adversarial_safety.py       # [Vector 3.0] Active pre-execution invalidation & probes
│   │   ├── digital_twin_calibration.py # [Vector 3.0] Prediction error tracking & coefficient tuning
│   │   ├── prevention_engine.py        # [Vector 3.0] Sub-alarm drift & Time-To-Failure (TTF) forecasting
│   │   ├── knowledge_graph.py          # [Vector 3.0] Incident memory graph & similarity matching
│   │   ├── causal_engine.py            # [Vector 3.0] Directed Causal DAG & 8D Decision Vector Profile
│   │   ├── root_cause_engine.py        # 5-Signal RCA & multi-tier topology graph
│   │   ├── remediation_planner.py      # Cause-aware remediation matrix
│   │   ├── safety_contract.py          # Remediation Safety Contract & Do No Harm invariants
│   │   ├── autonomy_controller.py      # Global Kill Switch & L0-L5 Autonomy manager
│   │   ├── evidence_engine.py          # 8-Part explainability dossier builder
│   │   ├── verification_service.py     # Closed-loop recovery verification & effectiveness score
│   │   ├── post_mortem_service.py      # Automated PIRs & SRE Scorecard KPIs
│   │   ├── incident_kb.py              # Persistent incident learning store
│   │   ├── assurance_service.py        # 5D Multi-Criteria Decision Analysis (MCDA)
│   │   ├── execution_service.py        # Deterministic execution, state snapshots & rollback
│   │   ├── infra_adapters.py           # Pluggable Mock & Live Kubernetes adapters
│   │   ├── metrics_service.py          # Telemetry loop & live ingest handover
│   │   ├── notification_service.py     # 2-way Telegram bot with inline callbacks
│   │   └── prediction_service.py       # Ordinary Least Squares (OLS) regression
│   │
│   ├── database.py                  # SQLite database engine & session management
│   ├── models.py                    # SQLAlchemy schemas
│   ├── main.py                      # FastAPI initialization & router wiring (v3.0.0)
│   │
│   └── tests/
│       ├── test_vector3.py          # [Vector 3.0] 8 comprehensive unit tests covering all 5 upgrades
│       ├── test_rca_verification.py # RCA & closed-loop verification tests
│       ├── test_responsible_autonomy.py # Safety contracts, kill switch & governance tests
│       └── test_vector.py           # Core regression & Kubernetes adapter tests
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Crisp single-line navigation with nowrap links & status
│   │   │   ├── Sidebar.jsx          # Vector navigation drawer
│   │   │   └── Footer.jsx           # System footer
│   │   ├── pages/
│   │   │   ├── RootCauseCenter.jsx  # Dedicated RCA Studio (5-Signal Matrix, Causal Graph, Evidence)
│   │   │   ├── Dashboard.jsx        # Mission Control with RCA Spotlight Banner & charts
│   │   │   ├── DecisionCenter.jsx   # 5D MCDA Cockpit & pre/post Twin gauges
│   │   │   ├── DigitalTwin.jsx      # What-If Simulation Studio & blast radius
│   │   │   ├── Timeline.jsx         # 9-stage incident journey & stream audit
│   │   │   ├── PolicyCenter.jsx     # Guardrails, caps, and approval rules
│   │   │   └── Simulator.jsx        # Interactive chaos & fault injector
│   │   └── index.css                # Glassmorphic dark design system & anti-wrapping styles
│   └── package.json
│
├── vector_agent.py                  # Standalone client telemetry SDK (psutil)
└── test_all_features.py             # Full end-to-end integration test runner
```

---

## 🧪 Comprehensive Verification Suite (24/24 Passed — 100%)

All 24 unit tests across the entire test suite pass with 100% success rate:
```bash
.venv\Scripts\python.exe -m pytest backend/tests/ -v
```

```text
============================= test session starts =============================
platform win32 -- Python 3.12.11, pytest-9.1.1, pluggy-1.6.0
rootdir: D:\vector_enhance
collected 24 items

backend/tests/test_rca_verification.py::test_dependency_graph_topology PASSED              [  4%]
backend/tests/test_rca_verification.py::test_root_cause_diagnosis_thread_pool PASSED        [  8%]
backend/tests/test_rca_verification.py::test_cause_aware_remediation_planning PASSED        [ 12%]
backend/tests/test_rca_verification.py::test_closed_loop_verification_and_effectiveness PASSED [ 16%]
backend/tests/test_rca_verification.py::test_knowledge_base_continuous_learning PASSED    [ 20%]
backend/tests/test_responsible_autonomy.py::test_do_no_harm_destructive_prevention PASSED  [ 25%]
backend/tests/test_responsible_autonomy.py::test_do_no_harm_database_restart PASSED        [ 29%]
backend/tests/test_responsible_autonomy.py::test_do_no_harm_pod_ceiling PASSED             [ 33%]
backend/tests/test_responsible_autonomy.py::test_safety_contract_generation PASSED         [ 37%]
backend/tests/test_responsible_autonomy.py::test_global_kill_switch_behavior PASSED        [ 41%]
backend/tests/test_responsible_autonomy.py::test_autonomy_level_gating PASSED             [ 45%]
backend/tests/test_responsible_autonomy.py::test_explainability_dossier_compilation PASSED [ 50%]
backend/tests/test_responsible_autonomy.py::test_sre_scorecard_computation PASSED         [ 54%]
backend/tests/test_vector.py::test_linear_slope_calculation PASSED                          [ 58%]
backend/tests/test_vector.py::test_mock_kubernetes_adapter PASSED                           [ 62%]
backend/tests/test_vector.py::test_assurance_scoring_logic PASSED                           [ 66%]
backend/tests/test_vector3.py::test_counterfactual_engine_projections PASSED               [ 70%]
backend/tests/test_vector3.py::test_adversarial_safety_db_connection_saturation PASSED     [ 75%]
backend/tests/test_vector3.py::test_adversarial_safety_node_memory_depletion PASSED         [ 79%]
backend/tests/test_vector3.py::test_adversarial_safety_pass PASSED                           [ 83%]
backend/tests/test_vector3.py::test_digital_twin_calibration_service PASSED                 [ 87%]
backend/tests/test_vector3.py::test_predictive_prevention_drift_detection PASSED           [ 91%]
backend/tests/test_vector3.py::test_incident_knowledge_graph_similarity PASSED             [ 95%]
backend/tests/test_vector3.py::test_causal_graph_and_decision_vector PASSED                 [100%]

======================= 24 passed, 26 warnings in 4.38s =======================
```

---

## 🔗 Live Application Links & Testing Matrix

| Interface | URL | Description |
| :--- | :--- | :--- |
| 🧭 **Root Cause (RCA) Studio** | **[http://localhost:5173/rca](http://localhost:5173/rca)** | Primary RCA Cockpit (5-Signal Matrix, Causal Graph, Evidence, Remediation Planner) |
| 📊 **Mission Control Dashboard** | **[http://localhost:5173/dashboard](http://localhost:5173/dashboard)** | Cluster health, telemetry charts, and RCA Spotlight Banner |
| 🛡️ **Decision Center** | **[http://localhost:5173/decision](http://localhost:5173/decision)** | 5D MCDA trust score, safety contracts, and execution approval |
| 🌐 **Digital Twin Studio** | **[http://localhost:5173/digital-twin](http://localhost:5173/digital-twin)** | Topology diagrams, What-If capacity scaling, and blast radius |
| ⚡ **Incident Chaos Simulator** | **[http://localhost:5173/simulator](http://localhost:5173/simulator)** | Inject CPU spikes, memory leaks, and traffic surges |
| ⏱️ **Incident Journey Timeline** | **[http://localhost:5173/timeline](http://localhost:5173/timeline)** | 9-stage incident journey stepper (Detection ➔ Diagnosis ➔ Remediation ➔ Recovery) |
| 📋 **Governance & Policy Center** | **[http://localhost:5173/policies](http://localhost:5173/policies)** | Autonomy levels, kill switch, and pod limits |
| 📚 **Interactive Swagger API Docs** | **[http://localhost:8000/docs](http://localhost:8000/docs)** | Vector 3.0 API endpoints testable directly in the browser |

### Live Vector 3.0 REST Endpoints
* `POST http://localhost:8000/api/vector3/counterfactual`: Simulates "Without Remediation" vs. "With Remediation" and computes quantified downtime/cost avoided.
* `POST http://localhost:8000/api/vector3/adversarial-challenge`: Runs adversarial probes to challenge and disprove candidate remediation plans.
* `POST http://localhost:8000/api/vector3/digital-twin/calibrate`: Records prediction vs. reality and recalibrates simulation scaling coefficients.
* `GET  http://localhost:8000/api/vector3/digital-twin/summary`: Returns digital twin prediction accuracy statistics and calibration event history.
* `POST http://localhost:8000/api/vector3/prevention/scan`: Evaluates metric drift and forecasts Time-To-Failure (TTF).
* `POST http://localhost:8000/api/vector3/knowledge-graph/query`: Performs multi-dimensional similarity search across past incident records.
* `POST http://localhost:8000/api/vector3/causal-graph`: Generates explicit directed causal DAG with "Why do you believe this is the root cause?".
* `POST http://localhost:8000/api/vector3/decision-vector`: Evaluates the 8-dimensional decision vector profile.
