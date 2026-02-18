"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

/** Phase of the typewriter state machine. */
type Phase = "typing" | "pausing" | "deleting";

export interface TypingEffectProps {
  /** Array of strings to cycle through. */
  strings: string[];
  /** Milliseconds per character when typing. @default 80 */
  typingSpeed?: number;
  /** Milliseconds per character when deleting. @default 40 */
  deletingSpeed?: number;
  /** Milliseconds to pause after fully typing a string. @default 1500 */
  pauseTime?: number;
  /** Whether to loop back to the first string after the last. @default true */
  loop?: boolean;
  /** Character displayed as the blinking cursor. @default '|' */
  cursor?: string;
  /** Cursor blink interval in milliseconds. @default 530 */
  cursorBlinkSpeed?: number;
  /** Additional CSS class name applied to the wrapper element. */
  className?: string;
  /** HTML element or React component to render as the wrapper. @default 'span' */
  as?: React.ElementType;
  /** Callback fired when all strings have been typed (only when `loop` is false). */
  onComplete?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Unique id for keyframe injection                                  */
/* ------------------------------------------------------------------ */

let styleInjected = false;
const KEYFRAME_NAME = "typing-effect-blink";

function injectBlinkKeyframes(): void {
  if (styleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `@keyframes ${KEYFRAME_NAME}{0%,100%{opacity:1}50%{opacity:0}}`;
  document.head.appendChild(style);
  styleInjected = true;
}

/* ------------------------------------------------------------------ */
/*  Reduced-motion detection hook                                     */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * `TypingEffect` renders a typewriter-style animation that cycles through an
 * array of strings, typing each one character-by-character, pausing, then
 * deleting before moving on to the next.
 *
 * When the user has `prefers-reduced-motion` enabled the full text is shown
 * immediately without animation.
 */
export function TypingEffect({
  strings,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseTime = 1500,
  loop = true,
  cursor = "|",
  cursorBlinkSpeed = 530,
  className,
  as: Wrapper = "span",
  onComplete,
}: TypingEffectProps) {
  /* ---- Refs for mutable values that should not trigger re-renders ---- */
  const stringIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const phaseRef = useRef<Phase>("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  /* ---- Displayed text (drives renders) ---- */
  const [displayText, setDisplayText] = useState("");

  /* ---- Accessibility ---- */
  const prefersReducedMotion = usePrefersReducedMotion();

  /* ---- Inject blink keyframes once ---- */
  useEffect(() => {
    injectBlinkKeyframes();
  }, []);

  /* ---- Normalise input ---- */
  const safeStrings = strings.length > 0 ? strings : [""];
  const isSingleString = safeStrings.length === 1;

  /* ---- Core tick function ---- */
  const tick = useCallback(() => {
    const current = safeStrings[stringIndexRef.current] ?? "";
    const phase = phaseRef.current;

    if (phase === "typing") {
      if (charIndexRef.current < current.length) {
        charIndexRef.current += 1;
        setDisplayText(current.slice(0, charIndexRef.current));
        timerRef.current = setTimeout(tick, typingSpeed);
      } else {
        /* Fully typed */
        if (isSingleString && !loop) {
          /* Single string, no loop: done */
          completedRef.current = true;
          onComplete?.();
          return;
        }
        if (isSingleString) {
          /* Single string with loop: just stay, no delete needed */
          return;
        }
        /* Multiple strings: pause then delete */
        phaseRef.current = "pausing";
        timerRef.current = setTimeout(() => {
          phaseRef.current = "deleting";
          tick();
        }, pauseTime);
      }
    } else if (phase === "deleting") {
      if (charIndexRef.current > 0) {
        charIndexRef.current -= 1;
        setDisplayText(current.slice(0, charIndexRef.current));
        timerRef.current = setTimeout(tick, deletingSpeed);
      } else {
        /* Fully deleted — advance to next string */
        const nextIndex = stringIndexRef.current + 1;

        if (nextIndex >= safeStrings.length) {
          if (!loop) {
            completedRef.current = true;
            onComplete?.();
            return;
          }
          stringIndexRef.current = 0;
        } else {
          stringIndexRef.current = nextIndex;
        }

        /* Brief pause before typing next string */
        phaseRef.current = "pausing";
        timerRef.current = setTimeout(() => {
          phaseRef.current = "typing";
          tick();
        }, pauseTime / 3);
      }
    }
    /* "pausing" is handled inline above via setTimeout */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeStrings, typingSpeed, deletingSpeed, pauseTime, loop, isSingleString, onComplete]);

  /* ---- Start / restart the animation ---- */
  useEffect(() => {
    if (prefersReducedMotion) {
      /* Show the last string immediately, signal complete */
      setDisplayText(safeStrings[safeStrings.length - 1] ?? "");
      if (!loop) onComplete?.();
      return;
    }

    /* Reset state */
    stringIndexRef.current = 0;
    charIndexRef.current = 0;
    phaseRef.current = "typing";
    completedRef.current = false;
    setDisplayText("");

    timerRef.current = setTimeout(tick, typingSpeed);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, tick]);

  /* ---- Cursor style ---- */
  const cursorStyle: React.CSSProperties = {
    display: "inline-block",
    marginLeft: "1px",
    animation: prefersReducedMotion
      ? "none"
      : `${KEYFRAME_NAME} ${cursorBlinkSpeed}ms step-end infinite`,
    fontWeight: 400,
    userSelect: "none",
  };

  /* ---- Wrapper style ---- */
  const wrapperStyle: React.CSSProperties = {
    display: "inline",
    whiteSpace: "pre-wrap",
  };

  /* ---- Render ---- */
  return (
    <Wrapper
      className={className}
      style={wrapperStyle}
      aria-label={safeStrings.join(", ")}
      role="status"
      aria-live="polite"
    >
      {displayText}
      <span style={cursorStyle} aria-hidden="true">
        {cursor}
      </span>
    </Wrapper>
  );
}

export default TypingEffect;
