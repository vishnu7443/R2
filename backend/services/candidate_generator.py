import uuid
import datetime
from sqlalchemy.orm import Session
from ..models import Prediction, CandidateAction, TimelineEvent

# Templates mapping failure metrics and trends to candidates
ACTION_TEMPLATES = {
    "cpu": [
        {
            "action_name": "Scale Deployment",
            "category": "Scaling",
            "estimated_impact": "High",
            "estimated_duration_seconds": 20,
            "resource_cost": "Medium",
            "rank": 1
        },
        {
            "action_name": "Increase Replicas",
            "category": "Scaling",
            "estimated_impact": "Medium",
            "estimated_duration_seconds": 15,
            "resource_cost": "Low",
            "rank": 2
        },
        {
            "action_name": "Optimize CPU Resource Limits",
            "category": "Configuration",
            "estimated_impact": "Medium",
            "estimated_duration_seconds": 30,
            "resource_cost": "High",
            "rank": 3
        },
        {
            "action_name": "Do Nothing / Monitor",
            "category": "No Action",
            "estimated_impact": "None",
            "estimated_duration_seconds": 0,
            "resource_cost": "Very Low",
            "rank": 4
        }
    ],
    "memory": [
        {
            "action_name": "Restart Service Pods",
            "category": "Restart",
            "estimated_impact": "High",
            "estimated_duration_seconds": 10,
            "resource_cost": "Very Low",
            "rank": 1
        },
        {
            "action_name": "Adjust Memory Limits",
            "category": "Configuration",
            "estimated_impact": "Medium",
            "estimated_duration_seconds": 25,
            "resource_cost": "Medium",
            "rank": 2
        },
        {
            "action_name": "Migrate Pod to Less Loaded Node",
            "category": "Migration",
            "estimated_impact": "High",
            "estimated_duration_seconds": 45,
            "resource_cost": "High",
            "rank": 3
        }
    ],
    "latency": [
        {
            "action_name": "Increase Replicas",
            "category": "Scaling",
            "estimated_impact": "High",
            "estimated_duration_seconds": 15,
            "resource_cost": "Low",
            "rank": 1
        },
        {
            "action_name": "Restart Pod",
            "category": "Restart",
            "estimated_impact": "Medium",
            "estimated_duration_seconds": 10,
            "resource_cost": "Very Low",
            "rank": 2
        }
    ]
}

def generate_candidates_for_prediction(prediction_id: str, db: Session) -> list:
    """
    Looks up the prediction, selects template action items, saves them to the DB,
    and logs proposals to the timeline log.
    """
    # Check if actions are already generated for this prediction
    existing_actions = db.query(CandidateAction).filter(CandidateAction.prediction_id == prediction_id).all()
    if existing_actions:
        unique_actions = []
        seen = set()
        for act in existing_actions:
            if act.action_name not in seen:
                seen.add(act.action_name)
                unique_actions.append(act)
        return unique_actions
        
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        pred = db.query(Prediction).order_by(Prediction.timestamp.desc()).first()
        if not pred:
            return []
        
    metric = pred.metric_name.lower()
    templates = ACTION_TEMPLATES.get(metric, ACTION_TEMPLATES["cpu"])
    
    actions = []
    proposal_log_payloads = []
    
    for t in templates:
        action_id = f"act-{str(uuid.uuid4())[:8]}"
        action = CandidateAction(
            id=action_id,
            prediction_id=prediction_id,
            timestamp=datetime.datetime.utcnow(),
            action_name=t["action_name"],
            category=t["category"],
            estimated_impact=t["estimated_impact"],
            estimated_duration_seconds=t["estimated_duration_seconds"],
            resource_cost=t["resource_cost"],
            rank=t["rank"]
        )
        db.add(action)
        actions.append(action)
        
        proposal_log_payloads.append({
            "action_id": action_id,
            "name": t["action_name"],
            "rank": t["rank"],
            "impact": t["estimated_impact"]
        })
        
    # Write Proposal Event to Timeline
    from .metrics_service import active_simulations
    timeline_id = active_simulations.get(pred.service_name, {}).get("id", prediction_id)
    
    existing_event = db.query(TimelineEvent)\
        .filter(TimelineEvent.timeline_id == timeline_id, TimelineEvent.event_type == "CANDIDATE_PROPOSAL")\
        .first()
        
    if not existing_event:
        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timeline_id=timeline_id,
            event_type="CANDIDATE_PROPOSAL",
            service_name=pred.service_name,
            payload={
                "prediction_id": prediction_id,
                "candidates": proposal_log_payloads,
                "message": f"Candidate Action Generator proposes {len(proposal_log_payloads)} remediation strategies."
            }
        )
        db.add(timeline_event)
        
    db.commit()
    return actions
