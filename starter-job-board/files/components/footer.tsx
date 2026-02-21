import Link from "next/link";
import { Briefcase } from "lucide-react";

const footerLinks = {
  about: {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  seekers: {
    title: "For Job Seekers",
    links: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Companies", href: "/companies" },
      { label: "Saved Jobs", href: "/saved" },
      { label: "Job Alerts", href: "/alerts" },
    ],
  },
  employers: {
    title: "For Employers",
    links: [
      { label: "Post a Job", href: "/post-job" },
      { label: "Pricing", href: "/pricing" },
      { label: "Employer Dashboard", href: "/dashboard" },
      { label: "Recruiting Solutions", href: "/solutions" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Career Advice", href: "/advice" },
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top section: Brand + Columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">JobFlow</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Connecting talent with opportunity. Find your next career move or
              your next great hire.
            </p>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 border-t border-gray-100 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} JobFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
