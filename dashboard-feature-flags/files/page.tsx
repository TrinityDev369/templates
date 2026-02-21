"use client";

import { useState } from "react";
import {
  Flag,
  Search,
  Plus,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Users,
  Globe,
  Clock,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Environment = "production" | "staging" | "development";

interface TargetingRule {
  label: string;
  percentage?: number;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: "active" | "inactive" | "staged";
  environments: Environment[];
  targeting: TargetingRule;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const ff = (
  id: string, name: string, description: string, enabled: boolean,
  status: FeatureFlag["status"], environments: Environment[],
  targeting: TargetingRule, createdAt: string, updatedAt: string,
): FeatureFlag => ({ id, name, description, enabled, status, environments, targeting, createdAt, updatedAt });

const INITIAL_FLAGS: FeatureFlag[] = [
  ff("ff-001", "dark-mode", "Enable dark mode theme toggle across the application",
    true, "active", ["production", "staging", "development"], { label: "100% of users", percentage: 100 }, "2025-11-02", "2026-01-18"),
  ff("ff-002", "new-checkout", "Redesigned multi-step checkout flow with address autocomplete",
    true, "active", ["staging", "development"], { label: "Beta users only", percentage: 12 }, "2026-01-05", "2026-02-14"),
  ff("ff-003", "beta-ai-search", "AI-powered semantic search across product catalog",
    false, "staged", ["development"], { label: "Internal QA team", percentage: 2 }, "2026-02-01", "2026-02-19"),
  ff("ff-004", "onboarding-v2", "Guided onboarding wizard with interactive product tour",
    true, "active", ["production", "staging"], { label: "New signups only", percentage: 100 }, "2025-12-10", "2026-01-30"),
  ff("ff-005", "usage-analytics", "Real-time usage analytics dashboard for admin users",
    false, "inactive", [], { label: "Disabled", percentage: 0 }, "2025-10-20", "2025-12-01"),
  ff("ff-006", "geo-pricing", "Region-based dynamic pricing with currency conversion",
    true, "active", ["production"], { label: "US region", percentage: 45 }, "2026-01-12", "2026-02-10"),
  ff("ff-007", "notification-center", "Unified notification center with in-app and email preferences",
    false, "staged", ["staging", "development"], { label: "50% rollout", percentage: 50 }, "2026-02-05", "2026-02-18"),
  ff("ff-008", "team-workspaces", "Collaborative team workspaces with role-based access control",
    false, "inactive", [], { label: "Disabled", percentage: 0 }, "2025-09-15", "2025-11-28"),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ENV_COLORS: Record<Environment, string> = {
  production: "bg-red-50 text-red-700 border-red-200",
  staging: "bg-amber-50 text-amber-700 border-amber-200",
  development: "bg-sky-50 text-sky-700 border-sky-200",
};

const STATUS_DOT: Record<FeatureFlag["status"], string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-400",
  staged: "bg-amber-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Derived ------------------------------------------------------------------

  const filtered = flags.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: flags.length,
    active: flags.filter((f) => f.status === "active").length,
    inactive: flags.filter((f) => f.status === "inactive").length,
    staged: flags.filter((f) => f.status === "staged").length,
  };

  // Handlers -----------------------------------------------------------------

  function toggleFlag(id: string) {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const enabled = !f.enabled;
        const status: FeatureFlag["status"] = enabled ? "active" : "inactive";
        return { ...f, enabled, status, updatedAt: new Date().toISOString().slice(0, 10) };
      }),
    );
  }

  function confirmDelete(id: string) {
    setDeleteTarget(id);
  }

  function executeDelete() {
    if (!deleteTarget) return;
    setFlags((prev) => prev.filter((f) => f.id !== deleteTarget));
    setDeleteTarget(null);
  }

  // Render -------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
              <p className="text-sm text-gray-500">Manage rollout and targeting rules</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search flags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-64 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4" />
              Create Flag
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Flags", value: stats.total, icon: Flag, color: "text-indigo-600 bg-indigo-50" },
            { label: "Active", value: stats.active, icon: ToggleRight, color: "text-emerald-600 bg-emerald-50" },
            { label: "Inactive", value: stats.inactive, icon: ToggleLeft, color: "text-gray-500 bg-gray-100" },
            { label: "Staged", value: stats.staged, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flag List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No flags match your search.</p>
            </div>
          )}

          {filtered.map((flag) => (
            <div
              key={flag.id}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_DOT[flag.status]}`} />
                    <span className="font-mono text-sm font-semibold text-gray-900">{flag.name}</span>
                    <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-500">
                      {flag.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{flag.description}</p>

                  {/* Environments */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    {flag.environments.length === 0 ? (
                      <span className="text-xs text-gray-400">No environments</span>
                    ) : (
                      flag.environments.map((env) => (
                        <span
                          key={env}
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${ENV_COLORS[env]}`}
                        >
                          {env}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Targeting + dates */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {flag.targeting.label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Created {formatDate(flag.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Updated {formatDate(flag.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 sm:ml-4">
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100"
                    title={flag.enabled ? "Disable flag" : "Enable flag"}
                  >
                    {flag.enabled ? (
                      <ToggleRight className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={flag.enabled ? "text-emerald-600" : "text-gray-500"}>
                      {flag.enabled ? "On" : "Off"}
                    </span>
                  </button>

                  <button
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    title="Edit flag"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => confirmDelete(flag.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete flag"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Delete Feature Flag</h2>
            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-mono font-medium text-gray-700">
                {flags.find((f) => f.id === deleteTarget)?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { INITIAL_FLAGS };
export type { FeatureFlag, Environment, TargetingRule };
