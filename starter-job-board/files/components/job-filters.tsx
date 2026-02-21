"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
  onFilter: (filters: {
    types: string[];
    levels: string[];
    minSalary: number;
  }) => void;
}

const jobTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

const levels = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const salaryOptions = [
  { value: 0, label: "Any" },
  { value: 30000, label: "$30k+" },
  { value: 50000, label: "$50k+" },
  { value: 75000, label: "$75k+" },
  { value: 100000, label: "$100k+" },
  { value: 150000, label: "$150k+" },
];

export function JobFilters({ onFilter }: JobFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(0);

  function toggleValue(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  function handleApply() {
    onFilter({
      types: selectedTypes,
      levels: selectedLevels,
      minSalary,
    });
  }

  function handleClear() {
    setSelectedTypes([]);
    setSelectedLevels([]);
    setMinSalary(0);
    onFilter({ types: [], levels: [], minSalary: 0 });
  }

  return (
    <aside className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          Clear all
        </button>
      </div>

      {/* Job Type */}
      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Job Type
        </legend>
        <div className="mt-2.5 space-y-2">
          {jobTypes.map((t) => (
            <label
              key={t.value}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(t.value)}
                onChange={() =>
                  setSelectedTypes(toggleValue(selectedTypes, t.value))
                }
                className={cn(
                  "h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                )}
              />
              <span className="text-sm text-gray-700">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Level */}
      <fieldset className="mt-6">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Level
        </legend>
        <div className="mt-2.5 space-y-2">
          {levels.map((l) => (
            <label
              key={l.value}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                checked={selectedLevels.includes(l.value)}
                onChange={() =>
                  setSelectedLevels(toggleValue(selectedLevels, l.value))
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Salary Range */}
      <fieldset className="mt-6">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Minimum Salary
        </legend>
        <select
          value={minSalary}
          onChange={(e) => setMinSalary(Number(e.target.value))}
          className="mt-2.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          {salaryOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </fieldset>

      {/* Apply button */}
      <button
        type="button"
        onClick={handleApply}
        className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Apply Filters
      </button>
    </aside>
  );
}
