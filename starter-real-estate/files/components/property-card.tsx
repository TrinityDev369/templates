import Link from "next/link";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import { cn, formatPrice, formatArea } from "@/lib/utils";
import type { Property } from "@/types";

const statusLabels: Record<Property["status"], string> = {
  "for-sale": "For Sale",
  "for-rent": "For Rent",
  sold: "Sold",
};

const statusColors: Record<Property["status"], string> = {
  "for-sale": "bg-brand-600 text-white",
  "for-rent": "bg-blue-600 text-white",
  sold: "bg-gray-700 text-white",
};

const typeLabels: Record<Property["type"], string> = {
  house: "House",
  apartment: "Apartment",
  condo: "Condo",
  townhouse: "Townhouse",
};

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        {property.images[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Maximize className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-white/95 px-3 py-1.5 text-lg font-bold text-gray-900 shadow-sm backdrop-blur-sm">
            {formatPrice(property.price)}
            {property.status === "for-rent" && (
              <span className="text-sm font-normal text-gray-500">/mo</span>
            )}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
              statusColors[property.status]
            )}
          >
            {statusLabels[property.status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Type Tag */}
        <span className="mb-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          {typeLabels[property.type]}
        </span>

        {/* Title */}
        <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-700">
          {property.title}
        </h3>

        {/* Address */}
        <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {property.address}, {property.city}, {property.state}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Bed className="h-4 w-4 text-gray-400" />
            <span>
              {property.bedrooms} <span className="hidden sm:inline">Beds</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Bath className="h-4 w-4 text-gray-400" />
            <span>
              {property.bathrooms} <span className="hidden sm:inline">Baths</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Maximize className="h-4 w-4 text-gray-400" />
            <span>{formatArea(property.sqft)} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
