import Link from "next/link";
import { MapPin, Clock, DollarSign, Star } from "lucide-react";
import { cn, formatSalary, timeAgo } from "@/lib/utils";
import type { Job } from "@/types";

const typeBadgeStyles: Record<Job["type"], string> = {
  "full-time": "bg-emerald-50 text-emerald-700",
  "part-time": "bg-blue-50 text-blue-700",
  contract: "bg-orange-50 text-orange-700",
  remote: "bg-purple-50 text-purple-700",
};

const typeLabels: Record<Job["type"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
};

const levelLabels: Record<Job["level"], string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group block rounded-xl border bg-white p-5 transition-all hover:shadow-md",
        job.featured
          ? "border-l-4 border-l-brand-500 border-t-gray-100 border-r-gray-100 border-b-gray-100"
          : "border-gray-100"
      )}
    >
      <div className="flex gap-4">
        {/* Company logo placeholder */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-400">
          {job.company.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header row: company info + featured badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-500">
                {job.company.name}
              </p>
              <h3 className="mt-0.5 truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
                {job.title}
              </h3>
            </div>
            {job.featured && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                <Star className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                typeBadgeStyles[job.type]
              )}
            >
              {typeLabels[job.type]}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {levelLabels[job.level]}
            </span>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatSalary(job.salary.min, job.salary.max)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(job.postedAt)}
            </span>
          </div>

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className="inline-flex items-center px-1 text-xs text-gray-400">
                  +{job.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
