import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// TODO: replace with your auth provider
const userId = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const [post] = await sql`
      INSERT INTO posts (author_id, content)
      VALUES (${userId}, ${content.trim()})
      RETURNING id, author_id, content, image_url, created_at
    `;

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
