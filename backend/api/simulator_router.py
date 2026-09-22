import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import TimelineEvent, InfrastructureMetric, Policy
from ..services.metrics_service import active_simulations, BASELINES, k8s_adapter

router = APIRouter(prefix="/api/simulations")

@router.post("/start")
def start_simulation(
    incident_type: str = Body(..., embed=True),
    severity: str = Body(..., embed=True), # LOW, MEDIUM, HIGH
    duration_seconds: int = Body(60, embed=True),
    target_service: str = Body(..., embed=True),
    proactive_defense: bool = Body(False, embed=True),
    db: Session = Depends(get_db)
):
    valid_services = [
        "payment-service", "auth-service", "frontend-service", "database-service",
        "shop-frontend", "shop-auth", "shop-catalog", "shop-notifications",
        "paas-web-app", "paas-api-gateway", "paas-auth-proxy", "paas-db-cluster",
        "erp-frontend", "erp-core", "erp-inventory", "erp-db"
    ]
    if target_service not in valid_services:
        raise HTTPException(status_code=400, detail="Invalid target service.")
        
    valid_incidents = [
        "CPU_SPIKE", "MEMORY_LEAK", "TRAFFIC_SURGE", "POD_CRASH", "NODE_FAILURE",
        "DATABASE_DEADLOCK", "NETWORK_PARTITION", "DNS_RESOLUTION_FAILURE", "CERTIFICATE_EXPIRATION",
        "STORAGE_EXHAUSTION", "CONFIG_MISMATCH"
    ]
    if incident_type not in valid_incidents:
        raise HTTPException(status_code=400, detail="Invalid incident type.")

    # Check if a simulation is already active for this service
    if target_service in active_simulations and active_simulations[target_service].get("active"):
        raise HTTPException(status_code=400, detail=f"A simulation is already active on {target_service}.")

    incident_id = str(uuid.uuid4())
    
    active_simulations[target_service] = {
        "id": incident_id,
        "type": incident_type,
        "severity": severity,
        "start_time": datetime.datetime.utcnow(),
        "duration": duration_seconds,
        "active": True,
        "prevented": proactive_defense
    }
    
    # Save a Detection Event to the timeline
    if proactive_defense:
        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timeline_id=incident_id,
            event_type="PREDICTION",
            service_name=target_service,
            payload={
                "incident_type": incident_type,
                "severity": severity,
                "message": f"Proactively predicted and prevented {incident_type.lower().replace('_', ' ')} in {target_service} before impact.",
                "duration": duration_seconds
            }
        )
    else:
        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timeline_id=incident_id,
            event_type="DETECTION",
            service_name=target_service,
            payload={
                "incident_type": incident_type,
                "severity": severity,
                "message": f"Anomaly detected in {target_service}: anomalous {incident_type.lower().replace('_', ' ')} pattern starting.",
                "duration": duration_seconds
            }
        )
    db.add(timeline_event)
    db.commit()
    
    # Actually inject the fault into the live cluster if using live mode
    from ..services.metrics_service import k8s_adapter
    if hasattr(k8s_adapter, "inject_fault") and not proactive_defense:
        if incident_type == "CPU_SPIKE":
            k8s_adapter.inject_fault(target_service, "cpu_spike")
        elif incident_type == "TRAFFIC_SURGE":
            k8s_adapter.inject_fault(target_service, "latency")
            
    return {
        "status": "RUNNING",
        "simulation_id": incident_id,
        "service": target_service,
        "incident_type": incident_type
    }

@router.post("/stop/{service_name}")
def stop_simulation(service_name: str, db: Session = Depends(get_db)):
    if service_name in active_simulations:
        active_simulations[service_name]["active"] = False
        
        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timeline_id=active_simulations[service_name]["id"],
            event_type="RECOVERY",
            service_name=service_name,
            payload={
                "message": f"Incident simulation aborted for {service_name}. Restoring baseline operations."
            }
        )
        db.add(timeline_event)
        db.commit()
        
        from ..services.metrics_service import k8s_adapter
        if hasattr(k8s_adapter, "clear_fault"):
            k8s_adapter.clear_fault(service_name)
            
        
        return {"status": "STOPPED", "service": service_name}
    raise HTTPException(status_code=404, detail="No active simulation found for this service.")

@router.get("/status")
def get_simulation_status():
    result = []
    for service, sim in active_simulations.items():
        if sim.get("active"):
            result.append({
                "service": service,
                "id": sim["id"],
                "type": sim["type"],
                "severity": sim["severity"],
                "prevented": sim.get("prevented", False),
                "elapsed": (datetime.datetime.utcnow() - sim["start_time"]).total_seconds()
            })
    return result

@router.get("/digital-twin/topology")
def get_digital_twin_topology(mode: str = "standard", db: Session = Depends(get_db)):
    """
    Returns real-time topology layout, node connectivity, live telemetry,
    and active disturbance metadata for the Digital Twin visualization.
    """
    topologies = {
        "standard": {
            "nodes": [
                {"id": "frontend-service", "label": "Web Ingress Gateway", "role": "Frontend / Reverse Proxy", "x": 160, "y": 240, "icon": "Globe", "criticality": "High"},
                {"id": "auth-service", "label": "Authentication Service", "role": "OAuth & Token Auth", "x": 450, "y": 140, "icon": "Shield", "criticality": "Critical"},
                {"id": "payment-service", "label": "Transaction & Payments", "role": "Stripe / Checkout Worker", "x": 450, "y": 340, "icon": "Activity", "criticality": "Critical"},
                {"id": "database-service", "label": "PostgreSQL Core Cluster", "role": "Primary-Replica DB", "x": 760, "y": 240, "icon": "Database", "criticality": "Critical"},
            ],
            "edges": [
                {"source": "frontend-service", "target": "auth-service", "label": "HTTPS Auth Verify"},
                {"source": "frontend-service", "target": "payment-service", "label": "gRPC Checkout Tx"},
                {"source": "auth-service", "target": "database-service", "label": "Pool Read/Write"},
                {"source": "payment-service", "target": "database-service", "label": "ACID Commit Sync"}
            ]
        },
        "ecommerce": {
            "nodes": [
                {"id": "shop-frontend", "label": "Storefront Web Tier", "role": "React / Next.js Gateway", "x": 160, "y": 240, "icon": "Globe", "criticality": "High"},
                {"id": "shop-auth", "label": "User Auth & Identity", "role": "Session Management", "x": 450, "y": 140, "icon": "Shield", "criticality": "Critical"},
                {"id": "shop-catalog", "label": "Product Catalog API", "role": "Inventory & Search", "x": 450, "y": 340, "icon": "Database", "criticality": "High"},
                {"id": "shop-notifications", "label": "Notification & Event Hub", "role": "Kafka / Webhooks", "x": 760, "y": 240, "icon": "Activity", "criticality": "Medium"},
            ],
            "edges": [
                {"source": "shop-frontend", "target": "shop-auth", "label": "Token Validation"},
                {"source": "shop-frontend", "target": "shop-catalog", "label": "Catalog Queries"},
                {"source": "shop-catalog", "target": "shop-notifications", "label": "Order Events"},
                {"source": "shop-auth", "target": "shop-notifications", "label": "Security Alerts"}
            ]
        },
        "inventraerp": {
            "nodes": [
                {"id": "erp-frontend", "label": "ERP Web Interface", "role": "SRE Client Edge / Dashboard", "x": 160, "y": 240, "icon": "Globe", "criticality": "High"},
                {"id": "erp-core", "label": "ERP Workflow Core", "role": "Business Logic & Ledger Engine", "x": 450, "y": 140, "icon": "Cpu", "criticality": "Critical"},
                {"id": "erp-inventory", "label": "Logistics & Stock Control", "role": "Inventory & Warehouse API", "x": 450, "y": 340, "icon": "Server", "criticality": "High"},
                {"id": "erp-db", "label": "ERP Relational Database", "role": "Postgres Primary Cluster", "x": 760, "y": 240, "icon": "Database", "criticality": "Critical"},
            ],
            "edges": [
                {"source": "erp-frontend", "target": "erp-core", "label": "ERP State Machine"},
                {"source": "erp-frontend", "target": "erp-inventory", "label": "Stock Queries"},
                {"source": "erp-core", "target": "erp-db", "label": "Tx Commit Sync"},
                {"source": "erp-inventory", "target": "erp-db", "label": "Inventory Row Lock"}
            ]
        }
    }

    selected = topologies.get(mode, topologies["inventraerp" if mode == "inventraerp" else "standard"])
    workloads = {w["name"]: w for w in k8s_adapter.get_workloads()} if hasattr(k8s_adapter, "get_workloads") else {}

    enriched_nodes = []
    for n in selected["nodes"]:
        node_id = n["id"]
        metric = db.query(InfrastructureMetric).filter(InfrastructureMetric.service_name == node_id).order_by(desc(InfrastructureMetric.timestamp)).first()
        baseline = BASELINES.get(node_id, {"cpu": 25.0, "memory": 35.0, "network": 800.0, "latency": 25.0})
        workload = workloads.get(node_id, {})

        cpu = round(metric.cpu_utilization if metric else baseline["cpu"], 1)
        mem = round(metric.memory_utilization if metric else baseline["memory"], 1)
        lat = round(metric.latency_ms if metric else baseline["latency"], 1)
        net = round(metric.network_throughput if metric else baseline["network"], 1)
        pods = workload.get("replicas", metric.pod_count if metric else 2)
        max_pods = workload.get("max_replicas", 8)
        crit = workload.get("criticality", n.get("criticality", "High"))

        sim = active_simulations.get(node_id, {})
        if sim.get("active"):
            status = "protected" if sim.get("prevented") else "degraded"
        elif cpu > 85.0 or mem > 85.0 or lat > 180.0:
            status = "degraded"
        elif cpu > 70.0 or mem > 70.0:
            status = "warning"
        else:
            status = "healthy"

        enriched_nodes.append({
            **n,
            "cpu": cpu,
            "memory": mem,
            "latency": lat,
            "network": net,
            "replicas": pods,
            "max_replicas": max_pods,
            "criticality": crit,
            "status": status,
            "active_sim": sim if sim.get("active") else None
        })

    return {
        "mode": mode,
        "nodes": enriched_nodes,
        "edges": selected["edges"],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/digital-twin/what-if")
def simulate_digital_twin_scenario(
    service_name: str = Body(..., embed=True),
    scenario: str = Body("SCALE", embed=True), # SCALE, CHAOS_SPIKE, TRAFFIC_SHOCK, RESTART
    target_replicas: int = Body(None, embed=True),
    fault_type: str = Body("CPU_SPIKE", embed=True),
    traffic_multiplier: float = Body(2.0, embed=True),
    db: Session = Depends(get_db)
):
    """
    Executes a Proportional State-Space Projection Model on the Digital Twin sandbox.
    Calculates projected post-action telemetry, blast radius propagation,
    and 5D decision assurance scores before touching live infrastructure.
    """
    metric = db.query(InfrastructureMetric).filter(InfrastructureMetric.service_name == service_name).order_by(desc(InfrastructureMetric.timestamp)).first()
    baseline = BASELINES.get(service_name, {"cpu": 30.0, "memory": 40.0, "latency": 25.0, "network": 1000.0})
    workloads = {w["name"]: w for w in k8s_adapter.get_workloads()} if hasattr(k8s_adapter, "get_workloads") else {}
    workload = workloads.get(service_name, {})

    curr_cpu = round(metric.cpu_utilization if metric else baseline["cpu"], 1)
    curr_mem = round(metric.memory_utilization if metric else baseline["memory"], 1)
    curr_lat = round(metric.latency_ms if metric else baseline["latency"], 1)
    curr_net = round(metric.network_throughput if metric else baseline["network"], 1)
    curr_pods = workload.get("replicas", 2)
    max_pods = workload.get("max_replicas", 8)

    if scenario == "SCALE":
        t_pods = target_replicas if target_replicas is not None else min(max_pods, curr_pods + 2)
        t_pods = max(1, min(16, t_pods))
        ratio = curr_pods / t_pods
        proj_cpu = round(max(8.0, min(99.0, curr_cpu * ratio)), 1)
        proj_mem = round(max(15.0, min(99.0, curr_mem * (0.35 + 0.65 * ratio))), 1)
        proj_lat = round(max(6.0, curr_lat * (ratio ** 0.7)), 1)
        proj_net = round(curr_net * 1.05, 1)
        proj_pods = t_pods

        cost_delta = round((t_pods - curr_pods) * 0.045, 3)
        stability = "High Resilience" if proj_cpu < 60.0 else "Nominal"

        conf = 95.0
        risk = 12.0 if t_pods <= max_pods else 35.0
        policy_pass = t_pods <= max_pods
        pol_score = 100.0 if policy_pass else 50.0
        twin_score = 96.0
        rollback = 92.0
        
    elif scenario == "CHAOS_SPIKE":
        proj_pods = curr_pods
        if fault_type == "CPU_SPIKE":
            proj_cpu = min(98.5, round(curr_cpu + 55.0, 1))
            proj_mem = round(curr_mem + 10.0, 1)
            proj_lat = round(curr_lat * 2.2, 1)
        elif fault_type == "MEMORY_LEAK":
            proj_cpu = round(curr_cpu + 15.0, 1)
            proj_mem = min(99.0, round(curr_mem + 50.0, 1))
            proj_lat = round(curr_lat * 2.8, 1)
        elif fault_type == "DATABASE_DEADLOCK":
            proj_cpu = min(99.0, round(curr_cpu + 40.0, 1))
            proj_mem = min(95.0, round(curr_mem + 30.0, 1))
            proj_lat = round(curr_lat * 6.5, 1)
        else:
            proj_cpu = min(98.0, round(curr_cpu + 35.0, 1))
            proj_mem = min(95.0, round(curr_mem + 35.0, 1))
            proj_lat = round(curr_lat * 3.0, 1)
            
        proj_net = round(curr_net * 0.8, 1)
        cost_delta = 0.0
        stability = "Critical Risk (Degrading)"

        conf = 88.0
        risk = 82.0
        pol_score = 40.0
        twin_score = 35.0
        rollback = 80.0

    elif scenario == "TRAFFIC_SHOCK":
        proj_pods = curr_pods
        mult = max(1.0, traffic_multiplier)
        proj_cpu = min(99.0, round(curr_cpu * (mult ** 0.55), 1))
        proj_mem = min(95.0, round(curr_mem * (mult ** 0.35), 1))
        proj_lat = round(curr_lat * (mult ** 0.9), 1)
        proj_net = round(curr_net * mult, 1)
        cost_delta = 0.0
        stability = "Severe Bottleneck" if proj_cpu > 85.0 else "Strained"

        conf = 91.0
        risk = 68.0 if proj_cpu > 80.0 else 35.0
        pol_score = 70.0
        twin_score = 65.0
        rollback = 88.0

    else: # RESTART
        proj_pods = curr_pods
        proj_cpu = round(max(15.0, curr_cpu * 0.7), 1)
        proj_mem = round(max(20.0, curr_mem * 0.45), 1)
        proj_lat = round(max(curr_lat, 95.0), 1)
        proj_net = round(curr_net * 0.9, 1)
        cost_delta = 0.0
        stability = "Restarting (Memory Flushed)"

        conf = 92.0
        risk = 25.0 if "db" not in service_name else 75.0
        pol_score = 100.0 if "db" not in service_name else 50.0
        twin_score = 88.0
        rollback = 90.0

    unified_score = round(
        (0.30 * conf) + (0.25 * (100.0 - risk)) + (0.20 * pol_score) + (0.15 * twin_score) + (0.10 * rollback),
        1
    )

    if unified_score >= 82.0 and pol_score == 100.0:
        verdict = "SAFE_FOR_AUTO_EXECUTE"
        recommendation_label = "Verified Safe for Execution"
    elif unified_score >= 60.0:
        verdict = "REQUIRES_HUMAN_APPROVAL"
        recommendation_label = "Requires SRE Administrator Approval"
    else:
        verdict = "UNSAFE_REJECT"
        recommendation_label = "Assurance Engine Blocked (High Risk)"

    dependency_graph = {
        "erp-frontend": [
            {"service": "erp-core", "severity": "HIGH", "probability": 85, "impact": "Workflow queue latency increase"},
            {"service": "erp-inventory", "severity": "MEDIUM", "probability": 65, "impact": "Stock lookup delays"}
        ],
        "erp-core": [
            {"service": "erp-db", "severity": "CRITICAL", "probability": 90, "impact": "Transaction connection pool saturation"},
            {"service": "erp-frontend", "severity": "HIGH", "probability": 75, "impact": "User dashboard timeout errors"}
        ],
        "erp-inventory": [
            {"service": "erp-db", "severity": "HIGH", "probability": 70, "impact": "Stock commit locks"},
            {"service": "erp-frontend", "severity": "MEDIUM", "probability": 55, "impact": "Warehouse catalog sync delays"}
        ],
        "erp-db": [
            {"service": "erp-core", "severity": "CRITICAL", "probability": 95, "impact": "Complete transaction ledger freeze"},
            {"service": "erp-inventory", "severity": "CRITICAL", "probability": 92, "impact": "Stock operations halted"},
            {"service": "erp-frontend", "severity": "CRITICAL", "probability": 88, "impact": "HTTP 500 downstream blast"}
        ],
        "shop-frontend": [
            {"service": "shop-auth", "severity": "HIGH", "probability": 80, "impact": "Login queue bottleneck"},
            {"service": "shop-catalog", "severity": "HIGH", "probability": 85, "impact": "Product browse latency spike"}
        ],
        "shop-catalog": [
            {"service": "shop-notifications", "severity": "MEDIUM", "probability": 60, "impact": "Order confirmation lag"}
        ],
        "shop-auth": [
            {"service": "shop-notifications", "severity": "LOW", "probability": 40, "impact": "Auth audit log delay"}
        ],
        "frontend-service": [
            {"service": "auth-service", "severity": "HIGH", "probability": 80, "impact": "Token verification backpressure"},
            {"service": "payment-service", "severity": "HIGH", "probability": 85, "impact": "Payment gateway timeout"}
        ],
        "payment-service": [
            {"service": "database-service", "severity": "CRITICAL", "probability": 92, "impact": "ACID transaction retry storm"}
        ],
        "auth-service": [
            {"service": "database-service", "severity": "HIGH", "probability": 75, "impact": "Session token read locks"}
        ],
        "database-service": [
            {"service": "payment-service", "severity": "CRITICAL", "probability": 96, "impact": "Payment checkout failure"},
            {"service": "auth-service", "severity": "CRITICAL", "probability": 90, "impact": "User session authentication failure"}
        ]
    }

    blast_radius = dependency_graph.get(service_name, [
        {"service": "cluster-gateway", "severity": "MEDIUM", "probability": 50, "impact": "Gateway latency drift"}
    ])

    return {
        "service_name": service_name,
        "scenario": scenario,
        "current_metrics": {
            "cpu": curr_cpu,
            "memory": curr_mem,
            "latency": curr_lat,
            "network": curr_net,
            "replicas": curr_pods,
            "max_replicas": max_pods
        },
        "projected_metrics": {
            "cpu": proj_cpu,
            "memory": proj_mem,
            "latency": proj_lat,
            "network": proj_net,
            "replicas": proj_pods,
            "max_replicas": max_pods,
            "stability": stability,
            "cost_delta_hourly": cost_delta
        },
        "blast_radius": blast_radius,
        "assurance": {
            "confidence_score": conf,
            "risk_index": risk,
            "policy_compliance": pol_score,
            "policy_status": "PASS" if pol_score == 100.0 else "REQUIRES_APPROVAL",
            "digital_twin_score": twin_score,
            "rollback_feasibility": rollback,
            "unified_score": unified_score,
            "verdict": verdict,
            "recommendation_label": recommendation_label
        },
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/digital-twin/apply-action")
def apply_digital_twin_action(
    service_name: str = Body(..., embed=True),
    target_replicas: int = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Applies the validated Digital Twin simulation action directly to the infrastructure.
    """
    if hasattr(k8s_adapter, "scale_deployment"):
        k8s_adapter.scale_deployment(service_name, target_replicas)

    event_id = str(uuid.uuid4())
    event = TimelineEvent(
        id=event_id,
        timeline_id=str(uuid.uuid4()),
        event_type="EXECUTION",
        service_name=service_name,
        payload={
            "action": f"Digital Twin Simulated Scale: Replicas set to {target_replicas}",
            "status": "COMPLETED",
            "source": "Digital Twin Assurance Studio"
        }
    )
    db.add(event)
    db.commit()

    return {
        "status": "SUCCESS",
        "service_name": service_name,
        "replicas": target_replicas,
        "message": f"Deployment {service_name} successfully scaled to {target_replicas} pods."
    }
