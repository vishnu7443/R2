from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import User, Project, Policy, TimelineEvent, InfrastructureMetric
import uuid
import random

router = APIRouter(prefix="/api/projects")

class RegisterUserRequest(BaseModel):
    username: str
    email: str

class ConnectProjectRequest(BaseModel):
    user_id: str
    project_slug: str
    project_name: str
    github_repo: str
    vercel_url: str

@router.post("/register-user")
def register_user(req: RegisterUserRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
    if existing:
        return {
            "status": "ok",
            "user_id": existing.id,
            "username": existing.username,
            "email": existing.email,
            "message": "User already registered"
        }
    
    new_user = User(
        id=f"usr_{uuid.uuid4().hex[:12]}",
        username=req.username,
        email=req.email,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "status": "ok",
        "user_id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "message": "User registered successfully"
    }

@router.post("/connect")
def connect_project(req: ConnectProjectRequest, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if project already exists
    existing_project = db.query(Project).filter(Project.id == req.project_slug).first()
    if existing_project:
        return {
            "status": "ok",
            "project_id": existing_project.id,
            "name": existing_project.name,
            "message": "Project already connected"
        }
        
    # Create new project
    new_project = Project(
        id=req.project_slug, # e.g. "inventraerp"
        name=req.project_name,
        user_id=req.user_id,
        github_repo=req.github_repo,
        vercel_project=req.vercel_url,
        created_at=datetime.utcnow()
    )
    db.add(new_project)
    
    # Let's seed initial metrics and a policy for this client project
    services = ["erp-frontend", "erp-db"]
    baselines = {
        "erp-frontend": {"cpu": 20.0, "memory": 30.0, "network": 1500.0, "latency": 40.0},
        "erp-core": {"cpu": 35.0, "memory": 50.0, "network": 2200.0, "latency": 25.0},
        "erp-inventory": {"cpu": 15.0, "memory": 25.0, "network": 600.0, "latency": 12.0},
        "erp-db": {"cpu": 40.0, "memory": 60.0, "network": 800.0, "latency": 8.0}
    }
    
    # Generate some history metrics so the charts show data immediately
    for svc in services:
        base = baselines[svc]
        for minutes_ago in range(30, 0, -2):
            ts = datetime.utcnow() - timedelta_wrapper(minutes=minutes_ago)
            metric_entry = InfrastructureMetric(
                timestamp=ts,
                service_name=svc,
                cpu_utilization=round(base["cpu"] + random.uniform(-2.0, 2.0), 2),
                memory_utilization=round(base["memory"] + random.uniform(-1.0, 1.0), 2),
                network_throughput=round(base["network"] + random.uniform(-30.0, 30.0), 2),
                latency_ms=round(base["latency"] + random.uniform(-2.0, 2.0), 2),
                pod_count=2 if svc in ["erp-frontend", "erp-core"] else 1,
                node_count=5
            )
            db.add(metric_entry)
            
    # Seed an event
    init_event = TimelineEvent(
        id=str(uuid.uuid4()),
        timeline_id=f"init-{req.project_slug}",
        timestamp=datetime.utcnow(),
        event_type="BUSINESS",
        service_name="erp-frontend",
        payload={
            "action": "INTEGRATION_ESTABLISHED",
            "message": f"Successfully connected Vector SRE agents to GitHub ({req.github_repo}) and Vercel ({req.vercel_url})",
            "source": "vector"
        }
    )
    db.add(init_event)
    
    db.commit()
    return {
        "status": "ok",
        "project_id": new_project.id,
        "name": new_project.name,
        "message": f"Project {new_project.name} connected successfully with Vector"
    }

@router.get("/list/{user_id}")
def list_projects(user_id: str, db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == user_id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "github_repo": p.github_repo,
            "vercel_project": p.vercel_project,
            "created_at": str(p.created_at)
        } for p in projects
    ]

def timedelta_wrapper(minutes: int):
    import datetime as dt
    return dt.timedelta(minutes=minutes)
