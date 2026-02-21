"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/classes", label: "Classes" },
  { href: "/schedule", label: "Schedule" },
  { href: "/trainers", label: "Trainers" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-brand-500" />
          <span className="text-xl font-extrabold tracking-tight text-white">
            Iron<span className="text-brand-500">Peak</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/membership"
            className="hidden rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 md:inline-flex"
          >
            Join Now
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-800 transition-all duration-300 ease-in-out md:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/membership"
            onClick={() => setMobileOpen(false)}
            className="mt-3 block rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Join Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
