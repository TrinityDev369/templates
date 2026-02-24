import { Smartphone, Shield, Zap, Bell, Users, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppHero } from "./components/app-hero";
import { AppFeatures } from "./components/app-features";
import type { Feature } from "./components/app-features";
import { AppScreenshots } from "./components/app-screenshots";
import type { Screenshot } from "./components/app-screenshots";
import { StoreBadges } from "./components/store-badges";

/* ================================================================== */
/* App configuration -- edit these to match your app                    */
/* ================================================================== */

const APP_NAME = "YourApp";
const APP_TAGLINE = "Simplify your life, one tap at a time";
const APP_DESCRIPTION =
  "The all-in-one mobile app that helps you stay organized, connected, and productive. Download now and join millions of users who have transformed the way they work and live.";

const APP_STORE_URL = "#";
const PLAY_STORE_URL = "#";

/* ================================================================== */
/* Stats                                                                */
/* ================================================================== */
const STATS = [
  { label: "Downloads", value: "2.4M+" },
  { label: "App Rating", value: "4.8" },
  { label: "Reviews", value: "12.4K" },
];

/* ================================================================== */
/* Features                                                             */
/* ================================================================== */
const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed with instant load times and smooth animations. Your experience stays fluid no matter what.",
    color: "bg-yellow-500",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "End-to-end encryption, biometric authentication, and SOC 2 compliance keep your data safe and private.",
    color: "bg-green-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "AI-powered alerts that learn your preferences and only notify you about what truly matters.",
    color: "bg-blue-600",
  },
  {
    icon: Users,
    title: "Seamless Collaboration",
    description:
      "Share, comment, and work together in real time with your team, friends, or family members.",
    color: "bg-purple-600",
  },
  {
    icon: Smartphone,
    title: "Offline Ready",
    description:
      "Full functionality even without internet. Your data syncs automatically when you are back online.",
    color: "bg-rose-600",
  },
  {
    icon: Download,
    title: "Automatic Backups",
    description:
      "Never lose your work. Continuous cloud backups with one-tap restore for complete peace of mind.",
    color: "bg-cyan-600",
  },
];

/* ================================================================== */
/* Screenshots                                                          */
/* ================================================================== */
const SCREENSHOTS: Screenshot[] = [
  {
    id: "home",
    label: "Home Dashboard",
    gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  {
    id: "activity",
    label: "Activity Feed",
    gradient: "bg-gradient-to-br from-green-500 to-teal-600",
  },
  {
    id: "profile",
    label: "User Profile",
    gradient: "bg-gradient-to-br from-orange-500 to-pink-600",
  },
  {
    id: "settings",
    label: "Settings",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-600",
  },
  {
    id: "analytics",
    label: "Analytics",
    gradient: "bg-gradient-to-br from-rose-500 to-red-600",
  },
  {
    id: "messages",
    label: "Messages",
    gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
];

/* ================================================================== */
/* Page component                                                       */
/* ================================================================== */
export default function AppDownloadPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                          */}
      {/* ------------------------------------------------------------ */}
      <AppHero
        appName={APP_NAME}
        tagline={APP_TAGLINE}
        description={APP_DESCRIPTION}
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
        stats={STATS}
      />

      {/* ------------------------------------------------------------ */}
      {/* Features                                                      */}
      {/* ------------------------------------------------------------ */}
      <AppFeatures features={FEATURES} />

      {/* ------------------------------------------------------------ */}
      {/* Screenshots                                                   */}
      {/* ------------------------------------------------------------ */}
      <AppScreenshots screenshots={SCREENSHOTS} />

      {/* ------------------------------------------------------------ */}
      {/* QR Code + final CTA                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700",
              "px-8 py-14 text-center shadow-xl sm:px-12 sm:py-20"
            )}
          >
            {/* Decorative circles */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Get the app now
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
                Scan the QR code with your phone camera or tap the download
                buttons below. Available on iOS and Android.
              </p>

              {/* QR code placeholder */}
              <div className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Smartphone className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-1 text-xs text-gray-500">QR Code</p>
                  </div>
                </div>
              </div>

              {/* Store badges */}
              <StoreBadges
                appStoreUrl={APP_STORE_URL}
                playStoreUrl={PLAY_STORE_URL}
                size="lg"
                className="mt-8 justify-center"
              />

              <p className="mt-6 text-sm text-blue-200">
                Free download. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
