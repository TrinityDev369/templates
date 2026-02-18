"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type {
  Resource,
  ResourceSchedulerProps,
  ScheduleBlock,
  SchedulerViewMode,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Placeholder Data                                                    */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_RESOURCES: Resource[] = [
  { id: "r1", name: "Sarah Chen", role: "Lead Developer", avatar: "SC", color: "bg-violet-500", capacity: 8 },
  { id: "r2", name: "Marcus Johnson", role: "Backend Dev", avatar: "MJ", color: "bg-blue-500", capacity: 8 },
  { id: "r3", name: "Priya Patel", role: "Frontend Dev", avatar: "PP", color: "bg-emerald-500", capacity: 6 },
  { id: "r4", name: "Tom Wilson", role: "Designer", avatar: "TW", color: "bg-amber-500", capacity: 8 },
  { id: "r5", name: "Ana Rodriguez", role: "QA Engineer", avatar: "AR", color: "bg-rose-500", capacity: 8 },
  { id: "r6", name: "James Kim", role: "DevOps", avatar: "JK", color: "bg-cyan-500", capacity: 4 },
];

function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const PLACEHOLDER_BLOCKS: ScheduleBlock[] = [
  { id: "b1", resourceId: "r1", title: "Sprint Planning", start: todayAt(9), end: todayAt(10), color: "bg-violet-100 border-violet-400 text-violet-900", status: "scheduled", description: "Weekly sprint planning with the team" },
  { id: "b2", resourceId: "r1", title: "API Redesign", start: todayAt(10), end: todayAt(13), color: "bg-violet-100 border-violet-400 text-violet-900", status: "in-progress", description: "Redesign REST API endpoints for v2" },
  { id: "b3", resourceId: "r1", title: "Code Review", start: todayAt(14), end: todayAt(15), color: "bg-violet-100 border-violet-400 text-violet-900", status: "scheduled", description: "Review PRs from the frontend team" },
  { id: "b4", resourceId: "r2", title: "Database Migration", start: todayAt(9), end: todayAt(12), color: "bg-blue-100 border-blue-400 text-blue-900", status: "in-progress", description: "Migrate user tables to new schema" },
  { id: "b5", resourceId: "r2", title: "Bug Fixes", start: todayAt(13), end: todayAt(15), color: "bg-blue-100 border-blue-400 text-blue-900", status: "scheduled", description: "Fix critical bugs from QA report" },
  { id: "b6", resourceId: "r3", title: "Dashboard UI", start: todayAt(9), end: todayAt(12), color: "bg-emerald-100 border-emerald-400 text-emerald-900", status: "scheduled", description: "Build analytics dashboard components" },
  { id: "b7", resourceId: "r3", title: "Component Testing", start: todayAt(13), end: todayAt(15), color: "bg-emerald-100 border-emerald-400 text-emerald-900", status: "scheduled", description: "Write unit tests for new components" },
  { id: "b8", resourceId: "r4", title: "Wireframes", start: todayAt(9), end: todayAt(11), color: "bg-amber-100 border-amber-400 text-amber-900", status: "completed", description: "Create wireframes for settings page" },
  { id: "b9", resourceId: "r4", title: "Design Review", start: todayAt(11), end: todayAt(12), color: "bg-amber-100 border-amber-400 text-amber-900", status: "scheduled", description: "Review design system updates" },
  { id: "b10", resourceId: "r4", title: "Prototype", start: todayAt(13), end: todayAt(16), color: "bg-amber-100 border-amber-400 text-amber-900", status: "scheduled", description: "Interactive prototype for onboarding flow" },
  { id: "b11", resourceId: "r5", title: "Test Planning", start: todayAt(9), end: todayAt(10), color: "bg-rose-100 border-rose-400 text-rose-900", status: "scheduled", description: "Plan test strategy for release 3.2" },
  { id: "b12", resourceId: "r5", title: "E2E Tests", start: todayAt(10), end: todayAt(14), color: "bg-rose-100 border-rose-400 text-rose-900", status: "in-progress", description: "Write end-to-end tests for checkout flow" },
  { id: "b13", resourceId: "r6", title: "Deploy Pipeline", start: todayAt(9), end: todayAt(11), color: "bg-cyan-100 border-cyan-400 text-cyan-900", status: "scheduled", description: "Set up staging deployment pipeline" },
  { id: "b14", resourceId: "r6", title: "Monitor Setup", start: todayAt(11), end: todayAt(13), color: "bg-cyan-100 border-cyan-400 text-cyan-900", status: "scheduled", description: "Configure Grafana dashboards and alerts" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;
const HOURS_IN_DAY = DAY_END_HOUR - DAY_START_HOUR;
const COLUMN_WIDTH_PX = 100;

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h} ${suffix}`;
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${formatHour(s.getHours())} - ${formatHour(e.getHours())}`;
}

function getBlockPosition(
  start: string,
  end: string
): { left: number; width: number } {
  const s = new Date(start);
  const e = new Date(end);
  const startHour = s.getHours() + s.getMinutes() / 60;
  const endHour = e.getHours() + e.getMinutes() / 60;
  const left = (startHour - DAY_START_HOUR) * COLUMN_WIDTH_PX;
  const width = (endHour - startHour) * COLUMN_WIDTH_PX;
  return { left: Math.max(left, 0), width: Math.max(width, COLUMN_WIDTH_PX / 2) };
}

function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Status Dot                                                          */
/* ------------------------------------------------------------------ */

function StatusDot({ status }: { status: ScheduleBlock["status"] }) {
  const colors: Record<ScheduleBlock["status"], string> = {
    scheduled: "bg-slate-400",
    "in-progress": "bg-green-500 animate-pulse",
    completed: "bg-blue-500",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", colors[status])}
      aria-label={status}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Current Time Indicator                                              */
/* ------------------------------------------------------------------ */

function CurrentTimeIndicator() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < DAY_START_HOUR || hour > DAY_END_HOUR) return null;
  const left = (hour - DAY_START_HOUR) * COLUMN_WIDTH_PX;
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-30 w-px bg-red-500"
      style={{ left }}
    >
      <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-red-500" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Resource Sidebar Row                                                */
/* ------------------------------------------------------------------ */

function ResourceRow({ resource }: { resource: Resource }) {
  return (
    <div className="flex h-16 items-center gap-3 border-b border-border px-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
          resource.color
        )}
      >
        {resource.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{resource.name}</p>
        <p className="truncate text-xs text-muted-foreground">{resource.role}</p>
      </div>
      <Badge variant="secondary" className="shrink-0 text-[10px]">
        {resource.capacity}h
      </Badge>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Schedule Block Component                                            */
/* ------------------------------------------------------------------ */

interface BlockProps {
  block: ScheduleBlock;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, block: ScheduleBlock) => void;
  onClick?: (block: ScheduleBlock) => void;
}

function BlockItem({ block, onDragStart, onClick }: BlockProps) {
  const { left, width } = getBlockPosition(block.start, block.end);
  const isNarrow = width < COLUMN_WIDTH_PX * 1.5;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={(e) => onDragStart(e, block)}
            onClick={() => onClick?.(block)}
            className={cn(
              "absolute top-1 bottom-1 cursor-grab rounded-md border px-2 py-1 text-xs shadow-sm transition-shadow",
              "hover:shadow-md active:cursor-grabbing active:shadow-lg",
              "flex items-start gap-1 overflow-hidden",
              block.color
            )}
            style={{ left, width }}
          >
            <GripVertical className="mt-0.5 h-3 w-3 shrink-0 opacity-40" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <StatusDot status={block.status} />
                <span className="truncate font-medium">{block.title}</span>
              </div>
              {!isNarrow && (
                <p className="mt-0.5 truncate text-[10px] opacity-70">
                  {formatTimeRange(block.start, block.end)}
                </p>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{block.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimeRange(block.start, block.end)}
          </p>
          {block.description && (
            <p className="mt-1 text-xs">{block.description}</p>
          )}
          <Badge variant="outline" className="mt-1 text-[10px]">
            {block.status}
          </Badge>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Week Block Component                                                */
/* ------------------------------------------------------------------ */

function WeekBlockItem({ block, onDragStart, onClick }: BlockProps) {
  const s = new Date(block.start);
  const e = new Date(block.end);
  const duration = (e.getHours() - s.getHours()) + (e.getMinutes() - s.getMinutes()) / 60;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={(ev) => onDragStart(ev, block)}
            onClick={() => onClick?.(block)}
            className={cn(
              "mb-0.5 cursor-grab rounded border px-1.5 py-0.5 text-[10px] shadow-sm transition-shadow",
              "hover:shadow-md active:cursor-grabbing",
              "flex items-center gap-1 overflow-hidden",
              block.color
            )}
          >
            <StatusDot status={block.status} />
            <span className="truncate font-medium">{block.title}</span>
            <span className="ml-auto shrink-0 opacity-60">{duration}h</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold">{block.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimeRange(block.start, block.end)}
          </p>
          {block.description && (
            <p className="mt-1 text-xs">{block.description}</p>
          )}
          <Badge variant="outline" className="mt-1 text-[10px]">
            {block.status}
          </Badge>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function ResourceScheduler({
  resources: resourcesProp,
  blocks: blocksProp,
  viewMode: viewModeProp,
  onBlockMove,
  onBlockCreate,
  onBlockClick,
  className,
}: ResourceSchedulerProps) {
  const resources = resourcesProp ?? PLACEHOLDER_RESOURCES;
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(blocksProp ?? PLACEHOLDER_BLOCKS);
  const [view, setView] = useState<SchedulerViewMode>(viewModeProp ?? "day");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  /* Drag-and-drop state */
  const dragBlockRef = useRef<ScheduleBlock | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    resourceId: string;
    hour?: number;
    date?: string;
  } | null>(null);

  /* ---- date navigation ------------------------------------------- */

  const navigatePrev = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() - (view === "week" ? 7 : 1));
      return next;
    });
  }, [view]);

  const navigateNext = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + (view === "week" ? 7 : 1));
      return next;
    });
  }, [view]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /* ---- drag-and-drop handlers ------------------------------------ */

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, block: ScheduleBlock) => {
      dragBlockRef.current = block;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", block.id);

      /* Semi-transparent ghost */
      const el = e.currentTarget;
      if (el) {
        e.dataTransfer.setDragImage(el, 20, 10);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      resourceId: string,
      hour?: number,
      date?: string
    ) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget({ resourceId, hour, date });
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      resourceId: string,
      hour?: number,
      date?: string
    ) => {
      e.preventDefault();
      setDropTarget(null);

      const block = dragBlockRef.current;
      if (!block) return;

      const oldStart = new Date(block.start);
      const oldEnd = new Date(block.end);
      const durationMs = oldEnd.getTime() - oldStart.getTime();

      let newStart: Date;
      if (view === "day" && hour !== undefined) {
        newStart = new Date(currentDate);
        newStart.setHours(hour, 0, 0, 0);
      } else if (view === "week" && date) {
        newStart = new Date(date);
        newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
      } else {
        newStart = new Date(oldStart);
      }

      const newEnd = new Date(newStart.getTime() + durationMs);

      if (onBlockMove) {
        onBlockMove(block.id, resourceId, newStart.toISOString(), newEnd.toISOString());
      } else {
        /* Internal state update for demo */
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === block.id
              ? { ...b, resourceId, start: newStart.toISOString(), end: newEnd.toISOString() }
              : b
          )
        );
      }

      dragBlockRef.current = null;
    },
    [view, currentDate, onBlockMove]
  );

  const handleSlotClick = useCallback(
    (resourceId: string, hour: number, date?: string) => {
      if (onBlockCreate) {
        onBlockCreate(resourceId, {
          date: date ?? currentDate.toISOString().split("T")[0],
          hour,
        });
      }
    },
    [currentDate, onBlockCreate]
  );

  /* ---- computed values ------------------------------------------- */

  const hours = useMemo(
    () => Array.from({ length: HOURS_IN_DAY }, (_, i) => DAY_START_HOUR + i),
    []
  );

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const dayBlocks = useMemo(() => {
    const map = new Map<string, ScheduleBlock[]>();
    for (const r of resources) {
      map.set(r.id, []);
    }
    for (const b of blocks) {
      const bDate = new Date(b.start);
      if (view === "day" && isSameDay(bDate, currentDate)) {
        map.get(b.resourceId)?.push(b);
      } else if (view === "day") {
        /* skip blocks not on current day */
      } else {
        map.get(b.resourceId)?.push(b);
      }
    }
    return map;
  }, [blocks, resources, currentDate, view]);

  /* ---- capacity summary ------------------------------------------ */

  const capacitySummary = useMemo(() => {
    const summary = new Map<string, number>();
    for (const r of resources) {
      let total = 0;
      const rBlocks = dayBlocks.get(r.id) ?? [];
      for (const b of rBlocks) {
        if (view === "day") {
          const s = new Date(b.start);
          const e = new Date(b.end);
          total += (e.getTime() - s.getTime()) / 3600000;
        } else {
          const s = new Date(b.start);
          const e = new Date(b.end);
          if (isSameDay(s, currentDate)) {
            total += (e.getTime() - s.getTime()) / 3600000;
          }
        }
      }
      summary.set(r.id, total);
    }
    return summary;
  }, [dayBlocks, resources, view, currentDate]);

  const gridWidth = view === "day" ? HOURS_IN_DAY * COLUMN_WIDTH_PX : 7 * 160;

  /* ---- render: day view ------------------------------------------ */

  function renderDayView() {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Resource sidebar */}
        <div className="w-52 shrink-0 border-r border-border bg-muted/30">
          {/* Header spacer */}
          <div className="flex h-10 items-center border-b border-border px-3">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Resources</span>
          </div>
          {resources.map((r) => (
            <ResourceRow key={r.id} resource={r} />
          ))}
        </div>

        {/* Scrollable grid area */}
        <div className="flex-1 overflow-x-auto">
          {/* Hour header */}
          <div className="sticky top-0 z-20 flex h-10 border-b border-border bg-background">
            {hours.map((h) => (
              <div
                key={h}
                className="flex shrink-0 items-center justify-center border-r border-border text-xs font-medium text-muted-foreground"
                style={{ width: COLUMN_WIDTH_PX }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Resource rows */}
          <div className="relative">
            {resources.map((r) => {
              const rBlocks = dayBlocks.get(r.id) ?? [];
              const used = capacitySummary.get(r.id) ?? 0;
              const overCapacity = used > r.capacity;

              return (
                <div
                  key={r.id}
                  className={cn(
                    "relative flex h-16 border-b border-border",
                    overCapacity && "bg-red-50/50 dark:bg-red-950/10"
                  )}
                  style={{ width: gridWidth }}
                >
                  {/* Hour grid lines + drop zones */}
                  {hours.map((h) => {
                    const isTarget =
                      dropTarget?.resourceId === r.id && dropTarget?.hour === h;
                    return (
                      <div
                        key={h}
                        className={cn(
                          "h-full shrink-0 border-r border-border/50 transition-colors",
                          isTarget && "bg-primary/10"
                        )}
                        style={{ width: COLUMN_WIDTH_PX }}
                        onDragOver={(e) => handleDragOver(e, r.id, h)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, r.id, h)}
                        onClick={() => handleSlotClick(r.id, h)}
                      />
                    );
                  })}

                  {/* Schedule blocks */}
                  {rBlocks.map((b) => (
                    <BlockItem
                      key={b.id}
                      block={b}
                      onDragStart={handleDragStart}
                      onClick={onBlockClick}
                    />
                  ))}

                </div>
              );
            })}

            {/* Single current time indicator spanning all rows */}
            <CurrentTimeIndicator />
          </div>
        </div>
      </div>
    );
  }

  /* ---- render: week view ----------------------------------------- */

  function renderWeekView() {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Resource sidebar */}
        <div className="w-52 shrink-0 border-r border-border bg-muted/30">
          <div className="flex h-10 items-center border-b border-border px-3">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Resources</span>
          </div>
          {resources.map((r) => (
            <ResourceRow key={r.id} resource={r} />
          ))}
        </div>

        {/* Scrollable grid area */}
        <div className="flex-1 overflow-x-auto">
          {/* Day header */}
          <div className="sticky top-0 z-20 flex h-10 border-b border-border bg-background">
            {weekDates.map((d) => {
              const isToday = isSameDay(d, new Date());
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "flex shrink-0 items-center justify-center border-r border-border text-xs font-medium",
                    isToday
                      ? "bg-primary/5 text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                  style={{ width: 160 }}
                >
                  {formatDateShort(d)}
                </div>
              );
            })}
          </div>

          {/* Resource rows */}
          <div className="relative">
            {resources.map((r) => {
              const rBlocks = dayBlocks.get(r.id) ?? [];
              return (
                <div
                  key={r.id}
                  className="flex h-16 border-b border-border"
                  style={{ width: gridWidth }}
                >
                  {weekDates.map((d) => {
                    const dateStr = d.toISOString().split("T")[0];
                    const dayBlocksForDate = rBlocks.filter((b) =>
                      isSameDay(new Date(b.start), d)
                    );
                    const isTarget =
                      dropTarget?.resourceId === r.id && dropTarget?.date === dateStr;
                    const isToday = isSameDay(d, new Date());

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "flex h-full shrink-0 flex-col justify-center border-r border-border/50 px-1 py-0.5 transition-colors overflow-hidden",
                          isTarget && "bg-primary/10",
                          isToday && "bg-primary/5"
                        )}
                        style={{ width: 160 }}
                        onDragOver={(e) => handleDragOver(e, r.id, undefined, dateStr)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, r.id, undefined, dateStr)}
                        onClick={() => handleSlotClick(r.id, 9, dateStr)}
                      >
                        {dayBlocksForDate.map((b) => (
                          <WeekBlockItem
                            key={b.id}
                            block={b}
                            onDragStart={handleDragStart}
                            onClick={onBlockClick}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---- main render ----------------------------------------------- */

  const dateLabel =
    view === "day"
      ? formatDateFull(currentDate)
      : `${formatDateShort(weekDates[0])} - ${formatDateShort(weekDates[6])}`;

  const totalScheduled = blocks.filter(
    (b) =>
      view === "day"
        ? isSameDay(new Date(b.start), currentDate)
        : weekDates.some((d) => isSameDay(new Date(b.start), d))
  ).length;

  const inProgress = blocks.filter(
    (b) =>
      b.status === "in-progress" &&
      (view === "day"
        ? isSameDay(new Date(b.start), currentDate)
        : weekDates.some((d) => isSameDay(new Date(b.start), d)))
  ).length;

  return (
    <Card className={cn("flex h-[540px] flex-col overflow-hidden", className)}>
      <CardHeader className="shrink-0 space-y-0 border-b border-border pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title + stats */}
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">Resource Scheduler</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                <Clock className="mr-1 h-3 w-3" />
                {totalScheduled} blocks
              </Badge>
              {inProgress > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                >
                  {inProgress} active
                </Badge>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => {
                if (v) setView(v as SchedulerViewMode);
              }}
              className="h-8"
            >
              <ToggleGroupItem value="day" aria-label="Day view" className="h-8 px-2.5 text-xs">
                Day
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Week view" className="h-8 px-2.5 text-xs">
                Week
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Date navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={navigatePrev}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={navigateToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={navigateNext}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {dateLabel}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {view === "day" ? renderDayView() : renderWeekView()}
      </CardContent>
    </Card>
  );
}
