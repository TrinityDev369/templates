"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Check,
  Minus,
  Star,
  Grid3X3,
  List,
  Search,
  ChevronDown,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Feature {
  id: string;
  name: string;
  category: string;
}

interface Score {
  featureId: string;
  value: number; // 1-5, 0 = missing
}

interface Tool {
  id: string;
  name: string;
  tagline: string;
  color: string; // hex for logo placeholder
  price: string;
  bestFor: string;
  scores: Score[];
}

type ViewMode = "table" | "card";
type SortKey = "overall" | string; // "overall" or a featureId

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const FEATURES: Feature[] = [
  { id: "task-mgmt", name: "Task Management", category: "Core" },
  { id: "sprint", name: "Sprint Planning", category: "Core" },
  { id: "time-track", name: "Time Tracking", category: "Productivity" },
  { id: "integrations", name: "Integrations", category: "Ecosystem" },
  { id: "mobile", name: "Mobile App", category: "Access" },
  { id: "free-tier", name: "Free Tier", category: "Pricing" },
  { id: "api", name: "API Access", category: "Ecosystem" },
  { id: "custom-fields", name: "Custom Fields", category: "Flexibility" },
];

const CATEGORIES = Array.from(new Set(FEATURES.map((f) => f.category)));

const TOOLS: Tool[] = [
  {
    id: "notion",
    name: "Notion",
    tagline: "All-in-one workspace for docs, wikis & projects",
    color: "#000000",
    price: "Free / $10/mo",
    bestFor: "Small teams & docs-heavy workflows",
    scores: [
      { featureId: "task-mgmt", value: 4 },
      { featureId: "sprint", value: 2 },
      { featureId: "time-track", value: 2 },
      { featureId: "integrations", value: 4 },
      { featureId: "mobile", value: 3 },
      { featureId: "free-tier", value: 5 },
      { featureId: "api", value: 4 },
      { featureId: "custom-fields", value: 5 },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    tagline: "Streamlined issue tracking built for speed",
    color: "#5E6AD2",
    price: "Free / $8/mo",
    bestFor: "Engineering teams shipping fast",
    scores: [
      { featureId: "task-mgmt", value: 5 },
      { featureId: "sprint", value: 5 },
      { featureId: "time-track", value: 1 },
      { featureId: "integrations", value: 4 },
      { featureId: "mobile", value: 4 },
      { featureId: "free-tier", value: 4 },
      { featureId: "api", value: 5 },
      { featureId: "custom-fields", value: 3 },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    tagline: "Enterprise-grade project tracking by Atlassian",
    color: "#0052CC",
    price: "Free / $8.15/mo",
    bestFor: "Large orgs with complex workflows",
    scores: [
      { featureId: "task-mgmt", value: 5 },
      { featureId: "sprint", value: 5 },
      { featureId: "time-track", value: 3 },
      { featureId: "integrations", value: 5 },
      { featureId: "mobile", value: 3 },
      { featureId: "free-tier", value: 4 },
      { featureId: "api", value: 5 },
      { featureId: "custom-fields", value: 5 },
    ],
  },
  {
    id: "asana",
    name: "Asana",
    tagline: "Work management for teams of all sizes",
    color: "#F06A6A",
    price: "Free / $10.99/mo",
    bestFor: "Cross-functional team coordination",
    scores: [
      { featureId: "task-mgmt", value: 5 },
      { featureId: "sprint", value: 3 },
      { featureId: "time-track", value: 3 },
      { featureId: "integrations", value: 5 },
      { featureId: "mobile", value: 4 },
      { featureId: "free-tier", value: 4 },
      { featureId: "api", value: 4 },
      { featureId: "custom-fields", value: 4 },
    ],
  },
  {
    id: "monday",
    name: "Monday",
    tagline: "Visual work OS for every team",
    color: "#FF3D57",
    price: "$9/mo",
    bestFor: "Visual thinkers & non-technical teams",
    scores: [
      { featureId: "task-mgmt", value: 4 },
      { featureId: "sprint", value: 3 },
      { featureId: "time-track", value: 4 },
      { featureId: "integrations", value: 4 },
      { featureId: "mobile", value: 4 },
      { featureId: "free-tier", value: 2 },
      { featureId: "api", value: 3 },
      { featureId: "custom-fields", value: 4 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function overallScore(tool: Tool): number {
  const total = tool.scores.reduce((sum, s) => sum + s.value, 0);
  return total / tool.scores.length;
}

function scoreColor(value: number): string {
  if (value >= 4) return "text-emerald-600";
  if (value >= 3) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(value: number): string {
  if (value >= 4) return "bg-emerald-50 border-emerald-200";
  if (value >= 3) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function scoreBarColor(value: number): string {
  if (value >= 4) return "bg-emerald-500";
  if (value >= 3) return "bg-amber-400";
  return "bg-red-400";
}

function featureWinner(featureId: string, tools: Tool[]): string | null {
  let maxVal = 0;
  let winnerId: string | null = null;
  for (const tool of tools) {
    const score = tool.scores.find((s) => s.featureId === featureId);
    if (score && score.value > maxVal) {
      maxVal = score.value;
      winnerId = tool.id;
    }
  }
  return winnerId;
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm"
      role="radiogroup"
      aria-label="View mode"
    >
      <button
        role="radio"
        aria-checked={view === "table"}
        onClick={() => onChange("table")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "table"
            ? "bg-gray-900 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <List className="h-4 w-4" />
        Table
      </button>
      <button
        role="radio"
        aria-checked={view === "card"}
        onClick={() => onChange("card")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "card"
            ? "bg-gray-900 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Grid3X3 className="h-4 w-4" />
        Cards
      </button>
    </div>
  );
}

function ScoreCell({
  value,
  isWinner,
}: {
  value: number;
  isWinner: boolean;
}) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center justify-center" aria-label="Not available">
        <Minus className="h-4 w-4 text-gray-300" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5",
        isWinner && "relative"
      )}
      aria-label={`${value} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < value
              ? scoreColor(value)
              : "text-gray-200"
          )}
          fill={i < value ? "currentColor" : "none"}
        />
      ))}
      {isWinner && (
        <Trophy className="ml-1 h-3.5 w-3.5 text-amber-400" aria-label="Best in category" />
      )}
    </span>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        scoreBg(value),
        scoreColor(value)
      )}
    >
      {rounded.toFixed(1)}
    </span>
  );
}

function ToolLogo({ tool }: { tool: Tool }) {
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
      style={{ backgroundColor: tool.color }}
      aria-hidden="true"
    >
      {tool.name.charAt(0)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  ComparisonTable                                                           */
/* -------------------------------------------------------------------------- */

function ComparisonTable({
  tools,
  features,
  sortKey,
  onSort,
}: {
  tools: Tool[];
  features: Feature[];
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
}) {
  const winners = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const f of features) {
      map[f.id] = featureWinner(f.id, tools);
    }
    return map;
  }, [tools, features]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[700px] border-collapse text-sm" role="grid">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            {/* Sticky tool column header */}
            <th
              scope="col"
              className="sticky left-0 z-20 min-w-[180px] bg-gray-50/80 px-4 py-3 text-left font-semibold text-gray-700 backdrop-blur-sm"
            >
              <button
                onClick={() => onSort("overall")}
                className="inline-flex items-center gap-1 hover:text-gray-900"
                aria-label="Sort by overall score"
              >
                Tool
                <ArrowUpDown
                  className={cn(
                    "h-3.5 w-3.5",
                    sortKey === "overall" ? "text-gray-900" : "text-gray-400"
                  )}
                />
              </button>
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center font-semibold text-gray-700"
            >
              Score
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-center font-semibold text-gray-700"
            >
              Price
            </th>
            {features.map((feature) => (
              <th
                key={feature.id}
                scope="col"
                className="px-3 py-3 text-center font-semibold text-gray-700"
              >
                <button
                  onClick={() => onSort(feature.id)}
                  className="inline-flex items-center gap-1 hover:text-gray-900"
                  aria-label={`Sort by ${feature.name}`}
                >
                  {feature.name}
                  <ArrowUpDown
                    className={cn(
                      "h-3 w-3",
                      sortKey === feature.id
                        ? "text-gray-900"
                        : "text-gray-400"
                    )}
                  />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tools.map((tool, idx) => (
            <tr
              key={tool.id}
              className={cn(
                "border-b border-gray-100 transition-colors hover:bg-blue-50/40",
                idx === tools.length - 1 && "border-b-0"
              )}
            >
              {/* Sticky tool name cell */}
              <td className="sticky left-0 z-10 bg-white px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ToolLogo tool={tool} />
                  <div>
                    <div className="font-medium text-gray-900">
                      {tool.name}
                    </div>
                    <div className="text-xs text-gray-500">{tool.bestFor}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-center">
                <ScoreBadge value={overallScore(tool)} />
              </td>
              <td className="px-3 py-3 text-center text-xs font-medium text-gray-600">
                {tool.price}
              </td>
              {features.map((feature) => {
                const score = tool.scores.find(
                  (s) => s.featureId === feature.id
                );
                const value = score?.value ?? 0;
                const isWinner = winners[feature.id] === tool.id;
                return (
                  <td key={feature.id} className="px-3 py-3 text-center">
                    <ScoreCell value={value} isWinner={isWinner} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ToolCard                                                                  */
/* -------------------------------------------------------------------------- */

function ToolCard({ tool, features }: { tool: Tool; features: Feature[] }) {
  const overall = overallScore(tool);
  const pct = (overall / 5) * 100;

  // Top 3 strongest features
  const topFeatures = [...tool.scores]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ToolLogo tool={tool} />
          <div>
            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-xs text-gray-500">{tool.tagline}</p>
          </div>
        </div>
        <ScoreBadge value={overall} />
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>Overall Score</span>
          <span className={cn("font-semibold", scoreColor(overall))}>
            {(Math.round(overall * 10) / 10).toFixed(1)} / 5.0
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full rounded-full transition-all", scoreBarColor(overall))}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={overall}
            aria-valuemin={0}
            aria-valuemax={5}
          />
        </div>
      </div>

      {/* Best for tag */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          <Trophy className="h-3 w-3" />
          Best for: {tool.bestFor}
        </span>
      </div>

      {/* Price */}
      <div className="mb-4 text-sm font-medium text-gray-700">
        {tool.price}
      </div>

      {/* Top features */}
      <div className="mt-auto border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Top Features
        </p>
        <ul className="space-y-1.5">
          {topFeatures.map((s) => {
            const feature = features.find((f) => f.id === s.featureId);
            if (!feature) return null;
            return (
              <li
                key={s.featureId}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {feature.name}
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < s.value ? scoreColor(s.value) : "text-gray-200"
                      )}
                      fill={i < s.value ? "currentColor" : "none"}
                    />
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function SaasComparisonPage() {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("overall");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortAsc((prev) => !prev);
      } else {
        setSortKey(key);
        setSortAsc(false); // default descending (best first)
      }
    },
    [sortKey]
  );

  // Filter features by category
  const filteredFeatures = useMemo(() => {
    if (category === "All") return FEATURES;
    return FEATURES.filter((f) => f.category === category);
  }, [category]);

  // Filter tools by search, then sort
  const filteredTools = useMemo(() => {
    let result = TOOLS;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.bestFor.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortKey === "overall") {
        aVal = overallScore(a);
        bVal = overallScore(b);
      } else {
        aVal =
          a.scores.find((s) => s.featureId === sortKey)?.value ?? 0;
        bVal =
          b.scores.find((s) => s.featureId === sortKey)?.value ?? 0;
      }

      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [search, sortKey, sortAsc]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Find the Right Tool
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-500">
            Compare project management tools side by side. Scores based on
            features, pricing, and real-world usage.
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Category dropdown */}
          <div className="relative">
            <label htmlFor="category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Search input */}
          <div className="relative flex-1 sm:max-w-xs">
            <label htmlFor="tool-search" className="sr-only">
              Search tools
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="tool-search"
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 shadow-sm transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <Search className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No tools match your search.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        ) : view === "table" ? (
          <ComparisonTable
            tools={filteredTools}
            features={filteredFeatures}
            sortKey={sortKey}
            onSort={handleSort}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                features={FEATURES}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" />
            4-5: Excellent
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
            3: Average
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-red-400" fill="currentColor" />
            1-2: Weak
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Category Winner
          </span>
        </div>
      </main>
    </div>
  );
}
