import { cn } from '@/lib/utils';
import { Cpu } from 'lucide-react';

interface AIInsightProps {
  children: React.ReactNode;
  className?: string;
}

export function AIInsight({ children, className }: AIInsightProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3',
        className
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Cpu size={11} className="text-[var(--text-muted)]" />
        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          AI-assisted insight
        </span>
      </div>
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{children}</p>
      <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
        Based on your recent check-ins. This is not a medical assessment.
      </p>
    </div>
  );
}

interface PrivacyBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function PrivacyBadge({ children, className }: PrivacyBadgeProps) {
  return (
    <span className={cn('privacy-badge', className)}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M6 1L2 2.5V6c0 2.21 1.79 4 4 4s4-1.79 4-4V2.5L6 1z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--text-muted)] max-w-xs leading-relaxed mb-4">{description}</p>
      {action}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4 rounded', className)} />
      ))}
    </div>
  );
}

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border p-3 text-[13px] leading-relaxed',
        variant === 'info' && 'bg-[var(--primary-light)] border-[var(--primary-border)] text-[var(--primary)]',
        variant === 'warning' && 'bg-[var(--amber-light)] border-[var(--amber-border)] text-[var(--amber)]',
        variant === 'danger' && 'bg-[var(--danger-light)] border-[var(--danger-border)] text-[var(--danger)]',
        variant === 'success' && 'bg-[var(--sage-light)] border-[#C6DFCC] text-[var(--sage)]',
        className
      )}
    >
      {children}
    </div>
  );
}
