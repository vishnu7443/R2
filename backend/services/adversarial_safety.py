"""
Vector 3.0 Adversarial Safety Agent
"Before execution: Try to prove why this remediation could fail."

Actively challenges proposed actions against downstream constraints, resource ceilings,
flapping oscillation, and downstream connection pool saturation.
"""

from typing import Dict, Any, List, Optional
import time

class AdversarialSafetyAgent:
    """
    Adversarial challenger that simulates potential failure modes of candidate remediations.
    Deterministic, explainable, and defensive.
    """

    def __init__(self):
        # Default enterprise cluster constraints
        self.default_cluster_limits = {
            "db_max_connections": 100,
            "db_active_connections": 62,
            "conns_per_pod": 16,
            "node_memory_headroom_mb": 1400.0,
            "pod_memory_mb": 512.0,
            "min_action_cooldown_sec": 180,
            "downstream_health": {
                "erp-db": {"cpu": 68.0, "status": "HEALTHY"},
                "erp-inventory": {"cpu": 82.0, "status": "DEGRADED"}
            }
        }

    def evaluate_candidate_action(
        self,
        service_name: str,
        proposed_action: str,
        action_spec: Dict[str, Any],
        cluster_state: Optional[Dict[str, Any]] = None,
        last_action_timestamp: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Runs adversarial probes against the proposed remediation.
        """
        state = {**self.default_cluster_limits, **(cluster_state or {})}
        challenges: List[Dict[str, Any]] = []
        mitigations: List[str] = []

        action_type = proposed_action.lower()
        target_replicas = action_spec.get("target_replicas", 4)
        current_replicas = action_spec.get("current_replicas", 2)
        added_replicas = max(0, target_replicas - current_replicas)

        # Probe 1: Downstream Database Connection Pool Saturation
        if "scale" in action_type:
            projected_db_conns = state["db_active_connections"] + (added_replicas * state["conns_per_pod"])
            db_limit = state["db_max_connections"]
            if projected_db_conns > db_limit:
                deficit = projected_db_conns - db_limit
                challenges.append({
                    "probe_id": "ADV-PROBE-01",
                    "severity": "CRITICAL",
                    "category": "DOWNSTREAM_RESOURCE_SATURATION",
                    "target_subsystem": "PostgreSQL Connection Pool",
                    "failure_hypothesis": (
                        f"Scaling {service_name} from {current_replicas} to {target_replicas} adds "
                        f"{added_replicas * state['conns_per_pod']} connections, projecting total connections "
                        f"to {projected_db_conns} which exceeds DB pool ceiling ({db_limit})."
                    ),
                    "evidence": {
                        "db_active_connections": state["db_active_connections"],
                        "projected_connections": projected_db_conns,
                        "pool_ceiling": db_limit,
                        "deficit": deficit
                    },
                    "rejection_impact": "Downstream DB connection pool exhaustion (HTTP 503 / FATAL: too many clients)"
                })
                mitigations.append(
                    f"Cap target replicas to {current_replicas + (db_limit - state['db_active_connections']) // state['conns_per_pod']} "
                    "or enable PgBouncer transaction pooling before scaling."
                )

        # Probe 2: Node Memory Headroom Depletion
        if added_replicas > 0:
            required_mem_mb = added_replicas * state["pod_memory_mb"]
            available_mem_mb = state["node_memory_headroom_mb"]
            if required_mem_mb > available_mem_mb:
                challenges.append({
                    "probe_id": "ADV-PROBE-02",
                    "severity": "CRITICAL",
                    "category": "NODE_RESOURCE_EXHAUSTION",
                    "target_subsystem": "Kubelet Memory Allocator",
                    "failure_hypothesis": (
                        f"Allocating {added_replicas} new pods requires {required_mem_mb} MB, "
                        f"exceeding available worker node memory headroom ({available_mem_mb} MB)."
                    ),
                    "evidence": {
                        "required_memory_mb": required_mem_mb,
                        "node_memory_headroom_mb": available_mem_mb,
                        "headroom_deficit_mb": round(required_mem_mb - available_mem_mb, 1)
                    },
                    "rejection_impact": "Pod eviction storms or OOMKill on co-located production workloads"
                })
                mitigations.append(
                    "Deploy to high-memory worker node pool or provision an additional cluster node via Cluster Autoscaler."
                )

        # Probe 3: Flapping / Rapid Oscillation Risk
        if last_action_timestamp:
            elapsed = time.time() - last_action_timestamp
            cooldown = state["min_action_cooldown_sec"]
            if elapsed < cooldown:
                challenges.append({
                    "probe_id": "ADV-PROBE-03",
                    "severity": "HIGH",
                    "category": "METRIC_FLAPPING_INSTABILITY",
                    "target_subsystem": "Control Loop Governor",
                    "failure_hypothesis": (
                        f"Previous remediation occurred {int(elapsed)}s ago. "
                        f"Enforcing minimum stabilization cooldown of {cooldown}s to prevent control-loop oscillation."
                    ),
                    "evidence": {
                        "elapsed_seconds": int(elapsed),
                        "required_cooldown_seconds": cooldown
                    },
                    "rejection_impact": "Pod thrashing, route cache invalidation storms, and telemetry distortion"
                })
                mitigations.append(
                    f"Hold remediation for {int(cooldown - elapsed)}s until stabilization window closes."
                )

        # Probe 4: Downstream Degraded Service Overload (Thundering Herd)
        for dep_name, dep_info in state.get("downstream_health", {}).items():
            if dep_info.get("status") == "DEGRADED" and dep_info.get("cpu", 0) > 80.0:
                challenges.append({
                    "probe_id": "ADV-PROBE-04",
                    "severity": "HIGH",
                    "category": "DOWNSTREAM_CASCADE_RISK",
                    "target_subsystem": f"Dependency {dep_name}",
                    "failure_hypothesis": (
                        f"Downstream dependency '{dep_name}' is already DEGRADED ({dep_info.get('cpu')}% CPU). "
                        f"Scaling upstream {service_name} will increase request dispatch rate to {dep_name}, "
                        "triggering a total downstream outage."
                    ),
                    "evidence": dep_info,
                    "rejection_impact": f"Total outage cascade of {dep_name}"
                })
                mitigations.append(
                    f"Enable rate limiting / circuit breaking on ingress to '{dep_name}' prior to scaling."
                )

        # Formulate Decision
        has_critical = any(c["severity"] == "CRITICAL" for c in challenges)
        has_high = any(c["severity"] == "HIGH" for c in challenges)

        if has_critical:
            verdict = "REJECTED"
            action_allowed = False
        elif has_high:
            verdict = "CHALLENGED_CONDITIONAL"
            action_allowed = False  # Requires explicit human override or mitigation
        else:
            verdict = "PASSED"
            action_allowed = True

        return {
            "verdict": verdict,
            "action_allowed": action_allowed,
            "service_name": service_name,
            "proposed_action": proposed_action,
            "total_challenges_identified": len(challenges),
            "challenges": challenges,
            "required_mitigations": mitigations,
            "adversarial_assessment": (
                "Adversarial safety agent INVALIDATED proposed action: "
                + "; ".join(c["failure_hypothesis"] for c in challenges)
                if challenges else
                "Adversarial agent found ZERO structural failure modes. Plan is safe to execute."
            )
        }

adversarial_agent = AdversarialSafetyAgent()
