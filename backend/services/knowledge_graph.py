"""
Vector 3.0 Incident Knowledge Graph
Connects Incidents -> Root Causes -> Topology -> Remediation -> Effectiveness -> MTTR.
Enables multi-dimensional similarity search and evidence-weighted remediation transfer.
"""

from typing import Dict, Any, List, Optional
import math
import time

class IncidentKnowledgeGraph:
    def __init__(self):
        # Structured graph database of past enterprise incidents
        self.incidents: List[Dict[str, Any]] = [
            {
                "incident_id": "INC-8492",
                "title": "Black Friday Traffic Surge - Thread Pool Depletion",
                "service": "erp-backend",
                "category": "THREAD_POOL_EXHAUSTION",
                "telemetry_signature": {"cpu": 94.0, "latency_ms": 1820.0, "error_rate": 8.2},
                "root_cause": "Worker threads saturated by slow downstream database read lock",
                "trigger": "Surge traffic spike + unindexed inventory SKU query",
                "applied_remediation": "SCALE_REPLICAS_2_TO_4",
                "effectiveness_score": 96.5,
                "mttr_seconds": 145,
                "safety_contract_cleared": True,
                "timestamp": time.time() - 86400 * 14
            },
            {
                "incident_id": "INC-7910",
                "title": "Release v2.4.1 Memory Leak Regression",
                "service": "erp-backend",
                "category": "MEMORY_LEAK",
                "telemetry_signature": {"cpu": 88.5, "latency_ms": 940.0, "error_rate": 4.1},
                "root_cause": "Unbounded cache growth in gRPC request tracing interceptor",
                "trigger": "Deployment Commit #e4f9b2",
                "applied_remediation": "ROLLBACK_DEPLOYMENT",
                "effectiveness_score": 98.8,
                "mttr_seconds": 180,
                "safety_contract_cleared": True,
                "timestamp": time.time() - 86400 * 30
            },
            {
                "incident_id": "INC-9214",
                "title": "PostgreSQL Primary Connection Exhaustion",
                "service": "erp-db",
                "category": "DATABASE_LOCK_CONTENTION",
                "telemetry_signature": {"cpu": 96.2, "latency_ms": 3400.0, "error_rate": 18.5},
                "root_cause": "Long-running transaction blocking schema locks during schema migration",
                "trigger": "Automated Flyway migration script execution",
                "applied_remediation": "TERMINATE_BLOCKING_PID_AND_EXPAND_POOL",
                "effectiveness_score": 92.0,
                "mttr_seconds": 210,
                "safety_contract_cleared": True,
                "timestamp": time.time() - 86400 * 5
            },
            {
                "incident_id": "INC-6631",
                "title": "Auth Service Circuit Breaker Cascade",
                "service": "auth-service",
                "category": "CASCADING_DEPENDENCY_FAILURE",
                "telemetry_signature": {"cpu": 72.0, "latency_ms": 2800.0, "error_rate": 14.0},
                "root_cause": "Upstream token refresh retry storm after Redis restart",
                "trigger": "Redis master failover glitch",
                "applied_remediation": "THROTTLE_RATE_LIMITER_AND_WARM_CACHE",
                "effectiveness_score": 95.0,
                "mttr_seconds": 160,
                "safety_contract_cleared": True,
                "timestamp": time.time() - 86400 * 45
            }
        ]

    def query_similarity(
        self,
        service_name: str,
        category: str,
        current_metrics: Dict[str, float],
        top_k: int = 3
    ) -> Dict[str, Any]:
        """
        Runs multi-factor similarity matching against historical incident nodes:
        1. Service match (weight = 0.35)
        2. Root cause category match (weight = 0.35)
        3. Telemetry vector Euclidean closeness (weight = 0.30)
        """
        results = []
        curr_cpu = current_metrics.get("cpu", 90.0)
        curr_lat = current_metrics.get("latency_ms", 1500.0)
        curr_err = current_metrics.get("error_rate", 5.0)

        for inc in self.incidents:
            # Factor 1: Service match
            service_sim = 1.0 if inc["service"] == service_name else 0.4

            # Factor 2: Category match
            category_sim = 1.0 if inc["category"].lower() in category.lower() or category.lower() in inc["category"].lower() else 0.3

            # Factor 3: Metric signature proximity
            sig = inc["telemetry_signature"]
            cpu_diff = abs(sig["cpu"] - curr_cpu) / 100.0
            lat_diff = abs(sig["latency_ms"] - curr_lat) / 3000.0
            err_diff = abs(sig["error_rate"] - curr_err) / 25.0
            metric_dist = math.sqrt(cpu_diff**2 + lat_diff**2 + err_diff**2) / 1.732
            metric_sim = max(0.0, 1.0 - metric_dist)

            composite_score = round((service_sim * 0.35 + category_sim * 0.35 + metric_sim * 0.30) * 100, 1)

            results.append({
                "incident": inc,
                "similarity_score_pct": composite_score,
                "subscore_breakdown": {
                    "service_topology_proximity": round(service_sim * 100, 1),
                    "root_cause_taxonomic_match": round(category_sim * 100, 1),
                    "telemetry_signature_correlation": round(metric_sim * 100, 1)
                }
            })

        # Rank by composite score descending
        results.sort(key=lambda r: r["similarity_score_pct"], reverse=True)
        top_matches = results[:top_k]

        # Extract evidence-weighted remediation recommendation
        remediation_votes: Dict[str, Dict[str, Any]] = {}
        for match in top_matches:
            inc = match["incident"]
            act = inc["applied_remediation"]
            weight = match["similarity_score_pct"]
            if act not in remediation_votes:
                remediation_votes[act] = {
                    "action": act,
                    "weighted_score": 0.0,
                    "historical_mttr_seconds": inc["mttr_seconds"],
                    "historical_effectiveness": inc["effectiveness_score"],
                    "precedent_count": 0
                }
            remediation_votes[act]["weighted_score"] += weight
            remediation_votes[act]["precedent_count"] += 1

        ranked_remediations = sorted(remediation_votes.values(), key=lambda v: v["weighted_score"], reverse=True)

        return {
            "query_context": {
                "service": service_name,
                "category": category,
                "metrics": current_metrics
            },
            "top_historical_matches": top_matches,
            "evidence_weighted_recommendation": ranked_remediations[0] if ranked_remediations else None,
            "knowledge_graph_summary": (
                f"Identified {len(top_matches)} highly correlated organizational precedents. "
                f"Top precedent '{top_matches[0]['incident']['incident_id']}' ({top_matches[0]['similarity_score_pct']}% match) "
                f"was successfully resolved via '{top_matches[0]['incident']['applied_remediation']}' "
                f"with {top_matches[0]['incident']['effectiveness_score']}% effectiveness."
            ) if top_matches else "No historical precedents found."
        }

knowledge_graph = IncidentKnowledgeGraph()
