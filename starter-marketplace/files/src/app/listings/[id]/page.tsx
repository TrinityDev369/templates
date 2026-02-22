import Link from "next/link";
import { notFound } from "next/navigation";
import sql from "@/lib/db";
import type { ListingWithSeller } from "@/types";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = parseInt(id, 10);

  if (isNaN(listingId)) {
    notFound();
  }

  const rows = await sql<ListingWithSeller[]>`
    SELECT
      l.*,
      u.name AS seller_name,
      c.name AS category_name
    FROM listings l
    JOIN users u ON u.id = l.seller_id
    JOIN categories c ON c.id = l.category_id
    WHERE l.id = ${listingId}
  `;

  if (rows.length === 0) {
    notFound();
  }

  const listing = rows[0];

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(listing.price));

  return (
    <div>
      <Link
        href="/"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to listings
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full md:w-1/2 h-64 md:h-auto object-cover"
            />
          ) : (
            <div className="w-full md:w-1/2 h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          <div className="p-6 md:w-1/2">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {listing.title}
              </h1>
              <span className="text-2xl font-bold text-green-600 ml-4 whitespace-nowrap">
                {formattedPrice}
              </span>
            </div>

            <span className="inline-block bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full mb-4">
              {listing.category_name}
            </span>

            <p className="text-gray-700 mb-6 whitespace-pre-wrap">
              {listing.description || "No description provided."}
            </p>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Sold by{" "}
                <Link
                  href={`/profile/${listing.seller_id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {listing.seller_name}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Seller
        </h2>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="I'm interested in this listing..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
