import Link from "next/link";
import { Home, MapPin, Phone, Mail, ArrowRight } from "lucide-react";

const quickLinks = [
  { label: "Properties for Sale", href: "/properties?status=for-sale" },
  { label: "Properties for Rent", href: "/properties?status=for-rent" },
  { label: "Neighborhoods", href: "/neighborhoods" },
  { label: "Our Agents", href: "/agents" },
  { label: "Contact Us", href: "/contact" },
];

const propertyTypes = [
  { label: "Houses", href: "/properties?type=house" },
  { label: "Apartments", href: "/properties?type=apartment" },
  { label: "Condos", href: "/properties?type=condo" },
  { label: "Townhouses", href: "/properties?type=townhouse" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Column */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">Homestead</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Your trusted partner in finding the perfect home. We connect
              buyers, sellers, and renters with exceptional properties and
              experienced agents.
            </p>
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
              <span>123 Real Estate Blvd, Suite 100<br />San Francisco, CA 94102</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-brand-500" />
                <a href="tel:+14155550123" className="transition-colors hover:text-brand-400">
                  (415) 555-0123
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-brand-500" />
                <a href="mailto:hello@homestead.com" className="transition-colors hover:text-brand-400">
                  hello@homestead.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-medium text-gray-300">
                Property Types
              </h4>
              <ul className="space-y-2">
                {propertyTypes.map((type) => (
                  <li key={type.href}>
                    <Link
                      href={type.href}
                      className="text-sm text-gray-400 transition-colors hover:text-brand-400"
                    >
                      {type.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Stay updated with the latest listings and market insights
              delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3"
            >
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Homestead. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">
              Privacy Policy
            </span>
            <span className="text-sm text-gray-500">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
