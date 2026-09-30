'use client';

import { useState } from 'react';
import { cn, tagLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { MoodLevel, CheckInTag } from '@/types';

const moodOptions: { value: MoodLevel; label: string; symbol: string }[] = [
  { value: 'very_difficult', label: 'Very difficult', symbol: '◾' },
  { value: 'difficult', label: 'Difficult', symbol: '◽' },
  { value: 'okay', label: 'Okay', symbol: '○' },
  { value: 'good', label: 'Good', symbol: '●' },
  { value: 'very_good', label: 'Very good', symbol: '◉' },
];

const moodColors: Record<MoodLevel, { border: string; bg: string; text: string; dot: string }> = {
  very_difficult: { border: '#FCA5A5', bg: '#FEF2F2', text: '#B91C1C', dot: '#B91C1C' },
  difficult: { border: '#FDBA74', bg: '#FFF7ED', text: '#C2410C', dot: '#C2410C' },
  okay: { border: '#FDE68A', bg: '#FFFBEB', text: '#B45309', dot: '#B45309' },
  good: { border: '#A7F3D0', bg: '#F0FDF4', text: '#047857', dot: '#047857' },
  very_good: { border: '#99F6E4', bg: '#F0FDFA', text: '#0D9488', dot: '#0D9488' },
};

const tags: CheckInTag[] = [
  'academic_pressure',
  'sleep',
  'relationships',
  'financial_stress',
  'family',
  'loneliness',
  'exams',
  'workload',
  'something_else',
];

interface CheckInFlowProps {
  onComplete?: (mood: MoodLevel, selectedTags: CheckInTag[], note: string) => void;
}

export function CheckInFlow({ onComplete }: CheckInFlowProps) {
  const [step, setStep] = useState<'mood' | 'detail' | 'done'>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<CheckInTag[]>([]);
  const [note, setNote] = useState('');

  function toggleTag(tag: CheckInTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleContinue() {
    if (step === 'mood' && selectedMood) {
      setStep('detail');
    } else if (step === 'detail') {
      setStep('done');
      onComplete?.(selectedMood!, selectedTags, note);
    }
  }

  if (step === 'done') {
    return (
      <section
        className="bg-white border border-[var(--border)] rounded-xl p-6 text-center"
        aria-live="polite"
      >
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: '#F0FDFA', border: '2px solid #99F6E4' }}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Check-in complete</h2>
        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
          Thank you for checking in. Your responses are private and help you understand your patterns over time.
        </p>
      </section>
    );
  }

  return (
    <section
      className="bg-white border border-[var(--border)] rounded-xl p-5 sm:p-6"
      aria-label="Daily check-in"
    >
      {step === 'mood' && (
        <>
          <div className="mb-5">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">How are you feeling today?</h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">
              Select the option that best describes how you feel right now.
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-2"
            role="radiogroup"
            aria-label="Mood selection"
          >
            {moodOptions.map((opt) => {
              const isSelected = selectedMood === opt.value;
              const colors = moodColors[opt.value];
              return (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedMood(opt.value)}
                  className={cn(
                    'mood-option',
                    isSelected && 'selected'
                  )}
                  style={
                    isSelected
                      ? { borderColor: colors.border, background: colors.bg }
                      : {}
                  }
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                    style={isSelected ? { color: colors.dot } : { color: '#A1A1AA' }}
                    aria-hidden="true"
                  >
                    {opt.symbol}
                  </span>
                  <span
                    className="text-[12px] font-medium leading-tight"
                    style={isSelected ? { color: colors.text } : { color: 'var(--text-secondary)' }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-[11px] text-[var(--text-muted)]">
              Your responses are confidential.
            </p>
            <Button
              onClick={handleContinue}
              disabled={!selectedMood}
              size="md"
            >
              Continue
            </Button>
          </div>
        </>
      )}

      {step === 'detail' && selectedMood && (
        <>
          <div className="mb-5">
            <button
              onClick={() => setStep('mood')}
              className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-3 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Would you like to share a little more?
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">
              Optional. Select any areas that feel relevant right now.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Contributing factors">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
                className={cn(
                  'text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all duration-100',
                  selectedTags.includes(tag)
                    ? 'bg-[var(--primary-light)] border-[var(--primary-border)] text-[var(--primary)]'
                    : 'bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary-border)]'
                )}
              >
                {tagLabel(tag)}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <label htmlFor="check-in-note" className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              Anything else you want to note? <span className="text-[var(--text-muted)] font-normal">(optional)</span>
            </label>
            <textarea
              id="check-in-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="This is just for you."
              rows={3}
              className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--primary-border)] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[var(--text-muted)]">
              These notes are private to you.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="md" onClick={handleContinue}>
                Skip
              </Button>
              <Button size="md" onClick={handleContinue}>
                Complete check-in
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
