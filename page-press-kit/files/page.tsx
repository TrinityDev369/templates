"use client";

import { Download, Palette, Type, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandAssets } from "./components/brand-assets";
import type { LogoVariant, ColorSwatch, FontEntry } from "./components/brand-assets";
import { CompanyFacts, PressContacts } from "./components/press-contacts";
import type { CompanyFact, PressContact } from "./components/press-contacts";

/* ================================================================== */
/* Sample data -- replace with your brand assets                       */
/* ================================================================== */

const LOGOS: LogoVariant[] = [
  {
    id: "logo-dark",
    label: "Logo - Dark",
    description: "Primary logo on light backgrounds",
    preview: "light",
    imageUrl: "/brand/logo-dark.svg",
    downloadUrl: "/brand/logo-dark.zip",
  },
  {
    id: "logo-light",
    label: "Logo - Light",
    description: "Primary logo on dark backgrounds",
    preview: "dark",
    imageUrl: "/brand/logo-light.svg",
    downloadUrl: "/brand/logo-light.zip",
  },
  {
    id: "logo-icon",
    label: "Icon Only",
    description: "Logomark without wordmark",
    preview: "light",
    imageUrl: "/brand/logo-icon.svg",
    downloadUrl: "/brand/logo-icon.zip",
  },
  {
    id: "logo-horizontal",
    label: "Horizontal Lockup",
    description: "Wide format for headers and emails",
    preview: "light",
    imageUrl: "/brand/logo-horizontal.svg",
    downloadUrl: "/brand/logo-horizontal.zip",
  },
  {
    id: "logo-stacked",
    label: "Stacked Lockup",
    description: "Vertical format for social and print",
    preview: "dark",
    imageUrl: "/brand/logo-stacked.svg",
    downloadUrl: "/brand/logo-stacked.zip",
  },
  {
    id: "logo-mono",
    label: "Monochrome",
    description: "Single-color variant for limited palettes",
    preview: "light",
    imageUrl: "/brand/logo-mono.svg",
    downloadUrl: "/brand/logo-mono.zip",
  },
];

const COLORS: ColorSwatch[] = [
  { name: "Primary", hex: "#2563eb", bgClass: "bg-blue-600", lightText: true },
  {
    name: "Primary Dark",
    hex: "#1d4ed8",
    bgClass: "bg-blue-700",
    lightText: true,
  },
  { name: "Accent", hex: "#8b5cf6", bgClass: "bg-violet-500", lightText: true },
  {
    name: "Success",
    hex: "#16a34a",
    bgClass: "bg-green-600",
    lightText: true,
  },
  {
    name: "Neutral 900",
    hex: "#111827",
    bgClass: "bg-gray-900",
    lightText: true,
  },
  { name: "Neutral 100", hex: "#f3f4f6", bgClass: "bg-gray-100" },
  { name: "White", hex: "#ffffff", bgClass: "bg-white" },
  { name: "Warning", hex: "#f59e0b", bgClass: "bg-amber-500" },
];

const FONTS: FontEntry[] = [
  {
    name: "Inter",
    weight: "Regular (400) / Medium (500) / Bold (700)",
    sampleText: "The quick brown fox jumps over the lazy dog",
    fontClass: "font-sans",
  },
  {
    name: "JetBrains Mono",
    weight: "Regular (400) / Medium (500)",
    sampleText: "const brand = { quality: true };",
    fontClass: "font-mono",
  },
];

const COMPANY_FACTS: CompanyFact[] = [
  { label: "Founded", value: "2022" },
  { label: "Team Size", value: "48" },
  { label: "Headquarters", value: "Berlin, DE" },
  { label: "Active Clients", value: "200+" },
];

const PRESS_CONTACTS: PressContact[] = [
  {
    name: "Sarah Chen",
    role: "Head of Communications",
    email: "press@example.com",
  },
  {
    name: "Max Mueller",
    role: "Brand Manager",
    email: "brand@example.com",
  },
];

/* ================================================================== */
/* Page component                                                      */
/* ================================================================== */

export default function PressKitPage() {
  function handleDownloadAll() {
    // TODO: Replace with actual download logic or link to a .zip bundle
    window.open("/brand/press-kit-all.zip", "_blank");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Press Kit
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Everything you need to represent our brand. Download logos, review
            our color palette, and find official company information for your
            press and media coverage.
          </p>

          {/* Quick-nav pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: Download, label: "Logos" },
              { icon: Palette, label: "Colors" },
              { icon: Type, label: "Typography" },
              { icon: Building, label: "Company" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium",
                  "border border-gray-200 bg-white text-gray-700 transition-colors",
                  "hover:bg-gray-50 hover:border-gray-300",
                  "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  "dark:hover:bg-gray-750 dark:hover:border-gray-600",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Content sections                                              */}
      {/* ------------------------------------------------------------ */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Brand assets: logos, colors, typography */}
        <section id="logos">
          <BrandAssets
            logos={LOGOS}
            colors={COLORS}
            fonts={FONTS}
            onDownloadAll={handleDownloadAll}
          />
        </section>

        {/* Company facts */}
        <section id="company">
          <CompanyFacts facts={COMPANY_FACTS} />
        </section>

        {/* Press contacts */}
        <section id="contacts">
          <PressContacts contacts={PRESS_CONTACTS} />
        </section>

        {/* ---------------------------------------------------------- */}
        {/* Download All CTA                                            */}
        {/* ---------------------------------------------------------- */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Download Complete Press Kit
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Get all logos, brand guidelines, and media assets in one
            convenient package.
          </p>
          <button
            type="button"
            onClick={handleDownloadAll}
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium",
              "bg-blue-600 text-white hover:bg-blue-700 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            <Download className="h-4 w-4" />
            Download All Assets
          </button>
        </section>
      </div>
    </main>
  );
}
