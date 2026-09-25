"""
Vector Responsible Autonomy: Remediation Safety Contract & 'Do No Harm' Invariant Engine
Ensures no autonomous remediation executes without an explicit, verifiable safety contract
and strictly enforces non-negotiable architectural guardrails.
"""

import uuid
import datetime
from typing import Dict, Any, List, Optional, Tuple

# "Do No Harm" Non-negotiable architectural invariants
FORBIDDEN_OPERATIONS = [
    "DROP DATABASE",
    "TRUNCATE TABLE",
    "DELETE NAMESPACE",
    "DISABLE NETWORK POLICY",
    "MODIFY RBAC CLUSTER_ROLE",
    "EXPORT SECRETS"
]

MAX_GLOBAL_POD_CEILING = 12

def check_do_no_harm_invariants(service_name: str, action_name: str, target_spec: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Hard-coded non-negotiables that AI can NEVER override under any circumstances.
    """
    action_upper = action_name.upper()
    
    # Invariant 1: Forbidden destructive actions
    for forbidden in FORBIDDEN_OPERATIONS:
        if forbidden in action_upper:
            return False, f"Violation of 'Do No Harm' invariant: Destructive operation '{forbidden}' is strictly prohibited."

    # Invariant 2: Never restart primary stateful database without two-person human approval
    if ("db" in service_name.lower() or "database" in service_name.lower()) and "RESTART" in action_upper:
        return False, "Violation of 'Do No Harm' invariant: Master database cannot be restarted autonomously."

    # Invariant 3: Never exceed organization hard quota pod ceiling
    target_replicas = target_spec.get("target_replicas", 0)
    if target_replicas > MAX_GLOBAL_POD_CEILING:
        return False, f"Violation of 'Do No Harm' invariant: Scaling to {target_replicas} pods exceeds global organization ceiling of {MAX_GLOBAL_POD_CEILING}."

    return True, None

def generate_safety_contract(
    service_name: str,
    action_name: str,
    current_spec: Dict[str, Any],
    target_spec: Dict[str, Any],
    risk_score: float
) -> Dict[str, Any]:
    """
    Generates a deterministic Remediation Safety Contract containing expected outcomes,
    explicit abort boundaries, potential side-effect risks, and a guaranteed rollback path.
    """
    is_safe, violation_reason = check_do_no_harm_invariants(service_name, action_name, target_spec)
    
    contract_id = f"contract-{str(uuid.uuid4())[:8]}"
    curr_replicas = current_spec.get("replicas", 2)
    tgt_replicas = target_spec.get("target_replicas", curr_replicas + 2 if "Scale" in action_name else curr_replicas)
    
    # Calculate potential risks based on operation category
    potential_risks = []
    if "Scale" in action_name:
        potential_risks.append(f"Additional memory and CPU quota consumption (+{(tgt_replicas - curr_replicas) * 256}Mi)")
        potential_risks.append(f"Increased downstream database connection pressure (+{(tgt_replicas - curr_replicas) * 15} connections)")
    elif "Restart" in action_name:
        potential_risks.append("Transient 10-15s response latency spike during container warm-up")
        potential_risks.append("Temporary connection reset for in-flight requests")
    else:
        potential_risks.append("Configuration drift risk requiring schema validation")

    abort_conditions = [
        "Response latency exceeds 2,500ms post-execution",
        "Pod CrashLoopBackOff or OOMKilled detected during rollout",
        "Cluster node capacity utilization exceeds 90%"
    ]

    expected_outcomes = {
        "cpu_utilization": "< 65.0%",
        "latency_ms": "< 400.0ms",
        "error_rate": "< 1.0%"
    }

    maximum_allowed = {
        "max_service_replicas": MAX_GLOBAL_POD_CEILING,
        "max_acceptable_downtime_seconds": 0
    }

    rollback_spec = {
        "action": "Rollback Deployment",
        "target_replicas": curr_replicas,
        "previous_state": current_spec
    }

    authorization_tier = "BLOCKED" if not is_safe else ("AUTO_EXECUTE_GUARDED" if risk_score < 40.0 else "HUMAN_APPROVAL_REQUIRED")

    return {
        "contract_id": contract_id,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "service_name": service_name,
        "action_name": action_name,
        "is_valid": is_safe,
        "violation_reason": violation_reason,
        "authorization_tier": authorization_tier,
        "expected_outcomes": expected_outcomes,
        "potential_risks": potential_risks,
        "maximum_allowed_thresholds": maximum_allowed,
        "abort_conditions": abort_conditions,
        "guaranteed_rollback": rollback_spec
    }
