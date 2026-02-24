"use client";

import { Shield, FileCheck, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ComplianceBadge {
  name: string;
  shortName: string;
  description: string;
  icon: "shield" | "fileCheck" | "globe" | "lock";
  status: "certified" | "in-progress" | "planned";
}

/* ------------------------------------------------------------------ */
/* Icon mapping                                                        */
/* ------------------------------------------------------------------ */

const iconMap = {
  shield: Shield,
  fileCheck: FileCheck,
  globe: Globe,
  lock: Lock,
} as const;

const statusConfig: Record<
  ComplianceBadge["status"],
  { label: string; badgeClass: string; dotClass: string }
> = {
  certified: {
    label: "Certified",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  "in-progress": {
    label: "In Progress",
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  planned: {
    label: "Planned",
    badgeClass:
      "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dotClass: "bg-gray-400",
  },
};

/* ------------------------------------------------------------------ */
/* ComplianceBadges                                                    */
/* ------------------------------------------------------------------ */

interface ComplianceBadgesProps {
  badges: ComplianceBadge[];
  className?: string;
}

export function ComplianceBadges({ badges, className }: ComplianceBadgesProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {badges.map((badge) => {
        const Icon = iconMap[badge.icon];
        const status = statusConfig[badge.status];

        return (
          <div
            key={badge.shortName}
            className={cn(
              "group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
              "transition-all hover:shadow-md hover:border-emerald-200",
              "dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-800"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg",
                "bg-emerald-50 dark:bg-emerald-900/20"
              )}
            >
              <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Name & short name */}
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">
              {badge.shortName}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-500">
              {badge.name}
            </p>

            {/* Description */}
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {badge.description}
            </p>

            {/* Status badge */}
            <div className="mt-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  status.badgeClass
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", status.dotClass)}
                />
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
