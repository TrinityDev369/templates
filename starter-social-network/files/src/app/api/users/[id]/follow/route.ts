import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// TODO: replace with your auth provider
const userId = 1;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existing = await sql`
      SELECT id FROM follows
      WHERE follower_id = ${userId} AND following_id = ${targetUserId}
    `;

    if (existing.length > 0) {
      // Unfollow
      await sql`
        DELETE FROM follows
        WHERE follower_id = ${userId} AND following_id = ${targetUserId}
      `;
    } else {
      // Follow
      await sql`
        INSERT INTO follows (follower_id, following_id)
        VALUES (${userId}, ${targetUserId})
      `;
    }

    return NextResponse.json({
      following: existing.length === 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
