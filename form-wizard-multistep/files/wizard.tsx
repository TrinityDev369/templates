"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { FieldValues } from "react-hook-form";
import type {
  WizardProps,
  StepState,
  TransitionDirection,
} from "./types";
import { StepIndicator } from "./step-indicator";
import { WizardStep } from "./wizard-step";

/* ------------------------------------------------------------------ */
/*  CSS Keyframes (injected once)                                      */
/* ------------------------------------------------------------------ */

const KEYFRAMES_ID = "wizard-keyframes";

const keyframesCSS = `
@keyframes wizard-slide-in-right {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes wizard-slide-in-left {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-slide-in-right {
  animation: wizard-slide-in-right 0.3s ease-out both;
}
.animate-slide-in-left {
  animation: wizard-slide-in-left 0.3s ease-out both;
}
`;

function useInjectKeyframes() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(KEYFRAMES_ID)) return;
    const style = document.createElement("style");
    style.id = KEYFRAMES_ID;
    style.textContent = keyframesCSS;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Wizard Component                                                   */
/* ------------------------------------------------------------------ */

/**
 * Multi-step form wizard.
 *
 * Manages navigation between steps, per-step Zod validation,
 * progress tracking, and animated transitions. Calls `onComplete`
 * with all collected data when the final step is submitted.
 *
 * @example
 * ```tsx
 * <Wizard
 *   steps={[personalInfoStep, preferencesStep, confirmStep]}
 *   onComplete={(data) => console.log(data)}
 * />
 * ```
 */
export function Wizard({
  steps,
  onComplete,
  className,
  submitLabel = "Submit",
  allowSkip = true,
}: WizardProps) {
  useInjectKeyframes();

  /* ---- State ---- */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const [isAnimating, setIsAnimating] = useState(false);
  const [stepStates, setStepStates] = useState<StepState[]>(() =>
    steps.map((s, i) => ({
      id: s.id,
      label: s.label,
      description: s.description,
      status: i === 0 ? "active" : "upcoming",
      data: null,
    })),
  );

  /* ---- Derived ---- */
  const currentStep = steps[currentIndex];
  const currentState = stepStates[currentIndex];

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  /* ---- Keyboard navigation ---- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape focuses the back button if available
      if (e.key === "Escape" && !isFirst) {
        const backBtn = document.querySelector<HTMLButtonElement>(
          "[data-wizard-back]",
        );
        backBtn?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFirst]);

  /* ---- Helpers ---- */
  const triggerTransition = useCallback(
    (dir: TransitionDirection, nextIndex: number) => {
      setDirection(dir);
      setIsAnimating(true);
      setCurrentIndex(nextIndex);
      // Clear animation class after it finishes
      const timer = setTimeout(() => setIsAnimating(false), 320);
      return () => clearTimeout(timer);
    },
    [],
  );

  const updateStepState = useCallback(
    (
      index: number,
      patch: Partial<StepState>,
    ) => {
      setStepStates((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  /* ---- Handlers ---- */
  const handleStepSubmit = useCallback(
    (data: FieldValues) => {
      // Save data and mark completed
      updateStepState(currentIndex, { status: "completed", data });

      if (isLast) {
        // Collect all data and fire onComplete
        const allData: Record<string, FieldValues> = {};
        stepStates.forEach((s, i) => {
          if (i === currentIndex) {
            allData[s.id] = data;
          } else if (s.data) {
            allData[s.id] = s.data;
          }
        });
        onComplete(allData);
        return;
      }

      // Move to next step
      const nextIndex = currentIndex + 1;
      updateStepState(nextIndex, { status: "active" });
      triggerTransition("forward", nextIndex);
    },
    [currentIndex, isLast, stepStates, onComplete, updateStepState, triggerTransition],
  );

  const handleBack = useCallback(() => {
    if (isFirst) return;
    const prevIndex = currentIndex - 1;
    updateStepState(currentIndex, { status: "upcoming" });
    updateStepState(prevIndex, { status: "active" });
    triggerTransition("backward", prevIndex);
  }, [currentIndex, isFirst, updateStepState, triggerTransition]);

  const handleSkip = useCallback(() => {
    if (isLast) return;
    updateStepState(currentIndex, { status: "skipped", data: null });
    const nextIndex = currentIndex + 1;
    updateStepState(nextIndex, { status: "active" });
    triggerTransition("forward", nextIndex);
  }, [currentIndex, isLast, updateStepState, triggerTransition]);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      if (stepStates[index].status !== "completed") return;
      const dir: TransitionDirection =
        index < currentIndex ? "backward" : "forward";
      updateStepState(currentIndex, {
        status: stepStates[currentIndex].data ? "completed" : "upcoming",
      });
      updateStepState(index, { status: "active" });
      triggerTransition(dir, index);
    },
    [currentIndex, stepStates, updateStepState, triggerTransition],
  );

  /* ---- Accessible step count ---- */
  const stepLabel = useMemo(
    () => `Step ${currentIndex + 1} of ${steps.length}: ${currentStep.label}`,
    [currentIndex, steps.length, currentStep.label],
  );

  /* ---- Render ---- */
  return (
    <div
      className={`w-full max-w-2xl mx-auto ${className ?? ""}`}
      role="group"
      aria-label="Multi-step form"
    >
      {/* Progress indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={stepStates}
          currentIndex={currentIndex}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step heading (accessible) */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {currentStep.label}
        </h2>
        <p className="sr-only">{stepLabel}</p>
      </div>

      {/* Active step */}
      <div
        className="
          bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200
          dark:border-zinc-700 p-6 shadow-sm
        "
      >
        <WizardStep
          key={currentStep.id}
          config={currentStep}
          savedData={currentState.data}
          onSubmit={handleStepSubmit}
          onBack={handleBack}
          onSkip={handleSkip}
          isFirst={isFirst}
          isLast={isLast}
          submitLabel={submitLabel}
          allowSkip={allowSkip}
          direction={direction}
          isAnimating={isAnimating}
        />
      </div>
    </div>
  );
}
