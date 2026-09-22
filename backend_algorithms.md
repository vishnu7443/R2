# 🧠 Vector Backend Algorithms & Machine Learning Models

This document details the core algorithms and machine learning models powering Vector's autonomous SRE predictive assurance engine.

---

## 1. 📈 Ordinary Least Squares (OLS) Linear Regression
* **Category**: Machine Learning / Time-Series Forecasting
* **Location**: `backend/services/prediction_service.py`
* **Description**: Fits a linear trendline ($y = mx + c$) over trailing telemetry readings to predict resource utilization 300 seconds into the future using the closed-form equation:
  $$m = \frac{n \sum (xy) - \sum x \sum y}{n \sum (x^2) - (\sum x)^2}$$
* **Purpose**: Forecasts CPU, Memory, and Latency exhaustion before critical failures occur.

---

## 2. 🎯 Multi-Criteria Decision Analysis (MCDA)
* **Category**: Decision Engineering & Optimization Algorithm
* **Location**: `backend/services/assurance_service.py`
* **Description**: Evaluates candidate remediation actions across 5 weighted dimensions (Decision Confidence, Operational Risk Index, Governance Compliance, Rollback Feasibility, and Digital Twin Outcome) to produce a unified Trust Score ($0 - 100$).
* **Purpose**: Determines whether a remediation action is safe for `AUTO_EXECUTE` ($\ge 85$) or requires `HUMAN_APPROVAL`.

---

## 3. 🌐 Proportional State-Space Projection Model
* **Category**: Capacity Planning & Simulation Algorithm
* **Location**: `backend/services/assurance_service.py`
* **Description**: Projects the exact post-action cluster state in the Digital Twin using proportional workload distribution laws:
  $$\text{Utilization}_{\text{projected}} = \text{Utilization}_{\text{current}} \times \left( \frac{\text{Replicas}_{\text{current}}}{\text{Replicas}_{\text{target}}} \right)$$
* **Purpose**: Predicts outcome metrics before applying changes to live infrastructure.

---

## 4. 📊 Simple Moving Average (SMA)
* **Category**: Digital Signal Processing & Smoothing Algorithm
* **Location**: `backend/api/dashboard_router.py`
* **Description**: Computes a 3-sample rolling average over consecutive telemetry records to filter out high-frequency noise and transient spikes.
* **Purpose**: Produces stable, non-flickering cluster health scores.

---

## 5. 🛡️ Dual-Threshold Hysteresis Algorithm
* **Category**: Control Loop Stabilization Algorithm
* **Location**: `backend/api/prediction_router.py`
* **Description**: Employs asymmetric upper and lower threshold boundaries ($60\%$ recovery threshold) to prevent alert toggling near boundary limits.
* **Purpose**: Eliminates UI state flickering and alert rapid-fire mounting.

---

## 6. ⚡ Heuristic Rule-Based Policy Matching
* **Category**: Optimization & Recommendation Algorithm
* **Location**: `backend/services/candidate_generator.py`
* **Description**: Maps identified failure vectors (CPU spike, Memory leak, Latency degradation) to ranked candidate remediation strategies (e.g. Pod Scaling, Rolling Restart, Resource Limit Adjustment).
* **Purpose**: Instantly generates feasible remediation candidates upon threat detection.
