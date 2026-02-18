"use client";

import React, {
  useRef,
  useMemo,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  type Transition,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TextRevealPreset =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "blur"
  | "scale"
  | "rotate";

export type SplitMode = "char" | "word";

export interface TextRevealProps {
  /** The text string to animate. */
  text: string;
  /** HTML element type for the container. @default 'p' */
  as?: React.ElementType;
  /** Split text by character or word. @default 'word' */
  splitBy?: SplitMode;
  /** Delay between each child animation in seconds. @default 0.05 */
  stagger?: number;
  /** Duration of each child animation in seconds. @default 0.5 */
  duration?: number;
  /** Initial delay before the animation starts in seconds. @default 0 */
  delay?: number;
  /** Animation preset. @default 'fade-up' */
  preset?: TextRevealPreset;
  /** Additional CSS class name for the container. */
  className?: string;
  /** Whether to trigger animation when the element enters the viewport. @default true */
  triggerOnView?: boolean;
  /** If true, the animation only plays once. @default true */
  once?: boolean;
  /** Viewport intersection threshold (0-1). @default 0.2 */
  threshold?: number;
}

export interface TextRevealGroupProps {
  /** TextReveal children to animate sequentially. */
  children: React.ReactNode;
  /** Additional CSS class name for the group wrapper. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const PRESET_VARIANTS: Record<TextRevealPreset, { initial: Record<string, unknown>; animate: Record<string, unknown> }> = {
  "fade-up": {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  "fade-down": {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  "fade-left": {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  "fade-right": {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  rotate: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
  },
};

/* ------------------------------------------------------------------ */
/*  Group context — sequential stagger across siblings                 */
/* ------------------------------------------------------------------ */

interface GroupContextValue {
  /** Register a child and receive its sequential index. */
  register: () => number;
  /** Notify the group that child at `index` has finished animating. */
  onComplete: (index: number) => void;
  /** Returns true if the child at `index` is allowed to start. */
  canStart: (index: number) => boolean;
}

const GroupContext = createContext<GroupContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  TextReveal                                                         */
/* ------------------------------------------------------------------ */

export function TextReveal({
  text,
  as: Tag = "p",
  splitBy = "word",
  stagger = 0.05,
  duration = 0.5,
  delay = 0,
  preset = "fade-up",
  className,
  triggerOnView = true,
  once = true,
  threshold = 0.2,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(containerRef, {
    once,
    amount: threshold,
  });

  /* Group integration ----------------------------------------------- */
  const group = useContext(GroupContext);
  const indexRef = useRef<number>(-1);
  const [groupReady, setGroupReady] = useState(!group);

  // Register with group on mount
  useEffect(() => {
    if (group && indexRef.current === -1) {
      indexRef.current = group.register();
    }
  }, [group]);

  // Poll group readiness
  useEffect(() => {
    if (!group) return;
    const check = () => {
      if (group.canStart(indexRef.current)) {
        setGroupReady(true);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  }, [group]);

  /* Split text ------------------------------------------------------ */
  const segments = useMemo(() => {
    if (splitBy === "char") {
      return text.split("").map((char) => (char === " " ? "\u00A0" : char));
    }
    return text.split(/\s+/);
  }, [text, splitBy]);

  /* Compute total animation time for group signaling */
  const totalDuration = delay + segments.length * stagger + duration;

  /* Notify group when animation completes */
  useEffect(() => {
    if (!group || indexRef.current === -1 || !shouldAnimate) return;
    const timer = setTimeout(() => {
      group.onComplete(indexRef.current);
    }, totalDuration * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupReady, isInView]);

  /* Determine animation state --------------------------------------- */
  const shouldAnimate = triggerOnView ? isInView && groupReady : groupReady;

  /* Reduced motion — render immediately without animation */
  if (prefersReduced) {
    const MotionTag = motion.create(Tag as React.ElementType);
    return (
      <MotionTag
        ref={containerRef}
        className={className}
        aria-label={text}
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        {splitBy === "word"
          ? segments.map((word, i) => (
              <span key={i} style={{ marginRight: "0.25em" }}>
                {word}
              </span>
            ))
          : segments.map((char, i) => <span key={i}>{char}</span>)}
      </MotionTag>
    );
  }

  /* Variants -------------------------------------------------------- */
  const presetConfig = PRESET_VARIANTS[preset];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const childTransition: Transition = {
    duration,
    ease: [0.25, 0.1, 0.25, 1],
  };

  const childVariants: Variants = {
    hidden: presetConfig.initial,
    visible: {
      ...presetConfig.animate,
      transition: childTransition,
    },
  };

  /* Render ---------------------------------------------------------- */
  const MotionTag = motion.create(Tag as React.ElementType);

  return (
    <MotionTag
      ref={containerRef}
      className={className}
      aria-label={text}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      style={{
        display: "flex",
        flexWrap: "wrap",
        ...(preset === "rotate" ? { perspective: 600 } : {}),
      }}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          style={{
            display: "inline-block",
            willChange: "transform, opacity",
            ...(splitBy === "word" ? { marginRight: "0.25em" } : {}),
            ...(preset === "rotate" ? { transformOrigin: "center bottom" } : {}),
          }}
        >
          {segment}
        </motion.span>
      ))}
    </MotionTag>
  );
}

/* ------------------------------------------------------------------ */
/*  TextRevealGroup                                                    */
/* ------------------------------------------------------------------ */

export function TextRevealGroup({ children, className }: TextRevealGroupProps) {
  const counterRef = useRef(0);
  const [completedIndex, setCompletedIndex] = useState(-1);

  const register = useCallback(() => {
    const index = counterRef.current;
    counterRef.current += 1;
    return index;
  }, []);

  const onComplete = useCallback((index: number) => {
    setCompletedIndex((prev) => Math.max(prev, index));
  }, []);

  const canStart = useCallback(
    (index: number) => {
      return index === 0 || completedIndex >= index - 1;
    },
    [completedIndex],
  );

  const contextValue = useMemo<GroupContextValue>(
    () => ({ register, onComplete, canStart }),
    [register, onComplete, canStart],
  );

  return (
    <GroupContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </GroupContext.Provider>
  );
}
