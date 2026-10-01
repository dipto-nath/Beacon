'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { MobileNav } from '@/components/shared/MobileNav';
import { TopHeader } from '@/components/shared/TopHeader';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  variant?: 'student' | 'staff';
  className?: string;
  pageTitle?: string;
}

export function AppLayout({ children, variant = 'student', className, pageTitle }: AppLayoutProps) {
  return (
    <div className="beacon-app-shell">
      {/* Desktop sidebar — icon-only, expands on hover */}
      <div className="hidden lg:block shrink-0">
        <Sidebar variant={variant} />
      </div>

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Persistent top header */}
        <TopHeader variant={variant} pageTitle={pageTitle} />

        {/* Scrollable content area */}
        <main
          className={cn(
            'flex-1 overflow-y-auto pb-6',
            // Account for mobile nav
            'pb-20 lg:pb-6',
            className
          )}
          id="main-content"
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-6 page-enter stagger-children">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden">
        <MobileNav variant={variant} />
      </div>
    </div>
  );
}
