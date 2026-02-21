import Link from "next/link";
import { Dumbbell, Mail } from "lucide-react";
import { contactInfo } from "@/lib/data";

const quickLinks = [
  { href: "/classes", label: "Classes" },
  { href: "/schedule", label: "Schedule" },
  { href: "/trainers", label: "Trainers" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-brand-500" />
              <span className="text-lg font-extrabold tracking-tight text-white">
                Iron<span className="text-brand-500">Peak</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Push your limits at Iron Peak. State-of-the-art equipment,
              world-class trainers, and a community that fuels your fire.
              Every rep counts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
              Hours
            </h3>
            <ul className="space-y-3">
              {contactInfo.hours.map((entry) => (
                <li key={entry.days}>
                  <span className="block text-sm font-medium text-white">
                    {entry.days}
                  </span>
                  <span className="text-sm text-gray-400">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Get training tips, class updates, and exclusive deals straight
              to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Iron Peak Fitness. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
