interface SkipLinkProps {
  /** The ID of the main content element to skip to (without #) */
  targetId?: string;
  /** Custom label text */
  label?: string;
}

/**
 * Skip navigation link for keyboard users.
 * Place as the first focusable element in your layout.
 * The target element needs an id matching targetId (default: "main-content").
 */
export function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {label}
    </a>
  );
}
