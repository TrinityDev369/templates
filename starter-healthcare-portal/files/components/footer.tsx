import Link from "next/link";
import { Heart, Phone, Mail, MapPin, Clock } from "lucide-react";

const aboutLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Mission", href: "/about#mission" },
  { label: "Careers", href: "/careers" },
  { label: "News & Updates", href: "/news" },
];

const serviceLinks = [
  { label: "Primary Care", href: "/services/primary-care" },
  { label: "Cardiology", href: "/services/cardiology" },
  { label: "Pediatrics", href: "/services/pediatrics" },
  { label: "Dermatology", href: "/services/dermatology" },
  { label: "Neurology", href: "/services/neurology" },
];

const resourceLinks = [
  { label: "Patient Portal", href: "/portal" },
  { label: "Medical Records", href: "/records" },
  { label: "Insurance & Billing", href: "/billing" },
  { label: "FAQs", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900">
                MediCare Plus
              </h2>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              Providing compassionate, comprehensive healthcare to our community
              since 2010. Your health is our priority.
            </p>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Services
            </h3>
            <ul className="mt-4 space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Patient Resources
            </h3>
            <ul className="mt-4 space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span>123 Health Boulevard, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <span>(212) 555-0100</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span>contact@medicareplus.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span>Mon - Fri: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>

            {/* Emergency callout */}
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                Emergency
              </p>
              <a
                href="tel:911"
                className="mt-1 block text-lg font-bold text-red-600 transition-colors hover:text-red-700"
              >
                Call 911
              </a>
              <p className="mt-0.5 text-xs text-red-500">
                For life-threatening emergencies
              </p>
              <a
                href="tel:2125550199"
                className="mt-2 block text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
              >
                24/7 Nurse Line: (212) 555-0199
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MediCare Plus. All rights
            reserved. This website does not provide medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
