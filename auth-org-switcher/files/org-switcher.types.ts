/**
 * Type definitions for the OrgSwitcher component.
 *
 * Kept in a separate file so consumers can import types without pulling
 * in React / component code.
 */

/** Represents a single organization the user belongs to. */
export interface Organization {
  /** Unique organization identifier. */
  id: string;

  /** Display name of the organization. */
  name: string;

  /** URL-friendly slug for the organization. */
  slug: string;

  /** Optional avatar/logo URL for the organization. */
  avatarUrl?: string;

  /** The subscription plan of the organization. */
  plan?: "free" | "pro" | "enterprise";

  /** Number of members in the organization. */
  memberCount?: number;

  /** The current user's role within this organization. */
  role?: "owner" | "admin" | "member";
}

/** Props accepted by the `OrgSwitcher` component. */
export interface OrgSwitcherProps {
  /** List of organizations the user belongs to. */
  organizations: Organization[];

  /** Currently selected organization ID. */
  currentOrgId: string;

  /** Called when user selects a different organization. */
  onOrgChange: (orgId: string) => void;

  /** Called when user clicks "Create Organization". */
  onCreateOrg?: () => void;

  /** Show the plan badge next to org name. Defaults to `true`. */
  showPlan?: boolean;

  /** Custom trigger className for additional styling. */
  className?: string;
}
