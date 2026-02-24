import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    const bookings = await sql`
      SELECT
        b.id,
        b.slot_id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.notes,
        b.status,
        b.created_at::text,
        s.date::text,
        s.start_time::text,
        s.end_time::text
      FROM bookings b
      JOIN slots s ON s.id = b.slot_id
      WHERE b.status = 'confirmed'
        AND s.date >= CURRENT_DATE
      ORDER BY s.date ASC, s.start_time ASC
    `;

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();

    const { slot_id, customer_name, customer_email, customer_phone, notes } =
      body;

    // Validate required fields
    if (!slot_id || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: "slot_id, customer_name, and customer_email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check slot exists and is available
    const [slot] = await sql`
      SELECT s.id, s.date::text, s.start_time::text, s.end_time::text, s.is_available
      FROM slots s
      WHERE s.id = ${slot_id}
        AND s.is_available = true
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.slot_id = s.id AND b.status = 'confirmed'
        )
    `;

    if (!slot) {
      return NextResponse.json(
        { error: "Selected time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create the booking
    const [booking] = await sql`
      INSERT INTO bookings (slot_id, customer_name, customer_email, customer_phone, notes)
      VALUES (${slot_id}, ${customer_name}, ${customer_email}, ${customer_phone || ""}, ${notes || null})
      RETURNING
        id,
        slot_id,
        customer_name,
        customer_email,
        customer_phone,
        notes,
        status,
        created_at::text
    `;

    return NextResponse.json(
      {
        booking: {
          ...booking,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle unique constraint violation (double-booking)
    if (
      error instanceof Error &&
      error.message.includes("unique_booking_per_slot")
    ) {
      return NextResponse.json(
        { error: "This time slot has already been booked" },
        { status: 409 }
      );
    }

    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
