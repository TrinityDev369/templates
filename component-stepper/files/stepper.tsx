"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  Step,
  StepStatus,
  StepperProps,
  StepProps,
} from "./stepper.types";

// Re-export types for convenience
export type { Step, StepStatus, StepperProps, StepProps } from "./stepper.types";

/* -------------------------------------------------------------------------- */
/*  Inline SVG Icons                                                          */
/* -------------------------------------------------------------------------- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Size configuration                                                        */
/* -------------------------------------------------------------------------- */

const sizeConfig = {
  sm: {
    circle: "h-6 w-6",
    dotCircle: "h-3 w-3",
    icon: "h-3 w-3",
    text: "text-xs",
    label: "text-xs",
    description: "text-[10px]",
    connector: "h-0.5",
    connectorVertical: "w-0.5",
    gap: "gap-1",
  },
  md: {
    circle: "h-8 w-8",
    dotCircle: "h-4 w-4",
    icon: "h-4 w-4",
    text: "text-sm",
    label: "text-sm",
    description: "text-xs",
    connector: "h-0.5",
    connectorVertical: "w-0.5",
    gap: "gap-1.5",
  },
  lg: {
    circle: "h-10 w-10",
    dotCircle: "h-5 w-5",
    icon: "h-5 w-5",
    text: "text-base",
    label: "text-base",
    description: "text-sm",
    connector: "h-[3px]",
    connectorVertical: "w-[3px]",
    gap: "gap-2",
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Helper: derive step status                                                */
/* -------------------------------------------------------------------------- */

function getStepStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return "completed";
  if (index === currentStep) return "current";
  return "upcoming";
}

/* -------------------------------------------------------------------------- */
/*  StepIndicator (individual step circle)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Renders a single step indicator: the numbered/icon circle, connector line,
 * and labels. Consumed internally by `Stepper` but exported for standalone use.
 */
export function StepIndicator({
  step,
  index,
  status,
  isLast,
  orientation,
  size,
  onClick,
  clickable,
  variant = "default",
}: StepProps & { variant?: "default" | "outline" | "dots" }) {
  const config = sizeConfig[size];
  const isHorizontal = orientation === "horizontal";

  /* -- Circle content (number, check, X, or custom icon) -- */
  const circleContent = useMemo(() => {
    if (variant === "dots") return null;

    if (step.icon) return step.icon;

    if (status === "completed") {
      return <CheckIcon className={config.icon} />;
    }
    if (status === "error") {
      return <XIcon className={config.icon} />;
    }
    return <span className={config.text}>{index + 1}</span>;
  }, [step.icon, status, index, config.icon, config.text, variant]);

  /* -- Circle styling per variant and status -- */
  const circleClasses = cn(
    "flex shrink-0 items-center justify-center rounded-full font-medium transition-all duration-200",
    variant === "dots" ? config.dotCircle : config.circle,

    // Default variant (filled backgrounds)
    variant === "default" && {
      "border-2 border-primary bg-primary text-primary-foreground":
        status === "completed",
      "border-2 border-primary bg-primary/10 text-primary":
        status === "current",
      "border-2 border-muted-foreground/30 text-muted-foreground/50":
        status === "upcoming",
      "border-2 border-destructive bg-destructive text-destructive-foreground":
        status === "error",
    },

    // Outline variant (border only, no fill on completed)
    variant === "outline" && {
      "border-2 border-primary text-primary": status === "completed",
      "border-2 border-primary bg-primary/5 text-primary":
        status === "current",
      "border-2 border-muted-foreground/30 text-muted-foreground/50":
        status === "upcoming",
      "border-2 border-destructive text-destructive": status === "error",
    },

    // Dots variant (small filled circles, no content)
    variant === "dots" && {
      "bg-primary": status === "completed",
      "bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background":
        status === "current",
      "bg-muted-foreground/30": status === "upcoming",
      "bg-destructive": status === "error",
    },

    // Interactive states
    clickable && "cursor-pointer hover:ring-2 hover:ring-primary/20 hover:ring-offset-1",
    !clickable && "cursor-default",
  );

  /* -- Connector line between steps -- */
  const connector = !isLast ? (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isHorizontal
          ? cn("mx-2 flex-1", config.connector, "rounded-full")
          : cn("my-1 self-center", config.connectorVertical, "min-h-[1.5rem] rounded-full"),
        "bg-muted-foreground/20",
      )}
      aria-hidden="true"
    >
      {/* Filled portion of the connector line */}
      <div
        className={cn(
          "absolute rounded-full bg-primary transition-all duration-500 ease-in-out",
          isHorizontal ? "left-0 top-0 h-full" : "left-0 top-0 w-full",
          status === "completed"
            ? isHorizontal
              ? "w-full"
              : "h-full"
            : isHorizontal
              ? "w-0"
              : "h-0",
        )}
      />
    </div>
  ) : null;

  /* -- Render -- */
  if (isHorizontal) {
    return (
      <li
        className={cn(
          "flex items-center",
          !isLast && "flex-1",
        )}
        role="listitem"
        aria-current={status === "current" ? "step" : undefined}
      >
        {/* Step circle + labels column */}
        <div className={cn("flex flex-col items-center", config.gap)}>
          <div
            className={circleClasses}
            onClick={clickable ? onClick : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onClick?.();
                    }
                  }
                : undefined
            }
            role={clickable ? "button" : "presentation"}
            tabIndex={clickable ? 0 : undefined}
            aria-label={
              clickable
                ? `Go to step ${index + 1}: ${step.label}`
                : `Step ${index + 1}: ${step.label}`
            }
          >
            {circleContent}
          </div>

          {/* Label (hidden on very small screens for horizontal) */}
          <div className="hidden flex-col items-center text-center sm:flex">
            <span
              className={cn(
                "font-medium transition-colors duration-200",
                config.label,
                status === "completed" && "text-primary",
                status === "current" && "text-foreground",
                status === "upcoming" && "text-muted-foreground/60",
                status === "error" && "text-destructive",
              )}
            >
              {step.label}
              {step.optional && (
                <span className="ml-1 font-normal text-muted-foreground">
                  (optional)
                </span>
              )}
            </span>
            {step.description && (
              <span
                className={cn(
                  "mt-0.5 text-muted-foreground",
                  config.description,
                )}
              >
                {step.description}
              </span>
            )}
          </div>

          {/* Screen reader text */}
          <span className="sr-only">
            {step.label}
            {step.optional ? " (optional)" : ""}
            {status === "completed"
              ? " - completed"
              : status === "current"
                ? " - current step"
                : status === "error"
                  ? " - has error"
                  : " - upcoming"}
          </span>
        </div>

        {/* Horizontal connector line */}
        {connector}
      </li>
    );
  }

  /* -- Vertical orientation -- */
  return (
    <li
      className="flex"
      role="listitem"
      aria-current={status === "current" ? "step" : undefined}
    >
      {/* Left column: circle + vertical connector */}
      <div className="flex flex-col items-center">
        <div
          className={circleClasses}
          onClick={clickable ? onClick : undefined}
          onKeyDown={
            clickable
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                  }
                }
              : undefined
          }
          role={clickable ? "button" : "presentation"}
          tabIndex={clickable ? 0 : undefined}
          aria-label={
            clickable
              ? `Go to step ${index + 1}: ${step.label}`
              : `Step ${index + 1}: ${step.label}`
          }
        >
          {circleContent}
        </div>

        {/* Vertical connector */}
        {!isLast && (
          <div
            className={cn(
              "relative my-1 flex-1 overflow-hidden rounded-full",
              config.connectorVertical,
              "min-h-[1.5rem] bg-muted-foreground/20",
            )}
            aria-hidden="true"
          >
            <div
              className={cn(
                "absolute left-0 top-0 w-full rounded-full bg-primary transition-all duration-500 ease-in-out",
                status === "completed" ? "h-full" : "h-0",
              )}
            />
          </div>
        )}
      </div>

      {/* Right column: labels */}
      <div className={cn("ml-3 pb-6", isLast && "pb-0")}>
        <span
          className={cn(
            "font-medium transition-colors duration-200",
            config.label,
            status === "completed" && "text-primary",
            status === "current" && "text-foreground",
            status === "upcoming" && "text-muted-foreground/60",
            status === "error" && "text-destructive",
          )}
        >
          {step.label}
          {step.optional && (
            <span className="ml-1 font-normal text-muted-foreground">
              (optional)
            </span>
          )}
        </span>
        {step.description && (
          <p
            className={cn(
              "mt-0.5 text-muted-foreground",
              config.description,
            )}
          >
            {step.description}
          </p>
        )}

        {/* Screen reader text */}
        <span className="sr-only">
          {status === "completed"
            ? " - completed"
            : status === "current"
              ? " - current step"
              : status === "error"
                ? " - has error"
                : " - upcoming"}
        </span>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stepper (main composite component)                                        */
/* -------------------------------------------------------------------------- */

/**
 * Step progress indicator with labels, validation states, and click navigation.
 *
 * Supports horizontal and vertical orientations, three size variants (sm/md/lg),
 * three visual variants (default/outline/dots), and optional click-to-navigate.
 *
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { id: "account", label: "Account" },
 *     { id: "profile", label: "Profile", description: "Personal info" },
 *     { id: "review", label: "Review" },
 *   ]}
 *   currentStep={1}
 *   onStepClick={(i) => setStep(i)}
 *   allowClickNavigation
 * />
 * ```
 */
export function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  onStepClick,
  allowClickNavigation = false,
  size = "md",
  variant = "default",
}: StepperProps) {
  const isHorizontal = orientation === "horizontal";

  /** Compute status for each step. */
  const stepStatuses = useMemo<StepStatus[]>(
    () => steps.map((_, i) => getStepStatus(i, currentStep)),
    [steps, currentStep],
  );

  return (
    <nav
      aria-label="Step progress"
      className="w-full"
    >
      <ol
        role="list"
        className={cn(
          isHorizontal
            ? "flex items-start justify-between"
            : "flex flex-col",
        )}
      >
        {steps.map((step, index) => {
          const status = stepStatuses[index];
          const isLast = index === steps.length - 1;

          // A step is clickable if click navigation is enabled, a handler exists,
          // and the step is not the current one
          const clickable =
            allowClickNavigation &&
            !!onStepClick &&
            status !== "current";

          return (
            <StepIndicator
              key={step.id}
              step={step}
              index={index}
              status={status}
              isLast={isLast}
              orientation={orientation}
              size={size}
              variant={variant}
              onClick={clickable ? () => onStepClick(index) : undefined}
              clickable={clickable}
            />
          );
        })}
      </ol>
    </nav>
  );
}
