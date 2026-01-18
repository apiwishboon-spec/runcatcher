from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from .models import SensorReading, DetectionResult
from .logic import classify_behavior
from .config import settings
import os
import base64
import datetime

app = FastAPI(title=settings.APP_NAME)

# Ensure directories exist
os.makedirs(settings.SNAPSHOT_DIR, exist_ok=True)
os.makedirs("static", exist_ok=True)

# Mount static files and snapshots
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")
app.mount("/snapshots", StaticFiles(directory=settings.SNAPSHOT_DIR), name="snapshots")

@app.get("/", response_class=HTMLResponse)
async def root():
    index_path = os.path.join(settings.STATIC_DIR, "index.html")
    with open(index_path, "r") as f:
        return f.read()

@app.post("/upload/snapshot")
async def upload_snapshot(data: dict):
    """
    Receives base64 image data and saves it to the snapshots directory.
    """
    try:
        header, encoded = data["image"].split(",", 1)
        image_data = base64.b64decode(encoded)
        filename = f"{data['zone']}_{int(datetime.datetime.now().timestamp())}.jpg"
        filepath = os.path.join(settings.SNAPSHOT_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_data)
            
        return {"url": f"/snapshots/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def cleanup_old_snapshots():
    """Simple cleanup task for files older than X hours."""
    now = datetime.datetime.now().timestamp()
    limit = settings.SNAPSHOT_RETENTION_HOURS * 3600
    if not os.path.exists(settings.SNAPSHOT_DIR):
        return
    for f in os.listdir(settings.SNAPSHOT_DIR):
        path = os.path.join(settings.SNAPSHOT_DIR, f)
        if os.stat(path).st_mtime < (now - limit):
            try:
                os.remove(path)
            except:
                pass

@app.post("/sensor/reading", response_model=DetectionResult)
async def process_sensor_reading(reading: SensorReading, background_tasks: BackgroundTasks):
    """
    Endpoint to receive sensor data and return behavioral classification.
    """
    background_tasks.add_task(cleanup_old_snapshots)
    try:
        result = classify_behavior(reading, reading.alert_snapshot_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Future endpoint for teachers to view snapshots
@app.get("/alerts/{zone_name}")
async def get_alerts(zone_name: str):
    # This would query a database of recently triggered snapshots
    return {"zone": zone_name, "alerts": []}
