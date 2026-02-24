import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface AppFeaturesProps {
  features: Feature[];
}

/* ------------------------------------------------------------------ */
/* Feature card                                                         */
/* ------------------------------------------------------------------ */
function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-gray-200 bg-white p-6",
        "shadow-sm transition-all hover:shadow-md hover:border-gray-300",
        "dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
          feature.color
        )}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {feature.description}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exported component                                                   */
/* ------------------------------------------------------------------ */
export function AppFeatures({ features }: AppFeaturesProps) {
  return (
    <section className="bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Everything you need, right in your pocket
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Packed with powerful features designed to make your life easier and
            more productive.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
