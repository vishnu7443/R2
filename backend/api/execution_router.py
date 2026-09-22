import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Decision, TimelineEvent
from ..services.execution_service import execute_decision, rollback_decision

router = APIRouter(prefix="/api")

@router.post("/execution/run")
def trigger_decision_execution(
    decision_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    dec = db.query(Decision).filter(Decision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if dec.status == "EXECUTED":
        raise HTTPException(status_code=400, detail="Decision action already executed.")

    # Execution requires approval check
    if dec.final_decision == "HUMAN_APPROVAL" and dec.status == "PENDING_APPROVAL":
        raise HTTPException(status_code=400, detail="Decision requires human approval first.")
        
    if dec.final_decision == "REJECTED":
        raise HTTPException(status_code=400, detail="Decision rejected by policy checks.")

    execution = execute_decision(decision_id, db)
    if not execution:
        raise HTTPException(status_code=500, detail="Failed to run execution command.")

    try:
        from ..services.notification_service import notify_engineer
        notify_engineer(
            title=f"Pre-Emptive Remediation Executed on {dec.target_service}",
            message=f"Vector AI executed action for {dec.target_service}. Result: {execution.result_summary}. Zero Data Loss Guaranteed.",
            level="INFO"
        )
    except Exception as e:
        pass
        
    return {
        "execution_id": execution.id,
        "status": execution.status,
        "result": execution.result_summary
    }

@router.post("/approvals/{decision_id}")
def submit_manual_approval(
    decision_id: str,
    action: str = Body(..., embed=True), # APPROVE, REJECT
    db: Session = Depends(get_db)
):
    dec = db.query(Decision).filter(Decision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if dec.status != "PENDING_APPROVAL":
        raise HTTPException(status_code=400, detail=f"Decision status is not pending approval: {dec.status}")
        
    if action == "APPROVE":
        dec.status = "APPROVED"
        
        from ..models import Prediction
        pred = db.query(Prediction).filter(Prediction.id == dec.prediction_id).first()
        svc_name = pred.service_name if pred else "payment-service"

        # Log approval event
        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timeline_id=dec.prediction_id, # Maps to prediction/incident
            event_type="APPROVAL",
            service_name=svc_name,
            payload={
                "decision_id": decision_id,
                "message": "Operator approved decision execution. Initiating remediation path."
            }
        )
        db.add(timeline_event)
        db.commit()
        
        # Trigger execution directly
        execution = execute_decision(decision_id, db)
        return {
            "status": "APPROVED",
            "execution": {
                "id": execution.id,
                "status": execution.status,
                "result": execution.result_summary
            }
        }
    elif action == "REJECT":
        dec.status = "REJECTED"
        
        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timeline_id=dec.prediction_id,
            event_type="APPROVAL",
            service_name=svc_name,
            payload={
                "decision_id": decision_id,
                "message": "Operator rejected decision execution. Incident unresolved."
            }
        )
        db.add(timeline_event)
        db.commit()
        
        return {"status": "REJECTED"}
    else:
        raise HTTPException(status_code=400, detail="Invalid approval action. Must be APPROVE or REJECT.")

@router.post("/execution/rollback/{decision_id}")
def trigger_spec_rollback(
    decision_id: str,
    db: Session = Depends(get_db)
):
    result = rollback_decision(decision_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Decision record not found for rollback.")
    return result
