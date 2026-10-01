'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/shared/AppLayout';
import { CheckInFlow } from '@/components/student/CheckInFlow';
import { WellbeingSnapshotCard } from '@/components/student/WellbeingSnapshot';
import { RecommendationCard } from '@/components/student/RecommendationCard';
import { AIInsight } from '@/components/ui/Helpers';
import { Button } from '@/components/ui/Button';
import { getGreeting } from '@/lib/utils';
import { ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { MoodLevel, CheckInTag } from '@/types';

export default function HomePage() {
  const { user, loading } = useAuth();
  const greeting = getGreeting();

  const { data: snapshotData } = useQuery({
    queryKey: ['wellbeingSnapshot'],
    queryFn: async () => {
      const res = await api.get('/check-ins/streak');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: recsData } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const res = await api.get('/recommendations');
      return res.data.data;
    },
    enabled: !!user,
  });

  const { data: insightData, isLoading: insightLoading } = useQuery({
    queryKey: ['insight'],
    queryFn: async () => {
      const res = await api.get('/check-ins/insight');
      return res.data;
    },
    enabled: !!user,
  });

  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const submitCheckIn = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/check-ins', data);
    },
    onSuccess: () => {
      setJustCheckedIn(true);
    }
  });

  const handleCheckInComplete = (mood: MoodLevel, selectedTags: CheckInTag[], note: string) => {
    // Send default values for stress, energy, sleep since the flow only collects mood
    submitCheckIn.mutate({
      mood: mood.toUpperCase(),
      stress: 'MODERATE',
      energy: 'MODERATE',
      sleep: 'ADEQUATE',
      tags: selectedTags.map(t => t.toUpperCase()),
      note,
    });
  };

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-8">Loading...</div>;
  }

  const snapshot = snapshotData || { streak_days: 0 };
  const topRecs = (recsData || []).slice(0, 2);

  const hasCheckedInToday = justCheckedIn || (snapshotData?.last_check_in_date && new Date(snapshotData.last_check_in_date).toDateString() === new Date().toDateString());

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
            {greeting}, {user.first_name}.
          </h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Take a moment to check in with yourself.
          </p>
        </header>

        {snapshot.streak_days >= 3 && (
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2 self-start w-fit">
            <Flame size={12} className="text-amber-500" aria-hidden="true" />
            <span>
              {snapshot.streak_days}-day check-in streak.{' '}
              <span className="text-[var(--text-secondary)]">Keep it up.</span>
            </span>
          </div>
        )}

        {!hasCheckedInToday ? (
          <section aria-label="Today's check-in">
            <CheckInFlow onComplete={handleCheckInComplete} />
          </section>
        ) : (
          <section className="bg-white border border-[var(--border)] rounded-xl p-6 text-center" aria-live="polite">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#F0FDFA] border-2 border-[#99F6E4] text-[#0D9488]">
               ✓
            </div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Check-in complete</h2>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
              Thank you for checking in today. Your responses are private and help you understand your patterns over time.
            </p>
          </section>
        )}

        {/* Note: In a real app we'd map snapshot data properly to WellbeingSnapshotCard, for now omitting if missing full data */}
        
        {insightLoading ? (
          <AIInsight>Generating your personalized insight...</AIInsight>
        ) : insightData?.insight ? (
          <AIInsight>{insightData.insight}</AIInsight>
        ) : null}

        {topRecs.length > 0 && (
          <section aria-label="Suggested for you">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Suggested for you</h2>
              <Link
                href="/recommendations"
                className="text-[12px] text-[var(--primary)] font-medium hover:underline flex items-center gap-1"
              >
                See all <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topRecs.map((r: any) => (
                <RecommendationCard key={r.id} recommendation={r} />
              ))}
            </div>
          </section>
        )}

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

