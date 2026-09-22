import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Append parent dir to sys.path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database import Base
from backend.models import Prediction, CandidateAction, Policy
from backend.services.infra_adapters import MockKubernetesAdapter, get_kubernetes_adapter
from backend.services.prediction_service import calculate_linear_slope
from backend.services.assurance_service import evaluate_candidate_assurance

# Setup in-memory SQLite for testing database operations
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_linear_slope_calculation():
    # Linear upward trend
    y_vals = [10, 12, 14, 16, 18]
    slope = calculate_linear_slope(y_vals)
    assert slope == 2.0
    
    # Flat line
    flat_vals = [50, 50, 50, 50, 50]
    flat_slope = calculate_linear_slope(flat_vals)
    assert flat_slope == 0.0

def test_mock_kubernetes_adapter():
    adapter = MockKubernetesAdapter()
    workloads = adapter.get_workloads()
    
    # Assert initial baseline configuration is loaded
    assert len(workloads) == 8
    target_svc = next(w for w in workloads if w["name"] == "shop-frontend")
    assert target_svc["replicas"] == 3
    
    # Assert scale logic works
    scaled = adapter.scale_deployment("shop-frontend", 5)
    assert scaled is True
    assert adapter.workloads["shop-frontend"]["replicas"] == 5
    assert len(adapter.workloads["shop-frontend"]["pods"]) == 5

def test_assurance_scoring_logic(db_session):
    # Initialize basic policies
    policies = [
        Policy(id="pol-auto-scale", category="Automation", name="Auto Scaling Permitted", value={"allowed": True}, enabled=True),
        Policy(id="pol-max-replicas", category="Resource", name="Maximum Deployment Replicas", value={"limit": 8}, enabled=True),
        Policy(id="pol-db-restart", category="Approval", name="Database Restart Restrictions", value={"requires_approval": True}, enabled=True)
    ]
    for p in policies:
        db_session.add(p)
        
    # Setup mock prediction context
    prediction = Prediction(
        id="test-pred-1",
        service_name="payment-service",
        metric_name="cpu",
        current_value=85.0,
        predicted_value=96.0,
        forecast_window_seconds=300,
        confidence_score=0.92,
        risk_level="High",
        trend="Rising"
    )
    db_session.add(prediction)
    
    # Setup mock candidate action
    candidate = CandidateAction(
        id="test-cand-1",
        prediction_id="test-pred-1",
        action_name="Scale Deployment",
        category="Scaling",
        estimated_impact="High",
        estimated_duration_seconds=20,
        resource_cost="Medium",
        rank=1
    )
    db_session.add(candidate)
    db_session.commit()
    
    # Evaluate decision assurance
    decision = evaluate_candidate_assurance("test-cand-1", db_session)
    
    assert decision is not None
    assert decision.decision_score > 0
    assert decision.policy_status == "PASS"
    assert decision.final_decision in ["AUTO_EXECUTE", "HUMAN_APPROVAL"]
