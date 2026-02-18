/* ------------------------------------------------------------------ */
/*  Resource Scheduler — Types                                         */
/* ------------------------------------------------------------------ */

export interface Resource {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  capacity: number;
}

export interface ScheduleBlock {
  id: string;
  resourceId: string;
  title: string;
  start: string;
  end: string;
  color: string;
  status: "scheduled" | "in-progress" | "completed";
  description?: string;
}

export interface TimeSlot {
  date: string;
  hour: number;
}

export type SchedulerViewMode = "day" | "week";

export interface ResourceSchedulerProps {
  resources?: Resource[];
  blocks?: ScheduleBlock[];
  viewMode?: SchedulerViewMode;
  onBlockMove?: (
    blockId: string,
    newResourceId: string,
    newStart: string,
    newEnd: string
  ) => void;
  onBlockCreate?: (resourceId: string, slot: TimeSlot) => void;
  onBlockClick?: (block: ScheduleBlock) => void;
  className?: string;
}
