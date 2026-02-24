"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailableDate {
  date: string;
  available_count: number;
}

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const m = format(month, "M");
      const y = format(month, "yyyy");
      const response = await fetch(`/api/slots?month=${m}&year=${y}`);
      const data = await response.json();
      setAvailableDates(data.slots || []);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      setAvailableDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability(currentMonth);
  }, [currentMonth, fetchAvailability]);

  function handlePrevMonth() {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }

  function isDateAvailable(date: Date): boolean {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = availableDates.find((d) => d.date === dateStr);
    return !!entry && entry.available_count > 0;
  }

  function getAvailableCount(date: Date): number {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = availableDates.find((d) => d.date === dateStr);
    return entry?.available_count || 0;
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="mt-6 grid grid-cols-7 text-center">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const past = isBefore(startOfDay(day), startOfDay(new Date()));
          const available = inMonth && !past && isDateAvailable(day);
          const count = getAvailableCount(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (available) {
                  onDateSelect(format(day, "yyyy-MM-dd"));
                }
              }}
              disabled={!available || loading}
              className={cn(
                "relative flex h-14 flex-col items-center justify-center rounded-md text-sm transition-colors",
                !inMonth && "text-muted-foreground/30",
                inMonth && past && "text-muted-foreground/50",
                inMonth && !past && !available && "text-muted-foreground",
                available &&
                  "cursor-pointer font-medium hover:bg-primary/10 hover:text-primary",
                today && "ring-1 ring-primary/30"
              )}
            >
              <span>{format(day, "d")}</span>
              {available && (
                <span className="absolute bottom-1 text-[10px] text-primary">
                  {count} slot{count !== 1 ? "s" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Loading availability...
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-primary/10 ring-1 ring-primary/20" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
