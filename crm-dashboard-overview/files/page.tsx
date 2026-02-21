'use client';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Phone,
  Mail,
  Calendar,
  Trophy,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Data fetching stubs
// TODO: Replace these with actual data fetching from your CRM data source.
//       Each function can be converted to fetch from an API route, database
//       query, or third-party CRM integration (HubSpot, Salesforce, etc.).
// ---------------------------------------------------------------------------

interface KPI {
  label: string;
  value: string;
  change: number; // percentage change, positive = up, negative = down
  icon: 'deals' | 'revenue' | 'winRate' | 'avgDeal';
}

/** TODO: Fetch real KPI metrics from your CRM data source */
function getKPIs(): KPI[] {
  return [
    { label: 'Total Deals', value: '284', change: 12.5, icon: 'deals' },
    { label: 'Revenue', value: '$1.24M', change: 8.2, icon: 'revenue' },
    { label: 'Win Rate', value: '68%', change: -2.1, icon: 'winRate' },
    { label: 'Avg Deal Size', value: '$4,370', change: 5.8, icon: 'avgDeal' },
  ];
}

interface PipelineStage {
  name: string;
  count: number;
  value: string;
  color: string;
  percent: number; // width percentage of the bar
}

/** TODO: Fetch real pipeline data from your CRM data source */
function getPipelineStages(): PipelineStage[] {
  return [
    { name: 'Lead', count: 42, value: '$183K', color: 'bg-slate-400', percent: 30 },
    { name: 'Qualified', count: 28, value: '$122K', color: 'bg-blue-400', percent: 20 },
    { name: 'Proposal', count: 19, value: '$83K', color: 'bg-indigo-500', percent: 14 },
    { name: 'Negotiation', count: 12, value: '$52K', color: 'bg-violet-500', percent: 9 },
    { name: 'Closed Won', count: 38, value: '$800K', color: 'bg-emerald-500', percent: 27 },
  ];
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'deal_won';
  description: string;
  contact: string;
  timeAgo: string;
}

/** TODO: Fetch real activity feed from your CRM data source */
function getRecentActivities(): Activity[] {
  return [
    {
      id: '1',
      type: 'deal_won',
      description: 'Closed enterprise deal',
      contact: 'Sarah Chen',
      timeAgo: '12 min ago',
    },
    {
      id: '2',
      type: 'call',
      description: 'Discovery call completed',
      contact: 'Marcus Johnson',
      timeAgo: '1 hr ago',
    },
    {
      id: '3',
      type: 'email',
      description: 'Proposal follow-up sent',
      contact: 'Lisa Park',
      timeAgo: '2 hrs ago',
    },
    {
      id: '4',
      type: 'meeting',
      description: 'Quarterly review scheduled',
      contact: 'David Kim',
      timeAgo: '3 hrs ago',
    },
    {
      id: '5',
      type: 'email',
      description: 'Contract revision requested',
      contact: 'Anna Petrov',
      timeAgo: '5 hrs ago',
    },
  ];
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
}

/** TODO: Fetch real monthly revenue data from your CRM data source */
function getRevenueData(): RevenueDataPoint[] {
  return [
    { month: 'Jul', revenue: 65000, target: 60000 },
    { month: 'Aug', revenue: 72000, target: 65000 },
    { month: 'Sep', revenue: 68000, target: 70000 },
    { month: 'Oct', revenue: 89000, target: 75000 },
    { month: 'Nov', revenue: 95000, target: 80000 },
    { month: 'Dec', revenue: 102000, target: 85000 },
    { month: 'Jan', revenue: 110000, target: 90000 },
    { month: 'Feb', revenue: 98000, target: 95000 },
    { month: 'Mar', revenue: 124000, target: 100000 },
    { month: 'Apr', revenue: 118000, target: 105000 },
    { month: 'May', revenue: 132000, target: 110000 },
    { month: 'Jun', revenue: 145000, target: 115000 },
  ];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const kpiIcons: Record<KPI['icon'], React.ReactNode> = {
  deals: <BarChart3 className="h-5 w-5 text-blue-500" />,
  revenue: <DollarSign className="h-5 w-5 text-emerald-500" />,
  winRate: <Target className="h-5 w-5 text-violet-500" />,
  avgDeal: <TrendingUp className="h-5 w-5 text-amber-500" />,
};

function KPICard({ kpi }: { kpi: KPI }) {
  const isPositive = kpi.change >= 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{kpi.label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
          {kpiIcons[kpi.icon]}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{kpi.value}</p>
      <div className="mt-1 flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
        )}
        <span
          className={`text-xs font-medium ${
            isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}
          {kpi.change}%
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </div>
  );
}

function PipelineSummary({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Deal Pipeline</h2>
      <p className="mt-0.5 text-sm text-gray-500">Current stage distribution</p>

      {/* Horizontal bar */}
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className={`${stage.color} transition-all`}
            style={{ width: `${stage.percent}%` }}
            title={`${stage.name}: ${stage.count} deals`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage.name} className="flex items-start gap-2">
            <span
              className={`mt-1.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${stage.color}`}
            />
            <div>
              <p className="text-sm font-medium text-gray-700">{stage.name}</p>
              <p className="text-xs text-gray-500">
                {stage.count} deals &middot; {stage.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const formatCurrency = (value: number) =>
    `$${(value / 1000).toFixed(0)}K`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Revenue</h2>
          <p className="mt-0.5 text-sm text-gray-500">Monthly revenue vs target</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />
            Target
          </span>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value)]}
              labelStyle={{ color: '#1e293b', fontWeight: 600 }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#cbd5e1"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="transparent"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const activityIcons: Record<Activity['type'], React.ReactNode> = {
  call: <Phone className="h-4 w-4 text-blue-500" />,
  email: <Mail className="h-4 w-4 text-indigo-500" />,
  meeting: <Calendar className="h-4 w-4 text-violet-500" />,
  deal_won: <Trophy className="h-4 w-4 text-amber-500" />,
};

const activityBg: Record<Activity['type'], string> = {
  call: 'bg-blue-50',
  email: 'bg-indigo-50',
  meeting: 'bg-violet-50',
  deal_won: 'bg-amber-50',
};

function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
      <p className="mt-0.5 text-sm text-gray-500">Latest CRM interactions</p>

      <div className="mt-4 space-y-1">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50"
          >
            {/* Icon */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${activityBg[activity.type]}`}
            >
              {activityIcons[activity.type]}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.contact}</p>
            </div>

            {/* Time */}
            <span className="flex-shrink-0 text-xs text-gray-400">
              {activity.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const kpis = getKPIs();
  const stages = getPipelineStages();
  const activities = getRecentActivities();
  const revenueData = getRevenueData();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your CRM overview at a glance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* Pipeline Summary */}
        <div className="mt-6">
          <PipelineSummary stages={stages} />
        </div>

        {/* Revenue Chart + Activities */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart data={revenueData} />
          </div>
          <div className="lg:col-span-2">
            <RecentActivities activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
