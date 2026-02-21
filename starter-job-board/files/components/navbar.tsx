"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/jobs"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Find Jobs
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Companies
          </Link>
          <Link
            href="/post-job"
            className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Post a Job
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-100 bg-white transition-all duration-200 md:hidden",
          mobileOpen ? "max-h-64" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          <Link
            href="/jobs"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => setMobileOpen(false)}
          >
            Find Jobs
          </Link>
          <Link
            href="/companies"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => setMobileOpen(false)}
          >
            Companies
          </Link>
          <Link
            href="/post-job"
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
            onClick={() => setMobileOpen(false)}
          >
            Post a Job
          </Link>
        </nav>
      </div>
    </header>
  );
}
