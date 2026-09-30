import type { Metadata } from 'next';
import { AppLayout } from '@/components/shared/AppLayout';
import { currentStudent } from '@/data/mock';
import { Button } from '@/components/ui/Button';
import { User, Mail, GraduationCap, KeyRound, BellOff, LogOut } from 'lucide-react';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-xl space-y-6">
        <header>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Settings</h1>
        </header>

        {/* Profile */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-5 space-y-4"
          aria-label="Profile"
        >
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Profile</h2>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[16px] font-semibold"
              style={{ background: 'var(--primary)' }}
              aria-hidden="true"
            >
              {currentStudent.firstName[0]}{currentStudent.lastName[0]}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                {currentStudent.firstName} {currentStudent.lastName}
              </p>
              <p className="text-[12px] text-[var(--text-muted)]">{currentStudent.studentId}</p>
            </div>
          </div>

          <div className="space-y-2 text-[13px]">
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
              <Mail size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
              {currentStudent.email}
            </div>
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
              <GraduationCap size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
              {currentStudent.program} · Year {currentStudent.year}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl p-5 space-y-3"
          aria-label="Notifications"
        >
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Notifications</h2>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Daily check-in reminder</p>
              <p className="text-[11px] text-[var(--text-muted)]">Receive a gentle reminder to check in each day</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)]" />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Appointment reminders</p>
              <p className="text-[11px] text-[var(--text-muted)]">Get reminded before counseling sessions</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)]" />
          </label>
        </section>

        {/* Account */}
        <section
          className="bg-white border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] overflow-hidden"
          aria-label="Account"
        >
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)] px-5 pt-4 pb-3">Account</h2>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[var(--surface-subtle)] transition-colors">
            <KeyRound size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
            <span className="text-[13px] text-[var(--text-primary)]">Change password</span>
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[var(--danger-light)] transition-colors group">
            <LogOut size={15} className="text-[var(--text-muted)] group-hover:text-[var(--danger)]" aria-hidden="true" />
            <span className="text-[13px] text-[var(--text-primary)] group-hover:text-[var(--danger)]">Sign out</span>
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
