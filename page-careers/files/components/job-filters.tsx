"use client";

import { Search, Building, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface JobFilters {
  search: string;
  department: string;
  location: string;
  type: string;
}

interface JobFiltersBarProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  departments: string[];
  locations: string[];
}

/* ------------------------------------------------------------------ */
/* Reusable select wrapper                                             */
/* ------------------------------------------------------------------ */
function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm",
          "text-gray-900 placeholder:text-gray-400",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"];

export function JobFiltersBar({
  filters,
  onChange,
  departments,
  locations,
}: JobFiltersBarProps) {
  function update(patch: Partial<JobFilters>) {
    onChange({ ...filters, ...patch });
  }

  const hasActiveFilters =
    filters.search || filters.department || filters.location || filters.type;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search by title..."
            className={cn(
              "h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm",
              "text-gray-900 placeholder:text-gray-400",
              "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            )}
          />
        </div>

        {/* Department */}
        <FilterSelect
          icon={Building}
          value={filters.department}
          onChange={(v) => update({ department: v })}
          options={departments}
          placeholder="All Departments"
        />

        {/* Location */}
        <FilterSelect
          icon={MapPin}
          value={filters.location}
          onChange={(v) => update({ location: v })}
          options={locations}
          placeholder="All Locations"
        />

        {/* Type */}
        <FilterSelect
          icon={Briefcase}
          value={filters.type}
          onChange={(v) => update({ type: v })}
          options={jobTypes}
          placeholder="All Types"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onChange({ search: "", department: "", location: "", type: "" })
            }
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
