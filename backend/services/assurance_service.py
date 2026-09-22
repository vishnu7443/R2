import uuid
import datetime
from sqlalchemy.orm import Session
from ..models import CandidateAction, Prediction, Decision, Policy, TimelineEvent

def evaluate_candidate_assurance(candidate_id: str, db: Session) -> Decision:
    """
    Core USP: Evaluates the candidate action across 5 trust dimensions:
    Confidence, Risk, Policy, Digital Twin Simulation, and Rollback Readiness.
    """
    # Check if evaluation already exists
    existing_decision = db.query(Decision).filter(Decision.candidate_id == candidate_id).first()
    if existing_decision:
        return existing_decision

    candidate = db.query(CandidateAction).filter(CandidateAction.id == candidate_id).first()
    if not candidate:
        return None
        
    pred = db.query(Prediction).filter(Prediction.id == candidate.prediction_id).first()
    if not pred:
        return None

    service = pred.service_name
    category = candidate.category
    action_name = candidate.action_name

    # 1. Confidence Evaluator (0 to 100)
    # Heuristics combining prediction confidence and historical success
    pred_conf = pred.confidence_score * 100
    hist_success = 92.0 if category == "Scaling" else (85.0 if category == "Restart" else 60.0)
    conf_score = round((pred_conf * 0.6) + (hist_success * 0.4), 1)

    # 2. Risk Evaluator (0 to 100, where 0 is safest)
    # High impact operations have higher risk scores
    base_risk = {
        "Scaling": 15.0,
        "Configuration": 40.0,
        "Restart": 25.0,
        "Migration": 55.0,
        "No Action": 10.0
    }.get(category, 30.0)
    
    # Restarting database contains extreme risk
    if "database" in service.lower() and category == "Restart":
        base_risk = 85.0
        
    risk_score = round(base_risk + (20.0 if pred.risk_level == "Critical" else 5.0), 1)

    # 3. Policy Compliance Evaluator (0 or 100)
    policy_score = 100.0
    policy_status = "PASS"
    
    # Query policies from database
    auto_scale_policy = db.query(Policy).filter(Policy.id == "pol-auto-scale").first()
    max_replicas_policy = db.query(Policy).filter(Policy.id == "pol-max-replicas").first()
    db_restart_policy = db.query(Policy).filter(Policy.id == "pol-db-restart").first()
    
    if category == "Scaling":
        if auto_scale_policy and not auto_scale_policy.enabled:
            policy_score = 0.0
            policy_status = "FAIL"
        elif max_replicas_policy and max_replicas_policy.enabled:
            limit = max_replicas_policy.value.get("limit", 8)
            # Find current replicas
            from .infra_adapters import get_kubernetes_adapter
            adapter = get_kubernetes_adapter()
            workload = next((w for w in adapter.get_workloads() if w["name"] == service), None)
            if workload and workload["replicas"] >= limit:
                policy_score = 50.0 # Requires approval if limit hit
                policy_status = "REQUIRES_APPROVAL"
                
    elif category == "Restart" and "database" in service.lower():
        if db_restart_policy and db_restart_policy.enabled and db_restart_policy.value.get("requires_approval", True):
            policy_score = 50.0
            policy_status = "REQUIRES_APPROVAL"

    # 4. Digital Twin Simulation Evaluator (0 to 100)
    # Predict metric values after applying action
    simulation_result = {}
    sim_score = 50.0
    
    if category == "Scaling":
        # Scaling increases capacity and drops utilization
        estimated_cpu = round(pred.current_value * 0.6, 1)
        estimated_latency = 15.0
        simulation_result = {
            "pre_action": {pred.metric_name: pred.current_value},
            "post_action": {pred.metric_name: estimated_cpu, "latency": estimated_latency}
        }
        sim_score = 95.0 # Great outcome
    elif category == "Restart":
        # Restarts release memory leaks but causes temporary latency jump
        simulation_result = {
            "pre_action": {pred.metric_name: pred.current_value},
            "post_action": {pred.metric_name: 35.0, "latency": 150.0} # Temp spike
        }
        sim_score = 88.0
    elif category == "No Action":
        # Keep metric at critical level
        simulation_result = {
            "pre_action": {pred.metric_name: pred.current_value},
            "post_action": {pred.metric_name: pred.predicted_value}
        }
        sim_score = 20.0 # Poor outcome
    else:
        simulation_result = {
            "pre_action": {pred.metric_name: pred.current_value},
            "post_action": {pred.metric_name: pred.current_value}
        }
        sim_score = 65.0

    # 5. Rollback Readiness Evaluator (0 to 100)
    # Checks if reversing the change is supported and how complex
    if category == "Scaling":
        rollback_ready = True
        rollback_score = 90.0
    elif category == "Restart":
        rollback_ready = False # Can't un-kill a process
        rollback_score = 20.0
    elif category == "No Action":
        rollback_ready = True
        rollback_score = 100.0
    else:
        rollback_ready = True
        rollback_score = 70.0

    # Apply Decision Context Service
    from .decision_context_service import get_decision_context
    context = get_decision_context(service)
    
    # Context adjustments
    if context.get("in_maintenance_window") and category != "No Action":
        policy_score = 0.0
        policy_status = "FAIL"
        
    if category == "Scaling" and not context.get("sufficient_capacity_for_scaling"):
        risk_score = min(risk_score + 30.0, 100.0) # High risk if cluster is full
        
    if context.get("criticality") == "Critical":
        risk_score = min(risk_score + 10.0, 100.0)

    # Composite Decision Score Calculation
    # Weights: 30% Confidence, 25% Inverse Risk, 20% Policy, 15% Simulation, 10% Rollback
    inverse_risk = 100.0 - risk_score
    decision_score = (
        (conf_score * 0.30) + 
        (inverse_risk * 0.25) + 
        (policy_score * 0.20) + 
        (sim_score * 0.15) + 
        (rollback_score * 0.10)
    )
    decision_score = round(decision_score, 1)

    # Check active simulation severity for this service
    from .metrics_service import active_simulations
    sim_info = active_simulations.get(service, {})
    sim_severity = sim_info.get("severity", "").upper()
    risk_lvl = pred.risk_level.upper() if pred.risk_level else "MEDIUM"

    # Determine recommended path based on severity requirements:
    # HIGH / CRITICAL -> HUMAN_APPROVAL
    # MEDIUM / LOW -> AUTO_EXECUTE
    is_low_medium = (sim_severity in ["LOW", "MEDIUM"] or risk_lvl in ["LOW", "MEDIUM"])
    
    if policy_status == "FAIL":
        final_decision = "REJECTED"
    elif is_low_medium:
        final_decision = "AUTO_EXECUTE"
    elif policy_status == "REQUIRES_APPROVAL":
        final_decision = "HUMAN_APPROVAL"
    elif sim_severity == "HIGH" or risk_lvl in ["HIGH", "CRITICAL"]:
        final_decision = "HUMAN_APPROVAL"
    elif decision_score >= 70.0:
        final_decision = "AUTO_EXECUTE"
    elif decision_score >= 65.0:
        final_decision = "HUMAN_APPROVAL"
    else:
        final_decision = "REJECTED"

    status = "APPROVED" if final_decision == "AUTO_EXECUTE" else ("PENDING_APPROVAL" if final_decision == "HUMAN_APPROVAL" else "REJECTED")
    
    # Check if a decision record already exists for this candidate
    existing_dec = db.query(Decision).filter(Decision.candidate_id == candidate_id).first()
    if existing_dec:
        existing_dec.timestamp = datetime.datetime.utcnow()
        existing_dec.confidence_score = conf_score
        existing_dec.risk_score = risk_score
        existing_dec.policy_status = policy_status
        existing_dec.simulation_result = simulation_result
        existing_dec.rollback_ready = rollback_ready
        existing_dec.decision_score = decision_score
        existing_dec.final_decision = final_decision
        if sim_info.get("active"):
            existing_dec.status = status
        decision = existing_dec
    else:
        decision_id = f"dec-{str(uuid.uuid4())[:8]}"
        decision = Decision(
            id=decision_id,
            candidate_id=candidate_id,
            prediction_id=candidate.prediction_id,
            timestamp=datetime.datetime.utcnow(),
            confidence_score=conf_score,
            risk_score=risk_score,
            policy_status=policy_status,
            simulation_result=simulation_result,
            rollback_ready=rollback_ready,
            decision_score=decision_score,
            final_decision=final_decision,
            status=status
        )
        db.add(decision)
    
    db.commit()

    if status == "PENDING_APPROVAL" or risk_score >= 50.0:
        try:
            from .notification_service import send_telegram_approval_request
            send_telegram_approval_request(
                decision_id=decision.id,
                service_name=service,
                action_name=action_name,
                risk_score=risk_score,
                details=f"High Risk Decision evaluated ({final_decision}). Manual SRE approval required."
            )
        except Exception as e:
            print(" [!] Telegram approval dispatch notice:", e)

    return decision
