import type {
  Student,
  CheckIn,
  MoodDataPoint,
  WellbeingSnapshot,
  Recommendation,
  Resource,
  CounselorProfile,
  Appointment,
  SupportCase,
  CampusAnalytics,
  PrivacyPermission,
} from '@/types';

// ─── Current student ──────────────────────────────────────────────────────────

export const currentStudent: Student = {
  id: 'stu-001',
  firstName: 'Dipto',
  lastName: 'Nath',
  email: 'd.nath@ashford.ac.uk',
  studentId: 'AU2023047',
  program: 'MSc Computer Science',
  year: 2,
  joinedAt: '2024-09-15',
};

// ─── Check-in history ─────────────────────────────────────────────────────────

export const checkInHistory: CheckIn[] = [
  {
    id: 'ci-010',
    date: '2026-09-30',
    completedAt: '2026-09-30T08:42:00Z',
    mood: 'okay',
    stress: 'moderate',
    energy: 'moderate',
    sleep: 'needs_attention',
    tags: ['academic_pressure', 'sleep'],
    supportLevel: 'additional',
    escalated: false,
  },
  {
    id: 'ci-009',
    date: '2026-09-29',
    completedAt: '2026-09-29T09:15:00Z',
    mood: 'good',
    stress: 'low',
    energy: 'stable',
    sleep: 'adequate',
    tags: ['workload'],
    supportLevel: 'self_guided',
    escalated: false,
  },
  {
    id: 'ci-008',
    date: '2026-09-28',
    completedAt: '2026-09-28T10:00:00Z',
    mood: 'difficult',
    stress: 'elevated',
    energy: 'low',
    sleep: 'poor',
    tags: ['exams', 'loneliness', 'sleep'],
    note: 'Feeling overwhelmed with revision. Struggled to sleep last night.',
    supportLevel: 'counselor',
    escalated: false,
  },
  {
    id: 'ci-007',
    date: '2026-09-27',
    completedAt: '2026-09-27T08:30:00Z',
    mood: 'okay',
    stress: 'moderate',
    energy: 'moderate',
    sleep: 'adequate',
    tags: ['academic_pressure'],
    supportLevel: 'self_guided',
    escalated: false,
  },
  {
    id: 'ci-006',
    date: '2026-09-26',
    completedAt: '2026-09-26T09:00:00Z',
    mood: 'good',
    stress: 'low',
    energy: 'stable',
    sleep: 'good',
    tags: [],
    supportLevel: 'self_guided',
    escalated: false,
  },
  {
    id: 'ci-005',
    date: '2026-09-25',
    completedAt: '2026-09-25T08:55:00Z',
    mood: 'very_good',
    stress: 'low',
    energy: 'high',
    sleep: 'good',
    tags: [],
    supportLevel: 'self_guided',
    escalated: false,
  },
  {
    id: 'ci-004',
    date: '2026-09-24',
    completedAt: '2026-09-24T09:10:00Z',
    mood: 'okay',
    stress: 'moderate',
    energy: 'moderate',
    sleep: 'needs_attention',
    tags: ['workload', 'relationships'],
    supportLevel: 'additional',
    escalated: false,
  },
];

// ─── Wellbeing snapshot ───────────────────────────────────────────────────────

export const wellbeingSnapshot: WellbeingSnapshot = {
  moodTrend: 'stable',
  currentMood: 'okay',
  stress: 'moderate',
  sleep: 'needs_attention',
  energy: 'moderate',
  supportLevel: 'additional',
  lastCheckIn: '2026-09-30T08:42:00Z',
  streakDays: 7,
};

// ─── Mood chart data ──────────────────────────────────────────────────────────

export const moodData7Days: MoodDataPoint[] = [
  { date: '2026-09-24', moodScore: 3, stressScore: 2, label: 'Wed' },
  { date: '2026-09-25', moodScore: 5, stressScore: 1, label: 'Thu' },
  { date: '2026-09-26', moodScore: 4, stressScore: 1, label: 'Fri' },
  { date: '2026-09-27', moodScore: 3, stressScore: 2, label: 'Sat' },
  { date: '2026-09-28', moodScore: 2, stressScore: 3, label: 'Sun' },
  { date: '2026-09-29', moodScore: 4, stressScore: 1, label: 'Mon' },
  { date: '2026-09-30', moodScore: 3, stressScore: 2, label: 'Today' },
];

export const moodData30Days: MoodDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-09-01');
  date.setDate(date.getDate() + i);
  const dayLabel = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  // Simulate realistic variation with exam stress peak around day 22-25
  const base = 3.2;
  const variation = Math.sin(i * 0.4) * 0.8 + (i > 20 && i < 26 ? -0.8 : 0);
  const stressBase = 2.1;
  const stressVariation = Math.cos(i * 0.4) * 0.5 + (i > 20 && i < 26 ? 1.2 : 0);
  return {
    date: date.toISOString().split('T')[0],
    moodScore: Math.max(1, Math.min(5, +(base + variation + (Math.random() * 0.4 - 0.2)).toFixed(1))),
    stressScore: Math.max(1, Math.min(4, +(stressBase + stressVariation + (Math.random() * 0.3 - 0.15)).toFixed(1))),
    label: dayLabel,
  };
});

// ─── Recommendations ──────────────────────────────────────────────────────────

export const recommendations: Recommendation[] = [
  {
    id: 'rec-001',
    title: '5-minute grounding reset',
    description: 'A brief breathing and body-scan technique to interrupt stress cycles during the study day.',
    type: 'exercise',
    duration: '5 min',
    reason: 'Suggested because you reported elevated stress during your last two check-ins.',
    tags: ['academic_pressure', 'exams'],
    actionLabel: 'Start now',
    actionHref: '/resources/grounding-reset',
  },
  {
    id: 'rec-002',
    title: 'Structured study break technique',
    description: 'Evidence-based approach to planning restorative breaks that actually help with exam revision.',
    type: 'technique',
    duration: '10 min read',
    reason: 'Based on your reported academic pressure and workload this week.',
    tags: ['academic_pressure', 'workload', 'exams'],
    actionLabel: 'Read guide',
    actionHref: '/resources/study-breaks',
  },
  {
    id: 'rec-003',
    title: 'Sleep hygiene — tonight',
    description: 'Simple, evidence-backed steps you can take this evening to improve sleep quality.',
    type: 'resource',
    duration: '5 min read',
    reason: 'Your sleep has been reported as needing attention for the past 3 days.',
    tags: ['sleep'],
    actionLabel: 'Read guide',
    actionHref: '/resources/sleep-hygiene',
  },
  {
    id: 'rec-004',
    title: 'Talk to someone',
    description: 'A trained counselor can help you work through exam pressure and stress in a confidential session.',
    type: 'professional',
    reason: 'Your recent check-ins suggest this might be a useful time to connect with support.',
    tags: ['academic_pressure', 'exams'],
    actionLabel: 'Request appointment',
    actionHref: '/counseling',
  },
  {
    id: 'rec-005',
    title: 'Campus community events',
    description: "Brief social connection can reduce the sense of isolation during intense study periods. Here's what's on this week.",
    type: 'social',
    reason: 'You mentioned loneliness in a recent check-in.',
    tags: ['loneliness'],
    actionLabel: 'See events',
    actionHref: '/resources/campus-life',
  },
];

// ─── Resources ────────────────────────────────────────────────────────────────

export const resources: Resource[] = [
  {
    id: 'res-001',
    title: 'Managing exam pressure',
    category: 'academic',
    readTime: '5 min',
    description: 'Practical strategies for recognizing and reducing overload during assessment periods.',
    what_it_covers: ['Recognising overload early', 'Breaking tasks into manageable steps', 'Managing recovery time'],
    type: 'article',
  },
  {
    id: 'res-002',
    title: 'When stress becomes too much',
    category: 'stress',
    readTime: '7 min',
    description: 'Understanding the difference between productive pressure and harmful stress — and what to do about it.',
    what_it_covers: ['Signs that stress is affecting your health', 'Short-term coping strategies', 'When to seek support'],
    type: 'article',
  },
  {
    id: 'res-003',
    title: 'Better sleep — a practical guide',
    category: 'sleep',
    readTime: '6 min',
    description: 'Evidence-based sleep hygiene principles adapted for university students.',
    what_it_covers: ['Consistent sleep schedules', 'Reducing screen time before bed', 'Managing pre-exam anxiety at night'],
    type: 'guide',
  },
  {
    id: 'res-004',
    title: 'Guided breathing exercise',
    category: 'stress',
    listenTime: '5 min',
    description: 'A simple 5-minute breathing exercise to reduce acute stress and restore focus.',
    what_it_covers: ['Box breathing technique', 'Progressive muscle relaxation', 'Re-centering after difficulty'],
    type: 'audio',
  },
  {
    id: 'res-005',
    title: 'Feeling lonely at university',
    category: 'loneliness',
    readTime: '8 min',
    description: 'Loneliness is common among students, especially during intensive study periods. This guide explores practical steps.',
    what_it_covers: ['Why loneliness is common and temporary', 'Small steps to re-engage socially', 'Campus support resources'],
    type: 'article',
  },
  {
    id: 'res-006',
    title: 'Understanding anxiety',
    category: 'anxiety',
    readTime: '6 min',
    description: 'A clear, non-clinical explanation of anxiety and what you can do about it.',
    what_it_covers: ['How anxiety shows up in students', 'Self-help strategies', 'When professional support helps'],
    type: 'article',
  },
  {
    id: 'res-007',
    title: 'Recovering from burnout',
    category: 'burnout',
    readTime: '9 min',
    description: "Burnout isn't just tiredness. Learn to recognize it and build a recovery plan.",
    what_it_covers: ['Burnout vs. tiredness', 'Protective habits', 'Asking for help at university'],
    type: 'guide',
  },
  {
    id: 'res-008',
    title: 'Focus and deep work for students',
    category: 'focus',
    readTime: '5 min',
    description: 'Techniques for maintaining concentration during study sessions.',
    what_it_covers: ['Time-blocking for study', 'Managing distractions', 'Restorative rest between sessions'],
    type: 'article',
  },
  {
    id: 'res-009',
    title: 'Ashford University Counseling Centre',
    category: 'campus',
    description: 'Confidential counseling sessions available in-person and online. Free to all registered students.',
    what_it_covers: ['Individual counseling', 'Group support sessions', 'Crisis support'],
    type: 'campus',
    href: '/counseling',
  },
];

// ─── Counselors ───────────────────────────────────────────────────────────────

export const counselors: CounselorProfile[] = [
  {
    id: 'coun-001',
    name: 'Dr. Sarah Okafor',
    title: 'Senior University Counselor',
    specializations: ['Academic stress', 'Anxiety', 'Transition support'],
    availability: 'available',
    nextSlot: 'Thursday, 2 Oct — 10:00',
    mode: ['online', 'in_person'],
  },
  {
    id: 'coun-002',
    name: 'James Whitfield',
    title: 'Student Wellbeing Advisor',
    specializations: ['Loneliness', 'Relationships', 'Study skills'],
    availability: 'limited',
    nextSlot: 'Friday, 3 Oct — 14:00',
    mode: ['online'],
  },
  {
    id: 'coun-003',
    name: 'Dr. Priya Menon',
    title: 'Clinical Psychologist',
    specializations: ['Depression', 'Anxiety', 'Complex stress'],
    availability: 'unavailable',
    mode: ['in_person'],
  },
];

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointments: Appointment[] = [
  {
    id: 'apt-001',
    counselorId: 'coun-001',
    counselorName: 'Dr. Sarah Okafor',
    date: '2026-10-03',
    time: '10:00',
    duration: 50,
    mode: 'online',
    status: 'upcoming',
    meetingLink: 'https://meet.ashford.ac.uk/session/apt-001',
  },
];

// ─── Support cases (staff view) ───────────────────────────────────────────────

export const supportCases: SupportCase[] = [
  {
    caseRef: 'BEC-20260930-014',
    receivedAt: '2026-09-30T07:30:00Z',
    priority: 'elevated',
    reason: 'Reported elevated stress and poor sleep for 5 consecutive days; counselor support level triggered.',
    status: 'new',
    lastUpdated: '2026-09-30T07:30:00Z',
  },
  {
    caseRef: 'BEC-20260929-012',
    receivedAt: '2026-09-29T10:15:00Z',
    priority: 'standard',
    reason: 'Student self-requested counseling through the platform.',
    status: 'scheduled',
    assignedTo: 'Dr. Sarah Okafor',
    lastUpdated: '2026-09-29T14:00:00Z',
  },
  {
    caseRef: 'BEC-20260928-009',
    receivedAt: '2026-09-28T08:00:00Z',
    priority: 'urgent',
    reason: 'Check-in responses indicated significant distress. Escalation triggered for human review.',
    status: 'contacted',
    assignedTo: 'James Whitfield',
    lastUpdated: '2026-09-28T11:30:00Z',
    notes: 'Student contacted by phone. Appointment arranged for tomorrow.',
  },
  {
    caseRef: 'BEC-20260927-007',
    receivedAt: '2026-09-27T09:45:00Z',
    priority: 'standard',
    reason: 'Follow-up request after initial counseling session.',
    status: 'reviewing',
    assignedTo: 'Dr. Sarah Okafor',
    lastUpdated: '2026-09-27T12:00:00Z',
  },
  {
    caseRef: 'BEC-20260925-003',
    receivedAt: '2026-09-25T16:00:00Z',
    priority: 'standard',
    reason: 'Student requested financial stress support resources.',
    status: 'resolved',
    assignedTo: 'James Whitfield',
    lastUpdated: '2026-09-26T10:00:00Z',
  },
];

// ─── Campus analytics ─────────────────────────────────────────────────────────

export const campusAnalytics: CampusAnalytics = {
  period: 'September 2026',
  totalCheckIns: 1284,
  uniqueStudents: 347,
  averageStress: 'moderate',
  counselingRequests: 48,
  resourceEngagement: 892,
  escalations: 14,
  stressDistribution: {
    low: 31,
    moderate: 38,
    elevated: 22,
    high: 9,
  },
  topFactors: [
    { factor: 'academic_pressure', count: 312 },
    { factor: 'sleep', count: 198 },
    { factor: 'workload', count: 187 },
    { factor: 'exams', count: 164 },
    { factor: 'loneliness', count: 109 },
    { factor: 'financial_stress', count: 87 },
  ],
  trendsData: [
    { date: '2026-09-01', check_ins: 45, avg_mood: 3.8, stress_avg: 1.8, counseling_requests: 2 },
    { date: '2026-09-02', check_ins: 52, avg_mood: 3.7, stress_avg: 1.9, counseling_requests: 1 },
    { date: '2026-09-03', check_ins: 48, avg_mood: 3.6, stress_avg: 2.0, counseling_requests: 2 },
    { date: '2026-09-04', check_ins: 61, avg_mood: 3.5, stress_avg: 2.1, counseling_requests: 3 },
    { date: '2026-09-05', check_ins: 58, avg_mood: 3.4, stress_avg: 2.2, counseling_requests: 2 },
    { date: '2026-09-08', check_ins: 67, avg_mood: 3.3, stress_avg: 2.3, counseling_requests: 3 },
    { date: '2026-09-09', check_ins: 71, avg_mood: 3.2, stress_avg: 2.4, counseling_requests: 4 },
    { date: '2026-09-10', check_ins: 69, avg_mood: 3.1, stress_avg: 2.5, counseling_requests: 3 },
    { date: '2026-09-11', check_ins: 73, avg_mood: 3.0, stress_avg: 2.6, counseling_requests: 4 },
    { date: '2026-09-12', check_ins: 76, avg_mood: 2.9, stress_avg: 2.7, counseling_requests: 5 },
    { date: '2026-09-15', check_ins: 82, avg_mood: 2.8, stress_avg: 2.8, counseling_requests: 5 },
    { date: '2026-09-16', check_ins: 88, avg_mood: 2.7, stress_avg: 2.9, counseling_requests: 6 },
    { date: '2026-09-17', check_ins: 85, avg_mood: 2.7, stress_avg: 3.0, counseling_requests: 5 },
    { date: '2026-09-18', check_ins: 91, avg_mood: 2.6, stress_avg: 3.1, counseling_requests: 6 },
    { date: '2026-09-19', check_ins: 94, avg_mood: 2.6, stress_avg: 3.1, counseling_requests: 7 },
    { date: '2026-09-22', check_ins: 43, avg_mood: 3.4, stress_avg: 2.2, counseling_requests: 2 },
    { date: '2026-09-23', check_ins: 49, avg_mood: 3.5, stress_avg: 2.1, counseling_requests: 3 },
    { date: '2026-09-24', check_ins: 54, avg_mood: 3.4, stress_avg: 2.2, counseling_requests: 2 },
    { date: '2026-09-25', check_ins: 57, avg_mood: 3.5, stress_avg: 2.1, counseling_requests: 2 },
    { date: '2026-09-26', check_ins: 53, avg_mood: 3.6, stress_avg: 2.0, counseling_requests: 1 },
    { date: '2026-09-29', check_ins: 61, avg_mood: 3.5, stress_avg: 2.1, counseling_requests: 3 },
    { date: '2026-09-30', check_ins: 34, avg_mood: 3.4, stress_avg: 2.2, counseling_requests: 2 },
  ],
};

// ─── Privacy permissions matrix ───────────────────────────────────────────────

export const privacyPermissions: PrivacyPermission[] = [
  { dataType: 'Mood history', student: 'Full access', counselor: 'Only when shared', analytics: 'Anonymised aggregate' },
  { dataType: 'Check-in responses', student: 'Full access', counselor: 'When escalated or shared', analytics: 'Aggregated trends' },
  { dataType: 'Counseling requests', student: 'Full access', counselor: 'Full access', analytics: 'Aggregated count' },
  { dataType: 'Personal identity', student: 'Full access', counselor: 'Authorized staff only', analytics: 'Not included' },
  { dataType: 'Session notes', student: 'Available on request', counselor: 'Full access', analytics: 'Not included' },
  { dataType: 'Optional demographics', student: 'Full access', counselor: 'Not shared', analytics: 'Anonymised aggregate' },
];
