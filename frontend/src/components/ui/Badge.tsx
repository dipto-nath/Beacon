import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'subtle';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border',
        variant === 'default' && 'bg-zinc-100 text-zinc-700 border-zinc-200',
        variant === 'subtle' && 'bg-zinc-50 text-zinc-500 border-zinc-100',
        variant === 'outline' && 'bg-transparent text-zinc-600 border-zinc-300',
        className
      )}
    >
      {children}
    </span>
  );
}
