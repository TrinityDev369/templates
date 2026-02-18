"use client"

import * as React from "react"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/** A single commission tier rule. */
export interface CommissionTier {
  /** Display name of the tier (e.g. "Starter", "Growth"). */
  name: string
  /** Minimum revenue threshold (inclusive) for this tier. */
  minRevenue: number
  /** Maximum revenue threshold (inclusive), or null for unlimited. */
  maxRevenue: number | null
  /** Commission rate as a decimal (e.g. 0.05 for 5%). */
  rate: number
  /** Optional flat bonus awarded when this tier is reached. */
  bonus?: number
}

/** Breakdown of commission earned within a single tier. */
export interface TierBreakdown {
  tier: CommissionTier
  /** Revenue that falls within this tier's range. */
  revenueInTier: number
  /** Commission earned from this tier (rate * revenueInTier + bonus). */
  commissionFromTier: number
}

/** Full result of a commission calculation. */
export interface CommissionResult {
  totalRevenue: number
  totalCommission: number
  /** Effective commission rate as a decimal. */
  effectiveRate: number
  tierBreakdown: TierBreakdown[]
}

export interface CommissionCalculatorProps {
  /** Commission tier rules. Falls back to sensible defaults if omitted. */
  tiers?: CommissionTier[]
  /** Called whenever the calculation updates. */
  onCalculate?: (result: CommissionResult) => void
  /** ISO 4217 currency code shown in the UI. @default "USD" */
  currency?: string
  className?: string
  style?: React.CSSProperties
  /** Color theme. @default "auto" */
  theme?: "light" | "dark" | "auto"
  /** Show the detailed per-tier breakdown table. @default true */
  showBreakdown?: boolean
}

/* -------------------------------------------------------------------------- */
/*  Default tiers                                                             */
/* -------------------------------------------------------------------------- */

const DEFAULT_TIERS: CommissionTier[] = [
  { name: "Starter", minRevenue: 0, maxRevenue: 50_000, rate: 0.05 },
  { name: "Growth", minRevenue: 50_000, maxRevenue: 150_000, rate: 0.08 },
  { name: "Pro", minRevenue: 150_000, maxRevenue: 500_000, rate: 0.12 },
  { name: "Elite", minRevenue: 500_000, maxRevenue: null, rate: 0.15, bonus: 5_000 },
]

/* -------------------------------------------------------------------------- */
/*  Currency formatting                                                       */
/* -------------------------------------------------------------------------- */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  JPY: "\u00A5",
  CHF: "CHF\u00A0",
}

function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? `${code.toUpperCase()}\u00A0`
}

function formatMoney(value: number, currency: string): string {
  const sym = currencySymbol(currency)
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return value < 0 ? `-${sym}${formatted}` : `${sym}${formatted}`
}

function formatCompact(value: number, currency: string): string {
  const sym = currencySymbol(currency)
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${sym}${(value / 1_000).toFixed(0)}k`
  return `${sym}${value.toFixed(0)}`
}

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

/* -------------------------------------------------------------------------- */
/*  Calculation engine                                                        */
/* -------------------------------------------------------------------------- */

function calculateCommission(
  revenue: number,
  tiers: CommissionTier[]
): CommissionResult {
  const sorted = [...tiers].sort((a, b) => a.minRevenue - b.minRevenue)
  const breakdown: TierBreakdown[] = []
  let totalCommission = 0

  for (const tier of sorted) {
    if (revenue <= tier.minRevenue) {
      breakdown.push({ tier, revenueInTier: 0, commissionFromTier: 0 })
      continue
    }

    const ceiling = tier.maxRevenue ?? Infinity
    const revenueInTier = Math.min(revenue, ceiling) - tier.minRevenue
    const commissionFromRate = revenueInTier * tier.rate
    const bonus = revenue >= tier.minRevenue && tier.bonus ? tier.bonus : 0
    const commissionFromTier = commissionFromRate + bonus
    totalCommission += commissionFromTier

    breakdown.push({ tier, revenueInTier, commissionFromTier })
  }

  const effectiveRate = revenue > 0 ? totalCommission / revenue : 0

  return { totalRevenue: revenue, totalCommission, effectiveRate, tierBreakdown: breakdown }
}

/* -------------------------------------------------------------------------- */
/*  Determine the current (highest reached) tier                              */
/* -------------------------------------------------------------------------- */

function currentTierName(revenue: number, tiers: CommissionTier[]): string {
  const sorted = [...tiers].sort((a, b) => b.minRevenue - a.minRevenue)
  for (const tier of sorted) {
    if (revenue >= tier.minRevenue) return tier.name
  }
  return tiers[0]?.name ?? "None"
}

/* -------------------------------------------------------------------------- */
/*  Theme helper                                                              */
/* -------------------------------------------------------------------------- */

function useResolvedTheme(theme: "light" | "dark" | "auto"): "light" | "dark" {
  const [resolved, setResolved] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    if (theme !== "auto") {
      setResolved(theme)
      return
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    setResolved(mq.matches ? "dark" : "light")
    const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? "dark" : "light")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  return resolved
}

/* -------------------------------------------------------------------------- */
/*  Color palette per tier index                                              */
/* -------------------------------------------------------------------------- */

const TIER_COLORS_LIGHT = [
  { bar: "#3b82f6", barBg: "#dbeafe", text: "#1e40af" },  // blue
  { bar: "#8b5cf6", barBg: "#ede9fe", text: "#5b21b6" },  // violet
  { bar: "#f59e0b", barBg: "#fef3c7", text: "#92400e" },  // amber
  { bar: "#10b981", barBg: "#d1fae5", text: "#065f46" },  // emerald
  { bar: "#ef4444", barBg: "#fee2e2", text: "#991b1b" },  // red
  { bar: "#ec4899", barBg: "#fce7f3", text: "#9d174d" },  // pink
]

const TIER_COLORS_DARK = [
  { bar: "#60a5fa", barBg: "#1e3a5f", text: "#93c5fd" },
  { bar: "#a78bfa", barBg: "#3b2766", text: "#c4b5fd" },
  { bar: "#fbbf24", barBg: "#4a3700", text: "#fde68a" },
  { bar: "#34d399", barBg: "#064e3b", text: "#6ee7b7" },
  { bar: "#f87171", barBg: "#5c1616", text: "#fca5a5" },
  { bar: "#f472b6", barBg: "#6b1745", text: "#f9a8d4" },
]

function tierColor(index: number, mode: "light" | "dark") {
  const palette = mode === "dark" ? TIER_COLORS_DARK : TIER_COLORS_LIGHT
  return palette[index % palette.length]
}

/* -------------------------------------------------------------------------- */
/*  Tier progress bar                                                         */
/* -------------------------------------------------------------------------- */

function TierProgressBar({
  tiers,
  revenue,
  currency,
  mode,
}: {
  tiers: CommissionTier[]
  revenue: number
  currency: string
  mode: "light" | "dark"
}) {
  const sorted = [...tiers].sort((a, b) => a.minRevenue - b.minRevenue)

  // Determine the display ceiling — the max of the last bounded tier, or revenue * 1.2 for unbounded
  const lastTier = sorted[sorted.length - 1]
  const displayMax = lastTier
    ? lastTier.maxRevenue ?? Math.max(revenue * 1.2, lastTier.minRevenue + 100_000)
    : 100_000

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium opacity-70">
        <span>{formatCompact(0, currency)}</span>
        <span>{formatCompact(displayMax, currency)}</span>
      </div>
      <div
        className="relative flex h-7 w-full overflow-hidden rounded-lg"
        style={{ backgroundColor: mode === "dark" ? "#1f2937" : "#f3f4f6" }}
      >
        {sorted.map((tier, i) => {
          const ceiling = tier.maxRevenue ?? displayMax
          const tierWidth = ((ceiling - tier.minRevenue) / displayMax) * 100
          const colors = tierColor(i, mode)

          // How much of this tier is filled
          const filledRevenue = Math.max(0, Math.min(revenue, ceiling) - tier.minRevenue)
          const fillPct = ceiling - tier.minRevenue > 0
            ? (filledRevenue / (ceiling - tier.minRevenue)) * 100
            : 0

          return (
            <div
              key={tier.name}
              className="relative h-full"
              style={{ width: `${tierWidth}%` }}
              title={`${tier.name}: ${formatRate(tier.rate)}`}
            >
              {/* Background */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: colors.barBg }}
              />
              {/* Filled portion */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(fillPct, 100)}%`,
                  backgroundColor: colors.bar,
                }}
              />
              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[10px] font-semibold leading-none drop-shadow-sm"
                  style={{ color: fillPct > 50 ? "#fff" : colors.text }}
                >
                  {tier.name}
                </span>
              </div>
            </div>
          )
        })}
        {/* Revenue marker */}
        {revenue > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 transition-all duration-500 ease-out"
            style={{
              left: `${Math.min((revenue / displayMax) * 100, 100)}%`,
              backgroundColor: mode === "dark" ? "#f9fafb" : "#111827",
            }}
          >
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: mode === "dark" ? "#f9fafb" : "#111827",
                color: mode === "dark" ? "#111827" : "#f9fafb",
              }}
            >
              {formatCompact(revenue, currency)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Horizontal bar chart — commission by tier (pure CSS)                      */
/* -------------------------------------------------------------------------- */

function CommissionBarChart({
  breakdown,
  currency,
  mode,
}: {
  breakdown: TierBreakdown[]
  currency: string
  mode: "light" | "dark"
}) {
  const maxCommission = Math.max(...breakdown.map((b) => b.commissionFromTier), 1)

  return (
    <div className="space-y-3">
      {breakdown.map((b, i) => {
        const colors = tierColor(i, mode)
        const pct = (b.commissionFromTier / maxCommission) * 100

        return (
          <div key={b.tier.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium" style={{ color: colors.text }}>
                {b.tier.name}
              </span>
              <span className="tabular-nums font-semibold">
                {formatMoney(b.commissionFromTier, currency)}
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: colors.barBg }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(pct, 0)}%`,
                  backgroundColor: colors.bar,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Revenue input with formatting                                             */
/* -------------------------------------------------------------------------- */

function RevenueInput({
  value,
  onChange,
  currency,
  mode,
}: {
  value: number
  onChange: (v: number) => void
  currency: string
  mode: "light" | "dark"
}) {
  const [raw, setRaw] = React.useState<string>(value > 0 ? value.toString() : "")
  const [focused, setFocused] = React.useState(false)

  // Sync external value changes when not focused
  React.useEffect(() => {
    if (!focused) {
      setRaw(value > 0 ? value.toString() : "")
    }
  }, [value, focused])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const stripped = e.target.value.replace(/[^0-9.]/g, "")
    setRaw(stripped)
    const parsed = parseFloat(stripped)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onChange(parsed)
    } else if (stripped === "") {
      onChange(0)
    }
  }

  const displayValue = focused
    ? raw
    : value > 0
      ? value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : ""

  const sym = currencySymbol(currency)

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-50"
      >
        {sym}
      </span>
      <input
        type="text"
        inputMode="decimal"
        placeholder="0"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          "w-full rounded-lg border py-3 pr-4 text-right text-2xl font-bold tabular-nums outline-none transition-colors",
          "focus:ring-2 focus:ring-offset-1",
          mode === "dark"
            ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 focus:border-blue-400 focus:ring-blue-400/30"
            : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30",
        ].join(" ")}
        style={{ paddingLeft: `${sym.length * 0.6 + 1.2}rem` }}
        aria-label="Revenue amount"
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Summary card                                                              */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  result,
  currency,
  tierName,
  mode,
}: {
  result: CommissionResult
  currency: string
  tierName: string
  mode: "light" | "dark"
}) {
  const cardBg = mode === "dark" ? "bg-gray-800" : "bg-white"
  const mutedText = mode === "dark" ? "text-gray-400" : "text-gray-500"

  return (
    <div
      className={`grid grid-cols-3 gap-4 rounded-xl border p-5 ${cardBg} ${
        mode === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      {/* Total commission */}
      <div className="space-y-1 text-center">
        <p className={`text-xs font-medium uppercase tracking-wide ${mutedText}`}>
          Commission
        </p>
        <p className="text-xl font-bold tabular-nums sm:text-2xl">
          {formatMoney(result.totalCommission, currency)}
        </p>
      </div>

      {/* Effective rate */}
      <div className="space-y-1 text-center">
        <p className={`text-xs font-medium uppercase tracking-wide ${mutedText}`}>
          Effective Rate
        </p>
        <p className="text-xl font-bold tabular-nums sm:text-2xl">
          {formatRate(result.effectiveRate)}
        </p>
      </div>

      {/* Tier achieved */}
      <div className="space-y-1 text-center">
        <p className={`text-xs font-medium uppercase tracking-wide ${mutedText}`}>
          Tier
        </p>
        <p className="text-xl font-bold sm:text-2xl">
          {tierName}
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Breakdown table                                                           */
/* -------------------------------------------------------------------------- */

function BreakdownTable({
  breakdown,
  currency,
  mode,
}: {
  breakdown: TierBreakdown[]
  currency: string
  mode: "light" | "dark"
}) {
  const headerBg = mode === "dark" ? "bg-gray-800" : "bg-gray-50"
  const borderColor = mode === "dark" ? "border-gray-700" : "border-gray-200"
  const rowHover = mode === "dark" ? "hover:bg-gray-800/60" : "hover:bg-gray-50/80"
  const mutedText = mode === "dark" ? "text-gray-400" : "text-gray-500"

  return (
    <div className={`overflow-hidden rounded-lg border ${borderColor}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={headerBg}>
            <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Tier
            </th>
            <th className={`px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Range
            </th>
            <th className={`px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Rate
            </th>
            <th className={`px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Revenue
            </th>
            <th className={`px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
              Commission
            </th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((b, i) => {
            const colors = tierColor(i, mode)
            const isActive = b.revenueInTier > 0

            return (
              <tr
                key={b.tier.name}
                className={`${rowHover} border-t ${borderColor} transition-colors ${
                  isActive ? "" : "opacity-40"
                }`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colors.bar }}
                    />
                    <span className="font-medium">{b.tier.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatCompact(b.tier.minRevenue, currency)}
                  {" \u2013 "}
                  {b.tier.maxRevenue !== null
                    ? formatCompact(b.tier.maxRevenue, currency)
                    : "\u221E"}
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                  {formatRate(b.tier.rate)}
                  {b.tier.bonus ? (
                    <span className={`ml-1 text-xs ${mutedText}`}>
                      +{formatCompact(b.tier.bonus, currency)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatMoney(b.revenueInTier, currency)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                  {formatMoney(b.commissionFromTier, currency)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function CommissionCalculator({
  tiers = DEFAULT_TIERS,
  onCalculate,
  currency = "USD",
  className,
  style,
  theme = "auto",
  showBreakdown = true,
}: CommissionCalculatorProps) {
  const mode = useResolvedTheme(theme)
  const [revenue, setRevenue] = React.useState<number>(0)

  const result = React.useMemo(() => calculateCommission(revenue, tiers), [revenue, tiers])
  const tierName = React.useMemo(() => currentTierName(revenue, tiers), [revenue, tiers])

  // Fire callback on every recalculation
  const onCalculateRef = React.useRef(onCalculate)
  onCalculateRef.current = onCalculate

  React.useEffect(() => {
    onCalculateRef.current?.(result)
  }, [result])

  const containerBg = mode === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"

  return (
    <div
      className={[
        "mx-auto w-full max-w-3xl space-y-6 rounded-2xl border p-6 shadow-sm sm:p-8",
        containerBg,
        mode === "dark" ? "border-gray-700" : "border-gray-200",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">
          Commission Calculator
        </h2>
        <p className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Enter your total revenue to see the tiered commission breakdown.
        </p>
      </div>

      {/* Revenue input */}
      <div className="space-y-2">
        <label
          className={`text-xs font-semibold uppercase tracking-wide ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Total Revenue ({currency})
        </label>
        <RevenueInput
          value={revenue}
          onChange={setRevenue}
          currency={currency}
          mode={mode}
        />
      </div>

      {/* Tier progress bar */}
      <div className="space-y-2 pt-2">
        <h3
          className={`text-xs font-semibold uppercase tracking-wide ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Tier Progress
        </h3>
        <TierProgressBar
          tiers={tiers}
          revenue={revenue}
          currency={currency}
          mode={mode}
        />
      </div>

      {/* Summary card */}
      <SummaryCard
        result={result}
        currency={currency}
        tierName={revenue > 0 ? tierName : "\u2014"}
        mode={mode}
      />

      {/* Commission bar chart */}
      {revenue > 0 && (
        <div className="space-y-3">
          <h3
            className={`text-xs font-semibold uppercase tracking-wide ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Commission by Tier
          </h3>
          <CommissionBarChart
            breakdown={result.tierBreakdown}
            currency={currency}
            mode={mode}
          />
        </div>
      )}

      {/* Detailed breakdown table */}
      {showBreakdown && (
        <div className="space-y-3">
          <h3
            className={`text-xs font-semibold uppercase tracking-wide ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Detailed Breakdown
          </h3>
          <BreakdownTable
            breakdown={result.tierBreakdown}
            currency={currency}
            mode={mode}
          />
        </div>
      )}
    </div>
  )
}

export default CommissionCalculator
