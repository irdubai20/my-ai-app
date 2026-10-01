#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

if [ ! -d "$ANDROID_HOME/platforms/android-34" ]; then
  echo "ERROR: Android SDK platform 34 not found at $ANDROID_HOME/platforms/android-34"
  exit 1
fi
if [ ! -d "$ANDROID_HOME/build-tools/34.0.0" ]; then
  echo "ERROR: Android Build Tools 34.0.0 not found at $ANDROID_HOME/build-tools/34.0.0"
  exit 1
fi

if command -v java >/dev/null 2>&1; then
  JAVA_MAJOR=$(java -version 2>&1 | awk -F '[."]' '/version/ {print ($2=="1"?$3:$2); exit}')
  echo "Java: $(java -version 2>&1 | head -1)"
fi

echo "[1/5] Installing dependencies..."
npm install --legacy-peer-deps

echo "[2/5] Building web app..."
npm run build

if [ ! -d android ]; then
  echo "[3/5] Adding Android platform..."
  npx cap add android
else
  echo "[3/5] Android platform already exists."
fi

echo "[4/5] Syncing Capacitor..."
npx cap sync android

echo "[5/5] Building APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

APK=$(find app/build/outputs/apk -type f -name '*.apk' | head -1)
if [ -z "$APK" ]; then
  echo "APK was not found."
  exit 1
fi
cp "$APK" ../SmartMoneyRadar-debug.apk
echo
echo "=============================================="
echo "APK READY: $(cd .. && pwd)/SmartMoneyRadar-debug.apk"
echo "=============================================="
