# 🛡️ LibraryRunCatcher

> **Automated Behavior Monitoring & Teacher Accountability System.**

LibraryRunCatcher is a premium, privacy-conscious PWA (Progressive Web App) designed for schools and libraries. It uses browser-side AI to automatically detect running and loud behavior, providing teachers with real-time alerts and photographic evidence for accountability.

---

## ✨ Key Features

-   **🚀 Auto-Detect Mode**: Uses MediaPipe Pose tracking and Web Audio API to monitor behavior in real-time.
-   **🖼️ Real Evidence Capture**: Auto-captures snapshots when violations occur (Running or Loud Noise).
-   **📊 Premium Dashboard**: Glassmorphic UI with real-time speed/noise meters.
-   **📱 Cross-Platform PWA**: Installable on Mac, iOS, and Android for mobile monitoring.
-   **🔒 Privacy-First**: 
    -   Skeletal tracking for motion (no raw video storage).
    -   **5-Hour Ephemeral Retention**: All alerts and snapshots are automatically deleted after 5 hours.

---

## 🛠️ Tech Stack

-   **Backend**: Python, FastAPI, Pydantic v2
-   **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript
-   **AI/Sensors**: MediaPipe Pose, Web Audio API
-   **UI Framework**: Bootswatch "United" (Premium Bootstrap Theme)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- A modern web browser with Camera and Microphone access.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/apiwishboon-spec/runcatcher.git
cd runcatcher

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the App
```bash
# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser to `http://127.0.0.1:8000`.

---

## 📖 How to Use

1.  **Grant Permissions**: When you open the app, allow Camera and Microphone access.
2.  **Toggle Auto-Detect**: Flip the "Auto-Detect" switch on the dashboard.
3.  **Monitor**: 
    -   The **Speed Meter** shows movement velocity.
    -   The **Noise Meter** shows real-time decibels.
4.  **Review Alerts**: Recent violations appear in the sidebar. Click **"View"** to see the snapshot, timestamp, and exact sensor readings.
5.  **Install as App**: 
    -   On **Mac/Chrome**: Click the "Install" icon in the URL bar.
    -   On **iOS/Safari**: Tap "Share" -> "Add to Home Screen".

---

## ⚖️ License
Apache License 2.0 - Created for educational and behavioral correction purposes.
