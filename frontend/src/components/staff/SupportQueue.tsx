'use client';

import { cn, caseStatusLabel, casePriorityLabel, casePriorityClass, timeAgo } from '@/lib/utils';
import { CaseStatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import type { SupportCase } from '@/types';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SupportQueueProps {
  cases: SupportCase[];
}

export function SupportQueue({ cases }: SupportQueueProps) {
  return (
    <div
      className="divide-y divide-[var(--border)]"
      role="list"
      aria-label="Support queue"
    >
      {cases.map((c) => (
        <div
          key={c.caseRef}
          role="listitem"
          className="py-3 first:pt-0 last:pb-0"
        >
          <Link
            href={`/staff/cases/${c.caseRef}`}
            className="flex items-start justify-between gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] rounded"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[12px] font-mono text-[var(--text-muted)]">{c.caseRef}</span>
                <PriorityBadge priority={c.priority} />
                <CaseStatusBadge status={c.status} />
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                {c.reason}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {timeAgo(c.receivedAt)}
                </span>
                {c.assignedTo && (
                  <span className="text-[11px] text-[var(--text-muted)]">
                    → {c.assignedTo}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-[var(--text-muted)] shrink-0 mt-0.5 group-hover:text-[var(--primary)] transition-colors"
              aria-hidden="true"
            />
          </Link>
        </div>
      ))}
    </div>
  );
}
