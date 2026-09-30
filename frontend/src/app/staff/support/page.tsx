import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { SupportQueue } from '@/components/staff/SupportQueue';
import { supportCases } from '@/data/mock';
import { Info } from 'lucide-react';

export const metadata: Metadata = { title: 'Support Queue | Beacon Staff' };

const statusGroups = [
  { label: 'Urgent', statuses: ['new', 'reviewing', 'contacted'] as const, description: 'Requires attention' },
  { label: 'Scheduled', statuses: ['scheduled'] as const, description: 'Appointment confirmed' },
  { label: 'Resolved', statuses: ['resolved'] as const, description: 'Closed cases' },
];

export default function StaffSupportPage() {
  return (
    <AppLayout variant="staff">
      <div className="max-w-2xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Support queue</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Human-escalated support requests requiring counselor review.
          </p>
        </header>

        {/* Privacy notice */}
        <div className="flex items-start gap-2 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[12px] text-[var(--text-muted)]">
          <Info size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Cases are displayed without student-identifying information in list view. Open a case to
            access the minimum information required for intervention. Handle all case information
            according to university confidentiality policy.
          </span>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-[var(--danger-border)] rounded-lg px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-[var(--danger)]">
              {supportCases.filter((c) => ['new', 'reviewing', 'contacted'].includes(c.status)).length}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Active</p>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-[var(--sage)]">
              {supportCases.filter((c) => c.status === 'scheduled').length}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Scheduled</p>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-[var(--text-muted)]">
              {supportCases.filter((c) => c.status === 'resolved').length}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Resolved</p>
          </div>
        </div>

        {/* Full queue */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl"
          aria-label="All support cases"
        >
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">All cases</h2>
          </div>
          <div className="px-5 py-4">
            <SupportQueue cases={supportCases} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
