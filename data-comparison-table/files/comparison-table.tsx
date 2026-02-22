'use client';

import React, { useMemo } from 'react';
import { Check, X, Minus } from 'lucide-react';

import type {
  ComparisonItem,
  ComparisonFeature,
  ComparisonTableProps,
} from './comparison-table.types';

// Re-export types so consumers can import everything from one file
export type { ComparisonItem, ComparisonFeature, ComparisonTableProps };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Group features by category, preserving insertion order.
 * Features without a category are placed under `_ungrouped`.
 */
function groupFeatures(features: ComparisonFeature[]) {
  const groups: { category: string; features: ComparisonFeature[] }[] = [];
  const seen = new Map<string, number>();

  for (const feature of features) {
    const cat = feature.category ?? '_ungrouped';
    const idx = seen.get(cat);
    if (idx !== undefined) {
      groups[idx].features.push(feature);
    } else {
      seen.set(cat, groups.length);
      groups.push({ category: cat, features: [feature] });
    }
  }

  return groups;
}

/**
 * Returns true when at least one value in `values` differs from the rest.
 * Uses strict JSON comparison for objects; strict equality for primitives.
 */
function valuesDiffer(values: unknown[]): boolean {
  if (values.length < 2) return false;

  const serialize = (v: unknown): string => {
    if (v === null || v === undefined) return String(v);
    if (typeof v === 'object') {
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  const first = serialize(values[0]);
  return values.some((v) => serialize(v) !== first);
}

/**
 * Default cell renderer. Handles booleans, nullish, numbers, and strings.
 */
function defaultRenderCell(value: unknown): React.ReactNode {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-emerald-500" aria-label="Yes" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-red-400" aria-label="No" />;
  }
  if (value === null || value === undefined) {
    return <Minus className="mx-auto h-4 w-4 text-neutral-300" aria-label="N/A" />;
  }
  if (typeof value === 'number') {
    return <span>{value.toLocaleString()}</span>;
  }
  return <span>{String(value)}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ComparisonTable({
  items: rawItems,
  features,
  highlightDifferences = false,
  highlightBest,
  stickyHeader = true,
  maxItems,
  className = '',
  onRemoveItem,
}: ComparisonTableProps) {
  // Cap items if maxItems is set
  const items = useMemo(
    () => (maxItems != null ? rawItems.slice(0, maxItems) : rawItems),
    [rawItems, maxItems],
  );

  // Pre-group features by category
  const groups = useMemo(() => groupFeatures(features), [features]);

  if (items.length === 0) {
    return (
      <div className={`text-center text-sm text-neutral-500 py-12 ${className}`}>
        No items to compare. Add at least two items.
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}
    >
      <table className="w-full min-w-[600px] border-collapse text-sm">
        {/* ---------------------------------------------------------------- */}
        {/*  Header — sticky on scroll                                       */}
        {/* ---------------------------------------------------------------- */}
        <thead
          className={
            stickyHeader
              ? 'sticky top-0 z-20 bg-white dark:bg-neutral-900 shadow-[0_1px_0_0] shadow-neutral-200 dark:shadow-neutral-700'
              : 'bg-white dark:bg-neutral-900'
          }
        >
          <tr>
            {/* Empty corner cell — sticky horizontally */}
            <th
              className="sticky left-0 z-30 min-w-[160px] bg-white dark:bg-neutral-900 border-b border-r border-neutral-200 dark:border-neutral-700 p-3"
              aria-label="Features"
            />

            {items.map((item) => (
              <th
                key={item.id}
                className="relative border-b border-neutral-200 dark:border-neutral-700 p-3 text-center font-semibold text-neutral-900 dark:text-neutral-100 min-w-[140px]"
              >
                {/* Remove button */}
                {onRemoveItem && (
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-1.5 right-1.5 rounded-full p-0.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Item image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="mx-auto mb-1.5 h-10 w-10 rounded-md object-cover"
                  />
                )}

                {/* Item name */}
                <span className="block truncate max-w-[120px] mx-auto">{item.name}</span>
              </th>
            ))}
          </tr>
        </thead>

        {/* ---------------------------------------------------------------- */}
        {/*  Body — grouped feature rows                                      */}
        {/* ---------------------------------------------------------------- */}
        <tbody>
          {groups.map((group, gi) => {
            const isEvenGroup = gi % 2 === 0;
            const groupBg = isEvenGroup
              ? 'bg-white dark:bg-neutral-900'
              : 'bg-neutral-50 dark:bg-neutral-900/60';

            return (
              <React.Fragment key={group.category}>
                {/* Category header row (skip for ungrouped) */}
                {group.category !== '_ungrouped' && (
                  <tr>
                    <td
                      colSpan={items.length + 1}
                      className="sticky left-0 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700"
                    >
                      {group.category}
                    </td>
                  </tr>
                )}

                {group.features.map((feature) => {
                  const values = items.map((item) => item[feature.key]);
                  const differs = highlightDifferences && valuesDiffer(values);
                  const bestIdx = highlightBest ? highlightBest(feature, values) : null;

                  return (
                    <tr
                      key={feature.key}
                      className={`${groupBg} hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors`}
                    >
                      {/* Feature label — sticky horizontally */}
                      <td className="sticky left-0 z-10 bg-inherit border-b border-r border-neutral-200 dark:border-neutral-700 px-4 py-2.5 font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                        {feature.label}
                      </td>

                      {/* Value cells */}
                      {items.map((item, idx) => {
                        const value = item[feature.key];
                        const isBest = bestIdx === idx;

                        // Build cell classes
                        const cellClasses = [
                          'border-b border-neutral-200 dark:border-neutral-700 px-4 py-2.5 text-center text-neutral-600 dark:text-neutral-300',
                        ];

                        if (differs) {
                          cellClasses.push('bg-amber-50/60 dark:bg-amber-900/10');
                        }

                        if (isBest) {
                          cellClasses.push(
                            'font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/15',
                          );
                        }

                        const rendered = feature.render
                          ? feature.render(value, item)
                          : defaultRenderCell(value);

                        return (
                          <td key={item.id} className={cellClasses.join(' ')}>
                            {rendered}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
