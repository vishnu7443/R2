"""
Vector 3.0 API Router
Exposes endpoints for:
- Counterfactual Incident Simulation
- Adversarial Safety Evaluation
- Digital Twin Model Calibration & Accuracy Summary
- Predictive Incident Drift Detection & Early Warning
- Incident Knowledge Graph Similarity Query
- Causal Graph & Decision Vector Profile
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from ..services.counterfactual_engine import simulate_counterfactual_trajectory
from ..services.adversarial_safety import adversarial_agent
from ..services.digital_twin_calibration import digital_twin_calibrator
from ..services.prevention_engine import prevention_engine
from ..services.knowledge_graph import knowledge_graph
from ..services.causal_engine import generate_causal_inference_graph, compute_decision_vector

router = APIRouter(prefix="/api/vector3", tags=["Vector 3.0 Control Plane"])

# --- Request Models ---
class CounterfactualRequest(BaseModel):
    service_name: str = "erp-backend"
    current_metrics: Dict[str, float] = Field(default_factory=lambda: {"cpu": 94.0, "latency_ms": 1820.0, "error_rate": 8.2})
    proposed_action: str = "SCALE_REPLICAS_2_TO_4"
    target_spec: Dict[str, Any] = Field(default_factory=lambda: {"current_replicas": 2, "target_replicas": 4})
    downstream_services: Optional[List[str]] = None

class AdversarialCheckRequest(BaseModel):
    service_name: str = "erp-backend"
    proposed_action: str = "SCALE_REPLICAS_2_TO_6"
    action_spec: Dict[str, Any] = Field(default_factory=lambda: {"current_replicas": 2, "target_replicas": 6})
    cluster_state: Optional[Dict[str, Any]] = None
    last_action_timestamp: Optional[float] = None

class TwinCalibrationRequest(BaseModel):
    service_name: str = "erp-backend"
    action: str = "SCALE_REPLICAS_2_TO_4"
    predicted_metrics: Dict[str, float] = Field(default_factory=lambda: {"cpu": 54.1, "latency_ms": 310.0, "error_rate": 0.3})
    actual_metrics: Dict[str, float] = Field(default_factory=lambda: {"cpu": 57.3, "latency_ms": 326.0, "error_rate": 0.4})

class DriftScanRequest(BaseModel):
    service_name: str = "erp-backend"
    metric_history: Optional[Dict[str, List[float]]] = None
    window_minutes: float = 15.0

class KnowledgeGraphQueryRequest(BaseModel):
    service_name: str = "erp-backend"
    category: str = "THREAD_POOL_EXHAUSTION"
    current_metrics: Dict[str, float] = Field(default_factory=lambda: {"cpu": 92.0, "latency_ms": 1780.0, "error_rate": 7.5})
    top_k: int = 3

class CausalGraphRequest(BaseModel):
    service_name: str = "erp-backend"
    root_cause_type: str = "THREAD_POOL_EXHAUSTION"
    observed_metrics: Dict[str, float] = Field(default_factory=lambda: {"cpu": 94.0, "latency_ms": 1820.0, "error_rate": 8.2})

class DecisionVectorRequest(BaseModel):
    rca_conf: float = 0.88
    sim_conf: float = 0.91
    safety_passed: bool = True
    policy_passed: bool = True
    blast_radius: str = "CONTAINED_LOCAL"
    cost_impact_pct: float = 8.5
    rollback_ready: bool = True
    hist_similarity: float = 0.85

# --- Endpoints ---
@router.post("/counterfactual")
def run_counterfactual_simulation(req: CounterfactualRequest):
    """Simulates outcomes 'Without Remediation' vs 'With Remediation' and returns Quantified Impact Avoided."""
    return simulate_counterfactual_trajectory(
        service_name=req.service_name,
        current_metrics=req.current_metrics,
        proposed_action=req.proposed_action,
        target_spec=req.target_spec,
        downstream_services=req.downstream_services
    )

@router.post("/adversarial-challenge")
def run_adversarial_challenge(req: AdversarialCheckRequest):
    """Runs adversarial probes to challenge and potentially invalidate candidate remediation plans."""
    return adversarial_agent.evaluate_candidate_action(
        service_name=req.service_name,
        proposed_action=req.proposed_action,
        action_spec=req.action_spec,
        cluster_state=req.cluster_state,
        last_action_timestamp=req.last_action_timestamp
    )

@router.post("/digital-twin/calibrate")
def calibrate_digital_twin(req: TwinCalibrationRequest):
    """Records real vs predicted execution outcomes and dynamically recalibrates simulation coefficients."""
    return digital_twin_calibrator.record_and_calibrate(
        service_name=req.service_name,
        action=req.action,
        predicted_metrics=req.predicted_metrics,
        actual_metrics=req.actual_metrics
    )

@router.get("/digital-twin/summary")
def get_digital_twin_calibration_summary():
    """Returns digital twin prediction accuracy statistics and calibration log."""
    return digital_twin_calibrator.get_calibration_summary()

class InjectDriftRequest(BaseModel):
    service_name: str = "erp-core"
    metric: str = "worker_thread_utilization"
    drift_rate_per_min: float = 6.8
    time_to_failure_minutes: float = 4.7

class PreemptiveFixRequest(BaseModel):
    service_name: str = "erp-core"

@router.get("/prevention/live-status")
def get_live_prevention_status():
    """Returns real-time predictive drift warnings and TTF status for Inventra ERP client notification."""
    return prevention_engine.get_live_prevention_status()

@router.post("/prevention/inject-drift")
def inject_predictive_drift(req: InjectDriftRequest):
    """Injects an early sub-alarm metric drift into the predictive prevention engine to demonstrate forecasting."""
    return prevention_engine.inject_predictive_drift(
        service_name=req.service_name,
        metric=req.metric,
        drift_rate_per_min=req.drift_rate_per_min,
        time_to_failure_minutes=req.time_to_failure_minutes
    )

@router.post("/prevention/execute-preemptive-fix")
def execute_preemptive_fix(req: PreemptiveFixRequest):
    """Executes bounded zero-downtime remediation to neutralize the threat before failure occurs."""
    return prevention_engine.execute_preemptive_remediation(service_name=req.service_name)

class StageUpdateRequest(BaseModel):
    stage: str
    details: Optional[Dict[str, Any]] = None

@router.post("/prevention/stage")
def set_drill_stage(req: StageUpdateRequest):
    """Sets active predictive drill stage (PREDICTING, ROOT_CAUSE_IDENTIFIED, BEST_SOLUTION_SELECTED, REMEDIATED, IDLE)."""
    return prevention_engine.set_drill_stage(stage=req.stage, details=req.details)

@router.post("/prevention/reset")
def reset_prevention():
    """Resets live prevention state back to nominal baseline."""
    return prevention_engine.reset()

@router.post("/prevention/scan")
def scan_predictive_prevention(req: DriftScanRequest):
    """Scans telemetry time-series for subtle drift and forecasts time to OOM/exhaustion."""
    metrics = req.metric_history or {
        "memory_mb": [620.0, 650.0, 685.0, 720.0, 760.0],
        "threads": [80.0, 95.0, 110.0, 130.0, 152.0]
    }
    return prevention_engine.scan_telemetry_drift(
        service_name=req.service_name,
        metric_history=metrics,
        window_minutes=req.window_minutes
    )

@router.post("/knowledge-graph/query")
def query_incident_knowledge_graph(req: KnowledgeGraphQueryRequest):
    """Performs multi-dimensional similarity search across past incident records."""
    return knowledge_graph.query_similarity(
        service_name=req.service_name,
        category=req.category,
        current_metrics=req.current_metrics,
        top_k=req.top_k
    )

@router.post("/causal-graph")
def get_causal_graph(req: CausalGraphRequest):
    """Generates an explicit directed causal graph with 'Why do you believe this is the root cause?' reasoning."""
    return generate_causal_inference_graph(
        service_name=req.service_name,
        root_cause_type=req.root_cause_type,
        observed_metrics=req.observed_metrics
    )

@router.post("/decision-vector")
def get_decision_vector(req: DecisionVectorRequest):
    """Compiles an 8-dimensional decision vector profile replacing a single opaque score."""
    return compute_decision_vector(
        rca_conf=req.rca_conf,
        sim_conf=req.sim_conf,
        safety_passed=req.safety_passed,
        policy_passed=req.policy_passed,
        blast_radius=req.blast_radius,
        cost_impact_pct=req.cost_impact_pct,
        rollback_ready=req.rollback_ready,
        hist_similarity=req.hist_similarity
    )
