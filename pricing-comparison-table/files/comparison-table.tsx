import * as React from "react"
import { Check, Minus } from "lucide-react"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ComparisonPlan {
  /** Unique identifier used as key in FeatureItem.values */
  id: string
  /** Display name shown in the table header (e.g. "Starter", "Pro") */
  name: string
  /** Pre-formatted price string (e.g. "$29/mo", "Free", "Custom") */
  price: string
}

export interface FeatureItem {
  /** Human-readable feature name shown in the first column */
  name: string
  /**
   * Map of plan id to feature availability.
   *   - `true`   renders a green check icon
   *   - `false`  renders a gray dash icon
   *   - `string` renders the literal text (e.g. "Unlimited", "5 GB")
   */
  values: Record<string, boolean | string>
}

export interface FeatureGroup {
  /** Category heading that spans the full table width (e.g. "Core Features") */
  category: string
  /** Feature rows within this category */
  items: FeatureItem[]
}

export interface ComparisonTableProps {
  /** Array of plans displayed as columns */
  plans: ComparisonPlan[]
  /** Grouped features displayed as rows */
  features: FeatureGroup[]
  /** Optional plan id whose column receives a highlighted background tint */
  highlightedPlanId?: string
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Render a single cell value:
 *  - boolean true  -> green check
 *  - boolean false -> gray dash
 *  - string        -> text label
 */
function CellValue({ value }: { value: boolean | string | undefined }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center">
        <Check
          className="h-5 w-5 text-emerald-500 dark:text-emerald-400"
          aria-label="Included"
        />
      </span>
    )
  }

  if (value === false || value === undefined) {
    return (
      <span className="inline-flex items-center justify-center">
        <Minus
          className="h-5 w-5 text-gray-300 dark:text-gray-600"
          aria-label="Not included"
        />
      </span>
    )
  }

  return (
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {value}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  ComparisonTable                                                           */
/* -------------------------------------------------------------------------- */

export function ComparisonTable({
  plans,
  features,
  highlightedPlanId,
}: ComparisonTableProps) {
  const totalColumns = plans.length + 1 // feature-name column + one per plan

  /**
   * Resolve per-cell background class.
   * Highlighted plan columns receive a subtle indigo tint on both header and
   * body cells to visually distinguish the recommended tier.
   */
  function highlightClass(planId: string, isHeader: boolean): string {
    if (planId !== highlightedPlanId) return ""
    return isHeader
      ? "bg-indigo-50 dark:bg-indigo-950/40"
      : "bg-indigo-50/50 dark:bg-indigo-950/20"
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        {/* ---------------------------------------------------------------- */}
        {/*  Sticky header: plan names + prices                              */}
        {/* ---------------------------------------------------------------- */}
        <thead>
          <tr className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {/* Empty corner cell — aligns with the feature-name column */}
            <th
              className="sticky left-0 z-20 bg-white px-4 py-4 dark:bg-gray-900"
              aria-label="Features"
            />

            {plans.map((plan) => (
              <th
                key={plan.id}
                className={[
                  "px-4 py-4 text-center",
                  highlightClass(plan.id, true),
                ].join(" ")}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {plan.name}
                </div>
                <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {plan.price}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* ---------------------------------------------------------------- */}
        {/*  Body: feature groups + rows                                     */}
        {/* ---------------------------------------------------------------- */}
        <tbody>
          {features.map((group) => (
            <React.Fragment key={group.category}>
              {/* Category header row */}
              <tr>
                <td
                  colSpan={totalColumns}
                  className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                >
                  {group.category}
                </td>
              </tr>

              {/* Feature rows */}
              {group.items.map((item) => (
                <tr
                  key={item.name}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/30"
                >
                  {/* Feature name — sticky on mobile */}
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {item.name}
                  </td>

                  {/* Per-plan value cells */}
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={[
                        "px-4 py-3 text-center",
                        highlightClass(plan.id, false),
                      ].join(" ")}
                    >
                      <CellValue value={item.values[plan.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
