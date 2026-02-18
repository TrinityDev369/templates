"use client";

import { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { Check, X, ArrowRight, Crown } from "lucide-react";

export interface PlanDetails {
  name: string;
  price: string;
  features: string[];
}

export interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: PlanDetails;
  upgradePlan: PlanDetails;
  onUpgrade?: () => void;
}

export function UpgradeModal({
  open,
  onClose,
  currentPlan,
  upgradePlan,
  onUpgrade,
}: UpgradeModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const upgradeExclusiveFeatures = new Set(
    upgradePlan.features.filter(
      (feature) => !currentPlan.features.includes(feature)
    )
  );

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <h2
            id="upgrade-modal-title"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Upgrade Your Plan
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan comparison */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {/* Current plan column */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
            <div className="mb-4">
              <p className="text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Current Plan
              </p>
              <h3 className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {currentPlan.name}
              </h3>
              <p className="mt-1 text-2xl font-semibold text-neutral-700 dark:text-neutral-300">
                {currentPlan.price}
              </p>
            </div>
            <ul className="space-y-2.5">
              {currentPlan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade plan column */}
          <div className="rounded-xl border-2 border-blue-500 bg-blue-50/50 p-5 ring-1 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-950/20 dark:ring-blue-400/20">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Upgrade Plan
                </p>
              </div>
              <h3 className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {upgradePlan.name}
              </h3>
              <p className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">
                {upgradePlan.price}
              </p>
            </div>
            <ul className="space-y-2.5">
              {upgradePlan.features.map((feature) => {
                const isExclusive = upgradeExclusiveFeatures.has(feature);
                return (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isExclusive
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-blue-500 dark:text-blue-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isExclusive
                          ? "font-semibold text-emerald-700 dark:text-emerald-300"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Cancel
          </button>
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-offset-neutral-900"
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return ReactDOM.createPortal(modalContent, document.body);
}
