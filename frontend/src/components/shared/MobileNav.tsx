'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardCheck, LineChart, MessageSquare, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const studentItems = [
  { label: 'Home', href: '/', icon: <Home size={20} /> },
  { label: 'Check in', href: '/check-in', icon: <ClipboardCheck size={20} /> },
  { label: 'Mood', href: '/mood', icon: <LineChart size={20} /> },
  { label: 'Counseling', href: '/counseling', icon: <MessageSquare size={20} /> },
  { label: 'Help', href: '/help', icon: <AlertCircle size={20} />, urgent: true },
];

const staffItems = [
  { label: 'Overview', href: '/staff', icon: <Activity size={20} /> },
  { label: 'Trends', href: '/staff/trends', icon: <LineChart size={20} /> },
  { label: 'Support', href: '/staff/support', icon: <MessageSquare size={20} /> },
];

interface MobileNavProps {
  variant?: 'student' | 'staff';
}

export function MobileNav({ variant = 'student' }: MobileNavProps) {
  const pathname = usePathname();
  const items = variant === 'staff' ? staffItems : studentItems;

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    if (href === '/staff') return pathname === '/staff';
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] z-50 safe-area-inset-bottom"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center" role="list">
        {items.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-2 text-[10px] font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                'urgent' in item && item.urgent
                  ? isActive(item.href)
                    ? 'text-[var(--danger)]'
                    : 'text-[var(--danger)] opacity-70'
                  : isActive(item.href)
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-muted)]'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
