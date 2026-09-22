import time
import random
import datetime
import threading
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import InfrastructureMetric, Policy
from .infra_adapters import get_kubernetes_adapter, get_metrics_adapter
from ..api.ingest_router import LAST_LIVE_INGEST

# Global state to track active simulations
# Format: { "service_name": { "type": "CPU_SPIKE", "severity": "HIGH", "start_time": datetime, "duration": 60, "active": True } }
active_simulations = {}

# Baseline metrics configuration
BASELINES = {
    "shop-frontend": {"cpu": 25.0, "memory": 35.0, "network": 2400.0, "latency": 70.0},
    "shop-auth": {"cpu": 30.0, "memory": 40.0, "network": 600.0, "latency": 15.0},
    "shop-catalog": {"cpu": 45.0, "memory": 55.0, "network": 1200.0, "latency": 45.0},
    "shop-notifications": {"cpu": 15.0, "memory": 20.0, "network": 400.0, "latency": 10.0},
    "erp-frontend": {"cpu": 20.0, "memory": 30.0, "network": 1500.0, "latency": 40.0},
    "erp-core": {"cpu": 35.0, "memory": 50.0, "network": 2200.0, "latency": 25.0},
    "erp-inventory": {"cpu": 15.0, "memory": 25.0, "network": 600.0, "latency": 12.0},
    "erp-db": {"cpu": 40.0, "memory": 60.0, "network": 800.0, "latency": 8.0}
}

k8s_adapter = get_kubernetes_adapter()
metrics_adapter = get_metrics_adapter()

def simulate_metrics_update():
    """
    Background worker loop that runs indefinitely, generating and persisting
    metrics for our workloads every 3 seconds. It incorporates active simulation disturbances.
    """
    db = SessionLocal()
    try:
        # Seed initial policies if empty
        seed_policies(db)
        
        while True:
            timestamp = datetime.datetime.utcnow()
            workloads = k8s_adapter.get_workloads()
            
            for workload in workloads:
                name = workload["name"]
                # If a live client agent (e.g. Inventra ERP vector_agent.py) is streaming real metrics, skip synthetic jitter
                if (time.time() - LAST_LIVE_INGEST.get(name, 0)) < 8.0:
                    continue

                replicas = workload["replicas"]
                base = BASELINES.get(name, {"cpu": 30.0, "memory": 40.0, "network": 500.0, "latency": 20.0})
                
                # Apply random jitter
                cpu = base["cpu"] + random.uniform(-2.5, 2.5)
                memory = base["memory"] + random.uniform(-1.0, 1.0)
                network = base["network"] + random.uniform(-50.0, 50.0)
                latency = base["latency"] + random.uniform(-2.0, 2.0)
                
                # Check for active simulation on this service
                sim = active_simulations.get(name)
                if sim and sim.get("active"):
                    elapsed = (timestamp - sim["start_time"]).total_seconds()
                    duration = sim["duration"]
                    
                    if elapsed >= duration:
                        # Auto recover simulation
                        sim["active"] = False
                    else:
                        # Apply incident metric multipliers based on severity
                        severity_multiplier = {
                            "LOW": 1.2,
                            "MEDIUM": 1.5,
                            "HIGH": 2.0
                        }.get(sim["severity"], 1.5)
                        
                        sim_type = sim["type"]
                        
                        if sim_type == "CPU_SPIKE":
                            # Target 90% - 98% utilization
                            target_cpu = 95.0 * severity_multiplier / 2.0
                            cpu = min(98.0, cpu + (target_cpu - cpu) * (elapsed / duration))
                            latency = latency * (1.0 + (elapsed / duration) * 3 * severity_multiplier)
                        elif sim_type == "MEMORY_LEAK":
                            # Linear memory leak
                            target_mem = 97.0
                            memory = min(99.0, memory + (target_mem - memory) * (elapsed / duration))
                        elif sim_type == "TRAFFIC_SURGE":
                            # Massive increase in traffic + CPU + latency
                            network = network * (2.5 * severity_multiplier)
                            cpu = min(95.0, cpu * (1.6 * severity_multiplier))
                            latency = latency * (2.0 * severity_multiplier)
                        elif sim_type == "POD_CRASH":
                            # Decrease functional replicas
                            if replicas > 1:
                                k8s_adapter.scale_deployment(name, replicas - 1)
                            cpu = cpu * 1.5
                            latency = latency * 2.5
                        elif sim_type == "NODE_FAILURE":
                            # Node failures reduce capacity
                            cpu = min(98.0, cpu * 1.8)
                            latency = latency * 3.0
                
                # Adjust metrics based on replica counts (e.g. more replicas lowers CPU and latency per instance)
                if name in ["shop-frontend"]:
                    baseline_replicas = 3
                elif name in ["shop-auth", "shop-catalog", "erp-frontend", "erp-core"]:
                    baseline_replicas = 2
                else:
                    baseline_replicas = 1
                if replicas != baseline_replicas:
                    ratio = baseline_replicas / replicas
                    cpu = min(98.0, cpu * ratio)
                    latency = max(2.0, latency * ratio)

                # Persist metric to SQLite
                metric_entry = InfrastructureMetric(
                    timestamp=timestamp,
                    service_name=name,
                    cpu_utilization=round(cpu, 2),
                    memory_utilization=round(memory, 2),
                    network_throughput=round(network, 2),
                    latency_ms=round(latency, 2),
                    pod_count=replicas,
                    node_count=5 # Fixed 5-node cluster
                )
                db.add(metric_entry)
                
                # Write to adapter in case metrics adapter is active
                metrics_adapter.write_metric(name, cpu, memory, network, latency, replicas)
            
            db.commit()
            
            # Prune metrics database logs older than 10 minutes to save space
            ten_minutes_ago = timestamp - datetime.timedelta(minutes=10)
            db.query(InfrastructureMetric).filter(InfrastructureMetric.timestamp < ten_minutes_ago).delete()
            db.commit()
            
            time.sleep(1)
    except Exception as e:
        print(f"Error in metrics loop: {e}")
    finally:
        db.close()

def seed_policies(db: Session):
    """
    Seeds default policy values in database if they don't exist.
    """
    default_policies = [
        {
            "id": "pol-auto-scale",
            "category": "Automation",
            "name": "Auto Scaling Permitted",
            "value": {"allowed": True},
            "enabled": True
        },
        {
            "id": "pol-max-replicas",
            "category": "Resource",
            "name": "Maximum Deployment Replicas",
            "value": {"limit": 8},
            "enabled": True
        },
        {
            "id": "pol-db-restart",
            "category": "Approval",
            "name": "Database Restart Restrictions",
            "value": {"requires_approval": True},
            "enabled": True
        },
        {
            "id": "pol-business-hours",
            "category": "Time",
            "name": "Business Hours Scale Restrictions",
            "value": {"restrict_to_business_hours": False},
            "enabled": True
        }
    ]
    for pol_data in default_policies:
        exists = db.query(Policy).filter(Policy.id == pol_data["id"]).first()
        if not exists:
            policy = Policy(**pol_data)
            db.add(policy)
    db.commit()

def start_metrics_generator():
    """
    Entry point to launch the background metrics loop.
    """
    thread = threading.Thread(target=simulate_metrics_update, daemon=True)
    thread.start()
