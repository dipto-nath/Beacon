'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/shared/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function StaffAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'counselor' && user.role !== 'wellbeing_admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['staffAppointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data;
    },
    enabled: !!user && user.role === 'counselor',
  });

  if (loading || isLoading) {
    return (
      <AppLayout variant="staff">
        <div className="p-8">Loading appointments...</div>
      </AppLayout>
    );
  }

  const appointments = appointmentsData?.data || [];

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
        </section>
      </div>
    </AppLayout>
  );
}
