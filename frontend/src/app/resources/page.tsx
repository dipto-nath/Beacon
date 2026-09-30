'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/shared/AppLayout';
import { ResourceCard } from '@/components/student/ResourceCard';
import { resources } from '@/data/mock';
import type { ResourceCategory } from '@/types';
import { cn } from '@/lib/utils';

const categories: { key: ResourceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'stress', label: 'Stress' },
  { key: 'academic', label: 'Academic' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'loneliness', label: 'Loneliness' },
  { key: 'burnout', label: 'Burnout' },
  { key: 'focus', label: 'Focus' },
  { key: 'campus', label: 'Campus' },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? resources
    : resources.filter((r) => r.category === activeCategory);

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-5">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Resources</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Practical guides, exercises, and campus support.
          </p>
        </header>

        {/* Category filter */}
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={activeCategory === cat.key}
              className={cn(
                'text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors',
                activeCategory === cat.key
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary-border)] hover:text-[var(--primary)]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resource grid */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-[13px]">
              No resources in this category yet.
            </div>
          ) : (
            filtered.map((r) => <ResourceCard key={r.id} resource={r} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}
