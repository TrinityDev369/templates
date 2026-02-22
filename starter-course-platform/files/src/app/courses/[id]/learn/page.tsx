import { notFound, redirect } from "next/navigation";
import sql from "@/lib/db";
import { ProgressBar } from "@/components/progress-bar";
import type { Lesson } from "@/types";

// TODO: replace with your auth provider
const userId = 1;

export default async function LearnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) notFound();

  const [enrollment] = await sql`
    SELECT id FROM enrollments
    WHERE user_id = ${userId} AND course_id = ${courseId}
  `;

  if (!enrollment) redirect(`/courses/${courseId}`);

  const [course] = await sql`
    SELECT title FROM courses WHERE id = ${courseId}
  `;

  if (!course) notFound();

  const lessons = await sql<Lesson[]>`
    SELECT * FROM lessons
    WHERE course_id = ${courseId}
    ORDER BY order_index ASC, id ASC
  `;

  const completedRows = await sql<{ lesson_id: number }[]>`
    SELECT lp.lesson_id
    FROM lesson_progress lp
    WHERE lp.enrollment_id = ${enrollment.id}
  `;

  const completedIds = new Set(completedRows.map((r) => r.lesson_id));
  const totalLessons = lessons.length;
  const completedCount = completedIds.size;
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  // Show first incomplete lesson, or last lesson if all complete
  const currentLesson =
    lessons.find((l) => !completedIds.has(l.id)) || lessons[lessons.length - 1];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {course.title}
        </h1>
        <ProgressBar
          value={progressPct}
          label={`${completedCount} of ${totalLessons} lessons completed`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lesson sidebar */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Lessons
          </h2>
          <ul className="space-y-1">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedIds.has(lesson.id);
              const isCurrent = currentLesson?.id === lesson.id;

              return (
                <li
                  key={lesson.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isCurrent
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex-shrink-0 w-5 text-center">
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4 text-green-500 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-gray-400">{idx + 1}</span>
                    )}
                  </span>
                  <span className="truncate">{lesson.title}</span>
                  {lesson.duration_minutes && (
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      {lesson.duration_minutes}m
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          {currentLesson ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentLesson.title}
              </h2>

              {currentLesson.video_url && (
                <div className="mb-6">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">
                      Video: {currentLesson.video_url}
                    </p>
                  </div>
                </div>
              )}

              <div className="prose max-w-none text-gray-700 mb-6">
                {currentLesson.content ? (
                  <p className="whitespace-pre-wrap">{currentLesson.content}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    No content for this lesson yet.
                  </p>
                )}
              </div>

              {!completedIds.has(currentLesson.id) && (
                <form action="/api/progress" method="POST">
                  <input
                    type="hidden"
                    name="enrollmentId"
                    value={enrollment.id}
                  />
                  <input
                    type="hidden"
                    name="lessonId"
                    value={currentLesson.id}
                  />
                  <input type="hidden" name="courseId" value={courseId} />
                  <button
                    type="submit"
                    className="bg-green-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                </form>
              )}

              {completedIds.has(currentLesson.id) && (
                <p className="text-green-600 font-medium">
                  Lesson completed!
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No lessons available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
