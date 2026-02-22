import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const enrollmentId = parseInt(formData.get("enrollmentId") as string, 10);
    const lessonId = parseInt(formData.get("lessonId") as string, 10);
    const courseId = parseInt(formData.get("courseId") as string, 10);

    if (isNaN(enrollmentId) || isNaN(lessonId)) {
      return NextResponse.json(
        { error: "Invalid enrollment or lesson ID" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO lesson_progress (enrollment_id, lesson_id)
      VALUES (${enrollmentId}, ${lessonId})
      ON CONFLICT (enrollment_id, lesson_id) DO NOTHING
    `;

    // Redirect back to the learn page
    if (!isNaN(courseId)) {
      return NextResponse.redirect(
        new URL(`/courses/${courseId}/learn`, request.url),
        303
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
