from .models import BehaviorStatus, SensorReading, DetectionResult
from .config import settings
import time
from typing import Optional

# Multi-tenant storage for streaks, zone states and stats
# In production, use Redis or a database
room_data = {}

ALERT_HOLD_TIME = 60 # seconds

def get_room_context(room_id: str):
    """Ensures a room's data structure exists."""
    if room_id not in room_data:
        room_data[room_id] = {
            "streaks": {},
            "states": {},
            "stats": {"incidents": 0, "noise_warnings": 0}
        }
    return room_data[room_id]

def classify_behavior(reading: SensorReading, alert_snapshot_url: Optional[str] = None) -> DetectionResult:
    """
    Core logic to classify behavior based on thresholds, scoped by room_id.
    """
    room_id = reading.room_id or "default"
    ctx = get_room_context(room_id)
    
    status = BehaviorStatus.QUIET
    message = "Environment is peaceful."
    snapshot_url = alert_snapshot_url
    now = time.time()
    
    # Initialize zone state if not exists
    if reading.zone_name not in ctx["states"]:
        ctx["states"][reading.zone_name] = {
            "name": reading.zone_name,
            "status": BehaviorStatus.QUIET,
            "events_today": 0,
            "last_active": now,
            "last_alert_time": 0,
            "noise_level": reading.noise_level,
            "movement_speed": reading.movement_speed
        }
    
    is_alert = False
    # Check running first (higher priority)
    if reading.movement_speed > settings.SPEED_THRESHOLD_RUNNING:
        status = BehaviorStatus.RUNNING_DETECTED
        message = "Running detected! Please walk for safety."
        is_alert = True
        if not snapshot_url:
            snapshot_url = "/static/logo.png"
        ctx["streaks"][reading.zone_name] = 0
        ctx["states"][reading.zone_name]["events_today"] += 1
        ctx["stats"]["incidents"] += 1
        
    elif reading.noise_level > settings.NOISE_THRESHOLD_LOUD:
        status = BehaviorStatus.LOUD
        message = "Noise level is high. Shhh!"
        is_alert = True
        if not snapshot_url:
             snapshot_url = "/static/logo.png"
        ctx["streaks"][reading.zone_name] = 0
        ctx["states"][reading.zone_name]["events_today"] += 1
        ctx["stats"]["noise_warnings"] += 1
    else:
        # Increment quiet streak
        current_streak = ctx["streaks"].get(reading.zone_name, 0)
        ctx["streaks"][reading.zone_name] = current_streak + 1
        message = f"Thank you for keeping the {reading.zone_name} quiet."

    # Update global state for dashboard
    updates = {
        "status": status,
        "last_active": now,
        "noise_level": reading.noise_level,
        "movement_speed": reading.movement_speed,
        "alert_snapshot_url": snapshot_url
    }
    if is_alert:
        updates["last_alert_time"] = now
        updates["last_alert_status"] = status
        
    ctx["states"][reading.zone_name].update(updates)

    return DetectionResult(
        status=status,
        message=message,
        streak=ctx["streaks"].get(reading.zone_name, 0),
        alert_snapshot_url=snapshot_url,
        zone_name=reading.zone_name,
        movement_speed=reading.movement_speed,
        noise_level=reading.noise_level,
        room_id=room_id
    )

def get_dashboard_stats(room_id: str = "default"):
    """Returns the current state of all zones and totals for a specific room."""
    now = time.time()
    ctx = get_room_context(room_id)
    zones_to_report = []
    
    for zone_id, state in ctx["states"].items():
        report_state = state.copy()
        # Hold alert status for ALERT_HOLD_TIME (60s)
        last_alert_time = state.get("last_alert_time", 0)
        if state["status"] == BehaviorStatus.QUIET and (now - last_alert_time) < ALERT_HOLD_TIME:
            report_state["status"] = state.get("last_alert_status", BehaviorStatus.QUIET)
            
        zones_to_report.append(report_state)

    return {
        "zones": zones_to_report,
        "total_zones": len(ctx["states"]),
        "total_incidents": ctx["stats"]["incidents"],
        "total_noise": ctx["stats"]["noise_warnings"]
    }
