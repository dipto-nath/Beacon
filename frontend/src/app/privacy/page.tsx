import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { privacyPermissions } from '@/data/mock';
import { ShieldCheck, Download, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Privacy</h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            How your information is collected, used, and protected.
          </p>
        </header>

        {/* Privacy statement */}
        <div className="flex items-start gap-3 bg-[var(--sage-light)] border border-[#C6DFCC] rounded-xl p-4">
          <ShieldCheck size={18} className="text-[var(--sage)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-[14px] font-semibold text-[var(--sage)] mb-1">
              Your wellbeing data is private by default.
            </p>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Check-in responses and mood history are not automatically shared with university staff.
              Staff only access campus-level aggregated data unless you share information directly or
              an escalation is triggered for your safety.
            </p>
          </div>
        </div>

        {/* What is collected */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-5 space-y-3"
          aria-label="What is collected"
        >
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">What is collected</h2>
          <ul className="space-y-2">
            {[
              'Check-in responses (mood, stress, sleep, energy, tags)',
              'Mood history over time',
              'Optional notes you add to check-ins',
              'Counseling requests and appointment information',
              'Optional demographic information you provide',
              'Session activity for security purposes',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--border)] shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Permission matrix */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl overflow-hidden"
          aria-label="Data access permissions"
        >
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Who can see it</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              How different types of information are accessible to different parties.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]" role="table">
              <thead>
                <tr className="bg-[var(--surface-subtle)]">
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-[var(--text-secondary)] w-1/4">
                    Information
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-[var(--text-secondary)]">
                    You
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-[var(--text-secondary)]">
                    Counselor
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold text-[var(--text-secondary)]">
                    Analytics
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {privacyPermissions.map((row) => (
                  <tr key={row.dataType}>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{row.dataType}</td>
                    <td className="px-4 py-3 text-[var(--sage)]">{row.student}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{row.counselor}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{row.analytics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data controls */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-5 space-y-4"
          aria-label="Your data controls"
        >
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Your data controls</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors group">
              <Download size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)]" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Download my data</p>
                <p className="text-[11px] text-[var(--text-muted)]">Export all your check-in and mood data</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-subtle)] transition-colors group">
              <Settings size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)]" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Manage sharing preferences</p>
                <p className="text-[11px] text-[var(--text-muted)]">Control what information you share with counselors</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border border-red-200 hover:bg-[var(--danger-light)] transition-colors group">
              <Trash2 size={16} className="text-[var(--text-muted)] group-hover:text-[var(--danger)]" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--danger)]">
                  Delete eligible data
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Request deletion of your personal data where possible
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Policy link */}
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          This platform operates in accordance with the{' '}
          <a href="#" className="underline hover:text-[var(--text-secondary)]">
            Ashford University Privacy Policy
          </a>{' '}
          and applicable data protection legislation. For questions about your data, contact the University
          Data Protection Officer.
        </p>
      </div>
    </AppLayout>
  );
}
