/* -------------------------------------------------------------------------- */
/*  Territory Map — Utility Functions                                         */
/* -------------------------------------------------------------------------- */

import type { Territory, TerritoryMetrics } from './types';

/**
 * Calculate quota attainment percentage for a territory.
 * Returns 0 when quota is zero to avoid division by zero.
 */
export function calculateQuotaAttainment(territory: Territory): number {
  if (territory.metrics.quota === 0) return 0;
  return (territory.metrics.revenue / territory.metrics.quota) * 100;
}

/**
 * Map a quota attainment percentage to a hex color.
 *
 * - >= 100 %  -> green  (#22c55e)
 * - 50–99 %   -> yellow (#eab308)
 * - < 50 %    -> red    (#ef4444)
 */
export function getAttainmentColor(attainment: number): string {
  if (attainment >= 100) return '#22c55e';
  if (attainment >= 50) return '#eab308';
  return '#ef4444';
}

/**
 * Sort territories by quota attainment in descending order
 * (highest attainment first). Returns a new array.
 */
export function sortTerritoriesByAttainment(territories: Territory[]): Territory[] {
  return [...territories].sort(
    (a, b) => calculateQuotaAttainment(b) - calculateQuotaAttainment(a),
  );
}

/**
 * Filter territories that have no assigned sales rep.
 */
export function getUnassignedTerritories(territories: Territory[]): Territory[] {
  return territories.filter((t) => t.assignedTo === null);
}

/**
 * Format a numeric amount as a USD currency string.
 * Example: 125000 -> "$125,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Aggregate metrics across all provided territories.
 * `quotaAttainment` is computed from the totals (not averaged).
 */
export function calculateTotalMetrics(territories: Territory[]): TerritoryMetrics {
  const totals = territories.reduce(
    (acc, t) => ({
      revenue: acc.revenue + t.metrics.revenue,
      dealCount: acc.dealCount + t.metrics.dealCount,
      quota: acc.quota + t.metrics.quota,
    }),
    { revenue: 0, dealCount: 0, quota: 0 },
  );

  return {
    ...totals,
    quotaAttainment: totals.quota === 0 ? 0 : (totals.revenue / totals.quota) * 100,
  };
}
