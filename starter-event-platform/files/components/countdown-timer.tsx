"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

const timeUnits: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (mounted && isExpired) {
    return (
      <div className="py-8 text-center">
        <p className="text-2xl font-bold text-purple-600">
          The event has started!
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {timeUnits.map(({ key, label }, index) => (
        <div key={key} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-purple-100 sm:h-20 sm:w-20 sm:rounded-2xl",
                "transition-all duration-300"
              )}
            >
              <span className="text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">
                {mounted
                  ? String(timeLeft[key]).padStart(2, "0")
                  : "--"}
              </span>
            </div>
            <span className="mt-2 text-xs font-medium uppercase tracking-wider text-purple-600 sm:text-sm">
              {label}
            </span>
          </div>

          {/* Colon separator between units (except after last) */}
          {index < timeUnits.length - 1 && (
            <span className="mb-5 text-xl font-bold text-purple-300 sm:text-2xl">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
