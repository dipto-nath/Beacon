import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  pill?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  pill = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer select-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        // Border radius
        pill ? 'rounded-full' : 'rounded-[11px]',
        // Variants
        variant === 'primary' && [
          'text-white border border-transparent',
          'active:scale-[0.97]',
        ],
        variant === 'secondary' && [
          'bg-white/70 text-[var(--text-primary)] border border-[var(--border)]',
          'hover:bg-white hover:border-[var(--primary-border)] hover:text-[var(--primary)]',
          'hover:shadow-[var(--shadow-sm)]',
          'active:scale-[0.98]',
        ],
        variant === 'outline' && [
          'bg-transparent text-[var(--primary)] border border-[var(--primary-border)]',
          'hover:bg-[var(--primary-light)] hover:border-[var(--primary)] hover:shadow-[0_0_0_3px_var(--primary-glow)]',
          'active:scale-[0.98]',
        ],
        variant === 'ghost' && [
          'bg-transparent text-[var(--text-secondary)] border border-transparent',
          'hover:bg-white/60 hover:text-[var(--text-primary)] hover:border-[var(--border)]',
          'active:scale-[0.98]',
        ],
        variant === 'danger' && [
          'text-white border border-transparent',
          'active:scale-[0.97]',
        ],
        variant === 'glass' && [
          'bg-white/60 backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-glass)]',
          'hover:bg-white/80 hover:shadow-[var(--shadow-sm)]',
          'active:scale-[0.98]',
        ],
        // Sizes
        size === 'sm' && 'text-[12px] px-3.5 py-1.5 h-7 tracking-tight',
        size === 'md' && 'text-[13px] px-4.5 py-2 h-9',
        size === 'lg' && 'text-[14px] px-6 py-2.5 h-11',
        // Full width
        fullWidth && 'w-full',
        className
      )}
      style={
        variant === 'primary'
          ? {
              background: 'linear-gradient(135deg, #3B7CE4 0%, #2563C6 100%)',
              boxShadow: '0 4px 14px rgba(59,124,228,0.35)',
            }
          : variant === 'danger'
          ? {
              background: 'linear-gradient(135deg, #E05252 0%, #C83E3E 100%)',
              boxShadow: '0 4px 14px rgba(224,82,82,0.3)',
            }
          : undefined
      }
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(59,124,228,0.45)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
        if (variant === 'danger') {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(224,82,82,0.4)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(59,124,228,0.35)';
          (e.currentTarget as HTMLButtonElement).style.transform = '';
        }
        if (variant === 'danger') {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(224,82,82,0.3)';
          (e.currentTarget as HTMLButtonElement).style.transform = '';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
