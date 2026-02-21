"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Mail,
  PartyPopper,
  Plus,
  Sparkles,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { cn } from "../lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface TeamMember {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

interface ProfileData {
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  industry: string;
}

interface Preferences {
  emailNotifications: boolean;
  darkMode: boolean;
  twoFactorAuth: boolean;
  marketingEmails: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const STEPS = [
  { label: "Welcome", icon: Sparkles },
  { label: "Profile", icon: User },
  { label: "Preferences", icon: ChevronRight },
  { label: "Team", icon: Users },
  { label: "Complete", icon: Check },
] as const;

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Marketing",
  "Manufacturing",
  "Consulting",
  "Real Estate",
  "Other",
];

const TEAM_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.label} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted &&
                    "bg-indigo-600 border-indigo-600 text-white",
                  isCurrent &&
                    "border-indigo-600 bg-indigo-50 text-indigo-600",
                  !isCompleted &&
                    !isCurrent &&
                    "border-gray-200 bg-white text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent && "text-indigo-600",
                  isCompleted && "text-indigo-600",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="relative mt-2">
        <div className="h-1.5 bg-gray-100 rounded-full" />
        <div
          className="absolute top-0 left-0 h-1.5 bg-indigo-600 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          enabled ? "bg-indigo-600" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step Views                                                                */
/* -------------------------------------------------------------------------- */

function StepWelcome() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 mb-6">
        <Sparkles className="w-12 h-12 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome aboard!
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Let&apos;s get you set up in just a few steps. This should only take a
        couple of minutes.
      </p>

      {/* Avatar upload placeholder */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors group-hover:border-indigo-400 group-hover:bg-indigo-50">
            <Camera className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-500">Upload a profile photo</p>
      </div>
    </div>
  );
}

function StepProfile({
  profile,
  onChange,
}: {
  profile: ProfileData;
  onChange: (field: keyof ProfileData, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Tell us about yourself
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This helps us personalise your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First name
          </label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="Jane"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last name
          </label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="Doe"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          value={profile.company}
          onChange={(e) => onChange("company", e.target.value)}
          placeholder="Acme Inc."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <input
          type="text"
          value={profile.role}
          onChange={(e) => onChange("role", e.target.value)}
          placeholder="Product Manager"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <select
          value={profile.industry}
          onChange={(e) => onChange("industry", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
        >
          <option value="">Select an industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StepPreferences({
  preferences,
  onToggle,
}: {
  preferences: Preferences;
  onToggle: (key: keyof Preferences) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Set your preferences
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          You can always change these later in settings.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 px-4">
        <ToggleSwitch
          enabled={preferences.emailNotifications}
          onToggle={() => onToggle("emailNotifications")}
          label="Email notifications"
          description="Receive updates about activity on your account"
        />
        <ToggleSwitch
          enabled={preferences.darkMode}
          onToggle={() => onToggle("darkMode")}
          label="Dark mode"
          description="Use a dark colour scheme across the interface"
        />
        <ToggleSwitch
          enabled={preferences.twoFactorAuth}
          onToggle={() => onToggle("twoFactorAuth")}
          label="Two-factor authentication"
          description="Add an extra layer of security to your account"
        />
        <ToggleSwitch
          enabled={preferences.marketingEmails}
          onToggle={() => onToggle("marketingEmails")}
          label="Marketing emails"
          description="Receive product updates and feature announcements"
        />
      </div>
    </div>
  );
}

function StepTeam({
  members,
  onAdd,
  onRemove,
  onUpdate,
}: {
  members: TeamMember[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof TeamMember, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Invite your team
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Collaborate with your colleagues. You can skip this step and invite
          them later.
        </p>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3"
          >
            <div className="flex-shrink-0">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={member.email}
              onChange={(e) => onUpdate(member.id, "email", e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <select
              value={member.role}
              onChange={(e) => onUpdate(member.id, "role", e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
            >
              {TEAM_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRemove(member.id)}
              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
              aria-label="Remove member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another member
      </button>
    </div>
  );
}

function StepComplete({
  profile,
  preferences,
  memberCount,
}: {
  profile: ProfileData;
  preferences: Preferences;
  memberCount: number;
}) {
  const summaryItems = [
    {
      label: "Name",
      value:
        [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
        "Not provided",
    },
    { label: "Company", value: profile.company || "Not provided" },
    { label: "Industry", value: profile.industry || "Not provided" },
    {
      label: "Notifications",
      value: preferences.emailNotifications ? "Enabled" : "Disabled",
    },
    {
      label: "Two-factor auth",
      value: preferences.twoFactorAuth ? "Enabled" : "Disabled",
    },
    {
      label: "Team invites",
      value:
        memberCount > 0
          ? `${memberCount} member${memberCount !== 1 ? "s" : ""} invited`
          : "No invites sent",
    },
  ];

  return (
    <div className="text-center py-6">
      <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-5">
        <PartyPopper className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        You&apos;re all set!
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Your account is ready to go. Here&apos;s a summary of your setup.
      </p>

      <div className="max-w-sm mx-auto bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 text-left">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className="text-sm font-medium text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

export function OnboardingWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    company: "",
    role: "",
    industry: "",
  });

  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
    marketingEmails: true,
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: crypto.randomUUID(), email: "", role: "viewer" },
  ]);

  /* -- Handlers ----------------------------------------------------------- */

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: "", role: "viewer" },
    ]);
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMember = (
    id: string,
    field: keyof TeamMember,
    value: string
  ) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const filledMemberCount = teamMembers.filter(
    (m) => m.email.trim().length > 0
  ).length;

  /* -- Render ------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">
            Account Setup
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {currentStep === 0 && <StepWelcome />}
          {currentStep === 1 && (
            <StepProfile profile={profile} onChange={handleProfileChange} />
          )}
          {currentStep === 2 && (
            <StepPreferences
              preferences={preferences}
              onToggle={handlePreferenceToggle}
            />
          )}
          {currentStep === 3 && (
            <StepTeam
              members={teamMembers}
              onAdd={handleAddMember}
              onRemove={handleRemoveMember}
              onUpdate={handleUpdateMember}
            />
          )}
          {currentStep === 4 && (
            <StepComplete
              profile={profile}
              preferences={preferences}
              memberCount={filledMemberCount}
            />
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            {!isFirstStep ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <span />
            )}

            {isLastStep ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {currentStep === 0 ? "Get Started" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
