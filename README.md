# 🛡️ LibraryRunCatcher v2.0

> **Advanced AI-Powered Behavioral Monitoring & Teacher Accountability System**

LibraryRunCatcher is a sophisticated, privacy-first PWA designed for educational environments. Utilizing cutting-edge browser-side AI, it automatically detects running and excessive noise while providing teachers with comprehensive evidence and multi-device synchronization capabilities.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688.svg)](https://fastapi.tiangolo.com/)

---

## ✨ Key Features

### 🤖 Advanced AI Detection
- **Real-time Pose Tracking**: MediaPipe-powered skeletal analysis for precise movement detection
- **Audio Monitoring**: Web Audio API with FFT analysis for noise level detection
- **Smart Thresholds**: Configurable sensitivity for running (>10 m/s) and noise (>75 dB)

### 📹 CCTV-Style Grid Monitoring
- **Virtual Multi-Camera**: 2×2, 3×3, 4×4 grid layouts with independent cell detection
- **Activity Visualization**: Color-coded cell highlighting with CCTV-style corner brackets
- **Cell Statistics**: Activity counters and real-time status per camera zone
- **Grid Calibration**: Preview mode with overlay for perfect alignment

### 🔄 Multi-Device Synchronization
- **Librarian's Watch**: Sync laptops with phones/watches for instant notifications
- **Real-time Alerts**: Haptic feedback and audio alerts on secondary devices
- **Emergency Summon**: One-tap alert to all synced devices with location info
- **Private Rooms**: Secure, code-based device pairing

### 📸 Forensic Evidence Capture
- **Real Camera Snapshots**: Actual photos (not skeleton overlays) with evidence metadata
- **Forensic Overlays**: Red bounding boxes, status labels, timestamps, and kinetic trails
- **PDF Reports**: Individual and bulk incident reports with evidence
- **Ephemeral Storage**: 5-hour automatic cleanup for privacy compliance

### 🎨 Premium User Experience
- **Glassmorphic UI**: Modern, translucent design with real-time sensor meters
- **Preview Mode**: Clean camera feed without skeleton distractions
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **PWA Support**: Installable app with offline capabilities

### 🔒 Privacy & Security First
- **Client-side AI**: No video data ever leaves the device
- **No Raw Video Storage**: Only processed evidence snapshots
- **Automatic Cleanup**: 5-hour retention with background deletion
- **No Personal Data**: Skeletal tracking only - no faces or identifiers

---

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, FastAPI, Pydantic v2, Uvicorn
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), ES6+ JavaScript
- **AI/ML**: MediaPipe Pose v0.5, Web Audio API, FFT Analysis
- **UI Framework**: Bootstrap 5 (United Theme), Lucide Icons
- **Real-time**: WebSocket, Server-Sent Events
- **PWA**: Service Workers, Web App Manifest
- **PDF Generation**: jsPDF, HTML5 Canvas

---

## 🚀 Quick Start

### Prerequisites
- **Python**: 3.9 or higher
- **Browser**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Hardware**: Webcam + microphone, 4GB RAM minimum

### Installation

```bash
# Clone repository
git clone https://github.com/apiwishboon-spec/runcatcher.git
cd runcatcher

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Access**: Open `http://127.0.0.1:8000` in your browser

---

## 📖 Usage Guide

### Basic Monitoring

1. **Grant Permissions**: Allow camera and microphone access
2. **Enable Auto-Detect**: Toggle the main switch
3. **Monitor Sensors**: Watch real-time speed/noise meters
4. **Review Alerts**: Click "View" on sidebar alerts for evidence

### Advanced Features

#### CCTV Grid Mode
```bash
1. Enable "CCTV Grid Configuration"
2. Choose preset: 2×2, 3×3, or 4×4
3. Use Preview mode (👁️) for calibration
4. Monitor independent cell activity
```

#### Librarian's Watch Sync
```bash
# On laptop (station):
1. Generate sync code
2. Click "Join"

# On phone (watch):
1. Open same URL
2. Enter code and "Join"
3. Keep browser active for notifications
```

#### Zone Management
- **Built-in Zones**: Reading Area, Computer Lab, Study Hall, Quiet Zone
- **Custom Zones**: Add unlimited custom monitoring areas
- **Independent Tracking**: Each zone maintains separate statistics

### PWA Installation

#### Desktop (Chrome/Edge)
- Click install icon in address bar
- Or: Menu → "Install LibraryRunCatcher"

#### Mobile (iOS Safari)
- Tap Share → "Add to Home Screen"

#### Mobile (Android Chrome)
- Menu → "Add to Home Screen"

---

## 📊 System Architecture

### Detection Pipeline
```
Camera Feed → MediaPipe Pose → Centroid Tracking → Speed Analysis
Audio Input → FFT Analysis → dB Calculation → Threshold Comparison
```

### Data Flow
```
Detection Event → Snapshot Capture → Forensic Overlay → PDF Report
                 ↓
WebSocket Broadcast → Librarian's Watch → Haptic Alert
```

### Privacy Architecture
- **Zero Server Storage**: All AI processing client-side
- **Ephemeral Evidence**: 5-hour automatic cleanup
- **No Raw Video**: Only processed snapshots with metadata

---

## 🔧 Configuration

### Detection Thresholds
```python
SPEED_THRESHOLD_RUNNING = 10.0  # m/s
NOISE_THRESHOLD_LOUD = 75       # dB
```

### Grid Presets
- **2×2**: 4 virtual cameras (balanced)
- **3×3**: 9 virtual cameras (detailed)
- **4×4**: 16 virtual cameras (maximum coverage)

### Retention Settings
- **Alert Lifespan**: 5 hours
- **Cleanup Interval**: Every 60 seconds
- **File Format**: JPEG with metadata overlay

---

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| "Camera access denied" | Check browser permissions, reload page |
| Speed meter frozen | Toggle preview mode, refresh browser |
| Grid not displaying | Enable grid mode, check preview |
| Watch not syncing | Verify same URL and code, check network |
| "Undefined" in alerts | Restart server, clear browser cache |

### Performance Tips
- Use Chrome for best performance
- Close unnecessary browser tabs
- Ensure stable internet for sync features
- 8GB RAM recommended for large grids

---

## 📚 Documentation

- **[Complete Manual](MANUAL.md)**: Comprehensive user guide with screenshots
- **API Documentation**: Available at `/docs` when server is running
- **Code Examples**: See `app/` directory for backend implementation

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black .
isort .
```

---

## 📄 License

**Apache License 2.0**

Created for educational and behavioral correction purposes. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **MediaPipe** for pose detection technology
- **FastAPI** for the robust backend framework
- **Bootstrap** for the beautiful UI components
- Educational institutions using this for positive behavioral reinforcement

---

<p align="center">
  <strong>LibraryRunCatcher v2.0</strong><br>
  Advanced AI-Powered Behavioral Monitoring<br>
  © 2029 APIWISH ANUTARAVANICHKUL
</p>
