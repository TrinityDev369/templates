import type { LucideIcon } from "lucide-react";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  category: "page" | "user" | "action";
  avatar?: string;
  shortcut?: string;
  url?: string;
}
