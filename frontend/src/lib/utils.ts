import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MoodLevel, StressLevel, SupportLevel, CheckInTag, CaseStatus, CasePriority } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Label helpers ────────────────────────────────────────────────────────────

export function moodLabel(mood: MoodLevel): string {
  const map: Record<MoodLevel, string> = {
    very_good: 'Very good',
    good: 'Good',
    okay: 'Okay',
    difficult: 'Difficult',
    very_difficult: 'Very difficult',
  };
  return map[mood];
}

export function moodScore(mood: MoodLevel): number {
  const map: Record<MoodLevel, number> = {
    very_good: 5,
    good: 4,
    okay: 3,
    difficult: 2,
    very_difficult: 1,
  };
  return map[mood];
}

export function moodEmoji(mood: MoodLevel): string {
  const map: Record<MoodLevel, string> = {
    very_good: '😊',
    good: '🙂',
    okay: '😐',
    difficult: '😔',
    very_difficult: '😞',
  };
  return map[mood];
}

export function stressLabel(stress: StressLevel): string {
  const map: Record<StressLevel, string> = {
    low: 'Low',
    moderate: 'Moderate',
    elevated: 'Elevated',
    high: 'High',
  };
  return map[stress];
}

export function supportLevelLabel(level: SupportLevel): string {
  const map: Record<SupportLevel, string> = {
    self_guided: 'Self-guided',
    additional: 'Additional support recommended',
    counselor: 'Counselor support recommended',
    urgent: 'Urgent human support',
  };
  return map[level];
}

export function tagLabel(tag: CheckInTag): string {
  const map: Record<CheckInTag, string> = {
    academic_pressure: 'Academic pressure',
    sleep: 'Sleep',
    relationships: 'Relationships',
    financial_stress: 'Financial stress',
    family: 'Family',
    loneliness: 'Loneliness',
    exams: 'Exams',
    workload: 'Workload',
    something_else: 'Something else',
  };
  return map[tag];
}

export function caseStatusLabel(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    new: 'New',
    reviewing: 'Reviewing',
    contacted: 'Contacted',
    scheduled: 'Scheduled',
    resolved: 'Resolved',
  };
  return map[status];
}

export function casePriorityLabel(priority: CasePriority): string {
  const map: Record<CasePriority, string> = {
    standard: 'Standard',
    elevated: 'Elevated',
    urgent: 'Urgent',
  };
  return map[priority];
}

// ─── Color helpers ────────────────────────────────────────────────────────────

export function moodColor(mood: MoodLevel): string {
  const map: Record<MoodLevel, string> = {
    very_good: '#0D9488',
    good: '#4D7C5E',
    okay: '#B45309',
    difficult: '#C2410C',
    very_difficult: '#B91C1C',
  };
  return map[mood];
}

export function moodBgClass(mood: MoodLevel): string {
  const map: Record<MoodLevel, string> = {
    very_good: 'bg-teal-50 text-teal-700 border-teal-200',
    good: 'bg-green-50 text-green-700 border-green-200',
    okay: 'bg-amber-50 text-amber-700 border-amber-200',
    difficult: 'bg-orange-50 text-orange-700 border-orange-200',
    very_difficult: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[mood];
}

export function stressColor(stress: StressLevel): string {
  const map: Record<StressLevel, string> = {
    low: '#4D7C5E',
    moderate: '#B45309',
    elevated: '#C2410C',
    high: '#B91C1C',
  };
  return map[stress];
}

export function stressBgClass(stress: StressLevel): string {
  const map: Record<StressLevel, string> = {
    low: 'bg-green-50 text-green-700 border-green-200',
    moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    elevated: 'bg-orange-50 text-orange-700 border-orange-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[stress];
}

export function supportLevelClass(level: SupportLevel): string {
  const map: Record<SupportLevel, string> = {
    self_guided: 'support-level-self',
    additional: 'support-level-additional',
    counselor: 'support-level-counselor',
    urgent: 'support-level-urgent',
  };
  return map[level];
}

export function caseStatusClass(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    new: 'status-new',
    reviewing: 'status-reviewing',
    contacted: 'status-contacted',
    scheduled: 'status-scheduled',
    resolved: 'status-resolved',
  };
  return map[status];
}

export function casePriorityClass(priority: CasePriority): string {
  const map: Record<CasePriority, string> = {
    standard: 'bg-zinc-100 text-zinc-600',
    elevated: 'bg-amber-50 text-amber-700',
    urgent: 'bg-red-50 text-red-700',
  };
  return map[priority];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = d.toDateString();
  if (dateStr === today.toDateString()) return 'Today';
  if (dateStr === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Trend helpers ────────────────────────────────────────────────────────────

export function trendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  return { improving: '↗', stable: '→', declining: '↘' }[trend];
}

export function trendLabel(trend: 'improving' | 'stable' | 'declining'): string {
  return { improving: 'Improving', stable: 'Stable', declining: 'Declining' }[trend];
}

export function trendColor(trend: 'improving' | 'stable' | 'declining'): string {
  return { improving: '#4D7C5E', stable: '#52525B', declining: '#C2410C' }[trend];
}
