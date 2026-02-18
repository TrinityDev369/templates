"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode, type CSSProperties, Children } from "react";

interface StaggerProps {
  children: ReactNode;
  /** Delay between each child in seconds */
  staggerDelay?: number;
  /** Initial delay before first child */
  delayChildren?: number;
  /** Child animation variants */
  childVariants?: Variants;
  /** Trigger on viewport entry */
  viewport?: boolean;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  /** HTML element to render for each child wrapper. Defaults to "div".
   * Use "li" when wrapping list items inside a <ul> or <ol>. */
  childAs?: keyof typeof motion;
}

const defaultChildVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Stagger children animations with configurable delay.
 * Each direct child animates in sequence.
 *
 * @example
 * <Stagger staggerDelay={0.08} viewport once>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Stagger>
 */
export function Stagger({
  children,
  staggerDelay = 0.05,
  delayChildren = 0.1,
  childVariants = defaultChildVariants,
  viewport = false,
  once = true,
  className,
  style,
  childAs = "div",
}: StaggerProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={viewport ? undefined : "visible"}
      whileInView={viewport ? "visible" : undefined}
      viewport={viewport ? { once, margin: "-50px" } : undefined}
      className={className}
      style={style}
    >
      {Children.map(children, (child) => {
        const ChildWrapper = motion[childAs] as typeof motion.div;
        return (
          <ChildWrapper
            variants={childVariants}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {child}
          </ChildWrapper>
        );
      })}
    </motion.div>
  );
}
