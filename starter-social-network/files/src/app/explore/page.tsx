import sql from "@/lib/db";
import PostCard from "@/components/post-card";
import FollowButton from "@/components/follow-button";
import type { PostWithAuthor } from "@/types";
import Link from "next/link";

// TODO: replace with your auth provider
const userId = 1;

export const dynamic = "force-dynamic";

interface UserWithStats {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  is_following: boolean;
}

async function getDiscoverUsers(): Promise<UserWithStats[]> {
  return sql<UserWithStats[]>`
    SELECT
      u.id,
      u.username,
      u.display_name,
      u.avatar_url,
      COALESCE(f.follower_count, 0)::int AS follower_count,
      CASE WHEN mf.id IS NOT NULL THEN true ELSE false END AS is_following
    FROM users u
    LEFT JOIN (
      SELECT following_id, COUNT(*) AS follower_count
      FROM follows GROUP BY following_id
    ) f ON f.following_id = u.id
    LEFT JOIN follows mf ON mf.following_id = u.id AND mf.follower_id = ${userId}
    ORDER BY follower_count DESC
  `;
}

async function getTrendingPosts(): Promise<PostWithAuthor[]> {
  return sql<PostWithAuthor[]>`
    SELECT
      p.id,
      p.author_id,
      p.content,
      p.image_url,
      p.created_at,
      u.username AS author_username,
      u.display_name AS author_display_name,
      u.avatar_url AS author_avatar_url,
      COALESCE(l.like_count, 0)::int AS like_count,
      COALESCE(c.comment_count, 0)::int AS comment_count,
      CASE WHEN ul.id IS NOT NULL THEN true ELSE false END AS user_has_liked
    FROM posts p
    JOIN users u ON u.id = p.author_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id
    ) l ON l.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
    ) c ON c.post_id = p.id
    LEFT JOIN likes ul ON ul.post_id = p.id AND ul.user_id = ${userId}
    WHERE p.created_at > NOW() - INTERVAL '7 days'
    ORDER BY like_count DESC
    LIMIT 10
  `;
}

export default async function ExplorePage() {
  const [users, trending] = await Promise.all([
    getDiscoverUsers(),
    getTrendingPosts(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Discover People</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${user.username}`}
                  className="font-semibold hover:underline"
                >
                  {user.display_name}
                </Link>
                <p className="text-sm text-gray-500">@{user.username}</p>
                <p className="text-xs text-gray-400">
                  {user.follower_count} follower
                  {user.follower_count !== 1 ? "s" : ""}
                </p>
              </div>
              {user.id !== userId && (
                <FollowButton
                  userId={user.id}
                  isFollowing={user.is_following}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Trending Posts</h2>
        {trending.length === 0 ? (
          <p className="text-gray-500">No trending posts this week.</p>
        ) : (
          <div className="space-y-4">
            {trending.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
