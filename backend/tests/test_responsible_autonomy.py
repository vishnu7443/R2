"""
Unit & Integration Tests for Vector Responsible Autonomy:
- 'Do No Harm' Invariant Safety Checks
- Remediation Safety Contract Generation
- Global & Granular Autonomy Kill Switches
- Autonomy Level Gating (L0 to L5)
- SRE Explainability Dossier Formulation
- Operational SRE Scorecard Computation
"""

import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Append parent dir to sys.path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database import Base
from backend.services.safety_contract import (
    check_do_no_harm_invariants,
    generate_safety_contract
)
from backend.services.autonomy_controller import (
    is_global_kill_switch_active,
    set_global_kill_switch,
    get_service_autonomy_level,
    set_service_autonomy_level,
    can_execute_autonomously
)
from backend.services.evidence_engine import compile_explainability_dossier
from backend.services.post_mortem_service import compute_sre_scorecard
from backend.services.incident_kb import seed_default_knowledge_if_empty

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

def test_do_no_harm_destructive_prevention():
    # Attempting forbidden destructive operation
    safe, reason = check_do_no_harm_invariants("erp-core", "DROP DATABASE production_erp", {"target_replicas": 2})
    assert safe is False
    assert "Do No Harm" in reason

def test_do_no_harm_database_restart():
    # Attempting unverified restart on database node
    safe, reason = check_do_no_harm_invariants("erp-db", "Restart Pod erp-db-0", {"target_replicas": 1})
    assert safe is False
    assert "Master database cannot be restarted autonomously" in reason

def test_do_no_harm_pod_ceiling():
    # Attempting to scale beyond organization hard ceiling (>12)
    safe, reason = check_do_no_harm_invariants("erp-frontend", "Scale Deployment", {"target_replicas": 18})
    assert safe is False
    assert "exceeds global organization ceiling" in reason

def test_safety_contract_generation():
    contract = generate_safety_contract(
        service_name="erp-core",
        action_name="Scale Deployment Replicas",
        current_spec={"replicas": 2},
        target_spec={"target_replicas": 4},
        risk_score=25.0
    )
    assert contract["is_valid"] is True
    assert "contract_id" in contract
    assert len(contract["abort_conditions"]) >= 2
    assert len(contract["potential_risks"]) >= 2
    assert "guaranteed_rollback" in contract
    assert contract["guaranteed_rollback"]["target_replicas"] == 2

def test_global_kill_switch_behavior():
    # Normal state: Kill switch OFF
    set_global_kill_switch(False)
    contract = {"is_valid": True}
    can_exec, msg = can_execute_autonomously("erp-frontend", "Scale", 20.0, contract)
    assert can_exec is True
    
    # Engage Kill Switch
    set_global_kill_switch(True)
    assert is_global_kill_switch_active() is True
    can_exec_halted, halt_msg = can_execute_autonomously("erp-frontend", "Scale", 20.0, contract)
    assert can_exec_halted is False
    assert "Kill Switch is ENGAGED" in halt_msg
    
    # Reset
    set_global_kill_switch(False)

def test_autonomy_level_gating():
    set_global_kill_switch(False)
    contract = {"is_valid": True}
    
    # erp-db is Level 2 (Simulate only) -> Cannot execute autonomously
    can_exec, msg = can_execute_autonomously("erp-db", "Scale", 20.0, contract)
    assert can_exec is False
    assert "requires explicit human sign-off" in msg
    
    # erp-frontend is Level 5 -> Can execute autonomously
    can_exec_l5, _ = can_execute_autonomously("erp-frontend", "Scale", 20.0, contract)
    assert can_exec_l5 is True

def test_explainability_dossier_compilation():
    dossier = compile_explainability_dossier(
        service_name="erp-core",
        action_name="Scale Deployment Replicas",
        root_cause_data={
            "root_cause_title": "Backend Thread-Pool Saturation",
            "confidence_score": 91.2,
            "primary_signal": "Resource Latency Correlation",
            "evidence": ["CPU at 92.5%", "Thread saturation at 97%"]
        },
        simulation_result={"pre_action": {"cpu": 92.5}, "post_action": {"cpu": 54.0}},
        safety_contract={"potential_risks": ["Memory consumption increase"], "guaranteed_rollback": {}},
        decision_score=89.5,
        risk_score=22.0
    )
    assert "what" in dossier
    assert "why" in dossier
    assert "probable_root_cause" in dossier
    assert dossier["probable_root_cause"]["confidence_percentage"] == 91.2
    assert "why_this_action" in dossier
    assert "why_not_alternative_action" in dossier
    assert "risk_evaluation" in dossier
    assert "rollback_readiness" in dossier

def test_sre_scorecard_computation(db):
    scorecard = compute_sre_scorecard(db)
    assert "metrics" in scorecard
    metrics = scorecard["metrics"]
    assert metrics["mttd_seconds"] > 0
    assert metrics["mttd_dx_seconds"] > 0
    assert metrics["mttr_a_seconds"] > 0
    assert metrics["automation_success_rate"] >= 80.0
    assert metrics["blast_radius_avoided_count"] > 0
    assert scorecard["compliance"]["do_no_harm_invariants_held"] == "100%"
