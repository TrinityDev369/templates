"use client";

import { type FC, useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { ProgressBar } from "./progress-bar";
import { StepWelcome } from "./step-welcome";
import { StepProfile } from "./step-profile";
import { StepPreferences } from "./step-preferences";
import { StepComplete } from "./step-complete";
import type {
  OnboardingStep,
  OnboardingWizardProps,
  ProfileData,
  PreferencesData,
} from "./onboarding-wizard.types";

/* -- Constants ----------------------------------------------------- */

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "profile",
  "preferences",
  "complete",
];

const STEP_LABELS = ["Welcome", "Profile", "Preferences", "Done"];

/* -- OnboardingWizard ---------------------------------------------- */

/**
 * Multi-step onboarding wizard.
 *
 * Steps:
 * 1. **Welcome** - Value props and "Get Started" CTA
 * 2. **Profile** - Display name and avatar upload
 * 3. **Preferences** - Theme and notification settings
 * 4. **Complete** - Success confirmation with dashboard link
 *
 * All collected data is passed to `onComplete` as a single
 * `OnboardingData` object when the user finishes.
 *
 * @example
 * ```tsx
 * <OnboardingWizard
 *   onComplete={async (data) => {
 *     await saveProfile(data.profile);
 *     await savePreferences(data.preferences);
 *     router.push('/dashboard');
 *   }}
 *   onSkip={() => router.push('/dashboard')}
 * />
 * ```
 */
const OnboardingWizard: FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip,
  className,
}) => {
  /* -- State ------------------------------------------------------ */

  const [step, setStep] = useState<OnboardingStep>("welcome");

  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    avatarFile: null,
  });

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    theme: "system",
    emailNotifications: true,
    pushNotifications: true,
  });

  /* -- Navigation helpers ----------------------------------------- */

  const currentIndex = STEP_ORDER.indexOf(step);

  const goTo = useCallback((target: OnboardingStep) => {
    setStep(target);
  }, []);

  const handleComplete = useCallback(() => {
    void onComplete({
      profile: profileData,
      preferences: preferencesData,
    });
  }, [onComplete, profileData, preferencesData]);

  /* -- Render ----------------------------------------------------- */

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-2">
        <ProgressBar steps={STEP_LABELS} currentStep={currentIndex} />
        {onSkip && step !== "complete" && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1 py-0.5"
            >
              Skip for now
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {step === "welcome" && (
          <StepWelcome onNext={() => goTo("profile")} />
        )}

        {step === "profile" && (
          <StepProfile
            data={profileData}
            onChange={setProfileData}
            onNext={() => goTo("preferences")}
            onBack={() => goTo("welcome")}
          />
        )}

        {step === "preferences" && (
          <StepPreferences
            data={preferencesData}
            onChange={setPreferencesData}
            onNext={() => goTo("complete")}
            onBack={() => goTo("profile")}
          />
        )}

        {step === "complete" && (
          <StepComplete onFinish={handleComplete} />
        )}
      </CardContent>
    </Card>
  );
};

export { OnboardingWizard };
