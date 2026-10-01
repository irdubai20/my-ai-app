import { useNavigate } from 'react-router-dom';
import { Brain, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">۴۰۴</h1>
        <p className="text-muted-foreground mb-6">صفحه‌ای که دنبالش می‌گردید پیدا نشد.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium mx-auto hover:bg-primary/90 transition-all"
        >
          <Home className="w-4 h-4" />
          بازگشت به داشبورد
        </button>
      </div>
    </div>
  );
}
