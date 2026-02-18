import type { Config } from "tailwindcss";

/**
 * Motion token integration for Tailwind CSS.
 *
 * Extends your Tailwind theme with duration and easing utilities that
 * reference the CSS custom properties defined in motion.css. This keeps
 * a single source of truth: change the CSS variable and every Tailwind
 * utility updates automatically.
 *
 * Usage in tailwind.config.ts:
 *
 *   import { motionTokens } from "./src/design-system/tailwind.motion";
 *
 *   export default {
 *     theme: {
 *       ...motionTokens,
 *     },
 *   } satisfies Config;
 */
export const motionTokens: Partial<Config["theme"]> = {
  extend: {
    transitionDuration: {
      instant: "var(--duration-instant)",
      fastest: "var(--duration-fastest)",
      faster: "var(--duration-faster)",
      fast: "var(--duration-fast)",
      normal: "var(--duration-normal)",
      slow: "var(--duration-slow)",
      slower: "var(--duration-slower)",
      slowest: "var(--duration-slowest)",
      deliberate: "var(--duration-deliberate)",
    },
    transitionTimingFunction: {
      DEFAULT: "var(--ease-default)",
      in: "var(--ease-in)",
      out: "var(--ease-out)",
      "in-out": "var(--ease-in-out)",
      emphasized: "var(--ease-emphasized)",
      spring: "var(--ease-spring)",
      bounce: "var(--ease-bounce)",
      snappy: "var(--ease-snappy)",
      enter: "var(--ease-enter)",
      exit: "var(--ease-exit)",
    },
    keyframes: {
      "fade-in": {
        from: { opacity: "0" },
        to: { opacity: "1" },
      },
      "fade-out": {
        from: { opacity: "1" },
        to: { opacity: "0" },
      },
      "slide-in-up": {
        from: { transform: "translateY(8px)", opacity: "0" },
        to: { transform: "translateY(0)", opacity: "1" },
      },
      "slide-in-down": {
        from: { transform: "translateY(-8px)", opacity: "0" },
        to: { transform: "translateY(0)", opacity: "1" },
      },
      "scale-in": {
        from: { transform: "scale(0.95)", opacity: "0" },
        to: { transform: "scale(1)", opacity: "1" },
      },
    },
    animation: {
      "fade-in": "fade-in var(--duration-normal) var(--ease-enter) both",
      "fade-out": "fade-out var(--duration-fast) var(--ease-exit) both",
      "slide-in-up": "slide-in-up var(--duration-normal) var(--ease-enter) both",
      "slide-in-down": "slide-in-down var(--duration-normal) var(--ease-enter) both",
      "scale-in": "scale-in var(--duration-normal) var(--ease-spring) both",
    },
  },
};

export default motionTokens;
