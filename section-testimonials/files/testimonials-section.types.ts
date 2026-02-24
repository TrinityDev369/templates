/**
 * Type definitions for the TestimonialsSection component.
 *
 * Testimonial represents a single customer/user testimonial entry.
 * TestimonialsSectionProps defines the full section configuration.
 */

/** A single testimonial entry with author details and optional rating. */
export interface Testimonial {
  /** The testimonial quote text. */
  quote: string;
  /** Full name of the testimonial author. */
  author: string;
  /** Job title or role of the author. */
  role: string;
  /** Optional company or organization name. */
  company?: string;
  /** Optional URL to the author's avatar image. Falls back to initials if omitted. */
  avatarSrc?: string;
  /** Optional star rating from 1 to 5. Omit to hide the rating. */
  rating?: 1 | 2 | 3 | 4 | 5;
}

/** Props for the TestimonialsSection component. */
export interface TestimonialsSectionProps {
  /** Optional section heading. */
  title?: string;
  /** Optional section description rendered below the title. */
  description?: string;
  /** Array of testimonials to display in the grid. */
  testimonials: Testimonial[];
  /** Number of grid columns at large breakpoint. Defaults to 3. */
  columns?: 2 | 3;
  /** Additional CSS classes applied to the root section element. */
  className?: string;
}
