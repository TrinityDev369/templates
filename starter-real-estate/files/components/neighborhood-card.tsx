import { Home, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Neighborhood } from "@/types";

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
}

export function NeighborhoodCard({ neighborhood }: NeighborhoodCardProps) {
  return (
    <div className="group relative block overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-200 transition-shadow duration-300 hover:shadow-lg">
      {/* Image with Zoom Effect */}
      <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/3]">
        {neighborhood.image ? (
          <img
            src={neighborhood.image}
            alt={neighborhood.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-200 to-brand-400" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur-sm">
            <Home className="h-3 w-3" />
            {neighborhood.propertyCount} Properties
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            <TrendingUp className="h-3 w-3" />
            Avg {formatPrice(neighborhood.avgPrice)}
          </span>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-sm">
            {neighborhood.name}
          </h3>
          {neighborhood.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-200">
              {neighborhood.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
