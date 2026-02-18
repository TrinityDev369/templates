import type { Config } from "tailwindcss";

/**
 * Shadow token integration for Tailwind CSS.
 */
export const shadowTokens: Partial<Config["theme"]> = {
  extend: {
    boxShadow: {
      xs: "var(--shadow-xs)",
      sm: "var(--shadow-sm)",
      DEFAULT: "var(--shadow-sm)",
      md: "var(--shadow-md)",
      lg: "var(--shadow-lg)",
      xl: "var(--shadow-xl)",
      "2xl": "var(--shadow-2xl)",
      inner: "var(--shadow-inner)",
      none: "var(--shadow-none)",
    },
  },
};

export default shadowTokens;
