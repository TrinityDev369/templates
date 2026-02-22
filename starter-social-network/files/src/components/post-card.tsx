"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostWithAuthor } from "@/types";

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function PostCard({ post }: { post: PostWithAuthor }) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
          {post.author_display_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.author_username}`}
              className="font-semibold hover:underline"
            >
              {post.author_display_name}
            </Link>
            <Link
              href={`/profile/${post.author_username}`}
              className="text-sm text-gray-500"
            >
              @{post.author_username}
            </Link>
            <span className="text-sm text-gray-400">
              {timeAgo(post.created_at)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-gray-800">
            {post.content}
          </p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className="mt-3 max-h-96 rounded-lg object-cover"
            />
          )}
          <div className="mt-3 flex items-center gap-6">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 text-sm ${
                liked
                  ? "font-semibold text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              {liked ? "\u2665" : "\u2661"} {likeCount}
            </button>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              \uD83D\uDCAC {post.comment_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
