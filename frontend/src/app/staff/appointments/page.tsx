'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/shared/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/app/providers';
import api from '@/lib/api';

export default function StaffAppointmentsPage() {
  const { user, mounted } = useAuth({
    requireAuth: true,
    allowedRoles: ['counselor', 'wellbeing_admin'],
    redirectTo: '/login'
  });

  // Fetch appointments with infinite query for pagination
  const {
    data: appointmentsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.staffAppointments(user?.id),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('/appointments', {
        params: { page: pageParam, page_size: 20 },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.has_more) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!user && user.role === 'counselor',
    initialPageParam: 1,
  });

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Flatten all pages into a single array
  const appointments = appointmentsData?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return (
      <AppLayout variant="staff">
        <div className="p-8">Loading appointments...</div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout variant="staff">
        <div className="max-w-4xl space-y-6 p-8">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium">Failed to load appointments</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout variant="staff">
      <div className="max-w-4xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">My Appointments</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Manage your upcoming and past counseling sessions.
          </p>
        </header>

        <section className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Scheduled Sessions</h2>
          </div>
          
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] text-[13px]">
              No appointments found.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {appointments.map((appt: any) => (
                <div key={appt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-medium text-[var(--text-primary)]">
                      Student: {appt.student_name}
                    </h3>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                      {new Date(appt.date).toLocaleDateString()} at {appt.time} ({appt.duration} min)
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)] capitalize border border-[var(--border)]">
                        {appt.mode.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] capitalize border border-[var(--primary-border)]">
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  {appt.meeting_link && (
                    <a
                      href={appt.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <button className="text-[13px] font-medium text-white bg-[var(--primary)] px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                        Join Meeting
                      </button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Load more button */}
          {hasNextPage && (
            <div className="px-5 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full text-[13px] font-medium text-white bg-[var(--primary)] px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load more appointments'}
              </button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
