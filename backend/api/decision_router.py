from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import Prediction, CandidateAction, Decision
from ..services.candidate_generator import generate_candidates_for_prediction
from ..services.assurance_service import evaluate_candidate_assurance

router = APIRouter(prefix="/api/decision-assurance")

@router.post("/evaluate")
def evaluate_prediction_decisions(
    prediction_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    # 1. Generate candidates if they don't exist
    candidates = generate_candidates_for_prediction(prediction_id, db)
    if not candidates:
        raise HTTPException(status_code=400, detail="Cannot generate candidates for this prediction.")
        
    # 2. Evaluate each candidate
    evaluations = []
    for cand in candidates:
        dec = evaluate_candidate_assurance(cand.id, db)
        if dec:
            evaluations.append({
                "decision_id": dec.id,
                "candidate_id": cand.id,
                "action_name": cand.action_name,
                "category": cand.category,
                "estimated_impact": cand.estimated_impact,
                "resource_cost": cand.resource_cost,
                "breakdown": {
                    "confidence": dec.confidence_score,
                    "risk": dec.risk_score,
                    "policy": dec.policy_status,
                    "simulation": dec.simulation_result,
                    "rollback": dec.rollback_ready
                },
                "decision_score": dec.decision_score,
                "final_decision": dec.final_decision,
                "status": dec.status
            })
            
    # Sort evaluations by score descending
    evaluations.sort(key=lambda x: x["decision_score"], reverse=True)
    
    # Automatically execute the best candidate if it qualifies for AUTO_EXECUTE
    if evaluations and evaluations[0]["final_decision"] == "AUTO_EXECUTE":
        if evaluations[0]["status"] not in ["EXECUTED", "EXECUTING", "SUCCEEDED", "ROLLED_BACK"]:
            from ..services.execution_service import execute_decision
            execute_decision(evaluations[0]["decision_id"], db)
            evaluations[0]["status"] = "EXECUTED"
            
    return {"prediction_id": prediction_id, "evaluations": evaluations}

@router.get("/history")
def get_decision_history(db: Session = Depends(get_db)):
    decisions = db.query(Decision).order_by(desc(Decision.timestamp)).all()
    result = []
    for d in decisions:
        cand = db.query(CandidateAction).filter(CandidateAction.id == d.candidate_id).first()
        pred = db.query(Prediction).filter(Prediction.id == d.prediction_id).first()
        result.append({
            "id": d.id,
            "timestamp": d.timestamp.isoformat(),
            "action_name": cand.action_name if cand else "Unknown",
            "service_name": pred.service_name if pred else "Unknown",
            "metric_name": pred.metric_name if pred else "Unknown",
            "decision_score": d.decision_score,
            "final_decision": d.final_decision,
            "status": d.status
        })
    return result

@router.get("/{decision_id}")
def get_decision_detail(decision_id: str, db: Session = Depends(get_db)):
    dec = db.query(Decision).filter(Decision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found.")
    cand = db.query(CandidateAction).filter(CandidateAction.id == dec.candidate_id).first()
    pred = db.query(Prediction).filter(Prediction.id == dec.prediction_id).first()
    
    return {
        "id": dec.id,
        "timestamp": dec.timestamp.isoformat(),
        "candidate": {
            "name": cand.action_name if cand else "Unknown",
            "category": cand.category if cand else "Unknown"
        } if cand else None,
        "prediction": {
            "service": pred.service_name if pred else "Unknown",
            "metric": pred.metric_name if pred else "Unknown",
            "current": pred.current_value if pred else 0.0,
            "predicted": pred.predicted_value if pred else 0.0
        } if pred else None,
        "confidence": dec.confidence_score,
        "risk": dec.risk_score,
        "policy": dec.policy_status,
        "simulation": dec.simulation_result,
        "rollback": dec.rollback_ready,
        "decision_score": dec.decision_score,
        "final_decision": dec.final_decision,
        "status": dec.status
    }
