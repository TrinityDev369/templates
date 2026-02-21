"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types";

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
}

const jobTypes = [
  { value: "", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (onSearch) {
      onSearch({ query, location, type, level: "" });
      return;
    }

    // Navigate to /jobs with query params when no onSearch callback provided
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-gray-200/60 ring-1 ring-gray-100 sm:flex-row sm:items-center sm:gap-0 sm:p-2",
        className
      )}
    >
      {/* Keyword input */}
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
        <input
          type="text"
          name="q"
          placeholder="Job title or keyword"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full rounded-xl bg-gray-50 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:bg-gray-100 sm:rounded-lg sm:bg-transparent sm:focus:bg-gray-50"
        />
      </div>

      {/* Divider (desktop) */}
      <div className="hidden h-8 w-px bg-gray-200 sm:block" />

      {/* Location input */}
      <div className="relative flex flex-1 items-center">
        <MapPin className="absolute left-3 h-4.5 w-4.5 text-gray-400" />
        <input
          type="text"
          name="location"
          placeholder="City or remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-11 w-full rounded-xl bg-gray-50 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:bg-gray-100 sm:rounded-lg sm:bg-transparent sm:focus:bg-gray-50"
        />
      </div>

      {/* Divider (desktop) */}
      <div className="hidden h-8 w-px bg-gray-200 sm:block" />

      {/* Job type dropdown */}
      <div className="relative flex items-center sm:w-40">
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl bg-gray-50 pl-3 pr-9 text-sm text-gray-900 outline-none transition-colors focus:bg-gray-100 sm:rounded-lg sm:bg-transparent sm:focus:bg-gray-50"
        >
          {jobTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:ml-1 sm:shrink-0"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
}
