"""
Vector Ingest API — Receives real telemetry from connected client projects.

External projects (like Inventra ERP) install the vector_agent.py SDK which
POSTs live metrics here every 2 seconds. This endpoint validates the API key,
maps the metric to an internal service name, and writes it to the database —
replacing the simulated baseline with real data.
"""

from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
import datetime

from ..database import SessionLocal
from ..models import InfrastructureMetric

router = APIRouter(prefix="/api/ingest", tags=["Ingest"])

# ─────────────────────────────────────────────────────────────────────────────
# Static API key registry (in production this would be a DB table)
# Generated during onboarding. Format:  "vect_<project_id>_<secret>"
# ─────────────────────────────────────────────────────────────────────────────
REGISTERED_KEYS: dict[str, dict] = {
    "vect_inventraerp_sk_live_abc123xyz": {
        "project": "inventraerp",
        "owner": "sriram@inventra.com",
        "service_map": {
            # Inventra ERP service names → Vector internal names
            "frontend":   "erp-frontend",
            "core":       "erp-core",
            "inventory":  "erp-inventory",
            "db":         "erp-db",
            # fallback: accept raw internal names directly
            "erp-frontend":  "erp-frontend",
            "erp-core":      "erp-core",
            "erp-inventory": "erp-inventory",
            "erp-db":        "erp-db",
        }
    }
}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MetricPayload(BaseModel):
    service: str                   # e.g. "frontend", "core", "erp-db"
    cpu_percent: float             # 0–100
    memory_percent: float          # 0–100
    network_kbps: Optional[float] = 500.0
    latency_ms: Optional[float]   = 20.0
    pod_count: Optional[int]       = 1


class BatchPayload(BaseModel):
    metrics: list[MetricPayload]


import time

# Registry of recent live ingest timestamps: {service_name: unix_timestamp}
LAST_LIVE_INGEST: dict[str, float] = {}

def _resolve_key(api_key: str) -> dict:
    entry = REGISTERED_KEYS.get(api_key)
    if not entry:
        raise HTTPException(status_code=401, detail="Invalid or missing Vector API key.")
    return entry


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/ingest/metric  — single metric push
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/metric")
def ingest_single(
    payload: MetricPayload,
    x_vector_key: str = Header(..., alias="X-Vector-Key"),
    db: Session = Depends(get_db)
):
    entry = _resolve_key(x_vector_key)
    internal_name = entry["service_map"].get(payload.service)
    if not internal_name:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown service '{payload.service}' for this project. "
                   f"Allowed: {list(entry['service_map'].keys())}"
        )

    record = InfrastructureMetric(
        timestamp=datetime.datetime.utcnow(),
        service_name=internal_name,
        cpu_utilization=round(payload.cpu_percent, 2),
        memory_utilization=round(payload.memory_percent, 2),
        network_throughput=round(payload.network_kbps, 2),
        latency_ms=round(payload.latency_ms, 2),
        pod_count=payload.pod_count,
        node_count=5,
    )
    db.add(record)
    db.commit()

    LAST_LIVE_INGEST[internal_name] = time.time()

    return {"status": "ok", "service": internal_name, "ts": record.timestamp.isoformat()}


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/ingest/batch  — push multiple services in one call (efficient)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/batch")
def ingest_batch(
    payload: BatchPayload,
    x_vector_key: str = Header(..., alias="X-Vector-Key"),
    db: Session = Depends(get_db)
):
    entry = _resolve_key(x_vector_key)
    now = datetime.datetime.utcnow()
    now_t = time.time()
    accepted = []
    errors = []

    for m in payload.metrics:
        internal_name = entry["service_map"].get(m.service)
        if not internal_name:
            errors.append(m.service)
            continue
        db.add(InfrastructureMetric(
            timestamp=now,
            service_name=internal_name,
            cpu_utilization=round(m.cpu_percent, 2),
            memory_utilization=round(m.memory_percent, 2),
            network_throughput=round(m.network_kbps, 2),
            latency_ms=round(m.latency_ms, 2),
            pod_count=m.pod_count,
            node_count=5,
        ))
        accepted.append(internal_name)
        LAST_LIVE_INGEST[internal_name] = now_t

    db.commit()
    return {"status": "ok", "accepted": accepted, "skipped": errors, "ts": now.isoformat()}


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ingest/verify  — let client verify their key is active
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/verify")
def verify_key(x_vector_key: str = Header(..., alias="X-Vector-Key")):
    entry = _resolve_key(x_vector_key)
    return {
        "valid": True,
        "project": entry["project"],
        "owner": entry["owner"],
        "allowed_services": list(entry["service_map"].keys())
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ingest/status  — checks if real live metrics are streaming
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/status")
def ingest_status():
    now = time.time()
    active_services = {
        s: round(now - ts, 1)
        for s, ts in LAST_LIVE_INGEST.items()
        if (now - ts) < 15.0
    }
    is_live = len(active_services) > 0
    return {
        "is_live": is_live,
        "active_services": active_services,
        "total_active": len(active_services),
        "source": "vector_agent.py" if is_live else "synthetic_twin"
    }
