/**
 * Type definitions for the onboarding wizard.
 *
 * Covers all steps of the multi-step onboarding process:
 * welcome -> profile -> preferences -> complete
 */

/* -- Step state ---------------------------------------------------- */

/**
 * Discriminated step identifier for the onboarding wizard.
 */
export type OnboardingStep = "welcome" | "profile" | "preferences" | "complete";

/* -- Step data types ----------------------------------------------- */

/**
 * Data collected in the "profile" step.
 */
export interface ProfileData {
  /** User's chosen display name. */
  displayName: string;
  /** Optional avatar file selected by the user (not uploaded yet). */
  avatarFile: File | null;
}

/**
 * Theme preference for the application.
 */
export type ThemePreference = "light" | "dark" | "system";

/**
 * Data collected in the "preferences" step.
 */
export interface PreferencesData {
  /** User's chosen theme. */
  theme: ThemePreference;
  /** Whether to receive email notifications. */
  emailNotifications: boolean;
  /** Whether to receive push/in-app notifications. */
  pushNotifications: boolean;
}

/**
 * Combined output data from the entire onboarding flow.
 * Passed to `onComplete` when the user finishes all steps.
 */
export interface OnboardingData {
  profile: ProfileData;
  preferences: PreferencesData;
}

/* -- Component props ----------------------------------------------- */

/**
 * Props for the top-level OnboardingWizard component.
 */
export interface OnboardingWizardProps {
  /**
   * Called when the user completes all steps.
   * Receives the combined profile and preferences data.
   */
  onComplete: (data: OnboardingData) => void | Promise<void>;

  /**
   * Optional callback to skip the entire onboarding flow.
   * When omitted, the skip button is hidden.
   */
  onSkip?: () => void;

  /** Additional CSS class name for the root Card element. */
  className?: string;
}

/**
 * Props for the ProgressBar component.
 */
export interface ProgressBarProps {
  /** Ordered list of step labels. */
  steps: string[];
  /** Zero-based index of the current active step. */
  currentStep: number;
}

/**
 * Props for the StepWelcome component.
 */
export interface StepWelcomeProps {
  onNext: () => void;
}

/**
 * Props for the StepProfile component.
 */
export interface StepProfileProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Props for the StepPreferences component.
 */
export interface StepPreferencesProps {
  data: PreferencesData;
  onChange: (data: PreferencesData) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Props for the StepComplete component.
 */
export interface StepCompleteProps {
  onFinish: () => void;
}
