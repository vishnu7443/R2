"""
Vector Responsible Autonomy: Kill Switch & Granular Autonomy Level Controller
Implements the 6-Level Autonomy Progression (L0 to L5) and Global/Per-Service Kill Switches.
"""

from typing import Dict, Any, Tuple

# Global Kill Switch State: When True, blocks all automated cluster actions immediately
_GLOBAL_KILL_SWITCH_ACTIVE = False

# Autonomy Level Definitions
AUTONOMY_LEVEL_NAMES = {
    0: "L0_OBSERVE",
    1: "L1_RECOMMEND",
    2: "L2_SIMULATE",
    3: "L3_HUMAN_APPROVED",
    4: "L4_GUARDED_AUTONOMY",
    5: "L5_CLOSED_LOOP_AUTONOMY"
}

# Per-service configurable autonomy tiers
_SERVICE_AUTONOMY_LEVELS: Dict[str, int] = {
    "erp-frontend": 5,   # Level 5: Closed-loop autonomous scaling & verification
    "erp-core": 4,       # Level 4: Guarded autonomy for low-risk actions
    "erp-inventory": 4,  # Level 4: Guarded autonomy
    "erp-db": 2,         # Level 2: Simulate only; strictly requires human approval
    "shop-frontend": 5,
    "shop-auth": 4,
    "shop-payment": 3,
    "shop-catalog": 4,
    "shop-database": 2,
    "default": 3         # Default fallback: L3 Human Approved
}

def is_global_kill_switch_active() -> bool:
    """Returns True if the Global Autonomy Kill Switch is engaged."""
    return _GLOBAL_KILL_SWITCH_ACTIVE

def set_global_kill_switch(engaged: bool) -> bool:
    """Engages or disengages the Global Autonomy Kill Switch."""
    global _GLOBAL_KILL_SWITCH_ACTIVE
    _GLOBAL_KILL_SWITCH_ACTIVE = engaged
    return _GLOBAL_KILL_SWITCH_ACTIVE

def get_service_autonomy_level(service_name: str) -> int:
    """Gets the configured autonomy level for a given service."""
    return _SERVICE_AUTONOMY_LEVELS.get(service_name, _SERVICE_AUTONOMY_LEVELS["default"])

def set_service_autonomy_level(service_name: str, level: int) -> int:
    """Updates the autonomy level (0-5) for a given service."""
    if level not in range(6):
        raise ValueError("Autonomy level must be an integer between 0 and 5.")
    _SERVICE_AUTONOMY_LEVELS[service_name] = level
    return level

def get_all_autonomy_settings() -> Dict[str, Any]:
    """Returns the comprehensive autonomy status of the platform."""
    return {
        "global_kill_switch_active": _GLOBAL_KILL_SWITCH_ACTIVE,
        "service_levels": {
            svc: {
                "level": lvl,
                "name": AUTONOMY_LEVEL_NAMES[lvl]
            }
            for svc, lvl in _SERVICE_AUTONOMY_LEVELS.items()
        }
    }

def can_execute_autonomously(
    service_name: str,
    action_name: str,
    risk_score: float,
    safety_contract: Dict[str, Any]
) -> Tuple[bool, str]:
    """
    Evaluates whether an action qualifies for autonomous execution based on:
    1. Global Kill Switch
    2. 'Do No Harm' Safety Contract validation
    3. Per-Service Autonomy Level
    4. Operational Risk Thresholds
    """
    # 1. Global Kill Switch Check
    if _GLOBAL_KILL_SWITCH_ACTIVE:
        return False, "BLOCKED: Global Autonomy Kill Switch is ENGAGED. Platform operating in Read-Only advisory mode."

    # 2. Safety Contract Check
    if not safety_contract.get("is_valid", False):
        reason = safety_contract.get("violation_reason", "Safety contract failed verification.")
        return False, f"BLOCKED: {reason}"

    # 3. Autonomy Level Evaluation
    level = get_service_autonomy_level(service_name)
    level_name = AUTONOMY_LEVEL_NAMES[level]

    if level < 4:
        return False, f"PAUSED: Service '{service_name}' configured at {level_name} (Level {level}) which requires explicit human sign-off."

    if level == 4 and risk_score >= 45.0:
        return False, f"ESCALATED: Action on '{service_name}' has risk score {risk_score} exceeding Level 4 Guarded ceiling (45.0). Escalating to human approval."

    # Level 5 or Level 4 with acceptable risk
    return True, f"APPROVED: Autonomous execution permitted under {level_name} with verified Safety Contract."
