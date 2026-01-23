from pydantic import BaseModel
from typing import Optional
from enum import Enum

class BehaviorStatus(str, Enum):
    QUIET = "QUIET"
    LOUD = "LOUD"
    RUNNING_DETECTED = "RUNNING_DETECTED"

class SensorReading(BaseModel):
    movement_speed: float
    noise_level: float
    zone_name: str
    alert_snapshot_url: Optional[str] = None

class DetectionResult(BaseModel):
    status: BehaviorStatus
    message: str
    streak: int
    alert_snapshot_url: Optional[str] = None
    zone_name: str
