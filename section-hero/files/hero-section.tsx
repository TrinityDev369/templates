"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeroSectionProps, HeroAction } from "./hero-section.types";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (self-contained, no external icon library)        */
/* ------------------------------------------------------------------ */

/** Right-pointing arrow icon for the primary CTA. */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Play icon for the video variant placeholder. */
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-12 w-12", className)}
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function HeroBadge({ text }: { text: string }) {
  return (
    <Badge variant="outline" className="mb-4">
      {text}
    </Badge>
  );
}

function HeroTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
        "text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  );
}

function HeroDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mt-6 text-lg leading-8 text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

function HeroActions({
  primary,
  secondary,
}: {
  primary: HeroAction;
  secondary?: HeroAction;
}) {
  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Button size="lg" asChild onClick={primary.onClick}>
        <a href={primary.href}>
          {primary.label}
          <ArrowRightIcon className="ml-2" />
        </a>
      </Button>
      {secondary && (
        <Button size="lg" variant="outline" asChild onClick={secondary.onClick}>
          <a href={secondary.href}>{secondary.label}</a>
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant renderers                                                  */
/* ------------------------------------------------------------------ */

function CenteredVariant({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
      {badge && <HeroBadge text={badge} />}
      <HeroTitle>{title}</HeroTitle>
      <HeroDescription className="max-w-2xl">{description}</HeroDescription>
      <HeroActions primary={primaryAction} secondary={secondaryAction} />
    </div>
  );
}

function SplitVariant({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
}: HeroSectionProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
      {/* Text column */}
      <div>
        {badge && <HeroBadge text={badge} />}
        <HeroTitle>{title}</HeroTitle>
        <HeroDescription>{description}</HeroDescription>
        <HeroActions primary={primaryAction} secondary={secondaryAction} />
      </div>

      {/* Media column */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted dark:bg-muted/50">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            {/* Placeholder image icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-16 w-16"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function WithVideoVariant({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  videoSrc,
}: HeroSectionProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
      {badge && <HeroBadge text={badge} />}
      <HeroTitle>{title}</HeroTitle>
      <HeroDescription className="max-w-2xl">{description}</HeroDescription>
      <HeroActions primary={primaryAction} secondary={secondaryAction} />

      {/* Video embed area */}
      <div className="mt-16 w-full max-w-4xl">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted dark:bg-muted/50">
          {videoSrc ? (
            <iframe
              src={videoSrc}
              title="Video"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground/40">
              <PlayIcon />
              <span className="text-sm font-medium">Video Placeholder</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

/**
 * Hero section component with three layout variants.
 *
 * - **centered** (default): Badge + heading + description + CTA buttons, all centered.
 * - **split**: Left-side text content with right-side image/media placeholder.
 * - **with-video**: Centered text above a video embed placeholder below.
 *
 * @example
 * ```tsx
 * <HeroSection
 *   variant="centered"
 *   badge="New Release"
 *   title="Build beautiful apps faster"
 *   description="A modern toolkit for shipping production-ready interfaces."
 *   primaryAction={{ label: "Get Started", href: "/signup" }}
 *   secondaryAction={{ label: "Learn More", href: "/docs" }}
 * />
 * ```
 */
function HeroSection({
  variant = "centered",
  className,
  ...rest
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "py-24 sm:py-32",
        "bg-background text-foreground",
        className,
      )}
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        {variant === "centered" && <CenteredVariant variant={variant} {...rest} />}
        {variant === "split" && <SplitVariant variant={variant} {...rest} />}
        {variant === "with-video" && <WithVideoVariant variant={variant} {...rest} />}
      </div>
    </section>
  );
}

export { HeroSection };
export type { HeroSectionProps };
