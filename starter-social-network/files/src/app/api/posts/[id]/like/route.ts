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
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check if already liked
    const existing = await sql`
      SELECT id FROM likes WHERE user_id = ${userId} AND post_id = ${postId}
    `;

    if (existing.length > 0) {
      // Unlike
      await sql`
        DELETE FROM likes WHERE user_id = ${userId} AND post_id = ${postId}
      `;
    } else {
      // Like
      await sql`
        INSERT INTO likes (user_id, post_id) VALUES (${userId}, ${postId})
      `;
    }

    const [result] = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM likes WHERE post_id = ${postId}
    `;

    return NextResponse.json({
      liked: existing.length === 0,
      count: result.count,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
