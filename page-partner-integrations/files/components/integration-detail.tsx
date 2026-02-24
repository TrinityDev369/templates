"use client";

import { X, ExternalLink, Check, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Integration } from "../page";

interface IntegrationDetailProps {
  integration: Integration;
  onClose: () => void;
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

export function IntegrationDetail({ integration, onClose }: IntegrationDetailProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close detail panel"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: integration.color }}
            >
              {integration.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {integration.name}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  statusStyles[integration.status]
                )}
              >
                {statusLabels[integration.status]}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          {/* Category */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Puzzle className="h-4 w-4" />
            <span>{integration.category}</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h3>
            <p className="leading-relaxed text-foreground">
              {integration.fullDescription}
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Features
            </h3>
            <ul className="space-y-2">
              {integration.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Setup instructions */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Setup
            </h3>
            <ol className="space-y-3">
              {integration.setupSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-6">
            <button
              type="button"
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                integration.status === "coming-soon"
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              disabled={integration.status === "coming-soon"}
            >
              {integration.status === "coming-soon" ? "Coming Soon" : "Connect"}
              {integration.status !== "coming-soon" && (
                <ExternalLink className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
