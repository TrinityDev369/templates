import Link from "next/link";
import sql from "@/lib/db";
import { ListingCard } from "@/components/listing-card";
import type { ListingWithSeller, Category } from "@/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;

  const categories = await sql<Category[]>`
    SELECT id, name, slug FROM categories ORDER BY name
  `;

  let listings: ListingWithSeller[];

  if (categorySlug) {
    listings = await sql<ListingWithSeller[]>`
      SELECT
        l.*,
        u.name AS seller_name,
        c.name AS category_name
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      JOIN categories c ON c.id = l.category_id
      WHERE l.status = 'active' AND c.slug = ${categorySlug}
      ORDER BY l.created_at DESC
    `;
  } else {
    listings = await sql<ListingWithSeller[]>`
      SELECT
        l.*,
        u.name AS seller_name,
        c.name AS category_name
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      JOIN categories c ON c.id = l.category_id
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
    `;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Browse Listings
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categorySlug
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categorySlug === cat.slug
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No listings found. Be the first to{" "}
          <Link href="/sell" className="text-blue-600 hover:underline">
            create one
          </Link>
          !
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
