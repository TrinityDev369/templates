"use client";

import {
  BookOpen,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Rocket,
  Settings,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryNavProps } from "./types";

/**
 * Maps icon name strings to Lucide icon components.
 * Extend this map to support additional icon names passed via Category.icon.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Rocket,
  Settings,
  Users,
  Wrench,
};

function getIcon(name?: string): LucideIcon {
  if (!name) return FileText;
  return ICON_MAP[name] ?? FileText;
}

export function CategoryNav({
  categories,
  articles,
  activeCategoryId,
  onSelectCategory,
  onGoHome,
  className,
}: CategoryNavProps) {
  /** Count articles per category */
  function countForCategory(categoryId: string): number {
    return articles.filter((a) => a.categoryId === categoryId).length;
  }

  return (
    <nav className={cn("space-y-1", className)} aria-label="Categories">
      {/* Home / All articles link */}
      <button
        type="button"
        onClick={onGoHome}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          activeCategoryId === null
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Home className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">All Articles</span>
        <span
          className={cn(
            "text-xs tabular-nums",
            activeCategoryId === null
              ? "text-primary/70"
              : "text-muted-foreground"
          )}
        >
          {articles.length}
        </span>
      </button>

      {/* Category links */}
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        const count = countForCategory(category.id);
        const isActive = activeCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">{category.name}</span>
            <span
              className={cn(
                "text-xs tabular-nums",
                isActive ? "text-primary/70" : "text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
