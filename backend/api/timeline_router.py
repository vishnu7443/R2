from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from ..database import get_db
from ..models import TimelineEvent
import uuid

class BusinessEventRequest(BaseModel):
    service_name: str
    event_type: str = "BUSINESS"
    action: str
    message: str
    timestamp: str

router = APIRouter(prefix="/api/timeline")

@router.post("/events")
def create_external_event(req: BusinessEventRequest, db: Session = Depends(get_db)):
    try:
        dt = datetime.fromisoformat(req.timestamp.replace("Z", "+00:00"))
    except Exception:
        dt = datetime.utcnow()
        
    new_event = TimelineEvent(
        timeline_id=f"business-{datetime.utcnow().strftime('%Y%m%d')}",
        timestamp=dt,
        event_type=req.event_type,
        service_name=req.service_name,
        payload={
            "action": req.action,
            "message": req.message,
            "source": "ecommerce"
        }
    )
    db.add(new_event)
    db.commit()
    return {"status": "ok"}

@router.get("")
def list_timelines(mode: str = "standard", db: Session = Depends(get_db)):
    if mode == "ecommerce":
        services = ["shop-frontend", "shop-auth", "shop-catalog", "shop-notifications"]
    elif mode == "inventraerp":
        services = ["erp-frontend", "erp-core", "erp-inventory", "erp-db"]
    else:
        services = ["payment-service", "auth-service", "frontend-service", "database-service"]
        
    events = db.query(TimelineEvent)\
        .filter(TimelineEvent.service_name.in_(services))\
        .order_by(desc(TimelineEvent.timestamp)).all()
    
    # Fallback: if no mode-scoped events found, fetch all timeline events
    if not events:
        events = db.query(TimelineEvent).order_by(desc(TimelineEvent.timestamp)).all()
    
    grouped = {}
    for ev in events:
        tid = ev.timeline_id
        if tid not in grouped:
            grouped[tid] = {
                "timeline_id": tid,
                "service_name": ev.service_name,
                "start_time": ev.timestamp.isoformat() if ev.timestamp else "",
                "end_time": ev.timestamp.isoformat() if ev.timestamp else "",
                "incident_type": "UNKNOWN",
                "severity": "UNKNOWN",
                "resolved": False,
                "event_count": 0,
                "stages": []
            }
            
        grouped[tid]["event_count"] += 1
        if ev.event_type not in grouped[tid]["stages"]:
            grouped[tid]["stages"].append(ev.event_type)

        if ev.event_type == "DETECTION" and "incident_type" in ev.payload:
            grouped[tid]["incident_type"] = ev.payload["incident_type"].replace('_', ' ')
            grouped[tid]["severity"] = ev.payload.get("severity", "HIGH")
        elif ev.event_type == "PREDICTION":
            if "incident_type" in ev.payload:
                grouped[tid]["incident_type"] = f"PREDICTED {ev.payload['incident_type'].replace('_', ' ')}"
            elif "metric" in ev.payload:
                metric = ev.payload.get("metric", "unknown")
                incident_map = {
                    "cpu": "CPU SPIKE",
                    "memory": "MEMORY LEAK",
                    "network": "TRAFFIC SURGE"
                }
                grouped[tid]["incident_type"] = f"PREDICTED {incident_map.get(metric.lower(), f'{metric.upper()} EXHAUSTION')}"
            else:
                grouped[tid]["incident_type"] = "PREDICTED THREAT"
            grouped[tid]["severity"] = ev.payload.get("risk", ev.payload.get("severity", "HIGH")).upper()
        elif ev.event_type == "BUSINESS":
            grouped[tid]["incident_type"] = "STORE EVENT"
            grouped[tid]["severity"] = "INFO"
            grouped[tid]["resolved"] = True
        elif grouped[tid]["incident_type"] == "UNKNOWN":
            grouped[tid]["incident_type"] = f"{ev.event_type.replace('_', ' ')}"
            
        if ev.event_type in ["RECOVERY", "ROLLBACK", "EXECUTED"]:
            grouped[tid]["resolved"] = True

    return list(grouped.values())

@router.get("/events/recent")
def get_recent_timeline_events(limit: int = 10, mode: str = "standard", db: Session = Depends(get_db)):
    if mode == "ecommerce":
        services = ["shop-frontend", "shop-auth", "shop-catalog", "shop-notifications"]
    elif mode == "inventraerp":
        services = ["erp-frontend", "erp-core", "erp-inventory", "erp-db"]
    else:
        services = ["payment-service", "auth-service", "frontend-service", "database-service"]
        
    events = db.query(TimelineEvent)\
        .filter(TimelineEvent.service_name.in_(services))\
        .order_by(desc(TimelineEvent.timestamp))\
        .limit(limit)\
        .all()
        
    return [
        {
            "id": ev.id,
            "timestamp": ev.timestamp.isoformat(),
            "event_type": ev.event_type,
            "service_name": ev.service_name,
            "payload": ev.payload
        } for ev in events
    ]

@router.get("/{timeline_id}")
def get_timeline_events(timeline_id: str, db: Session = Depends(get_db)):
    events = db.query(TimelineEvent)\
        .filter(TimelineEvent.timeline_id == timeline_id)\
        .order_by(TimelineEvent.timestamp)\
        .all()
        
    if not events:
        raise HTTPException(status_code=404, detail="Timeline not found.")
        
    return [
        {
            "id": ev.id,
            "timestamp": ev.timestamp.isoformat(),
            "event_type": ev.event_type,
            "service_name": ev.service_name,
            "payload": ev.payload
        } for ev in events
    ]
