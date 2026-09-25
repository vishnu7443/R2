"""
Unit & Integration Tests for Vector 2.0:
- Root Cause Intelligence Engine (5-Signal RCA)
- Infrastructure Dependency Graph
- Cause-Aware Remediation Planner
- Closed-Loop Verification & Effectiveness Scoring
- Incident Knowledge Base Continuous Learning
"""

import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Append parent dir to sys.path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database import Base
from backend.models import InfrastructureMetric, Execution, Decision, CandidateAction, Prediction
from backend.services.root_cause_engine import (
    diagnose_root_cause,
    get_dependency_graph_topology,
    record_change_event
)
from backend.services.remediation_planner import plan_remediation
from backend.services.verification_service import verify_execution_outcome
from backend.services.incident_kb import query_historical_patterns, seed_default_knowledge_if_empty

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    seed_default_knowledge_if_empty(session)
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_dependency_graph_topology():
    graph = get_dependency_graph_topology()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) >= 6
    
    # Assert Inventra ERP service nodes exist
    node_ids = [n["id"] for n in graph["nodes"]]
    assert "erp-frontend" in node_ids
    assert "erp-core" in node_ids
    assert "erp-db" in node_ids

def test_root_cause_diagnosis_thread_pool(db):
    # Simulate high CPU & high latency telemetry for erp-core
    for i in range(5):
        m = InfrastructureMetric(
            service_name="erp-core",
            cpu_utilization=92.5,
            memory_utilization=65.0,
            network_throughput=2450.0,
            latency_ms=1750.0,
            pod_count=2,
            node_count=3
        )
        db.add(m)
    db.commit()
    
    rca = diagnose_root_cause("erp-core", db, incident_id="test-inc-101")
    assert rca is not None
    assert rca.root_cause_title == "Backend Thread-Pool Saturation"
    assert rca.confidence_score >= 80.0
    assert len(rca.evidence) >= 3
    assert len(rca.causal_chain) >= 3

def test_cause_aware_remediation_planning(db):
    # Setup RCA
    rca = diagnose_root_cause("erp-core", db, incident_id="test-inc-102")
    plan = plan_remediation(rca, db)
    
    assert plan is not None
    assert "Scale Deployment Replicas" in plan.recommended_action
    assert plan.category == "Scaling"
    assert len(plan.candidate_actions) >= 2

def test_closed_loop_verification_and_effectiveness(db):
    # Setup mock execution context
    pred = Prediction(
        id="pred-verif-1",
        service_name="erp-core",
        metric_name="cpu",
        current_value=94.0,
        predicted_value=98.0,
        forecast_window_seconds=300,
        confidence_score=0.92,
        risk_level="Critical",
        trend="Rising"
    )
    cand = CandidateAction(
        id="cand-verif-1",
        prediction_id="pred-verif-1",
        action_name="Scale Deployment Replicas",
        category="Scaling",
        estimated_impact="High",
        estimated_duration_seconds=20,
        resource_cost="Medium",
        rank=1
    )
    dec = Decision(
        id="dec-verif-1",
        candidate_id="cand-verif-1",
        prediction_id="pred-verif-1",
        confidence_score=92.0,
        risk_score=20.0,
        policy_status="PASS",
        simulation_result={},
        rollback_ready=True,
        decision_score=88.5,
        final_decision="AUTO_EXECUTE",
        status="EXECUTED"
    )
    exec_record = Execution(
        id="exec-verif-1",
        decision_id="dec-verif-1",
        action_name="Scale Deployment Replicas",
        status="SUCCEEDED",
        previous_spec={"service_name": "erp-core", "replicas": 2}
    )
    db.add_all([pred, cand, dec, exec_record])
    
    # Add post-execution recovered telemetry (CPU: 42%, Latency: 28ms)
    for _ in range(5):
        m = InfrastructureMetric(
            service_name="erp-core",
            cpu_utilization=42.0,
            memory_utilization=48.0,
            network_throughput=1200.0,
            latency_ms=28.0,
            pod_count=4,
            node_count=3
        )
        db.add(m)
    db.commit()
    
    # Run verification
    v_result = verify_execution_outcome("exec-verif-1", db)
    assert v_result is not None
    assert v_result.is_resolved is True
    assert v_result.effectiveness_score >= 85.0
    assert v_result.recommend_rollback is False
    assert "RESOLVED" in v_result.summary

def test_knowledge_base_continuous_learning(db):
    # Query knowledge patterns
    patterns = query_historical_patterns("erp-core", "Thread-Pool", db)
    assert patterns["match_count"] >= 1
    assert patterns["evidence_score"] >= 70.0
    assert "Scale Deployment" in patterns["most_effective_action"]
