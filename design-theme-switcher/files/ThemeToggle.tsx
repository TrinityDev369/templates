"use client";

import { useTheme } from "./useTheme";
import type { Theme } from "./ThemeProvider";

interface ThemeToggleProps {
  /** Custom class name for the button */
  className?: string;
}

const icons: Record<Theme, string> = {
  light: "Sun",
  dark: "Moon",
  system: "Monitor",
};

const labels: Record<Theme, string> = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System theme",
};

const cycle: Theme[] = ["light", "dark", "system"];

/**
 * Simple theme toggle button that cycles through light -> dark -> system.
 * Renders inline SVG icons — no icon library required.
 */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`touch-target focus-ring ${className}`.trim()}
      aria-label={`Current: ${labels[theme]}. Switch to ${labels[next]}`}
      title={labels[theme]}
    >
      {theme === "light" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
      {theme === "dark" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {theme === "system" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )}
    </button>
  );
}
