import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { RecommendationCard } from '@/components/student/RecommendationCard';
import { recommendations } from '@/data/mock';
import { Cpu } from 'lucide-react';

export const metadata: Metadata = { title: 'Recommendations' };

export default function RecommendationsPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">For you</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Suggestions based on your recent check-ins.
          </p>
        </header>

        {/* Transparency note */}
        <div className="flex items-start gap-2 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2.5">
          <Cpu size={13} className="text-[var(--text-muted)] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
            Each recommendation explains why it was suggested. These are evidence-based suggestions,
            not prescriptions. Speak to a counselor if you feel you need more personalised support.
          </p>
        </div>

        <div className="space-y-3">
          {recommendations.map((r) => (
            <RecommendationCard key={r.id} recommendation={r} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
