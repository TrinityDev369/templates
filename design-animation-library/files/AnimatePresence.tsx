"use client";

import {
  AnimatePresence as FramerAnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedPresenceProps {
  children: ReactNode;
  /** Unique key for the current child (triggers enter/exit) */
  id: string | number;
  /** Animation preset */
  animation?: Variants;
  /** Duration in seconds */
  duration?: number;
  /** Wait for exit before enter */
  mode?: "sync" | "wait" | "popLayout";
  className?: string;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * Wrapper around framer-motion AnimatePresence for enter/exit animations.
 * Swap children by changing the `id` prop.
 *
 * @example
 * <AnimatedPresence id={currentTab}>
 *   <TabContent />
 * </AnimatedPresence>
 */
export function AnimatedPresence({
  children,
  id,
  animation = defaultVariants,
  duration = 0.2,
  mode = "wait",
  className,
}: AnimatedPresenceProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <FramerAnimatePresence mode={mode}>
      <motion.div
        key={id}
        variants={animation}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </FramerAnimatePresence>
  );
}
