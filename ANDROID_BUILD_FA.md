# ساخت فایل APK

این نسخه برای Android با Capacitor 6 آماده شده و با SDK 34 / Build Tools 34.0.0 سازگار است.

در Ubuntu اجرا کنید:

```bash
cd ~/Downloads/ai1
chmod +x make-apk.sh
./make-apk.sh
```

پس از موفقیت، فایل زیر ساخته می‌شود:

`SmartMoneyRadar-debug.apk`

برای نصب روی گوشی با USB debugging:

```bash
adb install -r SmartMoneyRadar-debug.apk
```
