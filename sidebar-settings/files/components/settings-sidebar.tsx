"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Receipt,
  FileText,
  Palette,
  Globe,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------*/

interface SectionLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SectionGroup {
  title: string;
  links: SectionLink[];
}

/* ------------------------------------------------------------------
 * Section configuration
 * Edit this array to add, remove, or reorder settings sections.
 * ----------------------------------------------------------------*/

const sectionGroups: SectionGroup[] = [
  {
    title: "Account",
    links: [
      { label: "Profile", href: "/settings/profile", icon: User },
      { label: "Security", href: "/settings/security", icon: Shield },
      { label: "Notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
  {
    title: "Billing",
    links: [
      { label: "Plans", href: "/settings/plans", icon: CreditCard },
      { label: "Payment", href: "/settings/payment", icon: KeyRound },
      { label: "Invoices", href: "/settings/invoices", icon: Receipt },
    ],
  },
  {
    title: "Preferences",
    links: [
      { label: "Appearance", href: "/settings/appearance", icon: Palette },
      { label: "Language", href: "/settings/language", icon: Globe },
      { label: "Policies", href: "/settings/policies", icon: FileText },
    ],
  },
];

/* ------------------------------------------------------------------
 * SettingsSidebar
 * ----------------------------------------------------------------*/

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 shrink-0" aria-label="Settings navigation">
      <div className="sticky top-0 space-y-6 py-6">
        {sectionGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {groupIndex > 0 && <Separator className="mb-6" />}
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </h3>
            <ul className="space-y-0.5">
              {group.links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
