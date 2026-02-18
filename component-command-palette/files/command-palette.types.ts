import type { ReactNode } from "react";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  group?: string;
  shortcut?: string[];
  keywords?: string[];
}

export interface CommandGroup {
  id: string;
  label: string;
}
