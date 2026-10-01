'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MoodDataPoint } from '@/types';

interface MoodChartProps {
  data: MoodDataPoint[];
  showStress?: boolean;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const moodVal = payload.find((p) => p.name === 'moodScore')?.value;
  const stressVal = payload.find((p) => p.name === 'stressScore')?.value;

  const moodLabels: Record<number, string> = { 1: 'Very difficult', 2: 'Difficult', 3: 'Okay', 4: 'Good', 5: 'Very good' };
  const stressLabels: Record<number, string> = { 1: 'Low', 2: 'Moderate', 3: 'Elevated', 4: 'High' };

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 shadow-sm text-[12px]">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {moodVal !== undefined && (
        <p className="text-[var(--text-secondary)]">
          Mood: <span className="font-medium">{moodLabels[Math.round(moodVal)] || moodVal}</span>
        </p>
      )}
      {stressVal !== undefined && (
        <p className="text-[var(--text-muted)]">
          Stress: <span className="font-medium">{stressLabels[Math.round(stressVal)] || stressVal}</span>
        </p>
      )}
    </div>
  );
}

export function MoodChart({ data, showStress = false }: MoodChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B7CE4" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#3B7CE4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4820A" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#D4820A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="moodScore"
          stroke="#3B7CE4"
          strokeWidth={2.5}
          fill="url(#moodGradient)"
          dot={{ r: 3.5, fill: '#3B7CE4', strokeWidth: 0 }}
          activeDot={{ r: 5.5, fill: '#3B7CE4', strokeWidth: 0 }}
        />
        {showStress && (
          <Area
            type="monotone"
            dataKey="stressScore"
            stroke="#D4820A"
            strokeWidth={1.5}
            fill="url(#stressGradient)"
            dot={{ r: 2.5, fill: '#D4820A', strokeWidth: 0 }}
            activeDot={{ r: 4.5, fill: '#D4820A', strokeWidth: 0 }}
            strokeDasharray="4 2"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
