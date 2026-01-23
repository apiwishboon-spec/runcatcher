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

// Detection State
let isLive = false;
let isPreview = false;
let lastPoseTime = 0;
let lastCentroid = { x: 0, y: 0 };
let lastBoundingBox = null;
let speedBuffer = [];
let pathHistory = [];
const BUFFER_SIZE = 5;
const PATH_HISTORY_SIZE = 15;
let audioContext, analyser, dataArray;
let noiseThreshold = 75; // dB
let speedThreshold = 10.0; // m/s (approx pixels/sec normalized)
let currentZone = 'reading_area'; // Default zone
let gridMode = false;
let gridRows = 2;
let gridCols = 2;
let watchSocket = null;
let currentRoomId = null;
let globalCamera = null;

pose.onResults(async (results) => {
    await onResults(results);
});

const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

async function onResults(results) {
    if (!isLive) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (gridMode) {
        drawGrid();
    }

    if (results.poseLandmarks) {
        const now = performance.now();
        const lp = results.poseLandmarks;

        // 1. Calculate Centroid (Mid-point of hips) for stable tracking
        const currentCentroid = {
            x: (lp[23].x + lp[24].x) / 2,
            y: (lp[23].y + lp[24].y) / 2
        };

        // 2. Normalization: Use person's torso height to handle perspective
        // Distance between shoulders and hips helps estimate distance from camera
        const shoulderY = (lp[11].y + lp[12].y) / 2;
        const hipY_avg = (lp[23].y + lp[24].y) / 2;
        const torsoHeight = Math.abs(hipY_avg - shoulderY);
        const perspectiveFactor = 0.3 / Math.max(0.05, torsoHeight);

        // Calculate specific zone if in grid mode
        let effectiveZone = currentZone;
        if (gridMode) {
            const row = Math.floor(currentCentroid.y * gridRows);
            const col = Math.floor(currentCentroid.x * gridCols);
            const camId = (row * gridCols) + col + 1;
            effectiveZone = `${currentZone} (Cam ${camId})`;
            document.getElementById('stat-zone').innerText = effectiveZone;
        } else {
            document.getElementById('stat-zone').innerText = formatZoneName(currentZone);
        }

        if (lastPoseTime > 0) {
            const dt = (now - lastPoseTime) / 1000;
            let dx = currentCentroid.x - lastCentroid.x;
            let dy = currentCentroid.y - lastCentroid.y;

            // Euclidean distance for velocity (captures X and Y movement)
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Adjust for grid and perspective
            if (gridMode) distance *= gridCols;
            distance *= perspectiveFactor;

            const instantSpeed = (distance / dt) * 5;

            // 3. Smoothing: Moving Average Buffer
            speedBuffer.push(instantSpeed);
            if (speedBuffer.length > BUFFER_SIZE) speedBuffer.shift();
            const speed = speedBuffer.reduce((a, b) => a + b, 0) / speedBuffer.length;

            document.getElementById('stat-speed').innerText = speed.toFixed(1);
            const speedMeter = document.getElementById('speed-meter');
            if (speedMeter) {
                const percent = Math.min(100, speed * 20);
                speedMeter.style.width = percent + '%';
                speedMeter.className = speed > speedThreshold ? 'progress-bar bg-danger' : 'progress-bar bg-primary';
            }

            if (speed > speedThreshold) {
                const snapshotUrl = await captureSnapshot(effectiveZone);
                sendDetection(effectiveZone, speed, getNoiseLevel(), snapshotUrl);
            }
        }

        lastCentroid = currentCentroid;
        lastPoseTime = now;

        // 5. Store path history
        pathHistory.push({ x: currentCentroid.x, y: currentCentroid.y });
        if (pathHistory.length > PATH_HISTORY_SIZE) pathHistory.shift();

        // 4. Calculate Bounding Box for Highlighting
        lastBoundingBox = getBoundingBox(results.poseLandmarks);

        drawLandmarks(results.poseLandmarks);

        // Draw real-time box in preview
        if (isPreview) {
            drawBoundingBox(canvasCtx, lastBoundingBox, speed > speedThreshold ? 'RUNNING' : 'SUSPECT');
        }
    } else {
        lastBoundingBox = null;
    }
    canvasCtx.restore();
}

function drawGrid() {
    canvasCtx.strokeStyle = 'rgba(233, 84, 32, 0.6)';
    canvasCtx.lineWidth = 2;
    canvasCtx.font = '14px Inter, sans-serif';
    canvasCtx.fillStyle = 'rgba(233, 84, 32, 1)';
    canvasCtx.textAlign = 'center';

    const cellWidth = canvasElement.width / gridCols;
    const cellHeight = canvasElement.height / gridRows;

    // Draw Vertical Lines
    for (let i = 1; i < gridCols; i++) {
        const x = i * cellWidth;
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, canvasElement.height);
        canvasCtx.stroke();
    }

    // Draw Horizontal Lines
    for (let i = 1; i < gridRows; i++) {
        const y = i * cellHeight;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(canvasElement.width, y);
        canvasCtx.stroke();
    }

    // Draw Camera Labels
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const camId = (r * gridCols) + c + 1;
            const x = (c * cellWidth) + (cellWidth / 2);
            const y = (r * cellHeight) + 20;
            canvasCtx.fillText(`Cam ${camId}`, x, y);
        }
    }
}

function drawLandmarks(landmarks) {
    canvasCtx.fillStyle = '#e95420';
    for (const landmark of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 2, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
}

function getBoundingBox(landmarks) {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach(lm => {
        if (lm.x < minX) minX = lm.x;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.y > maxY) maxY = lm.y;
    });
    const width = maxX - minX;
    const height = maxY - minY;
    return {
        x: Math.max(0, minX - width * 0.1),
        y: Math.max(0, minY - height * 0.1),
        w: Math.min(1, width * 1.2),
        h: Math.min(1, height * 1.2)
    };
}

function drawBoundingBox(ctx, box, label) {
    const bx = box.x * canvasElement.width;
    const by = box.y * canvasElement.height;
    const bw = box.w * canvasElement.width;
    const bh = box.h * canvasElement.height;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]); // Cyber style dashed line
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`[ ${label} ]`, bx, by - 8);

    // Corner brackets
    const b = 15;
    ctx.lineWidth = 4;
    // Top Left
    ctx.beginPath(); ctx.moveTo(bx, by + b); ctx.lineTo(bx, by); ctx.lineTo(bx + b, by); ctx.stroke();
    // Top Right
    ctx.beginPath(); ctx.moveTo(bx + bw - b, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + b); ctx.stroke();
    // Bottom Left
    ctx.beginPath(); ctx.moveTo(bx, by + bh - b); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + b, by + bh); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(bx + bw - b, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - b); ctx.stroke();
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
    } catch (err) {
        console.warn('Microphone access denied:', err);
    }
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
                alert_snapshot_url: alert_snapshot_url,
                room_id: currentRoomId
            })
        });
        const result = await response.json();
        updateUI(result);
    } catch (err) {
        console.error('API Error:', err);
    }
}
// --- Librarian's Watch Sync ---
function generateSyncCode() {
    const code = 'WATCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('sync-code-input').value = code;
    document.getElementById('join-code-input').value = code;
}

function joinSyncRoom() {
    const code = document.getElementById('join-code-input').value;
    if (!code) return;

    currentRoomId = code;
    connectToWatchSocket(code);

    document.getElementById('sync-status').classList.remove('d-none');
    document.getElementById('sync-code-input').value = code;
}

function connectToWatchSocket(roomId) {
    if (watchSocket) watchSocket.close();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    watchSocket = new WebSocket(`${protocol}//${window.location.host}/ws/${roomId}`);

    watchSocket.onmessage = (event) => {
        const result = JSON.parse(event.data);
        updateUI(result);

        // Haptic Feedback for Mobile
        if (result.status !== 'QUIET' && "vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Alert Sound
        if (result.status === 'RUNNING_DETECTED') {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio blocked by browser'));
        }
    };

    watchSocket.onclose = () => {
        console.log('Watch connection closed. Reconnecting...');
        setTimeout(() => connectToWatchSocket(roomId), 3000);
    };
}

// --- UI Updates ---
let lastStatus = 'QUIET';
function updateUI(result) {
    document.getElementById('stat-speed').innerText = result.movement_speed;
    document.getElementById('stat-noise').innerText = result.noise_level;
    document.getElementById('stat-streak').innerText = result.streak;
    document.getElementById('stat-zone').innerText = result.zone_name;

    const statusBadge = document.getElementById('status-badge');
    const statusMessage = document.getElementById('status-message');
    const mainIcon = document.getElementById('main-icon');
    const wrapper = document.querySelector('.status-icon-wrapper');
    const auraBg = document.getElementById('aura-bg');

    // Update Aura Background
    if (auraBg) {
        const statusBase = result.status.split('_')[0].toLowerCase();
        auraBg.className = `aura-bg state-${statusBase}`;
    }

    statusBadge.className = `badge bg-${colors[result.status]} py-2 px-3 rounded-pill`;
    statusBadge.innerText = result.status.replace('_', ' ');
    statusMessage.innerText = result.message;

    // Transition Icon with Pop Effect
    if (result.status !== lastStatus) {
        particles.setState(result.status);
        wrapper.classList.remove('status-change-pop');
        void wrapper.offsetWidth; // Force reflow
        wrapper.classList.add('status-change-pop');

        mainIcon.setAttribute('data-lucide', icons[result.status]);
        mainIcon.className = `text-${colors[result.status]}`;
        lucide.createIcons();
        lastStatus = result.status;
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
    alertEl.dataset.zone = result.zone_name;
    alertEl.dataset.status = result.status.replace('_', ' ');

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

    // 1. Draw original video frame
    ctx.drawImage(videoElement, 0, 0);

    // 2. Add technical "Evidence" overlay if a box exists
    if (lastBoundingBox) {
        const bx = lastBoundingBox.x * tempCanvas.width;
        const by = lastBoundingBox.y * tempCanvas.height;
        const bw = lastBoundingBox.w * tempCanvas.width;
        const bh = lastBoundingBox.h * tempCanvas.height;

        // Red Square
        ctx.strokeStyle = '#ff3e3e';
        ctx.lineWidth = 6;
        ctx.strokeRect(bx, by, bw, bh);

        // Cyber Label
        ctx.fillStyle = '#ff3e3e';
        ctx.font = 'bold 24px Inter, sans-serif';
        const label = document.getElementById('status-badge').innerText;
        ctx.fillText(`>> ${label} IDENTIFIED`, bx, by - 15);

        // Add timestamp to image
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, tempCanvas.height - 40, tempCanvas.width, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText(`CAPTURE_TS: ${new Date().toISOString()} | ZONE: ${zone}`, 20, tempCanvas.height - 15);
    }

    // 3. Draw Kinetic Path Trail
    if (pathHistory.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < pathHistory.length - 1; i++) {
            const p1 = pathHistory[i];
            const p2 = pathHistory[i + 1];
            const alpha = (i / pathHistory.length) * 0.8;
            ctx.strokeStyle = `rgba(233, 84, 32, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x * tempCanvas.width, p1.y * tempCanvas.height);
            ctx.lineTo(p2.x * tempCanvas.width, p2.y * tempCanvas.height);
            ctx.stroke();
        }
    }

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);

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

    // Store current element for PDF export
    window.currentAlertElement = element;
    modal.show();
    lucide.createIcons();
}

async function downloadPDFReport() {
    const el = window.currentAlertElement;
    if (!el) {
        alert("Please select an alert first.");
        return;
    }

    const reportBtn = document.querySelector('.modal-footer .btn-primary');
    const originalText = reportBtn.innerHTML;

    try {
        reportBtn.disabled = true;
        reportBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';

        if (!window.jspdf) {
            throw new Error("PDF library not loaded. Check internet connection.");
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primaryColor = [233, 84, 32];

        // 1. Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('LibraryRunCatcher', 20, 25);
        doc.setFontSize(12);
        doc.text('Incident Accountability Report', 20, 33);

        // 2. Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Incident Details', 20, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Type: ${el.dataset.status}`, 20, 65);
        doc.text(`Zone: ${el.dataset.zone}`, 20, 72);
        doc.text(`Date/Time: ${new Date(parseInt(el.dataset.timestamp)).toLocaleString()}`, 20, 79);

        // 3. Metrics
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 85, 190, 85);
        doc.setFontSize(12);
        doc.text('Sensor Data', 20, 95);
        doc.setFontSize(10);
        doc.text(`Movement Speed: ${el.dataset.speed} m/s`, 25, 105);
        doc.text(`Noise Level: ${el.dataset.noise} dB`, 25, 112);

        // 4. Evidence Image
        doc.setFontSize(12);
        doc.text('Visual Evidence', 20, 125);

        const img = document.getElementById('snapshot-img');
        if (img && img.complete && img.naturalWidth > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg', 0.8);

            const imgWidth = 150;
            const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;
            doc.addImage(imgData, 'JPEG', 20, 130, imgWidth, Math.min(imgHeight, 100));
        } else {
            doc.setTextColor(150, 150, 150);
            doc.text('[Image evidence loading or unavailable]', 25, 135);
        }

        // 5. Footer / Signature
        const footerY = 260;
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.line(20, footerY, 100, footerY);
        doc.text('Teacher Signature', 20, footerY + 5);
        doc.text('Page 1 of 1', 170, footerY + 5);

        // Copyright
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('© 2029 APIWISH ANUTARAVANICHKUL', 20, footerY + 15);

        doc.save(`Report_${el.dataset.zone}_${el.dataset.time.replace(/:/g, '-')}.pdf`);

    } catch (err) {
        console.error('PDF Error:', err);
        alert("Download Failed: " + err.message);
    } finally {
        reportBtn.disabled = false;
        reportBtn.innerHTML = originalText;
    }
}

async function downloadAllReports() {
    const alerts = Array.from(alertsContainer.querySelectorAll('.alert-item'));
    if (alerts.length === 0) {
        alert("No alerts to download.");
        return;
    }

    const downloadAllBtn = document.getElementById('download-all-btn');
    const originalHtml = downloadAllBtn.innerHTML;

    try {
        downloadAllBtn.disabled = true;
        downloadAllBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>...';

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primaryColor = [233, 84, 32];

        for (let i = 0; i < alerts.length; i++) {
            const el = alerts[i];
            if (i > 0) doc.addPage();

            // Header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text('LibraryRunCatcher', 20, 25);
            doc.setFontSize(12);
            doc.text('Consolidated Incident Report', 20, 33);

            // Details
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Incident #${i + 1}`, 20, 55);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Type: ${el.dataset.status}`, 20, 65);
            doc.text(`Zone: ${el.dataset.zone}`, 20, 72);
            doc.text(`Date/Time: ${new Date(parseInt(el.dataset.timestamp)).toLocaleString()}`, 20, 79);

            // Metrics
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 85, 190, 85);
            doc.setFontSize(12);
            doc.text('Sensor Data', 20, 95);
            doc.setFontSize(10);
            doc.text(`Movement Speed: ${el.dataset.speed} m/s`, 25, 105);
            doc.text(`Noise Level: ${el.dataset.noise} dB`, 25, 112);

            // Evidence Image
            doc.setFontSize(12);
            doc.text('Visual Evidence', 20, 125);

            if (el.dataset.img) {
                try {
                    const imgData = await getBase64Image(el.dataset.img);
                    doc.addImage(imgData, 'JPEG', 20, 130, 150, 100);
                } catch (e) {
                    doc.text('[Image load failed]', 25, 135);
                }
            }

            // Footer
            const footerY = 260;
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);
            doc.line(20, footerY, 100, footerY);
            doc.text('Teacher Signature', 20, footerY + 5);
            doc.text(`Page ${i + 1} of ${alerts.length}`, 170, footerY + 5);

            // Copyright
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('© 2029 APIWISH ANUTARAVANICHKUL', 20, footerY + 15);
        }

        doc.save(`Library_All_Alerts_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
        console.error('Batch PDF Error:', err);
        alert("Batch Download Failed: " + err.message);
    } finally {
        downloadAllBtn.disabled = false;
        downloadAllBtn.innerHTML = originalHtml;
    }
}

function getBase64Image(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = url;
    });
}

// --- Camera & Lifecycle ---
async function startCamera() {
    if (globalCamera) return;

    globalCamera = new Camera(videoElement, {
        onFrame: async () => {
            if (isLive) {
                await pose.send({ image: videoElement });
            }
        },
        width: 480,
        height: 360
    });
    return globalCamera.start();
}

liveToggle.addEventListener('change', async (e) => {
    isLive = e.target.checked;

    if (isLive) {
        if (isPreview) cameraContainer.style.display = 'block';
        await setupAudio();
        await startCamera();

        // Polling for audio and Heartbeat
        let ticksSinceLastSent = 0;
        const audioInterval = setInterval(async () => {
            if (!isLive) { clearInterval(audioInterval); return; }

            const noise = getNoiseLevel();
            const currentSpeed = parseFloat(document.getElementById('stat-speed').innerText) || 0;
            document.getElementById('stat-noise').innerText = Math.round(noise);

            ticksSinceLastSent++;

            if (noise > noiseThreshold || currentSpeed > speedThreshold || ticksSinceLastSent >= 4) {
                const needsSnapshot = (noise > noiseThreshold || currentSpeed > speedThreshold);
                let effectiveZone = document.getElementById('stat-zone').innerText;
                const snapshotUrl = (needsSnapshot && isLive) ? await captureSnapshot(effectiveZone) : null;
                sendDetection(effectiveZone, currentSpeed, noise, snapshotUrl);
                ticksSinceLastSent = 0;
            }
        }, 500);

    } else {
        cameraContainer.style.display = 'none';
        if (audioContext) audioContext.close();
        if (globalCamera) {
            await globalCamera.stop();
            globalCamera = null;
        }
    }
});

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

// --- Grid UI Event Listeners ---
const gridModeToggle = document.getElementById('grid-mode-toggle');
const gridRowsInput = document.getElementById('grid-rows');
const gridColsInput = document.getElementById('grid-cols');
const gridSettingsContent = document.getElementById('grid-settings-content');

if (gridModeToggle) {
    gridModeToggle.addEventListener('change', (e) => {
        gridMode = e.target.checked;
        const label = document.getElementById('grid-overlay-label');
        if (gridMode) {
            gridSettingsContent.style.opacity = '1';
            gridSettingsContent.style.pointerEvents = 'auto';
            if (label) label.style.display = 'block';
        } else {
            gridSettingsContent.style.opacity = '0.5';
            gridSettingsContent.style.pointerEvents = 'none';
            if (label) label.style.display = 'none';
            document.getElementById('stat-zone').innerText = formatZoneName(currentZone);
        }
    });
}

if (gridRowsInput) {
    gridRowsInput.addEventListener('change', (e) => {
        gridRows = parseInt(e.target.value) || 2;
    });
}

if (gridColsInput) {
    gridColsInput.addEventListener('change', (e) => {
        gridCols = parseInt(e.target.value) || 2;
    });
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
// Check every minute for alerts older than 5 hours and remove them from UI
setInterval(() => {
    const fiveHoursInMs = 5 * 60 * 60 * 1000;
    const now = Date.now();
    const alerts = alertsContainer.querySelectorAll('.alert-item');

    alerts.forEach(alert => {
        const timestamp = parseInt(alert.dataset.timestamp);
        if (now - timestamp > fiveHoursInMs) {
            alert.remove();
        }
    });

    if (alertsContainer.children.length === 0) {
        alertsContainer.innerHTML = '<div class="text-center text-muted py-5"><small>No recent alerts.</small></div>';
    }
}, 60000);

// --- Preview & Fullscreen Toggle ---
function togglePreview() {
    isPreview = !isPreview;
    const btn = document.getElementById('preview-btn');
    const icon = btn.querySelector('i');
    const statusDisplay = document.getElementById('status-display');

    if (isPreview) {
        cameraContainer.style.display = 'block';
        statusDisplay.style.display = 'none';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        cameraContainer.style.display = 'none';
        statusDisplay.style.display = 'block';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

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

// --- Particle System ---
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.count = 80;
        this.state = 'QUIET'; // QUIET, LOUD, RUNNING_DETECTED

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            color: '255, 255, 255'
        };
    }

    setState(state) {
        this.state = state;
        this.particles.forEach(p => {
            if (state === 'QUIET') {
                p.color = '255, 255, 255';
                p.speedX = (Math.random() - 0.5) * 0.5;
                p.speedY = (Math.random() - 0.5) * 0.5;
            } else if (state === 'LOUD') {
                p.color = '253, 126, 20'; // Orange
                p.speedX = (Math.random() - 0.5) * 2;
                p.speedY = (Math.random() - 0.5) * 2;
            } else if (state === 'RUNNING_DETECTED') {
                p.color = '233, 75, 20'; // Dark Red/Orange
                p.speedX = (Math.random() - 0.5) * 8;
                p.speedY = (Math.random() - 0.5) * 8;
            }
        });
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Loop around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Vortex effect in loud/running
            if (this.state !== 'QUIET') {
                const dx = (this.canvas.width / 2) - p.x;
                const dy = (this.canvas.height / 2) - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = this.state === 'RUNNING_DETECTED' ? 0.05 : 0.01;
                p.speedX += (dx / dist) * force;
                p.speedY += (dy / dist) * force;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            this.ctx.fill();
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

const particles = new ParticleSystem();

// PWA Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js');
}
