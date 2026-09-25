"""
Vector 2.0 Incident Knowledge Base — Stores Post-Mortem Records and Learns from Past Remediations
"""

import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import IncidentKnowledgeItem

DEFAULT_KNOWLEDGE_BASE = [
    {
        "service_name": "erp-core",
        "symptoms": {"cpu": 92.0, "latency_ms": 1800.0, "error_rate": 7.5},
        "root_cause": "Backend Thread-Pool Saturation",
        "action_executed": "Scale Deployment Replicas",
        "effectiveness_score": 94.5,
        "resolution_time_seconds": 42
    },
    {
        "service_name": "erp-frontend",
        "symptoms": {"cpu": 88.0, "latency_ms": 1200.0, "error_rate": 4.2},
        "root_cause": "Traffic Spike / Concurrency Surge",
        "action_executed": "Scale Deployment Replicas",
        "effectiveness_score": 96.0,
        "resolution_time_seconds": 35
    },
    {
        "service_name": "erp-inventory",
        "symptoms": {"memory": 94.0, "latency_ms": 950.0, "error_rate": 2.0},
        "root_cause": "Memory Leak (Unbounded Heap Growth)",
        "action_executed": "Rolling Pod Restart",
        "effectiveness_score": 91.0,
        "resolution_time_seconds": 28
    },
    {
        "service_name": "erp-db",
        "symptoms": {"latency_ms": 2400.0, "error_rate": 8.0},
        "root_cause": "Database Connection Pool Exhaustion",
        "action_executed": "Increase Connection Pool Capacity",
        "effectiveness_score": 89.0,
        "resolution_time_seconds": 50
    }
]

def seed_default_knowledge_if_empty(db: Session) -> None:
    """Populates baseline incident knowledge patterns if the database table is empty."""
    count = db.query(IncidentKnowledgeItem).count()
    if count == 0:
        now = datetime.datetime.now(datetime.timezone.utc)
        for idx, item in enumerate(DEFAULT_KNOWLEDGE_BASE):
            record = IncidentKnowledgeItem(
                id=f"kb-seed-{idx+1}",
                incident_id=f"inc-seed-{1000+idx}",
                timestamp=now - datetime.timedelta(days=(idx + 1) * 2),
                service_name=item["service_name"],
                symptoms=item["symptoms"],
                root_cause=item["root_cause"],
                action_executed=item["action_executed"],
                effectiveness_score=item["effectiveness_score"],
                resolution_time_seconds=item["resolution_time_seconds"],
                verified=True
            )
            db.add(record)
        db.commit()

def record_incident_resolution(
    incident_id: str,
    service_name: str,
    symptoms: Dict[str, Any],
    root_cause: str,
    action_executed: str,
    effectiveness_score: float,
    resolution_time_seconds: int,
    db: Session
) -> IncidentKnowledgeItem:
    """Persists a verified incident resolution post-mortem into the Knowledge Base."""
    record = IncidentKnowledgeItem(
        id=f"kb-{str(uuid.uuid4())[:8]}",
        incident_id=incident_id,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        service_name=service_name,
        symptoms=symptoms,
        root_cause=root_cause,
        action_executed=action_executed,
        effectiveness_score=effectiveness_score,
        resolution_time_seconds=resolution_time_seconds,
        verified=True
    )
    db.add(record)
    db.commit()
    return record

def query_historical_patterns(service_name: str, candidate_cause: str, db: Session) -> Dict[str, Any]:
    """
    Queries past resolutions matching service and cause to produce historical evidence score (0-100).
    """
    seed_default_knowledge_if_empty(db)
    
    matches = db.query(IncidentKnowledgeItem).filter(
        IncidentKnowledgeItem.root_cause.ilike(f"%{candidate_cause}%")
    ).all()
    
    if not matches:
        return {
            "match_count": 0,
            "evidence_score": 60.0, # Default prior
            "avg_effectiveness": 75.0,
            "most_effective_action": "Scale Deployment Replicas",
            "avg_resolution_seconds": 45
        }
        
    avg_eff = sum(m.effectiveness_score for m in matches) / len(matches)
    actions = [m.action_executed for m in matches]
    best_action = max(set(actions), key=actions.count)
    avg_mttr = int(sum(m.resolution_time_seconds for m in matches) / len(matches))
    
    # Evidence score scales with number of matches and their effectiveness
    evidence_score = round(min(avg_eff * 0.9 + (len(matches) * 2.0), 98.0), 1)
    
    return {
        "match_count": len(matches),
        "evidence_score": evidence_score,
        "avg_effectiveness": round(avg_eff, 1),
        "most_effective_action": best_action,
        "avg_resolution_seconds": avg_mttr
    }
