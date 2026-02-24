"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = new Date().getTime();
  const distance = target.getTime() - now;

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

interface FlipDigitProps {
  value: string;
  label: string;
  prevValue: string;
}

function FlipDigit({ value, label, prevValue }: FlipDigitProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const prevRef = useRef(prevValue);

  useEffect(() => {
    if (value !== prevRef.current) {
      setIsFlipping(true);
      prevRef.current = value;
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" aria-label={`${value} ${label}`}>
        {/* Card container */}
        <div
          className={cn(
            "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl",
            "bg-white/10 backdrop-blur-sm",
            "border border-white/10",
            "shadow-lg shadow-black/20",
            "sm:h-24 sm:w-24",
            "md:h-28 md:w-28"
          )}
        >
          {/* Top half divider line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />

          {/* Number display */}
          <span
            className={cn(
              "relative z-10 text-3xl font-bold tabular-nums tracking-wider text-white",
              "sm:text-4xl md:text-5xl",
              "transition-transform duration-300",
              isFlipping && "animate-tick"
            )}
          >
            {value}
          </span>

          {/* Shine effect on top half */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
        </div>

        {/* Tick animation keyframes are handled via inline style below */}
      </div>

      <span className="text-xs font-semibold uppercase tracking-widest text-white/50 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      setPrevTimeLeft(prev);
      return calculateTimeLeft(targetDate);
    });
  }, [targetDate]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (!mounted) {
    return (
      <div className={cn("flex items-center justify-center gap-3 sm:gap-4 md:gap-6", className)}>
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 animate-pulse rounded-xl bg-white/10 sm:h-24 sm:w-24 md:h-28 md:w-28" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50 sm:text-sm">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className={cn("text-center", className)}>
        <p className="text-2xl font-bold text-white sm:text-3xl">
          We are live!
        </p>
      </div>
    );
  }

  const segments: { value: string; label: string; prevValue: string }[] = [
    {
      value: pad(timeLeft.days),
      label: "Days",
      prevValue: pad(prevTimeLeft.days),
    },
    {
      value: pad(timeLeft.hours),
      label: "Hours",
      prevValue: pad(prevTimeLeft.hours),
    },
    {
      value: pad(timeLeft.minutes),
      label: "Minutes",
      prevValue: pad(prevTimeLeft.minutes),
    },
    {
      value: pad(timeLeft.seconds),
      label: "Seconds",
      prevValue: pad(prevTimeLeft.seconds),
    },
  ];

  return (
    <>
      {/* Tick animation keyframes */}
      <style jsx global>{`
        @keyframes tick {
          0% {
            transform: scaleY(1);
          }
          25% {
            transform: scaleY(0.85);
          }
          50% {
            transform: scaleY(1.05);
          }
          100% {
            transform: scaleY(1);
          }
        }
        .animate-tick {
          animation: tick 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <div
        className={cn(
          "flex items-center justify-center gap-3 sm:gap-4 md:gap-6",
          className
        )}
        role="timer"
        aria-live="polite"
      >
        {segments.map((seg) => (
          <FlipDigit
            key={seg.label}
            value={seg.value}
            label={seg.label}
            prevValue={seg.prevValue}
          />
        ))}
      </div>
    </>
  );
}
