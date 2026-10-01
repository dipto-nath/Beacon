'use client';

import { useState } from 'react';
import { cn, tagLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { MoodLevel, CheckInTag } from '@/types';
import { ChevronLeft } from 'lucide-react';

const moodOptions: { value: MoodLevel; label: string; symbol: string; gradient: string }[] = [
  { value: 'very_difficult', label: 'Very difficult', symbol: '😩', gradient: 'linear-gradient(135deg, rgba(224,82,82,0.12) 0%, rgba(224,82,82,0.06) 100%)' },
  { value: 'difficult',      label: 'Difficult',      symbol: '😕', gradient: 'linear-gradient(135deg, rgba(212,130,10,0.12) 0%, rgba(212,130,10,0.06) 100%)' },
  { value: 'okay',           label: 'Okay',           symbol: '😐', gradient: 'linear-gradient(135deg, rgba(123,143,212,0.12) 0%, rgba(123,143,212,0.06) 100%)' },
  { value: 'good',           label: 'Good',           symbol: '🙂', gradient: 'linear-gradient(135deg, rgba(39,181,160,0.12) 0%, rgba(39,181,160,0.06) 100%)' },
  { value: 'very_good',      label: 'Very good',      symbol: '😄', gradient: 'linear-gradient(135deg, rgba(74,140,111,0.12) 0%, rgba(74,140,111,0.06) 100%)' },
];

const moodColors: Record<MoodLevel, { border: string; bg: string; text: string; shadow: string }> = {
  very_difficult: { border: 'rgba(224,82,82,0.4)',    bg: 'rgba(224,82,82,0.06)',    text: '#C04040', shadow: 'rgba(224,82,82,0.2)' },
  difficult:      { border: 'rgba(212,130,10,0.4)',   bg: 'rgba(212,130,10,0.06)',   text: '#B8710A', shadow: 'rgba(212,130,10,0.2)' },
  okay:           { border: 'rgba(123,143,212,0.5)',  bg: 'rgba(123,143,212,0.08)',  text: '#5B6FAA', shadow: 'rgba(123,143,212,0.2)' },
  good:           { border: 'rgba(39,181,160,0.4)',   bg: 'rgba(39,181,160,0.07)',   text: '#1E9E8C', shadow: 'rgba(39,181,160,0.2)' },
  very_good:      { border: 'rgba(74,140,111,0.4)',   bg: 'rgba(74,140,111,0.07)',   text: '#3A7A60', shadow: 'rgba(74,140,111,0.2)' },
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
        className="beacon-card text-center py-10"
        aria-live="polite"
        style={{
          background: 'linear-gradient(135deg, rgba(39,181,160,0.06) 0%, rgba(59,124,228,0.06) 100%)',
          borderColor: 'rgba(39,181,160,0.25)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #27B5A0 0%, #3B9FD4 100%)',
            boxShadow: '0 6px 24px rgba(39,181,160,0.4)',
          }}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
          Check-in complete
        </h2>
        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
          Thank you for checking in. Your responses are private and help you understand your patterns over time.
        </p>
      </section>
    );
  }

  return (
    <section
      className="beacon-card !p-0 overflow-hidden"
      aria-label="Daily check-in"
    >
      {/* Card header strip */}
      <div
        className="px-6 py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(59,124,228,0.05) 0%, rgba(123,143,212,0.05) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {step === 'detail' && (
          <button
            onClick={() => setStep('mood')}
            className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--primary)] mb-2 transition-colors"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Back
          </button>
        )}
        <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight">
          {step === 'mood'
            ? 'How are you feeling today?'
            : 'Would you like to share a little more?'}
        </h2>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          {step === 'mood'
            ? 'Select the option that best describes how you feel right now.'
            : 'Optional. Select any areas that feel relevant right now.'}
        </p>
      </div>

      <div className="px-6 py-5">
        {step === 'mood' && (
          <>
            <div
              className="flex flex-col sm:flex-row gap-2.5"
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
                    className={cn('mood-option group')}
                    style={
                      isSelected
                        ? {
                            borderColor: colors.border,
                            background: colors.bg,
                            boxShadow: `0 4px 16px ${colors.shadow}`,
                            transform: 'translateY(-2px)',
                          }
                        : {}
                    }
                  >
                    <span
                      className="text-2xl leading-none mb-0.5 transition-transform duration-200 group-hover:scale-110"
                      aria-hidden="true"
                    >
                      {opt.symbol}
                    </span>
                    <span
                      className="text-[11px] font-semibold leading-tight"
                      style={
                        isSelected
                          ? { color: colors.text }
                          : { color: 'var(--text-secondary)' }
                      }
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                🔒 Your responses are confidential.
              </p>
              <Button onClick={handleContinue} disabled={!selectedMood} size="md" pill>
                Continue →
              </Button>
            </div>
          </>
        )}

        {step === 'detail' && selectedMood && (
          <>
            <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Contributing factors">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selectedTags.includes(tag)}
                  className={cn(
                    'text-[12px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200',
                    selectedTags.includes(tag)
                      ? ''
                      : 'bg-white/60 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary-border)] hover:text-[var(--primary)] hover:bg-[var(--primary-lighter)]'
                  )}
                  style={
                    selectedTags.includes(tag)
                      ? {
                          background: 'var(--primary)',
                          borderColor: 'var(--primary)',
                          color: 'white',
                          boxShadow: '0 2px 10px var(--primary-glow)',
                        }
                      : {}
                  }
                >
                  {tagLabel(tag)}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label
                htmlFor="check-in-note"
                className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2"
              >
                Anything else you want to note?{' '}
                <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <textarea
                id="check-in-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="This is just for you…"
                rows={3}
                className="beacon-input resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[var(--text-muted)]">🔒 These notes are private to you.</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="md" onClick={handleContinue}>
                  Skip
                </Button>
                <Button size="md" pill onClick={handleContinue}>
                  Complete ✓
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
