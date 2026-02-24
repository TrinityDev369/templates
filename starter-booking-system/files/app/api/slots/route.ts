import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // If a specific date is provided, return time slots for that date
    if (date) {
      const slots = await sql`
        SELECT
          s.id,
          s.date::text,
          s.start_time::text,
          s.end_time::text,
          CASE
            WHEN b.id IS NOT NULL THEN false
            ELSE s.is_available
          END AS is_available
        FROM slots s
        LEFT JOIN bookings b ON b.slot_id = s.id AND b.status = 'confirmed'
        WHERE s.date = ${date}
        ORDER BY s.start_time
      `;
      return NextResponse.json({ slots });
    }

    // If month/year provided, return dates with available slots
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const slots = await sql`
        SELECT
          s.date::text,
          COUNT(*) FILTER (
            WHERE s.is_available = true
            AND NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.slot_id = s.id AND b.status = 'confirmed'
            )
          )::int AS available_count
        FROM slots s
        WHERE s.date >= ${startDate}::date
          AND s.date < (${startDate}::date + INTERVAL '1 month')
        GROUP BY s.date
        ORDER BY s.date
      `;
      return NextResponse.json({ slots });
    }

    // Default: return available dates for the next 60 days
    const slots = await sql`
      SELECT
        s.date::text,
        COUNT(*) FILTER (
          WHERE s.is_available = true
          AND NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.slot_id = s.id AND b.status = 'confirmed'
          )
        )::int AS available_count
      FROM slots s
      WHERE s.date >= CURRENT_DATE
        AND s.date <= CURRENT_DATE + INTERVAL '60 days'
      GROUP BY s.date
      ORDER BY s.date
    `;
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
