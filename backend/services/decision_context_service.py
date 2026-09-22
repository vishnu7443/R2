import datetime
import random
from typing import Dict, Any

class DecisionContextService:
    """
    Provides real-time environmental context to enrich the decision-making 
    process of the Decision Assurance Engine.
    """
    
    @staticmethod
    def get_context(service_name: str) -> Dict[str, Any]:
        """
        Retrieves the active context for a given service.
        In a production environment, this would query Kubernetes APIs, 
        maintenance schedules (e.g., ServiceNow/Jira), and historical incident databases.
        """
        # 1. Maintenance Window Checks
        # Simulate that deployments on weekends or specific times might be locked
        now = datetime.datetime.utcnow()
        # For MVP demonstration, we won't strictly enforce a live lock unless we want to,
        # but we can simulate a boolean flag. Let's make it 5% chance of being in a maintenance window 
        # just for variety, or hardcode it based on some logic if needed.
        in_maintenance_window = False
            
        # 2. Service Criticality & Historical Context
        # This aligns with the MockKubernetesAdapter's initial values
        criticality_map = {
            "payment-service": "High",
            "auth-service": "Critical",
            "frontend-service": "Medium",
            "database-service": "Critical"
        }
        criticality = criticality_map.get(service_name, "Medium")
        
        # 3. Resource Availability (Cluster Node Capacity)
        # In a real scenario, checks if there's enough room on the cluster to scale up
        # We will simulate node capacity between 40% and 95% full
        node_capacity_used = random.uniform(40.0, 95.0)
        can_scale = node_capacity_used < 90.0

        # 4. Historical Incident Count
        # Services that crash often might require manual approval
        historical_incident_count = random.randint(0, 5)

        return {
            "service": service_name,
            "criticality": criticality,
            "in_maintenance_window": in_maintenance_window,
            "node_capacity_used_pct": round(node_capacity_used, 1),
            "sufficient_capacity_for_scaling": can_scale,
            "recent_incidents_count": historical_incident_count,
            "timestamp": now.isoformat()
        }

def get_decision_context(service_name: str) -> Dict[str, Any]:
    return DecisionContextService.get_context(service_name)
