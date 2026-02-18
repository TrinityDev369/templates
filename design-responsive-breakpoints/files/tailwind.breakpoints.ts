import type { Config } from "tailwindcss";

/**
 * Breakpoint and container query integration for Tailwind CSS.
 */
export const breakpointTokens: Partial<Config["theme"]> = {
  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1400px",
  },
  extend: {
    containers: {
      sm: "320px",
      md: "480px",
      lg: "640px",
      xl: "768px",
      "2xl": "1024px",
    },
    maxWidth: {
      prose: "var(--content-prose)",
      screen: "var(--content-full)",
      "screen-sm": "var(--content-sm)",
      "screen-md": "var(--content-md)",
      "screen-lg": "var(--content-lg)",
      "screen-xl": "var(--content-xl)",
      "screen-2xl": "var(--content-2xl)",
    },
  },
};

export default breakpointTokens;
