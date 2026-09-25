"""
Vector Responsible Autonomy: Governance, Safety Contracts & SRE Scorecard API Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel

from ..database import get_db
from ..services.autonomy_controller import (
    is_global_kill_switch_active,
    set_global_kill_switch,
    get_all_autonomy_settings,
    set_service_autonomy_level,
    can_execute_autonomously
)
from ..services.safety_contract import generate_safety_contract
from ..services.post_mortem_service import compute_sre_scorecard

router = APIRouter(prefix="/api/governance", tags=["Responsible Governance & Safety"])

class KillSwitchToggleRequest(BaseModel):
    engaged: bool

class AutonomyLevelRequest(BaseModel):
    service_name: str
    level: int # 0 to 5

class EvaluateContractRequest(BaseModel):
    service_name: str
    action_name: str
    current_spec: Dict[str, Any]
    target_spec: Dict[str, Any]
    risk_score: float

@router.get("/kill-switch")
def get_kill_switch():
    """Returns the current state of the Global Autonomy Kill Switch."""
    return {"kill_switch_engaged": is_global_kill_switch_active()}

@router.post("/kill-switch/toggle")
def toggle_kill_switch(req: KillSwitchToggleRequest):
    """Engages or disengages the Global Autonomy Kill Switch."""
    active = set_global_kill_switch(req.engaged)
    return {
        "status": "success",
        "kill_switch_engaged": active,
        "message": "Global Autonomy Kill Switch ENGAGED. Platform locked to advisory mode." if active else "Global Autonomy Kill Switch DISENGAGED. Autonomous execution re-enabled."
    }

@router.get("/autonomy-levels")
def list_autonomy_levels():
    """Lists per-service configured autonomy levels (L0 to L5)."""
    return get_all_autonomy_settings()

@router.post("/autonomy-levels")
def update_service_level(req: AutonomyLevelRequest):
    """Updates the autonomy level for a specific microservice."""
    try:
        lvl = set_service_autonomy_level(req.service_name, req.level)
        return {"status": "success", "service_name": req.service_name, "level": lvl}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/safety-contract/evaluate")
def evaluate_contract(req: EvaluateContractRequest):
    """
    Generates and evaluates a Remediation Safety Contract, checking 'Do No Harm' invariants
    and determining autonomous execution authorization.
    """
    contract = generate_safety_contract(
        service_name=req.service_name,
        action_name=req.action_name,
        current_spec=req.current_spec,
        target_spec=req.target_spec,
        risk_score=req.risk_score
    )
    
    can_exec, reason = can_execute_autonomously(
        service_name=req.service_name,
        action_name=req.action_name,
        risk_score=req.risk_score,
        safety_contract=contract
    )
    
    return {
        "safety_contract": contract,
        "autonomous_execution_allowed": can_exec,
        "governance_decision_reason": reason
    }

@router.get("/sre-scorecard")
def get_scorecard(db: Session = Depends(get_db)):
    """Computes and returns the operational SRE Scorecard (MTTD, MTTR-A, Success Rate, Blast Radius Avoided)."""
    return compute_sre_scorecard(db)
