'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { MobileNav } from '@/components/shared/MobileNav';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  variant?: 'student' | 'staff';
  className?: string;
}

export function AppLayout({ children, variant = 'student', className }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar variant={variant} />
      </div>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          // Account for mobile nav
          'pb-20 lg:pb-0',
          className
        )}
        id="main-content"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 page-enter">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden">
        <MobileNav variant={variant} />
      </div>
    </div>
  );
}
