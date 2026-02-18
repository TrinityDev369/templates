import type { Config } from "tailwindcss";

/**
 * Spacing token integration for Tailwind CSS.
 * Maps Tailwind spacing keys to CSS custom properties.
 */
export const spacingTokens: Partial<Config["theme"]> = {
  extend: {
    spacing: {
      "0": "var(--space-0)",
      px: "var(--space-px)",
      "0.5": "var(--space-0-5)",
      "1": "var(--space-1)",
      "1.5": "var(--space-1-5)",
      "2": "var(--space-2)",
      "2.5": "var(--space-2-5)",
      "3": "var(--space-3)",
      "3.5": "var(--space-3-5)",
      "4": "var(--space-4)",
      "5": "var(--space-5)",
      "6": "var(--space-6)",
      "7": "var(--space-7)",
      "8": "var(--space-8)",
      "9": "var(--space-9)",
      "10": "var(--space-10)",
      "11": "var(--space-11)",
      "12": "var(--space-12)",
      "14": "var(--space-14)",
      "16": "var(--space-16)",
      "20": "var(--space-20)",
      "24": "var(--space-24)",
      "28": "var(--space-28)",
      "32": "var(--space-32)",
      "36": "var(--space-36)",
      "40": "var(--space-40)",
      "44": "var(--space-44)",
      "48": "var(--space-48)",
      "52": "var(--space-52)",
      "56": "var(--space-56)",
      "60": "var(--space-60)",
      "64": "var(--space-64)",
      "72": "var(--space-72)",
      "80": "var(--space-80)",
      "96": "var(--space-96)",
      section: "var(--space-section)",
      component: "var(--space-component)",
      element: "var(--space-element)",
      inline: "var(--space-inline)",
    },
    maxWidth: {
      "container-sm": "var(--container-sm)",
      "container-md": "var(--container-md)",
      "container-lg": "var(--container-lg)",
      "container-xl": "var(--container-xl)",
      "container-2xl": "var(--container-2xl)",
    },
  },
};

export default spacingTokens;
