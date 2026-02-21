'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 16, md: 24, lg: 32 } as const;
const FILLED = '#fbbf24';
const EMPTY = '#d1d5db';
const STAR = 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z';

function StarIcon({ fill, half, size }: { fill: boolean; half: boolean; size: number }) {
  const id = `half-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {half && (
        <defs>
          <clipPath id={id}><rect x="0" y="0" width="12" height="24" /></clipPath>
        </defs>
      )}
      {half && <path d={STAR} fill={FILLED} clipPath={`url(#${id})`} />}
      <path
        d={STAR}
        fill={fill && !half ? FILLED : half ? 'none' : EMPTY}
        stroke={half ? EMPTY : 'none'}
        strokeWidth={half ? 1 : 0}
      />
      {half && <path d={STAR} fill="none" stroke={FILLED} strokeWidth="0.5" />}
    </svg>
  );
}

function getStarState(i: number, rating: number): 'filled' | 'half' | 'empty' {
  if (rating >= i + 1) return 'filled';
  if (rating >= i + 0.5) return 'half';
  return 'empty';
}

export function StarRating({
  value, onChange, max = 5, readOnly = false, size = 'md', className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const px = SIZES[size];
  const display = hoverValue ?? value;

  const computeRating = useCallback(
    (idx: number, e: React.MouseEvent<HTMLSpanElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return (e.clientX - rect.left) < rect.width / 2 ? idx + 0.5 : idx + 1;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (readOnly || !onChange) return;
      const step = e.shiftKey ? 0.5 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(Math.min(max, value + step));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(Math.max(0, value - step));
      }
    },
    [readOnly, onChange, max, value],
  );

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
      className={[
        'inline-flex items-center gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded',
        readOnly ? 'pointer-events-none' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
    >
      {Array.from({ length: max }, (_, i) => {
        const state = getStarState(i, display);
        return (
          <span
            key={i}
            role="radio"
            aria-checked={value >= i + 0.5}
            aria-label={`${i + 1} star${i + 1 > 1 ? 's' : ''}`}
            className="transition-transform duration-150 hover:scale-110"
            onMouseMove={(e) => !readOnly && setHoverValue(computeRating(i, e))}
            onClick={(e) => !readOnly && onChange?.(computeRating(i, e))}
          >
            <StarIcon fill={state === 'filled'} half={state === 'half'} size={px} />
          </span>
        );
      })}
    </div>
  );
}
