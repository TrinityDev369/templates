"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { TimeSlot } from "@/lib/types";

interface TimeSlotsProps {
  date: string;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function TimeSlots({ date, onSlotSelect }: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true);
      try {
        const response = await fetch(`/api/slots?date=${date}`);
        const data = await response.json();
        setSlots(data.slots || []);
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [date]);

  function handleSelect(slot: TimeSlot) {
    setSelectedId(slot.id);
    onSlotSelect(slot);
  }

  const availableSlots = slots.filter((s) => s.is_available);
  const unavailableSlots = slots.filter((s) => !s.is_available);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">{formatDate(date)}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {availableSlots.length} time slot{availableSlots.length !== 1 ? "s" : ""}{" "}
        available
      </p>

      {availableSlots.length === 0 ? (
        <div className="mt-6 rounded-lg bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
          No available time slots for this date. Please select another date.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {availableSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSelect(slot)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border p-3 text-sm transition-all hover:border-primary hover:bg-primary/5",
                selectedId === slot.id &&
                  "border-primary bg-primary/10 ring-1 ring-primary"
              )}
            >
              <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatTime(slot.start_time)}
              </span>
              <span className="text-xs text-muted-foreground">
                to {formatTime(slot.end_time)}
              </span>
            </button>
          ))}
        </div>
      )}

      {unavailableSlots.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground">
            Booked slots
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {unavailableSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground line-through"
              >
                <span>{formatTime(slot.start_time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
