"""
Vector 2.0 Cause-Aware Remediation Planner
Translates Root Cause Diagnoses into deterministic, ranked remediation strategies.
Eliminates symptom-blind scaling by selecting actions tailored to the specific failure mechanism.
"""

import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from ..models import RootCauseAnalysis, RemediationPlan, CandidateAction, TimelineEvent

CAUSE_REMEDIATION_MATRIX = {
    "Backend Thread-Pool Saturation": [
        {
            "action_name": "Scale Deployment Replicas",
            "category": "Scaling",
            "estimated_impact": "High",
            "estimated_duration_seconds": 25,
            "resource_cost": "Medium",
            "rank": 1,
            "rationale": "Distributes incoming synchronous requests across additional pods, instantly relieving thread pool queue backlog."
        },
        {
            "action_name": "Increase Worker Thread-Pool Limit",
            "category": "Configuration",
            "estimated_impact": "Medium",
            "estimated_duration_seconds": 40,
            "resource_cost": "Low",
            "rank": 2,
            "rationale": "Increases concurrency ceiling per container without incurring multi-pod infrastructure cost."
        },
        {
            "action_name": "Apply Dynamic Ingress Rate Limiting",
            "category": "Throttling",
            "estimated_impact": "High",
            "estimated_duration_seconds": 15,
            "resource_cost": "Very Low",
            "rank": 3,
            "rationale": "Sheds excessive non-critical traffic at the gateway to protect backend worker threads."
        }
    ],
    "Memory Leak (Unbounded Heap Growth)": [
        {
            "action_name": "Rolling Pod Restart",
            "category": "Restart",
            "estimated_impact": "High",
            "estimated_duration_seconds": 30,
            "resource_cost": "Low",
            "rank": 1,
            "rationale": "Flushes accumulated resident memory and restores baseline heap footprint immediately."
        },
        {
            "action_name": "Rollback to Previous Git Release",
            "category": "Rollback",
            "estimated_impact": "High",
            "estimated_duration_seconds": 45,
            "resource_cost": "Low",
            "rank": 2,
            "rationale": "Reverts to stable deployment version prior to the introduction of the memory defect."
        }
    ],
    "Database Connection Pool Exhaustion": [
        {
            "action_name": "Increase Database Connection Pool Size",
            "category": "Configuration",
            "estimated_impact": "High",
            "estimated_duration_seconds": 30,
            "resource_cost": "Low",
            "rank": 1,
            "rationale": "Expands pool max_connections to accommodate higher concurrent transactional bursts."
        },
        {
            "action_name": "Scale Read-Replica Deployment",
            "category": "Scaling",
            "estimated_impact": "High",
            "estimated_duration_seconds": 60,
            "resource_cost": "High",
            "rank": 2,
            "rationale": "Offloads read-heavy query load onto an auxiliary replica to alleviate primary pool contention."
        }
    ]
}

DEFAULT_STRATEGIES = [
    {
        "action_name": "Scale Deployment Replicas",
        "category": "Scaling",
        "estimated_impact": "High",
        "estimated_duration_seconds": 25,
        "resource_cost": "Medium",
        "rank": 1,
        "rationale": "Standard horizontal pod scaling to distribute external traffic surges."
    },
    {
        "action_name": "Rolling Pod Restart",
        "category": "Restart",
        "estimated_impact": "Medium",
        "estimated_duration_seconds": 30,
        "resource_cost": "Low",
        "rank": 2,
        "rationale": "Restarts unhealthy pods to clear transient deadlocks."
    }
]

def plan_remediation(
    rca: RootCauseAnalysis,
    db: Session,
    prediction_id: Optional[str] = None
) -> RemediationPlan:
    """
    Formulates a cause-aware RemediationPlan for a diagnosed RootCauseAnalysis.
    Creates and ranks CandidateAction items ready for MCDA Assurance.
    """
    cause_title = rca.root_cause_title
    service_name = rca.service_name
    
    # Match strategies from matrix or fallback to defaults
    strategies = CAUSE_REMEDIATION_MATRIX.get(cause_title, DEFAULT_STRATEGIES)
    primary = strategies[0]
    
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    
    # 1. Persist Remediation Plan
    plan_record = RemediationPlan(
        id=f"plan-{str(uuid.uuid4())[:8]}",
        rca_id=rca.id,
        timestamp=now_utc,
        recommended_action=f"{primary['action_name']} on {service_name}",
        category=primary["category"],
        strategy_rationale=primary["rationale"],
        candidate_actions=strategies
    )
    db.add(plan_record)
    
    # 2. Synchronize CandidateActions for Decision Assurance
    for item in strategies:
        cand = CandidateAction(
            id=f"cand-{str(uuid.uuid4())[:8]}",
            prediction_id=prediction_id or rca.incident_id,
            timestamp=now_utc,
            action_name=f"{item['action_name']} ({service_name})",
            category=item["category"],
            estimated_impact=item["estimated_impact"],
            estimated_duration_seconds=item["estimated_duration_seconds"],
            resource_cost=item["resource_cost"],
            rank=item["rank"]
        )
        db.add(cand)
        
    # 3. Add Timeline Event
    timeline_event = TimelineEvent(
        id=str(uuid.uuid4()),
        timeline_id=rca.incident_id,
        event_type="REMEDIATION_PLAN",
        service_name=service_name,
        payload={
            "plan_id": plan_record.id,
            "recommended_action": plan_record.recommended_action,
            "category": plan_record.category,
            "rationale": plan_record.strategy_rationale,
            "candidates_count": len(strategies),
            "message": f"Remediation Planner generated {len(strategies)} cause-aware strategies. Primary recommendation: '{plan_record.recommended_action}'."
        }
    )
    db.add(timeline_event)
    db.commit()
    
    return plan_record
