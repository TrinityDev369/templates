import Link from "next/link";
import type { CourseWithInstructor } from "@/types";

export function CourseCard({ course }: { course: CourseWithInstructor }) {
  const price = parseFloat(course.price);
  const priceLabel = price === 0 ? "Free" : `$${price.toFixed(2)}`;
  const description = course.description
    ? course.description.length > 120
      ? course.description.slice(0, 120) + "..."
      : course.description
    : "No description available.";

  return (
    <Link
      href={`/courses/${course.id}`}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {course.title.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          by {course.instructor_name}
        </p>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <span
          className={`inline-block text-sm font-medium px-2 py-1 rounded ${
            price === 0
              ? "bg-green-100 text-green-700"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {priceLabel}
        </span>
      </div>
    </Link>
  );
}
