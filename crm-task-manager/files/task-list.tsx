'use client';

import { useState, useMemo } from 'react';
import type { Task, TaskStatus } from './types';
import { priorityColors, statusLabels } from './types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const filters: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress', 'done'];

export function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const list = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
    return [...list].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }, [tasks, filter]);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {statusLabels[f]}
          </button>
        ))}
      </div>

      {/* Task rows */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No tasks {filter !== 'all' ? `with status "${statusLabels[filter]}"` : 'yet'}.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {filtered.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3 group">
              {/* Checkbox */}
              <button
                onClick={() => onToggle(task.id)}
                className="shrink-0 w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors"
                aria-label={task.status === 'done' ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.status === 'done' && (
                  <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                  <span className={isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-600 font-medium' : ''}>
                    {formatDate(task.dueDate)}
                  </span>
                  {task.assignee && <span>{task.assignee}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-600" aria-label="Edit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600" aria-label="Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
