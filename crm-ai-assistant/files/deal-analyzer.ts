/**
 * CRM AI Assistant — Deal Analyzer
 *
 * Pure utility functions for analyzing CRM deals. No React, no API calls.
 * Each function takes an array of Deal objects and returns insights or stats.
 */

import type { Deal, DealInsight, CRMContext } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Number of milliseconds in a single day. */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Calculate the number of days between two ISO date strings. Negative = past. */
function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / MS_PER_DAY;
}

/** Generate a simple deterministic id from seed parts. */
function insightId(...parts: string[]): string {
  return parts.join('-').replace(/[^a-z0-9-]/gi, '').slice(0, 48);
}

// ---------------------------------------------------------------------------
// Risk Analysis
// ---------------------------------------------------------------------------

/**
 * Identify deals that may be at risk.
 *
 * Heuristics:
 * - **Stale deals**: created more than 90 days ago and still open.
 * - **Low probability**: probability below 30 in mid/late stages.
 * - **Overdue close**: expectedClose is in the past.
 */
export function analyzeDealRisks(deals: Deal[]): DealInsight[] {
  const now = new Date().toISOString();
  const insights: DealInsight[] = [];

  for (const deal of deals) {
    const ageInDays = daysBetween(deal.createdAt, now);
    const daysUntilClose = daysBetween(now, deal.expectedClose);

    // Stale deals — open for > 90 days
    if (ageInDays > 90 && deal.stage !== 'closed-won' && deal.stage !== 'closed-lost') {
      insights.push({
        type: 'risk',
        title: `Stale deal: ${deal.name}`,
        description: `This deal has been open for ${Math.round(ageInDays)} days without closing. Consider re-engaging ${deal.contact} at ${deal.company} or re-qualifying.`,
        confidence: Math.min(40 + Math.round(ageInDays / 5), 95),
        dealId: deal.id,
      });
    }

    // Low probability in later stages
    if (
      deal.probability < 30 &&
      !['lead', 'qualified', 'closed-won', 'closed-lost'].includes(deal.stage)
    ) {
      insights.push({
        type: 'risk',
        title: `Low win probability: ${deal.name}`,
        description: `Deal is in "${deal.stage}" stage but only has a ${deal.probability}% probability. This may indicate blockers or loss of champion.`,
        confidence: 70,
        dealId: deal.id,
      });
    }

    // Overdue expected close date
    if (daysUntilClose < 0 && deal.stage !== 'closed-won' && deal.stage !== 'closed-lost') {
      insights.push({
        type: 'risk',
        title: `Overdue close: ${deal.name}`,
        description: `Expected close date was ${Math.round(Math.abs(daysUntilClose))} days ago. Update the timeline or assess whether this deal is still viable.`,
        confidence: 85,
        dealId: deal.id,
      });
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Opportunity Identification
// ---------------------------------------------------------------------------

/**
 * Identify high-potential opportunities in the pipeline.
 *
 * Heuristics:
 * - **High-value deals**: top 20% by value with solid probability.
 * - **Quick wins**: high probability (>70) with near-term close (<30 days).
 * - **Upsell candidates**: recently closed-won deals that could expand.
 */
export function findOpportunities(deals: Deal[]): DealInsight[] {
  const now = new Date().toISOString();
  const insights: DealInsight[] = [];

  // Sort by value descending to find high-value threshold
  const openDeals = deals.filter(
    (d) => d.stage !== 'closed-won' && d.stage !== 'closed-lost',
  );
  const sortedByValue = [...openDeals].sort((a, b) => b.value - a.value);
  const topThreshold = sortedByValue[Math.max(0, Math.floor(sortedByValue.length * 0.2) - 1)]?.value ?? 0;

  for (const deal of deals) {
    const daysUntilClose = daysBetween(now, deal.expectedClose);

    // High-value deal
    if (
      deal.value >= topThreshold &&
      topThreshold > 0 &&
      deal.probability >= 40 &&
      deal.stage !== 'closed-won' &&
      deal.stage !== 'closed-lost'
    ) {
      insights.push({
        type: 'opportunity',
        title: `High-value deal: ${deal.name}`,
        description: `At $${deal.value.toLocaleString()}, this is a top-tier deal with ${deal.probability}% probability. Prioritize resources to advance it.`,
        confidence: Math.min(deal.probability + 10, 95),
        dealId: deal.id,
      });
    }

    // Quick wins — high probability, closes soon
    if (
      deal.probability > 70 &&
      daysUntilClose >= 0 &&
      daysUntilClose <= 30 &&
      deal.stage !== 'closed-won' &&
      deal.stage !== 'closed-lost'
    ) {
      insights.push({
        type: 'opportunity',
        title: `Quick win: ${deal.name}`,
        description: `${deal.probability}% probability and closing in ${Math.round(daysUntilClose)} days. Ensure all blockers are cleared to close on time.`,
        confidence: deal.probability,
        dealId: deal.id,
      });
    }

    // Upsell candidates — recently closed won
    if (deal.stage === 'closed-won') {
      const daysSinceClose = daysBetween(deal.expectedClose, now);
      if (daysSinceClose >= 0 && daysSinceClose <= 60) {
        insights.push({
          type: 'opportunity',
          title: `Upsell candidate: ${deal.company}`,
          description: `"${deal.name}" closed ${Math.round(daysSinceClose)} days ago. This is a good time to explore expansion or cross-sell opportunities with ${deal.contact}.`,
          confidence: 55,
          dealId: deal.id,
        });
      }
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Pipeline Forecast
// ---------------------------------------------------------------------------

/**
 * Generate a weighted pipeline forecast.
 *
 * - **Expected**: sum of (value * probability/100) for all open deals.
 * - **Best case**: sum of all open deal values (assumes 100% win rate).
 * - **Worst case**: sum of (value * probability/100) for deals with probability > 50.
 */
export function generateForecast(
  deals: Deal[],
): { expected: number; best: number; worst: number } {
  const openDeals = deals.filter(
    (d) => d.stage !== 'closed-won' && d.stage !== 'closed-lost',
  );

  const expected = openDeals.reduce(
    (sum, d) => sum + d.value * (d.probability / 100),
    0,
  );

  const best = openDeals.reduce((sum, d) => sum + d.value, 0);

  const worst = openDeals
    .filter((d) => d.probability > 50)
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

  return {
    expected: Math.round(expected),
    best: Math.round(best),
    worst: Math.round(worst),
  };
}

// ---------------------------------------------------------------------------
// Action Suggestions
// ---------------------------------------------------------------------------

/**
 * Suggest concrete actions a sales rep should take.
 *
 * - Follow-up reminders for deals with no activity.
 * - Stage advancement suggestions when probability is high relative to stage.
 */
export function suggestActions(deals: Deal[]): DealInsight[] {
  const now = new Date().toISOString();
  const insights: DealInsight[] = [];

  for (const deal of deals) {
    if (deal.stage === 'closed-won' || deal.stage === 'closed-lost') continue;

    const ageInDays = daysBetween(deal.createdAt, now);
    const daysUntilClose = daysBetween(now, deal.expectedClose);

    // Follow-up reminder for deals > 14 days old
    if (ageInDays > 14 && deal.probability < 80) {
      insights.push({
        type: 'action',
        title: `Follow up with ${deal.contact}`,
        description: `"${deal.name}" has been in "${deal.stage}" for ${Math.round(ageInDays)} days. Schedule a call or send a check-in email to maintain momentum.`,
        confidence: 65,
        dealId: deal.id,
      });
    }

    // Stage advancement: high probability but still in early stage
    const earlyStages = ['lead', 'qualified', 'discovery'];
    if (deal.probability >= 60 && earlyStages.includes(deal.stage)) {
      insights.push({
        type: 'action',
        title: `Advance stage: ${deal.name}`,
        description: `Probability is ${deal.probability}% but stage is still "${deal.stage}". Consider moving this deal to the next stage to reflect its actual progress.`,
        confidence: 60,
        dealId: deal.id,
      });
    }

    // Deals closing within 7 days that need attention
    if (daysUntilClose >= 0 && daysUntilClose <= 7 && deal.probability >= 50) {
      insights.push({
        type: 'action',
        title: `Closing soon: ${deal.name}`,
        description: `Expected to close in ${Math.round(daysUntilClose)} day(s). Confirm contract terms, get final sign-off, and prepare onboarding.`,
        confidence: 75,
        dealId: deal.id,
      });
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Pipeline Summary
// ---------------------------------------------------------------------------

/**
 * Compute aggregate pipeline statistics. Returns a CRMContext object
 * suitable for injecting into the AI assistant's system prompt.
 */
export function summarizePipeline(deals: Deal[]): CRMContext {
  const openDeals = deals.filter(
    (d) => d.stage !== 'closed-won' && d.stage !== 'closed-lost',
  );

  const totalPipeline = openDeals.reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = openDeals.length > 0 ? totalPipeline / openDeals.length : 0;

  const closedDeals = deals.filter(
    (d) => d.stage === 'closed-won' || d.stage === 'closed-lost',
  );
  const wonDeals = deals.filter((d) => d.stage === 'closed-won');
  const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;

  return {
    deals,
    totalPipeline: Math.round(totalPipeline),
    avgDealSize: Math.round(avgDealSize),
    winRate: Math.round(winRate * 10) / 10,
  };
}
