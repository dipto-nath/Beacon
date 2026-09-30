import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'primary' &&
          'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-[0.98]',
        variant === 'secondary' &&
          'bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border)] active:scale-[0.98]',
        variant === 'outline' &&
          'bg-transparent text-[var(--primary)] border border-[var(--primary-border)] hover:bg-[var(--primary-light)] active:scale-[0.98]',
        variant === 'ghost' &&
          'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] active:scale-[0.98]',
        variant === 'danger' &&
          'bg-[var(--danger)] text-white hover:bg-red-700 active:scale-[0.98]',
        // Sizes
        size === 'sm' && 'text-xs px-3 py-1.5 h-7',
        size === 'md' && 'text-sm px-4 py-2 h-9',
        size === 'lg' && 'text-sm px-5 py-2.5 h-11',
        // Full width
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
