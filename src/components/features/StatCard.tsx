// =========================================
// کامپوننت StatCard
// =========================================
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  trend?: number;
}

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-secondary">
          <Icon className={cn('w-4 h-4', iconColor ?? 'text-muted-foreground')} />
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium number-display', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-lg font-bold text-foreground number-display">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}
