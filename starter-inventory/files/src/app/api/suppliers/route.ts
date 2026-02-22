import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, contact_email, contact_phone, address } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [supplier] = await sql`
      INSERT INTO suppliers (name, contact_email, contact_phone, address)
      VALUES (${name}, ${contact_email ?? null}, ${contact_phone ?? null}, ${address ?? null})
      RETURNING *
    `;

    return NextResponse.json(supplier, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
