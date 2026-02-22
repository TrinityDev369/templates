import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// TODO: replace with your auth provider
const userId = 1;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const courseId = parseInt(formData.get("courseId") as string, 10);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const [existing] = await sql`
      SELECT id FROM enrollments
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `;

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO enrollments (user_id, course_id)
      VALUES (${userId}, ${courseId})
    `;

    // Redirect back to the course page
    return NextResponse.redirect(
      new URL(`/courses/${courseId}`, request.url),
      303
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll" },
      { status: 500 }
    );
  }
}
