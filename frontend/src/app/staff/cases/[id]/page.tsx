import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { supportCases } from '@/data/mock';
import { CaseStatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatDate, timeAgo } from '@/lib/utils';
import { ShieldCheck, Cpu, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = supportCases.find((c) => c.caseRef === id);
  if (!c) return { title: 'Case not found' };
  return { title: `${c.caseRef} | Beacon Staff` };
}

const statusOptions = ['new', 'reviewing', 'contacted', 'scheduled', 'resolved'] as const;

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = supportCases.find((c) => c.caseRef === id);

  if (!c) notFound();

  return (
    <AppLayout variant="staff">
      <div className="max-w-xl space-y-5">
        {/* Back */}
        <Link
          href="/staff/support"
          className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <ChevronLeft size={13} aria-hidden="true" />
          Back to support queue
        </Link>

        <header>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[12px] text-[var(--text-muted)]">{c.caseRef}</span>
            <PriorityBadge priority={c.priority} />
            <CaseStatusBadge status={c.status} />
          </div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Case detail</h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Received {timeAgo(c.receivedAt)} · Last updated {timeAgo(c.lastUpdated)}
          </p>
        </header>

        {/* Confidentiality reminder */}
        <div className="flex items-start gap-2 bg-[var(--sage-light)] border border-[#C6DFCC] rounded-lg px-3 py-2.5 text-[11px] text-[var(--sage)]">
          <ShieldCheck size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Handle this case in accordance with university confidentiality policy. Only access the
            minimum information required for intervention.
          </span>
        </div>

        {/* Reason */}
        <section className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-2">
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Reason for referral
          </h2>
          <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">{c.reason}</p>
        </section>

        {/* AI signal note */}
        <div className="flex items-start gap-2 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-lg px-3 py-2.5">
          <Cpu size={12} className="text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            <span className="font-medium text-[var(--text-secondary)]">AI-generated support signal</span>
            {' '}— Human review required. This case was escalated based on automated pattern detection.
            A trained counselor must make all clinical or welfare judgments.
          </div>
        </div>

        {/* Assignment */}
        <section className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Assignment
          </h2>
          {c.assignedTo ? (
            <p className="text-[13px] text-[var(--text-primary)]">
              Assigned to: <span className="font-semibold">{c.assignedTo}</span>
            </p>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)] italic">Unassigned</p>
          )}
          <Button size="sm" variant="secondary">
            {c.assignedTo ? 'Reassign' : 'Assign to me'}
          </Button>
        </section>

        {/* Status update */}
        <section className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Update status
          </h2>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                  c.status === s
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary-border)]'
                }`}
                aria-pressed={c.status === s}
              >
                {s === 'new' ? 'New'
                  : s === 'reviewing' ? 'Reviewing'
                  : s === 'contacted' ? 'Contacted'
                  : s === 'scheduled' ? 'Scheduled'
                  : 'Resolved'}
              </button>
            ))}
          </div>
        </section>

        {/* Counselor notes */}
        <section className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Counselor notes
          </h2>
          {c.notes && (
            <p className="text-[13px] text-[var(--text-secondary)] bg-[var(--surface-subtle)] rounded-lg px-3 py-2.5 leading-relaxed">
              {c.notes}
            </p>
          )}
          <textarea
            rows={3}
            placeholder="Add a case note..."
            className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--primary-border)] focus:bg-white transition-colors"
            aria-label="Add case note"
          />
          <Button size="sm">Save note</Button>
        </section>
      </div>
    </AppLayout>
  );
}
