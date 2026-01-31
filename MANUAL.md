# LibraryRunCatcher Operational Manual
**Version 6.0 — Interactive Monitoring & Floor Plan Management**

---

## 1. System Overview
LibraryRunCatcher is a dual-mode security system that combines **Real-time AI Detection** with an **Interactive Floor Plan Dashboard**. It is designed to assist teachers and librarians in maintaining a quiet, safe learning environment.

### Core Components:
*   **Station Node**: The device (laptop/tablet) performing the actual AI monitoring.
*   **Admin Dashboard**: The central hub for layout management and incident review.
*   **Librarian's Watch**: Mobile devices synced to receive remote haptic alerts.

---

## 2. Setting Up the Floor Plan
The Floor Plan Builder allows you to create a visual map of your monitored space.

### Building Your Map:
1.  Navigate to the **Floor Plan** tab in the Admin Dashboard.
2.  **Add Items**: Use the toolbar to add **Area Shapes** (tables, shelves) and **Camera Nodes**.
3.  **Layout**: Drag items to match your library's physical layout. Use the **Snap to Grid** toggle for precise alignment.
4.  **Naming Zones**: Click any Camera Node to assign it a **Zone Name** (e.g., "Deep Study Room"). This is critical for matching alerts to map icons.
5.  **Save**: Click **Save Layout** to persist your design across all synced devices.

---

## 3. Monitoring & Auto-Detection
The monitoring engine uses computer vision to track skeletal motion and acoustic analysis for noise.

### Starting a Session:
1.  Open the home page and grant **Camera/Microphone** permissions.
2.  **Sync Zones**: Click the **Map Sync** button next to the Zone Selection to import your Floor Plan names.
3.  **Toggle Auto-Detect**: Switch on the main monitor.
4.  **Preview Mode (👁️)**: Toggle this to see the raw video feed without distractions, or to align your CCTV grid.

---

## 4. Handling Alerts & Evidence
The system provides two ways to review incidents.

### Map-Based "Insight" Alerts:
*   When an incident occurs, the camera node on the map will **pulse red**.
*   **Alert Persistence**: Red icons stay active for **60 seconds** to ensure visibility.
*   **Insight Tooltip**: Click a red camera to see a live popup containing:
    *   The captured snapshot image.
    *   The exact timestamp.
    *   The zone where it occurred.

### Static Evidence List:
*   Alerts appear in the sidebar list with basic metadata.
*   Click **View** to see full-sized evidence with forensic overlays.
*   **PDF Reports**: Export professional incident reports for disciplinary documentation.

---

## 5. Security & Access Control
Access to the Dashboard is protected by a session-specific security model.

*   **Session PIN**: Every time the monitoring station is started, a new **6-digit Admin PIN** is generated.
*   **Authorization**: Enter this PIN in the Dashboard login modal to unlock administrative features.
*   **Librarian's Watch**: Use the **Room Code** (e.g., `WATCH-XJ2A`) to pair mobile devices for remote vibration alerts.

---

## 6. Privacy Compliance
LibraryRunCatcher is built with an "Ephemeral-First" philosophy:
*   **Data Lifespan**: All snapshots are automatically deleted after **5 hours**.
*   **Local AI**: No raw video footage is ever uploaded to a server; AI analysis happens entirely in the browser.
*   **Skeletal Data**: The system tracks 33 points of motion data—not facial features—ensuring student anonymity.

---

**© 2026 APIWISH ANUTARAVANICHKUL**
*Advanced Behavioral Monitoring System — Professional Version*
