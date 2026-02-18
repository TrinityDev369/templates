import type { LucideIcon } from "lucide-react";

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  description?: string;
  change?: number;
  trend: "up" | "down" | "neutral";
  icon?: LucideIcon;
  sparkline?: number[];
}
