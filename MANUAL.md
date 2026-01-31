# LibraryRunCatcher

**Operational Manual - Version 5.1**

---

## Project Overview

LibraryRunCatcher is a specialized security system designed for library and classroom management. It identifies real-time behavioral violations using AI pose estimation and acoustic frequency monitoring.

**Key Features:**
- Real-time AI-powered pose tracking and movement analysis
- Acoustic frequency monitoring with configurable thresholds
- CCTV-style grid detection with virtual camera mapping
- Multi-device synchronization (Librarian's Watch)
- Forensic evidence capture with kinetic path trails
- Ephemeral 5-hour data retention for privacy compliance
- Progressive Web App (PWA) support

---

## Monitoring Dashboard

**Figure 1: Live dashboard with real-time speed and noise meters.**

The main interface provides:
- **Auto-Detect Toggle**: Master switch for AI monitoring system
- **Preview Button** (👁️): Toggle between status display and live camera feed
- **Fullscreen Button** (⛶): Expand monitoring to full screen
- **Emergency Summon** (🚨): Alert all synced Librarian's Watch devices

**Sensor Meters:**
- **Speed Meter**: Real-time movement velocity in m/s
- **Noise Meter**: Real-time audio levels in dB
- **Streak Counter**: Consecutive quiet periods
- **Zone Display**: Current monitoring zone with grid cell info

---

## □ Librarian's Watch *(NEW)*

The Librarian's Watch feature allows you to turn any smartphone or wearable device into a remote haptic pager. This is critical for librarians who need to move around the building while remaining "on alert."

**Setup Process:**

1. **Generate Code**: On the monitoring laptop, click the refresh icon (🔄) in the "Librarian's Watch" section
2. **Sync Device**: Open the same URL on your phone/watch and enter the generated Room Code
3. **Go Mobile**: When a runner is detected, your phone will vibrate and chime instantly

**Pro Tip:** Keep the browser tab open on your phone. Most modern smartphones will vibrate even if the phone is in your pocket, as long as the page is active.

---

## CCTV Grid & CCTV Cell Mapping

Automatically map detection triggers to specific virtual camera feeds in a multi-camera grid layout $(2 \times 2, 3 \times 3, \text{etc.})$ .

**Figure 2: Configuring multi-camera grid detection.**

**Grid Features:**
- **Virtual Cameras**: Each cell acts as independent camera (Cam 1, Cam 2, etc.)
- **Activity Highlighting**: Color-coded cell backgrounds (🔴 Red = Running, 🟡 Cyan = Loud, 🔵 Deep Blue = Activity)
- **Corner Brackets**: CCTV-style brackets on active cells
- **Activity Counters**: Detection count per cell (e.g., "Cam 1 (5)")
- **Fade Effects**: Highlights disappear after 3 seconds

**Quick Presets:** 2×2, 3×3, 4×4 grid configurations

---

## Preview Mode

**Access:** Click the eye icon (👁️) in the monitoring card

**Features:**
- **Real Video Feed**: Raw camera output without skeleton overlays
- **Grid Calibration**: Perfect for aligning CCTV grid with physical space
- **Clean Interface**: No distracting face tracking boxes
- **Real-time Overlay**: Grid lines and active cell indicators (when grid enabled)

---

## Forensic Evidence Reports

Incident reports now feature **Kinetic Path Trails** and **Target Framing** to identify exactly who triggered the alarm.

**Report Contents:**
- Detection type (Running/Loud)
- Zone location with camera cell info
- Exact timestamp
- Movement speed (m/s)
- Noise level (dB)
- High-resolution evidence image with forensic overlays

---

## Technical Specifications

### Detection Algorithms
- **Pose Tracking**: MediaPipe Pose v0.5 with 33 keypoints
- **Movement Analysis**: Centroid tracking with perspective correction
- **Audio Processing**: Web Audio API with FFT analysis
- **Thresholds**: Speed > 10.0 m/s, Noise > 75 dB

### System Requirements
- **Browser**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Hardware**: Webcam + microphone, 4GB RAM minimum
- **Network**: Internet connection for sync features

### Privacy & Security
- **Client-side AI**: No video data leaves the device
- **Ephemeral Storage**: 5-hour automatic cleanup
- **No Personal Data**: Skeletal tracking only
- **HTTPS Required**: Secure connections enforced

---

## Installation & Setup

### Quick Start
```bash
git clone https://github.com/apiwishboon-spec/runcatcher.git
cd runcatcher
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Access:** Open `http://127.0.0.1:8000` in your browser

### PWA Installation
- **Desktop**: Click install icon in browser address bar
- **Mobile**: Add to Home Screen from share menu
- **Features**: Offline access, push notifications, native app feel

---

## Troubleshooting

### Common Issues
- **Camera/Microphone Access**: Check browser permissions, reload page
- **Speed Meter Frozen**: Toggle preview mode, refresh browser
- **Grid Not Working**: Enable grid mode, try different presets
- **Watch Not Syncing**: Verify same URL and code, check network
- **"Undefined" Values**: Restart server, clear browser cache

### Performance Tips
- Use Chrome for best performance
- Close unnecessary browser tabs
- 8GB RAM recommended for large grids
- Stable internet for sync features

---

## Incident Report Example

# LibraryRunCatcher

**Incident Accountability Report**

## Incident Details

**Type:** RUNNING DETECTED
**Zone:** reading_area (Cam 2)
**Date/Time:** 1/24/2026, 12:34:56 PM

## Sensor Data

**Movement Speed:** 12.3 m/s
**Noise Level:** 82 dB

## Visual Evidence

*[Forensic-enhanced snapshot with red bounding box, kinetic path trail, and timestamp overlay]*

## Teacher Signature

__________________________

**Page 1 of 1**

---

**© 2026 APIWISH ANUTARAVANICHKUL**

*LibraryRunCatcher v5.1.0 - Advanced Behavioral Monitoring System*

**Confidential Instructional Material — For Authorized Personnel Only**
