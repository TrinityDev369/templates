"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { PropertyFilters } from "@/components/property-filters";
import { properties } from "@/lib/data";
import type { SearchFilters } from "@/types";

export default function PropertiesPage() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "",
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    bathrooms: 0,
  });

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.type) {
        const types = filters.type.split(",").filter(Boolean);
        if (types.length > 0 && !types.includes(p.type)) return false;
      }
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.bedrooms && p.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms && p.bathrooms < filters.bathrooms) return false;
      return true;
    });
  }, [filters]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            All Properties
          </h1>
          <p className="mt-2 text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {properties.length}
            </span>{" "}
            properties
          </p>
        </div>

        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 sm:self-start"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters + Grid */}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {filtersOpen && (
          <aside className="w-full shrink-0 lg:w-72">
            <PropertyFilters onFilter={setFilters} />
          </aside>
        )}

        {/* Property Grid */}
        <div className="flex-1">
          {filtered.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-gray-900">
                No properties match your filters
              </p>
              <p className="mt-2 text-gray-500">
                Try adjusting your search criteria or clear all filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
