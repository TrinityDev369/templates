import type { LucideIcon } from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  icon?: LucideIcon;
  type: "info" | "success" | "warning" | "error";
}
