"use client";

import { Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Integration } from "../page";

interface IntegrationCardProps {
  integration: Integration;
  onSelect: (integration: Integration) => void;
}

const statusStyles: Record<Integration["status"], string> = {
  available: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  beta: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "coming-soon": "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

const statusLabels: Record<Integration["status"], string> = {
  available: "Available",
  beta: "Beta",
  "coming-soon": "Coming Soon",
};

export function IntegrationCard({ integration, onSelect }: IntegrationCardProps) {
  const isDisabled = integration.status === "coming-soon";

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onSelect(integration)}
      disabled={isDisabled}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card p-6 text-left transition-all",
        isDisabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-primary/40 hover:shadow-md"
      )}
    >
      {/* Popular badge */}
      {integration.popular && (
        <div className="absolute -top-2 right-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
          <Star className="h-3 w-3" />
          Popular
        </div>
      )}

      {/* Header: logo + status */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
          style={{ backgroundColor: integration.color }}
        >
          {integration.name.charAt(0)}
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyles[integration.status]
          )}
        >
          {statusLabels[integration.status]}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="mb-1 text-base font-semibold text-foreground">
        {integration.name}
      </h3>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {integration.description}
      </p>

      {/* Footer: category badge + arrow */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {integration.category}
        </span>
        {!isDisabled && (
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        )}
      </div>
    </button>
  );
}
