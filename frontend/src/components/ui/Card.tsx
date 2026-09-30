import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  size?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className, as: Tag = 'div', size = 'md' }: CardProps) {
  return (
    <Tag
      className={cn(
        'bg-white border border-[var(--border)] rounded-xl',
        size === 'sm' && 'p-4',
        size === 'md' && 'p-5',
        size === 'lg' && 'p-6',
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-4', className)}>
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  className?: string;
}

export function MetricCard({ label, value, subvalue, trend, trendLabel, className }: MetricCardProps) {
  const trendColor = trend === 'up' ? '#4D7C5E' : trend === 'down' ? '#C2410C' : '#52525B';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div
      className={cn(
        'bg-white border border-[var(--border)] rounded-xl p-4',
        className
      )}
    >
      <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] leading-none">{value}</p>
      {(subvalue || trend) && (
        <div className="flex items-center gap-1 mt-1.5">
          {trend && (
            <span style={{ color: trendColor }} className="text-xs font-medium">
              {trendIcon}
            </span>
          )}
          {(subvalue || trendLabel) && (
            <span className="text-xs text-[var(--text-muted)]">{subvalue || trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
