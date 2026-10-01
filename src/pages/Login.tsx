import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, ShieldCheck, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const handleGoogleLogin = async () => {
    setError('');
    setIsSigningIn(true);

    const { error: authError } = await signInWithGoogle();

    if (authError) {
      setError(authError.message || 'ورود با گوگل انجام نشد.');
      setIsSigningIn(false);
      return;
    }

    // OAuth normally redirects the browser before this line is reached.
    navigate(from, { replace: true });
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="text-center mb-7">
          <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl glow-primary mb-4">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Crypto Intelligence Enterprise
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">به پلتفرم هوش بازار خوش آمدید</h1>
          <p className="text-sm text-muted-foreground mt-2">برای ورود و ساخت حساب کاربری، با حساب گوگل خود ادامه دهید.</p>
        </div>

        <div className="glass-card p-6 sm:p-7 shadow-2xl">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50 mb-5">
            <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">ورود امن</p>
              <p className="text-xs text-muted-foreground mt-1">رمز عبور جداگانه‌ای برای این برنامه لازم نیست؛ احراز هویت توسط Google انجام می‌شود.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full h-12 rounded-xl bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 font-semibold shadow-lg"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"/>
                <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"/>
                <path fill="#FBBC05" d="M6.54 13.59A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.09.31-1.59V7.88H3.3A9.74 9.74 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.12l3.24-2.53Z"/>
                <path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.35 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"/>
              </svg>
            )}
            {isSigningIn ? 'در حال انتقال به Google...' : 'ادامه با حساب Google'}
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-center text-[11px] leading-5 text-muted-foreground mt-5">
            با ورود، حساب شما در سرویس احراز هویت برنامه ایجاد یا بازیابی می‌شود.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          دسترسی به داشبورد فقط برای کاربران احراز هویت‌شده فعال است.
        </p>
      </section>
    </main>
  );
}
