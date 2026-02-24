"use client";

import {
  Lock,
  Key,
  Eye,
  Server,
  Users,
  FileCheck,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SecurityFeature {
  title: string;
  description: string;
  icon:
    | "lock"
    | "key"
    | "eye"
    | "server"
    | "users"
    | "fileCheck"
    | "shield"
    | "alertTriangle";
}

/* ------------------------------------------------------------------ */
/* Icon mapping                                                        */
/* ------------------------------------------------------------------ */

const iconMap = {
  lock: Lock,
  key: Key,
  eye: Eye,
  server: Server,
  users: Users,
  fileCheck: FileCheck,
  shield: Shield,
  alertTriangle: AlertTriangle,
} as const;

/* ------------------------------------------------------------------ */
/* SecurityFeatures                                                    */
/* ------------------------------------------------------------------ */

interface SecurityFeaturesProps {
  features: SecurityFeature[];
  className?: string;
}

export function SecurityFeatures({
  features,
  className,
}: SecurityFeaturesProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {features.map((feature) => {
        const Icon = iconMap[feature.icon];

        return (
          <div
            key={feature.title}
            className={cn(
              "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
              "transition-all hover:shadow-md hover:border-blue-200",
              "dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-800"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                "bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
