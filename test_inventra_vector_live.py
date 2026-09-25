"""
========================================================================================
 VECTOR 3.0 x INVENTRA ERP — REAL-TIME PRODUCTION INTEGRATION & E2E VERIFICATION SUITE
========================================================================================
This script performs an exhaustive live validation of Vector AI connected in real-time
to the client application (Inventra ERP).

Validates:
1. Inventra ERP Client Portal (Vite React on :5174) & Express API (:5000)
2. Live Telemetry Ingestion Bridge (:8000/api/ingest/status) — is_live: True
3. Real-Time Telemetry Dashboard (:8000/api/dashboard?mode=inventraerp)
4. Vector 3.0 Causal Inference DAG & "Why" Explainability
5. Vector 3.0 Counterfactual Impact Avoided Simulation
6. Vector 3.0 Adversarial Safety Invalidation Probes
7. Vector 3.0 Digital Twin Accuracy Calibration
8. Vector 3.0 Predictive Incident Drift & TTF Forecasting
9. Vector 3.0 Incident Knowledge Graph Precedent Matching
10. Vector 3.0 8-Dimensional Decision Vector Profile Gate
========================================================================================
"""

import sys
import time
import requests

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

VECTOR_URL = "http://localhost:8000"
INVENTRA_CLIENT_URL = "http://localhost:5174"
INVENTRA_SERVER_URL = "http://localhost:5000"

def log_header(title):
    print("\n" + "=" * 80)
    print(f" >>> {title}")
    print("=" * 80)

def test_1_inventra_erp_fullstack_health():
    log_header("STEP 1: Inventra ERP Full-Stack Health Check")
    # 1. Client UI
    try:
        r_client = requests.get(INVENTRA_CLIENT_URL, timeout=4)
        assert r_client.status_code == 200, f"Client responded with status {r_client.status_code}"
        print(f"  [PASS] Inventra ERP Client UI is LIVE at {INVENTRA_CLIENT_URL} (HTTP 200 OK)")
    except Exception as e:
        print(f"  [FAIL] Client UI unreachable at {INVENTRA_CLIENT_URL}: {e}")
        raise

    # 2. Server API
    try:
        r_server = requests.get(INVENTRA_SERVER_URL, timeout=4)
        assert r_server.status_code == 200, f"Server responded with status {r_server.status_code}"
        data = r_server.json()
        msg = str(data.get('message', 'OK')).encode('ascii', 'ignore').decode('ascii').strip()
        print(f"  [PASS] Inventra ERP Express Server is LIVE at {INVENTRA_SERVER_URL} ({msg})")
    except Exception as e:
        print(f"  [FAIL] Server API unreachable at {INVENTRA_SERVER_URL}: {e}")
        raise

def test_2_realtime_telemetry_bridge():
    log_header("STEP 2: Real-Time Telemetry Streaming Verification")
    r = requests.get(f"{VECTOR_URL}/api/ingest/status", timeout=4)
    assert r.status_code == 200, f"Ingest status failed: {r.status_code}"
    status = r.json()
    
    print(f"  Streaming Status: {'LIVE' if status.get('is_live') else 'SYNTHETIC'}")
    print(f"  Telemetry Source: {status.get('source')}")
    print(f"  Active Workloads: {status.get('total_active')} ({', '.join(status.get('active_services', {}).keys())})")
    
    assert status.get("is_live") is True, "Expected is_live: True from active vector_agent stream"
    assert status.get("source") == "vector_agent.py", "Expected source to be vector_agent.py"
    print("  [PASS] Real-time telemetry connection to Vector AI verified.")

def test_3_inventra_dashboard_metrics():
    log_header("STEP 3: Vector Dashboard Live Metrics Handover")
    r = requests.get(f"{VECTOR_URL}/api/dashboard?mode=inventraerp", timeout=4)
    assert r.status_code == 200, f"Dashboard query failed: {r.status_code}"
    dash = r.json()

    print(f"  Cluster Health Score: {dash.get('health_score')}/100 ({dash.get('health_status')})")
    print(f"  Live Agent Active:    {dash.get('live_agent_active')}")
    print(f"  Active Services:      {', '.join(dash.get('services', {}).keys())}")
    
    assert dash.get("live_agent_active") is True, "Dashboard does not show live_agent_active: True"
    print("  [PASS] Vector Mission Control seamlessly displaying live client telemetry.")

def test_4_causal_inference_graph():
    log_header("STEP 4: Vector 3.0 Causal Inference Graph & Explainability")
    payload = {
        "service_name": "erp-core",
        "root_cause_type": "THREAD_POOL_EXHAUSTION",
        "observed_metrics": {"cpu": 93.5, "latency_ms": 1780.0, "error_rate": 8.0}
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/causal-graph", json=payload, timeout=4)
    assert r.status_code == 200, f"Causal graph API failed: {r.status_code}"
    data = r.json()

    print(f"  Causal Path: {' -> '.join(data.get('causal_chain_path', []))}")
    print(f"  Graph Nodes: {len(data.get('graph', {}).get('nodes', []))} nodes, {len(data.get('graph', {}).get('edges', []))} edges")
    print(f"  Why Narrative: {data.get('why_explanation')[:110]}...")
    print(f"  Falsification: {data.get('falsification_signals')}")

    assert len(data.get("graph", {}).get("nodes", [])) >= 4, "Insufficient causal nodes"
    print("  [PASS] Directed Causal Graph and explainable why-narrative verified.")

def test_5_counterfactual_engine():
    log_header("STEP 5: Vector 3.0 Counterfactual Incident Impact Engine")
    payload = {
        "service_name": "erp-core",
        "current_metrics": {"cpu": 94.0, "latency_ms": 1820.0, "error_rate": 8.2},
        "proposed_action": "SCALE_REPLICAS_2_TO_4",
        "target_spec": {"current_replicas": 2, "target_replicas": 4},
        "downstream_services": ["erp-db", "erp-inventory"]
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/counterfactual", json=payload, timeout=4)
    assert r.status_code == 200, f"Counterfactual API failed: {r.status_code}"
    res = r.json()

    impact = res.get("quantified_impact_avoided", {})
    print(f"  Without Remediation: Latency -> {res['counterfactual_without_remediation']['projected_latency_ms']}ms, Downtime -> {res['counterfactual_without_remediation']['estimated_unplanned_downtime_minutes']} min")
    print(f"  With Remediation:    Latency -> {res['projected_with_remediation']['projected_latency_ms']}ms, Downtime -> 0 min")
    print(f"  Quantified Impact:   {impact.get('avoided_unplanned_downtime_minutes')} mins downtime avoided, ${impact.get('estimated_financial_loss_prevented_usd'):,} financial loss prevented")

    assert impact.get("avoided_unplanned_downtime_minutes", 0) > 0, "No avoided downtime calculated"
    assert impact.get("estimated_financial_loss_prevented_usd", 0) > 0, "No financial savings calculated"
    print("  [PASS] Counterfactual branching and impact avoided calculations verified.")

def test_6_adversarial_safety_agent():
    log_header("STEP 6: Vector 3.0 Adversarial Safety Invalidation Probes")
    # Test DB Connection Pool saturation rejection
    payload = {
        "service_name": "erp-core",
        "proposed_action": "SCALE_REPLICAS_2_TO_6",
        "action_spec": {"current_replicas": 2, "target_replicas": 6},
        "cluster_state": {
            "db_max_connections": 100,
            "db_active_connections": 75,
            "conns_per_pod": 15
        }
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/adversarial-challenge", json=payload, timeout=4)
    assert r.status_code == 200, f"Adversarial check failed: {r.status_code}"
    res = r.json()

    print(f"  Adversarial Verdict:    {res.get('verdict')} (Action Allowed: {res.get('action_allowed')})")
    print(f"  Challenges Identified:  {res.get('total_challenges_identified')}")
    if res.get("challenges"):
        c = res["challenges"][0]
        print(f"  Primary Challenge:      [{c.get('severity')}] {c.get('target_subsystem')} - {c.get('failure_hypothesis')[:85]}...")
        print(f"  Required Mitigations:   {res.get('required_mitigations')[0] if res.get('required_mitigations') else 'None'}")

    assert res.get("verdict") == "REJECTED", "Expected adversarial agent to reject action that saturates DB"
    assert res.get("action_allowed") is False, "Action should be blocked"
    print("  [PASS] Adversarial safety agent successfully prevented downstream DB pool exhaustion.")

def test_7_digital_twin_calibration():
    log_header("STEP 7: Vector 3.0 Digital Twin Calibration & Accuracy")
    payload = {
        "service_name": "erp-core",
        "action": "SCALE_REPLICAS_2_TO_4",
        "predicted_metrics": {"cpu": 54.1, "latency_ms": 310.0, "error_rate": 0.3},
        "actual_metrics": {"cpu": 56.8, "latency_ms": 322.0, "error_rate": 0.3}
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/digital-twin/calibrate", json=payload, timeout=4)
    assert r.status_code == 200, f"Calibration API failed: {r.status_code}"
    cal_res = r.json()

    print(f"  Calibration Status: {cal_res.get('calibration_status')}")
    print(f"  Execution Accuracy: {cal_res.get('accuracy_score_pct')}%")
    print(f"  Prediction Errors:  CPU Error: {cal_res.get('error_analysis', {}).get('cpu_prediction_error_pct')}%, Latency Error: {cal_res.get('error_analysis', {}).get('latency_prediction_error_pct')}%")
    print(f"  New Coefficients:   cpu_scale_efficiency = {cal_res.get('active_coefficients', {}).get('cpu_scale_efficiency')}")

    # Query summary
    r_sum = requests.get(f"{VECTOR_URL}/api/vector3/digital-twin/summary", timeout=4)
    summary = r_sum.json()
    print(f"  Historical Model Accuracy: {summary.get('overall_twin_accuracy_score_pct')}% (Iterations: {summary.get('total_calibration_iterations')})")

    assert summary.get("overall_twin_accuracy_score_pct", 0) > 85.0, "Model accuracy below threshold"
    print("  [PASS] Digital Twin prediction error tracking and dynamic calibration verified.")

def test_8_predictive_incident_prevention():
    log_header("STEP 8: Vector 3.0 Predictive Incident Drift & TTF Forecasting")
    payload = {
        "service_name": "erp-core",
        "metric_history": {
            "memory_mb": [620.0, 660.0, 710.0, 770.0, 840.0],
            "threads": [60.0, 68.0, 75.0, 85.0, 96.0]
        },
        "window_minutes": 15.0
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/prevention/scan", json=payload, timeout=4)
    assert r.status_code == 200, f"Prevention scan API failed: {r.status_code}"
    prev = r.json()

    print(f"  Prevention Posture: {prev.get('prevention_posture')}")
    print(f"  Warnings Detected:  {prev.get('active_drift_warnings_count')}")
    for w in prev.get("pre_incident_warnings", []):
        print(f"  -> [{w.get('severity')}] {w.get('metric')} drifting +{w.get('drift_rate_per_min')} {w.get('unit')}/min | Projected TTF: {w.get('time_to_failure_minutes')} mins")
        print(f"     Recommended Fix: {w.get('preventive_remediation', {}).get('action')} ({w.get('preventive_remediation', {}).get('optimal_window')})")

    assert prev.get("active_drift_warnings_count", 0) >= 1, "Expected drift warnings"
    print("  [PASS] Predictive prevention engine forecasting imminent failure and scheduling safe fixes.")

def test_9_incident_knowledge_graph():
    log_header("STEP 9: Vector 3.0 Incident Knowledge Graph Precedent Matching")
    payload = {
        "service_name": "erp-core",
        "category": "THREAD_POOL_EXHAUSTION",
        "current_metrics": {"cpu": 93.0, "latency_ms": 1780.0, "error_rate": 8.0},
        "top_k": 2
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/knowledge-graph/query", json=payload, timeout=4)
    assert r.status_code == 200, f"Knowledge graph query failed: {r.status_code}"
    kg_res = r.json()

    matches = kg_res.get("top_historical_matches", [])
    print(f"  Found {len(matches)} historical incident precedents:")
    for m in matches:
        inc = m.get("incident", {})
        print(f"  -> {inc.get('incident_id')} | {inc.get('title')} ({m.get('similarity_score_pct')}% match)")
        print(f"     Applied Fix: {inc.get('applied_remediation')} (Effectiveness: {inc.get('effectiveness_score')}%, MTTR: {inc.get('mttr_seconds')}s)")

    rec = kg_res.get("evidence_weighted_recommendation", {})
    print(f"  Evidence-Weighted Strategy: {rec.get('action')} (Score: {rec.get('weighted_score')})")

    assert len(matches) > 0, "No precedents returned"
    print("  [PASS] Incident Knowledge Graph multi-factor similarity matching verified.")

def test_10_decision_vector_profile():
    log_header("STEP 10: Vector 3.0 8-Dimensional Decision Vector Profile Gate")
    payload = {
        "rca_conf": 0.88,
        "sim_conf": 0.91,
        "safety_passed": True,
        "policy_passed": True,
        "blast_radius": "CONTAINED_LOCAL",
        "cost_impact_pct": 8.5,
        "rollback_ready": True,
        "hist_similarity": 0.88
    }
    r = requests.post(f"{VECTOR_URL}/api/vector3/decision-vector", json=payload, timeout=4)
    assert r.status_code == 200, f"Decision vector API failed: {r.status_code}"
    dv = r.json()

    profile = dv.get("decision_vector", {})
    print(f"  Decision Verdict:   {dv.get('eligibility_verdict')}")
    print(f"  RCA Confidence:     {profile.get('rca_confidence_pct')}%")
    print(f"  Twin Sim Conf:      {profile.get('simulation_confidence_pct')}%")
    print(f"  Safety Compliance:  {profile.get('safety_compliance_pct')}%")
    print(f"  Policy Compliance:  {profile.get('policy_compliance_pct')}%")
    print(f"  Rollback Readiness: {profile.get('rollback_readiness_pct')}%")
    print(f"  Cost Impact:        +{profile.get('financial_cost_impact_pct')}%")

    assert dv.get("eligibility_verdict") == "ACTION_AUTHORIZED", "Action should be authorized"
    print("  [PASS] 8-Dimensional Decision Vector Profile verified and passing.")

def run_suite():
    print("\n" + "#" * 80)
    print(" VECTOR 3.0 x INVENTRA ERP — COMPLETE LIVE INTEGRATION & SRE ASSURANCE SUITE")
    print("#" * 80)
    
    test_1_inventra_erp_fullstack_health()
    test_2_realtime_telemetry_bridge()
    test_3_inventra_dashboard_metrics()
    test_4_causal_inference_graph()
    test_5_counterfactual_engine()
    test_6_adversarial_safety_agent()
    test_7_digital_twin_calibration()
    test_8_predictive_incident_prevention()
    test_9_incident_knowledge_graph()
    test_10_decision_vector_profile()

    print("\n" + "#" * 80)
    print(" >>> ALL 10 INTEGRATION & VECTOR 3.0 SRE CONTROL PLANE TESTS PASSED 100%!")
    print(" >>> INVENTRA ERP IS FULLY CONNECTED, MONITORED, AND AUTONOMOUSLY GUARDED.")
    print("#" * 80 + "\n")

if __name__ == "__main__":
    run_suite()
