"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import type { Testimonial, TestimonialsSectionProps } from "./testimonials-section.types";

// ---------------------------------------------------------------------------
// Inline SVG helpers (no external icon library)
// ---------------------------------------------------------------------------

/** Decorative opening-quote icon rendered at the top of each card. */
function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-8 w-8 text-muted-foreground/20", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.3 2.6C6.1 5.1 2.7 9.7 2.7 14.7c0 3.2 2.1 5.6 4.8 5.6 2.5 0 4.5-2 4.5-4.5 0-2.4-1.8-4.3-4-4.5.5-2.7 2.7-5.4 5.5-6.9L11.3 2.6zm10.5 0c-5.2 2.5-8.6 7.1-8.6 12.1 0 3.2 2.1 5.6 4.8 5.6 2.5 0 4.5-2 4.5-4.5 0-2.4-1.8-4.3-4-4.5.5-2.7 2.7-5.4 5.5-6.9L21.8 2.6z" />
    </svg>
  );
}

/** A single filled or empty star used for ratings. */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4", filled ? "text-yellow-400" : "text-muted-foreground/25")}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.284-3.957z" />
    </svg>
  );
}

/** Renders a row of 1-5 star icons. */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: derive initials from an author name for avatar fallback
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ---------------------------------------------------------------------------
// Testimonial Card
// ---------------------------------------------------------------------------

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, author, role, company, avatarSrc, rating } = testimonial;

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <QuoteIcon />
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {rating !== undefined && <StarRating rating={rating} />}
        <blockquote className="text-sm leading-relaxed text-foreground/90">
          {quote}
        </blockquote>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={author} />}
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
              {getInitials(author)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-foreground truncate">
              {author}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {role}
              {company ? `, ${company}` : ""}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

/**
 * TestimonialsSection renders a responsive grid of testimonial cards
 * with optional section heading, description, avatar, and star ratings.
 *
 * @example
 * ```tsx
 * <TestimonialsSection
 *   title="What our clients say"
 *   testimonials={[
 *     { quote: "Amazing service!", author: "Jane Doe", role: "CEO", company: "Acme", rating: 5 },
 *   ]}
 * />
 * ```
 */
export function TestimonialsSection({
  title,
  description,
  testimonials,
  columns = 3,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "w-full py-16 px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {/* Section header */}
      {(title || description) && (
        <div className="mx-auto max-w-2xl text-center mb-12">
          {title && (
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-base text-muted-foreground text-balance">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Testimonial grid */}
      <div
        className={cn(
          "mx-auto max-w-7xl grid gap-6",
          "grid-cols-1 md:grid-cols-2",
          columns === 3 && "lg:grid-cols-3",
        )}
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} />
        ))}
      </div>
    </section>
  );
}
