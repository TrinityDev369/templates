import sql from "@/lib/db";
import { CourseCard } from "@/components/course-card";
import type { CourseWithInstructor } from "@/types";

export default async function HomePage() {
  const courses = await sql<CourseWithInstructor[]>`
    SELECT c.*, u.name AS instructor_name
    FROM courses c
    JOIN users u ON u.id = c.instructor_id
    WHERE c.is_published = true
    ORDER BY c.created_at DESC
  `;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
        <p className="mt-2 text-gray-600">
          {courses.length} {courses.length === 1 ? "course" : "courses"} available
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No courses available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
