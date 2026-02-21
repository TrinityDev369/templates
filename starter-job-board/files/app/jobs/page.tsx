"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { jobs } from "@/lib/data";

interface ActiveFilters {
  query: string;
  types: string[];
  levels: string[];
  minSalary: number;
}

export default function JobsPage() {
  const [filters, setFilters] = useState<ActiveFilters>({
    query: "",
    types: [],
    levels: [],
    minSalary: 0,
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (
        filters.query &&
        !job.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !job.company.name.toLowerCase().includes(filters.query.toLowerCase()) &&
        !job.tags.some((tag) =>
          tag.toLowerCase().includes(filters.query.toLowerCase())
        )
      ) {
        return false;
      }
      if (filters.types.length > 0 && !filters.types.includes(job.type))
        return false;
      if (filters.levels.length > 0 && !filters.levels.includes(job.level))
        return false;
      if (filters.minSalary > 0 && job.salary.min < filters.minSalary)
        return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-72 flex-shrink-0">
          <JobFilters
            onFilter={(f) =>
              setFilters((prev) => ({
                ...prev,
                types: f.types,
                levels: f.levels,
                minSalary: f.minSalary,
              }))
            }
          />
        </aside>

        {/* Job Listings */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or tag..."
              value={filters.query}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, query: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
