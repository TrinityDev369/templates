import { notFound } from "next/navigation";
import sql from "@/lib/db";
import PostCard from "@/components/post-card";
import FollowButton from "@/components/follow-button";
import type { User, PostWithAuthor } from "@/types";

// TODO: replace with your auth provider
const userId = 1;

export const dynamic = "force-dynamic";

async function getUser(username: string): Promise<User | null> {
  const rows = await sql<User[]>`
    SELECT * FROM users WHERE username = ${username}
  `;
  return rows[0] ?? null;
}

async function getProfileStats(profileUserId: number) {
  const [followers] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM follows WHERE following_id = ${profileUserId}
  `;
  const [following] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM follows WHERE follower_id = ${profileUserId}
  `;
  const [posts] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM posts WHERE author_id = ${profileUserId}
  `;
  return {
    follower_count: followers.count,
    following_count: following.count,
    post_count: posts.count,
  };
}

async function getUserPosts(profileUserId: number): Promise<PostWithAuthor[]> {
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
    WHERE p.author_id = ${profileUserId}
    ORDER BY p.created_at DESC
  `;
}

async function isFollowing(profileUserId: number): Promise<boolean> {
  const rows = await sql`
    SELECT id FROM follows
    WHERE follower_id = ${userId} AND following_id = ${profileUserId}
  `;
  return rows.length > 0;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) notFound();

  const [stats, posts, following] = await Promise.all([
    getProfileStats(user.id),
    getUserPosts(user.id),
    isFollowing(user.id),
  ]);

  const isOwnProfile = user.id === userId;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
            {user.display_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.display_name}</h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>
              {!isOwnProfile && (
                <FollowButton userId={user.id} isFollowing={following} />
              )}
            </div>
            {user.bio && <p className="mt-3 text-gray-700">{user.bio}</p>}
            <div className="mt-4 flex gap-6">
              <div className="text-center">
                <span className="block text-lg font-bold">
                  {stats.post_count}
                </span>
                <span className="text-sm text-gray-500">Posts</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold">
                  {stats.follower_count}
                </span>
                <span className="text-sm text-gray-500">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold">
                  {stats.following_count}
                </span>
                <span className="text-sm text-gray-500">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
