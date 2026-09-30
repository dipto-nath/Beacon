import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { appointments } from '@/data/mock';
import { EmptyState } from '@/components/ui/Helpers';
import { Button } from '@/components/ui/Button';
import { Calendar, Video, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Appointments' };

export default function AppointmentsPage() {
  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const past = appointments.filter((a) => a.status !== 'upcoming');

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Appointments</h1>
            <p className="text-[14px] text-[var(--text-muted)] mt-1">
              Your counseling sessions.
            </p>
          </div>
          <Link href="/counseling">
            <Button size="sm">Request appointment</Button>
          </Link>
        </header>

        {/* Upcoming */}
        <section aria-label="Upcoming appointments">
          <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar size={20} />}
              title="No upcoming appointments"
              description="You don't have any counseling appointments scheduled."
              action={
                <Link href="/counseling">
                  <Button size="sm" variant="outline">Find support</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <article
                  key={apt.id}
                  className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-3"
                  aria-label={`Appointment with ${apt.counselorName}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                        Session with {apt.counselorName}
                      </h3>
                      <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                        {new Date(apt.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--sage-light)] text-[var(--sage)] border border-[#C6DFCC]">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} aria-hidden="true" />
                      {apt.time} · {apt.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      {apt.mode === 'online' ? (
                        <><Video size={11} aria-hidden="true" /> Online</>
                      ) : (
                        <><MapPin size={11} aria-hidden="true" /> In-person</>
                      )}
                    </span>
                  </div>
                  {apt.meetingLink && (
                    <a
                      href={apt.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-[12px] font-medium text-[var(--primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                      Join meeting →
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Past sessions */}
        {past.length > 0 && (
          <section aria-label="Past appointments">
            <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] mb-3">Past sessions</h2>
            <p className="text-[13px] text-[var(--text-muted)] italic">No past sessions to show.</p>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
