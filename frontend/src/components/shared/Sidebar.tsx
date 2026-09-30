'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardCheck,
  LineChart,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Settings,
  User,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  urgent?: boolean;
}

const studentNav: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home size={16} /> },
  { label: 'Check in', href: '/check-in', icon: <ClipboardCheck size={16} /> },
  { label: 'My Mood', href: '/mood', icon: <LineChart size={16} /> },
  { label: 'Recommendations', href: '/recommendations', icon: <Lightbulb size={16} /> },
  { label: 'Resources', href: '/resources', icon: <BookOpen size={16} /> },
  { label: 'Counseling', href: '/counseling', icon: <MessageSquare size={16} /> },
  { label: 'Appointments', href: '/appointments', icon: <Calendar size={16} /> },
  { label: 'Privacy', href: '/privacy', icon: <ShieldCheck size={16} /> },
];

const studentBottomNav: NavItem[] = [
  { label: 'Help now', href: '/help', icon: <AlertCircle size={16} />, urgent: true },
  { label: 'Profile', href: '/settings', icon: <User size={16} /> },
  { label: 'Settings', href: '/settings', icon: <Settings size={16} /> },
];

interface SidebarProps {
  variant?: 'student' | 'staff';
}

export function Sidebar({ variant = 'student' }: SidebarProps) {
  const pathname = usePathname();
  const isStaff = variant === 'staff';

  const mainNav = isStaff
    ? [
        { label: 'Overview', href: '/staff', icon: <Activity size={16} /> },
        { label: 'Campus trends', href: '/staff/trends', icon: <LineChart size={16} /> },
        { label: 'Support queue', href: '/staff/support', icon: <MessageSquare size={16} /> },
      ]
    : studentNav;

  const bottomNav = isStaff ? [] : studentBottomNav;

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    if (href === '/staff') return pathname === '/staff';
    return pathname.startsWith(href);
  }

  return (
    <aside className="beacon-sidebar" aria-label="Main navigation">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary)' }}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">Beacon</span>
            {isStaff && (
              <span className="block text-[10px] text-[var(--text-muted)] leading-none mt-0.5">Staff portal</span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto" aria-label="Primary navigation">
        <ul className="space-y-0.5" role="list">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                  isActive(item.href)
                    ? 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary-border)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'transition-colors',
                    isActive(item.href) ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Staff switcher */}
        {!isStaff && (
          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider px-3 mb-1.5">
              Portals
            </p>
            <Link
              href="/staff"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-secondary)] transition-all duration-100"
            >
              <Activity size={14} aria-hidden="true" />
              Staff portal
            </Link>
          </div>
        )}
        {isStaff && (
          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-secondary)] transition-all duration-100"
            >
              <Home size={14} aria-hidden="true" />
              Student portal
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      {bottomNav.length > 0 && (
        <div className="px-3 py-3 border-t border-[var(--border)]">
          <ul className="space-y-0.5" role="list">
            {bottomNav.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                    item.urgent
                      ? 'text-[var(--danger)] hover:bg-[var(--danger-light)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* University branding */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-[var(--text-muted)] leading-snug">
          Ashford University
          <br />
          Student Wellbeing Service
        </p>
      </div>
    </aside>
  );
}
