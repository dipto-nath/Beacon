'use client';

import { useState } from 'react';
import { Bell, Settings, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
  variant?: 'student' | 'staff';
  pageTitle?: string;
}

export function TopHeader({ variant = 'student', pageTitle }: TopHeaderProps) {
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'User';
  const roleLabel = variant === 'staff'
    ? (user?.role === 'wellbeing_admin' ? 'Admin' : user?.role === 'counselor' ? 'Counselor' : 'Staff')
    : 'Student';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center gap-4 px-5 sm:px-8',
        'h-[64px] shrink-0',
        'bg-white/60 backdrop-blur-xl border-b border-white/50',
        'transition-all duration-200'
      )}
      style={{ boxShadow: '0 1px 0 rgba(181,200,236,0.25), 0 4px 12px rgba(59,100,180,0.04)' }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        {pageTitle && (
          <h1 className="text-[17px] font-semibold text-[var(--text-primary)] truncate tracking-tight">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Search bar */}
      <div
        className={cn(
          'hidden sm:flex items-center gap-2.5 transition-all duration-300',
          'bg-white/70 backdrop-blur-md',
          'border rounded-full px-4 py-2',
          searchFocused
            ? 'border-[var(--primary-border)] shadow-[0_0_0_3px_var(--primary-glow)] bg-white/95 w-64'
            : 'border-[var(--border)] w-52 hover:border-[rgba(100,140,210,0.35)]'
        )}
        style={{ boxShadow: searchFocused ? undefined : 'var(--shadow-xs)' }}
      >
        <Search size={14} className="text-[var(--text-muted)] shrink-0" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] flex-1 min-w-0"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="icon-btn relative"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={16} />
          {/* Notification dot */}
          <span
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[var(--primary)] border-2 border-white"
            aria-hidden="true"
          />
        </button>

        {/* Settings */}
        <button
          className="icon-btn"
          aria-label="Settings"
          type="button"
        >
          <Settings size={16} />
        </button>

        {/* User avatar + name */}
        <button
          className={cn(
            'flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all duration-200',
            'bg-white/70 border border-[var(--border)] hover:bg-white hover:border-[var(--primary-border)]',
            'hover:shadow-[var(--shadow-sm)]'
          )}
          style={{ boxShadow: 'var(--shadow-xs)' }}
          aria-label={`Account: ${displayName}`}
          type="button"
        >
          <span
            className="avatar w-7 h-7 text-[11px] font-semibold"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="hidden md:block text-[12px] font-medium text-[var(--text-primary)] whitespace-nowrap">
            {user?.first_name ?? 'User'}
          </span>
          <ChevronDown size={12} className="text-[var(--text-muted)] hidden md:block" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
