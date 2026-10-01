'use client';

import { AppLayout } from '@/components/shared/AppLayout';
import { MetricCard } from '@/components/ui/Card';
import { SupportQueue } from '@/components/staff/SupportQueue';
import { StressDistributionChart, TrendAreaChart } from '@/components/charts/StaffCharts';
import { MorphingSquare } from '@/components/ui/morphing-square';
import { Info, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/app/providers';

export default function StaffOverviewPage() {
  const { user, mounted } = useAuth({
    requireAuth: true,
    allowedRoles: ['counselor', 'wellbeing_admin', 'admin'],
    redirectTo: '/login',
  });

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: queryKeys.staffAnalytics(user?.id),
    queryFn: async () => {
      const res = await api.get('/staff/analytics/overview');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: queryKeys.staffCases(user?.id),
    queryFn: async () => {
      const res = await api.get('/staff/cases');
      return res.data;
    },
    enabled: !!user,
  });

  if (!mounted) return null;

  if (analyticsLoading || queueLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 20%, rgba(147,185,255,0.2) 0%, transparent 60%), ' +
            'linear-gradient(165deg, #EAF0FD 0%, #F2EDFB 100%)',
        }}
      >
        <div className="text-center">
          <MorphingSquare message="Loading staff dashboard…" messagePlacement="bottom" />
          <p className="mt-6 text-sm text-[var(--text-muted)] font-medium">
            Fetching campus analytics…
          </p>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <AppLayout variant="staff" pageTitle="Overview">
        <div
          className="beacon-card flex flex-col items-center gap-4 py-12 text-center"
          style={{ borderColor: 'var(--danger-border)', background: 'var(--danger-light)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger-border)' }}
          >
            <AlertTriangle size={20} className="text-[var(--danger)]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[var(--danger)] mb-1">
              Failed to load analytics
            </p>
            <p className="text-[13px] text-[var(--text-muted)]">
              Unable to fetch campus analytics data.
            </p>
          </div>
          <button
            onClick={() => refetchAnalytics()}
            disabled={analyticsLoading}
            className="fab"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!analytics) return null;
  const a = analytics;
  const supportCases = queueData?.data || [];

  return (
    <AppLayout variant="staff" pageTitle={`Welcome, ${user?.first_name}`}>
      <div className="space-y-5">

        {/* Privacy notice */}
        <div
          className="flex items-start gap-3 rounded-[var(--radius)] px-4 py-3 text-[12px] text-[var(--text-muted)]"
          style={{
            background: 'rgba(59,124,228,0.04)',
            border: '1px solid var(--primary-border)',
          }}
        >
          <Info size={14} className="shrink-0 mt-0.5 text-[var(--primary)]" aria-hidden="true" />
          <span>
            Campus insights are based on{' '}
            <strong className="text-[var(--text-secondary)]">aggregated, anonymised data</strong> designed
            to protect individual student privacy.{' '}
            <button className="underline hover:text-[var(--primary)] transition-colors">
              How aggregation works
            </button>
          </span>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
          <MetricCard
            label="Check-ins"
            value={a.total_check_ins.toLocaleString()}
            subvalue="this month"
            accent="blue"
            className="col-span-1"
          />
          <MetricCard
            label="Students"
            value={a.unique_students.toLocaleString()}
            subvalue="engaged"
            accent="lavender"
          />
          <MetricCard
            label="Avg. stress"
            value={a.average_stress || 'Moderate'}
            subvalue="campus-wide"
            accent="teal"
          />
          <MetricCard
            label="Counseling"
            value={a.counseling_requests}
            subvalue="requests"
            trend="up"
            trendLabel="vs. last month"
            accent="sage"
          />
          <MetricCard
            label="Resource views"
            value={a.resource_engagement.toLocaleString()}
            accent="lavender"
          />
          <MetricCard
            label="Escalations"
            value={a.escalations}
            subvalue="pending"
            trend="up"
            accent="red"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Check-in trend — wider */}
          <section
            className="lg:col-span-3 beacon-card"
            aria-label="Check-in trend"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
                  Check-ins over time
                </h2>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Rolling 30-day view</p>
              </div>
              <Link href="/staff/trends">
                <Button variant="ghost" size="sm" className="gap-1">
                  Full report <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
            <TrendAreaChart data={a.trends.data} metric="check_ins" />
          </section>

          {/* Stress distribution — narrower */}
          <section
            className="lg:col-span-2 beacon-card"
            aria-label="Stress distribution"
          >
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
                Stress distribution
              </h2>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Current period</p>
            </div>
            <StressDistributionChart distribution={a.stress_distribution} />
            <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
              Percentage of students reporting each stress level.
            </p>
          </section>
        </div>

        {/* Support queue */}
        <section
          className="beacon-card !p-0 overflow-hidden"
          aria-label="Recent support requests"
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
                Recent support requests
              </h2>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Showing latest 3</p>
            </div>
            <Link href="/staff/support">
              <Button size="sm" pill>
                View all <ArrowRight size={12} />
              </Button>
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
