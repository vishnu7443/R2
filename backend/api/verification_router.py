"""
Vector 2.0 Post-Remediation Verification & Incident Knowledge Base API Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import VerificationResult, IncidentKnowledgeItem
from ..services.verification_service import verify_execution_outcome
from ..services.incident_kb import seed_default_knowledge_if_empty

router = APIRouter(prefix="/api/verification", tags=["Verification & Knowledge Base"])

class VerifyRequest(BaseModel):
    custom_slos: Optional[Dict[str, float]] = None

@router.post("/verify/{execution_id}")
def verify_remediation(execution_id: str, req: Optional[VerifyRequest] = None, db: Session = Depends(get_db)):
    """
    Evaluates post-execution telemetry against SLO targets to verify recovery.
    Calculates Remediation Effectiveness Score and updates the Incident Knowledge Base.
    """
    slos = req.custom_slos if req else None
    result = verify_execution_outcome(execution_id=execution_id, db=db, custom_slos=slos)
    if not result:
        raise HTTPException(status_code=404, detail=f"Execution with ID '{execution_id}' not found.")
        
    return {
        "status": "success",
        "verification": {
            "id": result.id,
            "execution_id": result.execution_id,
            "service_name": result.service_name,
            "timestamp": result.timestamp,
            "pre_metrics": result.pre_metrics,
            "post_metrics": result.post_metrics,
            "effectiveness_score": result.effectiveness_score,
            "is_resolved": result.is_resolved,
            "recommend_rollback": result.recommend_rollback,
            "summary": result.summary
        }
    }

@router.get("/history")
def get_verification_history(limit: int = 15, db: Session = Depends(get_db)):
    """Returns recent verification outcomes."""
    results = db.query(VerificationResult).order_by(desc(VerificationResult.timestamp)).limit(limit).all()
    return results

@router.get("/knowledge-base")
def get_knowledge_base(limit: int = 20, db: Session = Depends(get_db)):
    """Returns historical incident post-mortems and learning patterns."""
    seed_default_knowledge_if_empty(db)
    items = db.query(IncidentKnowledgeItem).order_by(desc(IncidentKnowledgeItem.timestamp)).limit(limit).all()
    return items
