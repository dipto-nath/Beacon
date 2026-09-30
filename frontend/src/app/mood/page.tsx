'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/shared/AppLayout';
import { MoodChart } from '@/components/charts/MoodChart';
import { AIInsight } from '@/components/ui/Helpers';
import { CheckInTimeline } from '@/components/student/CheckInTimeline';
import { moodData7Days, moodData30Days, checkInHistory } from '@/data/mock';
import { cn } from '@/lib/utils';

const tabs = [
  { label: '7 days', key: '7d' },
  { label: '30 days', key: '30d' },
] as const;

type Tab = (typeof tabs)[number]['key'];

export default function MoodPage() {
  const [activeTab, setActiveTab] = useState<Tab>('7d');
  const [showStress, setShowStress] = useState(false);

  const chartData = activeTab === '7d' ? moodData7Days : moodData30Days;

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">My Mood</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Your mood over time, based on your check-in responses.
          </p>
        </header>

        {/* Chart card */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-5"
          aria-label="Mood trend chart"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Mood trend</h2>
            <div className="flex items-center gap-2">
              {/* Period tabs */}
              <div
                className="flex rounded-lg border border-[var(--border)] overflow-hidden"
                role="tablist"
                aria-label="Time period"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'text-[12px] font-medium px-3 py-1.5 transition-colors',
                      activeTab === tab.key
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#1E3A5F] inline-block" aria-hidden="true" />
              <span className="text-[11px] text-[var(--text-muted)]">Mood</span>
            </div>
            <button
              onClick={() => setShowStress(!showStress)}
              className={cn(
                'flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded transition-colors',
                showStress
                  ? 'text-amber-700 bg-amber-50 border border-amber-200'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]'
              )}
              aria-pressed={showStress}
            >
              <span
                className="w-3 h-0.5 inline-block"
                style={{
                  background: '#B45309',
                  backgroundImage: showStress
                    ? 'repeating-linear-gradient(90deg, #B45309 0px, #B45309 4px, transparent 4px, transparent 6px)'
                    : 'none',
                }}
                aria-hidden="true"
              />
              Stress overlay
            </button>
          </div>

          <MoodChart data={chartData} showStress={showStress} />

          <div className="mt-3 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Mood scale: 1 = Very difficult, 5 = Very good</span>
            {showStress && <span>Stress: 1 = Low, 4 = High</span>}
          </div>
        </section>

        {/* Observed patterns */}
        <section aria-label="Observed patterns">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">Patterns noticed</h2>
          <AIInsight>
            Your stress has been higher on days with heavier academic workload. Your mood appears more
            stable on days when you reported adequate sleep. These are observed patterns based on your
            own responses, not clinical conclusions.
          </AIInsight>
        </section>

        {/* Check-in history */}
        <section aria-label="Recent check-ins">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Recent check-ins</h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Private — not shared automatically
            </p>
          </div>
          <CheckInTimeline checkIns={checkInHistory} />
        </section>
      </div>
    </AppLayout>
  );
}
