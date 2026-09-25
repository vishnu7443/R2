import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .services.metrics_service import start_metrics_generator
from .api import dashboard_router, simulator_router, prediction_router, decision_router, policy_router, execution_router, timeline_router, project_router, ingest_router, notification_router, rca_router, verification_router, governance_router, vector3_router

from .services.notification_service import start_telegram_bot_listener

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vector 3.0 Autonomous SRE Control Plane API", version="3.0.0")

# Set up CORS middleware for frontend queries
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start background metric simulations & Telegram interactive approval poller
start_metrics_generator()
start_telegram_bot_listener()

# Register api routes
app.include_router(dashboard_router.router)
app.include_router(simulator_router.router)
app.include_router(prediction_router.router)
app.include_router(decision_router.router)
app.include_router(policy_router.router)
app.include_router(execution_router.router)
app.include_router(timeline_router.router)
app.include_router(project_router.router)
app.include_router(ingest_router.router)
app.include_router(notification_router.router)
app.include_router(rca_router.router)
app.include_router(verification_router.router)
app.include_router(governance_router.router)
app.include_router(vector3_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Vector AI Operations API Hub."}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
