import { notFound } from "next/navigation";
import Link from "next/link";
import sql from "@/lib/db";
import type { Course, Lesson } from "@/types";

// TODO: replace with your auth provider
const userId = 1;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) notFound();

  const [course] = await sql<
    (Course & { instructor_name: string })[]
  >`
    SELECT c.*, u.name AS instructor_name
    FROM courses c
    JOIN users u ON u.id = c.instructor_id
    WHERE c.id = ${courseId}
  `;

  if (!course) notFound();

  const lessons = await sql<Lesson[]>`
    SELECT * FROM lessons
    WHERE course_id = ${courseId}
    ORDER BY order_index ASC, id ASC
  `;

  const [enrollment] = await sql`
    SELECT id FROM enrollments
    WHERE user_id = ${userId} AND course_id = ${courseId}
  `;

  const price = parseFloat(course.price);
  const priceLabel = price === 0 ? "Free" : `$${price.toFixed(2)}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          &larr; Back to Courses
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {course.title}
        </h1>
        <p className="text-gray-500 mt-1">by {course.instructor_name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {course.title.charAt(0)}
              </span>
            </div>
          )}

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              About this course
            </h2>
            <p className="text-gray-700">
              {course.description || "No description provided."}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lessons ({lessons.length})
            </h2>
            {lessons.length === 0 ? (
              <p className="text-gray-500">No lessons added yet.</p>
            ) : (
              <ol className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 w-6 text-center">
                        {idx + 1}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {lesson.title}
                      </span>
                    </div>
                    {lesson.duration_minutes && (
                      <span className="text-sm text-gray-500">
                        {lesson.duration_minutes} min
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <p className="text-3xl font-bold text-gray-900 mb-4">
              {priceLabel}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
            </p>

            {enrollment ? (
              <Link
                href={`/courses/${courseId}/learn`}
                className="block w-full text-center bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Learning
              </Link>
            ) : (
              <form action="/api/enroll" method="POST">
                <input type="hidden" name="courseId" value={courseId} />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enroll Now
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
