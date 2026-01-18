# Android Packaging for LibraryRunCatcher

To create an Android APK from this PWA, we recommend using **Bubblewrap (TWA)**. This creates a lightweight APK that wraps your PWA and allows it to be published on the Google Play Store or installed directly.

## Prerequisites

1.  **Node.js & npm**: Install from [nodejs.org](https://nodejs.org/).
2.  **Java Foundation**: You need JDK 17 or higher.
3.  **Android SDK**: Usually installed via Android Studio.

## Setup Steps

### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### 2. Initialize the Android Project
Run this in the root of your project. It will ask for your PWA's manifest URL.
```bash
bubblewrap init --manifest=https://your-hosted-app.com/static/manifest.json
```
If you are running locally and want to test, you'll need to use a tool like `ngrok` to provide a public URL for your local development server, as Bubblewrap needs a public URL for the manifest during initialization.

### 3. Build the APK
```bash
bubblewrap build
```

This will generate a `signed-apk.apk` in your project folder.

---

## Alternative: Local Asset Bundling (Capacitor)
If you want to bundle all HTML/CSS/JS files *inside* the APK (so it works offline or without a host), use Capacitor:

1. **Install Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init LibraryRunCatcher com.example.runcatcher --web-dir static
   ```
2. **Add Android Platform**:
   ```bash
   npx cap add android
   ```
3. **Build and Sync**:
   ```bash
   # If you have a build step (like Vite/Webpack), run it first. 
   # For this vanilla project, just sync:
   npx cap sync
   ```
4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
   From there, you can build the APK using the "Build > Build Bundle(s) / APK(s) > Build APK(s)" menu in Android Studio.

> [!IMPORTANT]
> Since the backend is Python-based (FastAPI), the Android app will still need to connect to a running server (either local network IP or a cloud-hosted URL). Update the API URL in `static/app.js` (or equivalent) to point to your server's IP address instead of `127.0.0.1`.
