import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, ForeignKey
from .database import Base

class InfrastructureMetric(Base):
    __tablename__ = "infrastructure_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    service_name = Column(String, index=True)
    cpu_utilization = Column(Float)
    memory_utilization = Column(Float)
    network_throughput = Column(Float)
    latency_ms = Column(Float)
    pod_count = Column(Integer)
    node_count = Column(Integer)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, index=True) # UUID
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    service_name = Column(String, index=True)
    metric_name = Column(String) # cpu, memory, latency
    current_value = Column(Float)
    predicted_value = Column(Float)
    forecast_window_seconds = Column(Integer)
    confidence_score = Column(Float) # 0 to 1
    risk_level = Column(String) # Low, Medium, High, Critical
    trend = Column(String) # Rising, Stable, Falling

class CandidateAction(Base):
    __tablename__ = "candidate_actions"

    id = Column(String, primary_key=True, index=True) # UUID
    prediction_id = Column(String, ForeignKey("predictions.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action_name = Column(String) # e.g. Scale Deployment
    category = Column(String) # Scaling, Restart, Migration, Configuration, No Action
    estimated_impact = Column(String) # High, Medium, Low
    estimated_duration_seconds = Column(Integer)
    resource_cost = Column(String) # High, Medium, Low, Very Low
    rank = Column(Integer)

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, index=True) # UUID
    candidate_id = Column(String, ForeignKey("candidate_actions.id"))
    prediction_id = Column(String, ForeignKey("predictions.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    confidence_score = Column(Float)
    risk_score = Column(Float)
    policy_status = Column(String) # PASS, FAIL, REQUIRES_APPROVAL
    simulation_result = Column(JSON) # e.g., {"predicted_cpu": 58, "predicted_memory": 64}
    rollback_ready = Column(Boolean)
    previous_spec = Column(JSON, nullable=True) # e.g. {"replicas": 2, "service_name": "payment-service"}
    decision_score = Column(Float) # 0 to 100
    final_decision = Column(String) # AUTO_EXECUTE, HUMAN_APPROVAL, REJECTED
    status = Column(String, default="PENDING") # PENDING, APPROVED, EXECUTED, REJECTED, ROLLED_BACK

class Execution(Base):
    __tablename__ = "executions"

    id = Column(String, primary_key=True, index=True) # UUID
    decision_id = Column(String, ForeignKey("decisions.id"))
    action_name = Column(String)
    status = Column(String) # QUEUED, EXECUTING, SUCCEEDED, FAILED, ROLLED_BACK
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    result_summary = Column(String, nullable=True)
    previous_spec = Column(JSON, nullable=True)

class Policy(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True, index=True) # UUID
    category = Column(String) # Automation, Resource, Time, Approval
    name = Column(String, unique=True, index=True)
    value = Column(JSON) # Config parameters
    enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String, primary_key=True, index=True) # UUID
    timeline_id = Column(String, index=True) # Usually maps to a unique incident UUID
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_type = Column(String) # DETECTION, PREDICTION, CANDIDATE_PROPOSAL, ASSURANCE, APPROVAL, EXECUTION, RECOVERY
    service_name = Column(String)
    payload = Column(JSON) # Raw event details

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True) # project slug, e.g. "inventraerp"
    name = Column(String)
    user_id = Column(String, ForeignKey("users.id"))
    github_repo = Column(String)
    vercel_project = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
