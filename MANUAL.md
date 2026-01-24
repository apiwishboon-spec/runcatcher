# 📋 LibraryRunCatcher Administrator Manual

## Overview
LibraryRunCatcher is an automated behavior monitoring system designed for educational environments. It uses advanced AI and sensor technologies to detect and document inappropriate behavior in real-time.

## System Requirements
- **Browser**: Modern web browser with WebRTC support (Chrome 88+, Firefox 85+, Safari 14+)
- **Hardware**: Camera and microphone access required
- **Network**: Internet connection for MediaPipe CDN resources
- **Permissions**: Camera, microphone, and notification permissions

## Installation & Setup

### 1. Server Installation
```bash
git clone https://github.com/apiwishboon-spec/runcatcher.git
cd runcatcher
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Client Setup
1. Navigate to `http://127.0.0.1:8000`
2. Grant camera and microphone permissions
3. Install as PWA (optional)

## Core Features

### Auto-Detection Mode
- **Pose Tracking**: MediaPipe AI detects human movement patterns
- **Audio Monitoring**: Web Audio API analyzes noise levels
- **Threshold Settings**:
  - Speed: 10.0 m/s (configurable)
  - Noise: 75 dB (configurable)

### CCTV Grid Mode
- **Grid Configurations**: 2×2, 3×3, 4×4 virtual cameras
- **Cell Monitoring**: Independent detection per grid cell
- **Activity Tracking**: Visual highlights for active cells
- **Calibration**: Grid overlay in preview mode

### Preview Mode
- **Skeleton View**: Shows pose detection landmarks
- **Video Feed**: Real camera video for calibration
- **Grid Overlay**: Visual grid lines for positioning

## Operating Procedures

### Daily Operation
1. **Morning Setup**:
   - Launch the application
   - Enable Auto-Detect mode
   - Configure CCTV grid if needed
   - Test camera and audio

2. **Monitoring**:
   - Observe real-time meters
   - Review alert sidebar
   - Use preview mode for calibration

3. **Alert Response**:
   - Review snapshot details
   - Generate PDF reports
   - Clear old alerts (auto-cleanup after 5 hours)

### CCTV Grid Setup
1. Enable "CCTV Grid Detection"
2. Select grid size (2×2, 3×3, 4×4)
3. Use preview mode to position grid
4. Monitor cell activity indicators

### Multi-Device Sync
1. Generate sync code on main device
2. Join with code on secondary devices
3. Configure alert preferences

## Technical Specifications

### Detection Algorithms
- **Movement Detection**: Euclidean distance calculation with pose landmarks
- **Speed Calculation**: Velocity-based analysis with smoothing buffer
- **Noise Analysis**: Frequency domain analysis via Web Audio API

### Data Retention
- **Alerts**: 5-hour automatic cleanup
- **Snapshots**: 5-hour automatic cleanup
- **Local Processing**: No server-side video storage

### Performance
- **Frame Rate**: 30 FPS processing
- **Latency**: <100ms detection response
- **Resource Usage**: Browser-side AI processing

## Troubleshooting

### Common Issues
- **Camera Not Working**: Check permissions, try different browser
- **Audio Not Detected**: Verify microphone access, test browser audio
- **Speed Meter Freezes**: Toggle preview mode off/on
- **Grid Not Displaying**: Check console for MediaPipe errors

### Performance Optimization
- Close unnecessary browser tabs
- Use dedicated monitoring device
- Regular browser updates recommended

## Security & Privacy

### Data Handling
- **No Video Storage**: Raw video never stored on server
- **Local Processing**: AI analysis happens in browser
- **Ephemeral Data**: All evidence auto-deletes after 5 hours
- **Privacy Controls**: Skeletal tracking only (no facial recognition)

### Network Security
- **HTTPS Recommended**: Use SSL in production
- **Local Operation**: Can run without internet (except CDN resources)
- **WebRTC Security**: Encrypted peer connections

## Maintenance

### Regular Tasks
- **Clear Old Data**: Automatic cleanup handles most cases
- **Browser Updates**: Keep browser current for best performance
- **Permission Checks**: Verify camera/microphone access regularly

### Backup Considerations
- **Configuration**: Settings stored locally in browser
- **Evidence**: Auto-deletion policy prevents accumulation
- **Reports**: Generate PDFs for long-term storage

## API Reference

### Sensor Reading Endpoint
```
POST /sensor/reading
Content-Type: application/json

{
  "zone_name": "reading_area",
  "movement_speed": 2.5,
  "noise_level": 65,
  "alert_snapshot_url": "optional_url",
  "room_id": "optional_sync_code"
}
```

### Upload Snapshot
```
POST /upload/snapshot
Content-Type: application/json

{
  "zone": "reading_area",
  "image": "base64_data_url"
}
```

## Support & Updates

### Getting Help
- Check browser console for errors
- Verify all permissions granted
- Test with different browsers/devices

### Updates
- Regular updates via GitHub repository
- Check release notes for new features
- Backup configurations before updates

---

**Version**: 2.x
**Last Updated**: January 2026
**Author**: APIWISH ANUTARAVANICHKUL
