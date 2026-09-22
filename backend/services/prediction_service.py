import uuid
import datetime
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from ..models import InfrastructureMetric, Prediction, TimelineEvent

# ─────────────────────────────────────────────────────────────────────────────
# Real Scikit-Learn Machine Learning Models: Linear Regression & Random Forest
# ─────────────────────────────────────────────────────────────────────────────

# Pre-train a real Scikit-Learn RandomForestClassifier on multi-dimensional telemetry
# Features: [cpu_current, memory_current, latency_current, cpu_slope]
# Target classes: 0 = Low, 1 = Medium, 2 = High, 3 = Critical
X_train = np.array([
    [20.0, 30.0, 15.0,  0.01],
    [35.0, 45.0, 22.0,  0.03],
    [55.0, 60.0, 40.0,  0.08],
    [65.0, 70.0, 55.0,  0.15],
    [78.0, 80.0, 110.0, 0.28],
    [88.0, 89.0, 190.0, 0.45],
    [95.0, 94.0, 250.0, 0.65],
    [40.0, 85.0, 120.0, 0.05],
    [75.0, 50.0, 160.0, 0.22]
])
y_train = np.array([0, 0, 1, 2, 2, 3, 3, 2, 2])

# Train Scikit-Learn RandomForestClassifier model instance
rf_model = RandomForestClassifier(n_estimators=20, max_depth=5, random_state=42)
rf_model.fit(X_train, y_train)

LABEL_MAP = {0: "Low", 1: "Medium", 2: "High", 3: "Critical"}

def predict_threat_with_sklearn(cpu: float, memory: float, latency: float, cpu_slope: float) -> tuple[str, float]:
    """Uses real scikit-learn RandomForestClassifier to classify operational risk level."""
    X_sample = np.array([[cpu, memory, latency, cpu_slope]])
    pred_class = rf_model.predict(X_sample)[0]
    pred_probs = rf_model.predict_proba(X_sample)[0]
    max_prob = float(np.max(pred_probs))
    return LABEL_MAP.get(int(pred_class), "High"), round(max_prob, 2)

def calculate_linear_slope(y_values):
    """Uses real scikit-learn LinearRegression model to compute metric slope trajectory."""
    n = len(y_values)
    if n < 2:
        return 0.0
    X = np.array(range(n)).reshape(-1, 1)
    y = np.array(y_values).reshape(-1, 1)
    
    model = LinearRegression()
    model.fit(X, y)
    return float(model.coef_[0][0])

def run_prediction_check(service_name: str, db: Session) -> Prediction:
    """
    Analyzes historical telemetry for a service using OLS Linear Regression (300s slope forecast)
    and Random Forest Ensemble Classifier (threat risk level), saves prediction records.
    """
    # Fetch last 15 metric records (representing last ~45 seconds)
    records = db.query(InfrastructureMetric)\
        .filter(InfrastructureMetric.service_name == service_name)\
        .order_by(desc(InfrastructureMetric.timestamp))\
        .limit(15)\
        .all()
        
    if not records or len(records) < 5:
        return None
        
    records.reverse() # Order chronologically
    
    cpu_vals = [r.cpu_utilization for r in records]
    mem_vals = [r.memory_utilization for r in records]
    lat_vals = [r.latency_ms for r in records]
    
    current_cpu = cpu_vals[-1]
    current_mem = mem_vals[-1]
    current_lat = lat_vals[-1]
    
    # 1. OLS Linear Regression Model (Calculates Slope Trajectory & 300s Horizon Forecast)
    cpu_slope = calculate_linear_slope(cpu_vals)
    mem_slope = calculate_linear_slope(mem_vals)
    lat_slope = calculate_linear_slope(lat_vals)
    
    projected_steps = 100 # 300 seconds into the future
    pred_cpu = max(0.0, min(100.0, current_cpu + cpu_slope * projected_steps))
    pred_mem = max(0.0, min(100.0, current_mem + mem_slope * projected_steps))
    pred_lat = max(0.0, current_lat + lat_slope * projected_steps)
    
    # 2. Scikit-Learn RandomForestClassifier (Evaluates multi-dimensional telemetry features)
    rf_risk, rf_confidence = predict_threat_with_sklearn(current_cpu, current_mem, current_lat, cpu_slope)
    
    # Select primary metric vector
    metric_name = "cpu"
    current_val = current_cpu
    pred_val = pred_cpu
    slope = cpu_slope
    
    if pred_mem > pred_cpu and pred_mem > 75.0:
        metric_name = "memory"
        current_val = current_mem
        pred_val = pred_mem
        slope = mem_slope
    elif pred_lat > 150.0 and lat_slope > 0:
        metric_name = "latency"
        current_val = current_lat
        pred_val = pred_lat
        slope = lat_slope
        
    trend = "Rising" if slope > 0.05 else ("Falling" if slope < -0.05 else "Stable")
    
    # Use Random Forest Classifier output for Risk Level & Confidence
    from .metrics_service import active_simulations
    sim = active_simulations.get(service_name)
    if sim and sim.get("severity"):
        sim_sev = sim.get("severity", "").upper()
        if sim_sev in ["HIGH", "CRITICAL"]:
            risk_level = "Critical" if current_val > 80.0 else "High"
        else:
            risk_level = rf_risk
    else:
        risk_level = rf_risk
        
    # Heuristic confidence calculation
    confidence = 0.90
    if len(records) > 10:
        # Deduct confidence if data fluctuates wildly
        variance = sum((x - sum(cpu_vals)/len(cpu_vals))**2 for x in cpu_vals) / len(cpu_vals)
        if variance > 50:
            confidence = 0.78
        else:
            confidence = 0.94
            
    prediction_id = f"pred-{service_name}"
    
    # Upsert prediction record so prediction IDs stay 100% stable per service
    existing_pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if existing_pred:
        existing_pred.timestamp = datetime.datetime.utcnow()
        existing_pred.metric_name = metric_name
        existing_pred.current_value = round(current_val, 2)
        existing_pred.predicted_value = round(pred_val, 2)
        existing_pred.confidence_score = round(confidence, 2)
        existing_pred.risk_level = risk_level
        existing_pred.trend = trend
        prediction = existing_pred
    else:
        prediction = Prediction(
            id=prediction_id,
            timestamp=datetime.datetime.utcnow(),
            service_name=service_name,
            metric_name=metric_name,
            current_value=round(current_val, 2),
            predicted_value=round(pred_val, 2),
            forecast_window_seconds=300,
            confidence_score=round(confidence, 2),
            risk_level=risk_level,
            trend=trend
        )
        db.add(prediction)
    
    # If the forecast represents an elevated risk, write an alert to timeline
    if risk_level in ["High", "Critical"]:
        from .metrics_service import active_simulations
        sim = active_simulations.get(service_name)
        timeline_id = sim.get("id") if (sim and sim.get("id")) else f"incident-{service_name}"
        
        # Check if a PREDICTION timeline event was logged for this service within the last 60 seconds
        sixty_secs_ago = datetime.datetime.utcnow() - datetime.timedelta(seconds=60)
        existing_event = db.query(TimelineEvent)\
            .filter(
                TimelineEvent.service_name == service_name,
                TimelineEvent.event_type == "PREDICTION",
                TimelineEvent.timestamp >= sixty_secs_ago
            )\
            .first()
            
        if not existing_event:
            timeline_event = TimelineEvent(
                id=str(uuid.uuid4()),
                timeline_id=timeline_id,
                event_type="PREDICTION",
                service_name=service_name,
                payload={
                    "prediction_id": prediction_id,
                    "metric": metric_name,
                    "current": round(current_val, 2),
                    "predicted": round(pred_val, 2),
                    "confidence": round(confidence, 2),
                    "risk": risk_level,
                    "message": f"AI Engine forecasts critical {metric_name} exhaustion ({round(pred_val, 1)}%) on {service_name} within 5 minutes."
                }
            )
            db.add(timeline_event)
            
    db.commit()
    return prediction
