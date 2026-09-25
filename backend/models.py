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

class ChangeLogEvent(Base):
    __tablename__ = "change_log_events"

    id = Column(String, primary_key=True, index=True) # UUID
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    event_type = Column(String, index=True) # DEPLOYMENT, CONFIG_CHANGE, POD_RESTART, SCHEMA_MIGRATION
    service_name = Column(String, index=True)
    author = Column(String, default="system")
    details = Column(JSON) # e.g. {"version": "v2.4.1", "commit": "a8f10b", "env": "prod"}

class RootCauseAnalysis(Base):
    __tablename__ = "root_cause_analyses"

    id = Column(String, primary_key=True, index=True) # UUID
    incident_id = Column(String, index=True)
    service_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    root_cause_title = Column(String) # e.g. "Backend Thread-Pool Saturation"
    confidence_score = Column(Float) # 0 to 100
    primary_signal = Column(String) # e.g. "Resource Multi-Metric & Change Correlation"
    signals_breakdown = Column(JSON) # {temporal: 92, dependency: 88, metric: 94, change: 81, historical: 76}
    causal_chain = Column(JSON) # ["Traffic Surge", "API Request Rate High", "Thread Pool Saturation", "Response Latency High"]
    evidence = Column(JSON) # list of human-readable bullet points
    status = Column(String, default="IDENTIFIED") # IDENTIFIED, MITIGATING, RESOLVED

class RemediationPlan(Base):
    __tablename__ = "remediation_plans"

    id = Column(String, primary_key=True, index=True) # UUID
    rca_id = Column(String, ForeignKey("root_cause_analyses.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    recommended_action = Column(String)
    category = Column(String) # Scaling, Restart, PoolResize, Throttling, Rollback
    strategy_rationale = Column(String)
    candidate_actions = Column(JSON) # Ranked list of candidates with pros/cons

class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(String, primary_key=True, index=True) # UUID
    execution_id = Column(String, ForeignKey("executions.id"))
    service_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    pre_metrics = Column(JSON) # {"cpu": 94.2, "latency_ms": 1840, "error_rate": 7.8}
    post_metrics = Column(JSON) # {"cpu": 54.1, "latency_ms": 310, "error_rate": 0.1}
    slo_thresholds = Column(JSON) # {"cpu_max": 70.0, "latency_max_ms": 500.0, "error_max": 1.0}
    effectiveness_score = Column(Float) # 0 to 100
    is_resolved = Column(Boolean)
    recommend_rollback = Column(Boolean, default=False)
    summary = Column(String)

class IncidentKnowledgeItem(Base):
    __tablename__ = "incident_knowledge_items"

    id = Column(String, primary_key=True, index=True) # UUID
    incident_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    service_name = Column(String, index=True)
    symptoms = Column(JSON)
    root_cause = Column(String)
    action_executed = Column(String)
    effectiveness_score = Column(Float)
    resolution_time_seconds = Column(Integer)
    verified = Column(Boolean, default=True)

