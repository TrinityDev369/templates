"use client";

import { useEffect, useCallback } from "react";
import { X, MapPin, Briefcase, Clock, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job } from "./job-card";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  /* Close on Escape */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!job) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [job, handleKeyDown]);

  if (!job) return null;

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={job.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl",
          "bg-white shadow-2xl dark:bg-gray-950",
          "border border-gray-200 dark:border-gray-800"
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute right-4 top-4 rounded-full p-1.5",
            "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
            "dark:hover:text-gray-300 dark:hover:bg-gray-800",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          )}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pr-8">
            {job.title}
          </h2>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Building className="h-4 w-4" />
              {job.department}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              {job.type}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Posted {job.postedDate}
            </span>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-200 dark:border-gray-800" />

          {/* Full description */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                About the Role
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {job.fullDescription}
              </p>
            </section>

            {/* Requirements */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Requirements
              </h3>
              <ul className="mt-2 space-y-2">
                {job.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Benefits
              </h3>
              <ul className="mt-2 space-y-2">
                {job.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Apply CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Interested in this role? We would love to hear from you.
            </p>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium",
                "bg-blue-600 text-white shadow-sm",
                "hover:bg-blue-700 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              )}
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
