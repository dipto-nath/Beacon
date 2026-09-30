'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CampusAnalytics } from '@/types';
import { tagLabel } from '@/lib/utils';

interface TrendChartProps {
  data: CampusAnalytics['trendsData'];
  metric: 'checkIns' | 'avgMood' | 'stressAvg' | 'counselingRequests';
}

const metricConfig = {
  checkIns: { label: 'Check-ins', color: '#1E3A5F' },
  avgMood: { label: 'Average mood', color: '#0D9488' },
  stressAvg: { label: 'Stress level', color: '#B45309' },
  counselingRequests: { label: 'Counseling requests', color: '#4D7C5E' },
};

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 shadow-sm text-[12px]">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[var(--text-secondary)]">
          {p.name}: <span className="font-medium">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendAreaChart({ data, metric }: TrendChartProps) {
  const config = metricConfig[metric];
  const displayData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={displayData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.color} stopOpacity={0.1} />
            <stop offset="95%" stopColor={config.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={metric}
          name={config.label}
          stroke={config.color}
          strokeWidth={2}
          fill={`url(#grad-${metric})`}
          dot={false}
          activeDot={{ r: 4, fill: config.color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface StressDistributionChartProps {
  distribution: CampusAnalytics['stressDistribution'];
}

const STRESS_COLORS = ['#4D7C5E', '#B45309', '#C2410C', '#B91C1C'];
const STRESS_LABELS = ['Low', 'Moderate', 'Elevated', 'High'];

export function StressDistributionChart({ distribution }: StressDistributionChartProps) {
  const data = [
    { name: 'Low', value: distribution.low },
    { name: 'Moderate', value: distribution.moderate },
    { name: 'Elevated', value: distribution.elevated },
    { name: 'High', value: distribution.high },
  ];

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={32}
            outerRadius={54}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={STRESS_COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: STRESS_COLORS[i] }}
                aria-hidden="true"
              />
              <span className="text-[12px] text-[var(--text-secondary)]">{d.name}</span>
            </div>
            <span className="text-[12px] font-semibold text-[var(--text-primary)]">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TopFactorsChartProps {
  factors: CampusAnalytics['topFactors'];
}

export function TopFactorsChart({ factors }: TopFactorsChartProps) {
  const data = factors.map((f) => ({
    name: tagLabel(f.factor),
    count: f.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Reports" fill="#1E3A5F" radius={[0, 3, 3, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
}
