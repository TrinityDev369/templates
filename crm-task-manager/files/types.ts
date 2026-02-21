/**
 * CRM Task Manager Types
 *
 * Core types for task management: creation, assignment, tracking with
 * due dates, priorities, and optional contact/deal linking.
 */

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  contactId?: string;
  dealId?: string;
  createdAt: string;
  completedAt?: string;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'completedAt'>;

/** Color mapping for priority badges */
export const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-700',
};

/** Labels for status filter tabs */
export const statusLabels: Record<TaskStatus | 'all', string> = {
  all: 'All',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};
