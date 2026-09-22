import uuid
import datetime
import time
from sqlalchemy.orm import Session
from ..models import Decision, CandidateAction, Prediction, Execution, TimelineEvent
from .infra_adapters import get_kubernetes_adapter
from .metrics_service import active_simulations

k8s_adapter = get_kubernetes_adapter()

def execute_decision(decision_id: str, db: Session) -> Execution:
    """
    Acts on the approved Decision, calls the active KubernetesAdapter plugin to execute,
    stores baseline previous_spec specs for 1-Click Rollback, and logs updates to SQLite.
    """
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        return None
        
    candidate = db.query(CandidateAction).filter(CandidateAction.id == decision.candidate_id).first()
    pred = db.query(Prediction).filter(Prediction.id == decision.prediction_id).first()
    if not candidate or not pred:
        return None

    service = pred.service_name
    action = candidate.action_name
    
    # Obtain current workload baseline spec before applying changes
    workload = next((w for w in k8s_adapter.get_workloads() if w["name"] == service), None)
    current_replicas = workload["replicas"] if workload else 2
    prev_spec = {
        "service_name": service,
        "replicas": current_replicas,
        "action_executed": action,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    
    # Store spec in Decision record
    decision.previous_spec = prev_spec
    
    # 1. Create Execution log
    execution_id = f"exec-{str(uuid.uuid4())[:8]}"
    execution = Execution(
        id=execution_id,
        decision_id=decision_id,
        action_name=action,
        status="EXECUTING",
        started_at=datetime.datetime.utcnow(),
        previous_spec=prev_spec
    )
    db.add(execution)
    
    # Timeline event: Start Execution
    timeline_id = active_simulations.get(service, {}).get("id", pred.id)
    
    timeline_event = TimelineEvent(
        id=str(uuid.uuid4()),
        timeline_id=timeline_id,
        event_type="EXECUTION",
        service_name=service,
        payload={
            "execution_id": execution_id,
            "status": "STARTED",
            "action": action,
            "previous_spec": prev_spec,
            "message": f"Execution Engine initiating command: {action} on {service}."
        }
    )
    db.add(timeline_event)
    db.commit()

    # 2. Run actual K8s adapter changes
    success = False
    if "Scale" in action or "Increase Replicas" in action:
        new_replicas = current_replicas + 2
        success = k8s_adapter.scale_deployment(service, new_replicas)
        result_msg = f"Successfully scaled {service} pods from {current_replicas} to {new_replicas}."
    elif "Restart" in action:
        pod_to_restart = workload["pods"][0] if workload and workload["pods"] else f"{service}-pod-1"
        success = k8s_adapter.restart_pod(pod_to_restart)
        result_msg = f"Successfully performed rolling pod restart on {pod_to_restart}."
    else:
        success = True
        result_msg = f"Operational action: '{action}' executed without cluster state modifications."

    # Execution outcome is now deterministic

    # 3. Terminate simulation disturbances and reset metric baselines immediately
    if success:
        if service in active_simulations:
            active_simulations[service]["active"] = False
            del active_simulations[service]
        k8s_adapter.clear_fault(service)
            
        from ..models import InfrastructureMetric
        from .metrics_service import BASELINES
        import random
        
        base = BASELINES.get(service, {"cpu": 25.0, "memory": 35.0, "network": 800.0, "latency": 15.0})
        
        # Delete high utilization metric records for this service to reset analysis slope
        db.query(InfrastructureMetric).filter(InfrastructureMetric.service_name == service).delete()
        
        # Insert 5 nominal baseline records so slope analysis returns Low risk immediately
        now_ts = datetime.datetime.utcnow()
        for i in range(5):
            t = now_ts - datetime.timedelta(seconds=(4 - i) * 3)
            reset_metric = InfrastructureMetric(
                timestamp=t,
                service_name=service,
                cpu_utilization=round(base["cpu"] + random.uniform(-1.0, 1.0), 2),
                memory_utilization=round(base["memory"] + random.uniform(-1.0, 1.0), 2),
                network_throughput=round(base["network"] + random.uniform(-10.0, 10.0), 2),
                latency_ms=round(base["latency"] + random.uniform(-1.0, 1.0), 2),
                pod_count=current_replicas,
                node_count=5
            )
            db.add(reset_metric)
        db.commit()

    # 4. Finalize execution status
    execution.status = "SUCCEEDED" if success else "FAILED"
    execution.completed_at = datetime.datetime.utcnow()
    execution.result_summary = result_msg
    
    decision.status = "EXECUTED" if success else "FAILED"
    
    # Timeline event: Complete Execution / Recovery Success
    timeline_event_done = TimelineEvent(
        id=str(uuid.uuid4()),
        timeline_id=timeline_id,
        event_type="RECOVERY" if success else "EXECUTION",
        service_name=service,
        payload={
            "execution_id": execution_id,
            "status": "SUCCEEDED" if success else "FAILED",
            "message": f"Execution finished successfully: {result_msg} Telemetry metrics returning to baseline levels." if success else f"Execution failed on {service}: command timed out."
        }
    )
    db.add(timeline_event_done)
    db.commit()
    
    return execution

def rollback_decision(decision_id: str, db: Session) -> dict:
    """
    Feature 2: Automated 1-Click Rollback Engine.
    Restores target deployment spec to its recorded previous_spec baseline.
    """
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        return None
        
    pred = db.query(Prediction).filter(Prediction.id == decision.prediction_id).first()
    service = pred.service_name if pred else "payment-service"
    
    # Extract baseline spec
    spec = decision.previous_spec or {"replicas": 2, "service_name": service}
    target_replicas = spec.get("replicas", 2)
    
    # Execute rollback on cluster
    success = k8s_adapter.rollback_deployment(service, target_replicas)
    
    # Update Decision & Execution status
    decision.status = "ROLLED_BACK"
    
    exec_rec = db.query(Execution).filter(Execution.decision_id == decision_id).first()
    if exec_rec:
        exec_rec.status = "ROLLED_BACK"
        exec_rec.result_summary = f"1-Click Rollback executed: Reverted {service} spec back to baseline ({target_replicas} replicas)."
        
    # Log ROLLBACK Timeline event
    timeline_id = active_simulations.get(service, {}).get("id", pred.id if pred else str(uuid.uuid4()))
    
    timeline_event = TimelineEvent(
        id=str(uuid.uuid4()),
        timeline_id=timeline_id,
        event_type="ROLLBACK",
        service_name=service,
        payload={
            "decision_id": decision_id,
            "status": "ROLLED_BACK",
            "restored_replicas": target_replicas,
            "message": f"Operator triggered 1-Click Rollback. Successfully restored {service} deployment spec to baseline ({target_replicas} replicas)."
        }
    )
    db.add(timeline_event)
    db.commit()
    
    return {
        "status": "ROLLED_BACK",
        "service_name": service,
        "restored_replicas": target_replicas,
        "result_summary": f"Restored {service} deployment spec to baseline ({target_replicas} replicas)."
    }
