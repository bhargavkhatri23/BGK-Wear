# BGK WEAR — Peer-to-Peer Luxury Couture Marketplace

**BGK WEAR** is a high-end peer-to-peer designer and bridal wear marketplace enabling users to **Rent**, **Buy**, and **Sell** luxury bridal lehengas, sherwanis, sarees, indo-western couture, and luxury wedding jewelry directly with verified peer sellers and buyers across India.

---

## 🌟 Key Capabilities & Features

1. **Peer-to-Peer Renting & Buying**:
   - Multi-day rental booking with dynamic security deposit calculations and date range selectors.
   - Direct buyouts with authenticity guarantees and secure escrow status tracking.

2. **Direct Peer Communication**:
   - **In-App Realtime Chat**: Direct conversation between buyer and seller with message threads and garment offer negotiation.
   - **In-App Audio Calling**: WebRTC-powered voice calls directly within the app for quick fitting consultations.
   - **Direct WhatsApp Messaging**: 1-click WhatsApp chat pre-filled with outfit details, size, and dates.
   - **Direct Phone Calls**: Instant cellular dialer launch for urgent handovers.

3. **Multi-Image Garment Listings**:
   - Quick photo capture from phone camera or gallery upload.
   - Automatic client-side image compression with high-resolution preview.
   - Configurable rental tenure (3, 5, 7, 10 days), retail valuation, security deposit, and size specifications.

4. **Security & Authentication**:
   - Firebase Authentication with email/password, Google sign-in, and guest/demo profiles.
   - Secure Firestore rules protecting buyer/seller order data, chats, and private reviews.
   - Offline-capable Firestore caching for instant page loads.

5. **Cross-Platform & Native Mobile Ready**:
   - Full Capacitor 8 integration for Android (`com.bgkwear.app`).
   - Native camera access, haptics, status bar styling, and screen rotation handling.
   - Responsive UI optimized for mobile touchscreens and desktop viewports.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Framer Motion
- **Mobile Engine**: Capacitor 8, Android SDK 34 (API Level 34)
- **Backend & Database**: Firebase Firestore, Firebase Authentication, Firebase Storage
- **Build System**: Vite 6, Gradle 8.14, OpenJDK 17

---

## 📦 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be accessible at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## 📱 How to Build the Android APK

Refer to `ANDROID_BUILD_GUIDE.md` for full step-by-step instructions.

### Quick Commands:
```bash
# 1. Build web app and synchronize Capacitor Android project
npm run build:android

# 2. Build signed release APK
cd android
./gradlew assembleRelease
```
The output APK is generated at `android/app/build/outputs/apk/release/app-release.apk`.

---

## 🔒 Firebase Security Rules

Firestore security rules are defined in `firestore.rules` and enforce:
- Public read access for active product listings.
- Owner-only write permissions for products, profiles, and listings.
- Participant-restricted access to chat messages and order records.
- Authenticated creation of reviews and ratings.
