"use client";

import { useState } from "react";

export default function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
}: {
  userId: number;
  isFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        following
          ? "border border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } disabled:opacity-50`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
