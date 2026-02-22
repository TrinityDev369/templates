import Link from "next/link";
import type { ListingWithSeller } from "@/types";

export function ListingCard({ listing }: { listing: ListingWithSeller }) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(listing.price));

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {listing.image_url ? (
        <img
          src={listing.image_url}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {listing.title}
          </h3>
          <span className="text-lg font-bold text-green-600 ml-2 whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {listing.category_name}
          </span>
          <span className="text-sm text-gray-500">{listing.seller_name}</span>
        </div>
      </div>
    </Link>
  );
}
