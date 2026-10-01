// ─── Core entity types ────────────────────────────────────────────────────────

export type MoodLevel = 'very_good' | 'good' | 'okay' | 'difficult' | 'very_difficult';

export type StressLevel = 'low' | 'moderate' | 'elevated' | 'high';

export type SupportLevel = 'self_guided' | 'additional' | 'counselor' | 'urgent';

export type CheckInTag =
  | 'academic_pressure'
  | 'sleep'
  | 'relationships'
  | 'financial_stress'
  | 'family'
  | 'loneliness'
  | 'exams'
  | 'workload'
  | 'something_else';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  program: string;
  year: number;
  joinedAt: string;
}

export interface MoodEntry {
  id: string;
  date: string; // ISO date
  mood: MoodLevel;
  stress: StressLevel;
  energy: 'low' | 'moderate' | 'stable' | 'high';
  sleep: 'poor' | 'needs_attention' | 'adequate' | 'good';
  tags: CheckInTag[];
  note?: string;
}

export interface CheckIn extends MoodEntry {
  completedAt: string;
  supportLevel: SupportLevel;
  escalated: boolean;
}

export interface WellbeingSnapshot {
  moodTrend: 'improving' | 'stable' | 'declining';
  currentMood: MoodLevel;
  stress: StressLevel;
  sleep: MoodEntry['sleep'];
  energy: MoodEntry['energy'];
  supportLevel: SupportLevel;
  lastCheckIn: string; // ISO datetime
  streakDays: number;
}

export interface MoodDataPoint {
  date: string;
  moodScore: number; // 1-5 numeric
  stressScore: number; // 1-4 numeric
  label?: string; // e.g., "Mon"
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'technique' | 'resource' | 'social' | 'professional';
  duration?: string;
  reason: string;
  tags: CheckInTag[];
  actionLabel: string;
  actionHref?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  readTime?: string;
  listenTime?: string;
  description: string;
  what_it_covers: string[];
  type: 'article' | 'audio' | 'guide' | 'campus' | 'external';
  href?: string;
}

export type ResourceCategory =
  | 'stress'
  | 'academic'
  | 'sleep'
  | 'relationships'
  | 'loneliness'
  | 'anxiety'
  | 'focus'
  | 'burnout'
  | 'campus';

export interface CounselorProfile {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  availability: 'available' | 'limited' | 'unavailable';
  nextSlot?: string;
  mode: ('online' | 'in_person')[];
}

export interface CounselingRequest {
  id: string;
  studentId: string;
  requestedAt: string;
  preferredMode: 'online' | 'in_person' | 'either';
  preferredTimes: string[];
  reason?: string;
  status: 'pending' | 'reviewing' | 'scheduled' | 'completed' | 'cancelled';
  assignedCounselorId?: string;
  appointmentDate?: string;
}

export interface Appointment {
  id: string;
  counselorId: string;
  counselorName: string;
  date: string;
  time: string;
  duration: number; // minutes
  mode: 'online' | 'in_person';
  status: 'upcoming' | 'completed' | 'cancelled';
  location?: string;
  meetingLink?: string;
}

// ─── Staff-facing types ────────────────────────────────────────────────────────

export type CaseStatus = 'new' | 'reviewing' | 'contacted' | 'scheduled' | 'resolved';
export type CasePriority = 'standard' | 'elevated' | 'urgent';

export interface SupportCase {
  caseRef: string; // e.g. "BEC-20241001-047" — no student name
  receivedAt: string;
  priority: CasePriority;
  reason: string; // general reason, not specific PII
  status: CaseStatus;
  assignedTo?: string;
  lastUpdated: string;
  notes?: string; // counselor-only
}

export interface CampusAnalytics {
  period: string;
  totalCheckIns: number;
  uniqueStudents: number;
  averageStress: StressLevel;
  counselingRequests: number;
  resourceEngagement: number;
  escalations: number;
  stressDistribution: {
    low: number;
    moderate: number;
    elevated: number;
    high: number;
  };
  topFactors: { factor: CheckInTag; count: number }[];
  trendsData: {
    date: string;
    check_ins: number;
    avg_mood: number;
    stress_avg: number;
    counseling_requests: number;
  }[];
}

export interface PrivacyPermission {
  dataType: string;
  student: string;
  counselor: string;
  analytics: string;
}
