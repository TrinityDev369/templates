"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({ slots, onSelect }: TimeSlotPickerProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  function handleSelect(slot: TimeSlot) {
    if (!slot.available) return;
    setSelectedTime(slot.time);
    onSelect(slot.time);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-brand-500" />
        <h3 className="text-sm font-semibold text-gray-900">
          Select a Time Slot
        </h3>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-gray-200 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-500" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gray-100" />
          <span>Unavailable</span>
        </div>
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={!isAvailable}
              onClick={() => handleSelect(slot)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                isSelected
                  ? "border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                  : isAvailable
                    ? "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through"
              )}
              aria-label={`${slot.time}${!isAvailable ? " (unavailable)" : ""}${isSelected ? " (selected)" : ""}`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>

      {/* Selected confirmation */}
      {selectedTime && (
        <p className="mt-4 text-sm text-brand-600">
          Selected:{" "}
          <span className="font-semibold">{selectedTime}</span>
        </p>
      )}
    </div>
  );
}
