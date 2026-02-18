import type { ReactNode } from "react";

export type TimelineVariant = "default" | "alternating" | "left" | "right";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: ReactNode;
  iconColor?: string;
  content?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  animated?: boolean;
  lineColor?: string;
  size?: "sm" | "md" | "lg";
  connectorStyle?: "solid" | "dashed" | "dotted";
}

export interface TimelineItemProps {
  item: TimelineItem;
  index: number;
  isLast: boolean;
  variant: TimelineVariant;
  size: "sm" | "md" | "lg";
  connectorStyle: "solid" | "dashed" | "dotted";
  animated: boolean;
}
