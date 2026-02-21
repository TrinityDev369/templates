import {
  Code,
  Palette,
  BarChart3,
  Terminal,
  TrendingUp,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { JobCategory } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Engineering: Code,
  Design: Palette,
  "Data Science": BarChart3,
  DevOps: Terminal,
  Marketing: TrendingUp,
  Product: Layers,
};

export function CategoryCard({ category }: { category: JobCategory }) {
  const Icon = iconMap[category.name] ?? Code;

  return (
    <button
      type="button"
      className="group flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 text-center transition-all hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-100">
        <Icon className="h-6 w-6 text-brand-600" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {category.count} {category.count === 1 ? "job" : "jobs"}
      </p>
    </button>
  );
}
