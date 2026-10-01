import { cn } from '@/lib/utils';
import { Sparkles, ShieldCheck } from 'lucide-react';

// ─── AI Insight ───────────────────────────────────────────────
interface AIInsightProps {
  children: React.ReactNode;
  className?: string;
}

export function AIInsight({ children, className }: AIInsightProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-lg)] p-4',
        'border border-[var(--lavender-border)]',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(123,143,212,0.06) 0%, rgba(59,124,228,0.06) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Subtle gradient orb */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7B8FD4 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--lavender-light)', border: '1px solid var(--lavender-border)' }}
          aria-hidden="true"
        >
          <Sparkles size={10} className="text-[var(--lavender)]" />
        </span>
        <span className="text-[10px] font-semibold text-[var(--lavender)] uppercase tracking-[0.08em]">
          AI-assisted insight
        </span>
      </div>

      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed relative z-10">
        {children}
      </p>
      <p className="text-[11px] text-[var(--text-muted)] mt-2 relative z-10">
        Based on your recent check-ins. This is not a medical assessment.
      </p>
    </div>
  );
}

// ─── Privacy Badge ────────────────────────────────────────────
interface PrivacyBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function PrivacyBadge({ children, className }: PrivacyBadgeProps) {
  return (
    <span className={cn('privacy-badge', className)}>
      <ShieldCheck size={10} aria-hidden="true" />
      {children}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-14 px-6 text-center', className)}>
      {icon && (
        <div
          className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-5 text-[var(--text-muted)]"
          style={{
            background: 'linear-gradient(135deg, rgba(59,124,228,0.07) 0%, rgba(123,143,212,0.07) 100%)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[13px] text-[var(--text-muted)] max-w-xs leading-relaxed mb-5">{description}</p>
      {action}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4 rounded-[var(--radius-sm)]', className)} />
      ))}
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────
interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const styles = {
    info:    { bg: 'var(--primary-light)',   border: 'var(--primary-border)', color: 'var(--primary)' },
    warning: { bg: 'var(--amber-light)',     border: 'var(--amber-border)',   color: 'var(--amber)' },
    danger:  { bg: 'var(--danger-light)',    border: 'var(--danger-border)',  color: 'var(--danger)' },
    success: { bg: 'var(--sage-light)',      border: 'rgba(74,140,111,0.2)', color: 'var(--sage)' },
  }[variant];

  return (
    <div
      role="alert"
      className={cn('rounded-[var(--radius)] border p-3.5 text-[13px] leading-relaxed', className)}
      style={{ background: styles.bg, borderColor: styles.border, color: styles.color }}
    >
      {children}
    </div>
  );
}
