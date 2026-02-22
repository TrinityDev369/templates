import Link from "next/link";
import sql from "@/lib/db";
import { ProgressBar } from "@/components/progress-bar";
import type { CourseWithProgress } from "@/types";

// TODO: replace with your auth provider
const userId = 1;

export default async function DashboardPage() {
  const enrolledCourses = await sql<
    (CourseWithProgress & { enrollment_id: number })[]
  >`
    SELECT
      c.*,
      e.id AS enrollment_id,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id)::int AS total_lessons,
      (
        SELECT COUNT(*)
        FROM lesson_progress lp
        JOIN lessons l ON l.id = lp.lesson_id
        WHERE lp.enrollment_id = e.id AND l.course_id = c.id
      )::int AS completed_lessons
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.user_id = ${userId}
    ORDER BY e.enrolled_at DESC
  `;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
      <p className="text-gray-600 mb-8">
        {enrolledCourses.length}{" "}
        {enrolledCourses.length === 1 ? "course" : "courses"} enrolled
      </p>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrolledCourses.map((course) => {
            const progressPct =
              course.total_lessons > 0
                ? (course.completed_lessons / course.total_lessons) * 100
                : 0;
            const isComplete =
              course.total_lessons > 0 &&
              course.completed_lessons === course.total_lessons;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}/learn`}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {course.completed_lessons} of {course.total_lessons}{" "}
                      lessons completed
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {isComplete ? "Completed" : "In Progress"}
                  </span>
                </div>
                <ProgressBar value={progressPct} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
