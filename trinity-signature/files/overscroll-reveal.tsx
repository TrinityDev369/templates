"use client";

import React, { useEffect, useRef, type ReactNode } from "react";

const TOTAL_HEIGHT = 300;
const HOLD_DURATION = 3000;
const SNAPBACK_DURATION = 600;

export interface OverscrollRevealProps {
  /** Content rendered behind the page — revealed on overscroll */
  background: ReactNode;
  /** Page content that slides up to reveal the background */
  children: ReactNode;
  /** Height of the hidden background layer in px. Default 300 */
  revealHeight?: number;
  /** Background color of the page content wrapper. Default "oklch(8% 0.003 260)" */
  contentBackground?: string;
  /** Pixels of the background visible before scrolling. Default 0 (fully hidden) */
  peek?: number;
  /** Class name applied to the page content wrapper */
  className?: string;
}

/**
 * Overscroll-reveal layout: wraps page content and reveals
 * a hidden background layer when the user scrolls past the bottom.
 *
 * Usage:
 * ```tsx
 * <OverscrollReveal background={<TrinitySignature accentColor="#00C9DB" />}>
 *   <YourPageContent />
 * </OverscrollReveal>
 * ```
 */
export function OverscrollReveal({
  background,
  children,
  revealHeight = TOTAL_HEIGHT,
  contentBackground = "oklch(8% 0.003 260)",
  peek = 0,
  className,
}: OverscrollRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const maxReveal = revealHeight - peek;
    let offset = 0;
    let springRafId = 0;
    let releaseTimer = 0;
    let isAnimating = false;

    function applyOffset(px: number) {
      offset = Math.max(0, Math.min(maxReveal, px));
      wrapper!.style.transform =
        offset > 0 ? `translateY(-${offset}px)` : "";
    }

    function snapBack() {
      cancelAnimationFrame(springRafId);
      const startOffset = offset;
      if (startOffset <= 0) return;
      isAnimating = true;
      const startTime = performance.now();

      function animate(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / SNAPBACK_DURATION, 1);
        const eased = progress * progress * progress;
        applyOffset(startOffset * (1 - eased));

        if (progress < 1 && offset > 0.5) {
          springRafId = requestAnimationFrame(animate);
        } else {
          applyOffset(0);
          isAnimating = false;
        }
      }

      springRafId = requestAnimationFrame(animate);
    }

    function scheduleSnapBack() {
      clearTimeout(releaseTimer);
      const nearFull = offset > maxReveal * 0.85;
      const delay = nearFull ? HOLD_DURATION : 150;
      releaseTimer = window.setTimeout(snapBack, delay);
    }

    function isAtBottom() {
      const scrollBottom = window.scrollY + window.innerHeight;
      return scrollBottom >= document.documentElement.scrollHeight - 2;
    }

    function onWheel(e: WheelEvent) {
      if (isAnimating) {
        if (e.deltaY > 0) e.preventDefault();
        return;
      }

      if (e.deltaY <= 0) {
        if (offset > 0) {
          e.preventDefault();
          cancelAnimationFrame(springRafId);
          clearTimeout(releaseTimer);
          applyOffset(offset + e.deltaY * 0.5);
          if (offset <= 0) applyOffset(0);
          if (offset > 0) scheduleSnapBack();
        }
        return;
      }

      if (!isAtBottom() && offset === 0) return;

      e.preventDefault();
      cancelAnimationFrame(springRafId);
      clearTimeout(releaseTimer);

      const resistance = 1 - (offset / maxReveal) * 0.7;
      applyOffset(offset + e.deltaY * 0.5 * resistance);
      scheduleSnapBack();
    }

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(springRafId);
      clearTimeout(releaseTimer);
    };
  }, [revealHeight, peek]);

  return (
    <>
      {/* Background layer — fixed at viewport bottom, behind content */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: revealHeight,
          zIndex: 0,
        }}
      >
        {background}
      </div>

      {/* Page content — solid bg sits on top, slides up to reveal */}
      <div
        ref={wrapperRef}
        className={className}
        style={{
          position: "relative",
          zIndex: 1,
          background: contentBackground,
          minHeight: "100vh",
          willChange: "transform",
        }}
      >
        {children}
      </div>

      {/* Spacer outside the transform context */}
      {peek > 0 && <div style={{ position: "relative", zIndex: -1, height: peek }} />}
    </>
  );
}
