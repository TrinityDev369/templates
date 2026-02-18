import type { Variants, Transition } from "framer-motion";

/** Standard transitions */
export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  normal: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  slow: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  spring: { type: "spring", stiffness: 400, damping: 30 } satisfies Transition,
  springBouncy: { type: "spring", stiffness: 300, damping: 15 } satisfies Transition,
  springGentle: { type: "spring", stiffness: 200, damping: 20 } satisfies Transition,
} as const;

/** Fade animation */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Fade + slide up */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Fade + slide down */
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

/** Fade + slide left */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

/** Fade + slide right */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

/** Scale in from center */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/** Scale up from small */
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

/** Blur in */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
};

/** Stagger container — use as parent variant */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** Stagger item — use as child variant */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};
