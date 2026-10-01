'use client';

import { cn } from '@/lib/utils';
import type { CaseStatus, CasePriority, SupportLevel } from '@/types';
import {
  caseStatusClass,
  caseStatusLabel,
  casePriorityClass,
  casePriorityLabel,
  supportLevelClass,
  supportLevelLabel,
} from '@/lib/utils';

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export function CaseStatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
        caseStatusClass(status),
        className
      )}
    >
      {caseStatusLabel(status)}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: CasePriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
        casePriorityClass(priority),
        className
      )}
    >
      {casePriorityLabel(priority)}
    </span>
  );
}

interface SupportLevelBadgeProps {
  level: SupportLevel;
  className?: string;
}

export function SupportLevelBadge({ level, className }: SupportLevelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
        supportLevelClass(level),
        className
      )}
    >
      {supportLevelLabel(level)}
    </span>
  );
}
