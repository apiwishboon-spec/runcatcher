from .models import BehaviorStatus, SensorReading, DetectionResult
from .config import settings
import time
from typing import Optional

# Simple in-memory storage for streaks
# In production, use Redis or a database
zone_streaks = {}

def classify_behavior(reading: SensorReading, alert_snapshot_url: Optional[str] = None) -> DetectionResult:
    """
    Core logic to classify behavior based on thresholds.
    """
    status = BehaviorStatus.QUIET
    message = "Environment is peaceful."
    snapshot_url = alert_snapshot_url
    
    # Check running first (higher priority)
    if reading.movement_speed > settings.SPEED_THRESHOLD_RUNNING:
        status = BehaviorStatus.RUNNING_DETECTED
        message = "Running detected! Please walk for safety."
        if not snapshot_url:
            snapshot_url = "/static/logo.png"
        zone_streaks[reading.zone_name] = 0
        
    elif reading.noise_level > settings.NOISE_THRESHOLD_LOUD:
        status = BehaviorStatus.LOUD
        message = "Noise level is high. Shhh!"
        if not snapshot_url:
             snapshot_url = "/static/logo.png"
        zone_streaks[reading.zone_name] = 0
    else:
        # Increment quiet streak
        current_streak = zone_streaks.get(reading.zone_name, 0)
        zone_streaks[reading.zone_name] = current_streak + 1
        message = f"Thank you for keeping the {reading.zone_name} quiet."

    return DetectionResult(
        status=status,
        message=message,
        streak=zone_streaks.get(reading.zone_name, 0),
        alert_snapshot_url=snapshot_url,
        zone_name=reading.zone_name
    )
