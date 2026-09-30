'use client';

import { Clock, Headphones, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  stress: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  academic: { bg: '#EEF3F9', border: '#C5D6E9', text: '#1E3A5F' },
  sleep: { bg: '#F0FDFA', border: '#99F6E4', text: '#0D9488' },
  relationships: { bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C' },
  loneliness: { bg: '#F0F7F2', border: '#C6DFCC', text: '#4D7C5E' },
  anxiety: { bg: '#EEF3F9', border: '#C5D6E9', text: '#1E3A5F' },
  focus: { bg: '#F0FDFA', border: '#99F6E4', text: '#0D9488' },
  burnout: { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C' },
  campus: { bg: '#F4F4F2', border: '#E4E4E2', text: '#52525B' },
};

const categoryLabels: Record<string, string> = {
  stress: 'Stress',
  academic: 'Academic',
  sleep: 'Sleep',
  relationships: 'Relationships',
  loneliness: 'Loneliness',
  anxiety: 'Anxiety',
  focus: 'Focus',
  burnout: 'Burnout',
  campus: 'Campus',
};

const typeLabels: Record<Resource['type'], string> = {
  article: 'Article',
  audio: 'Audio',
  guide: 'Guide',
  campus: 'Campus resource',
  external: 'External',
};

interface ResourceCardProps {
  resource: Resource;
  className?: string;
}

export function ResourceCard({ resource: r, className }: ResourceCardProps) {
  const catColors = categoryColors[r.category] || categoryColors.campus;

  return (
    <article
      className={cn(
        'bg-white border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3 hover:border-zinc-300 transition-colors',
        className
      )}
      aria-label={r.title}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
          style={{ background: catColors.bg, borderColor: catColors.border, color: catColors.text }}
        >
          {categoryLabels[r.category]}
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">{typeLabels[r.type]}</span>
        {r.readTime && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <Clock size={10} aria-hidden="true" />
            {r.readTime}
          </span>
        )}
        {r.listenTime && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <Headphones size={10} aria-hidden="true" />
            {r.listenTime}
          </span>
        )}
        {r.type === 'campus' && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <MapPin size={10} aria-hidden="true" />
            On campus
          </span>
        )}
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">{r.title}</h3>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{r.description}</p>
      </div>

      {r.what_it_covers.length > 0 && (
        <ul className="space-y-1">
          {r.what_it_covers.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-[12px] text-[var(--text-muted)]">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--border)] shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {r.href ? (
        <Link
          href={r.href}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] hover:underline self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          {r.type === 'external' ? 'Visit resource' : 'Read resource'}
          {r.type === 'external' ? <ExternalLink size={12} aria-hidden="true" /> : <ArrowRight size={13} aria-hidden="true" />}
        </Link>
      ) : (
        <button className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] hover:underline self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
          Read resource
          <ArrowRight size={13} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
