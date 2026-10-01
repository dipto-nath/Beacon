'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardCheck,
  TrendingUp,
  Lightbulb,
  BookOpen,
  MessageSquare,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Settings,
  User,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  urgent?: boolean;
}

const studentNav: NavItem[] = [
  { label: 'Home',            href: '/',               icon: <Home size={18} /> },
  { label: 'Check in',        href: '/check-in',       icon: <ClipboardCheck size={18} /> },
  { label: 'My Mood',         href: '/mood',           icon: <TrendingUp size={18} /> },
  { label: 'Recommendations', href: '/recommendations',icon: <Lightbulb size={18} /> },
  { label: 'Resources',       href: '/resources',      icon: <BookOpen size={18} /> },
  { label: 'Counseling',      href: '/counseling',     icon: <MessageSquare size={18} /> },
  { label: 'Appointments',    href: '/appointments',   icon: <Calendar size={18} /> },
  { label: 'Privacy',         href: '/privacy',        icon: <ShieldCheck size={18} /> },
];

const studentBottomNav: NavItem[] = [
  { label: 'Help now', href: '/help',     icon: <AlertCircle size={18} />, urgent: true },
  { label: 'Profile',  href: '/settings', icon: <User size={18} /> },
  { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
  variant?: 'student' | 'staff';
}

export function Sidebar({ variant = 'student' }: SidebarProps) {
  const pathname = usePathname();
  const { user, mounted } = useAuth();
  const isStaff = variant === 'staff';

  if (!mounted) {
    return <aside className="beacon-sidebar" aria-label="Main navigation" />;
  }

  const canViewStaffPortal =
    user?.role === 'counselor' ||
    user?.role === 'wellbeing_admin' ||
    user?.role === 'admin';

  const mainNav = isStaff
    ? [
        { label: 'Overview',       href: '/staff',         icon: <Activity size={18} /> },
        { label: 'Campus trends',  href: '/staff/trends',  icon: <TrendingUp size={18} /> },
        { label: 'Support queue',  href: '/staff/support', icon: <MessageSquare size={18} /> },
      ]
    : studentNav;

  const bottomNav = isStaff ? [] : studentBottomNav;

  function isActive(href: string) {
    if (href === '/')      return pathname === '/';
    if (href === '/staff') return pathname === '/staff';
    return pathname.startsWith(href);
  }

  return (
    <aside className="beacon-sidebar" aria-label="Main navigation">
      {/* Logo mark */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/40 shrink-0 overflow-hidden">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3B7CE4 0%, #6B9FEC 100%)',
            boxShadow: '0 4px 12px rgba(59,124,228,0.35)',
          }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="white" />
            <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {/* Text — shown on expand */}
        <div className="logo-text overflow-hidden">
          <span className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
            Beacon
          </span>
          {isStaff && (
            <span className="block text-[10px] text-[var(--text-muted)] leading-none mt-0.5 whitespace-nowrap">
              Staff portal
            </span>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden" aria-label="Primary navigation">
        <ul className="space-y-0.5" role="list">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-2.5 py-2.5 rounded-[12px] transition-all duration-200 overflow-hidden',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                    'group',
                    active
                      ? 'bg-[var(--primary)] text-white shadow-[0_3px_12px_var(--primary-glow)]'
                      : 'text-[var(--text-secondary)] hover:bg-white/60 hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-xs)]'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active side indicator (icon-only mode) */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/70"
                      aria-hidden="true"
                    />
                  )}

                  {/* Icon */}
                  <span
                    className={cn(
                      'shrink-0 transition-colors',
                      active ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--primary)]'
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  {/* Label — visible on expand */}
                  <span className="nav-label text-[13px] font-medium">
                    {item.label}
                  </span>

                  {/* Chevron on hover (expanded) */}
                  <ChevronRight
                    size={12}
                    className="nav-label ml-auto opacity-0 group-hover:opacity-40 shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Portal switcher */}
        {!isStaff && canViewStaffPortal && (
          <div className="mt-4 pt-3 border-t border-white/40 overflow-hidden">
            <p className="nav-label text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider px-2.5 mb-1.5 whitespace-nowrap">
              Portals
            </p>
            <Link
              href="/staff"
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-[12px] text-[var(--text-muted)] hover:bg-white/60 hover:text-[var(--text-secondary)] transition-all duration-200 overflow-hidden"
            >
              <Activity size={18} className="shrink-0" aria-hidden="true" />
              <span className="nav-label text-[13px] font-medium whitespace-nowrap">Staff portal</span>
            </Link>
          </div>
        )}
        {isStaff && canViewStaffPortal && (
          <div className="mt-4 pt-3 border-t border-white/40 overflow-hidden">
            <Link
              href="/"
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-[12px] text-[var(--text-muted)] hover:bg-white/60 hover:text-[var(--text-secondary)] transition-all duration-200 overflow-hidden"
            >
              <Home size={18} className="shrink-0" aria-hidden="true" />
              <span className="nav-label text-[13px] font-medium whitespace-nowrap">Student portal</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom: urgent + profile */}
      {bottomNav.length > 0 && (
        <div className="px-2.5 py-3 border-t border-white/40 space-y-0.5 overflow-hidden">
          {bottomNav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2.5 rounded-[12px] transition-all duration-200 overflow-hidden',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                item.urgent
                  ? 'text-[var(--danger)] hover:bg-[var(--danger-light)]'
                  : 'text-[var(--text-muted)] hover:bg-white/60 hover:text-[var(--text-secondary)]'
              )}
            >
              <span className="shrink-0" aria-hidden="true">{item.icon}</span>
              <span className="nav-label text-[13px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Branding footer */}
      <div className="px-2.5 pb-4 overflow-hidden">
        <div className="nav-label px-2.5">
          <p className="text-[10px] text-[var(--text-muted)] leading-snug whitespace-nowrap">
            Ashford University
            <br />
            Student Wellbeing Service
          </p>
        </div>
      </div>
    </aside>
  );
}
