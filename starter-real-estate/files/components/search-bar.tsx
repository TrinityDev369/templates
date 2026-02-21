"use client";

import { useState } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types";

const propertyTypes = [
  { value: "", label: "All Types" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
];

const priceOptions = [
  { value: 0, label: "No Min" },
  { value: 100000, label: "$100k" },
  { value: 250000, label: "$250k" },
  { value: 500000, label: "$500k" },
  { value: 750000, label: "$750k" },
  { value: 1000000, label: "$1M" },
  { value: 1500000, label: "$1.5M" },
  { value: 2000000, label: "$2M" },
];

const maxPriceOptions = [
  ...priceOptions.slice(1),
  { value: 0, label: "No Max" },
];

const bedroomOptions = [
  { value: 0, label: "Any Beds" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.({
      query,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms: 0,
    });
  }

  const selectClasses =
    "h-full w-full appearance-none border-0 bg-transparent py-3 pl-3 pr-8 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:divide-x lg:divide-gray-200">
        {/* Location Input */}
        <div className="relative flex-1 min-w-0">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, neighborhood, or address..."
            className="h-full w-full border-0 bg-transparent py-4 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 lg:py-3"
          />
        </div>

        {/* Property Type */}
        <div className="relative border-t border-gray-200 lg:border-t-0">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={selectClasses}
          >
            {propertyTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Min Price */}
        <div className="relative border-t border-gray-200 lg:border-t-0">
          <select
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className={selectClasses}
          >
            {priceOptions.map((opt) => (
              <option key={`min-${opt.value}`} value={opt.value}>
                {opt.value === 0 ? "Min Price" : opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Max Price */}
        <div className="relative border-t border-gray-200 lg:border-t-0">
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className={selectClasses}
          >
            {maxPriceOptions.map((opt) => (
              <option key={`max-${opt.value}`} value={opt.value}>
                {opt.value === 0 ? "Max Price" : opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Bedrooms */}
        <div className="relative border-t border-gray-200 lg:border-t-0">
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value))}
            className={selectClasses}
          >
            {bedroomOptions.map((opt) => (
              <option key={`bed-${opt.value}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Search Button */}
        <div className="border-t border-gray-200 p-2 lg:border-t-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:w-auto"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
