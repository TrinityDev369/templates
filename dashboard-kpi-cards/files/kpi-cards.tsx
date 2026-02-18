"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
} from "lucide-react";
import type { KpiCard } from "./types";

/* -------------------------------------------------------------------------- */
/*  Sparkline - inline SVG mini-chart (zero external dependencies)            */
/* -------------------------------------------------------------------------- */

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "currentColor",
  className,
}: SparklineProps) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Pad by 2px on each side so the stroke is not clipped at edges
  const padX = 2;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * innerW;
      const y = padY + innerH - ((v - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trend configuration                                                       */
/* -------------------------------------------------------------------------- */

const trendConfig = {
  up: {
    icon: TrendingUp,
    text: "text-green-500",
    bg: "bg-green-500/10",
    sparkline: "#22c55e",
  },
  down: {
    icon: TrendingDown,
    text: "text-red-500",
    bg: "bg-red-500/10",
    sparkline: "#ef4444",
  },
  neutral: {
    icon: Minus,
    text: "text-muted-foreground",
    bg: "bg-muted",
    sparkline: "#737373",
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  KpiCardItem                                                               */
/* -------------------------------------------------------------------------- */

interface KpiCardItemProps {
  card: KpiCard;
  className?: string;
}

function KpiCardItem({ card, className }: KpiCardItemProps) {
  const {
    label,
    value,
    description,
    change,
    trend,
    icon: Icon,
    sparkline,
  } = card;
  const config = trendConfig[trend];
  const TrendIcon = config.icon;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{value}</p>

            <div className="flex items-center gap-1.5">
              {change !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                    config.text,
                    config.bg
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          </div>

          {sparkline && sparkline.length > 1 && (
            <Sparkline
              data={sparkline}
              width={80}
              height={32}
              color={config.sparkline}
              className="opacity-80"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  KpiCards (responsive grid container)                                       */
/* -------------------------------------------------------------------------- */

interface KpiCardsProps {
  cards: KpiCard[];
  className?: string;
}

export function KpiCards({ cards, className }: KpiCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => (
        <KpiCardItem key={card.id} card={card} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

export const PLACEHOLDER_KPI_CARDS: KpiCard[] = [
  {
    id: "total-revenue",
    label: "Total Revenue",
    value: "$45,231.89",
    description: "from last month",
    change: 20.1,
    trend: "up",
    icon: DollarSign,
    sparkline: [18, 22, 19, 25, 30, 28, 35, 32, 40, 38, 42, 45],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    value: "2,350",
    description: "from last month",
    change: -3.2,
    trend: "down",
    icon: Users,
  },
  {
    id: "active-users",
    label: "Active Users",
    value: "12,543",
    description: "from last month",
    change: 12.5,
    trend: "up",
    icon: Activity,
    sparkline: [80, 85, 78, 92, 95, 88, 100, 105, 110, 108, 115, 125],
  },
  {
    id: "conversion-rate",
    label: "Conversion Rate",
    value: "3.2%",
    description: "from last month",
    change: 0.3,
    trend: "neutral",
    icon: ShoppingCart,
  },
];
