'use client';

import { cn, moodLabel, moodBgClass, stressLabel, stressBgClass, trendIcon, trendLabel, trendColor } from '@/lib/utils';
import type { WellbeingSnapshot } from '@/types';

interface WellbeingSnapshotCardProps {
  snapshot: WellbeingSnapshot;
}

export function WellbeingSnapshotCard({ snapshot }: WellbeingSnapshotCardProps) {
  const metrics = [
    {
      label: 'Mood',
      value: moodLabel(snapshot.currentMood),
      className: moodBgClass(snapshot.currentMood),
    },
    {
      label: 'Stress',
      value: stressLabel(snapshot.stress),
      className: stressBgClass(snapshot.stress),
    },
    {
      label: 'Sleep',
      value: snapshot.sleep === 'good'
        ? 'Good'
        : snapshot.sleep === 'adequate'
        ? 'Adequate'
        : snapshot.sleep === 'needs_attention'
        ? 'Needs attention'
        : 'Poor',
      className:
        snapshot.sleep === 'good'
          ? 'bg-green-50 text-green-700 border-green-200'
          : snapshot.sleep === 'adequate'
          ? 'bg-teal-50 text-teal-700 border-teal-200'
          : snapshot.sleep === 'needs_attention'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-red-50 text-red-700 border-red-200',
    },
    {
      label: 'Energy',
      value: snapshot.energy === 'high'
        ? 'High'
        : snapshot.energy === 'stable'
        ? 'Stable'
        : snapshot.energy === 'moderate'
        ? 'Moderate'
        : 'Low',
      className:
        snapshot.energy === 'high'
          ? 'bg-green-50 text-green-700 border-green-200'
          : snapshot.energy === 'stable'
          ? 'bg-teal-50 text-teal-700 border-teal-200'
          : snapshot.energy === 'moderate'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-red-50 text-red-700 border-red-200',
    },
  ];

  return (
    <section
      className="beacon-card"
      aria-label="Your recent well-being"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
            Your recent well-being
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Based on your last 7 check-ins</p>
        </div>
        <div
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border"
          style={{
            color: trendColor(snapshot.moodTrend),
            background: snapshot.moodTrend === 'improving'
              ? 'rgba(39,181,160,0.08)'
              : snapshot.moodTrend === 'declining'
              ? 'rgba(224,82,82,0.08)'
              : 'rgba(100,120,160,0.07)',
            borderColor: snapshot.moodTrend === 'improving'
              ? 'rgba(39,181,160,0.25)'
              : snapshot.moodTrend === 'declining'
              ? 'rgba(224,82,82,0.2)'
              : 'var(--border)',
          }}
        >
          <span aria-hidden="true">{trendIcon(snapshot.moodTrend)}</span>
          <span>Mood {trendLabel(snapshot.moodTrend).toLowerCase()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              'rounded-[var(--radius)] border px-3 py-3 text-center',
              m.className
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-50 mb-0.5">
              {m.label}
            </p>
            <p className="text-[13px] font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
        These reflect your self-reported responses. They are not a clinical assessment.
      </p>
    </section>
  );
}
