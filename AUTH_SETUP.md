# Google Login setup

احراز هویت این پروژه با Supabase Auth و Google OAuth اضافه شده است.

## 1) متغیرهای محیطی

فایل `.env` را در ریشه پروژه بسازید:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

مقدارها را از Supabase Dashboard → Project Settings → API بردارید.

## 2) فعال‌کردن Google Provider

در Supabase:
Authentication → Providers → Google

Google را فعال کنید و Client ID و Client Secret مربوط به OAuth Client را وارد کنید.

## 3) تنظیم Redirect URL

در Supabase:
Authentication → URL Configuration

در بخش Redirect URLs، آدرس محیط اجرا را اضافه کنید. برای توسعه معمولاً:

`http://localhost:8080`

برای production نیز دامنه واقعی برنامه را اضافه کنید، مثلاً:

`https://your-domain.com`

همین آدرس باید در Google Cloud Console نیز به عنوان Authorized redirect URI تنظیم شود؛ مقدار دقیق callback را Supabase در صفحه Provider به شما نشان می‌دهد.

## رفتار برنامه

- `/login` عمومی است.
- تمام Routeهای دیگر با `ProtectedRoute` محافظت می‌شوند.
- اگر کاربر Session نداشته باشد، به `/login` منتقل می‌شود.
- «ادامه با حساب Google» با `signInWithOAuth` وارد Google می‌شود.
- اولین ورود Google به‌صورت خودکار کاربر را در Supabase Auth ایجاد می‌کند؛ ورودهای بعدی همان حساب را بازیابی می‌کنند.
- Session در refresh صفحه توسط Supabase بازیابی می‌شود.
