'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PricingTier {
  /** Maximum units covered by this tier. Use Infinity for the final tier. */
  upTo: number;
  /** Price per unit in this tier (in dollars). */
  pricePerUnit: number;
  /** Human-readable label for the tier (e.g. "Free tier"). */
  label?: string;
}

export interface PriceEstimate {
  /** Total units selected by the slider. */
  units: number;
  /** Computed total price across all applicable tiers. */
  totalPrice: number;
  /** Per-tier breakdown showing how many units fall in each tier. */
  breakdown: { tier: string; units: number; price: number }[];
}

export interface PriceCalculatorProps {
  /** Ordered list of pricing tiers (lowest to highest). */
  tiers: PricingTier[];
  /** Name of the unit being priced (e.g. "API calls"). Defaults to "units". */
  unit?: string;
  /** Currency symbol shown before prices. Defaults to "$". */
  currency?: string;
  /** Callback fired whenever the estimate changes. */
  onEstimateChange?: (estimate: PriceEstimate) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the tiered price breakdown for a given number of units.
 * Each tier applies its rate to the units that fall within its range,
 * progressing from the lowest tier upward.
 */
function computeEstimate(
  units: number,
  tiers: PricingTier[],
): PriceEstimate {
  if (tiers.length === 0) {
    return { units, totalPrice: 0, breakdown: [] };
  }

  const breakdown: PriceEstimate['breakdown'] = [];
  let remaining = units;
  let prevCeiling = 0;

  for (let i = 0; i < tiers.length; i++) {
    if (remaining <= 0) break;

    const tier = tiers[i];
    const tierCapacity = Number.isFinite(tier.upTo)
      ? tier.upTo - prevCeiling
      : remaining;
    const tierUnits = Math.min(remaining, tierCapacity);
    const tierPrice = tierUnits * tier.pricePerUnit;

    breakdown.push({
      tier: tier.label ?? `Tier ${i + 1}`,
      units: tierUnits,
      price: tierPrice,
    });

    remaining -= tierUnits;
    prevCeiling = tier.upTo;
  }

  const totalPrice = breakdown.reduce((sum, b) => sum + b.price, 0);

  return { units, totalPrice, breakdown };
}

/**
 * Derive sensible slider bounds from the tier definitions.
 * - min is always 0.
 * - max is the highest finite `upTo` value, doubled, or a fallback of 10 000.
 * - step is chosen as a "nice" fraction of max to give ~200 discrete positions.
 */
function deriveSliderParams(tiers: PricingTier[]) {
  const finiteCeilings = tiers
    .map((t) => t.upTo)
    .filter((v) => Number.isFinite(v));

  const highestCeiling =
    finiteCeilings.length > 0 ? Math.max(...finiteCeilings) : 10_000;

  const max = highestCeiling * 2;
  const rawStep = max / 200;
  // Round step to a power-of-10 friendly value.
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.max(1, Math.round(rawStep / magnitude) * magnitude);

  return { min: 0, max, step };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceCalculator({
  tiers,
  unit = 'units',
  currency = '$',
  onEstimateChange,
}: PriceCalculatorProps) {
  // Sort tiers by upTo ascending to guarantee correct layering.
  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => a.upTo - b.upTo),
    [tiers],
  );

  const { min, max, step } = useMemo(
    () => deriveSliderParams(sortedTiers),
    [sortedTiers],
  );

  const [sliderValue, setSliderValue] = useState(0);

  const estimate = useMemo(
    () => computeEstimate(sliderValue, sortedTiers),
    [sliderValue, sortedTiers],
  );

  // Notify parent whenever estimate changes.
  useEffect(() => {
    onEstimateChange?.(estimate);
  }, [estimate, onEstimateChange]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(Number(e.target.value));
    },
    [],
  );

  // Format helpers.
  const fmtNumber = (n: number) => n.toLocaleString();
  const fmtPrice = (n: number) =>
    `${currency}${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Compute slider fill percentage for the track highlight.
  const fillPercent = max > 0 ? (sliderValue / max) * 100 : 0;

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Pricing Calculator
        </h3>
      </div>

      {/* Slider section */}
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {fmtNumber(sliderValue)} {unit}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            max {fmtNumber(max)}
          </span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleSliderChange}
          aria-label={`Select number of ${unit}`}
          className="w-full h-2 appearance-none rounded-full cursor-pointer
            bg-zinc-200 dark:bg-zinc-800
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:dark:bg-zinc-100
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:dark:border-zinc-900
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:dark:bg-zinc-100
            [&::-moz-range-thumb]:shadow-md"
          style={{
            background: `linear-gradient(to right, #18181b ${fillPercent}%, #e4e4e7 ${fillPercent}%)`,
          }}
        />

        {/* Tier markers */}
        {sortedTiers.length > 1 && (
          <div className="relative w-full h-4 mt-1">
            {sortedTiers
              .filter((t) => Number.isFinite(t.upTo) && t.upTo > 0 && t.upTo < max)
              .map((t) => {
                const left = (t.upTo / max) * 100;
                return (
                  <span
                    key={t.upTo}
                    className="absolute -translate-x-1/2 text-[10px] text-zinc-400 dark:text-zinc-500 select-none"
                    style={{ left: `${left}%` }}
                  >
                    {fmtNumber(t.upTo)}
                  </span>
                );
              })}
          </div>
        )}
      </div>

      {/* Estimated cost */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
          {fmtPrice(estimate.totalPrice)}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">/mo</span>
      </div>

      {/* Tier breakdown table */}
      {estimate.breakdown.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                  Tier
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  {unit}
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Rate
                </th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {estimate.breakdown.map((row) => (
                <tr
                  key={row.tier}
                  className="border-t border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                    {row.tier}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {fmtNumber(row.units)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {row.units > 0 && row.price === 0
                      ? 'Free'
                      : `${currency}${(row.price / row.units).toFixed(
                          row.price / row.units < 0.01 ? 4 : 3,
                        )}`}
                  </td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {fmtPrice(row.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {tiers.length === 0 && (
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-4">
          No pricing tiers configured.
        </p>
      )}
    </div>
  );
}
