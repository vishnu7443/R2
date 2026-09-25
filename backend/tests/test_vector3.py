"""
Vector 3.0 Test Suite
Covers:
1. Counterfactual Incident Engine (Without vs With Remediation & Impact Avoided)
2. Adversarial Safety Agent (Downstream DB Pool Saturation, Node Headroom, Cooldown)
3. Digital Twin Calibration (Prediction Error & Coefficient Recalibration)
4. Predictive Prevention Engine (Sub-alarm Drift & Time-to-Failure Forecast)
5. Incident Knowledge Graph (Multi-dimensional Similarity & Evidence-Weighted Recommendations)
6. Causal Inference Graph & Multi-dimensional Decision Vector Profile
"""

import pytest
import time
from backend.services.counterfactual_engine import simulate_counterfactual_trajectory
from backend.services.adversarial_safety import AdversarialSafetyAgent
from backend.services.digital_twin_calibration import DigitalTwinCalibrationService
from backend.services.prevention_engine import PredictivePreventionEngine
from backend.services.knowledge_graph import IncidentKnowledgeGraph
from backend.services.causal_engine import generate_causal_inference_graph, compute_decision_vector

def test_counterfactual_engine_projections():
    """Verify counterfactual branching projections and impact avoided calculations."""
    current_metrics = {"cpu": 94.0, "latency_ms": 1800.0, "error_rate": 8.0}
    target_spec = {"current_replicas": 2, "target_replicas": 4}
    downstream = ["erp-db", "erp-inventory"]

    result = simulate_counterfactual_trajectory(
        service_name="erp-backend",
        current_metrics=current_metrics,
        proposed_action="SCALE_REPLICAS_2_TO_4",
        target_spec=target_spec,
        downstream_services=downstream
    )

    assert "counterfactual_without_remediation" in result
    assert "projected_with_remediation" in result
    assert "quantified_impact_avoided" in result

    without = result["counterfactual_without_remediation"]
    with_act = result["projected_with_remediation"]
    impact = result["quantified_impact_avoided"]

    # Without remediation should project degradation / failure
    assert without["projected_cpu"] > current_metrics["cpu"]
    assert without["projected_latency_ms"] > current_metrics["latency_ms"]
    assert without["estimated_unplanned_downtime_minutes"] > 0

    # With remediation should project recovery
    assert with_act["projected_cpu"] < current_metrics["cpu"]
    assert with_act["projected_latency_ms"] < current_metrics["latency_ms"]
    assert with_act["estimated_unplanned_downtime_minutes"] == 0.0

    # Quantified avoided metrics
    assert impact["avoided_cpu_saturation_delta"] > 0
    assert impact["avoided_latency_degradation_ms"] > 0
    assert impact["avoided_unplanned_downtime_minutes"] > 0
    assert impact["estimated_financial_loss_prevented_usd"] > 0
    assert "executive_counterfactual_summary" in result

def test_adversarial_safety_db_connection_saturation():
    """Verify adversarial agent rejects actions that saturate downstream database connection pool."""
    agent = AdversarialSafetyAgent()
    cluster_state = {
        "db_max_connections": 100,
        "db_active_connections": 75,
        "conns_per_pod": 15,
        "node_memory_headroom_mb": 4096.0,
        "pod_memory_mb": 512.0
    }
    # Scaling from 2 to 6 adds 4 * 15 = 60 connections -> 75 + 60 = 135 > 100
    res = agent.evaluate_candidate_action(
        service_name="erp-backend",
        proposed_action="SCALE_REPLICAS_2_TO_6",
        action_spec={"current_replicas": 2, "target_replicas": 6},
        cluster_state=cluster_state
    )

    assert res["verdict"] == "REJECTED"
    assert res["action_allowed"] is False
    assert any(c["category"] == "DOWNSTREAM_RESOURCE_SATURATION" for c in res["challenges"])
    assert len(res["required_mitigations"]) > 0

def test_adversarial_safety_node_memory_depletion():
    """Verify adversarial agent flags actions exceeding node memory limits."""
    agent = AdversarialSafetyAgent()
    cluster_state = {
        "db_max_connections": 500,
        "db_active_connections": 50,
        "conns_per_pod": 10,
        "node_memory_headroom_mb": 800.0,  # Only 800MB available
        "pod_memory_mb": 512.0
    }
    # Adding 3 pods requires 1536MB > 800MB
    res = agent.evaluate_candidate_action(
        service_name="erp-backend",
        proposed_action="SCALE_REPLICAS_2_TO_5",
        action_spec={"current_replicas": 2, "target_replicas": 5},
        cluster_state=cluster_state
    )

    assert res["verdict"] == "REJECTED"
    assert any(c["category"] == "NODE_RESOURCE_EXHAUSTION" for c in res["challenges"])

def test_adversarial_safety_pass():
    """Verify safe action passes when within all resource and stability boundaries."""
    agent = AdversarialSafetyAgent()
    cluster_state = {
        "db_max_connections": 200,
        "db_active_connections": 50,
        "conns_per_pod": 10,
        "node_memory_headroom_mb": 4096.0,
        "pod_memory_mb": 512.0,
        "min_action_cooldown_sec": 60,
        "downstream_health": {}
    }
    res = agent.evaluate_candidate_action(
        service_name="erp-backend",
        proposed_action="SCALE_REPLICAS_2_TO_4",
        action_spec={"current_replicas": 2, "target_replicas": 4},
        cluster_state=cluster_state,
        last_action_timestamp=time.time() - 300  # Executed 300s ago (beyond cooldown)
    )

    assert res["verdict"] == "PASSED"
    assert res["action_allowed"] is True
    assert len(res["challenges"]) == 0

def test_digital_twin_calibration_service():
    """Verify prediction error calculation and dynamic coefficient recalibration."""
    calibrator = DigitalTwinCalibrationService()

    pred = {"cpu": 54.0, "latency_ms": 300.0, "error_rate": 0.2}
    actual = {"cpu": 60.0, "latency_ms": 320.0, "error_rate": 0.3}

    res = calibrator.record_and_calibrate(
        service_name="erp-backend",
        action="SCALE_REPLICAS_2_TO_4",
        predicted_metrics=pred,
        actual_metrics=actual
    )

    assert res["calibration_status"] == "SUCCESSFULLY_CALIBRATED"
    assert res["accuracy_score_pct"] > 0
    assert "cpu_prediction_error_pct" in res["error_analysis"]
    assert "active_coefficients" in res

    # Summary endpoint verification
    summary = calibrator.get_calibration_summary()
    assert summary["overall_twin_accuracy_score_pct"] > 85.0
    assert summary["total_calibration_iterations"] >= 3

def test_predictive_prevention_drift_detection():
    """Verify pre-incident linear drift detection and Time-To-Failure (TTF) projection."""
    engine = PredictivePreventionEngine()
    # Memory drifting from 600MB to 850MB over 15 minutes (+16.6 MB/min)
    metric_history = {
        "memory_mb": [600.0, 650.0, 720.0, 780.0, 850.0],
        "threads": [60.0, 65.0, 70.0, 75.0, 80.0]
    }

    res = engine.scan_telemetry_drift(
        service_name="erp-backend",
        metric_history=metric_history,
        window_minutes=15.0
    )

    assert res["prevention_posture"] == "PREVENTIVE_ACTION_REQUIRED"
    assert res["active_drift_warnings_count"] >= 1

    mem_warn = next(w for w in res["pre_incident_warnings"] if "memory" in w["metric"])
    assert mem_warn["drift_rate_per_min"] > 10.0
    assert mem_warn["time_to_failure_minutes"] < 20.0
    assert mem_warn["severity"] == "URGENT_PREVENTION"
    assert "SCHEDULED_ROLLING_RESTART" in mem_warn["preventive_remediation"]["action"]

def test_incident_knowledge_graph_similarity():
    """Verify multi-factor similarity matching and evidence-weighted recommendations."""
    kg = IncidentKnowledgeGraph()

    query_metrics = {"cpu": 93.0, "latency_ms": 1790.0, "error_rate": 8.0}
    res = kg.query_similarity(
        service_name="erp-backend",
        category="THREAD_POOL_EXHAUSTION",
        current_metrics=query_metrics,
        top_k=2
    )

    assert len(res["top_historical_matches"]) == 2
    top_match = res["top_historical_matches"][0]
    assert top_match["incident"]["incident_id"] == "INC-8492"
    assert top_match["similarity_score_pct"] > 85.0
    assert res["evidence_weighted_recommendation"] is not None
    assert res["evidence_weighted_recommendation"]["action"] == "SCALE_REPLICAS_2_TO_4"

def test_causal_graph_and_decision_vector():
    """Verify directed causal DAG generation and 8-dimensional decision vector gating."""
    causal_res = generate_causal_inference_graph(
        service_name="erp-backend",
        root_cause_type="THREAD_POOL_EXHAUSTION",
        observed_metrics={"cpu": 94.0, "latency_ms": 1820.0, "error_rate": 8.2}
    )

    assert len(causal_res["graph"]["nodes"]) >= 5
    assert len(causal_res["graph"]["edges"]) >= 4
    assert "why_explanation" in causal_res
    assert len(causal_res["alternative_hypotheses_eliminated"]) >= 1

    # Decision Vector Check
    dv_approved = compute_decision_vector(
        rca_conf=0.88,
        sim_conf=0.91,
        safety_passed=True,
        policy_passed=True,
        blast_radius="CONTAINED_LOCAL",
        cost_impact_pct=8.5,
        rollback_ready=True
    )
    assert dv_approved["eligibility_verdict"] == "ACTION_AUTHORIZED"
    assert dv_approved["decision_vector"]["rca_confidence_pct"] == 88.0

    # Decision Vector Rejection Check
    dv_rejected = compute_decision_vector(
        rca_conf=0.60,  # Below 75% threshold
        safety_passed=False
    )
    assert dv_rejected["eligibility_verdict"] == "ACTION_REQUIRES_ELEVATION"
