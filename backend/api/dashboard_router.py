import datetime
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import InfrastructureMetric, Decision
from ..services.metrics_service import active_simulations
from .ingest_router import LAST_LIVE_INGEST

router = APIRouter(prefix="/api")

# ── Dashboard cache: re-compute instantly for live responsiveness ────────────
_dashboard_cache: dict[str, dict] = {}   # mode → {"ts": float, "data": dict}
CACHE_TTL = 0.5  # seconds

@router.get("/dashboard")
def get_dashboard_summary(mode: str = "standard", db: Session = Depends(get_db)):
    # ── Serve from cache if fresh ────────────────────────────────────────────
    cached = _dashboard_cache.get(mode)
    if cached and (time.monotonic() - cached["ts"]) < CACHE_TTL:
        return cached["data"]

    # Fetch latest metrics for the requested services
    if mode == "ecommerce":
        services = ["shop-frontend", "shop-auth", "shop-catalog", "shop-notifications"]
    elif mode == "inventraerp":
        services = ["erp-frontend", "erp-db"]
    else:
        services = ["payment-service", "auth-service", "frontend-service", "database-service"]
    latest_metrics = {}
    
    total_cpu = 0.0
    total_memory = 0.0
    total_network = 0.0
    total_latency = 0.0
    total_pods = 0
    
    for service in services:
        # Average last 3 readings to smooth out random jitter
        rows = db.query(InfrastructureMetric)\
            .filter(InfrastructureMetric.service_name == service)\
            .order_by(desc(InfrastructureMetric.timestamp))\
            .limit(3)\
            .all()
            
        if rows:
            avg_cpu_s    = round(sum(r.cpu_utilization  for r in rows) / len(rows), 1)
            avg_mem_s    = round(sum(r.memory_utilization for r in rows) / len(rows), 1)
            avg_net_s    = round(sum(r.network_throughput for r in rows) / len(rows), 1)
            avg_lat_s    = round(sum(r.latency_ms        for r in rows) / len(rows), 1)
            latest_metrics[service] = {
                "cpu":     avg_cpu_s,
                "memory":  avg_mem_s,
                "network": avg_net_s,
                "latency": avg_lat_s,
                "pods":    rows[0].pod_count
            }
            total_cpu     += avg_cpu_s
            total_memory  += avg_mem_s
            total_network += avg_net_s
            total_latency += avg_lat_s
            total_pods    += rows[0].pod_count
        else:
            latest_metrics[service] = {"cpu": 0.0, "memory": 0.0, "network": 0.0, "latency": 0.0, "pods": 0}
            
    num_services = len(services)
    avg_cpu    = round(total_cpu    / num_services, 1) if num_services > 0 else 0.0
    avg_memory = round(total_memory / num_services, 1) if num_services > 0 else 0.0
    avg_network= round(total_network/ num_services, 1) if num_services > 0 else 0.0
    avg_latency= round(total_latency/ num_services, 1) if num_services > 0 else 0.0
    
    # Calculate Cluster Health Score (integer, rounded — no floating jitter)
    health_score = 100
    alerts_count = 0
    
    for service, m in latest_metrics.items():
        if m["cpu"] > 85.0:
            health_score -= 10
            alerts_count += 1
        if m["memory"] > 90.0:
            health_score -= 15
            alerts_count += 1
        if m["latency"] > 180.0:
            health_score -= 10
            alerts_count += 1
            
    for sim in active_simulations.values():
        if sim.get("active"):
            health_score -= 10
            
    health_score = max(10, health_score)
    
    # Map health level status string
    if health_score >= 95:
        health_status = "Healthy"
    elif health_score >= 80:
        health_status = "Warning"
    elif health_score >= 60:
        health_status = "Degraded"
    else:
        health_status = "Critical"

    result = {
        "health_score": health_score,
        "health_status": health_status,
        "metrics_summary": {
            "cpu_avg": avg_cpu,
            "memory_avg": avg_memory,
            "network_avg": avg_network,
            "latency_avg": avg_latency,
            "pod_count": total_pods,
            "node_count": 5
        },
        "services": latest_metrics,
        "alerts_count": alerts_count,
        "live_agent_active": any((time.time() - ts) < 15.0 for ts in LAST_LIVE_INGEST.values()),
        "live_agent_services": [s for s, ts in LAST_LIVE_INGEST.items() if (time.time() - ts) < 15.0]
    }
    # Store in cache
    _dashboard_cache[mode] = {"ts": time.monotonic(), "data": result}
    return result


# Alerts cache: per mode, refreshed every 3 seconds
_alerts_cache: dict[str, dict] = {}

@router.get("/alerts")
def get_active_alerts(mode: str = "standard", db: Session = Depends(get_db)):
    cached = _alerts_cache.get(mode)
    if cached and (time.monotonic() - cached["ts"]) < CACHE_TTL:
        return cached["data"]

    if mode == "ecommerce":
        services = ["shop-frontend", "shop-auth", "shop-catalog", "shop-notifications"]
    elif mode == "inventraerp":
        services = ["erp-frontend", "erp-db"]
    else:
        services = ["payment-service", "auth-service", "frontend-service", "database-service"]

    alerts = []
    for service in services:
        # Average last 3 readings to smooth jitter — prevents single-sample spikes
        rows = db.query(InfrastructureMetric)\
            .filter(InfrastructureMetric.service_name == service)\
            .order_by(desc(InfrastructureMetric.timestamp))\
            .limit(3)\
            .all()
        if not rows:
            continue
        avg_cpu = sum(r.cpu_utilization   for r in rows) / len(rows)
        avg_mem = sum(r.memory_utilization for r in rows) / len(rows)
        avg_lat = sum(r.latency_ms         for r in rows) / len(rows)
        ts = rows[0].timestamp.isoformat()

        if avg_cpu > 85.0:
            alerts.append({
                "id": f"alert-cpu-{service}",
                "severity": "CRITICAL" if avg_cpu > 93 else "WARNING",
                "title": f"High CPU Utilization - {service}",
                "description": f"CPU utilization has reached {round(avg_cpu,1)}%, exceeding warning threshold.",
                "service_name": service,
                "timestamp": ts
            })
        if avg_mem > 90.0:
            alerts.append({
                "id": f"alert-mem-{service}",
                "severity": "CRITICAL" if avg_mem > 96 else "WARNING",
                "title": f"Memory Exhaustion Warning - {service}",
                "description": f"Memory usage is critical at {round(avg_mem,1)}%. Pod is in danger of OOM kill.",
                "service_name": service,
                "timestamp": ts
            })
        if avg_lat > 180.0:
            alerts.append({
                "id": f"alert-lat-{service}",
                "severity": "WARNING",
                "title": f"Latency Spike - {service}",
                "description": f"Average request latency has spiked to {round(avg_lat,1)}ms.",
                "service_name": service,
                "timestamp": ts
            })

    alerts.sort(key=lambda x: x["severity"] == "CRITICAL", reverse=True)
    _alerts_cache[mode] = {"ts": time.monotonic(), "data": alerts}
    return alerts


@router.get("/metrics")
def get_chart_metrics(service_name: str, db: Session = Depends(get_db)):
    # Returns last 30 readings for charts
    metrics_list = db.query(InfrastructureMetric)\
        .filter(InfrastructureMetric.service_name == service_name)\
        .order_by(desc(InfrastructureMetric.timestamp))\
        .limit(30)\
        .all()
        
    # Reverse to keep chronological ordering
    metrics_list.reverse()
    
    return [
        {
            "timestamp": m.timestamp.isoformat(),
            "cpu": m.cpu_utilization,
            "memory": m.memory_utilization,
            "network": m.network_throughput,
            "latency": m.latency_ms,
            "pods": m.pod_count
        } for m in metrics_list
    ]

@router.get("/decisions/recent")
def get_recent_decisions(mode: str = "standard", db: Session = Depends(get_db)):
    if mode == "ecommerce":
        services = ["shop-frontend", "shop-auth", "shop-catalog", "shop-notifications"]
    elif mode == "inventraerp":
        services = ["erp-frontend", "erp-db"]
    else:
        services = ["payment-service", "auth-service", "frontend-service", "database-service"]

    from ..models import Prediction
    try:
        decisions = db.query(Decision)\
            .join(Prediction, Decision.prediction_id == Prediction.id)\
            .filter(Prediction.service_name.in_(services))\
            .order_by(desc(Decision.timestamp))\
            .limit(5)\
            .all()
    except Exception:
        decisions = []

    # Fallback: if no mode-scoped decisions, return latest global decisions
    if not decisions:
        decisions = db.query(Decision).order_by(desc(Decision.timestamp)).limit(5).all()

    result = []
    for d in decisions:
        result.append({
            "id": d.id,
            "time": d.timestamp.strftime("%H:%M:%S") if d.timestamp else "",
            "decision_score": d.decision_score,
            "final_decision": d.final_decision,
            "status": d.status
        })
    return result
