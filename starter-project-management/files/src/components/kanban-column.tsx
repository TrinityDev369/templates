"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskCard from "@/components/task-card";
import type { Column, TaskWithAssignee } from "@/types";

interface KanbanColumnProps {
  column: Column;
  tasks: TaskWithAssignee[];
  projectId: number;
}

export default function KanbanColumn({ column, tasks, projectId }: KanbanColumnProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          columnId: column.id,
          priority: "medium",
        }),
      });

      if (res.ok) {
        setTitle("");
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-72 bg-gray-100 rounded-xl p-3 flex flex-col shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700">{column.name}</h2>
          <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-2 min-h-0 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Add task */}
      {showForm ? (
        <form onSubmit={handleAddTask} className="mt-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setTitle("");
              }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-1 px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      )}
    </div>
  );
}
