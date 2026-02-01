# � LibraryRunCatcher
### "Smart monitoring for quiet study spaces"

**LibraryRunCatcher** is a high-performance, multi-tenant monitoring system designed to maintain peace and safety in study environments. Using real-time pose detection (MediaPipe) and auditory analysis, it identifies running and noise disturbances instantly, allowing librarians to manage their spaces effectively.

---

## 🚀 Key Features

### ⚡ Real-Time Monitoring (WebSockets)
Experience zero-latency alerts. The system uses advanced WebSocket technology to broadcast sensor data. Cameras on the interactive map pulse red the exact millisecond an incident occurs.

### 🏢 Multi-Tenant Room Architecture
Run hundreds of libraries on a single server. Each library instance is isolated via a unique **Room Code**.
- **Data Isolation**: Alerts, stats, and maps are strictly private to each room.
- **Dynamic Security**: Every room generates a unique 6-digit **Admin PIN** for dashboard access.

### 🗺️ Interactive Floor Plan Architect
Build your own library map with a powerful drag-and-drop interface:
- **Custom Shapes**: Define study zones and bookshelves.
- **Node Placement**: Place cameras exactly where they are in the physical room.
- **Auto-Sync**: Layout changes are automatically saved to the server memory in real-time.

### 💾 .LRC Backup & Portability
Since the server uses ephemeral in-memory storage for maximum speed, you have full control over your data:
- **Export**: Save your complex floor plans as a secure, obfuscated `.lrc` file.
- **Restore**: Upload your `.lrc` file to instantly restore any library map.
- **Integrity**: Files are protected against manual tampering.

### ⌚ Librarian's Watch
Sync multiple devices (phones, tablets, PCs) to a single room. Every device acts as a sensor and an alert receiver simultaneously.

---

## 💡 Use Cases

### 🏛️ In the Library: "Silent Study Enforcement"
Librarians can use the interactive map to identify recurring "hotspots" of movement or noise. For example, if a specific corner frequently pulses red, it may indicate a need for more study carrels, better acoustic padding, or a relocation of loud equipment.

### 🏢 Beyond Libraries: "Museum & Gallery Guard"
**LibraryRunCatcher** isn't just for books. In art galleries or museums, the system can monitor fragile "No-Run" zones. If a visitor moves too quickly (running) near a precious artifact, the system can trigger an immediate auditory alert and capture a snapshot for security, keeping the exhibits safe.

### 💻 Co-working Spaces: "Focus Zone Integrity"
Premium co-working offices use this to maintain "Deep Work" floors. Real-time noise monitoring ensures that phone calls and loud conversations are kept to designated meeting rooms, preserving the high-focus environment that members pay for.

---

## 🛠️ Technology Stack
- **Backend**: FastAPI (Python 3.x)
- **Real-time**: WebSockets for instant synchronization.
- **Frontend**: Vanilla JS, TailwindCSS, Lucide Icons.
- **Vision**: MediaPipe Pose Detection.
- **Audio**: Web Audio API for decibel monitoring.

---

## 🏁 Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Monitor Your Space**:
   - Open `http://localhost:8000`.
   - Click **"Librarian's Watch"** to generate a Room Code.
   - Note your **Admin PIN** for the dashboard.
   - Start detecting!

---

## � Security Information
- **Session-Based**: Authentication is tied to the current room session.
- **Private Data**: Snapshots are automatically cleaned up every 5 hours.
- **Encrypted Exports**: Map backups use Base64 obfuscation with integrity headers.

---

## ⚖️ License & Copyright
© 2029 APIWISH ANUTARAVANICHKUL. All rights reserved.
"Smart monitoring for quiet study spaces"
