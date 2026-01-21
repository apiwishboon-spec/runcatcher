from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "LibraryRunCatcher"
    DEBUG: bool = True
    
    # Thresholds
    SPEED_THRESHOLD_RUNNING: float = 5.0  # m/s (Lowered for sensitivity)
    NOISE_THRESHOLD_LOUD: float = 65.0    # dB (Lowered for sensitivity)
    
    # Simulation / Mocking
    SIMULATE_VISION: bool = True
    
    # Snapshot Storage (Mocked for now)
    SNAPSHOT_DIR: str = "snapshots"
    STATIC_DIR: str = "static"
    SNAPSHOT_RETENTION_HOURS: int = 2

    class Config:
        env_file = ".env"

settings = Settings()
