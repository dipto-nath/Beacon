'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/shared/AppLayout';
import { CheckInFlow } from '@/components/student/CheckInFlow';
import { RecommendationCard } from '@/components/student/RecommendationCard';
import { AIInsight } from '@/components/ui/Helpers';
import { Button } from '@/components/ui/Button';
import { getGreeting } from '@/lib/utils';
import { ArrowRight, Flame, Heart, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { MoodLevel, CheckInTag } from '@/types';

export default function HomePage() {
  const { user, mounted } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  });
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
    },
  });

  const handleCheckInComplete = (mood: MoodLevel, selectedTags: CheckInTag[], note: string) => {
    submitCheckIn.mutate({
      mood: mood.toUpperCase(),
      stress: 'MODERATE',
      energy: 'MODERATE',
      sleep: 'ADEQUATE',
      tags: selectedTags.map((t) => t.toUpperCase()),
      note,
    });
  };

  const router = useRouter();

  useEffect(() => {
    if (
      user &&
      (user.role === 'counselor' || user.role === 'wellbeing_admin' || user.role === 'admin')
    ) {
      router.push('/staff');
    }
  }, [user, router]);

  if (!mounted) return null;
  if (!user) return <div className="p-8 text-[var(--text-muted)]">Loading…</div>;

  const snapshot = snapshotData || { streak_days: 0 };
  const topRecs = (recsData || []).slice(0, 2);
  const hasCheckedInToday =
    justCheckedIn ||
    (snapshotData?.last_check_in_date &&
      new Date(snapshotData.last_check_in_date).toDateString() === new Date().toDateString());

  return (
    <AppLayout pageTitle={`${greeting}, ${user.first_name}`}>
      <div className="space-y-5 max-w-2xl">
        {/* Greeting sub-text */}
        <p className="text-[14px] text-[var(--text-muted)] -mt-4">
          Take a moment to check in with yourself.
        </p>

        {/* Streak badge */}
        {snapshot.streak_days >= 3 && (
          <div
            className="inline-flex items-center gap-2 text-[12px] font-medium rounded-full px-4 py-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(212,130,10,0.08) 0%, rgba(229,160,48,0.08) 100%)',
              border: '1px solid rgba(212,130,10,0.2)',
              color: 'var(--amber)',
            }}
          >
            <Flame size={13} aria-hidden="true" />
            <span>
              {snapshot.streak_days}-day streak —{' '}
              <span style={{ color: 'var(--text-secondary)' }}>keep it up!</span>
            </span>
          </div>
        )}

        {/* Check-in card */}
        {!hasCheckedInToday ? (
          <section aria-label="Today's check-in">
            <CheckInFlow onComplete={handleCheckInComplete} />
          </section>
        ) : (
          <section
            className="beacon-card text-center py-8"
            aria-live="polite"
            style={{ background: 'linear-gradient(135deg, rgba(39,181,160,0.06) 0%, rgba(59,124,228,0.06) 100%)' }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #27B5A0 0%, #3B9FD4 100%)',
                boxShadow: '0 6px 20px rgba(39,181,160,0.35)',
              }}
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1 tracking-tight">
              Check-in complete ✓
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
              Thank you for checking in today. Your responses are private and help you understand your patterns over time.
            </p>
          </section>
        )}

        {/* AI Insight */}
        {insightLoading ? (
          <AIInsight>Generating your personalized insight…</AIInsight>
        ) : insightData?.insight ? (
          <AIInsight>{insightData.insight}</AIInsight>
        ) : null}

        {/* Recommendations */}
        {topRecs.length > 0 && (
          <section aria-label="Suggested for you">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
                Suggested for you
              </h2>
              <Link
                href="/recommendations"
                className="text-[12px] text-[var(--primary)] font-medium hover:underline flex items-center gap-1 transition-colors"
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

        {/* Find support CTA */}
        <section
          className="beacon-card flex items-start justify-between gap-4"
          aria-label="Professional support"
          style={{
            background: 'linear-gradient(135deg, rgba(59,124,228,0.06) 0%, rgba(123,143,212,0.06) 100%)',
            borderColor: 'var(--primary-border)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
              }}
              aria-hidden="true"
            >
              <MessageCircle size={16} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--primary)] mb-0.5">
                Would it help to talk to someone?
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                University counselors are available for confidential sessions, online or in‑person.
              </p>
            </div>
          </div>
          <Link href="/counseling" className="shrink-0 mt-0.5">
            <Button variant="outline" size="sm" aria-label="Find counseling support">
              Find support
            </Button>
          </Link>
        </section>

        {/* Privacy footnote */}
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed flex items-center gap-1.5">
          <ShieldCheck size={11} aria-hidden="true" />
          Your check-ins are private and are not automatically shared with university staff.{' '}
          <Link href="/privacy" className="underline hover:text-[var(--text-secondary)] transition-colors">
            Learn how your data is used.
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
