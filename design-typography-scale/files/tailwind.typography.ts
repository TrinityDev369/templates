import type { Config } from "tailwindcss";

/**
 * Typography token integration for Tailwind CSS.
 * Spread into your tailwind.config.ts theme.extend.
 */
export const typographyTokens: Partial<Config["theme"]> = {
  extend: {
    fontFamily: {
      sans: ["var(--font-sans)"],
      serif: ["var(--font-serif)"],
      mono: ["var(--font-mono)"],
    },
    fontSize: {
      xs: "var(--text-xs)",
      sm: "var(--text-sm)",
      base: "var(--text-base)",
      lg: "var(--text-lg)",
      xl: "var(--text-xl)",
      "2xl": "var(--text-2xl)",
      "3xl": "var(--text-3xl)",
      "4xl": "var(--text-4xl)",
      "5xl": "var(--text-5xl)",
      "6xl": "var(--text-6xl)",
    },
    lineHeight: {
      none: "var(--leading-none)",
      tight: "var(--leading-tight)",
      snug: "var(--leading-snug)",
      normal: "var(--leading-normal)",
      relaxed: "var(--leading-relaxed)",
      loose: "var(--leading-loose)",
    },
    letterSpacing: {
      tighter: "var(--tracking-tighter)",
      tight: "var(--tracking-tight)",
      normal: "var(--tracking-normal)",
      wide: "var(--tracking-wide)",
      wider: "var(--tracking-wider)",
      widest: "var(--tracking-widest)",
    },
  },
};

export default typographyTokens;
