'use client';

import { ArrowRight, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Recommendation } from '@/types';
import Link from 'next/link';

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

const typeColors: Record<Recommendation['type'], { bg: string; border: string; text: string }> = {
  exercise: { bg: '#F0FDFA', border: '#99F6E4', text: '#0D9488' },
  technique: { bg: '#EEF3F9', border: '#C5D6E9', text: '#1E3A5F' },
  resource: { bg: '#F0F7F2', border: '#C6DFCC', text: '#4D7C5E' },
  social: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  professional: { bg: '#F4F4F2', border: '#E4E4E2', text: '#52525B' },
};

const typeLabels: Record<Recommendation['type'], string> = {
  exercise: 'Exercise',
  technique: 'Technique',
  resource: 'Resource',
  social: 'Social',
  professional: 'Support',
};

export function RecommendationCard({ recommendation: r, className }: RecommendationCardProps) {
  const colors = typeColors[r.type];

  return (
    <article
      className={cn(
        'bg-white border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3 hover:border-zinc-300 transition-colors',
        className
      )}
      aria-label={r.title}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
            style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
          >
            {typeLabels[r.type]}
          </span>
          {r.duration && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Clock size={10} aria-hidden="true" />
              {r.duration}
            </span>
          )}
          {r.type === 'professional' && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <User size={10} aria-hidden="true" />
              Human support
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">{r.title}</h3>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{r.description}</p>
      </div>

      <div className="text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] rounded-md px-2.5 py-1.5 leading-relaxed">
        {r.reason}
      </div>

      {r.actionHref ? (
        <Link
          href={r.actionHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] hover:underline self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          {r.actionLabel}
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      ) : (
        <Button size="sm" variant="outline" className="self-start">
          {r.actionLabel}
        </Button>
      )}
    </article>
  );
}
