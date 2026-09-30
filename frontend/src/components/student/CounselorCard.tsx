'use client';

import { Video, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CounselorProfile } from '@/types';

interface CounselorCardProps {
  counselor: CounselorProfile;
  className?: string;
}

const availabilityConfig = {
  available: { label: 'Available', bg: '#F0F7F2', border: '#C6DFCC', text: '#4D7C5E' },
  limited: { label: 'Limited availability', bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  unavailable: { label: 'Currently unavailable', bg: '#F4F4F2', border: '#E4E4E2', text: '#A1A1AA' },
};

export function CounselorCard({ counselor: c, className }: CounselorCardProps) {
  const avail = availabilityConfig[c.availability];

  return (
    <article
      className={cn(
        'bg-white border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3',
        className
      )}
      aria-label={`${c.name}, ${c.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-semibold shrink-0"
            style={{ background: 'var(--primary)' }}
            aria-hidden="true"
          >
            {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{c.name}</h3>
            <p className="text-[12px] text-[var(--text-muted)]">{c.title}</p>
          </div>
        </div>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded border shrink-0"
          style={{ background: avail.bg, borderColor: avail.border, color: avail.text }}
        >
          {avail.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {c.specializations.map((s) => (
          <span
            key={s}
            className="text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] border border-[var(--border)] px-2 py-0.5 rounded"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
        {c.mode.includes('online') && (
          <span className="flex items-center gap-1">
            <Video size={11} aria-hidden="true" />
            Online
          </span>
        )}
        {c.mode.includes('in_person') && (
          <span className="flex items-center gap-1">
            <MapPin size={11} aria-hidden="true" />
            In-person
          </span>
        )}
        {c.nextSlot && (
          <span className="text-[11px] text-[var(--text-secondary)] ml-auto">
            Next: {c.nextSlot}
          </span>
        )}
      </div>

      {c.availability !== 'unavailable' && (
        <Button
          size="sm"
          variant="outline"
          fullWidth
          aria-label={`Request appointment with ${c.name}`}
        >
          Request appointment
        </Button>
      )}
    </article>
  );
}
