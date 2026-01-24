# 🛡️ LibraryRunCatcher

> **Automated Behavior Monitoring & Teacher Accountability System.**

LibraryRunCatcher is a premium, privacy-conscious PWA (Progressive Web App) designed for schools and libraries. It uses browser-side AI to automatically detect running and loud behavior, providing teachers with real-time alerts and photographic evidence for accountability.

---

## ✨ Key Features

-   **🚀 Auto-Detect Mode**: Uses MediaPipe Pose tracking and Web Audio API to monitor behavior in real-time.
-   **📽️ Advanced CCTV Grid Mode**:
    -   Virtual camera signals with multiple grid configurations (2×2, 3×3, 4×4)
    -   Independent cell detection with activity tracking
    -   Visual highlights and corner brackets for active cells
    -   Grid overlay in preview mode for easy calibration
-   **👁️ Preview Mode**: Toggle between skeleton view and real video feed for calibration
-   **📸 Smart Snapshot Capture**: Captures raw camera feed (not pose skeleton) with forensic overlays
-   **⌚ Librarian's Watch**: Sync multiple devices via private rooms with real-time haptic/audio alerts
-   **🖼️ Forensic Evidence**: Auto-captures snapshots with technical overlays, kinetic path trails, and sensor metadata
-   **📊 Premium Dashboard**: Glassmorphic UI with real-time speed/noise meters and status indicators
-   **📱 Cross-Platform PWA**: Installable on Mac, iOS, and Android for mobile monitoring
-   **🔒 Privacy-First**:
    -   Skeletal tracking for motion detection (no raw video storage by default)
    -   **5-Hour Ephemeral Retention**: All alerts and snapshots auto-delete after 5 hours
    -   Local processing with browser-side AI

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

### Troubleshooting
-   **Camera/Snapshot Issues**: Ensure camera permissions are granted
-   **Speed Meter Freezes**: Toggle preview mode off/on to reset
-   **Grid Not Working**: Check browser console for MediaPipe errors
-   **Audio Not Working**: Verify microphone permissions and test with browser audio

---

## 📖 How to Use

### Basic Setup
1.  **Grant Permissions**: When you open the app, allow Camera and Microphone access.
2.  **Toggle Auto-Detect**: Flip the "Auto-Detect" switch on the dashboard.

### Monitoring Features
3.  **Real-time Monitoring**:
    -   **Speed Meter**: Shows movement velocity in m/s
    -   **Noise Meter**: Shows real-time decibel levels
    -   **Status Badge**: Displays current activity state
4.  **Preview Mode**: Click the eye icon to toggle between:
    -   **Skeleton View**: Shows pose detection landmarks
    -   **Video Feed**: Shows real camera video for calibration

### Advanced CCTV Mode
5.  **Grid Configuration**:
    -   Enable "CCTV Grid Detection" in the settings panel
    -   Choose from preset grids: 2×2, 3×3, or 4×4
    -   Each cell monitors independently with activity tracking
    -   Active cells highlight with colored borders and brackets
6.  **Grid Calibration**:
    -   Use preview mode with grid overlay for positioning
    -   Adjust rows/columns to match your camera view
    -   Active cells show detection counts

### Alert Management
7.  **Review Alerts**: Recent violations appear in the sidebar with:
    -   **View Button**: Opens detailed snapshot modal
    -   **Sensor Data**: Time, noise level, movement speed
    -   **Evidence**: Forensic snapshot with overlays
    -   **PDF Export**: Generate accountability reports

### Librarian's Watch (Multi-device)
8.  **Device Sync**:
    -   Generate a sync code on your main device
    -   Join with the code on your phone/watch
    -   Receive haptic alerts when violations occur

### Installation
9.  **Install as App**:
    -   On **Mac/Chrome**: Click the "Install" icon in the URL bar
    -   On **iOS/Safari**: Tap "Share" → "Add to Home Screen"
    -   On **Android/Chrome**: Tap menu → "Add to Home Screen"

---

## 🔄 Recent Updates

### v2.x Features
-   **🆕 CCTV Grid Enhancements**: Improved cell activity tracking with visual highlights, corner brackets, and detection counters
-   **👁️ Enhanced Preview Mode**: Toggle between skeleton view and real video feed for better calibration
-   **📸 Raw Camera Capture**: Snapshots now capture actual video frames instead of pose skeletons
-   **🎯 Grid Overlay**: Preview mode shows grid lines for easy CCTV positioning
-   **⚡ Performance Fixes**: Resolved speed meter freezing in preview mode
-   **📊 Complete Sensor Data**: Alert snapshots now display accurate time, noise, and speed values
-   **🎨 UI Improvements**: Better visual feedback for active grid cells and cleaner preview interface

### Bug Fixes
-   Fixed "undefined" values in alert snapshot details
-   Resolved speed meter freezing when toggling preview mode
-   Improved canvas operations for better preview/skeleton switching
-   Enhanced pose detection reliability across different browsers

---

## ⚖️ License
Apache License 2.0 - Created for educational and behavioral correction purposes.

---
<p align="center">© 2029 APIWISH ANUTARAVANICHKUL</p>
