'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CountdownTimerProps {
  targetDate?: Date;
  duration?: number;
  onComplete?: () => void;
  showDays?: boolean;
  showLabels?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function CountdownTimer({
  targetDate,
  duration,
  onComplete,
  showDays = true,
  showLabels = true,
  className = '',
  variant = 'default',
}: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<number>(0);
  const firedRef = useRef(false);

  useEffect(() => {
    targetRef.current = targetDate
      ? targetDate.getTime()
      : Date.now() + (duration ?? 0) * 1000;
    firedRef.current = false;
    setMounted(true);
  }, [targetDate, duration]);

  const getTime = useCallback(() => calcTimeLeft(targetRef.current), []);
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!mounted) return;
    setTime(getTime());
    const id = setInterval(() => {
      const t = getTime();
      setTime(t);
      if (!firedRef.current && t.days + t.hours + t.minutes + t.seconds === 0) {
        firedRef.current = true;
        onComplete?.();
      }
    }, 1000);
    const onVis = () => {
      if (document.visibilityState === 'visible') setTime(getTime());
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [mounted, getTime, onComplete]);

  if (!mounted) {
    return <div className={className} />;
  }

  const segments: { value: string; label: string }[] = [];
  if (showDays) segments.push({ value: pad(time.days), label: 'Days' });
  segments.push(
    { value: pad(time.hours), label: 'Hours' },
    { value: pad(time.minutes), label: 'Minutes' },
    { value: pad(time.seconds), label: 'Seconds' },
  );

  if (variant === 'compact') {
    return (
      <span className={`font-mono text-lg tabular-nums tracking-wide ${className}`}>
        {segments.map((s) => s.value).join(':')}
      </span>
    );
  }

  if (variant === 'minimal') {
    return (
      <span className={`tabular-nums tracking-wide ${className}`}>
        {segments.map((s) => s.value).join(' ')}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-3">
          {i > 0 && (
            <span className="text-2xl font-bold text-neutral-400 -mt-4 select-none">:</span>
          )}
          <div className="flex flex-col items-center">
            <span className="tabular-nums text-4xl font-bold bg-neutral-900 text-white rounded-lg px-4 py-3 min-w-[4rem] text-center transition-all duration-300">
              {seg.value}
            </span>
            {showLabels && (
              <span className="mt-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
                {seg.label}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
