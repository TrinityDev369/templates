"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type {
  TimelineProps,
  TimelineItemProps,
  TimelineVariant,
} from "./timeline.types";

/* ------------------------------------------------------------------ */
/*  Size configuration                                                */
/* ------------------------------------------------------------------ */

const sizeConfig = {
  sm: { dot: "h-6 w-6", text: "text-xs", gap: "gap-3", padding: "pb-6" },
  md: { dot: "h-8 w-8", text: "text-sm", gap: "gap-4", padding: "pb-8" },
  lg: { dot: "h-10 w-10", text: "text-base", gap: "gap-5", padding: "pb-10" },
} as const;

const connectorWidthMap = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
} as const;

/* ------------------------------------------------------------------ */
/*  Default icon (inline SVG circle-dot)                              */
/* ------------------------------------------------------------------ */

function DefaultIcon({ index }: { index: number }) {
  return (
    <span className="flex items-center justify-center text-[10px] font-semibold leading-none text-inherit">
      {index + 1}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  useInView hook (IntersectionObserver)                             */
/* ------------------------------------------------------------------ */

function useInView(enabled: boolean): [React.RefCallback<HTMLElement>, boolean] {
  const [isVisible, setIsVisible] = React.useState(!enabled);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const ref = React.useCallback(
    (node: HTMLElement | null) => {
      if (!enabled) return;

      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        },
        { threshold: 0.15 }
      );

      observerRef.current.observe(node);
    },
    [enabled]
  );

  return [ref, isVisible];
}

/* ------------------------------------------------------------------ */
/*  Determine which side an item sits on                              */
/* ------------------------------------------------------------------ */

function getItemSide(
  variant: TimelineVariant,
  index: number
): "left" | "right" {
  switch (variant) {
    case "alternating":
      return index % 2 === 0 ? "left" : "right";
    case "left":
      return "left";
    case "right":
    case "default":
    default:
      return "right";
  }
}

/* ------------------------------------------------------------------ */
/*  TimelineEntry                                                     */
/* ------------------------------------------------------------------ */

export function TimelineEntry({
  item,
  index,
  isLast,
  variant,
  size,
  connectorStyle,
  animated,
}: TimelineItemProps) {
  const [ref, isVisible] = useInView(animated);
  const cfg = sizeConfig[size];
  const side = getItemSide(variant, index);
  const isAlternating = variant === "alternating";

  return (
    <li
      ref={ref}
      role="listitem"
      aria-label={item.title}
      className={cn(
        "relative grid",
        isAlternating
          ? "grid-cols-[1fr_auto_1fr]"
          : side === "right"
            ? "grid-cols-[auto_1fr]"
            : "grid-cols-[1fr_auto]",
        cfg.gap,
        !isLast && cfg.padding,
        animated &&
          "transition-all duration-700 ease-out",
        animated && !isVisible && "opacity-0 translate-y-4",
        animated && isVisible && "opacity-100 translate-y-0"
      )}
    >
      {/* LEFT CONTENT (only in alternating mode) */}
      {isAlternating && (
        <div className="flex justify-end">
          {side === "left" ? (
            <ItemContent item={item} size={size} align="right" />
          ) : (
            <DateLabel date={item.date} size={size} align="right" />
          )}
        </div>
      )}

      {/* LEFT CONTENT (non-alternating, left variant) */}
      {!isAlternating && side === "left" && (
        <ItemContent item={item} size={size} align="right" />
      )}

      {/* CENTER DOT + CONNECTOR */}
      <div className="relative flex flex-col items-center">
        {/* Icon dot */}
        <div
          className={cn(
            "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm",
            cfg.dot,
            item.iconColor ?? "bg-primary text-primary-foreground"
          )}
        >
          {item.icon ?? <DefaultIcon index={index} />}
        </div>

        {/* Vertical connector line */}
        {!isLast && (
          <div
            className={cn(
              "flex-1 border-l-2 mt-1",
              connectorWidthMap[connectorStyle],
              "border-border"
            )}
          />
        )}
      </div>

      {/* RIGHT CONTENT (non-alternating, right/default variant) */}
      {!isAlternating && side === "right" && (
        <ItemContent item={item} size={size} align="left" />
      )}

      {/* RIGHT CONTENT (alternating mode) */}
      {isAlternating && (
        <div className="flex justify-start">
          {side === "right" ? (
            <ItemContent item={item} size={size} align="left" />
          ) : (
            <DateLabel date={item.date} size={size} align="left" />
          )}
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  ItemContent (card with title, description, date, custom content)  */
/* ------------------------------------------------------------------ */

function ItemContent({
  item,
  size,
  align,
}: {
  item: TimelineItemProps["item"];
  size: TimelineItemProps["size"];
  align: "left" | "right";
}) {
  const cfg = sizeConfig[size];

  return (
    <div
      className={cn(
        "min-w-0 max-w-sm",
        align === "right" && "text-right"
      )}
    >
      <Card className={cn("p-4", align === "right" && "ml-auto")}>
        <h3 className={cn("font-semibold", cfg.text)}>{item.title}</h3>
        {item.description && (
          <p
            className={cn(
              "mt-1 text-muted-foreground leading-relaxed",
              size === "sm" ? "text-[11px]" : "text-xs"
            )}
          >
            {item.description}
          </p>
        )}
        {item.content && <div className="mt-2">{item.content}</div>}
      </Card>
      {/* Date shown below card in non-alternating layouts */}
      {item.date && (
        <p
          className={cn(
            "mt-1.5 text-xs text-muted-foreground",
            align === "right" && "text-right"
          )}
        >
          {item.date}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DateLabel (alternating mode: date on opposite side)               */
/* ------------------------------------------------------------------ */

function DateLabel({
  date,
  size,
  align,
}: {
  date?: string;
  size: TimelineItemProps["size"];
  align: "left" | "right";
}) {
  if (!date) return <div />;

  return (
    <div
      className={cn(
        "flex items-start pt-2",
        align === "right" ? "justify-end" : "justify-start"
      )}
    >
      <span
        className={cn(
          "text-muted-foreground font-medium whitespace-nowrap",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {date}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline (main component)                                         */
/* ------------------------------------------------------------------ */

export function Timeline({
  items,
  variant = "default",
  animated = false,
  lineColor,
  size = "md",
  connectorStyle = "solid",
}: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No timeline items</p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      aria-label="Timeline"
      className="relative list-none p-0 m-0"
      style={lineColor ? ({ "--timeline-line": lineColor } as React.CSSProperties) : undefined}
    >
      {items.map((item, index) => (
        <TimelineEntry
          key={item.id}
          item={item}
          index={index}
          isLast={index === items.length - 1}
          variant={variant}
          size={size}
          connectorStyle={connectorStyle}
          animated={animated}
        />
      ))}
    </ul>
  );
}
