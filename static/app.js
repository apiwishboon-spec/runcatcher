// DOM Elements
const simulatorForm = document.getElementById('simulator-form');
const alertsContainer = document.getElementById('alerts-container');
const liveToggle = document.getElementById('live-toggle');
const cameraContainer = document.getElementById('camera-container');
const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');

// State icons/colors
const icons = { QUIET: 'smile', LOUD: 'megaphone', RUNNING_DETECTED: 'zap' };
const colors = { QUIET: 'success', LOUD: 'info', RUNNING_DETECTED: 'danger' };
const auraClasses = { QUIET: 'aura-peaceful', LOUD: 'aura-warning', RUNNING_DETECTED: 'aura-alert' };

const waveformCanvas = document.getElementById('waveform-canvas');
const waveformCtx = waveformCanvas ? waveformCanvas.getContext('2d') : null;

if (waveformCanvas) {
    waveformCanvas.width = waveformCanvas.offsetWidth;
    waveformCanvas.height = 40;
}

// Detection State
let isLive = false;
let lastPoseTime = 0;
let lastX = 0;
let audioContext, analyser, dataArray;
let noiseThreshold = 75; // dB
let speedThreshold = 8.0; // m/s (approx pixels/sec normalized)
let currentZone = 'reading_area'; // Default zone

// --- MediaPipe Setup ---
const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(async (results) => {
    await onResults(results);
});

async function onResults(results) {
    if (!isLive) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Privacy: Only draw skeleton, not the raw video
    if (results.poseLandmarks) {
        // Simple Speed Calculation
        const now = performance.now();
        const hipX = results.poseLandmarks[24].x; // Right hip X

        if (lastPoseTime > 0) {
            const dt = (now - lastPoseTime) / 1000;
            const dx = Math.abs(hipX - lastX);
            const speed = (dx / dt) * 5; // Simplified scale

            // Update UI Stats & Meter
            document.getElementById('stat-speed').innerText = speed.toFixed(1);
            const speedMeter = document.getElementById('speed-meter');
            if (speedMeter) {
                const percent = Math.min(100, speed * 20); // Map 0-5m/s to 0-100%
                speedMeter.style.width = percent + '%';
                speedMeter.className = speed > speedThreshold ? 'progress-bar bg-danger' : 'progress-bar bg-primary';
            }

            if (speed > speedThreshold) {
                const snapshotUrl = await captureSnapshot(currentZone);
                sendDetection(currentZone, speed, getNoiseLevel(), snapshotUrl);
            }
        }

        lastX = hipX;
        lastPoseTime = now;

        // Draw basic landmarks (Privacy-safe)
        drawLandmarks(results.poseLandmarks);
    }
    canvasCtx.restore();
}

function drawLandmarks(landmarks) {
    canvasCtx.fillStyle = '#e95420';
    for (const landmark of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 2, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
}

// --- Audio Setup ---
async function setupAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        drawWaveform();
    } catch (err) {
        console.warn('Microphone access denied:', err);
    }
}

function drawWaveform() {
    if (!isLive || !waveformCtx) return;
    requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    waveformCtx.lineWidth = 2;
    waveformCtx.strokeStyle = 'rgba(13, 110, 253, 0.5)';
    waveformCtx.beginPath();

    const sliceWidth = waveformCanvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * waveformCanvas.height / 2;

        if (i === 0) waveformCtx.moveTo(x, y);
        else waveformCtx.lineTo(x, y);

        x += sliceWidth;
    }

    waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
    waveformCtx.stroke();
}

function getNoiseLevel() {
    if (!analyser) return 40;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const avg = sum / dataArray.length;
    const level = 40 + (avg / 2); // Simple dB mapping

    // Update visual meter
    const meter = document.getElementById('noise-meter');
    if (meter) {
        const percent = Math.min(100, Math.max(0, (level - 40) * 2.5)); // Map 40-80dB to 0-100%
        meter.style.width = percent + '%';
        meter.className = level > 60 ? 'progress-bar bg-danger' : 'progress-bar bg-info';
    }

    return level;
}

// --- API Communication ---
async function sendDetection(zone, speed, noise, alert_snapshot_url = null) {
    try {
        const response = await fetch('/sensor/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                zone_name: zone,
                movement_speed: parseFloat(speed.toFixed(1)),
                noise_level: Math.round(noise),
                alert_snapshot_url: alert_snapshot_url
            })
        });
        const result = await response.json();
        updateUI(result);
    } catch (err) {
        console.error('API Error:', err);
    }
}

// --- UI Updates ---
function updateUI(result) {
    document.getElementById('stat-speed').innerText = result.movement_speed;
    document.getElementById('stat-noise').innerText = result.noise_level;
    document.getElementById('stat-streak').innerText = result.streak;
    document.getElementById('stat-zone').innerText = result.zone_name;

    const statusBadge = document.getElementById('status-badge');
    const statusMessage = document.getElementById('status-message');
    const mainIcon = document.getElementById('main-icon');
    const wrapper = document.querySelector('.status-icon-wrapper');
    const aura = document.getElementById('aura');

    // Update Aura
    if (aura) {
        aura.className = `aura-bg ${auraClasses[result.status]}`;
    }

    statusBadge.className = `badge bg-${colors[result.status]} py-2 px-3 rounded-pill`;
    statusBadge.innerText = result.status.replace('_', ' ');
    statusMessage.innerText = result.message;

    // Smooth Icon Swap
    if (mainIcon.getAttribute('data-lucide') !== icons[result.status]) {
        wrapper.style.transform = 'scale(0.8)';
        wrapper.style.opacity = '0';

        setTimeout(() => {
            mainIcon.setAttribute('data-lucide', icons[result.status]);
            mainIcon.className = `text-${colors[result.status]}`;
            lucide.createIcons();
            wrapper.style.transform = 'scale(1)';
            wrapper.style.opacity = '1';
        }, 200);
    }

    if (result.status !== 'QUIET') {
        wrapper.classList.add('alert-pulse');
        addAlertToList(result);
    } else {
        wrapper.classList.remove('alert-pulse');
    }
}

function addAlertToList(result) {
    const placeholder = document.getElementById('alerts-placeholder');
    if (placeholder) placeholder.remove();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const alertEl = document.createElement('div');
    alertEl.className = `p-3 bg-white rounded shadow-sm border alert-item alert-${result.status === 'RUNNING_DETECTED' ? 'running' : 'loud'}`;

    // Store metadata in data attributes for the modal
    alertEl.dataset.time = time;
    alertEl.dataset.timestamp = Date.now(); // Record current time for cleanup
    alertEl.dataset.noise = result.noise_level;
    alertEl.dataset.speed = result.movement_speed;
    alertEl.dataset.img = result.alert_snapshot_url;

    alertEl.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex gap-3 align-items-center">
                <img src="${result.alert_snapshot_url}" width="50" height="50" class="rounded object-fit-cover bg-light" alt="Face">
                <div>
                    <strong class="d-block">${result.status.replace('_', ' ')}</strong>
                    <small class="text-muted">${result.zone_name} • ${time}</small>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="showSnapshot(this.closest('.alert-item'))">View</button>
        </div>
    `;
    alertsContainer.prepend(alertEl);
}

async function captureSnapshot(zone) {
    if (!videoElement) return null;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;
    tempCanvas.height = videoElement.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    const dataUrl = tempCanvas.toDataURL('image/jpeg');

    try {
        const response = await fetch('/upload/snapshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zone, image: dataUrl })
        });
        const data = await response.json();
        return data.url;
    } catch (err) {
        console.error('Snapshot upload failed:', err);
        return null;
    }
}

function showSnapshot(element) {
    const modal = new bootstrap.Modal(document.getElementById('snapshotModal'));
    document.getElementById('snapshot-img').src = element.dataset.img;
    document.getElementById('modal-time').innerText = element.dataset.time;
    document.getElementById('modal-noise').innerText = element.dataset.noise + ' dB';
    document.getElementById('modal-speed').innerText = element.dataset.speed + ' m/s';
    modal.show();
}

// --- Live Toggle ---
liveToggle.addEventListener('change', async (e) => {
    isLive = e.target.checked;
    if (isLive) {
        cameraContainer.style.display = 'block';
        await setupAudio();
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await pose.send({ image: videoElement });
            },
            width: 480,
            height: 360
        });
        camera.start();

        // Polling for audio if not running
        const audioInterval = setInterval(async () => {
            if (!isLive) { clearInterval(audioInterval); return; }
            const noise = getNoiseLevel();
            document.getElementById('stat-noise').innerText = Math.round(noise);
            if (noise > noiseThreshold) {
                const snapshotUrl = isLive ? await captureSnapshot(currentZone) : null;
                sendDetection(currentZone, 0.1, noise, snapshotUrl);
            }
        }, 500);

    } else {
        cameraContainer.style.display = 'none';
        if (audioContext) audioContext.close();
    }
});

// --- Zone Management ---
const zoneSelect = document.getElementById('zone-select');
const newZoneInput = document.getElementById('new-zone-input');

// Update current zone when selection changes
if (zoneSelect) {
    zoneSelect.addEventListener('change', (e) => {
        currentZone = e.target.value;
        document.getElementById('stat-zone').innerText = formatZoneName(currentZone);
    });
}

function addNewZone() {
    const zoneName = newZoneInput.value.trim();
    if (!zoneName) {
        alert('Please enter a zone name');
        return;
    }

    // Convert to snake_case
    const zoneValue = zoneName.toLowerCase().replace(/\s+/g, '_');

    // Check if zone already exists
    const existingOptions = Array.from(zoneSelect.options).map(opt => opt.value);
    if (existingOptions.includes(zoneValue)) {
        alert('This zone already exists');
        return;
    }

    // Add new option
    const option = document.createElement('option');
    option.value = zoneValue;
    option.textContent = zoneName;
    zoneSelect.appendChild(option);

    // Select the new zone
    zoneSelect.value = zoneValue;
    currentZone = zoneValue;
    document.getElementById('stat-zone').innerText = zoneName;

    // Clear input
    newZoneInput.value = '';

    // Recreate icons for the add button
    lucide.createIcons();
}

function formatZoneName(zoneValue) {
    return zoneValue.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// --- Clear Alerts Function ---
function clearAllAlerts() {
    const alerts = alertsContainer.querySelectorAll('.alert-item');
    alerts.forEach(alert => alert.remove());
    alertsContainer.innerHTML = '<div id="alerts-placeholder" class="text-center text-muted py-5"><small>No recent alerts.</small></div>';
}

// --- Cleanup ---
// Check every minute for alerts older than 2 hours and remove them from UI
setInterval(() => {
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const now = Date.now();
    const alerts = alertsContainer.querySelectorAll('.alert-item');

    alerts.forEach(alert => {
        const timestamp = parseInt(alert.dataset.timestamp);
        if (now - timestamp > twoHoursInMs) {
            alert.remove();
        }
    });

    if (alertsContainer.children.length === 0) {
        alertsContainer.innerHTML = '<div class="text-center text-muted py-5"><small>No recent alerts.</small></div>';
    }
}, 60000);

// --- Fullscreen Toggle ---
function toggleFullscreen() {
    const monitoringCard = document.querySelector('.col-md-8 .card');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const icon = fullscreenBtn.querySelector('i');

    if (!document.fullscreenElement) {
        monitoringCard.requestFullscreen().then(() => {
            icon.setAttribute('data-lucide', 'minimize');
            lucide.createIcons();
        }).catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            icon.setAttribute('data-lucide', 'maximize');
            lucide.createIcons();
        });
    }
}

// Listen for fullscreen changes (e.g., ESC key)
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const icon = fullscreenBtn.querySelector('i');
    if (!document.fullscreenElement) {
        icon.setAttribute('data-lucide', 'maximize');
        lucide.createIcons();
    }
});

// PWA Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js');
}
