from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "LibraryRunCatcher"
    DEBUG: bool = True
    
    # Thresholds
    SPEED_THRESHOLD_RUNNING: float = 8.0  # m/s
    NOISE_THRESHOLD_LOUD: float = 75.0    # dB
    
    # Simulation / Mocking
    SIMULATE_VISION: bool = True
    
    # Snapshot Storage (Mocked for now)
    SNAPSHOT_DIR: str = "snapshots"
    STATIC_DIR: str = "static"
    SNAPSHOT_RETENTION_HOURS: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
