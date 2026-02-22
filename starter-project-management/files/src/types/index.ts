export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  color: string;
  created_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: "owner" | "member";
  joined_at: string;
}

export interface Column {
  id: number;
  project_id: number;
  name: string;
  order_index: number;
  color: string | null;
}

export interface Task {
  id: number;
  column_id: number;
  project_id: number;
  title: string;
  description: string | null;
  assignee_id: number | null;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  order_index: number;
  created_at: string;
}

export interface TaskLabel {
  id: number;
  task_id: number;
  label: string;
  color: string;
}

export interface ProjectWithStats extends Project {
  task_count: number;
  member_count: number;
}

export interface TaskWithAssignee extends Task {
  assignee_name: string | null;
}
