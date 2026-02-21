"use client";

import { useState } from "react";
import { Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleEntry } from "@/types";

const days = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
] as const;

type DayKey = (typeof days)[number]["key"];

interface ScheduleTableProps {
  schedule: ScheduleEntry[];
}

function getDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return `${diff} min`;
}

export function ScheduleTable({ schedule }: ScheduleTableProps) {
  const [activeDay, setActiveDay] = useState<DayKey>("monday");

  const filtered = schedule
    .filter((entry) => entry.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div>
      {/* Day tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-gray-900 p-1">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            onClick={() => setActiveDay(day.key)}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
              activeDay === day.key
                ? "bg-brand-500 text-white shadow-md"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">
            No classes scheduled for this day.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          {/* Header */}
          <div className="hidden border-b border-gray-800 bg-gray-950 sm:grid sm:grid-cols-5">
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Time
            </div>
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Class
            </div>
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Trainer
            </div>
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Room
            </div>
            <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Duration
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-800 bg-gray-900">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-gray-800/50 sm:grid-cols-5 sm:items-center sm:gap-0"
              >
                {/* Time */}
                <div className="flex items-center gap-2 sm:gap-0">
                  <Clock className="h-4 w-4 text-brand-500 sm:mr-2" />
                  <span className="text-sm font-medium text-white">
                    {entry.startTime} - {entry.endTime}
                  </span>
                </div>

                {/* Class name */}
                <div>
                  <span className="text-sm font-semibold text-brand-400">
                    {entry.className}
                  </span>
                </div>

                {/* Trainer */}
                <div className="flex items-center gap-2 sm:gap-0">
                  <User className="h-3.5 w-3.5 text-gray-500 sm:mr-2" />
                  <span className="text-sm text-gray-300">
                    {entry.trainerName}
                  </span>
                </div>

                {/* Room */}
                <div className="flex items-center gap-2 sm:gap-0">
                  <MapPin className="h-3.5 w-3.5 text-gray-500 sm:mr-2" />
                  <span className="text-sm text-gray-400">{entry.room}</span>
                </div>

                {/* Duration */}
                <div>
                  <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
                    {getDuration(entry.startTime, entry.endTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
