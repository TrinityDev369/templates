export interface GanttTask {
  id: string;
  title: string;
  start: string;
  end: string;
  progress: number;
  color: string;
  assignee: string;
  dependencies: string[];
  group: string;
}

export interface GanttGroup {
  id: string;
  name: string;
  collapsed: boolean;
}

export type GanttViewMode = 'day' | 'week' | 'month';

export interface GanttChartProps {
  tasks?: GanttTask[];
  groups?: GanttGroup[];
  viewMode?: GanttViewMode;
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (task: GanttTask) => void;
  className?: string;
}
