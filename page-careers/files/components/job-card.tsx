"use client";

import { MapPin, Briefcase, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shape of a single job listing. */
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  postedDate: string;
  shortDescription: string;
  fullDescription: string;
  requirements: string[];
  benefits: string[];
  applyUrl: string;
}

/* ------------------------------------------------------------------ */
/* Department color map                                                */
/* ------------------------------------------------------------------ */
const departmentColors: Record<string, string> = {
  Engineering:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Design:
    "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Marketing:
    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Sales:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Operations:
    "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  Product:
    "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const typeColors: Record<string, string> = {
  "Full-time":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Part-time":
    "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Contract:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Remote:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const deptColor =
    departmentColors[job.department] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  const typeColor =
    typeColors[job.type] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <button
      type="button"
      onClick={() => onSelect(job)}
      className={cn(
        "group w-full text-left rounded-xl border border-gray-200 bg-white p-6",
        "shadow-sm transition-all hover:shadow-md hover:border-gray-300",
        "dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400 transition-colors">
            {job.title}
          </h3>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                deptColor
              )}
            >
              {job.department}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                typeColor
              )}
            >
              {job.type}
            </span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {job.shortDescription}
      </p>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          {job.department}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {job.postedDate}
        </span>
      </div>
    </button>
  );
}
