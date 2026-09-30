import type { Metadata } from 'next';
import Link from 'next/link';
import { AppLayout } from '@/components/shared/AppLayout';
import { CheckInFlow } from '@/components/student/CheckInFlow';
import { WellbeingSnapshotCard } from '@/components/student/WellbeingSnapshot';
import { RecommendationCard } from '@/components/student/RecommendationCard';
import { AIInsight } from '@/components/ui/Helpers';
import { Button } from '@/components/ui/Button';
import { currentStudent, wellbeingSnapshot, recommendations } from '@/data/mock';
import { getGreeting } from '@/lib/utils';
import { ArrowRight, Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  const greeting = getGreeting();
  const topRecs = recommendations.slice(0, 2);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header greeting */}
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
            {greeting}, {currentStudent.firstName}.
          </h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Take a moment to check in with yourself.
          </p>
        </header>

        {/* Streak indicator */}
        {wellbeingSnapshot.streakDays >= 3 && (
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2 self-start w-fit">
            <Flame size={12} className="text-amber-500" aria-hidden="true" />
            <span>
              {wellbeingSnapshot.streakDays}-day check-in streak.{' '}
              <span className="text-[var(--text-secondary)]">Keep it up.</span>
            </span>
          </div>
        )}

        {/* Main check-in module */}
        <section aria-label="Today's check-in">
          <CheckInFlow />
        </section>

        {/* Wellbeing snapshot */}
        <WellbeingSnapshotCard snapshot={wellbeingSnapshot} />

        {/* AI-assisted pattern note */}
        <AIInsight>
          Your stress has been higher on days with heavier academic workload. Your mood tends to be more
          stable on days when you reported adequate sleep.
        </AIInsight>

        {/* Recommendations preview */}
        <section aria-label="Suggested for you">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Suggested for you</h2>
            <Link
              href="/recommendations"
              className="text-[12px] text-[var(--primary)] font-medium hover:underline flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              See all <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topRecs.map((r) => (
              <RecommendationCard key={r.id} recommendation={r} />
            ))}
          </div>
        </section>

        {/* Support prompt */}
        <section
          className="bg-[var(--primary-light)] border border-[var(--primary-border)] rounded-xl p-4 flex items-start justify-between gap-4"
          aria-label="Professional support"
        >
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--primary)] mb-1">
              Would it help to talk to someone?
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              University counselors are available for confidential sessions, online or in-person.
            </p>
          </div>
          <Link href="/counseling" className="shrink-0">
            <Button variant="outline" size="sm" aria-label="Find counseling support">
              Find support
            </Button>
          </Link>
        </section>

        {/* Privacy note */}
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Your check-ins are private and are not automatically shared with university staff.{' '}
          <Link href="/privacy" className="underline hover:text-[var(--text-secondary)]">
            Learn how your data is used.
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
