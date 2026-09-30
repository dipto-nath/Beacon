import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { CounselorCard } from '@/components/student/CounselorCard';
import { counselors } from '@/data/mock';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Counseling' };

const steps = [
  'Submit your request through this page.',
  'Choose your preferred availability and session mode.',
  'A counselor reviews your request.',
  'Your appointment is confirmed by email.',
];

export default function CounselingPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Talk to a counselor</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Confidential support from trained university counselors.
          </p>
        </header>

        {/* Confidentiality statement */}
        <div className="flex items-start gap-2.5 bg-[var(--sage-light)] border border-[#C6DFCC] rounded-xl p-4">
          <ShieldCheck size={16} className="text-[var(--sage)] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-[var(--sage)] mb-1">Your session is confidential</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              What you discuss with a counselor is protected by professional confidentiality. Information
              is only shared in exceptional circumstances defined by university safeguarding policy.
            </p>
          </div>
        </div>

        {/* What happens next */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-4"
          aria-label="What happens next"
        >
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">What happens next</h2>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full bg-[var(--primary-light)] border border-[var(--primary-border)] text-[var(--primary)] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="text-[13px] text-[var(--text-secondary)]">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Counselors */}
        <section aria-label="Available counselors">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">Available support</h2>
          <div className="space-y-3">
            {counselors.map((c) => (
              <CounselorCard key={c.id} counselor={c} />
            ))}
          </div>
        </section>

        {/* If you need to talk urgently */}
        <section
          className="bg-[var(--danger-light)] border border-[var(--danger-border)] rounded-xl p-4"
          aria-label="Urgent support"
        >
          <h2 className="text-[14px] font-semibold text-[var(--danger)] mb-1">
            Need to speak with someone urgently?
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] mb-3">
            If you are in crisis or need immediate support, please do not wait for an appointment.
          </p>
          <a
            href="/help"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--danger)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
          >
            View immediate support options <ChevronRight size={14} aria-hidden="true" />
          </a>
        </section>
      </div>
    </AppLayout>
  );
}
