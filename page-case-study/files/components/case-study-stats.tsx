import { cn } from "@/lib/utils";
import { TrendingUp, Target, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface Stat {
  /** The big number, e.g. "150%" or "$2.4M" */
  value: string;
  /** Short label beneath the value */
  label: string;
  /** Optional icon — defaults cycle through TrendingUp, Target, Zap */
  icon?: LucideIcon;
}

export interface CaseStudyStatsProps {
  stats: Stat[];
}

/* -------------------------------------------------------------------------- */
/*  Default icon rotation                                                     */
/* -------------------------------------------------------------------------- */

const DEFAULT_ICONS: LucideIcon[] = [TrendingUp, Target, Zap, TrendingUp];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CaseStudyStats({ stats }: CaseStudyStatsProps) {
  return (
    <section className="relative z-20 -mt-12 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
        <div
          className={cn(
            "grid gap-6 divide-slate-200",
            stats.length === 3 && "grid-cols-1 sm:grid-cols-3 sm:divide-x",
            stats.length === 4 && "grid-cols-2 sm:grid-cols-4 sm:divide-x",
            stats.length !== 3 &&
              stats.length !== 4 &&
              "grid-cols-2 sm:grid-cols-3 sm:divide-x"
          )}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length];
            return (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <Icon className="mb-2 h-5 w-5 text-indigo-500" />
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm font-medium text-slate-500">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
