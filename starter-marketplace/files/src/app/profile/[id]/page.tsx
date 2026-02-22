import Link from "next/link";
import { notFound } from "next/navigation";
import sql from "@/lib/db";
import { ListingCard } from "@/components/listing-card";
import type { User, ListingWithSeller } from "@/types";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    notFound();
  }

  const users = await sql<User[]>`
    SELECT * FROM users WHERE id = ${userId}
  `;

  if (users.length === 0) {
    notFound();
  }

  const user = users[0];

  const listings = await sql<ListingWithSeller[]>`
    SELECT
      l.*,
      u.name AS seller_name,
      c.name AS category_name
    FROM listings l
    JOIN users u ON u.id = l.seller_id
    JOIN categories c ON c.id = l.category_id
    WHERE l.seller_id = ${userId} AND l.status = 'active'
    ORDER BY l.created_at DESC
  `;

  return (
    <div>
      <Link
        href="/"
        className="text-blue-600 hover:underline text-sm mb-6 inline-block"
      >
        &larr; Back to listings
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {user.bio && (
              <p className="text-gray-600 mt-1">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Listings by {user.name}
      </h2>

      {listings.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          This seller has no active listings.
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
