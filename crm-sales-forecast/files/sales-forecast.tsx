'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Deal = {
  id: string;
  name: string;
  value: number;
  stage: string;
  closeDate: string;
  probability: number;
};

type ForecastMonth = {
  month: string;
  weighted: number;
  best: number;
  worst: number;
  committed: number;
};

const MOCK_DEALS: Deal[] = [
  { id: '1', name: 'Acme Corp Platform', value: 48000, stage: 'Negotiation', closeDate: '2026-03-15', probability: 0.75 },
  { id: '2', name: 'Globex Redesign', value: 32000, stage: 'Proposal', closeDate: '2026-03-22', probability: 0.4 },
  { id: '3', name: 'Initech Migration', value: 95000, stage: 'Verbal Commit', closeDate: '2026-04-01', probability: 0.92 },
  { id: '4', name: 'Umbrella Analytics', value: 21000, stage: 'Discovery', closeDate: '2026-04-10', probability: 0.2 },
  { id: '5', name: 'Stark Industries API', value: 64000, stage: 'Negotiation', closeDate: '2026-04-18', probability: 0.8 },
  { id: '6', name: 'Wayne CRM Build', value: 110000, stage: 'Contract Sent', closeDate: '2026-05-05', probability: 0.95 },
  { id: '7', name: 'Oscorp Dashboard', value: 27000, stage: 'Proposal', closeDate: '2026-05-20', probability: 0.35 },
  { id: '8', name: 'Pied Piper Infra', value: 53000, stage: 'Negotiation', closeDate: '2026-06-01', probability: 0.6 },
  { id: '9', name: 'Hooli Data Layer', value: 41000, stage: 'Verbal Commit', closeDate: '2026-06-12', probability: 0.9 },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function toMonthKey(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function computeForecast(deals: Deal[]): { months: ForecastMonth[]; totals: { weighted: number; best: number; committed: number; pipeline: number } } {
  const grouped = new Map<string, Deal[]>();
  for (const deal of deals) {
    const key = toMonthKey(deal.closeDate);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(deal);
  }

  const sorted = [...grouped.entries()].sort((a, b) => {
    const da = new Date(a.value[0].closeDate);
    const db = new Date(b.value[0].closeDate);
    return da.getTime() - db.getTime();
  });

  let totalWeighted = 0, totalBest = 0, totalCommitted = 0, totalPipeline = 0;
  const months: ForecastMonth[] = sorted.map(([month, monthDeals]) => {
    const weighted = monthDeals.reduce((s, d) => s + d.value * d.probability, 0);
    const best = monthDeals.reduce((s, d) => s + d.value, 0);
    const worst = monthDeals.filter(d => d.probability > 0.7).reduce((s, d) => s + d.value * d.probability, 0);
    const committed = monthDeals.filter(d => d.probability >= 0.9).reduce((s, d) => s + d.value, 0);
    totalWeighted += weighted;
    totalBest += best;
    totalCommitted += committed;
    totalPipeline += best;
    return { month, weighted: Math.round(weighted), best: Math.round(best), worst: Math.round(worst), committed: Math.round(committed) };
  });

  return { months, totals: { weighted: Math.round(totalWeighted), best: Math.round(totalBest), committed: Math.round(totalCommitted), pipeline: Math.round(totalPipeline) } };
}

const KPI_CARDS = [
  { label: 'Weighted Forecast', key: 'weighted' as const, color: 'text-blue-600' },
  { label: 'Best Case', key: 'best' as const, color: 'text-emerald-600' },
  { label: 'Committed', key: 'committed' as const, color: 'text-violet-600' },
  { label: 'Pipeline Total', key: 'pipeline' as const, color: 'text-zinc-600' },
];

export function SalesForecast({ deals = MOCK_DEALS, className }: { deals?: Deal[]; className?: string }) {
  const { months, totals } = useMemo(() => computeForecast(deals), [deals]);
  const sortedDeals = useMemo(() => [...deals].sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()), [deals]);

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPI_CARDS.map(({ label, key, color }) => (
          <div key={key} className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
            <p className={`mt-1 text-xl font-semibold ${color}`}>{formatCurrency(totals[key])}</p>
          </div>
        ))}
      </div>

      {/* Forecast Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">Monthly Forecast Bands</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={months} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
            <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Area type="monotone" dataKey="best" name="Best Case" stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.15} strokeWidth={1.5} />
            <Area type="monotone" dataKey="weighted" name="Weighted" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
            <Area type="monotone" dataKey="committed" name="Committed" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Deal List */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
              <th className="px-4 py-2">Deal</th>
              <th className="px-4 py-2">Stage</th>
              <th className="px-4 py-2 text-right">Value</th>
              <th className="px-4 py-2 text-right">Prob.</th>
              <th className="px-4 py-2 text-right">Weighted</th>
              <th className="px-4 py-2">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedDeals.map(deal => (
              <tr key={deal.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                <td className="px-4 py-2 font-medium text-zinc-800">{deal.name}</td>
                <td className="px-4 py-2 text-zinc-500">{deal.stage}</td>
                <td className="px-4 py-2 text-right text-zinc-700">{formatCurrency(deal.value)}</td>
                <td className="px-4 py-2 text-right text-zinc-500">{Math.round(deal.probability * 100)}%</td>
                <td className="px-4 py-2 text-right font-medium text-blue-600">{formatCurrency(Math.round(deal.value * deal.probability))}</td>
                <td className="px-4 py-2 text-zinc-500">{new Date(deal.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
