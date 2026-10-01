import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  size?: 'sm' | 'md' | 'lg';
  glass?: boolean;
  hover?: boolean;
}

export function Card({
  children,
  className,
  as: Tag = 'div',
  size = 'md',
  glass = false,
  hover = true,
}: CardProps) {
  return (
    <Tag
      className={cn(
        glass
          ? 'beacon-glass'
          : 'beacon-card',
        !hover && '[&]:transform-none [&]:shadow-[var(--shadow-card)]',
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
    <div className={cn('flex items-start justify-between gap-3 mb-5', className)}>
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{subtitle}</p>
        )}
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
  accent?: 'blue' | 'lavender' | 'teal' | 'sage' | 'amber' | 'red';
  className?: string;
}

const accentGradients: Record<string, string> = {
  blue:     'linear-gradient(135deg, #3B7CE4 0%, #6B9FEC 100%)',
  lavender: 'linear-gradient(135deg, #7B8FD4 0%, #9CAEE0 100%)',
  teal:     'linear-gradient(135deg, #27B5A0 0%, #5DCFBE 100%)',
  sage:     'linear-gradient(135deg, #4A8C6F 0%, #72B094 100%)',
  amber:    'linear-gradient(135deg, #D4820A 0%, #E5A030 100%)',
  red:      'linear-gradient(135deg, #E05252 0%, #EC8080 100%)',
};

export function MetricCard({
  label,
  value,
  subvalue,
  trend,
  trendLabel,
  accent = 'blue',
  className,
}: MetricCardProps) {
  const trendUp   = trend === 'up';
  const trendDown = trend === 'down';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-lg)] p-5',
        'bg-white/90 border border-[var(--border)]',
        'transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[var(--shadow-md)]',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Accent top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--radius-lg)]"
        style={{ background: accentGradients[accent] ?? accentGradients.blue }}
        aria-hidden="true"
      />

      <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-[26px] font-bold text-[var(--text-primary)] leading-none tracking-tight">
        {value}
      </p>

      {(subvalue || trend) && (
        <div className="flex items-center gap-1.5 mt-2.5">
          {trend && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={
                trendUp
                  ? { background: 'var(--teal-light)', color: 'var(--teal)' }
                  : trendDown
                  ? { background: 'var(--danger-light)', color: 'var(--danger)' }
                  : { background: 'var(--surface-subtle)', color: 'var(--text-muted)' }
              }
            >
              {trendUp ? '↑' : trendDown ? '↓' : '→'}
            </span>
          )}
          {(subvalue || trendLabel) && (
            <span className="text-[12px] text-[var(--text-muted)]">
              {subvalue || trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
