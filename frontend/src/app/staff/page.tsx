'use client';

import { AppLayout } from '@/components/shared/AppLayout';
import { MetricCard } from '@/components/ui/Card';
import { SupportQueue } from '@/components/staff/SupportQueue';
import { StressDistributionChart, TrendAreaChart } from '@/components/charts/StaffCharts';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffOverviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'counselor' && user.role !== 'wellbeing_admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['staffAnalytics'],
    queryFn: async () => {
      const res = await api.get('/staff/analytics/overview');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['staffCases'],
    queryFn: async () => {
      const res = await api.get('/staff/cases');
      return res.data;
    },
    enabled: !!user,
  });

  if (loading || analyticsLoading || queueLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!analytics) return null;
  const a = analytics;
  const supportCases = queueData?.data || [];

  return (
    <AppLayout variant="staff">
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-light)] border border-[var(--primary-border)] px-2 py-0.5 rounded">
                Staff portal
              </span>
            </div>
            <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
              Welcome, {user?.first_name}
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] mt-1">Overview</p>
          </div>
          <Link href="/staff/support">
            <Button size="sm">View support queue</Button>
          </Link>
        </header>

        {/* Privacy statement for staff */}
        <div className="flex items-start gap-2 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[12px] text-[var(--text-muted)]">
          <Info size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Campus insights are based on aggregated data and designed to protect individual student privacy.
            Individual student information is not visible in this view.{' '}
            <button className="underline hover:text-[var(--text-secondary)]">
              How aggregation works
            </button>
          </span>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Check-ins"
            value={a.total_check_ins.toLocaleString()}
            subvalue="this month"
            className="col-span-1"
          />
          <MetricCard
            label="Students"
            value={a.unique_students.toLocaleString()}
            subvalue="engaged"
          />
          <MetricCard
            label="Avg. stress"
            value={a.average_stress || "Moderate"}
            subvalue="campus-wide"
          />
          <MetricCard
            label="Counseling requests"
            value={a.counseling_requests}
            subvalue="this month"
            trend="up"
            trendLabel="vs. last month"
          />
          <MetricCard
            label="Resource views"
            value={a.resource_engagement.toLocaleString()}
          />
          <MetricCard
            label="Escalations"
            value={a.escalations}
            subvalue="pending review"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Check-in trend */}
          <section
            className="bg-white border border-[var(--border)] rounded-xl p-4"
            aria-label="Check-in trend"
          >
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
              Check-ins over time
            </h2>
            <TrendAreaChart data={a.trends.data} metric="checkIns" />
          </section>

          {/* Stress distribution */}
          <section
            className="bg-white border border-[var(--border)] rounded-xl p-4"
            aria-label="Stress distribution"
          >
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
              Stress distribution
            </h2>
            <StressDistributionChart distribution={a.stress_distribution} />
            <p className="text-[11px] text-[var(--text-muted)] mt-3">
              Percentage of students reporting each stress level in the current period.
            </p>
          </section>
        </div>

        {/* Support queue preview */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl"
          aria-label="Recent support requests"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
              Recent support requests
            </h2>
            <Link href="/staff/support" className="text-[12px] text-[var(--primary)] font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="px-5 py-4">
            <SupportQueue cases={supportCases.slice(0, 3)} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
