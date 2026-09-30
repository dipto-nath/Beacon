import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { TrendAreaChart, TopFactorsChart } from '@/components/charts/StaffCharts';
import { campusAnalytics } from '@/data/mock';
import { Info } from 'lucide-react';

export const metadata: Metadata = { title: 'Campus Trends | Beacon Staff' };

export default function StaffTrendsPage() {
  const a = campusAnalytics;

  return (
    <AppLayout variant="staff">
      <div className="space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Campus Trends</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">{a.period} · Aggregated data</p>
        </header>

        {/* Privacy notice */}
        <div className="flex items-start gap-2 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[12px] text-[var(--text-muted)]">
          <Info size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            All charts show aggregated campus data. Individual student data is not accessible through this view.
            Statistics based on fewer than 10 responses are hidden to protect student privacy.
          </span>
        </div>

        {/* Trend charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section
            className="bg-white border border-[var(--border)] rounded-xl p-4"
            aria-label="Check-in volume trend"
          >
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Check-in volume</h2>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">Daily check-ins across campus</p>
            <TrendAreaChart data={a.trendsData} metric="checkIns" />
          </section>

          <section
            className="bg-white border border-[var(--border)] rounded-xl p-4"
            aria-label="Average mood trend"
          >
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Average reported mood</h2>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">Scale: 1 (very difficult) to 5 (very good)</p>
            <TrendAreaChart data={a.trendsData} metric="avgMood" />
          </section>

          <section
            className="bg-white border border-[var(--border)] rounded-xl p-4"
            aria-label="Average stress trend"
          >
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Average stress level</h2>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">Scale: 1 (low) to 4 (high)</p>
            <TrendAreaChart data={a.trendsData} metric="stressAvg" />
          </section>

          <section
            className="bg-white border border-[var(--border)] rounded-xl p-4"
            aria-label="Counseling demand trend"
          >
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Counseling requests</h2>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">Support demand over time</p>
            <TrendAreaChart data={a.trendsData} metric="counselingRequests" />
          </section>
        </div>

        {/* Top contributing factors */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-5"
          aria-label="Common reported factors"
        >
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            Common reported factors
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">
            Topics most frequently reported by students in check-ins this month. Does not imply causation.
          </p>
          <TopFactorsChart factors={a.topFactors} />
        </section>

        {/* Contextual notes */}
        <section
          className="bg-[var(--primary-light)] border border-[var(--primary-border)] rounded-xl p-4"
          aria-label="Contextual notes"
        >
          <h2 className="text-[13px] font-semibold text-[var(--primary)] mb-2">Context for this period</h2>
          <ul className="space-y-1.5">
            {[
              'Mid-semester assessments: 15–19 September',
              'Course registration deadline: 22 September',
              'Reading week: 22–26 September',
            ].map((note) => (
              <li key={note} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            Context markers are added manually by the wellbeing team. The platform does not automatically
            infer causation from these events.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
