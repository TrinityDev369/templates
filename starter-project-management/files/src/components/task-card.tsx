import type { TaskWithAssignee } from "@/types";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({ task }: { task: TaskWithAssignee }) {
  const overdue = isOverdue(task.due_date);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority badge */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </span>

        {/* Due date */}
        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              overdue ? "text-red-600 font-medium" : "text-gray-400"
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Assignee */}
      {task.assignee_name && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
            {task.assignee_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{task.assignee_name}</span>
        </div>
      )}
    </div>
  );
}
