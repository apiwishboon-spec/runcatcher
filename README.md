# 🛡️ LibraryRunCatcher v3.0

> **Advanced AI-Powered Behavioral Monitoring, Interactive Floor Plans & Teacher Accountability**

LibraryRunCatcher is a sophisticated, privacy-first Monitoring Hub designed for educational environments. Utilizing cutting-edge browser-side AI, it automatically detects running and excessive noise while providing teachers with an interactive **Floor Plan Monitoring Hub** and multi-device synchronization.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688.svg)](https://fastapi.tiangolo.com/)

---

## ✨ Key Features

### 🗺️ Interactive Floor Plan Builder (New!)
- **Drag-and-Drop Layout**: Create a digital twin of your library with custom area shapes and camera nodes.
- **Snap-to-Grid Design**: Build precise layouts with a toggleable 24px grid system.
- **Live Snapshot Tooltips**: Click any pulsing red camera node to reveal a live evidence snapshot, timestamp, and zone data without leaving the map.
- **Alert Persistence**: Red alerts stay visible for **60 seconds**, ensuring you never miss an incident even if it happens while you're away.

### 🤖 Advanced AI Detection
- **Real-time Pose Tracking**: MediaPipe-powered skeletal analysis for precise movement detection.
- **Audio Monitoring**: Web Audio API with FFT analysis for noise level detection.
- **Smart Thresholds**: Intelligent detection of running (>10 m/s) and disruptive noise (>75 dB).

### 🔄 Multi-Device Synchronization
- **Librarian's Watch Sync**: Pair laptops with mobile phones/watches for instant haptic notifications.
- **Room Code Pairing**: Secure, ephemeral pairing for private monitoring sessions.
- **Zone Syncing**: Automatically import your custom Floor Plan names into the mobile monitoring station with one click.

### 📸 Forensic Evidence Capture
- **Real-time Snapshots**: High-quality photo capture (not just skeleton overlays) upon detection.
- **Forensic Overlays**: Red target framing, kinetic path trails, and technical metadata.
- **PDF Report Generation**: Professional incident reports ready for printing or digital distribution.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, FastAPI, Pydantic v2, Uvicorn
- **Frontend**: Vanilla HTML5, ES6 Javacript, CSS3 (Glassmorphism & Tailwind)
- **AI/ML**: MediaPipe Pose v0.5, Web Audio API (FFT Analysis)
- **UI Framework**: Bootstrap 5 + Lucide Icons + Chart.js
- **Persistence**: Session-based in-memory storage (with JSON Layout Backup)

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/apiwishboon-spec/runcatcher.git
cd runcatcher

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Access**: 
- **Monitoring Station**: `http://127.0.0.1:8000/`
- **Admin Dashboard**: `http://127.0.0.1:8000/dashboard` (Requires session PIN)

### Admin Setup
1. Open the monitoring station to generate your unique **6-digit Session PIN**.
2. Navigate to the **Admin Dashboard**.
3. Use the **Floor Plan Builder** to drag cameras onto your library layout.
4. **Save Layout** to sync across all devices.

---

## 🛡️ Privacy & Compliance

- **No Video Storage**: Raw video data never leaves the browser.
- **Client-Side AI**: All pose estimation is done locally on the monitoring device.
- **Ephemeral Evidence**: Snapshots are automatically deleted after 5 hours to ensure privacy compliance.
- **No Biometrics**: Detection is based on skeletal motion patterns, not facial recognition.

---

## 📄 License

**Apache License 2.0**

© 2026 APIWISH ANUTARAVANICHKUL
Created for educational behavioral reinforcement and safety monitoring.
