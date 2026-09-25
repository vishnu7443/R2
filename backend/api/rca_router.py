"""
Vector 2.0 Root Cause Analysis (RCA) & Dependency Graph API Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import RootCauseAnalysis, RemediationPlan, ChangeLogEvent
from ..services.root_cause_engine import (
    diagnose_root_cause,
    get_dependency_graph_topology,
    record_change_event
)
from ..services.remediation_planner import plan_remediation

router = APIRouter(prefix="/api/rca", tags=["Root Cause Intelligence"])

class ChangeEventRequest(BaseModel):
    service_name: str
    event_type: str # DEPLOYMENT, CONFIG_CHANGE, POD_RESTART, SCHEMA_MIGRATION
    author: Optional[str] = "sre-engineer"
    details: Dict[str, Any]

@router.get("/dependency-graph")
def get_graph():
    """Returns the full infrastructure dependency graph with node metadata and relationship links."""
    return get_dependency_graph_topology()

@router.get("/diagnose/{service_name}")
def run_diagnosis(service_name: str, incident_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Executes 5-Signal Root-Cause Analysis for the given service.
    Automatically generates a cause-aware Remediation Plan.
    """
    rca = diagnose_root_cause(service_name=service_name, db=db, incident_id=incident_id)
    plan = plan_remediation(rca=rca, db=db, prediction_id=incident_id)
    
    return {
        "rca": {
            "id": rca.id,
            "incident_id": rca.incident_id,
            "service_name": rca.service_name,
            "timestamp": rca.timestamp,
            "root_cause_title": rca.root_cause_title,
            "confidence_score": rca.confidence_score,
            "primary_signal": rca.primary_signal,
            "signals_breakdown": rca.signals_breakdown,
            "causal_chain": rca.causal_chain,
            "evidence": rca.evidence,
            "status": rca.status
        },
        "remediation_plan": {
            "id": plan.id,
            "recommended_action": plan.recommended_action,
            "category": plan.category,
            "strategy_rationale": plan.strategy_rationale,
            "candidate_actions": plan.candidate_actions
        }
    }

@router.get("/history")
def get_rca_history(limit: int = 15, db: Session = Depends(get_db)):
    """Returns chronologically ordered recent RCA diagnosis results."""
    records = db.query(RootCauseAnalysis).order_by(desc(RootCauseAnalysis.timestamp)).limit(limit).all()
    return records

@router.post("/change-events")
def create_change_event(req: ChangeEventRequest, db: Session = Depends(get_db)):
    """Records an application or infrastructure change event into the audit stream."""
    event = record_change_event(
        service_name=req.service_name,
        event_type=req.event_type,
        details=req.details,
        author=req.author,
        db=db
    )
    return {
        "status": "success",
        "event_id": event.id,
        "service_name": event.service_name,
        "event_type": event.event_type,
        "timestamp": event.timestamp
    }

@router.get("/change-events")
def list_change_events(limit: int = 20, db: Session = Depends(get_db)):
    """Lists recent deployments and configuration change events."""
    events = db.query(ChangeLogEvent).order_by(desc(ChangeLogEvent.timestamp)).limit(limit).all()
    return events
