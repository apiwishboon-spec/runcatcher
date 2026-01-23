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
    ai_analysis = None
    
    # Check running first (higher priority)
    if reading.movement_speed > settings.SPEED_THRESHOLD_RUNNING:
        status = BehaviorStatus.RUNNING_DETECTED
        message = "Running detected! Please walk for safety."
        ai_analysis = (
            f"Observation: At {time.strftime('%H:%M:%S')}, a student in the {reading.zone_name} exhibited "
            f"a sudden burst of velocity ({reading.movement_speed} m/s). This kinetic anomaly suggests "
            "a loss of locomotor control or a breakdown in hallway decorum. Recommend intervention."
        )
        if not snapshot_url:
            snapshot_url = "/static/logo.png"
        zone_streaks[reading.zone_name] = 0
        
    elif reading.noise_level > settings.NOISE_THRESHOLD_LOUD:
        status = BehaviorStatus.LOUD
        message = "Noise level is high. Shhh!"
        ai_analysis = (
            f"Acoustic analysis triggered in {reading.zone_name}. Amplitude hit {reading.noise_level} dB, "
            "exceeding standard library quietude limits. This frequency spike correlates with social disruption. "
            "Advise a gentle shush sequence."
        )
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
        zone_name=reading.zone_name,
        ai_analysis=ai_analysis
    )
