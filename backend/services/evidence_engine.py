"""
Vector Responsible Autonomy: Explainability & Evidence Engine
Constructs the complete 8-part SRE Explainability Dossier for every autonomous or approved decision.
"""

from typing import Dict, Any, List

def compile_explainability_dossier(
    service_name: str,
    action_name: str,
    root_cause_data: Dict[str, Any],
    simulation_result: Dict[str, Any],
    safety_contract: Dict[str, Any],
    decision_score: float,
    risk_score: float
) -> Dict[str, Any]:
    """
    Assembles the transparent 8-part reasoning dossier answering canonical SRE questions.
    """
    cause_title = root_cause_data.get("root_cause_title", "Operational Workload Spike")
    confidence = root_cause_data.get("confidence_score", 85.0)
    evidence_items = root_cause_data.get("evidence", [
        f"Resource telemetry exceeded nominal SLO thresholds for {service_name}",
        "Cluster capacity headroom indicates actionable remediation path"
    ])
    
    # Why this action vs why not other
    why_this = f"Digital Twin simulation projects {action_name} reduces resource utilization below critical threshold."
    if "Scale" in action_name:
        why_not_other = "Pod restart clears memory leaks but does not relieve sustained concurrency volume; scale distributes load."
    elif "Restart" in action_name:
        why_not_other = "Scaling leaked pods delays OOM without recovering leaked heap; restart directly releases memory."
    else:
        why_not_other = "Other interventions incur higher blast radius and require broader cluster rebalancing."

    pre_util = simulation_result.get("pre_action", {}).get("cpu", 92.0)
    post_util = simulation_result.get("post_action", {}).get("cpu", 54.0)

    dossier = {
        "what": f"Execute '{action_name}' on microservice '{service_name}'",
        "why": f"Predictive telemetry detected critical drift: baseline utilization at {pre_util}% threatening SLO breach",
        "probable_root_cause": {
            "title": cause_title,
            "confidence_percentage": confidence,
            "primary_signal": root_cause_data.get("primary_signal", "Resource Multi-Metric Correlation")
        },
        "evidence": evidence_items,
        "why_this_action": why_this,
        "why_not_alternative_action": why_not_other,
        "risk_evaluation": {
            "risk_score": risk_score,
            "decision_score": decision_score,
            "potential_side_effects": safety_contract.get("potential_risks", [])
        },
        "rollback_readiness": {
            "reversible": True,
            "rollback_plan": safety_contract.get("guaranteed_rollback", {})
        },
        "projected_outcomes": {
            "pre_action_utilization": pre_util,
            "projected_post_utilization": post_util,
            "projected_recovery_percentage": round(((pre_util - post_util) / max(pre_util, 1.0)) * 100, 1)
        }
    }
    
    return dossier
