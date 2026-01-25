from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from .models import SensorReading, DetectionResult
from .logic import classify_behavior
from .config import settings
import os
import base64
import datetime
import json
from typing import Dict, List

app = FastAPI(title=settings.APP_NAME)

from fastapi.encoders import jsonable_encoder

class ConnectionManager:
    def __init__(self):
        # Dictionary mapping room_id to a list of WebSockets
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms:
            self.rooms[room_id].remove(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict):
        if room_id in self.rooms:
            # Important: Ensure the message is JSON serializable
            clean_message = jsonable_encoder(message)
            for connection in self.rooms[room_id]:
                try:
                    await connection.send_json(clean_message)
                except:
                    pass

manager = ConnectionManager()

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

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page():
    dashboard_path = os.path.join(settings.STATIC_DIR, "dashboard.html")
    with open(dashboard_path, "r") as f:
        return f.read()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Relay the message to all clients in the same room
                await manager.broadcast_to_room(room_id, message)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

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
        
        # Broadcast via WebSocket if room_id exists
        if reading.room_id:
            result.room_id = reading.room_id
            await manager.broadcast_to_room(reading.room_id, result.model_dump())
            
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

@app.get("/api/dashboard/stats")
async def dashboard_stats(request: Request):
    from .logic import get_dashboard_stats
    
    # Check for authentication
    auth_header = request.headers.get("X-Admin-Key")
    if not auth_header or auth_header != app.state.admin_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    return get_dashboard_stats()

# Admin Authentication
import random
import string

# Initialize admin password in app state
app.state.admin_password = "admin" # Default fallabck

@app.post("/api/auth/reset")
async def reset_admin_password():
    """Generates a new random 6-digit PIN for the session."""
    code = ''.join(random.choices(string.digits, k=6))
    app.state.admin_password = code
    return {"password": code}

    if data.get("password") == app.state.admin_password:
        return {"status": "ok"}
    raise HTTPException(status_code=401, detail="Invalid password")

# Email Logic
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_admin_email_task(recipient_email: str, pin: str):
    print(f"--- Attempting to send email to {recipient_email} ---")
    try:
        # Build MIME message
        msg = MIMEMultipart()
        msg['From'] = f"Library Run Catcher service <{settings.EMAIL_SENDER}>"
        msg['To'] = recipient_email
        msg['Subject'] = "Admin Dashboard Access PIN"
        body = f"""
        <html>
          <body>
            <h2>Library Run Catcher - Admin Access</h2>
            <p>You requested your current Admin Session PIN.</p>
            <p><strong>Current PIN:</strong> <span style='font-family: monospace; font-size: 24px;'>{pin}</span></p>
            <p>Use this code to unlock the dashboard.</p>
            <br>
            <small>If you did not request this, please ignore this email.</small>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        # Clean password (remove spaces)
        password = settings.EMAIL_PASSWORD.replace(" ", "")
        # Try STARTTLS first
        try:
            print("Connecting via STARTTLS (smtp.gmail.com:587)...")
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(settings.EMAIL_SENDER, password)
        except Exception as e_starttls:
            print(f"STARTTLS failed: {e_starttls}. Trying SSL fallback.")
            # Fallback to SSL on port 465
            import ssl
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context)
            server.login(settings.EMAIL_SENDER, password)
        # Send email
        server.sendmail(settings.EMAIL_SENDER, recipient_email, msg.as_string())
        server.quit()
        print(f"--- Email successfully sent to {recipient_email} ---")
    except Exception as e:
        print(f"!!! FAILED TO SEND EMAIL: {e} !!!")
        import traceback
        traceback.print_exc()

@app.post("/api/auth/forgot")
async def forgot_password(data: dict, background_tasks: BackgroundTasks):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    # Send current PIN to the provided email in background
    code = app.state.admin_password
    background_tasks.add_task(send_admin_email_task, email, code)
    
    return {"status": "sent", "message": "If the email is valid, the PIN has been sent."}
