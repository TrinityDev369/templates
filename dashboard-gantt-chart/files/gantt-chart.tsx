'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GanttTask, GanttGroup, GanttViewMode, GanttChartProps } from './types';

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_GROUPS: GanttGroup[] = [
  { id: 'design', name: 'Design', collapsed: false },
  { id: 'frontend', name: 'Frontend', collapsed: false },
  { id: 'backend', name: 'Backend', collapsed: false },
  { id: 'qa', name: 'QA', collapsed: false },
];

const PLACEHOLDER_TASKS: GanttTask[] = [
  /* Design */
  { id: 't1', title: 'Wireframes', start: '2026-01-15', end: '2026-02-01', progress: 100, color: 'purple', assignee: 'Alice M.', dependencies: [], group: 'design' },
  { id: 't2', title: 'UI Design', start: '2026-01-25', end: '2026-02-15', progress: 80, color: 'purple', assignee: 'Alice M.', dependencies: [], group: 'design' },
  { id: 't3', title: 'Design Review', start: '2026-02-16', end: '2026-02-20', progress: 0, color: 'purple', assignee: 'Bob K.', dependencies: [], group: 'design' },
  /* Frontend */
  { id: 't4', title: 'Component Library', start: '2026-02-01', end: '2026-02-28', progress: 60, color: 'blue', assignee: 'Carol S.', dependencies: [], group: 'frontend' },
  { id: 't5', title: 'Dashboard', start: '2026-02-10', end: '2026-03-15', progress: 30, color: 'blue', assignee: 'Dave R.', dependencies: ['t4'], group: 'frontend' },
  { id: 't6', title: 'Auth Flow', start: '2026-02-05', end: '2026-02-25', progress: 45, color: 'blue', assignee: 'Carol S.', dependencies: ['t9'], group: 'frontend' },
  /* Backend */
  { id: 't7', title: 'API Design', start: '2026-01-20', end: '2026-02-10', progress: 100, color: 'green', assignee: 'Eve L.', dependencies: [], group: 'backend' },
  { id: 't8', title: 'Database Schema', start: '2026-02-01', end: '2026-02-15', progress: 90, color: 'green', assignee: 'Frank W.', dependencies: [], group: 'backend' },
  { id: 't9', title: 'Auth Service', start: '2026-02-10', end: '2026-03-01', progress: 50, color: 'green', assignee: 'Eve L.', dependencies: [], group: 'backend' },
  { id: 't10', title: 'Payment Integration', start: '2026-02-20', end: '2026-03-15', progress: 10, color: 'green', assignee: 'Frank W.', dependencies: [], group: 'backend' },
  /* QA */
  { id: 't11', title: 'Test Planning', start: '2026-02-15', end: '2026-02-28', progress: 20, color: 'orange', assignee: 'Grace T.', dependencies: [], group: 'qa' },
  { id: 't12', title: 'E2E Tests', start: '2026-03-01', end: '2026-03-20', progress: 0, color: 'orange', assignee: 'Grace T.', dependencies: ['t5'], group: 'qa' },
];

/* -------------------------------------------------------------------------- */
/*  Color helpers                                                             */
/* -------------------------------------------------------------------------- */

const BAR_COLORS: Record<string, { bg: string; fill: string; border: string; text: string }> = {
  purple: { bg: 'bg-purple-200 dark:bg-purple-900/40', fill: 'bg-purple-500 dark:bg-purple-400', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300' },
  blue: { bg: 'bg-blue-200 dark:bg-blue-900/40', fill: 'bg-blue-500 dark:bg-blue-400', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300' },
  green: { bg: 'bg-green-200 dark:bg-green-900/40', fill: 'bg-green-500 dark:bg-green-400', border: 'border-green-300 dark:border-green-700', text: 'text-green-700 dark:text-green-300' },
  orange: { bg: 'bg-orange-200 dark:bg-orange-900/40', fill: 'bg-orange-500 dark:bg-orange-400', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300' },
  red: { bg: 'bg-red-200 dark:bg-red-900/40', fill: 'bg-red-500 dark:bg-red-400', border: 'border-red-300 dark:border-red-700', text: 'text-red-700 dark:text-red-300' },
};

function getBarColor(color: string) {
  return BAR_COLORS[color] ?? BAR_COLORS.blue;
}

const GROUP_DOT_COLORS: Record<string, string> = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                              */
/* -------------------------------------------------------------------------- */

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatShortDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatFullDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay() + 1); /* Monday */
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/* -------------------------------------------------------------------------- */
/*  Timeline axis generation                                                  */
/* -------------------------------------------------------------------------- */

interface TimeColumn {
  date: Date;
  label: string;
  isFirstOfGroup: boolean;
  groupLabel: string;
}

function generateColumns(
  start: Date,
  end: Date,
  mode: GanttViewMode,
): TimeColumn[] {
  const columns: TimeColumn[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const current = new Date(start);

  if (mode === 'day') {
    while (current <= end) {
      const isFirst = current.getDate() === 1 || columns.length === 0;
      columns.push({
        date: new Date(current),
        label: `${current.getDate()}`,
        isFirstOfGroup: isFirst,
        groupLabel: `${months[current.getMonth()]} ${current.getFullYear()}`,
      });
      current.setDate(current.getDate() + 1);
    }
  } else if (mode === 'week') {
    const weekStart = startOfWeek(new Date(current));
    const cursor = new Date(weekStart);
    while (cursor <= end) {
      const weekEnd = addDays(cursor, 6);
      const isFirst = cursor.getMonth() !== addDays(cursor, -7).getMonth() || columns.length === 0;
      columns.push({
        date: new Date(cursor),
        label: `${formatShortDate(cursor)}`,
        isFirstOfGroup: isFirst,
        groupLabel: `${months[cursor.getMonth()]} ${cursor.getFullYear()}`,
      });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    /* month */
    const cursor = startOfMonth(new Date(current));
    while (cursor <= end) {
      const isFirst = cursor.getMonth() === 0 || columns.length === 0;
      columns.push({
        date: new Date(cursor),
        label: months[cursor.getMonth()],
        isFirstOfGroup: isFirst,
        groupLabel: `${cursor.getFullYear()}`,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return columns;
}

/* -------------------------------------------------------------------------- */
/*  Column widths per mode                                                    */
/* -------------------------------------------------------------------------- */

const COL_WIDTH: Record<GanttViewMode, number> = {
  day: 36,
  week: 100,
  month: 120,
};

/* -------------------------------------------------------------------------- */
/*  Row height                                                                */
/* -------------------------------------------------------------------------- */

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 52;
const GROUP_ROW_HEIGHT = 36;
const TASK_LIST_WIDTH = 320;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function GanttChart({
  tasks: tasksProp = PLACEHOLDER_TASKS,
  groups: groupsProp = PLACEHOLDER_GROUPS,
  viewMode: viewModeProp,
  onTaskClick,
  onTaskUpdate,
  className,
}: GanttChartProps) {
  const [groups, setGroups] = useState<GanttGroup[]>(groupsProp);
  const [viewMode, setViewMode] = useState<GanttViewMode>(viewModeProp ?? 'day');
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  /* ---- Derived data ---- */

  const visibleTasks = useMemo(() => {
    const collapsedGroupIds = new Set(groups.filter((g) => g.collapsed).map((g) => g.id));
    return tasksProp.filter((t) => !collapsedGroupIds.has(t.group));
  }, [tasksProp, groups]);

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  /* ---- Timeline range: pad 7 days before earliest and 7 days after latest ---- */

  const { timelineStart, timelineEnd, columns } = useMemo(() => {
    const allDates = tasksProp.flatMap((t) => [parseDate(t.start), parseDate(t.end)]);
    allDates.push(today);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const padStart = addDays(minDate, -7);
    const padEnd = addDays(maxDate, 7);
    const cols = generateColumns(padStart, padEnd, viewMode);
    return { timelineStart: padStart, timelineEnd: padEnd, columns: cols };
  }, [tasksProp, viewMode, today]);

  const totalTimelineDays = daysBetween(timelineStart, timelineEnd);
  const totalWidth = columns.length * COL_WIDTH[viewMode];

  /* ---- Build row list (groups + tasks) ---- */

  type RowItem =
    | { kind: 'group'; group: GanttGroup }
    | { kind: 'task'; task: GanttTask };

  const rows = useMemo<RowItem[]>(() => {
    const result: RowItem[] = [];
    for (const group of groups) {
      result.push({ kind: 'group', group });
      if (!group.collapsed) {
        for (const task of tasksProp.filter((t) => t.group === group.id)) {
          result.push({ kind: 'task', task });
        }
      }
    }
    return result;
  }, [groups, tasksProp]);

  /* ---- Positioning helpers ---- */

  function getBarLeft(task: GanttTask): number {
    const taskStart = parseDate(task.start);
    const offsetDays = daysBetween(timelineStart, taskStart);
    return (offsetDays / totalTimelineDays) * totalWidth;
  }

  function getBarWidth(task: GanttTask): number {
    const taskStart = parseDate(task.start);
    const taskEnd = parseDate(task.end);
    const durationDays = Math.max(daysBetween(taskStart, taskEnd), 1);
    return (durationDays / totalTimelineDays) * totalWidth;
  }

  function getTodayOffset(): number {
    const offsetDays = daysBetween(timelineStart, today);
    return (offsetDays / totalTimelineDays) * totalWidth;
  }

  /* ---- Task Y positions (needed for dependency arrows) ---- */

  const taskYPositions = useMemo(() => {
    const map = new Map<string, number>();
    let y = 0;
    for (const row of rows) {
      if (row.kind === 'group') {
        y += GROUP_ROW_HEIGHT;
      } else {
        map.set(row.task.id, y + ROW_HEIGHT / 2);
        y += ROW_HEIGHT;
      }
    }
    return map;
  }, [rows]);

  const totalBodyHeight = useMemo(() => {
    return rows.reduce((sum, r) => sum + (r.kind === 'group' ? GROUP_ROW_HEIGHT : ROW_HEIGHT), 0);
  }, [rows]);

  /* ---- Toggle group collapse ---- */

  const toggleGroup = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g)),
    );
  }, []);

  /* ---- Synchronized scroll ---- */

  const handleTimelineScroll = useCallback(() => {
    if (scrollRef.current && headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }, []);

  /* ---- Dependency arrows ---- */

  const dependencyPaths = useMemo(() => {
    const paths: { d: string; key: string }[] = [];

    for (const task of visibleTasks) {
      for (const depId of task.dependencies) {
        const depTask = tasksProp.find((t) => t.id === depId);
        if (!depTask) continue;

        const fromY = taskYPositions.get(depId);
        const toY = taskYPositions.get(task.id);
        if (fromY === undefined || toY === undefined) continue;

        const fromX = getBarLeft(depTask) + getBarWidth(depTask);
        const toX = getBarLeft(task);

        /* Curved path: horizontal out, arc down/up, horizontal in */
        const midX = fromX + (toX - fromX) / 2;
        const arrowSize = 5;

        const d = [
          `M ${fromX} ${fromY}`,
          `C ${midX} ${fromY}, ${midX} ${toY}, ${toX - arrowSize} ${toY}`,
          `L ${toX} ${toY}`,
        ].join(' ');

        paths.push({ d, key: `${depId}-${task.id}` });
      }
    }

    return paths;
  }, [visibleTasks, tasksProp, taskYPositions, timelineStart, totalTimelineDays, totalWidth]);

  /* ---- Group colors: use the first task color of the group ---- */

  function groupDotColor(groupId: string): string {
    const first = tasksProp.find((t) => t.group === groupId);
    if (!first) return 'bg-gray-400';
    return GROUP_DOT_COLORS[first.color] ?? 'bg-gray-400';
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className={cn('flex flex-col overflow-hidden', className)}>
        {/* ---- Toolbar ---- */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Project Timeline</h2>
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as GanttViewMode)}
            size="sm"
          >
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* ---- Main area: task list (left) + timeline (right) ---- */}
        <div className="flex flex-1 overflow-hidden">
          {/* ---- Left: task list ---- */}
          <div
            className="hidden shrink-0 flex-col border-r sm:flex"
            style={{ width: TASK_LIST_WIDTH }}
          >
            {/* Left header */}
            <div
              className="flex items-end border-b bg-muted/30 px-3"
              style={{ height: HEADER_HEIGHT }}
            >
              <div className="flex w-full items-center justify-between pb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Task
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assignee
                </span>
              </div>
            </div>

            {/* Left body — task rows */}
            <ScrollArea className="flex-1">
              <div>
                {rows.map((row, i) => {
                  if (row.kind === 'group') {
                    const g = row.group;
                    const taskCount = tasksProp.filter((t) => t.group === g.id).length;
                    return (
                      <button
                        key={`g-${g.id}`}
                        type="button"
                        className="flex w-full items-center gap-2 border-b bg-muted/20 px-3 hover:bg-muted/40 transition-colors"
                        style={{ height: GROUP_ROW_HEIGHT }}
                        onClick={() => toggleGroup(g.id)}
                      >
                        {g.collapsed ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={cn('h-2.5 w-2.5 rounded-full', groupDotColor(g.id))} />
                        <span className="text-sm font-semibold">{g.name}</span>
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                          {taskCount}
                        </Badge>
                      </button>
                    );
                  }

                  const t = row.task;
                  return (
                    <div
                      key={`t-${t.id}`}
                      className="flex items-center border-b px-3 hover:bg-muted/30 cursor-pointer transition-colors"
                      style={{ height: ROW_HEIGHT }}
                      onClick={() => onTaskClick?.(t)}
                    >
                      <span className="flex-1 truncate pl-6 text-sm">{t.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{t.assignee}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* ---- Right: timeline area ---- */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Timeline header */}
            <div
              className="overflow-hidden border-b bg-muted/30"
              ref={headerScrollRef}
              style={{ height: HEADER_HEIGHT }}
            >
              <div className="relative" style={{ width: totalWidth }}>
                {/* Group labels (month/year row) */}
                <div className="flex h-6">
                  {columns.map((col, i) => {
                    if (!col.isFirstOfGroup) return null;
                    /* Count how many columns share this group */
                    let span = 0;
                    for (let j = i; j < columns.length; j++) {
                      if (j > i && columns[j].isFirstOfGroup) break;
                      span++;
                    }
                    return (
                      <div
                        key={`grp-${i}`}
                        className="absolute top-0 flex items-center border-l border-border/50 px-2 text-xs font-medium text-muted-foreground"
                        style={{
                          left: i * COL_WIDTH[viewMode],
                          width: span * COL_WIDTH[viewMode],
                          height: 24,
                        }}
                      >
                        {col.groupLabel}
                      </div>
                    );
                  })}
                </div>
                {/* Individual column labels */}
                <div className="flex" style={{ marginTop: 0 }}>
                  {columns.map((col, i) => {
                    const isToday = isSameDay(col.date, today);
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex shrink-0 items-center justify-center border-l border-border/30 text-[11px]',
                          isToday && 'font-bold text-red-500',
                        )}
                        style={{
                          width: COL_WIDTH[viewMode],
                          height: 28,
                        }}
                      >
                        {col.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeline body — bars */}
            <div
              className="flex-1 overflow-auto"
              ref={scrollRef}
              onScroll={handleTimelineScroll}
            >
              <div
                className="relative"
                style={{ width: totalWidth, height: totalBodyHeight }}
              >
                {/* Grid lines */}
                {columns.map((col, i) => (
                  <div
                    key={`grid-${i}`}
                    className="absolute top-0 bottom-0 border-l border-border/20"
                    style={{ left: i * COL_WIDTH[viewMode] }}
                  />
                ))}

                {/* Alternating row backgrounds */}
                {(() => {
                  let y = 0;
                  return rows.map((row, i) => {
                    const h = row.kind === 'group' ? GROUP_ROW_HEIGHT : ROW_HEIGHT;
                    const top = y;
                    y += h;
                    if (row.kind === 'group') {
                      return (
                        <div
                          key={`row-bg-g-${i}`}
                          className="absolute left-0 right-0 bg-muted/20 border-b"
                          style={{ top, height: h }}
                        />
                      );
                    }
                    return (
                      <div
                        key={`row-bg-${i}`}
                        className="absolute left-0 right-0 border-b border-border/10"
                        style={{ top, height: h }}
                      />
                    );
                  });
                })()}

                {/* Today marker */}
                <div
                  className="absolute top-0 bottom-0 z-20 border-l-2 border-dashed border-red-500/70"
                  style={{ left: getTodayOffset() }}
                >
                  <div className="absolute -left-3 -top-0.5 rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white leading-none">
                    Today
                  </div>
                </div>

                {/* Dependency arrows (SVG overlay) */}
                <svg
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{ width: totalWidth, height: totalBodyHeight }}
                >
                  <defs>
                    <marker
                      id="gantt-arrowhead"
                      markerWidth="8"
                      markerHeight="6"
                      refX="8"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 8 3, 0 6"
                        className="fill-muted-foreground/60"
                      />
                    </marker>
                  </defs>
                  {dependencyPaths.map(({ d, key }) => (
                    <path
                      key={key}
                      d={d}
                      fill="none"
                      className="stroke-muted-foreground/40"
                      strokeWidth={1.5}
                      markerEnd="url(#gantt-arrowhead)"
                    />
                  ))}
                </svg>

                {/* Task bars */}
                {(() => {
                  let y = 0;
                  return rows.map((row, i) => {
                    if (row.kind === 'group') {
                      y += GROUP_ROW_HEIGHT;
                      return null;
                    }

                    const t = row.task;
                    const top = y;
                    y += ROW_HEIGHT;

                    const left = getBarLeft(t);
                    const width = getBarWidth(t);
                    const colors = getBarColor(t.color);
                    const barHeight = 26;
                    const barTop = top + (ROW_HEIGHT - barHeight) / 2;

                    return (
                      <Tooltip key={`bar-${t.id}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'absolute z-10 flex cursor-pointer items-center overflow-hidden rounded-md border transition-shadow hover:shadow-md',
                              colors.bg,
                              colors.border,
                            )}
                            style={{
                              left,
                              top: barTop,
                              width: Math.max(width, 4),
                              height: barHeight,
                            }}
                            onClick={() => onTaskClick?.(t)}
                          >
                            {/* Progress fill */}
                            <div
                              className={cn('absolute inset-y-0 left-0 rounded-l-md transition-all', colors.fill)}
                              style={{ width: `${t.progress}%`, opacity: 0.35 }}
                            />
                            {/* Label inside bar */}
                            {width > 60 && (
                              <span className={cn('relative z-10 truncate px-2 text-[11px] font-medium', colors.text)}>
                                {t.title}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{t.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {t.assignee}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatFullDate(parseDate(t.start))} &ndash; {formatFullDate(parseDate(t.end))}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {daysBetween(parseDate(t.start), parseDate(t.end))} days
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn('h-full rounded-full', colors.fill)}
                                  style={{ width: `${t.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{t.progress}%</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  });
                })()}

                {/* Mobile: task labels on the chart (visible when task list is hidden) */}
                {(() => {
                  let y = 0;
                  return rows.map((row, i) => {
                    if (row.kind === 'group') {
                      const g = row.group;
                      const top = y;
                      y += GROUP_ROW_HEIGHT;
                      return (
                        <button
                          key={`m-grp-${g.id}`}
                          type="button"
                          className="absolute left-2 z-30 flex items-center gap-1 sm:hidden"
                          style={{ top: top + (GROUP_ROW_HEIGHT - 20) / 2, height: 20 }}
                          onClick={() => toggleGroup(g.id)}
                        >
                          {g.collapsed ? (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs font-semibold">{g.name}</span>
                        </button>
                      );
                    }
                    y += ROW_HEIGHT;
                    return null;
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Legend / Summary ---- */}
        <div className="flex flex-wrap items-center gap-4 border-t px-4 py-2">
          {groups.map((g) => {
            const done = tasksProp.filter((t) => t.group === g.id && t.progress === 100).length;
            const total = tasksProp.filter((t) => t.group === g.id).length;
            return (
              <div key={g.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('h-2.5 w-2.5 rounded-full', groupDotColor(g.id))} />
                <span className="font-medium">{g.name}</span>
                <span>
                  {done}/{total}
                </span>
              </div>
            );
          })}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-3 w-0 border-l-2 border-dashed border-red-500/70" />
            <span>Today</span>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
