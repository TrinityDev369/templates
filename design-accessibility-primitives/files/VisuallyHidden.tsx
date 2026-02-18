import { type HTMLAttributes, type ReactNode } from "react";

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** If true, becomes visible when focused (useful for skip links) */
  focusable?: boolean;
}

/**
 * Visually hides content while keeping it accessible to screen readers.
 * Use for labels, descriptions, and other text that sighted users don't need.
 */
export function VisuallyHidden({
  children,
  focusable = false,
  className = "",
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={`${focusable ? "sr-only-focusable" : "sr-only"} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
