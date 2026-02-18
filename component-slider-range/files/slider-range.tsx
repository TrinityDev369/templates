"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  SliderValue,
  SliderMark,
  SliderRangeProps,
} from "./slider-range.types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function isRange(v: SliderValue): v is [number, number] {
  return Array.isArray(v);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value: number, min: number, step: number): number {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

function pct(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/* -------------------------------------------------------------------------- */
/*  Size & variant maps                                                       */
/* -------------------------------------------------------------------------- */

const trackSizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

const trackSizeClassesVertical = {
  sm: "w-1",
  md: "w-2",
  lg: "w-3",
} as const;

const thumbSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4.5 w-4.5",
  lg: "h-6 w-6",
} as const;

const fillVariantClasses = {
  default: "bg-primary",
  accent: "bg-secondary",
  gradient: "",
} as const;

const thumbVariantClasses = {
  default: "border-primary",
  accent: "border-secondary",
  gradient: "border-primary",
} as const;

/* -------------------------------------------------------------------------- */
/*  Thumb sub-component                                                       */
/* -------------------------------------------------------------------------- */

interface ThumbProps {
  value: number;
  index: number;
  min: number;
  max: number;
  step: number;
  size: "sm" | "md" | "lg";
  variant: "default" | "accent" | "gradient";
  orientation: "horizontal" | "vertical";
  disabled: boolean;
  showTooltip: boolean | "always";
  formatValue: (v: number) => string;
  label?: string;
  onDragStart: (index: number, e: React.PointerEvent) => void;
  onKeyStep: (index: number, delta: number, absolute?: number) => void;
  onCommit: () => void;
  isDragging: boolean;
}

const Thumb = React.forwardRef<HTMLDivElement, ThumbProps>(function Thumb(
  {
    value,
    index,
    min,
    max,
    step,
    size,
    variant,
    orientation,
    disabled,
    showTooltip,
    formatValue,
    label,
    onDragStart,
    onKeyStep,
    onCommit,
    isDragging,
  },
  ref
) {
  const [hovered, setHovered] = React.useState(false);
  const isHorizontal = orientation === "horizontal";
  const position = pct(value, min, max);

  const tooltipVisible =
    showTooltip === "always" || (showTooltip && (hovered || isDragging));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    const bigStep = step * 10;
    let handled = true;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        onKeyStep(index, step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        onKeyStep(index, -step);
        break;
      case "PageUp":
        onKeyStep(index, bigStep);
        break;
      case "PageDown":
        onKeyStep(index, -bigStep);
        break;
      case "Home":
        onKeyStep(index, 0, min);
        break;
      case "End":
        onKeyStep(index, 0, max);
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const navKeys = [
      "ArrowRight",
      "ArrowLeft",
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
    ];
    if (navKeys.includes(e.key)) {
      onCommit();
    }
  };

  const positionStyle: React.CSSProperties = isHorizontal
    ? { left: `${position}%`, top: "50%", transform: "translate(-50%, -50%)" }
    : {
        bottom: `${position}%`,
        left: "50%",
        transform: "translate(-50%, 50%)",
      };

  const thumbEl = (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-orientation={orientation}
      aria-label={label ? `${label} thumb ${index + 1}` : `Slider thumb ${index + 1}`}
      aria-disabled={disabled || undefined}
      className={cn(
        "absolute z-10 rounded-full border-2 bg-white shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transition-shadow duration-150",
        thumbSizeClasses[size],
        thumbVariantClasses[variant],
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-grab active:cursor-grabbing hover:shadow-md"
      )}
      style={positionStyle}
      onPointerDown={(e) => {
        if (!disabled) onDragStart(index, e);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    />
  );

  if (showTooltip === false) return thumbEl;

  return (
    <Tooltip open={tooltipVisible}>
      <TooltipTrigger asChild>{thumbEl}</TooltipTrigger>
      <TooltipContent
        side={isHorizontal ? "top" : "right"}
        className="px-2 py-1 text-xs font-medium"
      >
        {formatValue(value)}
      </TooltipContent>
    </Tooltip>
  );
});

/* -------------------------------------------------------------------------- */
/*  SliderRange component                                                     */
/* -------------------------------------------------------------------------- */

export function SliderRange({
  value: controlledValue,
  defaultValue = 50,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = "horizontal",
  size = "md",
  variant = "default",
  showTooltip = true,
  showMarks = false,
  marks,
  formatValue = String,
  minDistance = 0,
  label,
  name,
}: SliderRangeProps) {
  /* --- State --- */
  const [internalValue, setInternalValue] = React.useState<SliderValue>(
    controlledValue ?? defaultValue
  );
  const currentValue = controlledValue ?? internalValue;
  const isRangeMode = isRange(currentValue);

  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const thumb0Ref = React.useRef<HTMLDivElement>(null);
  const thumb1Ref = React.useRef<HTMLDivElement>(null);

  /* Track whether value changed programmatically (for CSS transitions). */
  const [animate, setAnimate] = React.useState(false);
  const prevValueRef = React.useRef(currentValue);

  React.useEffect(() => {
    if (draggingIndex === null) {
      const prev = prevValueRef.current;
      const curr = currentValue;
      const changed = JSON.stringify(prev) !== JSON.stringify(curr);
      if (changed) setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 200);
      prevValueRef.current = curr;
      return () => clearTimeout(timer);
    }
    prevValueRef.current = currentValue;
  }, [currentValue, draggingIndex]);

  const isHorizontal = orientation === "horizontal";

  /* --- Value update --- */
  const updateValue = React.useCallback(
    (next: SliderValue) => {
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [controlledValue, onChange]
  );

  const commitValue = React.useCallback(() => {
    onChangeEnd?.(controlledValue ?? internalValue);
  }, [controlledValue, internalValue, onChangeEnd]);

  /* --- Position -> value conversion --- */
  const positionToValue = React.useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();

      let ratio: number;
      if (isHorizontal) {
        ratio = (clientX - rect.left) / rect.width;
      } else {
        ratio = 1 - (clientY - rect.top) / rect.height;
      }

      ratio = clamp(ratio, 0, 1);
      const raw = min + ratio * (max - min);
      return clamp(roundToStep(raw, min, step), min, max);
    },
    [isHorizontal, min, max, step]
  );

  /* --- Enforce min distance for range mode --- */
  const enforceConstraints = React.useCallback(
    (vals: [number, number], changedIndex: number): [number, number] => {
      const result: [number, number] = [...vals];

      if (minDistance > 0) {
        if (changedIndex === 0) {
          result[0] = Math.min(result[0], result[1] - minDistance);
        } else {
          result[1] = Math.max(result[1], result[0] + minDistance);
        }
      }

      /* Always ensure low <= high. */
      if (result[0] > result[1]) {
        if (changedIndex === 0) {
          result[0] = result[1] - minDistance;
        } else {
          result[1] = result[0] + minDistance;
        }
      }

      result[0] = clamp(result[0], min, max);
      result[1] = clamp(result[1], min, max);

      return result;
    },
    [min, max, minDistance]
  );

  /* --- Pointer drag --- */
  const handleDragStart = React.useCallback(
    (index: number, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDraggingIndex(index);

      const onPointerMove = (ev: PointerEvent) => {
        const newVal = positionToValue(ev.clientX, ev.clientY);

        if (isRangeMode) {
          const cur = currentValue as [number, number];
          const updated: [number, number] = [...cur];
          updated[index] = newVal;
          updateValue(enforceConstraints(updated, index));
        } else {
          updateValue(newVal);
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
        setDraggingIndex(null);

        /* Fire onChangeEnd after the final move. */
        const finalVal = positionToValue(ev.clientX, ev.clientY);
        if (isRangeMode) {
          const cur = currentValue as [number, number];
          const updated: [number, number] = [...cur];
          updated[index] = finalVal;
          const constrained = enforceConstraints(updated, index);
          if (controlledValue === undefined) {
            setInternalValue(constrained);
          }
          onChange?.(constrained);
          onChangeEnd?.(constrained);
        } else {
          if (controlledValue === undefined) {
            setInternalValue(finalVal);
          }
          onChange?.(finalVal);
          onChangeEnd?.(finalVal);
        }

        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    },
    [
      positionToValue,
      isRangeMode,
      currentValue,
      updateValue,
      enforceConstraints,
      controlledValue,
      onChange,
      onChangeEnd,
    ]
  );

  /* --- Track click --- */
  const handleTrackClick = React.useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      /* Ignore if originating from a thumb. */
      if ((e.target as HTMLElement).getAttribute("role") === "slider") return;

      const newVal = positionToValue(e.clientX, e.clientY);

      if (isRangeMode) {
        const [lo, hi] = currentValue as [number, number];
        const distLo = Math.abs(newVal - lo);
        const distHi = Math.abs(newVal - hi);
        const closerIndex = distLo <= distHi ? 0 : 1;
        const updated: [number, number] = [lo, hi];
        updated[closerIndex] = newVal;
        const constrained = enforceConstraints(updated, closerIndex);
        updateValue(constrained);
        onChangeEnd?.(constrained);

        /* Focus the moved thumb. */
        const thumbRef = closerIndex === 0 ? thumb0Ref : thumb1Ref;
        thumbRef.current?.focus();
      } else {
        updateValue(newVal);
        onChangeEnd?.(newVal);
        thumb0Ref.current?.focus();
      }
    },
    [
      disabled,
      positionToValue,
      isRangeMode,
      currentValue,
      enforceConstraints,
      updateValue,
      onChangeEnd,
    ]
  );

  /* --- Keyboard step --- */
  const handleKeyStep = React.useCallback(
    (index: number, delta: number, absolute?: number) => {
      if (isRangeMode) {
        const [lo, hi] = currentValue as [number, number];
        const updated: [number, number] = [lo, hi];
        updated[index] =
          absolute !== undefined
            ? absolute
            : clamp(updated[index] + delta, min, max);
        updated[index] = roundToStep(updated[index], min, step);
        updated[index] = clamp(updated[index], min, max);
        updateValue(enforceConstraints(updated, index));
      } else {
        const cur = currentValue as number;
        const next =
          absolute !== undefined
            ? absolute
            : clamp(cur + delta, min, max);
        updateValue(clamp(roundToStep(next, min, step), min, max));
      }
    },
    [isRangeMode, currentValue, min, max, step, updateValue, enforceConstraints]
  );

  /* --- Render values --- */
  const values: number[] = isRangeMode
    ? (currentValue as [number, number])
    : [currentValue as number];

  const fillStart = isRangeMode ? pct(values[0], min, max) : 0;
  const fillEnd = isRangeMode
    ? pct(values[1], min, max)
    : pct(values[0], min, max);

  /* --- Marks --- */
  const resolvedMarks: SliderMark[] = React.useMemo(() => {
    if (marks) return marks;
    if (!showMarks) return [];
    /* Auto-generate marks at each step if range is reasonable. */
    const count = (max - min) / step;
    if (count > 20) {
      /* Too many — generate ~5 evenly spaced marks. */
      const interval = (max - min) / 5;
      const result: SliderMark[] = [];
      for (let v = min; v <= max; v += interval) {
        result.push({ value: roundToStep(v, min, step) });
      }
      return result;
    }
    const result: SliderMark[] = [];
    for (let v = min; v <= max; v += step) {
      result.push({ value: v });
    }
    return result;
  }, [marks, showMarks, min, max, step]);

  /* --- Gradient style --- */
  const fillStyle: React.CSSProperties =
    variant === "gradient"
      ? isHorizontal
        ? {
            left: `${fillStart}%`,
            width: `${fillEnd - fillStart}%`,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary, #8b5cf6))",
          }
        : {
            bottom: `${fillStart}%`,
            height: `${fillEnd - fillStart}%`,
            background: "linear-gradient(0deg, var(--color-primary), var(--color-secondary, #8b5cf6))",
          }
      : isHorizontal
        ? { left: `${fillStart}%`, width: `${fillEnd - fillStart}%` }
        : { bottom: `${fillStart}%`, height: `${fillEnd - fillStart}%` };

  const transitionClass = animate ? "transition-all duration-200 ease-out" : "";

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative select-none touch-none",
          isHorizontal ? "w-full" : "h-full",
          disabled && "pointer-events-none opacity-50"
        )}
        aria-label={label}
      >
        {/* Hidden inputs for form submission */}
        {name &&
          values.map((v, i) => (
            <input
              key={i}
              type="hidden"
              name={isRangeMode ? `${name}[${i}]` : name}
              value={v}
            />
          ))}

        {/* Track */}
        <div
          ref={trackRef}
          className={cn(
            "relative rounded-full bg-muted cursor-pointer",
            isHorizontal
              ? cn("w-full", trackSizeClasses[size])
              : cn("h-full", trackSizeClassesVertical[size]),
            isHorizontal ? "my-3" : "mx-3"
          )}
          onPointerDown={handleTrackClick}
        >
          {/* Filled range */}
          <div
            className={cn(
              "absolute rounded-full",
              isHorizontal ? "h-full" : "w-full",
              variant !== "gradient" && fillVariantClasses[variant],
              transitionClass
            )}
            style={fillStyle}
          />

          {/* Marks */}
          {resolvedMarks.length > 0 &&
            resolvedMarks.map((mark) => {
              const pos = pct(mark.value, min, max);
              const isActive = isRangeMode
                ? mark.value >= values[0] && mark.value <= values[1]
                : mark.value <= values[0];

              return (
                <React.Fragment key={mark.value}>
                  {/* Mark dot */}
                  <div
                    className={cn(
                      "absolute rounded-full",
                      isHorizontal
                        ? "top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2"
                        : "left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2",
                      isActive ? "bg-white" : "bg-muted-foreground/40"
                    )}
                    style={
                      isHorizontal
                        ? { left: `${pos}%` }
                        : { bottom: `${pos}%` }
                    }
                  />
                  {/* Mark label */}
                  {mark.label && (
                    <span
                      className={cn(
                        "absolute text-xs text-muted-foreground whitespace-nowrap",
                        isHorizontal
                          ? "top-full mt-2 -translate-x-1/2"
                          : "left-full ml-3 translate-y-1/2"
                      )}
                      style={
                        isHorizontal
                          ? { left: `${pos}%` }
                          : { bottom: `${pos}%` }
                      }
                    >
                      {mark.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}

          {/* Thumbs */}
          <Thumb
            ref={thumb0Ref}
            value={values[0]}
            index={0}
            min={min}
            max={max}
            step={step}
            size={size}
            variant={variant}
            orientation={orientation}
            disabled={disabled}
            showTooltip={showTooltip}
            formatValue={formatValue}
            label={label}
            onDragStart={handleDragStart}
            onKeyStep={handleKeyStep}
            onCommit={commitValue}
            isDragging={draggingIndex === 0}
          />

          {isRangeMode && (
            <Thumb
              ref={thumb1Ref}
              value={values[1]}
              index={1}
              min={min}
              max={max}
              step={step}
              size={size}
              variant={variant}
              orientation={orientation}
              disabled={disabled}
              showTooltip={showTooltip}
              formatValue={formatValue}
              label={label}
              onDragStart={handleDragStart}
              onKeyStep={handleKeyStep}
              onCommit={commitValue}
              isDragging={draggingIndex === 1}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
