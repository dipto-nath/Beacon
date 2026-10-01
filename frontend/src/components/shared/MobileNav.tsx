'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardCheck, TrendingUp, MessageSquare, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const studentItems = [
  { label: 'Home',     href: '/',          icon: <Home size={20} /> },
  { label: 'Check in', href: '/check-in',  icon: <ClipboardCheck size={20} /> },
  { label: 'Mood',     href: '/mood',      icon: <TrendingUp size={20} /> },
  { label: 'Support',  href: '/counseling',icon: <MessageSquare size={20} /> },
  { label: 'Help',     href: '/help',      icon: <AlertCircle size={20} />, urgent: true },
];

const staffItems = [
  { label: 'Overview', href: '/staff',         icon: <Activity size={20} /> },
  { label: 'Trends',   href: '/staff/trends',  icon: <TrendingUp size={20} /> },
  { label: 'Support',  href: '/staff/support', icon: <MessageSquare size={20} /> },
];

interface MobileNavProps {
  variant?: 'student' | 'staff';
}

export function MobileNav({ variant = 'student' }: MobileNavProps) {
  const pathname = usePathname();
  const items = variant === 'staff' ? staffItems : studentItems;

  function isActive(href: string) {
    if (href === '/')      return pathname === '/';
    if (href === '/staff') return pathname === '/staff';
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        borderTop: '1px solid rgba(181,200,236,0.3)',
        boxShadow: '0 -4px 20px rgba(59,100,180,0.08)',
      }}
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center" role="list">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-2 text-[10px] font-semibold transition-all duration-200',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                  'urgent' in item && item.urgent
                    ? active
                      ? 'text-[var(--danger)]'
                      : 'text-[var(--danger)] opacity-60'
                    : active
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-muted)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-[12px] transition-all duration-200',
                    active
                      ? 'bg-[var(--primary-light)] scale-110'
                      : 'hover:bg-[var(--surface-subtle)]'
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
