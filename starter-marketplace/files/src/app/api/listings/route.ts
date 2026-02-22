import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, category_id, image_url } = body;

    if (!title || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    // TODO: replace with your auth provider
    const userId = 1;

    const rows = await sql`
      INSERT INTO listings (title, description, price, category_id, seller_id, image_url)
      VALUES (${title}, ${description || null}, ${price}, ${category_id || null}, ${userId}, ${image_url || null})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("Failed to create listing:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
