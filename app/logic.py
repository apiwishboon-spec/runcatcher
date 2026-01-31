from .models import BehaviorStatus, SensorReading, DetectionResult
from .config import settings
import time
from typing import Optional

# Simple in-memory storage for streaks and zone states
# In production, use Redis or a database
zone_streaks = {}
zone_states = {}
total_stats = {
    "incidents": 0,
    "noise_warnings": 0
}

ALERT_HOLD_TIME = 60 # seconds

def classify_behavior(reading: SensorReading, alert_snapshot_url: Optional[str] = None) -> DetectionResult:
    """
    Core logic to classify behavior based on thresholds.
    """
    status = BehaviorStatus.QUIET
    message = "Environment is peaceful."
    snapshot_url = alert_snapshot_url
    now = time.time()
    
    # Initialize zone state if not exists
    if reading.zone_name not in zone_states:
        zone_states[reading.zone_name] = {
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
        zone_streaks[reading.zone_name] = 0
        zone_states[reading.zone_name]["events_today"] += 1
        total_stats["incidents"] += 1
        
    elif reading.noise_level > settings.NOISE_THRESHOLD_LOUD:
        status = BehaviorStatus.LOUD
        message = "Noise level is high. Shhh!"
        is_alert = True
        if not snapshot_url:
             snapshot_url = "/static/logo.png"
        zone_streaks[reading.zone_name] = 0
        zone_states[reading.zone_name]["events_today"] += 1
        total_stats["noise_warnings"] += 1
    else:
        # Increment quiet streak
        current_streak = zone_streaks.get(reading.zone_name, 0)
        zone_streaks[reading.zone_name] = current_streak + 1
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
        
    zone_states[reading.zone_name].update(updates)

    return DetectionResult(
        status=status,
        message=message,
        streak=zone_streaks.get(reading.zone_name, 0),
        alert_snapshot_url=snapshot_url,
        zone_name=reading.zone_name,
        movement_speed=reading.movement_speed,
        noise_level=reading.noise_level
    )

def get_dashboard_stats():
    """Returns the current state of all zones and totals, with alert persistence."""
    now = time.time()
    zones_to_report = []
    
    for zone_id, state in zone_states.items():
        report_state = state.copy()
        # Hold alert status for ALERT_HOLD_TIME (60s)
        last_alert_time = state.get("last_alert_time", 0)
        if state["status"] == BehaviorStatus.QUIET and (now - last_alert_time) < ALERT_HOLD_TIME:
            report_state["status"] = state.get("last_alert_status", BehaviorStatus.QUIET)
            
        zones_to_report.append(report_state)

    return {
        "zones": zones_to_report,
        "total_zones": len(zone_states),
        "total_incidents": total_stats["incidents"],
        "total_noise": total_stats["noise_warnings"]
    }
