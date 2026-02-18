"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { FormBuilderProps, FormStep } from "./form-builder.types";
import { FormFieldRenderer } from "./form-field-renderer";
import { StepIndicator } from "./step-indicator";

/* -- Helpers --------------------------------------------------------------- */

/**
 * Builds default values for a single step from its field configs,
 * merging in any previously collected data to restore user input.
 */
function getStepDefaults(
  step: FormStep,
  collected: Record<string, unknown>
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of step.fields) {
    if (collected[field.name] !== undefined) {
      defaults[field.name] = collected[field.name];
    } else if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue;
    } else if (field.type === "checkbox") {
      defaults[field.name] = false;
    } else {
      defaults[field.name] = "";
    }
  }
  return defaults;
}

/* -- Internal step form ---------------------------------------------------- */

interface StepFormProps {
  step: FormStep;
  defaultValues: Record<string, unknown>;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onStepSubmit: (data: Record<string, unknown>) => void;
  onPrevious: (currentValues: Record<string, unknown>) => void;
}

/**
 * Internal component that owns a single `useForm` instance per step.
 *
 * Mounted with a `key` prop so it remounts (and reinitializes useForm)
 * whenever the step changes. This guarantees a fresh form with the
 * correct Zod schema and default values for each step.
 */
function StepForm({
  step,
  defaultValues,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onStepSubmit,
  onPrevious,
}: StepFormProps) {
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(step.schema),
    defaultValues,
    mode: "onTouched",
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onStepSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Render all fields for this step */}
        <div className="space-y-4">
          {step.fields.map((fieldConfig) => (
            <FormFieldRenderer
              key={fieldConfig.name}
              config={fieldConfig}
              form={form}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div
          className={cn(
            "flex gap-3 pt-2",
            isFirstStep ? "justify-end" : "justify-between"
          )}
        >
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onPrevious(form.getValues())}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : isLastStep
                ? "Submit"
                : "Next"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

/* -- Main component -------------------------------------------------------- */

/**
 * Multi-step form orchestrator with per-step Zod validation.
 *
 * Features:
 * - Renders a step indicator (progress bar with numbered circles).
 * - Validates each step via its Zod schema before advancing.
 * - Merges data from all steps and passes it to `onSubmit` on the final step.
 * - Preserves user input when navigating between steps.
 * - "Previous" / "Next" navigation; final step shows "Submit".
 * - Keyboard accessible: Enter advances to next step or submits on final step.
 * - Mobile responsive.
 */
export function FormBuilder({ steps, onSubmit, className }: FormBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accumulated data from all steps (persists across step navigation)
  const collectedData = useRef<Record<string, unknown>>({});

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  /**
   * Handle validated step data ("Next" or "Submit").
   */
  const handleStepSubmit = useCallback(
    async (stepData: Record<string, unknown>) => {
      // Merge current step's validated data
      collectedData.current = { ...collectedData.current, ...stepData };

      if (isLastStep) {
        setIsSubmitting(true);
        try {
          await onSubmit(collectedData.current);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    },
    [isLastStep, onSubmit]
  );

  /**
   * Navigate to the previous step, preserving current (unvalidated) input.
   */
  const handlePrevious = useCallback(
    (currentValues: Record<string, unknown>) => {
      collectedData.current = { ...collectedData.current, ...currentValues };
      setCurrentStep((prev) => Math.max(0, prev - 1));
    },
    []
  );

  return (
    <div className={cn("mx-auto w-full max-w-2xl", className)}>
      {/* Step progress indicator */}
      {steps.length > 1 && (
        <div className="mb-8">
          <StepIndicator
            steps={steps.map((s) => s.title)}
            currentStep={currentStep}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
          {step.description && (
            <CardDescription>{step.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {/*
           * key={currentStep} forces StepForm to remount when step changes,
           * guaranteeing useForm reinitializes with the correct schema/defaults.
           */}
          <StepForm
            key={currentStep}
            step={step}
            defaultValues={getStepDefaults(step, collectedData.current)}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            onStepSubmit={handleStepSubmit}
            onPrevious={handlePrevious}
          />
        </CardContent>
      </Card>
    </div>
  );
}
