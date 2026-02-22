import Link from "next/link";
import sql from "@/lib/db";
import PostCard from "@/components/post-card";
import type { PostWithAuthor } from "@/types";
import NewPostForm from "./new-post-form";

// TODO: replace with your auth provider
const userId = 1;

export const dynamic = "force-dynamic";

async function getFeedPosts(): Promise<PostWithAuthor[]> {
  const posts = await sql<PostWithAuthor[]>`
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
    WHERE p.author_id = ${userId}
      OR p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ${userId})
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
  return posts;
}

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Feed</h1>
      <NewPostForm />
      {posts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            Follow some users to see their posts!
          </p>
          <Link
            href="/explore"
            className="mt-2 inline-block text-indigo-600 hover:underline"
          >
            Discover people to follow
          </Link>
        </div>
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
