from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import time
from ..database import get_db
from ..models import Prediction
from ..services.prediction_service import run_prediction_check

router = APIRouter(prefix="/api/predictions")

# Cache: per-service prediction results, refreshed every 3 seconds
_pred_cache: dict[str, dict] = {}  # mode -> {"ts": float, "data": list}
CACHE_TTL = 3.0

@router.get("")
def get_current_predictions(mode: str = "standard", db: Session = Depends(get_db)):
    # Serve from cache if still fresh
    cached = _pred_cache.get(mode)
    if cached and (time.monotonic() - cached["ts"]) < CACHE_TTL:
        return cached["data"]

    if mode == "ecommerce":
        services = ["shop-frontend", "shop-auth", "shop-catalog", "shop-notifications"]
    elif mode == "inventraerp":
        services = ["erp-frontend", "erp-db"]
    else:
        services = ["payment-service", "auth-service", "frontend-service", "database-service"]
    results = []
    
    for service in services:
        # Run prediction check to get latest values
        pred = run_prediction_check(service, db)
        if not pred:
            # Fallback to fetching latest database entry
            pred = db.query(Prediction)\
                .filter(Prediction.service_name == service)\
                .order_by(desc(Prediction.timestamp))\
                .first()
                
        if pred:
            # Check if an executed decision or ended simulation exists for this specific prediction
            from ..models import Decision
            from ..services.metrics_service import active_simulations
            
            import datetime as dt
            ten_mins_ago = dt.datetime.utcnow() - dt.timedelta(minutes=10)
            dec = db.query(Decision)\
                .filter(Decision.prediction_id == pred.id, Decision.status.in_(["APPROVED", "EXECUTED", "SUCCEEDED", "ROLLED_BACK"]))\
                .filter(Decision.timestamp >= ten_mins_ago)\
                .first()
            
            is_decided = dec is not None
            
            sim = active_simulations.get(service)
            sim_active = sim is not None and sim.get("active", False)
            
            # Hysteresis: a prediction is "normal" only when BOTH current AND predicted
            # are comfortably below 60% — avoids jitter flipping alert near the 50% boundary
            is_normal = (pred.current_value is not None and pred.current_value < 60.0) and \
                        (pred.predicted_value is not None and pred.predicted_value < 60.0)
            
            # Threat alert is resolved ONLY if an executed decision exists, or if system is operating nominally
            if is_decided:
                resolved = True
            elif is_normal:
                resolved = True
            elif sim_active:
                resolved = False
            elif pred.risk_level in ["High", "Critical"] or (pred.current_value and pred.current_value > 75.0):
                resolved = False
            else:
                resolved = True
            
            results.append({
                "id": pred.id,
                "timestamp": pred.timestamp.isoformat(),
                "service_name": pred.service_name,
                "metric_name": pred.metric_name,
                "current_value": pred.current_value,
                "predicted_value": pred.predicted_value,
                "confidence_score": pred.confidence_score,
                "risk_level": pred.risk_level,
                "trend": pred.trend,
                "resolved": resolved
            })
            
    # Priority sorting: High/Critical risk first, then Medium/Low
    risk_weights = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
    results.sort(key=lambda x: risk_weights.get(x.get("risk_level", "Low"), 1), reverse=True)
    # Store in cache
    _pred_cache[mode] = {"ts": time.monotonic(), "data": results}
    return results

@router.get("/{prediction_id}")
def get_prediction_detail(prediction_id: str, db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return pred
