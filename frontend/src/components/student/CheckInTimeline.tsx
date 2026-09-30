'use client';

import { formatDate, moodLabel, moodBgClass, stressLabel, stressBgClass, tagLabel, cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CheckIn } from '@/types';

interface TimelineEntryProps {
  checkIn: CheckIn;
}

function TimelineEntry({ checkIn }: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--surface-subtle)] transition-colors"
        aria-expanded={expanded}
        aria-controls={`entry-${checkIn.id}`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            {formatDate(checkIn.date)}
          </span>
          <span
            className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded border',
              moodBgClass(checkIn.mood)
            )}
          >
            {moodLabel(checkIn.mood)}
          </span>
          <span
            className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded border',
              stressBgClass(checkIn.stress)
            )}
          >
            Stress: {stressLabel(checkIn.stress)}
          </span>
        </div>
        <span className="text-[var(--text-muted)] ml-2 shrink-0" aria-hidden="true">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <div
          id={`entry-${checkIn.id}`}
          className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-2"
        >
          {checkIn.tags.length > 0 && (
            <div>
              <p className="text-[11px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider font-medium">Mentioned</p>
              <div className="flex flex-wrap gap-1">
                {checkIn.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] border border-[var(--border)] px-2 py-0.5 rounded"
                  >
                    {tagLabel(t)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {checkIn.note && (
            <div>
              <p className="text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider font-medium">Your note</p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-subtle)] rounded-lg px-3 py-2">
                {checkIn.note}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-[var(--surface-subtle)] rounded-lg px-3 py-2">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Sleep</p>
              <p className="text-[12px] font-medium text-[var(--text-secondary)]">
                {checkIn.sleep === 'good' ? 'Good' : checkIn.sleep === 'adequate' ? 'Adequate' : checkIn.sleep === 'needs_attention' ? 'Needs attention' : 'Poor'}
              </p>
            </div>
            <div className="bg-[var(--surface-subtle)] rounded-lg px-3 py-2">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Energy</p>
              <p className="text-[12px] font-medium text-[var(--text-secondary)]">
                {checkIn.energy === 'high' ? 'High' : checkIn.energy === 'stable' ? 'Stable' : checkIn.energy === 'moderate' ? 'Moderate' : 'Low'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CheckInTimelineProps {
  checkIns: CheckIn[];
}

export function CheckInTimeline({ checkIns }: CheckInTimelineProps) {
  return (
    <div className="space-y-2" role="list" aria-label="Check-in history">
      {checkIns.map((ci) => (
        <div key={ci.id} role="listitem">
          <TimelineEntry checkIn={ci} />
        </div>
      ))}
    </div>
  );
}
