'use client';

import { useState, useMemo } from 'react';
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
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DollarSign, Trophy, Target, Clock } from 'lucide-react';

// ---------------------------------------------------------------------------
// Data Fetching Stubs
// TODO: Replace these with real data fetching from your CRM data source.
// Each function returns mock data shaped for the corresponding chart.
// ---------------------------------------------------------------------------

/** TODO: Fetch pipeline stages with deal counts from your CRM */
function getPipelineFunnel() {
  return [
    { stage: 'Lead', count: 240 },
    { stage: 'Qualified', count: 165 },
    { stage: 'Proposal', count: 98 },
    { stage: 'Negotiation', count: 54 },
    { stage: 'Won', count: 33 },
  ];
}

/** TODO: Fetch monthly revenue over the past 12 months */
function getRevenueTrend() {
  return [
    { month: 'Mar', revenue: 32000, target: 40000 },
    { month: 'Apr', revenue: 38000, target: 40000 },
    { month: 'May', revenue: 41000, target: 42000 },
    { month: 'Jun', revenue: 45000, target: 42000 },
    { month: 'Jul', revenue: 39000, target: 44000 },
    { month: 'Aug', revenue: 52000, target: 44000 },
    { month: 'Sep', revenue: 48000, target: 46000 },
    { month: 'Oct', revenue: 56000, target: 46000 },
    { month: 'Nov', revenue: 61000, target: 48000 },
    { month: 'Dec', revenue: 54000, target: 48000 },
    { month: 'Jan', revenue: 67000, target: 50000 },
    { month: 'Feb', revenue: 72000, target: 50000 },
  ];
}

/** TODO: Fetch won vs lost deal counts per month */
function getWinLossData() {
  return [
    { month: 'Mar', won: 5, lost: 3 },
    { month: 'Apr', won: 7, lost: 4 },
    { month: 'May', won: 6, lost: 2 },
    { month: 'Jun', won: 8, lost: 5 },
    { month: 'Jul', won: 4, lost: 3 },
    { month: 'Aug', won: 9, lost: 4 },
    { month: 'Sep', won: 7, lost: 6 },
    { month: 'Oct', won: 10, lost: 3 },
    { month: 'Nov', won: 11, lost: 5 },
    { month: 'Dec', won: 8, lost: 4 },
    { month: 'Jan', won: 12, lost: 3 },
    { month: 'Feb', won: 13, lost: 2 },
  ];
}

/** TODO: Fetch activity type distribution (calls, emails, meetings, demos) */
function getActivityBreakdown() {
  return [
    { name: 'Calls', value: 342, color: '#6366f1' },
    { name: 'Emails', value: 587, color: '#8b5cf6' },
    { name: 'Meetings', value: 218, color: '#a78bfa' },
    { name: 'Demos', value: 124, color: '#c4b5fd' },
  ];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DateRange = 'month' | 'quarter' | 'year' | 'all';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  month: 'This Month',
  quarter: 'Quarter',
  year: 'Year',
  all: 'All Time',
};

function sliceByRange<T>(data: T[], range: DateRange): T[] {
  switch (range) {
    case 'month':
      return data.slice(-1);
    case 'quarter':
      return data.slice(-3);
    case 'year':
      return data.slice(-12);
    case 'all':
    default:
      return data;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm shadow-xl">
      {label && <p className="mb-1 font-medium text-zinc-300">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">{entry.name}:</span>
          <span className="font-medium text-zinc-100">
            {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  icon: Icon,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
        <Icon className="h-5 w-5 text-zinc-300" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="truncate text-xl font-semibold text-zinc-100">{value}</p>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart Card Wrapper
// ---------------------------------------------------------------------------

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
      <h3 className="mb-4 text-sm font-medium text-zinc-300">{title}</h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const [range, setRange] = useState<DateRange>('year');

  const funnel = useMemo(() => getPipelineFunnel(), []);
  const revenueTrend = useMemo(() => sliceByRange(getRevenueTrend(), range), [range]);
  const winLoss = useMemo(() => sliceByRange(getWinLossData(), range), [range]);
  const activities = useMemo(() => getActivityBreakdown(), []);

  // Compute KPIs from visible data
  const totalRevenue = revenueTrend.reduce((s, d) => s + d.revenue, 0);
  const dealsWon = winLoss.reduce((s, d) => s + d.won, 0);
  const dealsLost = winLoss.reduce((s, d) => s + d.lost, 0);
  const winRate = dealsWon + dealsLost > 0 ? Math.round((dealsWon / (dealsWon + dealsLost)) * 100) : 0;
  const avgCycleDays = 27; // TODO: compute from real data

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Sales Reports</h1>
          <p className="text-sm text-zinc-400">Pipeline performance and revenue analytics</p>
        </div>

        {/* Date range tabs */}
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {(Object.entries(DATE_RANGE_LABELS) as [DateRange, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                range === key
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Total Revenue" value={formatCurrency(totalRevenue)} subtitle={DATE_RANGE_LABELS[range]} />
        <KpiCard icon={Trophy} label="Deals Won" value={dealsWon.toString()} subtitle={`${dealsLost} lost`} />
        <KpiCard icon={Target} label="Win Rate" value={`${winRate}%`} subtitle={`${dealsWon + dealsLost} total deals`} />
        <KpiCard icon={Clock} label="Avg Deal Cycle" value={`${avgCycleDays}d`} subtitle="Days to close" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Funnel */}
        <ChartCard title="Pipeline Funnel">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnel} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid horizontal={false} stroke="#27272a" />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fill: '#a1a1aa', fontSize: 13 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
                {funnel.map((_, i) => (
                  <Cell key={i} fill={`hsl(250, ${60 + i * 5}%, ${55 - i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend} margin={{ left: 10, right: 10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltipContent formatter={formatCurrency} />} cursor={{ stroke: '#6366f1', strokeDasharray: '4 4' }} />
              <ReferenceLine
                y={revenueTrend.length > 0 ? revenueTrend[revenueTrend.length - 1].target : 0}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                label={{ value: 'Target', fill: '#f59e0b', fontSize: 11, position: 'right' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Win / Loss Analysis */}
        <ChartCard title="Win / Loss Analysis">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={winLoss} margin={{ left: 10, right: 10 }}>
              <CartesianGrid vertical={false} stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend
                formatter={(value: string) => <span className="text-sm text-zinc-400">{value}</span>}
                iconType="square"
                iconSize={10}
              />
              <Bar dataKey="won" name="Won" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="lost" name="Lost" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity Breakdown */}
        <ChartCard title="Activity Breakdown">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={260}>
              <PieChart>
                <Pie
                  data={activities}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {activities.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {activities.map((a) => (
                <div key={a.name} className="flex items-center gap-2.5">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: a.color }} />
                  <span className="text-sm text-zinc-400">{a.name}</span>
                  <span className="ml-auto text-sm font-medium text-zinc-200">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
