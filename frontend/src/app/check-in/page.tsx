import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { CheckInFlow } from '@/components/student/CheckInFlow';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = { title: 'Check in' };

export default function CheckInPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-5">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Check in</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            A brief, private moment to understand how you are doing.
          </p>
        </header>

        {/* Privacy indicator */}
        <div className="flex items-center gap-2 text-[12px] text-[var(--sage)] bg-[var(--sage-light)] border border-[#C6DFCC] rounded-lg px-3 py-2">
          <ShieldCheck size={13} aria-hidden="true" />
          <span>
            Your responses are confidential and are not automatically shared with university staff.
          </span>
        </div>

        <CheckInFlow />

        <div className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">Why check in?</h2>
          <ul className="space-y-2">
            {[
              'Helps you notice patterns in how you feel over time.',
              'Generates personalised suggestions based on your responses.',
              'Helps you decide when professional support might be useful.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
