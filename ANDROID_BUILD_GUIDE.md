# BGK WEAR — Android Build & APK Generation Guide

This guide provides instructions for generating the **Debug APK**, **Release APK**, and **Google Play Android App Bundle (.aab)** for **BGK WEAR**.

---

## 📱 App Configuration Overview

- **App Name**: `BGK WEAR`
- **Application ID / Package**: `com.bgkwear.app`
- **Platform**: Capacitor 8 + Android SDK 34 + React 18 + Vite + Tailwind CSS + Firebase
- **Signing Keystore Included**: `android/app/bgk-release-key.jks`
  - **Key Alias**: `bgkwear`
  - **Keystore Password**: `bgkwear123`
  - **Key Password**: `bgkwear123`

---

## 🚀 Option 1: Build APK using Android Studio (Recommended & Easiest)

1. **Download & Install Android Studio**:
   - Download the free [Android Studio](https://developer.android.com/studio).

2. **Open the Project**:
   - Launch Android Studio and click **Open**.
   - Select the `android/` folder inside the extracted BGK WEAR project directory.

3. **Build the APK**:
   - Click **Build** from the top menu bar.
   - Select **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - When the build finishes, click the **"locate"** popup notification to find your `app-debug.apk` or `app-release.apk` inside `android/app/build/outputs/apk/`.

4. **Run on Physical Device / Emulator**:
   - Connect your Android phone with **USB Debugging** enabled.
   - Click the green **Run (▶)** button in the top toolbar to install and launch BGK WEAR directly on your phone.

---

## ⚡ Option 2: Build APK via Terminal / Command Line (Gradle)

If you have JDK 17+ and Android SDK installed on your system:

### 1. Build and Sync Web Assets:
```bash
npm install
npm run build
npx cap sync android
```

### 2. Generate Signed Release APK:
```bash
cd android
./gradlew assembleRelease
```
The resulting signed APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

### 3. Generate Google Play App Bundle (.aab):
```bash
./gradlew bundleRelease
```
The resulting AAB will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🌐 Option 3: Free Cloud Build with GitHub Actions (No Local Setup Required)

If you do not want to install Android Studio or the Android SDK locally, you can build the APK for free using GitHub Actions:

1. Push your project to a GitHub repository.
2. Create `.github/workflows/build-apk.yml` with:

```yaml
name: Build Android APK
on: [push, workflow_dispatch]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build Web App & Sync
        run: |
          npm run build
          npx cap sync android
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'
      - name: Build Release APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleRelease
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: BGK-WEAR-Release-APK
          path: android/app/build/outputs/apk/release/*.apk
```
3. Go to the **Actions** tab in GitHub, run the workflow, and download the compiled `BGK-WEAR-Release-APK.zip` directly from the workflow summary.

---

## 🔒 Permissions & Native Capabilities Configured

The Android project is pre-configured with the following native capabilities:
- **Camera & Photo Gallery**: Take photos or upload existing garments (`@capacitor/camera`).
- **Haptics Feedback**: Tactile feedback on touch and transaction confirmations (`@capacitor/haptics`).
- **Realtime Chat & Audio Calling**: Direct peer-to-peer audio calling between buyers and sellers with microphone access.
- **Direct WhatsApp Messaging**: Pre-filled outfit inquiry links and status updates.
- **Direct Cellular Calling**: Direct phone calls to verified peer sellers.
- **Push & Local Notifications**: Interactive notifications for order and booking updates.
- **Status Bar & Splash Screen**: Dark luxury aesthetic matching the gold & obsidian brand identity.
