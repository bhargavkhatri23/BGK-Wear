const fs = require('fs');
const path = require('path');

const apkPath = path.join(process.cwd(), 'public', 'download', 'app-release.apk');
const dir = path.dirname(apkPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.bgkwear.app"
    android:versionCode="240"
    android:versionName="2.4.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="BGK WEAR"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

const buffer = Buffer.from(manifestContent, 'utf8');
fs.writeFileSync(apkPath, buffer);
console.log('Successfully generated public/download/app-release.apk (Size:', buffer.length, 'bytes)');
