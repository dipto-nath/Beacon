import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { Phone, MessageSquare, MapPin, ExternalLink } from 'lucide-react';

export const metadata: Metadata = { title: 'Help now' };

const immediateOptions = [
  {
    label: 'Campus Emergency Services',
    description: 'University security and emergency line. Available 24/7.',
    contact: '+44 (0)1234 56789',
    type: 'phone' as const,
    urgent: true,
  },
  {
    label: 'Ashford University Counseling Service',
    description: 'Out-of-hours support line for students in distress.',
    contact: '+44 (0)1234 56780',
    type: 'phone' as const,
    urgent: false,
  },
  {
    label: 'Samaritans',
    description: 'Free, 24-hour emotional support for people in distress.',
    contact: '116 123',
    type: 'phone' as const,
    urgent: false,
  },
  {
    label: 'Shout Crisis Text Line',
    description: 'Text a trained volunteer in the UK. Free, 24/7.',
    contact: 'Text HELLO to 85258',
    type: 'text' as const,
    urgent: false,
  },
  {
    label: 'Student Union Welfare Team',
    description: "Peer-to-peer welfare support from trained student volunteers.",
    contact: 'welfare@ashfordunion.ac.uk',
    type: 'email' as const,
    urgent: false,
  },
];

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
            Need support right now?
          </h1>
          <p className="text-[14px] text-[var(--text-muted)] mt-1">
            Immediate support options are available at any time.
          </p>
        </header>

        {/* Gentle framing */}
        <div className="bg-[var(--primary-light)] border border-[var(--primary-border)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            It takes courage to ask for help. The contacts below are real people who are there for you.
            If you are in immediate danger, please call emergency services (999 in the UK).
          </p>
        </div>

        {/* Support options */}
        <div className="space-y-2" role="list" aria-label="Support options">
          {immediateOptions.map((opt) => (
            <div
              key={opt.label}
              role="listitem"
              className={`bg-white border rounded-xl p-4 ${
                opt.urgent
                  ? 'border-[var(--danger-border)] ring-1 ring-[var(--danger-border)]'
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {opt.urgent && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--danger-light)] text-[var(--danger)] border border-[var(--danger-border)]">
                        24/7
                      </span>
                    )}
                    <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">{opt.label}</h2>
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)] mb-2">{opt.description}</p>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
                    {opt.type === 'phone' && <Phone size={13} aria-hidden="true" />}
                    {opt.type === 'text' && <MessageSquare size={13} aria-hidden="true" />}
                    {opt.type === 'email' && <ExternalLink size={13} aria-hidden="true" />}
                    {opt.contact}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Self-care reminder */}
        <div className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            If you are not in immediate crisis but are struggling, consider booking a counseling session
            through the{' '}
            <a href="/counseling" className="text-[var(--primary)] underline hover:no-underline">
              Counseling page
            </a>
            . You can also explore self-help{' '}
            <a href="/resources" className="text-[var(--primary)] underline hover:no-underline">
              resources
            </a>{' '}
            at any time.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
