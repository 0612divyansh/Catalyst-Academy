#!/usr/bin/env bash
set -e

# ==============================================================================
# Catalyst Academy LMS - Universal Android APK Build Pipeline
# Compatible with Android 5.0 (API 21) through Android 14/15/16 (API 34+)
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${PROJECT_DIR}/android-build"
SDK_DIR="${ANDROID_HOME:-/Users/divyanshshandil/Library/Android/sdk}"
BUILD_TOOLS="${SDK_DIR}/build-tools/35.0.0"
PLATFORM_JAR="${SDK_DIR}/platforms/android-34/android.jar"
AAPT2="${BUILD_TOOLS}/aapt2"
D8="${BUILD_TOOLS}/d8"
ZIPALIGN="${BUILD_TOOLS}/zipalign"
APKSIGNER="${BUILD_TOOLS}/apksigner"
KEYSTORE="${PROJECT_DIR}/keystore/catalyst-release.keystore"
FINAL_APK="${PROJECT_DIR}/CatalystAcademy-v1.0.apk"
PACKAGE_NAME="com.catalystacademy.lms"

echo "=== 1. Cleaning build workspace ==="
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/src/com/catalystacademy/lms"
mkdir -p "${BUILD_DIR}/res/values"
mkdir -p "${BUILD_DIR}/res/mipmap"
mkdir -p "${BUILD_DIR}/assets"
mkdir -p "${BUILD_DIR}/compiled_res"
mkdir -p "${BUILD_DIR}/gen"
mkdir -p "${BUILD_DIR}/bin/classes"

echo "=== 2. Generating universal launcher icons ==="
python3 - << 'EOF'
import os
from PIL import Image, ImageDraw

densities = {
    "mipmap": 96,
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

build_dir = os.environ.get("BUILD_DIR", "android-build")

def draw_catalyst_icon(size, is_round=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if is_round:
        draw.ellipse([0, 0, size - 1, size - 1], fill=(13, 18, 38, 255))
    else:
        corner = max(4, int(size * 0.22))
        draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=corner, fill=(13, 18, 38, 255))
        
    cx, cy = size / 2.0, size / 2.0
    scale = size / 108.0
    
    # Diamond / cap top
    poly = [
        (cx, cy - 20 * scale),
        (cx + 34 * scale, cy - 4 * scale),
        (cx, cy + 12 * scale),
        (cx - 34 * scale, cy - 4 * scale)
    ]
    draw.polygon(poly, fill=(124, 58, 237, 255))
    
    # Cap bottom neck
    bot = [
        (cx - 30 * scale, cy + 9 * scale),
        (cx - 30 * scale, cy + 20 * scale),
        (cx, cy + 32 * scale),
        (cx + 30 * scale, cy + 20 * scale),
        (cx + 30 * scale, cy + 9 * scale),
        (cx, cy + 21 * scale)
    ]
    draw.polygon(bot, fill=(124, 58, 237, 255))
    
    # Tassel
    tassel = [
        (cx + 32 * scale, cy - 1 * scale),
        (cx + 39 * scale, cy + 3 * scale),
        (cx + 39 * scale, cy + 24 * scale),
        (cx + 35 * scale, cy + 24 * scale),
        (cx + 35 * scale, cy + 5 * scale)
    ]
    draw.polygon(tassel, fill=(34, 211, 238, 255))
    return img

for folder, size in densities.items():
    folder_path = os.path.join(build_dir, "res", folder)
    os.makedirs(folder_path, exist_ok=True)
    
    icon_square = draw_catalyst_icon(size, is_round=False)
    icon_square.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
    
    icon_round = draw_catalyst_icon(size, is_round=True)
    icon_round.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

print("Generated universal launcher icons.")
EOF

echo "=== 3. Bundling web application assets ==="
rsync -av --exclude="*.apk" "${PROJECT_DIR}/frontend/static/" "${BUILD_DIR}/assets/"

echo "=== 4. Creating strings resource ==="
cat <<'EOF' > "${BUILD_DIR}/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Catalyst Academy</string>
</resources>
EOF

echo "=== 5. Generating AndroidManifest.xml ==="
cat <<'EOF' > "${BUILD_DIR}/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.catalystacademy.lms"
    android:versionCode="2"
    android:versionName="1.0.2">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="true"
        android:supportsRtl="true"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

echo "=== 6. Writing MainActivity.java ==="
cat <<'EOF' > "${BUILD_DIR}/src/com/catalystacademy/lms/MainActivity.java"
package com.catalystacademy.lms;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView webView;

    public static class LocalClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return false;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return false;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#080C18"));
        window.setNavigationBarColor(Color.parseColor("#080C18"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new LocalClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

echo "=== 7. Compiling and linking resources with aapt2 ==="
"${AAPT2}" compile --dir "${BUILD_DIR}/res" -o "${BUILD_DIR}/compiled_res/resources.zip"
"${AAPT2}" link \
    -I "${PLATFORM_JAR}" \
    --min-sdk-version 21 \
    --target-sdk-version 34 \
    --no-compile-sdk-metadata \
    --manifest "${BUILD_DIR}/AndroidManifest.xml" \
    "${BUILD_DIR}/compiled_res/resources.zip" \
    -A "${BUILD_DIR}/assets" \
    --java "${BUILD_DIR}/gen" \
    -o "${BUILD_DIR}/base.apk" \
    --auto-add-overlay

echo "=== 8. Compiling Java sources ==="
javac -source 8 -target 8 \
    -cp "${PLATFORM_JAR}" \
    -d "${BUILD_DIR}/bin/classes" \
    "${BUILD_DIR}/gen/com/catalystacademy/lms/R.java" \
    "${BUILD_DIR}/src/com/catalystacademy/lms/MainActivity.java"

echo "=== 9. Converting to Dalvik bytecode with d8 (API 21+) ==="
"${D8}" \
    --min-api 21 \
    --lib "${PLATFORM_JAR}" \
    --output "${BUILD_DIR}" \
    "${BUILD_DIR}/bin/classes/com/catalystacademy/lms/"*.class

echo "=== 10. Packaging classes.dex into APK ==="
(cd "${BUILD_DIR}" && /usr/bin/zip -uj base.apk classes.dex)

echo "=== 11. Aligning APK with zipalign ==="
"${ZIPALIGN}" -f 4 "${BUILD_DIR}/base.apk" "${BUILD_DIR}/aligned.apk"

echo "=== 12. Ensuring persistent keystore exists ==="
if [ ! -f "${KEYSTORE}" ]; then
    mkdir -p "$(dirname "${KEYSTORE}")"
    keytool -genkeypair \
        -keystore "${KEYSTORE}" \
        -alias catalystkey \
        -keypass catalyst123 \
        -storepass catalyst123 \
        -dname "CN=CatalystAcademy, OU=Mobile, O=Catalyst, L=Mandi, ST=HP, C=IN" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 > /dev/null 2>&1
fi

echo "=== 13. Signing APK with v1, v2, and v3 schemes ==="
"${APKSIGNER}" sign \
    --ks "${KEYSTORE}" \
    --ks-pass pass:catalyst123 \
    --key-pass pass:catalyst123 \
    --ks-key-alias catalystkey \
    --min-sdk-version 21 \
    --max-sdk-version 34 \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "${FINAL_APK}" \
    "${BUILD_DIR}/aligned.apk"

# Sync to static download endpoint and Desktop/Downloads
cp "${FINAL_APK}" "${PROJECT_DIR}/frontend/static/CatalystAcademy.apk"
cp "${FINAL_APK}" "/Users/divyanshshandil/Desktop/CatalystAcademy-v1.0.apk" 2>/dev/null || true
cp "${FINAL_APK}" "/Users/divyanshshandil/Downloads/CatalystAcademy-v1.0.apk" 2>/dev/null || true


echo "=== 14. Verifying APK signature and integrity ==="
"${APKSIGNER}" verify --verbose "${FINAL_APK}"
"${ZIPALIGN}" -c -v 4 "${FINAL_APK}"

echo ""
echo "🎉 SUCCESS: Built universal, fully compatible APK at:"
echo "   ${FINAL_APK}"
ls -lh "${FINAL_APK}"
