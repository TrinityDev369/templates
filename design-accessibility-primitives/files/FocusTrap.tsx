import { useEffect, useRef, type ReactNode, type KeyboardEvent } from "react";

interface FocusTrapProps {
  children: ReactNode;
  /** Whether the trap is active */
  active?: boolean;
  /** Called when the user presses Escape */
  onEscape?: () => void;
  /** Restore focus to the previously focused element on deactivation */
  restoreFocus?: boolean;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
].join(", ");

/**
 * Traps focus within its children. Useful for modals, dialogs, and drawers.
 * Tab and Shift+Tab cycle through focusable elements inside the trap.
 */
export function FocusTrap({
  children,
  active = true,
  onEscape,
  restoreFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    return () => {
      if (restoreFocus && previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, restoreFocus]);

  function handleKeyDown(e: KeyboardEvent) {
    if (!active) return;

    if (e.key === "Escape" && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }

    if (e.key !== "Tab") return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
