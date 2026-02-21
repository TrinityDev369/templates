"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types";

const propertyTypes = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
];

const priceOptions = [
  { value: 0, label: "Any" },
  { value: 100000, label: "$100k" },
  { value: 250000, label: "$250k" },
  { value: 500000, label: "$500k" },
  { value: 750000, label: "$750k" },
  { value: 1000000, label: "$1M" },
  { value: 1500000, label: "$1.5M" },
  { value: 2000000, label: "$2M" },
];

const bedroomOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

const bathroomOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

interface PropertyFiltersProps {
  onFilter: (filters: SearchFilters) => void;
}

export function PropertyFilters({ onFilter }: PropertyFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);

  function toggleType(value: string) {
    setSelectedTypes((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value]
    );
  }

  function handleApply() {
    onFilter({
      query: "",
      type: selectedTypes.join(","),
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
    });
  }

  function handleClear() {
    setSelectedTypes([]);
    setMinPrice(0);
    setMaxPrice(0);
    setBedrooms(0);
    setBathrooms(0);
    onFilter({
      query: "",
      type: "",
      minPrice: 0,
      maxPrice: 0,
      bedrooms: 0,
      bathrooms: 0,
    });
  }

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    minPrice > 0 ||
    maxPrice > 0 ||
    bedrooms > 0 ||
    bathrooms > 0;

  const selectClasses =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-red-600"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Property Type */}
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-gray-700">
            Property Type
          </legend>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600">{type.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Price Range */}
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-gray-700">
            Price Range
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Min</label>
              <select
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className={selectClasses}
              >
                {priceOptions.map((opt) => (
                  <option key={`fmin-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Max</label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={selectClasses}
              >
                {priceOptions.map((opt) => (
                  <option key={`fmax-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Bedrooms */}
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-gray-700">
            Bedrooms
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {bedroomOptions.map((opt) => (
              <button
                key={`fbr-${opt.value}`}
                type="button"
                onClick={() => setBedrooms(opt.value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  bedrooms === opt.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Bathrooms */}
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium text-gray-700">
            Bathrooms
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {bathroomOptions.map((opt) => (
              <button
                key={`fba-${opt.value}`}
                type="button"
                onClick={() => setBathrooms(opt.value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  bathrooms === opt.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Apply Button */}
      <button
        type="button"
        onClick={handleApply}
        className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        Apply Filters
      </button>
    </div>
  );
}
