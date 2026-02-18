'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { CalendarEvent, CalendarView } from './types';

/* -------------------------------------------------------------------------- */
/*  Placeholder events                                                        */
/* -------------------------------------------------------------------------- */

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

function iso(day: number, hour: number, min = 0): string {
  return new Date(y, m, day, hour, min).toISOString();
}

const PLACEHOLDER_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', start: iso(3, 9), end: iso(3, 9, 30), color: 'blue', category: 'meeting' },
  { id: '2', title: 'Sprint Planning', start: iso(5, 10), end: iso(5, 12), color: 'purple', category: 'meeting' },
  { id: '3', title: 'Design Review', start: iso(7, 14), end: iso(7, 15), color: 'green', category: 'review' },
  { id: '4', title: 'Client Call', start: iso(10, 11), end: iso(10, 12), color: 'orange', category: 'meeting' },
  { id: '5', title: 'Deploy v2.1', start: iso(12, 16), end: iso(12, 17), color: 'red', category: 'deploy' },
  { id: '6', title: 'Lunch & Learn', start: iso(14, 12), end: iso(14, 13), color: 'yellow', category: 'social' },
  { id: '7', title: 'Board Meeting', start: iso(17, 9), end: iso(17, 11), color: 'purple', category: 'meeting' },
  { id: '8', title: '1-on-1 with Manager', start: iso(19, 15), end: iso(19, 15, 30), color: 'blue', category: 'meeting' },
  { id: '9', title: 'Product Demo', start: iso(21, 14), end: iso(21, 15, 30), color: 'green', category: 'review' },
  { id: '10', title: 'Team Retro', start: iso(24, 16), end: iso(24, 17), color: 'orange', category: 'meeting' },
  { id: '11', title: 'Conference Day', start: iso(26, 8), end: iso(26, 18), color: 'red', category: 'event', allDay: true },
  { id: '12', title: 'Release Party', start: iso(28, 17), end: iso(28, 19), color: 'yellow', category: 'social' },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: Date[][] = [];
  let current = new Date(year, month, 1 - startDay);

  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (weeks[weeks.length - 1][0].getMonth() !== month && w >= 4) break;
  }
  return weeks;
}

function getWeekDates(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const HOUR_START = 6;
const HOUR_END = 23;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

function formatHour(h: number) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${suffix}`;
}

const COLOR_MAP: Record<string, string> = {
  blue: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  purple: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
  green: 'border-l-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
  orange: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300',
  red: 'border-l-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
  yellow: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300',
};

function eventColor(color?: string) {
  return COLOR_MAP[color ?? 'blue'] ?? COLOR_MAP.blue;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddEvent?: (date: Date) => void;
}

/* -------------------------------------------------------------------------- */
/*  Calendar                                                                  */
/* -------------------------------------------------------------------------- */

export function Calendar({
  events = PLACEHOLDER_EVENTS,
  onEventClick,
  onDateClick,
  onAddEvent,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useCallback(
    (direction: -1 | 1) => {
      setCurrentDate((prev) => {
        const next = new Date(prev);
        if (view === 'month') next.setMonth(next.getMonth() + direction);
        else if (view === 'week') next.setDate(next.getDate() + 7 * direction);
        else next.setDate(next.getDate() + direction);
        return next;
      });
    },
    [view],
  );

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  const eventsOnDay = useCallback(
    (date: Date) => events.filter((e) => isSameDay(new Date(e.start), date)),
    [events],
  );

  const headerLabel = useMemo(() => {
    if (view === 'month')
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const week = getWeekDates(currentDate);
      const s = week[0];
      const e = week[6];
      if (s.getMonth() === e.getMonth())
        return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}\u2013${e.getDate()}, ${s.getFullYear()}`;
      return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} \u2013 ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [view, currentDate]);

  /* Current-time offset for time indicator */
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  const timeIndicatorTop = ((nowMinutes - HOUR_START * 60) / ((HOUR_END - HOUR_START) * 60)) * 100;

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[200px] text-center text-lg font-semibold">
            {headerLabel}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            Today
          </Button>
        </div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as CalendarView)}
          size="sm"
        >
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="p-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          {/* Weeks */}
          {getMonthGrid(currentDate.getFullYear(), currentDate.getMonth()).map(
            (week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(day, today);
                  const dayEvents = eventsOnDay(day);
                  const visible = dayEvents.slice(0, 3);
                  const overflow = dayEvents.length - 3;

                  return (
                    <button
                      key={di}
                      type="button"
                      onClick={() => {
                        onDateClick?.(day);
                        if (dayEvents.length > 0) {
                          setCurrentDate(day);
                          setView('day');
                        }
                      }}
                      className={cn(
                        'relative flex min-h-[80px] flex-col items-start gap-0.5 border border-transparent p-1 text-left transition-colors hover:bg-muted/50',
                        !isCurrentMonth && 'opacity-40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                          isToday && 'bg-primary font-bold text-primary-foreground ring-2 ring-primary/30',
                        )}
                      >
                        {day.getDate()}
                      </span>
                      {visible.map((evt) => (
                        <span
                          key={evt.id}
                          className={cn(
                            'block w-full truncate rounded border-l-2 px-1 text-[10px] leading-tight',
                            eventColor(evt.color),
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(evt);
                          }}
                        >
                          {evt.title}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{overflow} more
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ),
          )}
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="flex overflow-auto">
          {/* Time axis */}
          <div className="w-16 shrink-0 border-r pt-8">
            {HOURS.map((h) => (
              <div key={h} className="relative h-14">
                <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                  {formatHour(h)}
                </span>
              </div>
            ))}
          </div>
          {/* Day columns */}
          <div className="grid flex-1 grid-cols-7">
            {getWeekDates(currentDate).map((day, di) => {
              const isToday = isSameDay(day, today);
              const dayEvents = eventsOnDay(day);
              return (
                <div key={di} className="relative border-r last:border-r-0">
                  {/* Day header */}
                  <div
                    className={cn(
                      'sticky top-0 z-10 border-b bg-background px-1 py-1 text-center text-xs',
                      isToday && 'font-bold text-primary',
                    )}
                  >
                    {DAY_NAMES[day.getDay()]} {day.getDate()}
                  </div>
                  {/* Hour rows */}
                  <div className="relative">
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="h-14 border-b border-dashed border-muted"
                        onClick={() => onAddEvent?.(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h))}
                      />
                    ))}
                    {/* Events */}
                    {dayEvents.map((evt) => {
                      const start = new Date(evt.start);
                      const end = new Date(evt.end);
                      const startMin = start.getHours() * 60 + start.getMinutes();
                      const endMin = end.getHours() * 60 + end.getMinutes();
                      const top = ((startMin - HOUR_START * 60) / 60) * 56;
                      const height = Math.max(((endMin - startMin) / 60) * 56, 20);
                      return (
                        <div
                          key={evt.id}
                          className={cn(
                            'absolute inset-x-0.5 z-20 cursor-pointer overflow-hidden rounded border-l-2 px-1 text-[10px] leading-tight',
                            eventColor(evt.color),
                          )}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(evt);
                          }}
                        >
                          <span className="font-medium">{evt.title}</span>
                        </div>
                      );
                    })}
                    {/* Time indicator */}
                    {isToday && timeIndicatorTop >= 0 && timeIndicatorTop <= 100 && (
                      <div
                        className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-red-500"
                        style={{ top: `${(timeIndicatorTop / 100) * HOURS.length * 56}px` }}
                      >
                        <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day view */}
      {view === 'day' && (
        <div className="flex overflow-auto">
          {/* Time axis */}
          <div className="w-20 shrink-0 border-r">
            {HOURS.map((h) => (
              <div key={h} className="relative h-14">
                <span className="absolute -top-2 right-3 text-xs text-muted-foreground">
                  {formatHour(h)}
                </span>
              </div>
            ))}
          </div>
          {/* Events column */}
          <div className="relative flex-1">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-14 border-b border-dashed border-muted"
                onClick={() =>
                  onAddEvent?.(
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), h),
                  )
                }
              />
            ))}
            {/* Events */}
            {eventsOnDay(currentDate).map((evt) => {
              const start = new Date(evt.start);
              const end = new Date(evt.end);
              const startMin = start.getHours() * 60 + start.getMinutes();
              const endMin = end.getHours() * 60 + end.getMinutes();
              const top = ((startMin - HOUR_START * 60) / 60) * 56;
              const height = Math.max(((endMin - startMin) / 60) * 56, 28);
              return (
                <div
                  key={evt.id}
                  className={cn(
                    'absolute inset-x-1 z-20 cursor-pointer overflow-hidden rounded border-l-2 px-2 py-0.5 text-sm',
                    eventColor(evt.color),
                  )}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={() => onEventClick?.(evt)}
                >
                  <span className="font-medium">{evt.title}</span>
                  <span className="ml-2 text-xs opacity-70">
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' \u2013 '}
                    {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            {/* Time indicator */}
            {isSameDay(currentDate, today) && timeIndicatorTop >= 0 && timeIndicatorTop <= 100 && (
              <div
                className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-red-500"
                style={{ top: `${(timeIndicatorTop / 100) * HOURS.length * 56}px` }}
              >
                <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
