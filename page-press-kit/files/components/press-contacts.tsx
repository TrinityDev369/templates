import { Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CompanyFact {
  label: string;
  value: string;
}

export interface PressContact {
  name: string;
  role: string;
  email: string;
  /** Optional photo URL. Falls back to initials avatar. */
  photoUrl?: string;
}

/* ------------------------------------------------------------------ */
/* Company Facts Section                                               */
/* ------------------------------------------------------------------ */

interface CompanyFactsProps {
  facts: CompanyFact[];
}

export function CompanyFacts({ facts }: CompanyFactsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Company Facts
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Key information about our company at a glance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {fact.value}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {fact.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Press Contact Card                                                  */
/* ------------------------------------------------------------------ */

interface PressContactsProps {
  contacts: PressContact[];
}

/** Extracts up to two initials from a full name. */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PressContacts({ contacts }: PressContactsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Press Contacts
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        For media inquiries, interviews, and press-related questions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <div
            key={contact.email}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
          >
            {/* Avatar */}
            {contact.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={contact.photoUrl}
                alt={contact.name}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <span className="text-sm font-semibold">
                  {getInitials(contact.name)}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {contact.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {contact.role}
              </p>
              <a
                href={`mailto:${contact.email}`}
                className={cn(
                  "mt-2 inline-flex items-center gap-1.5 text-xs font-medium",
                  "text-blue-600 hover:text-blue-700 transition-colors",
                  "dark:text-blue-400 dark:hover:text-blue-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded"
                )}
              >
                <Mail className="h-3.5 w-3.5" />
                {contact.email}
              </a>
            </div>

            {/* External link */}
            <a
              href={`mailto:${contact.email}`}
              className={cn(
                "flex-shrink-0 mt-0.5 p-1 rounded text-gray-400 hover:text-gray-600 transition-colors",
                "dark:text-gray-500 dark:hover:text-gray-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              )}
              aria-label={`Email ${contact.name}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
