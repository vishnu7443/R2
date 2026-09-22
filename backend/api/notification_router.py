from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..services.notification_service import notify_engineer, send_telegram_alert, send_slack_alert

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class TestNotificationPayload(BaseModel):
    title: str = "Pre-Critical Load Spike Alert"
    message: str = "Vector OLS algorithm predicted erp-frontend CPU exhaustion in 300s. Auto-remediation scaled pods 2 -> 4."
    level: str = "WARNING"
    channel: str = "all" # "telegram", "slack", or "all"

class ConfigPayload(BaseModel):
    telegram_bot_token: Optional[str] = ""
    telegram_chat_id: Optional[str] = ""
    slack_webhook_url: Optional[str] = ""

@router.post("/test")
def trigger_test_notification(payload: TestNotificationPayload):
    if payload.channel == "telegram":
        sent = send_telegram_alert(payload.title, payload.message, payload.level)
        return {"channel": "telegram", "sent": sent, "summary": "Dispatched to Telegram Bot API"}
    elif payload.channel == "slack":
        sent = send_slack_alert(payload.title, payload.message, payload.level)
        return {"channel": "slack", "sent": sent, "summary": "Dispatched to Slack Webhook"}
    else:
        return notify_engineer(payload.title, payload.message, payload.level)

@router.get("/status")
def notification_status():
    return {
        "telegram_enabled": True,
        "slack_enabled": True,
        "recommendation": "Telegram Bot API recommended for instant demo notifications (no OAuth required)."
    }
